---
title: "LayaNative 文件系统"
description: "本文档说明 LayaNative 文件系统中 layanative:// 虚拟文件协议的路径规则、平台映射和常用 FileSystemManager 接口。"
slug: "released/native/filesystem"
---

本文档说明 LayaNative 文件系统中 `layanative://` 虚拟文件协议的路径规则、平台映射和常用 FileSystemManager 接口。
> Version >= LayaAir 3.4.1
## 协议概览

| 协议 | 用途 | 推荐场景 |
| --- | --- | --- |
| `layanative://assets/` | 读取随包发布的普通资源 | 跨平台读取 assets / bundle / rawfile 内的文件 |
| `layanative://usr/` | 读取用户数据目录中的文件 | 读取运行期写入的用户文件 |

路径会统一做安全检查：

| 规则 | 说明 |
| --- | --- |
| 路径必须非空 | `layanative://usr/` 后面没有文件名会失败 |
| 禁止 `..` | 不能通过相对路径跳出协议对应目录 |
| 查询参数会被忽略 | `?` 和 `#` 后的内容不参与本地路径解析 |
| 路径分隔符归一化 | `\` 会转换为 `/` |

## assets 协议

`layanative://assets/` 用来读取安装包内的普通资源。

```js
var fs = conch.getFileSystemManager();
fs.readFile({
    filePath: "layanative://assets/cache/readme.txt",
    success: function (res) {
        console.log(res.data);
    },
    fail: function () {
        console.log("read assets failed");
    }
});
```

各平台映射（相对于 LayaNative 的 `publish` 目录下各平台工程目录）：

| 平台 | `layanative://assets/layabox.png` |
| --- | --- |
| Android | `android_studio/app/src/main/assets/layabox.png` |
| iOS | `ios/resource/layabox.png` |
| HarmonyOS NEXT | `ohos/entry/src/main/resources/rawfile/layabox.png` |
| Windows | `windows/resource/layabox.png` |
| Linux | `linux/resource/layabox.png` |


## usr 协议

`layanative://usr/` 用来读取用户数据目录中的文件。

```js
var url = conch.env.USER_DATA_PATH + "/profile.json";
var fs = conch.getFileSystemManager();
fs.readFile({
    filePath: url,
    success: function (res) {
        console.log(res.data);
    },
    fail: function () {
        console.log("read usr failed");
    }
});
```

`conch.env.USER_DATA_PATH` 返回的是协议根：

```js
console.log(conch.env.USER_DATA_PATH); // layanative://usr
```

它不是物理路径。需要写入文件时，JS 侧应使用 `conch.getFileSystemManager()`，并传入 `layanative://usr/...` 协议路径。

## 接口

### JS: conch.env.USER_DATA_PATH

返回用户数据协议根。

```js
var userFileUrl = conch.env.USER_DATA_PATH + "/save/data.json";
```

返回值固定为：

```text
layanative://usr
```

### 分平台 getUserDataPath 接口

| 平台 | 原生接口 | 返回值 | 典型用途 |
| --- | --- | --- | --- |
| Android | `ConchJNI.getUserDataPath()` | 物理用户数据目录 | Java 侧写入用户文件 |
| iOS | `[conchRuntime getUserDataPath]` | 物理用户数据目录 | Objective-C / Objective-C++ 侧写入用户文件 |
| HarmonyOS NEXT | `laya.ConchNAPI_getUserDataPath()` | 物理用户数据目录 | ArkTS / JS 侧获取 native 用户目录 |
| Windows / Linux / C ABI | `getUserDataPath()` | 物理用户数据目录 | 宿主程序或 C/C++ 扩展侧获取用户目录 |

### Android Java: ConchJNI.getUserDataPath()

返回 Android 上的物理用户数据目录。

```java
String path = ConchJNI.getUserDataPath();
```

该路径可用于 Java 侧写文件。写入后，JS 可通过 `layanative://usr/...` 读取。

### iOS Objective-C: [conchRuntime getUserDataPath]

返回 iOS 上的物理用户数据目录。

```objc
NSString *path = [[conchRuntime GetIOSConchRuntime] getUserDataPath];
```

该路径可用于 Objective-C / Objective-C++ 侧写文件。写入后，JS 可通过 `layanative://usr/...` 读取。

### HarmonyOS NEXT ArkTS: laya.ConchNAPI_getUserDataPath()

返回 HarmonyOS NEXT 上的物理用户数据目录。

```ts
const path: string = laya.ConchNAPI_getUserDataPath();
```

该路径可用于 ArkTS / JS 侧写文件。写入后，JS 可通过 `layanative://usr/...` 读取。

### C ABI: getUserDataPath()

返回物理用户数据目录，供宿主程序或 C/C++ 扩展侧调用。

```cpp
const char* path = getUserDataPath();
```

## 写入后读取示例

Android Java 写入：

```java
String dir = ConchJNI.getUserDataPath();
File file = new File(dir, "profile.json");
// 写入 file
```

JS 读取：

```js
var fs = conch.getFileSystemManager();
fs.readFile({
    filePath: conch.env.USER_DATA_PATH + "/profile.json",
    success: function (res) {
        console.log(res.data);
    },
    fail: function () {
        console.log("read profile failed");
    }
});
```

## 常见错误

| 问题 | 原因 | 处理 |
| --- | --- | --- |
| JS 使用物理路径写用户文件 | JS 不再暴露 `conch.getUserDataPath()` | 使用 `conch.getFileSystemManager()` 写入 `layanative://usr/...` |
| `layanative://usr/../xxx` 读取失败 | 安全检查禁止 `..` | 使用用户目录下的相对路径 |
| `layanative://usr/file.txt` 读取失败 | 文件不存在或未写入到用户数据目录 | 确认 JS 已通过 FileSystemManager 写入同一个 `layanative://usr/...` 路径，或原生侧已写入用户数据目录 |

## FileSystemManager JS 接口

LayaNative 对外提供 `conch.getFileSystemManager()`，用法按微信小游戏 `FileSystemManager` 接口对齐：

```js
var fs = conch.getFileSystemManager();
```

### 路径规则

| 路径 | 说明 |
| --- | --- |
| `layanative://usr/...` | 用户数据目录，可读写，等价于 `conch.env.USER_DATA_PATH` 协议路径 |
| `layanative://tmp/...` | 本地临时文件区域，可读，不允许通过普通写接口直接写入；通常由下载等接口产生，再作为 `saveFile` 的临时源文件 |
| `layanative://assets/...` | 包内资源目录，只读 |

JS 层文件系统接口优先使用上面的协议路径。JS 不再暴露物理用户数据目录；需要物理目录时，应在对应平台原生侧使用 `ConchJNI.getUserDataPath()`、`[conchRuntime getUserDataPath]`、`laya.ConchNAPI_getUserDataPath()` 或 C ABI `getUserDataPath()`。

异步接口会投递到文件 I/O 线程池执行，完成后回调回 JS 线程；同步接口会直接阻塞 JS 线程，读写大文件时应优先使用异步接口。

### 本地文件类型

LayaNative 的本地文件语义按微信小游戏文件系统对齐：

| 类型 | 路径 | 读 | 写 | 说明 |
| --- | --- | --- | --- | --- |
| 本地临时文件 | `layanative://tmp/...` | 有 | 无 | 由下载等特定接口产生，用于保存前的临时中转，生命周期不保证长期有效 |
| 本地用户文件 | `layanative://usr/...` | 有 | 有 | 开发者可自由读写，适合保存业务配置、存档、用户生成内容 |

需要长期保存的数据应写到 `layanative://usr/...`。`saveFile` 必须显式传入保存目标路径。

### 通用回调参数

异步接口的 `options` 对象支持以下通用回调字段：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `success` | `Function` | 否 | 调用成功回调，参数为接口返回对象 |
| `fail` | `Function` | 否 | 调用失败回调，参数包含 `errMsg`、`errCode` |
| `complete` | `Function` | 否 | 调用结束回调，成功和失败都会触发 |

同步接口失败时会抛出异常，异常信息包含对应的 `errMsg` 和 `errCode`。

### 接口参数和返回值

#### 读写文件

| 接口 | 输入参数 | 返回值 |
| --- | --- | --- |
| `readFile(options)` | `filePath: string`；`encoding?: string`，默认 `arraybuffer`；`position?: number`；`length?: number`；通用回调 | 无直接返回；`success(res)` 中 `res.data` 为文件内容 |
| `readFileSync(filePath, encoding?, position?, length?)` | `filePath: string`；`encoding?: string`，默认 `arraybuffer`；`position?: number`；`length?: number` | 文件内容；指定文本编码时返回 `string`，否则返回 `ArrayBuffer` |
| `readFileSync(options)` | `filePath: string`；`encoding?: string`；`position?: number`；`length?: number` | 对象，包含 `data` |
| `writeFile(options)` | `filePath: string`；`data: string \| ArrayBuffer \| TypedArray`；`encoding?: string`，默认 `utf8`；通用回调 | 无直接返回；`success(res)` 返回通用结果对象 |
| `writeFileSync(filePath, data, encoding?)` | `filePath: string`；`data: string \| ArrayBuffer \| TypedArray`；`encoding?: string`，默认 `utf8` | 无返回值 |
| `appendFile(options)` | `filePath: string`；`data: string \| ArrayBuffer \| TypedArray`；`encoding?: string`，默认 `utf8`；通用回调 | 无直接返回；`success(res)` 返回通用结果对象 |
| `appendFileSync(filePath, data, encoding?)` | `filePath: string`；`data: string \| ArrayBuffer \| TypedArray`；`encoding?: string`，默认 `utf8` | 无返回值 |

#### 目录和文件管理

| 接口 | 输入参数 | 返回值 |
| --- | --- | --- |
| `access(options)` | `path: string`；通用回调 | 无直接返回；路径存在时进入 `success` |
| `accessSync(path)` | `path: string` | 无返回值；路径不存在时抛异常 |
| `mkdir(options)` | `dirPath: string`；`recursive?: boolean`，默认 `false`；通用回调 | 无直接返回；`success(res)` 返回通用结果对象 |
| `mkdirSync(dirPath, recursive?)` | `dirPath: string`；`recursive?: boolean`，默认 `false` | 无返回值 |
| `readdir(options)` | `dirPath: string`；通用回调 | 无直接返回；`success(res)` 中 `res.files` 为文件名数组 |
| `readdirSync(dirPath)` | `dirPath: string` | `string[]`，目录下文件名数组 |
| `rmdir(options)` | `dirPath: string`；`recursive?: boolean`，默认 `false`；通用回调 | 无直接返回；`success(res)` 返回通用结果对象 |
| `rmdirSync(dirPath, recursive?)` | `dirPath: string`；`recursive?: boolean`，默认 `false` | 无返回值 |
| `unlink(options)` | `filePath: string`；通用回调 | 无直接返回；`success(res)` 返回通用结果对象 |
| `unlinkSync(filePath)` | `filePath: string` | 无返回值 |
| `rename(options)` | `oldPath: string`；`newPath: string`；通用回调 | 无直接返回；`success(res)` 返回通用结果对象 |
| `renameSync(oldPath, newPath)` | `oldPath: string`；`newPath: string` | 无返回值 |
| `copyFile(options)` | `srcPath: string`；`destPath: string`；通用回调 | 无直接返回；`success(res)` 返回通用结果对象 |
| `copyFileSync(srcPath, destPath)` | `srcPath: string`；`destPath: string` | 无返回值 |
| `stat(options)` | `path: string`；`recursive?: boolean`，默认 `false`；通用回调 | 无直接返回；`success(res)` 返回文件状态。递归目录时返回子项状态 |
| `statSync(path, recursive?)` | `path: string`；`recursive?: boolean`，默认 `false` | 文件状态对象。递归目录时返回子项状态 |
| `truncate(options)` | `filePath: string`；`length?: number`，默认 `0`；通用回调 | 无直接返回；`success(res)` 返回通用结果对象 |
| `truncateSync(options)` | `filePath: string`；`length?: number`，默认 `0` | 无返回值 |

`stat` / `statSync` 的文件状态对象包含 `size`、`mode`、`lastAccessedTime`、`lastModifiedTime`，并提供 `isFile()`、`isDirectory()` 方法。

#### 保存文件

| 接口 | 输入参数 | 返回值 |
| --- | --- | --- |
| `saveFile(options)` | `tempFilePath: string`；`filePath: string`；通用回调 | 无直接返回；`success(res)` 中 `res.savedFilePath` 为保存后的路径。`filePath` 应保存到 `layanative://usr/...` |
| `saveFileSync(tempFilePath, filePath)` | `tempFilePath: string`；`filePath: string` | `string`，保存后的路径。`filePath` 应保存到 `layanative://usr/...` |

#### 压缩包和摘要

| 接口 | 输入参数 | 返回值 |
| --- | --- | --- |
| `unzip(options)` | `zipFilePath: string`；`targetPath: string`；通用回调 | 无直接返回；`success(res)` 返回通用结果对象。`targetPath` 应使用 `layanative://usr/...` |
| `readZipEntry(options)` | `filePath: string`；`entries: "all" \| Array<{ path: string, encoding?: string, position?: number, length?: number }>`；`encoding?: string`，读取全部条目时使用；通用回调 | 无直接返回；`success(res)` 中 `res.entries` 为 zip 条目内容映射 |
| `getFileInfo(options)` | `filePath: string`；`digestAlgorithm?: "md5" \| "sha1"`；通用回调 | 无直接返回；`success(res)` 中包含 `size` 和 `digest` |

支持的文本编码包括 `utf8`、`ascii`、`binary`、`latin1`、`ucs2`、`utf16le`、`base64`、`hex`。未传 `encoding` 读取二进制内容时返回 `ArrayBuffer`。

### 读写文件

`writeFile` / `writeFileSync` 用于一次性写入完整文件：

```js
fs.writeFile({
    filePath: "layanative://usr/config.json",
    data: JSON.stringify({ volume: 0.8 }),
    encoding: "utf8",
    success: function () {
        console.log("write ok");
    },
    fail: function (res) {
        console.log(res.errMsg, res.errCode);
    }
});

fs.writeFileSync("layanative://usr/config.txt", "hello", "utf8");
```

`appendFile` / `appendFileSync` 用于追加内容：

```js
fs.appendFileSync("layanative://usr/log.txt", "line\n", "utf8");
```

`readFile` / `readFileSync` 用于一次性读取完整文件：

```js
fs.readFile({
    filePath: "layanative://usr/config.json",
    encoding: "utf8",
    success: function (res) {
        console.log(res.data);
    }
});

var data = fs.readFileSync("layanative://usr/config.txt", "utf8");
```

### 目录和文件管理

`access` / `accessSync` 判断路径是否存在：

```js
fs.accessSync("layanative://usr/config.txt");
```

`mkdir` / `mkdirSync` 创建目录，`recursive` 为 `true` 时递归创建：

```js
fs.mkdirSync("layanative://usr/save/slot1", true);
```

`readdir` / `readdirSync` 读取目录：

```js
var files = fs.readdirSync("layanative://usr/save");
```

`rmdir` / `rmdirSync` 删除目录，`recursive` 为 `true` 时递归删除：

```js
fs.rmdirSync("layanative://usr/save/slot1", true);
```

`unlink` / `unlinkSync` 删除文件：

```js
fs.unlinkSync("layanative://usr/old.txt");
```

`rename` / `renameSync` 移动或重命名文件、目录：

```js
fs.renameSync("layanative://usr/a.txt", "layanative://usr/b.txt");
```

`copyFile` / `copyFileSync` 复制文件：

```js
fs.copyFileSync("layanative://usr/b.txt", "layanative://usr/c.txt");
```

`stat` / `statSync` 获取文件或目录信息：

```js
var stat = fs.statSync("layanative://usr/c.txt");
console.log(stat.size, stat.isFile(), stat.isDirectory());
```

`truncate` / `truncateSync` 按路径截断文件：

```js
fs.truncateSync({
    filePath: "layanative://usr/c.txt",
    length: 10
});
```

### 保存文件

`saveFile` / `saveFileSync` 把临时文件保存为本地用户文件，并返回保存后的路径。`filePath` 必须传入，适合业务长期保存：

```js
var userSavedPath = fs.saveFileSync(
    "layanative://tmp/download.bin",
    "layanative://usr/download.bin"
);
```

### 压缩包接口

`unzip` 解压 zip 文件到目标目录：

```js
fs.unzip({
    zipFilePath: "layanative://usr/archive.zip",
    targetPath: "layanative://usr/unzip",
    success: function () {
        console.log("unzip ok");
    }
});
```

`readZipEntry` 读取 zip 内指定条目，或读取全部条目：

```js
fs.readZipEntry({
    filePath: "layanative://usr/archive.zip",
    entries: [
        { path: "config.json", encoding: "utf8" }
    ],
    success: function (res) {
        console.log(res.entries);
    }
});

fs.readZipEntry({
    filePath: "layanative://usr/archive.zip",
    entries: "all",
    success: function (res) {
        console.log(res.entries);
    }
});
```

### 文件摘要

`getFileInfo` 获取文件大小和摘要信息：

```js
fs.getFileInfo({
    filePath: "layanative://usr/c.txt",
    digestAlgorithm: "md5",
    success: function (res) {
        console.log(res.size, res.digest);
    }
});
```
