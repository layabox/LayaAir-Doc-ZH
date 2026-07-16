---
title: "AI开发路线"
description: "面向希望用 AI 提升 LayaAir3 开发效率的开发者：从 AI 协同认知、CodingMCP 编码辅助、IDE-MCP 操控 IDE，到 LayaIdea 与 AIGC 内容生产的完整学习路径。"
slug: "guides/roadmap/ai"
---

这条路线面向希望在 LayaAir3 项目中引入 AI 的开发者与团队。目标不是“让 AI 替代你写完整游戏”，而是建立一套**可复用的 AI 协同工作流**：减少 API 幻觉、缩短 IDE 学习成本、加速原型与内容生产。

:::tip[适合谁]
- 已能使用 LayaAir3 做基础开发，希望用 AI 提升编码与搭建效率
- 团队希望降低“必须熟悉 LayaAir 才能上手”的招聘门槛
- 想用 AI 辅助生成资源、搭建场景、编写脚本，并愿意做结果验收
:::

:::caution[不适合当作]
- 纯编程入门路线 → 先走 [程序新手路线](/guides/roadmap/beginner/)
- Unity/Cocos 迁移对照 → 走 [Unity/Cocos迁移路线](/guides/roadmap/migration/)
:::



## AI 协同在 LayaAir3 中的能力层次

可以先按“能力层次”理解，再决定从哪一层开始：

| 层次 | 代表工具 | 主要解决什么 |
|---|---|---|
| **编码知识层** | [CodingMCP](/basics/developmentenvironment/codingmcp/) | AI 按指定引擎版本查 API/文档，减少代码幻觉 |
| **IDE 操作层** | [IDE-MCP](/basics/developmentenvironment/ide-mcp/) | AI 直接操控 IDE：建节点、挂组件、建预制体、运行调试 |
| **命令行自动化层** | [LayaAir CLI](/basics/developmentenvironment/cli/) | 脱离 GUI：创建/预览/构建/校验/跑脚本，适配 Agent 与 CI |
| **一体化协同层** | [LayaIdea](/basics/developmentenvironment/layaidea/) | IDE 内置 AI 助手，覆盖从问答到项目搭建的完整流程 |

更广泛的 AI 形态（问答、AIGC 创作、代码助手、Agent）可先阅读 [AI协同开发环境](/basics/developmentenvironment/aigc/)。



## 学习地图（建议 1～3 周）



## 阶段 0：建立 AI 协同认知（0.5 天）

**目标**：知道 LayaAir 生态里有哪些 AI 能力，避免“只用通用大模型硬写引擎代码”。

- **建议阅读**
  - [AI协同开发环境](/basics/developmentenvironment/aigc/)
  - [LayaAir3引擎功能概述](/basics/)（第四节 AI 与协同开发）
  - [如何阅读 LayaAir 的 API](/basics/developmentenvironment/api/)

- **产出**
  - 明确团队要用的 AI 形态：仅编码辅助 / IDE 操控 / 一体化 LayaIdea
  - 一份“AI 使用边界”约定：哪些任务可交给 AI，哪些必须人工验收



## 阶段 1：CodingMCP 编码辅助（1～2 天）

**目标**：让 AI 在写 TypeScript 时基于**真实 LayaAir 版本 API** 作答，而不是通用模型的猜测。

- **建议阅读**
  - [AI编码环境：CodingMCP](/basics/developmentenvironment/codingmcp/)

- **关键动作**
  1. 在 AI 控制台获取 API Key（IDE 菜单 `AI 服务 → CodingMCP 服务` 或 https://ai-console.layaair.com/）
  2. 在 Cursor 等编辑器中配置 MCP Server（`LAYA_VERSION` 与项目引擎版本一致）
  3. 配置 Cursor Rules，约束 AI 优先查 LayaAir 知识库

- **产出**
  - 能在对话中让 AI 生成可编译的 `Laya.Script` 示例
  - 能指定引擎版本查询 API 差异（如 `LAYA_PRE_VERSION` vs `LAYA_VERSION`）



## 阶段 2：IDE-MCP 操控 IDE（2～3 天）

**目标**：用自然语言驱动 IDE 完成“搭场景、挂组件、建预制体”等可视化操作，降低 IDE 学习曲线。

- **建议阅读**
  - [LayaAir MCP 开发指南](/basics/developmentenvironment/ide-mcp/)
  - [包管理器与资源包导入](/ide/layapackage/pluginimport/)

- **关键动作**
  1. 从资源商店订阅并导入 LayaAir-MCP 插件（新建项目需重复导入）
  2. 配置本地 MCP 端口与云端知识库 API_KEY
  3. 完成环境自动集成（Cursor / 其它 Agent 编辑器）
  4. 用简单任务验证：创建节点、添加物理组件、保存预制体

- **产出**
  - 一条可复现的“AI 驱动 IDE 操作”流程（从提问到场景变化可验证）
  - 团队共用的 MCP 配置模板（端口、版本号、Key 管理方式）



## 阶段 3：LayaAir CLI 命令行自动化（1～2 天）

**目标**：让 AI / CI 在不启动 IDE 图形界面的情况下完成创建、预览、构建、校验与脚本执行。

- **建议阅读**
  - [AI命令行工具：LayaAir CLI](/basics/developmentenvironment/cli/)
  - Skills：[layabox/layaair-skills](https://github.com/layabox/layaair-skills)

- **关键动作**
  1. 安装 CLI（Node.js 20+），确认 `layaair --version`
  2. 用模板创建试验项目，并执行 `build web` / `validate`
  3. 为 Agent 安装 `layaair-skills`，验证其能选择正确命令与参数

- **产出**
  - 一条可复现的「CLI 创建 → 校验 → 构建」流水线
  - 团队共用的 CLI 版本与项目 `.laya` 版本对齐约定



## 阶段 4：LayaIdea 一体化协同（3～5 天，选修）

**目标**：在 IDE 内使用 LayaIdea，把问答、编码、场景搭建收敛到同一工作区。

- **建议阅读**
  - [LayaIdea 使用说明](/basics/developmentenvironment/layaidea/)

- **关键动作**
  1. 安装 LayaIdea 插件并配置 API_KEY
  2. 在项目设置中检查 MCP Tools 连接状态（Ide-tools、Laya-ide-mcp-server、laya_mcp_server）
  3. 按项目勾选引擎模块（2D/3D 物理、粒子等）
  4. 用 LayaIdea 完成一个小功能闭环（例如：UI 页面 + 脚本逻辑 + 预览）

- **产出**
  - 一个由 LayaIdea 辅助完成的小模块（含场景、脚本、运行截图）
  - 记录哪些提示词/任务描述效果最好，形成团队 Prompt 库



## 阶段 5：AIGC 内容生产（按项目需要）

**目标**：用生成式 AI 加速美术与音频素材生产，并建立“生成 → 入库 → 引擎使用”的规范。

- **建议阅读**
  - [AI协同开发环境](/basics/developmentenvironment/aigc/) 第 2 节 AIGC 创作
  - 美术入库规范可参考 [美术路线](/guides/roadmap/artist/) 阶段 1

- **常见场景**
  - 文生图：背景、UI 草图、贴图灵感
  - 文生 3D：原型模型（需二次修整）
  - 文生音频：音效、配乐草稿

- **产出**
  - 一份 AIGC 资源规范：命名、尺寸、格式、是否需人工修图
  - 至少 1 组“AI 生成 → 导入 LayaAir → 场景验证”的样例



## 阶段 6：团队工作流与验收（持续）

**目标**：把 AI 协同变成稳定流程，而不是个人技巧。

- **建议实践**
  - **版本锁定**：MCP 的 `LAYA_VERSION` 与项目引擎版本、文档分支一致
  - **分层验收**：AI 生成代码 → 编译通过 → 运行预览 → 性能/兼容性检查
  - **分工清晰**：AI 搭场景与写样板代码；人负责架构、关键逻辑与上线验收
  - **知识沉淀**：把高频 Prompt、常见纠错写进团队 Wiki

- **产出**
  - 团队 AI 协同规范（工具链、Key 管理、验收清单）
  - 每周复盘：哪些任务 AI 省时最多，哪些仍需人工



## 推荐工具组合

| 你的场景 | 建议组合 |
|---|---|
| 只会写代码、不熟 IDE | CodingMCP + IDE-MCP |
| 希望 IDE 内一站式 | LayaIdea + 项目 MCP Tools 全连通 |
| Agent / CI 高频构建发布 | LayaAir CLI + layaair-skills |
| 独立开发者快速原型 | CodingMCP + CLI + Cursor Agent + 美术路线 AIGC 阶段 |
| 团队降本增效 | IDE-MCP（搭场景）+ CodingMCP（写逻辑）+ CLI（自动化） |



## 你现在应该从哪开始？

- 如果你主要卡在 **AI 写错 API**：先做 **阶段 0 + 阶段 1（CodingMCP）**  
- 如果你主要卡在 **不会用 IDE 搭场景**：优先 **阶段 2（IDE-MCP）**  
- 如果你要做 **自动化构建 / Agent 无 GUI 开发**：优先 **阶段 3（CLI）**  
- 如果你希望 **IDE 内全流程 AI**：进入 **阶段 4（LayaIdea）**  
- 如果你还要加速 **美术音频**：叠加 **阶段 5**，并对照 [美术路线](/guides/roadmap/artist/)  

把 AI 当作“带 LayaAir 知识的协作者”，而不是“自动写完整游戏的黑盒”，收益会最稳定。
