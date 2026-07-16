---
title: "AI命令行工具：LayaAir CLI"
description: "LayaAir CLI 将 IDE 能力命令行化，使开发者与 AI Agent 可在无图形界面环境下创建项目、校验资源、预览、构建发布与执行自动化脚本。适用于 LayaAir 3.4.0 及以上版本。"
slug: "basics/developmentenvironment/cli"
---


如果说 [LayaAir-MCP](/basics/developmentenvironment/ide-mcp/) 解决的是「AI 能否正确使用 LayaAir 引擎与 IDE 能力」的问题，那么 **LayaAir CLI** 的推出，则进一步解决了「AI 能脱离 IDE 更高效开发」的问题。

在 MCP 工作流中，AI 已经能够调用引擎 API，并通过 IDE 提供的能力参与场景创建、资源管理以及项目发布等开发流程。但这种模式本质上仍然需要通过 MCP 与 IDE 进行通信，由 IDE 执行具体操作。

对于人类开发者而言，这种方式直观且易于使用；但对于 AI 来说，图形界面并不是最高效的工作方式。AI 更擅长调用标准化命令、处理结构化输入以及执行自动化流程。因此，在复杂任务场景下，依赖 IDE 的工作模式往往会带来额外的通信成本和执行开销。

为了进一步打通 AI 开发链路，我们从 **3.4.0** 版本起，正式推出了 LayaAir CLI 命令行工具。

LayaAir CLI 将 IDE 中的基础能力进行了命令行化封装，使开发者和 AI 都能够通过标准命令直接调用引擎能力，而无需启动完整的图形界面环境。

通过 LayaAir CLI，可以完成项目创建、资源校验、项目预览、构建发布、自动化脚本执行等一系列工作。同时还支持在本机安装、切换和管理多个 CLI 版本，从而满足不同项目和不同引擎版本的开发需求。

相比传统 IDE 工作流，CLI 最大的优势在于**轻量、高效以及天然适配 AI**。

由于无需启动图形界面，也无需通过 MCP 与 IDE 建立通信链路，AI 可以直接调用命令完成任务。这不仅显著提升了执行效率，也使得自动化工作流变得更加稳定和可控。对于需要频繁执行构建、测试、发布等操作的 AI Agent 而言，CLI 模式能够大幅减少不必要的系统开销。

为了进一步提升 AI 对 LayaAir CLI 的理解能力，我们还推出了 [`layabox/layaair-skills`](https://github.com/layabox/layaair-skills) 技能包。通过该技能包，AI 可以更加准确地理解 LayaAir CLI 的命令体系、参数规范以及最佳实践，从而更高效地完成项目创建、资源处理、构建发布等任务。

从某种意义上来说，LayaAir CLI 不仅仅是一个命令行工具，更是 LayaAir 面向 AI 原生开发时代的重要基础设施。它让引擎能力第一次摆脱图形界面的限制，以更加标准化、自动化的方式向 AI 开放。当越来越多的开发流程开始由 AI Agent 主导时，CLI 所提供的轻量化、高效率以及自动化能力，也将成为未来 AI 开发工作流的重要组成部分。

开源地址：[https://github.com/layabox/layaair-cli](https://github.com/layabox/layaair-cli)



## 一、MCP / CLI / IDE 命令行发布的关系

| 方式 | 典型场景 | 是否必须启动 IDE GUI |
|---|---|---|
| [LayaAir-MCP](/basics/developmentenvironment/ide-mcp/) | AI 操控 IDE：建节点、挂组件、编辑场景 | 是（通过 MCP 与 IDE 通信） |
| **LayaAir CLI**（本文） | 创建/预览/构建/校验/跑脚本，适合 Agent 与 CI | 否 |
| [命令行发布](/released/commandline/) | 通过 `LayaAirIDE` 可执行文件在后台执行脚本 | 依赖本机已安装的 IDE |

建议组合：

- **搭场景、调表现**：MCP / LayaIdea + IDE  
- **高频自动化（构建、校验、脚本）**：优先 CLI  
- **团队 AI 工作流**：CodingMCP（写对 API）+ CLI（执行任务）+ Skills（教 AI 用对命令）



## 二、环境要求

- Node.js **20** 或更高版本  
- macOS、Linux 或 Windows  
- macOS/Linux 需安装 `unzip`（安装 CLI 运行时解压依赖）  
- 安装 CLI 版本、列出云端模板或从云端模板创建项目时需要网络  
- 支持的 CPU 架构：`x64`、`arm64`



## 三、安装

推荐使用一行命令完成命令入口安装和 CLI 运行时安装。

### 3.1 macOS / Linux

```bash
curl -fsSL https://raw.githubusercontent.com/layabox/layaair-cli/master/install.sh | bash && ~/.layaair/layaair install
```

安装指定版本：

```bash
curl -fsSL https://raw.githubusercontent.com/layabox/layaair-cli/master/install.sh | bash && ~/.layaair/layaair install 3.4.0
```

安装到自定义目录：

```bash
curl -fsSL https://raw.githubusercontent.com/layabox/layaair-cli/master/install.sh | LAYAAIR_INSTALL_DIR=/opt/layaair bash && /opt/layaair/layaair install
```

### 3.2 Windows PowerShell

```powershell
iwr https://raw.githubusercontent.com/layabox/layaair-cli/master/install.ps1 | iex; layaair install
```

安装指定版本：

```powershell
iwr https://raw.githubusercontent.com/layabox/layaair-cli/master/install.ps1 | iex; & "$env:USERPROFILE\.layaair\layaair.cmd" install 3.4.0
```

安装到自定义目录：

```powershell
$env:LAYAAIR_INSTALL_DIR = "C:\tools\layaair"; iwr https://raw.githubusercontent.com/layabox/layaair-cli/master/install.ps1 | iex; & "C:\tools\layaair\layaair.cmd" install
```

默认安装目录：

- macOS/Linux：`~/.layaair`
- Windows：`%USERPROFILE%\.layaair`



## 四、快速开始

```bash
# 安装最新 CLI 运行时
layaair install

# 查看当前激活的运行时版本
layaair --version

# 创建项目（项目名作为位置参数）
layaair create MyGame

# 启动当前项目的内置预览服务器
layaair run -p .

# 列出当前项目支持的构建平台
layaair build --list-platforms -p .

# 构建 Web 平台
layaair build web -p .
```



## 五、版本管理

```bash
layaair install              # 安装最新版本
layaair install 3.4.0        # 安装指定版本
layaair uninstall 3.4.0      # 卸载指定版本
layaair list                 # 查看已安装版本
layaair --version            # 输出当前激活版本
```

默认使用已安装版本中最新的一个。也可为单次命令显式指定版本：

```bash
layaair --version=3.4.0 build web -p .
```

当命令包含 `--project` / `-p` 时，`layaair` 会尝试读取项目目录下的 `.laya` 文件，并根据其中的 `version` 字段匹配本机已安装的 CLI 运行时。如果没有找到匹配版本，会回退到最新已安装版本并输出警告。



## 六、常用命令

### 6.1 创建项目

```bash
layaair create --list-templates
layaair create MyGame
layaair create MyGame -t "2D empty project"
```

| 参数 | 短参数 | 说明 |
| --- | --- | --- |
| `--create-name=<name>` | `-n` | 项目名称，同时作为 `.laya` 文件名 |
| `--create-path=<path>` | `-p` | 父目录，默认为当前目录 |
| `--create-subdir` | `-s` | 在 `<path>/<name>/` 下创建项目，默认关闭 |
| `--create-template=<name>` | `-t` | 模板显示名称，默认 `"3D empty project"` |
| `--list-templates` | `-l` | 输出可用模板列表后退出 |

### 6.2 构建项目

```bash
layaair build --list-platforms
layaair build web
layaair build web -p /tmp/demo -o /tmp/out
```

| 参数 | 短参数 | 说明 |
| --- | --- | --- |
| `--build-platform=<p>` | `-t` | 构建目标平台名称 |
| `--project=<path>` | `-p` | 项目根目录，默认为当前目录 |
| `--build-out=<path>` | `-o` | 构建输出目录，省略则使用项目构建配置 |
| `--build-recompile` | `-r` | 跳过资源导出，仅重新编译脚本 |
| `--list-platforms` | `-l` | 输出可用构建平台列表后退出 |

### 6.3 校验资源文件

```bash
layaair validate assets/main.lh assets/player.lprefab
```

| 参数 | 短参数 | 说明 |
| --- | --- | --- |
| `--validate-files=<f1,f2>` | `-f` | 逗号分隔的资源文件路径列表 |
| `--project=<path>` | `-p` | 项目根目录，默认为当前目录 |

### 6.4 预览项目

```bash
layaair run -p .
# 等效简写：
layaair -p .
```

服务器会读取项目的编辑器设置，并在启动后输出可访问的预览地址。

### 6.5 执行项目脚本

CLI 可以调用项目或插件代码中已注册类的静态方法。

示例：

```ts
@IEditorEnv.regClass()
export class BuildTools {
    static async exportData(outputPath: string): Promise<void> {
        // Custom automation.
    }
}
```

命令行调用：

```bash
layaair run -p . --script=BuildTools.exportData --script-args="./dist/data.json"
```

使用 `--script-file` 可在本次 CLI 运行中额外编译一个 TypeScript 文件（不会导入资源数据库）：

```bash
layaair run -p . --script=AX.test --script-file=/tmp/a.ts
layaair run -p . --script-file=/tmp/a.ts
```

跳过用户插件和包插件：

```bash
layaair run -p . --disable-plugins
```

| 参数 | 说明 |
| --- | --- |
| `--script=<Class.method>` | 要调用的静态方法 |
| `--script-file=<file.ts>` | 本次运行额外编译的 TypeScript 文件 |
| `--script-args="..."` | 传给脚本的位置参数（支持引号） |
| `--disable-plugins` | 跳过用户插件和包插件加载 |



## 七、全局选项与命令速查

| 选项 | 短参数 | 说明 |
| --- | --- | --- |
| `--help` | `-h` | 显示帮助；可在子命令后使用（如 `layaair build -h`） |
| `--debug` | `-d` | 启用调试日志 |
| `--enable-all-panels` | | 在 CLI 模式下加载所有编辑器和扩展面板 |

| 命令 | 用途 |
| --- | --- |
| `layaair install [version]` | 安装最新或指定 CLI 运行时 |
| `layaair uninstall <version>` | 卸载指定 CLI 运行时 |
| `layaair list` | 查看已安装 CLI 运行时 |
| `layaair --version` | 输出当前激活的 CLI 运行时版本 |
| `layaair create [name]` | 创建 LayaAir 项目 |
| `layaair build [platform]` | 构建 LayaAir 项目 |
| `layaair validate [files...]` | 校验资源文件 |
| `layaair run [-p <path>]` | 启动项目内置预览服务器 |
| `layaair run -p <path> --script=Class.method` | 执行已注册脚本方法 |
| `layaair help [command]` | 查看帮助 |



## 八、AI Agent 与 Skills

### 8.1 为什么 CLI 更适合 AI

- **标准化输入输出**：命令与参数结构清晰，便于 Agent 规划与重试  
- **无 GUI 依赖**：不必维持 IDE 进程与 MCP 会话  
- **易接入 CI**：同一套命令可在本机 Agent、GitHub Actions、服务器上复用  

### 8.2 layaair-skills 技能包

配合 [`layabox/layaair-skills`](https://github.com/layabox/layaair-skills)，可让 AI 更准确理解：

- CLI 命令体系与参数规范  
- 创建项目、资源处理、构建发布等最佳实践  
- 与引擎/IDE 相关的常见自动化任务（例如在 Agent 中按技能指引调用 CLI）

在 Cursor 等支持 Skills 的环境中安装该技能包后，Agent 在执行「创建 LayaAir 项目 / 构建 Web / 校验预制体」等任务时，会优先按官方约定选择正确命令，而不是臆造参数。

### 8.3 推荐提示词示例

```text
请使用本机已安装的 LayaAir CLI（版本与项目 .laya 一致）：
1. 列出可用模板
2. 用「2D empty project」模板在 ./workspace 创建项目 Demo2D
3. 校验 assets 下预制体
4. 构建 web 平台到 ./dist/web
```



## 九、常见问题

### 提示 `No versions installed`

尚未安装任何 CLI 运行时：

```bash
layaair install
```

### 提示 `Node.js v20+ required`

请安装或切换到 Node.js 20 及以上版本后重试。

### 提示 `unzip not found`（macOS/Linux）

```bash
# macOS
xcode-select --install

# Debian/Ubuntu
sudo apt-get install unzip
```

然后重新执行 `layaair install`。

### 提示 `Version <x> not installed`

```bash
layaair install <version>
```

或去掉 `--version=<version>`，使用最新已安装版本。

### 模板或运行时下载失败

检查网络，并确认目标 LayaAir 版本存在。云端模板列表与 CLI 运行时安装都需要访问 LayaAir 下载服务。



## 十、相关文档

- CLI 开源仓库：[layabox/layaair-cli](https://github.com/layabox/layaair-cli)  
- AI Skills：[layabox/layaair-skills](https://github.com/layabox/layaair-skills)  
- [LayaAir MCP 开发指南](/basics/developmentenvironment/ide-mcp/)  
- [AI编码环境：CodingMCP](/basics/developmentenvironment/codingmcp/)  
- [LayaIdea 使用说明](/basics/developmentenvironment/layaidea/)  
- [AI开发路线](/guides/roadmap/ai/)  
