---
title: "AI协同开发环境"
description: "面向 LayaAir 开发者梳理 2026 年 AI 协同形态：国际与国内主流问答、AIGC、智能体 IDE 与 MCP，并给出可落地的选型建议。"
lastUpdated: 2026-07-16
slug: "basics/developmentenvironment/aigc"
---

在当下的软件与游戏开发中，若仍完全依赖手工查文档、手写样板代码与纯人工产内容，效率与竞争力都会明显落后。善用大模型的理解、生成与工具调用能力，正在成为开发者的基础技能。

本文面向 **LayaAir 开发者**，按能力形态介绍当前主流的 AI 协同方式，并分别给出**国际**与**国内**常用产品。产品迭代很快，下文以「形态 + 代表工具」为主，具体套餐与模型名以各官网为准。

:::tip[和 LayaAir 专用能力的关系]
本文讲的是通用 AI 生态。接到 LayaAir 引擎后，请继续配置 [CodingMCP](/basics/developmentenvironment/codingmcp/)、[IDE-MCP](/basics/developmentenvironment/ide-mcp/)、[LayaAir CLI](/basics/developmentenvironment/cli/)、[LayaIdea](/basics/developmentenvironment/layaidea/)，减少「通用模型编造不存在的引擎 API」。完整路径见 [AI 开发路线](/guides/roadmap/ai/)。
:::



## 一、先分清四种协同形态

| 形态 | 你在做什么 | 典型工具 |
| --- | --- | --- |
| **AI 问答** | 查概念、排错思路、学语法、对比方案 | ChatGPT、Claude、Gemini、DeepSeek、Kimi、豆包等 |
| **AIGC 创作** | 生成图、3D、音效/配乐等素材草稿 | Midjourney、即梦、Meshy、ElevenLabs 等 |
| **代码助手** | 补全、改文件、多步实现功能、重构 | Copilot、Cursor、Claude Code、Trae、通义灵码等 |
| **工具协议 / Agent** | 让模型调用外部工具与真实数据 | MCP、Skills、引擎侧 MCP / CLI |

新手不必一次配齐。常见路径是：**问答解惑 → 代码助手写工程 →（可选）AIGC 出素材 → 再接入 LayaAir MCP 降幻觉**。



## 二、AI 问答

问答仍是最轻量的入口：打开网页就能用，适合语言基础、报错解读、方案对比。写引擎业务代码时，务必把结论对照 [官方 API](/basics/developmentenvironment/api/) 或 CodingMCP，不要直接信任模型「凭记忆」给出的类名与参数。

### 2.1 交互形态

| 形态 | 特点 | 适用 |
| --- | --- | --- |
| **网页 / App 对话** | 零配置，支持长对话、上传截图/文件、多数已联网 | 学习、调研、出提示词与草稿 |
| **开发环境内置** | 能看见当前文件与工程上下文 | 边写边问、就地改代码（见第三节） |
| **API / 开放平台** | 可接入自有产品或自动化流水线 | 团队平台、批量任务；个人入门可后置 |

### 2.2 国际主流（网页问答）

| 产品 | 公司 | 简要特点 |
| --- | --- | --- |
| [ChatGPT](https://chatgpt.com/) | OpenAI | 生态最广；适合通用问答、写作、多模态；付费档常见更强推理与工具 |
| [Claude](https://claude.ai/) | Anthropic | 长文与代码理解口碑突出；适合读长文档、拆复杂逻辑 |
| [Gemini](https://gemini.google.com/) | Google | 与 Google 生态结合好；长上下文与多模态能力强 |
| [Perplexity](https://www.perplexity.ai/) | — | 偏「带引用的检索问答」，适合查较新的公开资料 |
| [Grok](https://x.ai/) | xAI | 偏实时信息与开放对话风格（视地区与账号可用性） |

### 2.3 国内主流（网页问答）

| 产品 | 公司 | 简要特点 |
| --- | --- | --- |
| [DeepSeek](https://chat.deepseek.com/) | 深度求索 | 推理与性价比突出，国内开发者使用率高 |
| [Kimi](https://www.kimi.com/) | 月之暗面 | 长文本/多文件理解能力强，适合贴长日志与长文档 |
| [豆包](https://www.doubao.com/chat/) | 字节跳动 | 综合助手，创作与日常问答覆盖面广 |
| [通义千问](https://www.tongyi.com/) | 阿里 | 通用问答与创作；与阿里云 / 灵码生态衔接 |
| [腾讯元宝](https://yuanbao.tencent.com/) | 腾讯 | 联网检索体验较好，适合查较新公开信息 |
| [文心一言](https://yiyan.baidu.com/) | 百度 | 通用问答与创作，企业场景常见 |
| [智谱清言](https://chatglm.cn/) | 智谱 | GLM 系列；亦有编程向产品线（如 CodeGeeX） |
| [混元](https://hunyuan.tencent.com/) | 腾讯 | 通用大模型与图像等创作能力 |

### 2.4 怎么选、怎么问更靠谱

- **要联网查新资料**：优先选明确支持搜索/引用的产品（如 Perplexity、元宝，以及各家「联网」开关）。  
- **要啃长文档 / 长报错**：Claude、Kimi、Gemini 等长上下文产品更合适。  
- **要强推理拆问题**：可选用各家的「深度思考 / Reasoning」模式（名称因产品而异）。  
- **问 LayaAir 时**：写明引擎大版本（如 3.3 / 3.4），并要求「不确定就说不知道」；关键接口再去 API 或 CodingMCP 核对。



## 三、AIGC 创作 

AIGC（AI Generated Content）指用模型生成文本、图像、音频、视频、代码等内容。对互动产品开发者而言，价值主要在：**加速原型与素材草稿**，而不是一次生成可上线的完整商业资源。

### 3.1 通用大模型里的创作能力

ChatGPT、Gemini、Claude、豆包、通义、混元、文心等，普遍已支持：

- 文案、策划案、提示词、关卡说明等**文本**；  
- 不同程度的**文生图**（质量与可控性因产品而异）；  
- 部分支持读图、改图、简单视频草稿。

做概念图、UI 草图、宣传物料时，先用通用模型往往就够；要稳定风格与批量出图，再上垂直工具。

### 3.2 文生图 / 图生图

可用于背景、贴图灵感、2D 角色草稿、UI 参考等。多数仍需美术或你自己二次处理后再进引擎。

| 方向 | 代表产品 |
| --- | --- |
| 国际 | [Midjourney](https://www.midjourney.com/)、[Flux / 黑森林等](https://fal.ai/) 生态、各家 Chat 内置生图（ChatGPT、Gemini 等） |
| 国内 | [即梦 AI](https://jimeng.jianying.com/)、[腾讯混元图像](https://hunyuan.tencent.com/)、通义万相、以及豆包/文心等内置生图 |

使用建议：固定风格关键词与尺寸规范；导出后统一命名与目录，再导入 LayaAir（规范可参考 [美术路线](/guides/roadmap/artist/)）。

### 3.3 文生 3D

成熟度整体仍低于文生图，适合**原型、白模、占位资源**，正式项目多需 DCC 修模与重拓扑。

常见可体验产品：[Tripo 3D](https://www.tripo3d.ai/)、[Meshy](https://www.meshy.ai/)、[Luma Genie](https://lumalabs.ai/genie)、[Rodin](https://hyperhuman.deemos.com/) 等。导出格式优先选引擎友好的 glTF / FBX，并控制面数与材质复杂度。

### 3.4 文生音频

| 类型 | 代表 | 说明 |
| --- | --- | --- |
| 音效 / 语音 | [ElevenLabs](https://elevenlabs.io/) | 音效、配音类能力强，适合试玩与原型 |
| 配乐草稿 | Suno、Udio，以及开源方向如 Meta [AudioCraft / MusicGen](https://github.com/facebookresearch/audiocraft) | 快速出 BGM 灵感；商用需核对授权 |

进引擎前注意采样率、时长裁剪与循环点，避免直接把带版权不明的素材用于发行。

### 3.5 「文生游戏」要保持理性

通用模型一次性生成「可商业化完整游戏」仍不现实；更常见的是：生成玩法草案、Demo 级逻辑、或试玩广告级小样，再由人与引擎工具收束。

LayaAir 侧若希望更贴近引擎与原型生产，可关注 [LayaIdea](/basics/developmentenvironment/layaidea/)（IDE 内协同，而不是只靠网页聊天出一整款游戏）。



## 四、代码辅助与智能体开发环境

代码方向是提升工程效率最直接的一块。可以粗分为三层：**补全插件 → AI 原生编辑器 → 终端 / CLI Agent**。

### 4.1 IDE 插件（补全与轻量对话）

装在现有 VS Code / JetBrains 中，学习成本低。

| 地区 | 代表产品 | 说明 |
| --- | --- | --- |
| 国际 | [GitHub Copilot](https://github.com/features/copilot) | 覆盖面广；已具备更强的 Agent / 多文件编辑能力 |
| 国际 | Gemini Code Assist、Amazon Q、Tabnine 等 | 各有云厂商或隐私向定位 |
| 国内 | [通义灵码](https://lingma.aliyun.com/) | 阿里云生态与企业知识库场景常见 |
| 国内 | [CodeBuddy](https://www.codebuddy.cn/) | 腾讯云；插件 / IDE / CLI 多种形态 |
| 国内 | [文心快码 Comate](https://comate.baidu.com/) | 百度；工程化与中文场景 |
| 国内 | [CodeGeeX](https://codegeex.cn/) 等 | 智谱等厂商的编程助手 |

适合：不想换编辑器、先要「写代码时有补全」。

### 4.2 AI 原生编辑器（Agentic IDE）

以 AI 为中心重构交互：理解仓库、多文件修改、按自然语言推进任务。

| 地区 | 代表产品 | 说明 |
| --- | --- | --- |
| 国际 | [Cursor](https://cursor.com/) | 当前最主流的 AI IDE 之一；Agent、多文件编辑、MCP 支持完善 |
| 国际 | [Windsurf](https://windsurf.com/) 等 | Cursor 类替代，侧重大量 Agent 工作流 |
| 国内 | [Trae](https://www.trae.cn/) | 字节系 AI IDE；国内网络与中文模型体验友好 |
| 国内 | [CodeBuddy IDE](https://www.codebuddy.cn/ide/)、通义系 AI IDE 等 | 大厂在「插件之外」补齐的独立工作台 |

Cursor / Trae 等通常还能配置 **MCP**，从而接上 LayaAir 的 CodingMCP、IDE-MCP（见第五节）。

### 4.3 终端与 CLI Agent

不依赖图形界面，适合大范围重构、仓库级任务、与 CI/脚本结合。

- 国际常见：[Claude Code](https://claude.ai/)（Anthropic 的终端向 Agent）、各家 Coding CLI。  
- 国内：CodeBuddy Code 等 CLI 形态；亦可在开源 Agent（如 Cline 等）中自备 API Key。  
- LayaAir 工程自动化：[LayaAir CLI](/basics/developmentenvironment/cli/) + [layaair-skills](https://github.com/layabox/layaair-skills)。

### 4.4 使用原则（写引擎代码时尤其重要）

1. **版本写清楚**：提示词里带上 LayaAir 与 TypeScript 版本。  
2. **小步提交**：一次只让 AI 改一个可验证目标，便于回滚。  
3. **人验收**：编译通过、预览跑通、关键逻辑人工过目。  
4. **降幻觉**：配置 CodingMCP，或粘贴官方 API / 源码片段再让模型改。



## 五、MCP：让模型连上真实工具与引擎

**MCP（Model Context Protocol）** 是开放的「模型 ↔ 外部工具/数据」协议，常被比作 AI 的统一接口。编辑器或 Agent 通过 MCP 读取文档、操作 IDE、跑命令，而不是只靠参数里的静态记忆。

对 LayaAir 开发者，优先关心这几条链路：

| 能力 | 文档 |
| --- | --- |
| 按引擎版本查 API、减幻觉 | [CodingMCP](/basics/developmentenvironment/codingmcp/) |
| 让 AI 操作 IDE（节点、组件、预制体等） | [IDE-MCP / LayaAir MCP 开发指南](/basics/developmentenvironment/ide-mcp/) |
| 无 GUI 创建 / 构建 / 校验 | [LayaAir CLI](/basics/developmentenvironment/cli/) |
| IDE 内一体化助手 | [LayaIdea](/basics/developmentenvironment/layaidea/) |

资源商店中的 MCP 相关插件入口示例：https://store.layaair.com/info.php?id=10394  

:::note
部分产品还支持 **Skills**（技能包）等扩展形态，用于固化「怎么正确调用某套 CLI/工作流」。LayaAir CLI 的 Skills 见 [layabox/layaair-skills](https://github.com/layabox/layaair-skills)。
:::



## 六、给 LayaAir 开发者的选型建议

| 你的情况 | 建议 |
| --- | --- |
| 只想先问问语法 / 报错 | 网页问答：国际 ChatGPT / Claude / Gemini；国内 DeepSeek / Kimi / 豆包 |
| 不想换编辑器 | GitHub Copilot，或通义灵码 / CodeBuddy / 文心快码插件 |
| 想要强 Agent、多文件改工程 | 国际 Cursor（或 Claude Code）；国内 Trae |
| 必须尽量减少引擎 API 幻觉 | **CodingMCP +（Cursor / Trae 等）**，并对照官方 API |
| 不会搭场景、想让 AI 点 IDE | IDE-MCP 或 LayaIdea |
| 要出图 / 音 / 3D 草稿 | 第三节垂直工具；入库规范跟美术流程走 |
| 系统学习整条 AI 链路 | 直接跟 [AI 开发路线](/guides/roadmap/ai/) |

:::caution[边界]
AI 是协作者，不是自动上线按钮。架构取舍、性能、平台兼容、账号与支付、正式美术规范，仍应由人负责验收。
:::
