---
title: "conch.readFileFromAsset / conch.isFileExistsInAsset 使用说明"
description: "这两个接口用于读取随应用打包的资源文件（Asset/包内资源），典型用途是读取 scripts/ 下的 JS 脚本、config.ini、图片/字体等资源。"
slug: "released/native/filesystem"
---

这两个接口用于**读取随应用打包的资源文件（Asset/包内资源）**，典型用途是读取 `scripts/` 下的 JS 脚本、`config.ini`、图片/字体等资源。

> 注意：它们读取的是“包内资源”，不是下载缓存目录、也不是可写的本地存储目录。可写目录请参考 `conch.getCachePath()` / `conch.getLocalStoragePath()` 等接口。

## 1. API 定义

### 1.1 conch.isFileExistsInAsset(file)

- **签名**：`conch.isFileExistsInAsset(file: string): boolean`
- **参数**
  - **file**：资源相对路径（例如：`"scripts/apploader.js"`）
- **返回值**
  - **true**：资源存在
  - **false**：资源不存在，或当前平台未初始化 Asset 资源读取器

### 1.2 conch.readFileFromAsset(file, encode)

- **签名**：`conch.readFileFromAsset(file: string, encode: string): string | ArrayBuffer | null`
- **参数**
  - **file**：资源相对路径（例如：`"config.ini"`、`"image/splash.png"`）
  - **encode**：编码/读取模式
    - 传入 **`"utf8"`**：返回 **string**
    - 传入其他任意字符串（项目里常用 **`"raw"`**）：返回 **ArrayBuffer**（二进制）
- **返回值**
  - 读取成功：`string` 或 `ArrayBuffer`
  - 读取失败：`null`（例如文件不存在，或 Asset 读取器未初始化）

## 2. JS 使用示例

### 2.1 判断文件是否存在

```javascript
const ok = conch.isFileExistsInAsset("scripts/runtimeInit.js");
console.log("exists:", ok);
```

### 2.2 读取文本（UTF-8）

```javascript
const text = conch.readFileFromAsset("config.ini", "utf8");
if (text == null) {
  throw new Error("config.ini not found in asset");
}
console.log(text);
```

### 2.3 读取二进制（ArrayBuffer）

```javascript
const ab = conch.readFileFromAsset("image/splash.png", "raw");
if (ab == null) {
  throw new Error("image/splash.png not found in asset");
}
const bytes = new Uint8Array(ab);
console.log("png bytes:", bytes.length);
```

### 2.4 典型用法：从 Asset 读出脚本并写入缓存目录

项目中已有用法示例（见 `conch/src/network/tests/UploadFileTestClient.js`）：

```javascript
var data = conch.readFileFromAsset("scripts/async.js", "raw");
var path = conch.getCachePath() + "/async.js";
fs_writeFileSync(path, data);
```

## 3. 路径规则（非常重要）

- **路径一律使用相对路径**，不要以 `/` 开头。
- **建议使用 `/` 作为分隔符**，例如 `scripts/index.js`（跨平台一致）。
- **大小写保持一致**：Android/OHOS 的资源路径通常大小写敏感，Windows 通常不敏感，为避免跨平台问题请统一大小写。

## 4. 各平台 Asset 读取目录（资源根目录）

`file` 参数都是相对于“资源根目录”的路径。下面表格描述了各平台对应的资源根目录在哪里，以及发布工程中通常放置的位置。

### 4.1 Android

- **资源根目录**：APK 的 `assets/` 根目录
  - 发布工程示例：`publish/android_studio/app/src/main/assets/`
  - 例如：`conch.readFileFromAsset("scripts/apploader.js", ...)` 对应 `assets/scripts/apploader.js`
- **扩展包（OBB/ZIP）**：如果配置了 `apkExpansionMainPath` / `apkExpansionPatchPath`，读取顺序为：
  - 先查 APK `assets/`
  - 再查 Expansion Main
  - 再查 Expansion Patch

### 4.2 iOS

- **资源根目录**：App Bundle 内的资源根路径（由原生层 `CToObjectCGetRootAssetsPath()` 提供）
  - 发布工程示例：`publish/ios/resource/`（通常会被拷贝进 `.app` 包内）
  - 例如：`conch.readFileFromAsset("scripts/apploader.js", ...)` 对应 App 包内的 `.../resource/scripts/apploader.js`（具体绝对路径由系统/打包方式决定）

### 4.3 OHOS（HarmonyOS）

- **资源根目录**：`resources/rawfile/` 根目录（通过 `OH_ResourceManager_OpenRawFile` 访问）
  - 发布工程示例：`publish/ohos/entry/src/main/resources/rawfile/`
  - 例如：`conch.readFileFromAsset("scripts/apploader.js", ...)` 对应 `rawfile/scripts/apploader.js`

### 4.4 Windows

- **资源根目录**：可执行文件（EXE）所在目录（`OS::getAssetRootPath()` 返回 `parent(exePath)`）
  - 例如：`conch.readFileFromAsset("scripts/apploader.js", ...)` 对应 `<exe_dir>/scripts/apploader.js`
  - 发布工程里如果资源放在子目录（例如 `publish/windows/resource/scripts/...`），需要保证运行时资源根目录与之匹配：
    - 常见做法是把 `scripts/`、`config.ini`、`image/` 等资源**复制到 EXE 同级目录**，或把 EXE 放到 `resource/` 目录下运行

### 4.5 Linux

- **资源根目录**：可执行文件所在目录（与 Windows 一致）
  - 例如：`conch.readFileFromAsset("scripts/apploader.js", ...)` 对应 `<exe_dir>/scripts/apploader.js`

## 5. 行为细节（便于排查问题）

- **失败返回值**：
  - `readFileFromAsset(...)` 失败返回 `null`
  - `isFileExistsInAsset(...)` 失败返回 `false`
- **一次性读入内存**：`readFileFromAsset` 会把整个文件读入内存（返回 string 或 ArrayBuffer），大文件请注意内存占用。


