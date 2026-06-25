# LayaNative 扩展插件开发

LayaNative 扩展插件用于把原生能力封装成 JavaScript 可以调用的接口。插件可以直接使用 JSVM API 注册函数、类和属性，也可以通过 LayaNative 提供的 `LayaExtensionInterface` 访问运行时环境、日志和跨线程回调能力。

扩展插件适合以下场景：

- 接入平台 SDK，例如登录、支付、广告、分享、统计等。
- 接入项目自定义 C/C++ 能力，例如加密、压缩、算法库、设备能力封装等。
- 在原生线程完成耗时任务，再把结果投递回 JS 线程。
- 封装需要复用的原生模块，避免在业务脚本中直接处理平台差异。

不同平台的插件形态不同。Windows、Android、Linux、鸿蒙平台以动态库为主，iOS 平台受系统限制，通常以静态库或直接编入工程的方式接入。

## 一、通用开发流程

### 1.1 开启扩展加载

扩展插件默认不自动加载。开发或调试扩展插件前，需要先打开发布工程中对应平台的配置文件：

```text
Windows: windows/resource/config.ini
Android: android_studio/app/src/main/assets/config.ini
iOS:     ios/resource/config.ini
Linux:   linux/resource/config.ini
鸿蒙:    ohos/entry/src/main/resources/rawfile/config.ini
```

在 `[common]` 配置段中找到 `LoadExtension`，把默认关闭改为开启：

```ini
LoadExtension=true #comment true|false
```

如果配置仍为 `LoadExtension=false #comment true|false`，运行时不会加载 `.layaext.json` 描述文件，也不会加载对应平台的插件库，JS 侧无法访问插件导出的全局对象。

### 1.2 插件入口

各平台发布工程中的插件示例入口文件位置如下：

```text
Windows: windows/extension/main.cpp
Android: android_studio/extension/src/main/cpp/main.cpp
iOS:     ios/extension/main.cpp
Linux:   linux/extension/main.cpp
鸿蒙:    ohos/entry/src/main/cpp/extension/main.cpp
```

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

### 1.3 注册 JS 函数

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

### 1.4 插件描述文件

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

### 1.5 自动编译与复制

各平台发布工程已经集成了示例插件工程。正常使用发布工程构建时，会自动编译插件库，并把插件库和 `.layaext.json` 描述文件复制到该平台运行时约定的加载位置，不需要开发者手动拷贝产物。

> 注意：目前扩展插件只支持通过导出的 Native 工程进行构建。

开发者通常只需要修改对应平台 `extension` 目录下的插件源码和描述文件，然后重新构建发布工程即可。只有新增插件、修改插件库名称、修改 ABI 或调整工程结构时，才需要同步更新工程配置和 `.layaext.json` 中的 `libraries` 字段。

### 1.6 在 LayaAir-IDE 中使用

扩展插件属于 LayaNative 运行时能力，需要通过对应平台的 Native 预览或发布工程运行。IDE 中的 Web 预览不会加载原生插件。

在 IDE 项目脚本中，可以按插件描述文件里的 `extension.name` 声明全局对象，然后直接调用插件导出的函数。例如插件名为 `my_extension`：

```ts
declare const my_extension: {
    nativeAdd(a: number, b: number): number;
    nativeStr(value: string): string;
};

console.log(my_extension.nativeAdd(10, 11));
console.log(my_extension.nativeStr("LayaNative"));
```

发布或预览 Native 工程前，需要确认对应平台 `config.ini` 中已经开启 `LoadExtension`，并且插件源码、插件描述文件和库文件名称与发布工程中的配置保持一致。

## 二、Windows 插件开发

Windows 插件通常编译为 `.dll`。扩展系统使用 `LayaExtension.h`、`LayaExtensionInterface` 和 `.layaext.json`，可以和 Android、iOS、鸿蒙、Linux 共享大部分插件代码。

### 2.1 工程位置

可以参考发布工程中的示例目录：

```text
windows/extension/
  extension.vcxproj
  main.cpp
  my_extension.layaext.json
```

### 2.2 编译 DLL

使用 Visual Studio 打开 `LayaBox.slnx` 或发布工程，选择 `x64` 与发布配置进行构建。Windows 发布工程已经把 `extension/extension.vcxproj` 作为构建依赖，构建时会自动生成 `my_extension.dll`，并把 DLL 和描述文件复制到运行时可加载的位置。

描述文件示例：

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

## 三、Android 插件开发

Android 插件通常编译为 `.so`，并随 Android Studio 工程一起打包。

### 3.1 工程位置

可以参考发布工程中的示例目录：

```text
android_studio/extension/
  build.gradle
  src/main/AndroidManifest.xml
  src/main/cpp/CMakeLists.txt
  src/main/cpp/main.cpp
```

插件 CMake 工程会编译 `my_extension` 动态库，并链接对应 ABI 的 `libconch.so`。

实际项目中需要保证插件 ABI 和应用 ABI 一致，例如 `arm64-v8a`。如果使用了多个 ABI，每个 ABI 都需要产出对应的 `libmy_extension.so`。

### 3.2 描述文件与打包

Android 描述文件可以放在应用 assets 中，例如：

```text
android_studio/app/src/main/assets/my_extension.layaext.json
```

描述文件中配置 Android 库：

```json
{
    "extension": {
        "name": "my_extension",
        "version": "1.0.0",
        "api_version": 1,
        "description": "LayaNative Android extension sample"
    },
    "libraries": {
        "android.arm64-v8a": "libmy_extension.so",
        "android.armeabi-v7a": "libmy_extension.so",
        "android.x86": "libmy_extension.so",
        "android.x86_64": "libmy_extension.so"
    },
    "dependencies": []
}
```

编译 Android 工程时，`app` 工程会自动依赖并编译 `:extension` 模块，生成对应 ABI 的 `libmy_extension.so`，并随 APK 或 AAB 一起打包。

## 四、iOS 插件开发

iOS 对运行时加载动态库有限制，插件通常以静态库或源码方式编入 Xcode 工程。插件代码仍然建议使用 `LayaExtension.h` 的通用入口，但必须保留命名入口。

### 4.1 工程位置

可以参考发布工程中的示例目录：

```text
ios/extension/
  main.cpp
  my_extension.layaext.json
```

插件源码和其他 C/C++/Objective-C++ 文件一起加入 Xcode 工程或构建脚本。发布工程构建 iOS 时会自动参与编译和链接，最终把插件入口编入应用；开发者不需要手动把插件产物复制到应用包内。

### 4.2 入口要求

iOS 静态链接场景需要命名入口：

```cpp
LAYA_EXTENSION_ENTRY(ext_init)
LAYA_EXTENSION_ENTRY_NAMED(my_extension, ext_init)
```

`my_extension` 必须和描述文件中的 `extension.name` 一致。构建时需要防止入口符号被链接器裁剪，`LAYA_EXTENSION_ENTRY_NAMED` 已经包含 `used` 标记，实际工程还要确认静态库被链接进最终应用。

### 4.3 描述文件

iOS 描述文件位于：

```text
ios/extension/my_extension.layaext.json
```

描述文件中配置 iOS 静态库：

```json
{
    "extension": {
        "name": "my_extension",
        "version": "1.0.0",
        "api_version": 1,
        "description": "LayaNative iOS extension sample"
    },
    "libraries": {
        "ios.arm64": "libmy_extension.a"
    },
    "dependencies": []
}
```

### 4.4 接入系统 SDK

如果插件需要调用 Objective-C 或 Swift SDK，建议把跨平台 C++ 逻辑放在 `main.cpp`，平台实现放在 `.mm` 文件中。例如：

```objc
// MySdkBridge.mm
NSString* MySdkGetDeviceName() {
    return [[UIDevice currentDevice] name];
}
```

再在插件 C++ 回调中把结果转换为 JS 字符串返回。

## 五、鸿蒙插件开发

鸿蒙插件通常编译为 `.so`，并集成在 DevEco Studio 工程中。C++ 插件通过 NAPI 工程和 LayaNative 运行时一起构建。

### 5.1 工程位置

可以参考发布工程中的示例目录：

```text
ohos/entry/src/main/cpp/extension/
  CMakeLists.txt
  main.cpp
ohos/entry/src/main/resources/rawfile/
  my_extension.layaext.json
```

描述文件放入 `resources/rawfile`，并配置对应的鸿蒙 ABI。构建鸿蒙发布工程时，插件 CMake 目标会自动编译 `libmy_extension.so`，并输出到工程约定的 `third_party/conch/lib/${OHOS_ARCH}` 目录，随应用一起打包：

```json
{
    "extension": {
        "name": "my_extension",
        "version": "1.0.0",
        "api_version": 1,
        "description": "LayaNative OHOS extension sample"
    },
    "libraries": {
        "ohos.arm64-v8a": "libmy_extension.so",
        "ohos.x86_64": "libmy_extension.so"
    },
    "dependencies": []
}

```

## 六、Linux 插件开发

Linux 插件通常编译为 `.so`，并和 Linux 运行时一起发布。

### 6.1 工程位置

可以参考发布工程中的示例目录：

```text
linux/extension/
  CMakeLists.txt
  main.cpp
linux/resource/
  my_extension.layaext.json
```

构建 Linux 发布工程时，插件 CMake 目标会自动生成 `my_extension.so`，并通过安装/打包流程复制到运行目录；描述文件放在 `resource` 目录中。描述文件示例：

```json
{
    "extension": {
        "name": "my_extension",
        "version": "1.0.0",
        "api_version": 1,
        "description": "LayaNative Linux extension sample"
    },
    "libraries": {
        "linux.x86_64": "my_extension.so"
    },
    "dependencies": []
}
```

## 七、调试与注意事项

- 插件名、描述文件中的 `extension.name`、iOS 命名入口中的名称要保持一致。
- 插件导出的库文件名要和 `.layaext.json` 中 `libraries` 的值一致。
- Android、鸿蒙需要确认 ABI 匹配；Windows、Linux 需要确认 64 位运行时和插件一致。
- JSVM 对象只能在 JS 线程安全使用。其他线程需要通过 `LayaExtensionInterface::post_to_js` 投递回 JS 线程。
- 插件中创建的原生对象需要使用 `jsvm_wrap` 或其他生命周期管理方式释放，避免内存泄漏。
- 接入第三方 SDK 时，优先在插件内部封装平台差异，让 JS 侧保持统一接口。
- 如果只需要简单的平台能力调用，可以优先使用 `conch.postSyncMessage`、`conch.postAsyncMessage` 和各平台的 `HandleMessageUtils`；如果需要注册大量函数、类或复用 C/C++ 能力，再使用扩展插件。
