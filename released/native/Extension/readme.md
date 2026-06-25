# LayaNative 扩展插件开发

LayaNative 扩展插件用于把原生能力封装成 JavaScript 可以调用的接口。插件可以直接使用 JSVM API 注册函数、类和属性，也可以通过 LayaNative 提供的 `LayaExtensionInterface` 访问运行时环境、日志和跨线程回调能力。

扩展插件适合以下场景：

- 接入平台 SDK，例如登录、支付、广告、分享、统计等。
- 接入项目自定义 C/C++ 能力，例如加密、压缩、算法库、设备能力封装等。
- 在原生线程完成耗时任务，再把结果投递回 JS 线程。
- 封装需要复用的原生模块，避免在业务脚本中直接处理平台差异。

不同平台的插件形态不同。Windows、Android、Linux、鸿蒙平台以动态库为主，iOS 平台受系统限制，通常以静态库或直接编入工程的方式接入。

## 一、通用开发流程

### 1.1 插件入口

插件需要包含 `extension/LayaExtension.h`，并导出扩展入口。运行时加载插件后，会调用入口函数，插件在入口函数中填写名称、版本和生命周期回调。

```cpp
#include <extension/LayaExtension.h>

static int on_event(LayaExtEventType event,
                    const LayaExtensionInterface* iface,
                    void* user_data) {
    if (event == LAYA_EXT_EVENT_INIT) {
        jsvm_env env = iface->get_env();
        jsvm_value exports = iface->get_exports();
        // 在 exports 上注册 JS 可调用的函数或类
    }
    return 0;
}

static int ext_init(const LayaExtensionInterface* engine,
                    LayaExtensionInitInfo* info) {
    info->api_version = LAYA_EXTENSION_API_VERSION;
    info->name = "my_extension";
    info->version = "1.0.0";
    info->on_event = on_event;
    info->user_data = nullptr;
    return 0;
}

LAYA_EXTENSION_ENTRY(ext_init)
LAYA_EXTENSION_ENTRY_NAMED(my_extension, ext_init)
```

`LAYA_EXTENSION_ENTRY` 导出通用入口 `laya_extension_init`。`LAYA_EXTENSION_ENTRY_NAMED` 导出带插件名的入口，主要用于 iOS 静态链接场景，也建议保留，便于跨平台使用同一份插件代码。

### 1.2 注册 JS 函数

在 `LAYA_EXT_EVENT_INIT` 中获取 `jsvm_env` 和 `exports`，然后把原生函数注册到 `exports` 对象上。

```cpp
static jsvm_value nativeAdd(jsvm_env env, jsvm_callback_info info) {
    size_t argc = 2;
    jsvm_value argv[2];
    jsvm_get_cb_info(env, info, &argc, argv, nullptr, nullptr);

    int32_t a = 0;
    int32_t b = 0;
    if (argc >= 2) {
        jsvm_get_value_int32(env, argv[0], &a);
        jsvm_get_value_int32(env, argv[1], &b);
    }

    jsvm_value result;
    jsvm_create_int32(env, a + b, &result);
    return result;
}

static void registerFunc(jsvm_env env,
                         jsvm_value exports,
                         const char* name,
                         jsvm_callback cb) {
    jsvm_value fn;
    jsvm_create_function(env, name, JSVM_AUTO_LENGTH, cb, nullptr, &fn);
    jsvm_set_named_property(env, exports, name, fn);
}

static int on_event(LayaExtEventType event,
                    const LayaExtensionInterface* iface,
                    void* user_data) {
    if (event == LAYA_EXT_EVENT_INIT) {
        jsvm_env env = iface->get_env();
        jsvm_value exports = iface->get_exports();
        registerFunc(env, exports, "nativeAdd", nativeAdd);
    }
    return 0;
}
```

JS 侧通过插件名访问：

```ts
declare const my_extension: {
    nativeAdd(a: number, b: number): number;
};

console.log(my_extension.nativeAdd(10, 20));
```

### 1.3 插件描述文件

插件需要配套 `.layaext.json` 描述文件，运行时根据描述文件找到不同平台的库文件。

```json
{
    "extension": {
        "name": "my_extension",
        "version": "1.0.0",
        "api_version": 1,
        "description": "LayaNative extension sample"
    },
    "libraries": {
        "windows.x86_64": "my_extension.dll",
        "android.arm64-v8a": "libmy_extension.so",
        "linux.x86_64": "my_extension.so",
        "ohos.arm64-v8a": "libmy_extension.so"
    },
    "dependencies": []
}
```

`extension.name` 必须和插件入口中填写的 `info->name` 保持一致。iOS 静态链接时，运行时会根据插件名查找 `laya_extension_init_<插件名>` 入口，因此插件名也需要和 `LAYA_EXTENSION_ENTRY_NAMED` 中的名称一致。

## 二、Windows 插件开发

Windows 插件通常编译为 `.dll`。旧版 Windows 扩展文档中使用 `LayaExtInit(jsvm_env env, jsvm_value exp)` 导出函数；新版扩展系统建议使用 `LayaExtension.h`、`LayaExtensionInterface` 和 `.layaext.json`，这样可以和 Android、iOS、鸿蒙、Linux 共享大部分插件代码。

### 2.1 创建工程

可以参考发布工程中的示例目录：

```text
publish/windows/extension/
  extension.vcxproj
  main.cpp
  my_extension.layaext.json
```

工程需要包含以下头文件目录：

```text
conch/include
modules/extension/include
modules/jsvm/include
modules/interfaces/include
modules/filesystem/include
modules/utils/include
```

插件源码中包含：

```cpp
#include <extension/LayaExtension.h>
```

并使用 `LAYA_EXTENSION_ENTRY(ext_init)` 导出入口。

### 2.2 编译 DLL

使用 Visual Studio 打开工程，选择 `x64` 与发布配置，生成 `my_extension.dll`。生成后需要把 DLL 和描述文件放到运行时可加载的位置，描述文件示例：

```json
{
    "extension": {
        "name": "my_extension",
        "version": "1.0.0",
        "api_version": 1,
        "description": "LayaNative Windows extension sample"
    },
    "libraries": {
        "windows.x86_64": "my_extension.dll"
    },
    "dependencies": []
}
```

### 2.3 JS 调用

插件加载成功后，运行时会把 `exports` 挂到全局对象 `my_extension` 上：

```ts
declare const my_extension: {
    nativeAdd(a: number, b: number): number;
    nativeStr(value: string): string;
};

console.log(my_extension.nativeAdd(1, 2));
console.log(my_extension.nativeStr("LayaNative"));
```

如果项目仍使用旧的 DLL 扩展方式，也可以参考旧文档中的 `Laya.importNative("LayaExt.dll")`。新项目建议优先使用 `.layaext.json` 和 `LayaExtension.h` 的方式。

## 三、Android 插件开发

Android 插件通常编译为 `.so`，并随 Android Studio 工程一起打包。

### 3.1 工程位置

可以参考发布工程中的示例目录：

```text
publish/android_studio/extension/
  build.gradle
  src/main/AndroidManifest.xml
  src/main/cpp/CMakeLists.txt
  src/main/cpp/main.cpp
```

插件 CMake 工程会编译 `my_extension` 动态库，并链接对应 ABI 的 `libconch.so`。

### 3.2 CMake 配置

关键配置如下：

```cmake
add_library(my_extension SHARED main.cpp)

target_include_directories(my_extension PRIVATE
    "${REPO_ROOT}/conch/include"
    "${REPO_ROOT}/modules/extension/include"
    "${REPO_ROOT}/modules/jsvm/include"
    "${REPO_ROOT}/modules/interfaces/include"
    "${REPO_ROOT}/modules/filesystem/include"
    "${REPO_ROOT}/modules/utils/include"
)

target_compile_definitions(my_extension PRIVATE
    JS_V8=1
    USING_CONCH_SHARED=1
)

target_link_libraries(my_extension PRIVATE
    "${CONCH_LIB}"
    android
    log
)
```

实际项目中需要保证插件 ABI 和应用 ABI 一致，例如 `arm64-v8a`。如果使用了多个 ABI，每个 ABI 都需要产出对应的 `libmy_extension.so`。

### 3.3 描述文件与打包

Android 描述文件可以放在应用 assets 中，例如：

```text
publish/android_studio/app/src/main/assets/my_extension.layaext.json
```

描述文件中配置 Android 库：

```json
{
    "extension": {
        "name": "my_extension",
        "version": "1.0.0",
        "api_version": 1
    },
    "libraries": {
        "android.arm64-v8a": "libmy_extension.so"
    },
    "dependencies": []
}
```

编译 Android 工程后，插件 `.so` 会随 APK 或 AAB 一起打包。JS 侧仍通过全局插件名调用：

```ts
console.log(my_extension.nativeAdd(10, 11));
```

如果插件只是接入 Java/Kotlin SDK，也可以在 `app/src/main/java/demo/HandleMessageUtils.java` 中处理 JS 消息，再由 Java/Kotlin 调用 SDK。JS 侧使用 `conch.postSyncMessage` 或 `conch.postAsyncMessage` 和原生层通信。

## 四、iOS 插件开发

iOS 对运行时加载动态库有限制，插件通常以静态库或源码方式编入 Xcode 工程。插件代码仍然建议使用 `LayaExtension.h` 的通用入口，但必须保留命名入口。

### 4.1 工程位置

可以参考发布工程中的示例目录：

```text
publish/ios/extension/
  main.cpp
  my_extension.layaext.json
```

插件源码和其他 C/C++/Objective-C++ 文件一起加入 Xcode 工程或构建脚本，最终链接进应用。

### 4.2 入口要求

iOS 静态链接场景需要命名入口：

```cpp
LAYA_EXTENSION_ENTRY(ext_init)
LAYA_EXTENSION_ENTRY_NAMED(my_extension, ext_init)
```

`my_extension` 必须和描述文件中的 `extension.name` 一致。构建时需要防止入口符号被链接器裁剪，`LAYA_EXTENSION_ENTRY_NAMED` 已经包含 `used` 标记，实际工程还要确认静态库被链接进最终应用。

### 4.3 接入系统 SDK

如果插件需要调用 Objective-C 或 Swift SDK，建议把跨平台 C++ 逻辑放在 `main.cpp`，平台实现放在 `.mm` 文件中。例如：

```objc
// MySdkBridge.mm
NSString* MySdkGetDeviceName() {
    return [[UIDevice currentDevice] name];
}
```

再在插件 C++ 回调中把结果转换为 JS 字符串返回。需要主动执行 JS 时，可以在 iOS 原生侧调用：

```objc
[[conchRuntime GetIOSConchRuntime] runJS:@"console.log('from iOS')"];
```

如果只是简单的 JS 与 iOS 通信，也可以在 `LayaBox/HandleMessageUtils.mm` 中处理：

```objc
+(NSString*)handleSyncMessageWithEventName:(NSString*)eventName data:(NSString*)data {
    if ([eventName isEqualToString:@"getDeviceName"]) {
        return [[UIDevice currentDevice] name];
    }
    return @"";
}
```

## 五、鸿蒙插件开发

鸿蒙插件通常编译为 `.so`，并集成在 DevEco Studio 工程中。C++ 插件通过 NAPI 工程和 LayaNative 运行时一起构建。

### 5.1 工程位置

可以参考发布工程中的示例目录：

```text
publish/ohos/entry/src/main/cpp/extension/
  CMakeLists.txt
  main.cpp
publish/ohos/entry/src/main/resources/rawfile/
  my_extension.layaext.json
```

### 5.2 CMake 配置

鸿蒙插件需要包含 LayaNative 的扩展、JSVM、接口和工具头文件，并链接 `conch`：

```cmake
add_library(my_extension SHARED
    main.cpp
)

target_include_directories(my_extension PRIVATE
    ${NATIVER_RENDER_ROOT_PATH}/conch/include
    ${NATIVER_RENDER_ROOT_PATH}/modules/extension/include
    ${NATIVER_RENDER_ROOT_PATH}/modules/jsvm/include
    ${NATIVER_RENDER_ROOT_PATH}/modules/interfaces/include
    ${NATIVER_RENDER_ROOT_PATH}/modules/filesystem/include
    ${NATIVER_RENDER_ROOT_PATH}/modules/utils/include
)

target_compile_definitions(my_extension PRIVATE
    OS_OHOS=1
    JS_OHOS_JSVM=1
    USING_CONCH_SHARED=1
)

target_link_libraries(my_extension PRIVATE conch)
```

描述文件放入 `resources/rawfile`，并配置对应的鸿蒙 ABI：

```json
{
    "extension": {
        "name": "my_extension",
        "version": "1.0.0",
        "api_version": 1
    },
    "libraries": {
        "ohos.arm64-v8a": "libmy_extension.so"
    },
    "dependencies": []
}
```

### 5.3 ArkTS 与 JS 通信

如果插件能力主要在 ArkTS 层，可以在 `libSysCapabilities/src/main/ets/event/HandleMessageUtils.ets` 中处理 JS 消息：

```ts
static handleSyncMessage(eventName: string, data: string): string {
    if (eventName == "getChannel") {
        return "ohos";
    }
    return "";
}

static async handleAsyncMessage(eventName: string, data: string, cb: Function): Promise<void> {
    if (eventName == "login") {
        cb("login result");
    }
}
```

JS 侧调用：

```ts
const channel = conch.postSyncMessage("getChannel", "");
conch.postAsyncMessage("login", "{}").then((result: string) => {
    console.log(result);
});
```

需要从鸿蒙原生侧主动执行 JS 时，可以调用 `laya.ConchNAPI_RunJS`。

## 六、Linux 插件开发

Linux 插件通常编译为 `.so`，并和 Linux 运行时一起发布。

### 6.1 工程位置

可以参考发布工程中的示例目录：

```text
publish/linux/extension/
  CMakeLists.txt
  main.cpp
publish/linux/resource/
  my_extension.layaext.json
```

### 6.2 CMake 配置

Linux 插件需要生成无 `lib` 前缀的 `my_extension.so`，并链接 `conch`：

```cmake
add_library(my_extension SHARED
    main.cpp
)

target_include_directories(my_extension PRIVATE
    ${CONCH_INCLUDES}
    ${LAYANATIVE_ROOT}/conch/include
    ${LAYANATIVE_ROOT}/modules/extension/include
    ${LAYANATIVE_ROOT}/modules/jsvm/include
    ${LAYANATIVE_ROOT}/modules/interfaces/include
    ${LAYANATIVE_ROOT}/modules/filesystem/include
    ${LAYANATIVE_ROOT}/modules/utils/include
)

target_compile_definitions(my_extension PRIVATE
    JS_V8=1
    USING_CONCH_SHARED=1
)

set_target_properties(my_extension PROPERTIES
    PREFIX ""
    OUTPUT_NAME "my_extension"
    INSTALL_RPATH "$ORIGIN"
)

target_link_libraries(my_extension PRIVATE conch)
```

描述文件示例：

```json
{
    "extension": {
        "name": "my_extension",
        "version": "1.0.0",
        "api_version": 1
    },
    "libraries": {
        "linux.x86_64": "my_extension.so"
    },
    "dependencies": []
}
```

### 6.3 JS 与 Linux 原生通信

插件加载后，JS 侧和其他平台一样通过 `my_extension` 全局对象访问。如果只是要在 Linux 主工程里处理 JS 消息，也可以在 `publish/linux/src/main.cpp` 中设置消息回调：

```cpp
conchSetHandleMessageCallback(
    [](const char* eventName, const char* data) -> void {
        if (strcmp(eventName, "syncMessage") == 0) {
            conchSendHandleMessageResult(eventName, "sync message from linux");
        }
    },
    [](const char* eventName, const char* data) -> void {
        if (strcmp(eventName, "asyncMessage") == 0) {
            conchSendHandleMessageResult(eventName, "async message from linux");
        }
    });
```

## 七、调试与注意事项

- 插件名、描述文件中的 `extension.name`、iOS 命名入口中的名称要保持一致。
- 插件导出的库文件名要和 `.layaext.json` 中 `libraries` 的值一致。
- Android、鸿蒙需要确认 ABI 匹配；Windows、Linux 需要确认 64 位运行时和插件一致。
- JSVM 对象只能在 JS 线程安全使用。其他线程需要通过 `LayaExtensionInterface::post_to_js` 投递回 JS 线程。
- 插件中创建的原生对象需要使用 `jsvm_wrap` 或其他生命周期管理方式释放，避免内存泄漏。
- 接入第三方 SDK 时，优先在插件内部封装平台差异，让 JS 侧保持统一接口。
- 如果只需要简单的平台能力调用，可以优先使用 `conch.postSyncMessage`、`conch.postAsyncMessage` 和各平台的 `HandleMessageUtils`；如果需要注册大量函数、类或复用 C/C++ 能力，再使用扩展插件。
