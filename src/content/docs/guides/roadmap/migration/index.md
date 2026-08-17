---
title: "Unity/Cocos迁移路线"
description: "面向从 Unity 或 Cocos Creator 转向 LayaAir3 的团队：差异对照、资源迁移、逻辑重写、验收发布的一站式迁移学习路径。"
slug: "guides/roadmap/migration"
---

这条路线面向已有 Unity 或 Cocos 项目经验、希望转向 LayaAir3 的开发者与团队。迁移不是“一键换引擎”，而是分三步：**理解差异 → 迁移资产 → 重写逻辑并验收**。

:::tip[适合谁]
- 熟悉 Unity 或 Cocos Creator，目标平台包含 Web / 小游戏 / Native
- 希望复用已有美术资产（模型、材质、动画、UI 等），在 LayaAir 中继续开发
- 能接受玩法与系统逻辑用 TypeScript 在 LayaAir 侧重写
:::

:::caution[不适合当作]
- 零基础入门 → 先走 [程序新手路线](/guides/roadmap/beginner/)
- LayaAir 2.x 老项目升级 → 请看 [2.x引擎项目升级说明](/basics/2-x-upgrade/)
:::



## 先选对迁移路径

| 来源 | 主要工具 | 迁移重点 |
|---|---|---|
| **Unity** | [Unity资源导出插件](/3d/advanced/unity/) | 3D 场景/预制体、网格、材质、动画、粒子；脚本逻辑需重写 |
| **Cocos Creator** | [Cocos资源导出插件](/basics/developmentenvironment/cocostolayaair/) | 扫描 Cocos `assets` 转 Laya 资源；部分组件需手动对齐 |

两条路径的**共同原则**：

1. **插件迁移的是资产，不是完整游戏逻辑**  
2. **坐标系、物理、Shader 可能有差异，必须做运行验收**  
3. **先迁一小块可运行场景，再扩大范围**



## 学习地图（建议 2～6 周）



## 阶段 0：差异认知与 IDE 对照（1～2 天）

**目标**：建立“Unity/Cocos 概念 → LayaAir 概念”的对照表，减少后续踩坑。

- **Unity 开发者必读**
  - [为Unity开发者准备的LayaAir3指南](/basics/unitytolayaair/)
  - [IDE主要模块概述](/basics/ide/gui/)
  - [引擎架构概述](/basics/architecture/)

- **Cocos 开发者建议先读**
  - [Cocos资源导出插件](/basics/developmentenvironment/cocostolayaair/)
  - [引擎基础概念](/basics/common/basicconcepts/)
  - [实体组件系统（ECS）](/basics/common/component/)

- **产出**
  - 一份团队对照笔记：Hierarchy/Scene、Prefab、Component、Script 在 LayaAir 中的对应关系
  - 明确语言差异：C# / Cocos TS → LayaAir **TypeScript** + `Laya.Script`



## 阶段 1：搭建 LayaAir 目标工程（0.5～1 天）

**目标**：创建干净的 LayaAir3 工程，配置好与源项目匹配的运行环境。

- **建议阅读**
  - [搭建基础开发环境](/basics/developmentenvironment/download/)
  - [创建新项目](/basics/ide/createnewproject/)
  - [项目工程目录说明](/basics/ide/projecfolders/)
  - [项目启动入口说明](/basics/ide/entry/)
  - [项目设置：运行配置](/basics/ide/projectsettings/runconfig/)
  - [项目设置：引擎模块](/basics/ide/projectsettings/enginemodule/)

- **产出**
  - 一个空白或最小模板工程，能稳定预览运行
  - 分辨率、横竖屏、2D/3D 模块勾选与源项目目标平台一致



## 阶段 2A：Unity 资产迁移（3～7 天）

**目标**：把 Unity 场景/预制体中的**美术与配置数据**导出到 LayaAir `assets` 目录，并在 IDE 中正确显示。

- **建议阅读顺序**
  1. [Unity资源导出插件](/3d/advanced/unity/)（总览）
  2. [安装与导出窗口](/unity-plugin/install/)
  3. [导出能力一览](/unity-plugin/)
  4. [整体导出流程](/unity-plugin/overview/)
  5. 按资源类型深入：
     - [网格导出](/unity-plugin/mesh/)
     - [材质与Shader导出](/unity-plugin/material-shader/)
     - [自定义Shader导出](/unity-plugin/custom-shader/)
     - [粒子系统导出](/unity-plugin/particle/)
     - [动画导出](/unity-plugin/animation/)
     - [2D精灵导出](/unity-plugin/sprite-2d/)
  6. [疑似问题清单](/unity-plugin/known-issues/)

- **关键动作**
  1. 在 Unity 安装导出插件，先导出**一个小场景**或**单个预制体**
  2. 将产物导入 LayaAir 工程 `assets` 对应目录
  3. 在 IDE 打开 `.ls` / `.lh`，检查节点树、材质、动画是否正常
  4. 对照 [Unity 导出插件 · 能力一览](/unity-plugin/) 了解支持边界

- **产出**
  - 一个“黄金样例场景”：迁移成功、可预览、问题已记录
  - 迁移问题清单：坐标、材质、粒子、动画等待人工处理项



## 阶段 2B：Cocos 资产迁移（2～5 天）

**目标**：将 Cocos Creator 工程 `assets` 中已支持类型转换到 LayaAir。

- **建议阅读**
  - [Cocos资源导出插件](/basics/developmentenvironment/cocostolayaair/)
  - [包管理器与资源包导入](/ide/layapackage/pluginimport/)

- **关键动作**
  1. 安装 Cocos 迁移插件到 LayaAir 工程
  2. 菜单 `迁移Cocos / 迁移Cocos项目资源`：选择源 `assets` 与目标 Laya 子目录
  3. 查看控制台警告，处理未注册扩展名与未映射组件
  4. 打开转换后的场景/预制体，逐项核对 UI、网格、灯光、物理、动画

- **已知局限（需人工处理）**
  - 仅转换 `Registry` 中注册的扩展名
  - 自定义 Effect、部分组件参数可能无一对一映射
  - 物理参数与运行效果可能与 Cocos 不完全一致

- **产出**
  - 转换报告：成功/警告/失败资源列表
  - 需手调组件与参数的跟踪表



## 阶段 3：逻辑重写与系统对接（1～2 周）

**目标**：在 LayaAir 中用 TypeScript 重写玩法逻辑，对接已迁移资产。

- **建议阅读**
  - [实体组件系统（ECS）](/basics/common/component/)
  - [组件装饰器说明](/ide/customcomponent/decorators/)
  - [资源加载](/basics/common/loader/)
  - [事件管理](/basics/common/event/)
  - [场景管理](/basics/common/scene/)

- **迁移策略**
  - **先数据后逻辑**：确认场景显示正确，再写 `Script`
  - **先主流程后边缘**：移动、碰撞、UI 交互优先；复杂系统后补
  - **对照原项目列功能表**：逐项在 LayaAir 实现并打勾

- **产出**
  - 核心玩法可在 LayaAir 中跑通（不要求全功能一次到位）
  - 脚本目录与组件命名规范，便于团队并行开发



## 阶段 4：差异修复与验收（持续）

**目标**：处理迁移后最常见的“看起来不对”问题，形成可重复的验收流程。

- **高频检查项**
  - **坐标系**：Unity 左手系 → LayaAir 右手系（相机/灯光可能有额外朝向补偿）
  - **材质与 Shader**：查表映射失败、HDR、自定义 Shader 需手动处理
  - **动画**：状态机、曲线绑定、2D/3D 分流是否正确
  - **粒子**：GPU/CPU 模式、Trails/Noise 等触发 CPU 路径
  - **物理**：刚体、碰撞体、约束参数需重新调
  - **UI**：Unity Canvas / Cocos UI 通常需按 LayaAir UI 体系重建或半重建

- **建议阅读**
  - Unity：[疑似问题清单](/unity-plugin/known-issues/)
  - 性能：[2D 性能优化](/2d/performanceoptimization/)与[3D 性能优化](/3d/advanced/performanceoptimization/)

- **产出**
  - 迁移验收 Checklist（显示、动画、物理、UI、性能各一项）
  - 问题回归库：现象 → 原因 → 修复方式



## 阶段 5：发布与平台适配（按目标平台）

**目标**：在目标平台（Web、微信小游戏、Android/iOS 等）验证迁移成果。

- **建议阅读**
  - [Web 发布](/released/web/)
  - [小游戏发布总览](/released/minigame/)
  - [Native 介绍](/released/native/layanative-introduction/)
  - 需要自动化时参考 [命令行构建](/released/commandline/)

- **产出**
  - 至少 1 个目标平台的可安装/可访问包
  - 平台差异记录（性能、包体、兼容性）



## Unity vs Cocos：阶段优先级建议

| 阶段 | Unity 团队 | Cocos 团队 |
|---|---|---|
| 0 差异认知 | [Unity转LayaAir差异说明](/basics/unitytolayaair/) | Cocos 插件说明 + ECS 文档 |
| 2 资产迁移 | Unity 导出插件全系列 | Cocos 迁移插件 + 手动补组件 |
| 3 逻辑重写 | C# → TS，重写 MonoBehaviour 逻辑 | Cocos 组件逻辑 → `Laya.Script` |
| 4 验收 | 重点：坐标、Shader、粒子、动画 | 重点：UI 映射、物理、Effect |



## 你现在应该从哪开始？

- **Unity 3D 项目，想先迁场景**：阶段 0 → 1 → **2A** → 3  
- **Cocos 项目，资源在 assets 里**：阶段 0 → 1 → **2B** → 3  
- **资产已迁完，玩法跑不起来**：直接进入 **阶段 3 + 4**  
- **要上线小游戏/Web**：完成核心玩法后做 **阶段 5**  

迁移成功的标志不是“文件都拷过来了”，而是**在目标平台上稳定运行、可迭代、可发布**。建议始终保留一个“黄金样例场景”作为回归基准。
