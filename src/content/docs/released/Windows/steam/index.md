---
title: "LayaSteam 插件实例（Windows）"
description: "LayaNative 3.4.1 起提供面向 Windows、Android、iOS、Linux 与鸿蒙的跨平台 Extension 机制；本文以 Windows 版 LayaSteam 为例，说明 Steamworks 封装、插件发布及 Overlay 与排行榜验证流程。"
slug: "released/windows/steam"
---

## 一、示例范围与插件平台

从 LayaAir 3.4.1 开始，LayaNative 提供[跨平台扩展插件机制](/released/native/extension/)。插件通过统一的 Extension API 注册 JSVM 接口，平台工程负责生成并装载对应形态的原生库。

| 目标平台 | 常见插件形态 |
| --- | --- |
| Windows | `.dll` 动态库 |
| Android | 按 ABI 编译的 `.so` 动态库 |
| iOS | 静态库或编入 Xcode 工程的源码 |
| Linux | `.so` 动态库 |
| 鸿蒙 | 按 ABI 编译的 `.so` 动态库 |

:::note[本例的范围]
LayaNative Extension 不是 Windows 专用。本例只交付和验证 Windows 版 `LayaSteam`，因此使用 Steamworks SDK 的 Win64 库、Windows DLL 和桌面 Steam 客户端。其他平台需要换用 Steamworks 对应平台的库、编译配置和打包方式。
:::

本例只保留 Steam 初始化、用户信息、Overlay、Rich Presence 和排行榜：

- `steam_native.dll`：实现 LayaNative Extension，并导出 `laya_extension_init`。
- `laya_steam.layaext.json`：声明扩展名称、API 版本和 Windows 库路径。
- `steam_api64.dll`：Steamworks SDK 的 64 位可再发行运行库。
- `globalThis.laya_steam`：TypeScript 使用的扩展对象。
- `SteamAPI_RunCallbacks()`：每帧驱动 Overlay、排行榜等异步回调。

:::caution[隐私与发布配置]
本文中的 AppID、账号名和 SteamID 均为占位符或脱敏内容。Steam Web API Key、发布账号、邮箱和认证信息不得写入项目、日志或截图；本地测试用 `steam_appid.txt` 也不要提交或上传到 Depot。
:::

## 二、准备环境

1. 阅读 [LayaNative 扩展插件开发](/released/native/extension/)，了解 manifest、入口宏、平台库形态与线程规则。
2. 在 [Steamworks](https://partner.steamgames.com/) 创建应用，并取得自己的 AppID。
3. 从 Steamworks 后台下载 [Steamworks SDK](https://partner.steamgames.com/downloads/steamworks_sdk.zip)。完整 SDK 受 Steamworks 许可约束，不要提交到示例项目。
4. 安装 Visual Studio 的 C++ 桌面开发组件，并准备支持新 Extension API 的 LayaNative 3.4.1 Windows SDK 与客户端。
5. 测试时启动桌面 Steam，并登录具有该应用许可的账号。

本文示例只编译 `Release|x64`；这是示例实现范围，不是 LayaNative Extension 的平台限制。

## 三、项目结构与发布约定

TypeScript、C++ 源码和 Windows 发布模板都放在 LayaPro 项目内：

```text
LayaSteamProject/
├─ build-templates/windows/release/
│  ├─ config.ini
│  ├─ laya_steam.layaext.json
│  ├─ steam_native.dll
│  └─ steam_api64.dll
├─ native/LayaSteam/
│  ├─ LayaSteam.vcxproj
│  ├─ SteamBinding.cpp
│  ├─ SteamBridge.cpp
│  └─ SteamBridge.h
├─ src/plugins/layasteam/LayaSteam.ts
├─ src/Main.ts
└─ settings/BuildSettings.json
```

LayaPro 发布 Windows 时会把 `build-templates/windows` 合并到发布目标，所以 `release/` 子目录中的 manifest 和 DLL 最终与 exe 同目录。新 Extension API 不需要把 DLL 作为 Laya 资产导入，也不再使用 `assets/plugins`、DLL `.meta`、`release/extensions/` 或 `$DLL_PATHS`。

`config.ini` 必须开启扩展加载：

```ini
[common]
GraphicsAPI=WebGL
LoadExtension=true

[Render]
VSync=true
```

manifest 使用扩展名 `.layaext.json`：

```json
{
  "extension": {
    "name": "laya_steam",
    "version": "1.0.0",
    "api_version": 1,
    "description": "LayaSteam Windows extension sample"
  },
  "libraries": {
    "windows.x86_64": "steam_native.dll"
  },
  "dependencies": []
}
```

运行时扫描 manifest，按当前平台加载库，再把扩展对象挂到 `globalThis[extension.name]`，因此本例的 TypeScript 对象名为 `globalThis.laya_steam`。

## 四、编写 Windows Native 插件

### 4.1 初始化 Steam 并驱动回调

```cpp
#include <steam/steam_api.h>

bool SteamBridge::restart(uint32_t appId) {
    return SteamAPI_RestartAppIfNecessary(appId);
}

bool SteamBridge::init() {
    SteamErrMsg message{};
    if (SteamAPI_InitEx(&message) != k_ESteamAPIInitResult_OK)
        return false;

    if (!SteamUser() || !SteamFriends() || !SteamUtils() || !SteamUserStats()) {
        SteamAPI_Shutdown();
        return false;
    }
    initialized_ = true;
    return true;
}

void SteamBridge::update() {
    if (initialized_) SteamAPI_RunCallbacks();
}

void SteamBridge::shutdown() {
    if (initialized_) SteamAPI_Shutdown();
    initialized_ = false;
}
```

Overlay 不要做成只能调用一次的状态。每次点击都直接调用 Steam API：

```cpp
bool SteamBridge::openOverlay(const std::string& dialog) {
    if (!initialized_ || !SteamUtils()->IsOverlayEnabled()) return false;
    SteamFriends()->ActivateGameOverlay(dialog.c_str());
    return true;
}
```

排行榜接口是异步的。`FindOrCreateLeaderboard`、`UploadLeaderboardScore` 和 `DownloadLeaderboardEntries` 返回后，通过 `CCallResult` 接收结果；TypeScript 每帧调用 `update()` 才会触发回调。

### 4.2 注册 Extension 入口

插件包含 `<extension/LayaExtension.h>`，在 `LAYA_EXT_EVENT_INIT` 中把函数注册到 `iface->get_exports()`：

```cpp
#include <extension/LayaExtension.h>
#include <jsvm/JSVM.h>

struct Export {
    const char* name;
    jsvm_callback callback;
};

constexpr Export exports[] = {
    {"restartAppIfNecessary", restart},
    {"init", init},
    {"shutdown", shutdown},
    {"update", update},
    {"getStatus", status},
    {"isOverlayEnabled", overlayEnabled},
    {"getSteamId", steamId},
    {"getPersonaName", personaName},
    {"activateGameOverlay", openOverlay},
    {"setRichPresence", setPresence},
    {"findOrCreateLeaderboard", findLeaderboard},
    {"uploadLeaderboardScore", uploadScore},
    {"downloadLeaderboardEntries", downloadScores},
    {"getLeaderboardState", leaderboard},
};

int onEvent(LayaExtEventType event,
            const LayaExtensionInterface* iface, void*) {
    if (event == LAYA_EXT_EVENT_DEINIT) {
        SteamBridge::instance().shutdown();
        return 0;
    }
    if (event != LAYA_EXT_EVENT_INIT || !iface) return 0;

    jsvm_env env = iface->get_env();
    jsvm_value target = iface->get_exports();
    if (!env || !target) return -1;

    for (const auto& item : exports) {
        jsvm_value function;
        if (jsvm_create_function(env, item.name, JSVM_AUTO_LENGTH,
                item.callback, nullptr, &function) != jsvm_ok)
            return -1;
        if (jsvm_set_named_property(env, target, item.name, function) != jsvm_ok)
            return -1;
    }
    return 0;
}

int extensionInit(const LayaExtensionInterface*, LayaExtensionInitInfo* info) {
    if (!info) return -1;
    info->api_version = LAYA_EXTENSION_API_VERSION;
    info->name = "laya_steam";
    info->version = "1.0.0";
    info->on_event = onEvent;
    info->user_data = nullptr;
    return 0;
}

LAYA_EXTENSION_ENTRY(extensionInit)
LAYA_EXTENSION_ENTRY_NAMED(laya_steam, extensionInit)
```

Windows DLL 至少应导出 `laya_extension_init`。具名宏还会导出 `laya_extension_init_laya_steam`，便于静态或具名加载场景使用。不要再导出旧兼容入口 `LayaExtInit`。

### 4.3 编译 Windows DLL

最小工程需要：

- 包含目录：LayaNative SDK 的 `include`、Steamworks SDK 的 `public`。
- 库目录：LayaNative SDK 的 `lib`、Steamworks SDK 的 `redistributable_bin/win64`。
- 链接库：`conch.lib`、`steam_api64.lib`。
- C++ 运行库：`/MT`，平台为 `x64`。

```powershell
$env:LAYANATIVE_SDK_ROOT = "D:\path\to\LayaNativeSDK\Runtime\x64\release"
$env:STEAMWORKS_SDK_ROOT = "D:\path\to\steamworks_sdk\sdk"

msbuild .\native\LayaSteam\LayaSteam.vcxproj `
  /p:Configuration=Release /p:Platform=x64
```

示例工程把编译产物直接输出到 `build-templates/windows/release/`，并复制 Steamworks 可再发行库。不要提交 `build/`、`.vs/`、`.obj`、`.lib`、`.exp`、`.pdb` 或完整 Steamworks SDK。

## 五、在 TypeScript 中调用

### 5.1 唯一插件入口

业务代码不直接关心 DLL 路径，只读取 manifest 声明的全局对象：

```typescript
export interface SteamNative {
    restartAppIfNecessary(appId: number): boolean;
    init(): boolean;
    shutdown(): void;
    update(): void;
    getStatus(): { initialized: boolean; appId: number; lastError: string };
    isOverlayEnabled(): boolean;
    getSteamId(): string;
    getPersonaName(): string;
    activateGameOverlay(dialog: string): boolean;
    setRichPresence(key: string, value: string): boolean;
    findOrCreateLeaderboard(name: string): boolean;
    uploadLeaderboardScore(score: number, keepBest?: boolean): boolean;
    downloadLeaderboardEntries(first: number, last: number): boolean;
    getLeaderboardState(): LeaderboardState;
}

export class LayaSteam {
    static load(): SteamNative {
        if (!Laya.LayaEnv.isConch)
            throw new Error("LayaSteam only runs in a LayaNative Windows build");

        const plugin = (globalThis as any).laya_steam as SteamNative | undefined;
        if (!plugin) throw new Error("laya_steam extension is not loaded");
        return plugin;
    }
}
```

Web 预览没有 Native 环境，应显示提示信息，不要在浏览器中调用插件。

### 5.2 初始化与排行榜流程

仓库公开示例保留 `APP_ID = 0`。发布前替换为自己的 AppID；只有大于 `0` 时才调用 `restartAppIfNecessary()`：

```typescript
private static readonly APP_ID = 0;
private steam!: SteamNative;
private phase = "idle";

onStart(): void {
    if (!Laya.LayaEnv.isConch) return;

    this.steam = LayaSteam.load();
    if (Main.APP_ID > 0 && this.steam.restartAppIfNecessary(Main.APP_ID)) {
        (window as any).conch.exit();
        return;
    }
    if (!this.steam.init())
        throw new Error(this.steam.getStatus().lastError);

    this.steam.setRichPresence("status", "Playing LayaSteamProject");
    this.steam.findOrCreateLeaderboard("LayaNative_Sample_Score");
    this.phase = "finding";
    Laya.timer.frameLoop(1, this, this.onFrame);
}

private onFrame(): void {
    this.steam.update();
    const board = this.steam.getLeaderboardState();

    if (this.phase === "finding" && board.ready && !board.findPending) {
        this.steam.uploadLeaderboardScore(1000, true);
        this.phase = "uploading";
    } else if (this.phase === "uploading" && !board.uploadPending) {
        this.steam.downloadLeaderboardEntries(1, 10);
        this.phase = "downloading";
    } else if (this.phase === "downloading" && !board.downloadPending) {
        this.phase = "done";
    }
}

onDestroy(): void {
    Laya.timer.clearAll(this);
    this.steam?.shutdown();
}
```

### 5.3 重复打开 Overlay

每次点击都调用 `activateGameOverlay("friends")`，不要设置永久的一次性标记，也不要在首次点击后移除事件：

```typescript
button.on(Laya.Event.MOUSE_DOWN, this, () => {
    if (!this.steam.activateGameOverlay("friends"))
        console.warn(this.steam.getStatus().lastError);
});
```

UI 和日志应对用户信息主动脱敏：

```typescript
function mask(value: string, head = 1, tail = 1): string {
    if (value.length <= head + tail) return "***";
    return `${value.slice(0, head)}***${value.slice(-tail)}`;
}
```

## 六、使用 LayaPro 发布

在 LayaPro 中打开项目，发布平台选择 Windows。本例固定使用 WebGL。发布完成后，关键文件应与 exe 同目录：

```text
release/
├─ LayaSteamProject.exe
├─ config.ini
├─ laya_steam.layaext.json
├─ steam_native.dll
├─ steam_api64.dll
└─ ...
```

确认 `config.ini` 中仍有 `LoadExtension=true`。同时确认所用 Windows 客户端来自 LayaNative 3.4.1 或更高版本并包含新 ExtensionManager；仅支持旧 `LayaExtInit`/`Laya.importNative` 的兼容客户端不能加载本例。

本地直接启动时，可在 exe 同目录创建只包含 AppID 的 `steam_appid.txt`。该文件仅用于本地开发，不要提交或上传到 Steam Depot。正式验证 Overlay 时，在 Steamworks 中把启动项指向发布的 exe，并通过桌面 Steam 客户端启动。

## 七、验证结果

示例启动后，绿色方块持续旋转，状态面板显示 Steam 初始化、Overlay 和排行榜状态；图中用户信息已经脱敏：

![LayaSteam 示例运行结果](./img/layasteam-running.png)

点击 `OPEN STEAM FRIENDS` 后打开 Steam Overlay。点击“返回游戏”后再次点击同一按钮，Overlay 仍能重新打开：

![Steam Overlay 已由 LayaSteam 打开](./img/layasteam-overlay.png)

完整验证至少包括：

1. DLL 导出 `laya_extension_init`，发布目录存在 manifest，且 `LoadExtension=true`。
2. `init()` 成功，UI 和日志不暴露完整账号名、SteamID 或私有测试配置。
3. `Overlay: ready`，好友 Overlay 可以打开、返回、再次打开。
4. 排行榜完成查找、上传、下载，点击上传按钮后分数增加。
5. 退出场景时执行 `shutdown()`，程序无崩溃。

## 八、常见问题

| 现象 | 检查项 |
| --- | --- |
| `laya_steam extension is not loaded` | 检查 `LoadExtension=true`、manifest 与 DLL 是否在 exe 同目录，并确认客户端支持 3.4.1 新 Extension API。 |
| DLL 没有加载 | 用 `dumpbin /exports steam_native.dll` 确认存在 `laya_extension_init`，并检查 `steam_api64.dll` 是否同目录。 |
| `SteamAPI_InitEx failed` | 确认桌面 Steam 已运行、账号拥有应用许可、AppID 正确，并检查 `steam_api64.dll`。 |
| AppID 不一致 | `restartAppIfNecessary()` 的参数、`steam_appid.txt` 和 Steam 启动应用必须一致。 |
| `Overlay: waiting` | 必须通过 Steam 客户端启动，且用户和游戏的 Steam Overlay 设置均已开启。Overlay 可能延迟数秒就绪。 |
| 第一次能打开，返回后不能再打开 | 每次点击都调用 `ActivateGameOverlay`，不要使用一次性状态，同时每帧执行 `SteamAPI_RunCallbacks()`。 |
| 排行榜一直 pending | 检查是否每帧调用 `update()`，并确认 `CCallResult` 生命周期覆盖异步请求。 |
| Windows 运行时报渲染上下文错误 | 检查发布配置和客户端版本是否匹配；本例使用 `windows.renderMode: "webgl"`。 |
