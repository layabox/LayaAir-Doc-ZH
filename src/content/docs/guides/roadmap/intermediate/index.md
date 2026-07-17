---
title: "程序进阶路线"
description: "面向已能独立做 Demo 的开发者：围绕工程化、性能、渲染、资源与多端发布，把 LayaAir3 项目提升到可迭代、可上线的水平。"
slug: "guides/roadmap/intermediate"
---

这条路线面向你已经完成「程序新手路线」主线、能独立做出一个可运行 Demo 的阶段：接下来要把“能跑”提升到“**好做、好测、好发、好维护**”。本文不会重复基础 API，而是给出**进阶学习顺序**与**每个阶段的产出**，并链接到文档中对应的深入章节。

:::tip[适合谁]
- 你已经理解 `Stage / Scene / Node / Script` 这些核心概念，能写出基本玩法
- 你开始遇到“卡顿、内存上涨、加载慢、包体大、多端差异、发布流程复杂”等真实项目问题
- 你的目标从“做 Demo”变成“做一款能长期迭代并上线的产品”
:::

:::caution[不适合当作]
- 纯零基础入门路线 → 先走 [程序新手路线](/guides/roadmap/beginner/)
- Unity/Cocos 迁移对照手册 → 走 [Unity/Cocos迁移路线](/guides/roadmap/migration/)
:::


## 怎么学最有效

- **先建立工程“骨架”再补细节**：进阶的本质是把工作流固化成可复用的套路。
- **每一阶段都要有“可验证产出”**：例如性能指标、发布产物、可复现的调试流程。
- **遇到问题优先定位层次**：是脚本逻辑、资源、渲染后端、还是平台适配？（可参考[引擎架构概述](/basics/architecture/)）


## 学习地图（建议 4～8 周）

下面按“项目从开发到上线”的顺序组织。你不必一次性做完全部阶段，但建议至少完成前 4 个阶段，后续按项目需要选修。


## 阶段 0：先补一张架构地图（1～2 小时）

**目标**：知道引擎各模块大致分层、2D/3D 的边界、渲染驱动与平台适配在哪里，从而遇到问题能快速判断该查哪一类文档。

- **必读**
  - [LayaAir3引擎功能概述](/basics/)
  - [引擎架构概述](/basics/architecture/)
  - [引擎基础概念](/basics/common/basicconcepts/)

- **产出**
  - 能用自己的话讲清楚：`Laya.init → Stage → Scene.open → Node + Script → RenderPass → RenderDriver` 的主链路


## 阶段 1：工程化与开发流程固化（0.5～1 周）

**目标**：把项目结构、入口场景、脚本组织方式、调试方式固定下来，减少“越做越乱”。  

- **建议阅读**
  - [项目工程目录说明](/basics/ide/projecfolders/)
  - [项目启动入口说明](/basics/ide/entry/)
  - [实体组件系统（ECS）](/basics/common/component/)
  - [DevTools调试工具](/basics/devtools/)
  - [帧调试器面板](/basics/ide/framedebugger/)

- **产出（建议做完）**
  - 制定一套脚本组织规范：模块分层、命名、事件与生命周期使用约定
  - 形成一套可复现的调试流程：控制台日志、断点、帧调试器定位渲染/资源问题


## 阶段 2：资源加载与资源管理（0.5～1 周）

**目标**：解决“加载慢、卡顿、资源混乱、重复加载、内存上涨”等典型问题，建立稳定的资源工作流。

- **建议阅读**
  - [资源加载](/basics/common/loader/)
  - [场景管理](/basics/common/scene/)
  - [对象池](/basics/common/pool/)
  - [资源依赖面板](/basics/ide/assetdependency/)

- **产出**
  - 一个可复用的加载框架：启动加载、分场景加载、进度统计、失败重试/降级策略
  - 能解释并验证：哪些资源应常驻、哪些需要按需释放（并用工具观察内存变化）


## 阶段 3：性能优化（1～2 周，持续迭代）

**目标**：建立“可量化”的性能优化闭环：采样 → 定位 → 改动 → 验证，避免盲改。

- **建议阅读（先做必读再选读）**
  - 性能总览：[性能优化](/basics/performanceoptimization/)
  - 指标与面板：[Stat 性能面板](/basics/performanceoptimization/stat-panel/)
  - 渲染相关：[渲染性能优化](/basics/performanceoptimization/rendering/)
  - 内存相关：[内存优化](/basics/performanceoptimization/memory/)
  - 其它技巧：[其它优化](/basics/performanceoptimization/other/)
  - 分析方法：[Chrome Profiles](/basics/performanceoptimization/chrome-profiles/)

- **产出（建议写到项目文档里）**
  - 目标设备（低/中/高端）下的 FPS、内存、首屏时间基线
  - 2～3 个“收益最大”的优化点（例如 UI 合批、资源压缩、减少每帧分配等）与复测数据


## 阶段 4：渲染与图形能力进阶（选修，1～2 周）

**目标**：当你需要更强画面表现或更高性能时，知道该走哪条路：WebGPU、后处理、CommandBuffer、自定义 Shader 等。

- **3D 方向建议阅读**
  - [3D后处理](/3d/advanced/postprocessing/)
  - [CommandBuffer](/3d/advanced/commandbuffer/)
  - [自定义3D Shader](/3d/advanced/customshader/)
  - [3D渲染性能优化](/3d/advanced/performanceoptimization/)

- **2D 方向建议阅读**
  - [自定义2D着色器](/2d/advanced/customshader/)
  - 2D 特性入口可结合侧栏「2D开发基础」中粒子/拖尾/网格/灯光章节

- **WebGPU 方向**
  - [WebGPU 项目设置](/basics/ide/projectsettings/webgpu/)
  - [计算着色器（Compute Shader）](/basics/webgpu/computeshader/)

- **产出**
  - 一个可复用的渲染效果 Demo（后处理链/自定义 Shader/Compute），并明确适用平台与降级策略


## 阶段 5：物理、导航、联机等系统化能力（按项目需要）

**目标**：把“玩法系统”做成可复用模块，并理解它们与 ECS/资源/渲染的关系。

- **物理**
  - 2D：侧栏「物理引擎 → 2D物理系统」
  - 3D：侧栏「物理引擎 → 3D物理系统」
  - 需要扩展时可参考：[自定义物理引擎](/3d/advanced/customphysicsengine/)

- **导航寻路**
  - 侧栏「导航寻路」相关章节（NavMesh、Agent、障碍、链接等）

- **联机**
  - [多人联机游戏实战](/basics/common/network/multiplayergame/)

- **产出**
  - 把系统抽成“可配置组件 + 可复用脚本”，并能在 2～3 个关卡/场景复用


## 阶段 6：多端发布与自动化（1 周起，随后长期维护）

**目标**：让发布变成稳定流程，而不是“每次上线都靠手工试出来”。  

- **建议阅读**
  - Web 发布：侧栏「项目发布 → Web」
  - 小游戏发布：侧栏「项目发布 → 小游戏」
  - Native：侧栏「项目发布 → Native」
  - 命令行：侧栏「项目发布 → 命令行（CLI）」相关章节

- **产出**
  - 至少打通 2 个目标平台的发布闭环（例如 Web + 微信小游戏，或 Web + Android）
  - 一份发布检查清单：配置项、资源路径、性能/兼容性验证点


## 阶段 7：扩展能力与团队协作（选修）

**目标**：当项目规模变大或需要定制工作流时，学会用插件/工具链解决，而不是堆脚本。

- **建议方向**
  - IDE 插件与资源商店（扩展工作流、团队共用工具）
  - 蓝图（程序蓝图/着色器蓝图）用于可视化协作
  - 企业插件（如性能分析、Addressable 等）按团队需求选用


## 你现在应该从哪开始？

- 如果你刚做完第一个 Demo：从 **阶段 0 + 阶段 1** 开始，先把工程骨架稳住。  
- 如果你遇到加载/卡顿/内存问题：优先做 **阶段 2 + 阶段 3**。  
- 如果你追求画面与上限：进入 **阶段 4**，并配合 WebGPU/后处理/自定义 Shader。  

完成后，你会拥有一套“从开发到上线”的可复用方法论，而不只是零散的 API 记忆。
