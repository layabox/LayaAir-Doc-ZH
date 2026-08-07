---
title: "搭建开发环境"
description: "下载安装 LayaAir IDE，并准备 Node.js、TypeScript、浏览器与 VS Code 等基础工具环境"
lastUpdated: 2026-07-31
slug: "basics/developmentenvironment/download"
---


在熟悉开发环境之前，请开发者们准备好相关的工具环境~



## 一、下载并安装 LayaAir IDE

IDE 内已集成引擎，直接下载 IDE 即可，无需单独下载引擎库。

下载地址：https://layaair.com/#/engineDownload

打开下载页后（请先将官网切换为中文界面），在左侧版本列表中选择需要的版本（一般选择最新正式版即可），然后点击页面中的 **立即下载** 按钮下载安装包，如图 1-1 所示（红色框标出的位置）。

![图1-1](./img/1-1.png)

（图 1-1）

下载完成后，按系统提示完成安装即可。



## 二、搭建 TS 开发环境

LayaAir 3.x 使用 TypeScript 进行开发，因此需要准备好 Node.js 与 TypeScript 编译环境。

### 2.1 下载并安装 Node.js

#### 2.1.1 检查是否已安装 Node.js 环境

使用 TypeScript 开发需要 Node.js 环境。如果不确定本机是否已安装，可先打开命令行工具（Windows 可使用 `cmd` 或 PowerShell），输入：

```
npm -h
```

按回车后，如果能看到 npm 的命令说明、版本号以及安装路径等信息，如图 2-1 所示（类似信息即可），说明已经安装过了。如果不影响使用，可跳过下载和安装 Node.js 的步骤。

也可以使用更简洁的方式检查：

```
node -v
npm -v
```

若能正常输出版本号，同样说明环境可用。

![图2-1](./img/2-1.png)

（图 2-1）

#### 2.1.2 Node.js 官网下载并安装

如果尚未安装，请前往 Node.js 官网下载，**推荐选择 LTS（长期支持）版本**。下载地址：

https://nodejs.org/zh-cn/download

官网页面上方可通过下拉项切换安装方式，并确认版本为 **LTS**。对大多数 Windows 开发者，更建议直接使用页面下方的安装包下载入口：确认系统为 **Windows**、架构为 **x64** 后，点击 **Windows 安装程序(.msi)**，如图 2-2 所示（红色框标出的位置）。

![图2-2](./img/2-2.png)

（图 2-2）

图 2-2 仅作参照。版本号会随官网更新变化，请始终选择带 **LTS** 标记的版本；非 x64 电脑可在架构下拉中切换后再下载。

下载完成后，运行安装包并按向导一步步完成安装。安装完成时界面如图 2-3 所示，点击 **Finish** 退出即可。

![图2-3](./img/2-3.png)

（图 2-3）

安装完成后，建议重新打开一个新的命令行窗口，再按 2.1.1 的方式执行 `npm -h`（或 `node -v` / `npm -v`）确认安装成功。

### 2.2 安装 TSC

Node.js 环境就绪后，即可使用 npm 安装 TypeScript 编译器（tsc）。

#### 2.2.1 命令行安装 TypeScript

在命令行中输入以下指令并回车，如图 2-4 所示。安装过程中请保持网络畅通。

```
npm install -g typescript
```

![图2-4](./img/2-4.png)

（图 2-4）

安装成功后，通常会看到类似 `added 1 package in Xs` 的提示。

如果安装时出现图 2-5 这类 JSON 解析 / 缓存相关错误，多半是 npm 缓存异常导致（未遇到可直接跳过本小节）。

![图2-5](./img/2-5.png)

（图 2-5）

此时可先清理缓存，再重新执行安装命令：

```
npm cache clean --force
```

:::tip[Tips]

国内网络环境下，npm 官方源有时会较慢或不稳定。可先执行 `npm cache clean --force` 清理缓存，再改用国内镜像安装，例如：

```
npm install -g typescript --registry=https://registry.npmmirror.com
```

也可以先将 npm 默认源切换为镜像后再安装：

```
npm config set registry https://registry.npmmirror.com
npm install -g typescript
```

:::

使用镜像安装成功后的效果如图 2-6 所示（同样会出现 `added … package` 一类提示）。

![图2-6](./img/2-6.png)

（图 2-6）

安装完成后，本机即可使用 TypeScript Compiler（tsc）将 TypeScript 编译为 JavaScript，供 LayaAir IDE 与工程构建流程使用。

#### 2.2.2 检查 TypeScript 编译环境版本

在命令行输入以下命令，可查看当前 TypeScript 编译器版本，如图 2-7 所示。

```
tsc -v
```

![图2-7](./img/2-7.png)

（图 2-7）

如果能正常显示出版本号，说明 TypeScript Compiler（tsc）安装成功。



## 三、安装浏览器

推荐采用 Chromium 内核浏览器作为 LayaAir 的运行与调试环境，例如 Windows 自带的 Edge，或 Google Chrome。

Chrome 官网下载地址：

https://www.google.cn/intl/zh-CN/chrome/



## 四、下载安装 VS Code

VS Code 是应用广泛的编码工具，也是 LayaAir 引擎推荐的编码工具。

VS Code 官网下载地址：

https://code.visualstudio.com/Download
