---
title: "LayaAir3引擎功能概述"
description: "LayaAir3 引擎由引擎运行时、IDE 集成开发环境、全平台发布与 AI 工具链组成。本篇对大块功能做简要概述，帮助开发者建立整体认知。"
slug: "basics"
---


LayaAir3 是面向全平台发布的 2D/3D 引擎，覆盖游戏、教育、广告营销、数字孪生、元宇宙、AR/VR、工业可视化等场景。从产品结构上看，主要包括：**引擎运行时**、**IDE 集成开发环境**、**项目发布**，以及面向 AI 协同的 **MCP / CLI 工具链**。

本篇只做大块功能速览，细节请按侧栏进入对应专题文档，或查阅 [引擎 API](https://layaair.com/3.x/api/)。



## 一、引擎运行时

引擎底层支持开放式可编程渲染管线、次世代 PBR 渲染流、ClusterLighting 多光源、Forward+ 等渲染能力；图形后端覆盖 **WebGL / WebGPU**，以及 Native 侧的 **OpenGL ES、DirectX 12、Metal、Vulkan** 等现代图形 API。对开发者而言，可从通用能力、2D、3D 三块来理解。

### 1.1 渲染与图形基础

- 多后端渲染驱动（WebGL、WebGPU、OpenGLES、LayaX 原生图形桥接等）
- 可编程渲染管线与渲染路径（含 Forward+ 等）
- PBR / BlinnPhong / Unlit 等材质与光照模型
- ClusterLighting 多光源、阴影、反射探针、体积全局照明（Volumetric GI）
- 后处理（Bloom、景深、颜色分级、AO 等）与 CommandBuffer
- 计算着色器（Compute Shader，依赖 WebGPU 等能力）
- LOD / HLOD、静态合批等渲染优化组件

### 1.2 引擎通用能力

- **网络**：HTTP 请求、WebSocket
- **加载**：文本、JSON、XML、二进制、音频、视频、图集、模型、场景、Shader、骨骼/Spine 等资源加载与管理
- **ECS 组件系统**：组件、脚本生命周期、场景组件管理
- **场景与节点**：场景管理、节点树、激活/显隐、父子层级
- **事件与交互**：派发/侦听/捕获；鼠标、键盘、触摸、手柄/VR 输入
- **多媒体**：音频、视频播放
- **时间与动画基础**：定时器、缓动（Tween）
- **数学工具**：向量、矩阵、四元数、射线、插值、贝塞尔、随机数等
- **对象池**、常用工具类
- **浏览器 / 设备接口**：常用 browser 封装；陀螺仪、加速计、地理位置等
- **屏幕适配**与多分辨率策略
- **平台适配**：微信、抖音、支付宝、OPPO、vivo、小米、淘宝、华为、哔哩哔哩等小游戏/快应用运行时适配

### 1.3 2D 引擎

- **2D 显示对象**：Sprite 精灵与容器、Area2D 区域、基础绘图命令
- **2D 相机**：Camera2D 视口与跟随
- **2D 文本**：基础文本、HTML 富文本、BitmapFont 位图字体
- **2D 动画**：图集/逐帧动画、缓动动画、时间轴动画、龙骨动画、Spine 动画、Animator2D 状态机
- **经典 UI 系统**：Image、Button、Label、TextInput/TextArea、CheckBox、Radio、ComboBox、List/Tree、Panel、ScrollBar、Slider、ProgressBar、Tab、ViewStack、ColorPicker、Dialog 等
- **新 UI 系统（FairyGUI 同构）**：GWidget、GImage、GButton、GList、GTree、GPanel、控制器、关联、布局、滚动、选择、窗口与弹窗、国际化等
- **2D 渲染扩展**：2D 网格（Mesh2D）、2D 线段（Line2D）、2D 拖尾、2D 粒子、2D 材质与自定义 2D Shader、2D 后处理
- **2D 灯光与阴影**：方向光、精灵光、自由形态光、聚光灯、遮挡器
- **2D 物理**：Box2D（刚体、碰撞器与多种关节）
- **2D 寻路 / TileMap**：NavMesh2D、TileMap 图层与编辑器配套能力
- **UI 效果**：遮罩、滤镜等
- **2D/3D 混合**：2D 节点中嵌入 3D、开放数据域视图等

### 1.4 3D 引擎

- **3D 显示对象**：Sprite3D 节点与容器、3D 变换与坐标系
- **3D 场景环境**：环境光、环境反射、天空盒、雾效、光照贴图
- **3D 摄像机**：透视/正交、裁剪、渲染目标、摄像机动画
- **3D 光照**：方向光、点光、聚光、区域光、阴影
- **网格与渲染**：MeshFilter / MeshRenderer、像素线、拖尾、Spine3D 渲染
- **材质与纹理**：BlinnPhong、Unlit、PBR、glTF PBR、粒子/拖尾/天空材质；2D/3D 纹理、Cubemap、RenderTexture 等
- **粒子与特效**：3D 粒子系统、拖尾、VFX Graph（扩展能力）
- **3D 物理**：Bullet、PhysX；刚体、静态碰撞、角色控制器与多种约束
- **3D 动画**：骨骼动画、刚体/材质动画、时间轴、动画状态机、IK、动画烘焙
- **自定义 Shader** 与着色器蓝图
- **高级渲染**：反射探针、体积 GI、后处理、CommandBuffer、静态合批体积等
- **导航寻路**：NavMesh、Agent、障碍、链接与修改体积等
- **glTF / WebXR / 3D UI**



## 二、IDE（集成开发环境）

LayaAir3-IDE 提供可视化编辑、预览调试、资源管理与扩展生态。可按通用面板、2D、3D 理解。

### 2.1 通用模块

- 层级面板、项目资源面板、场景面板、预览运行面板
- 属性设置面板、控制台面板
- 时间轴动画面板、动画状态机面板
- 项目设置（运行配置、引擎模块、UI 系统、物理、WebGPU、启动页、统计、脚本编译、预览服务、预设值等）
- 资源依赖面板、帧调试器
- 面板布局与快捷键
- IDE 插件开发、资源商店
- 工程目录、启动入口、脚本组件与运行时脚本工作流

### 2.2 2D 模块

- 2D 场景交互与 UI 编辑器
- 2D 小部件（显示对象、经典 UI、新 UI、骨骼动画节点等）
- 2D 相机、2D 灯光、2D 粒子/拖尾/网格编辑
- TileMap / TileSet 编辑
- 2D 动画编辑（逐帧、时间轴、Animator2D）
- 2D 物理编辑
- 2D 预制体、场景继承类与 UI 运行时脚本

### 2.3 3D 模块

- 3D 场景编辑与环境设置
- 3D 摄像机、灯光与阴影配置
- 网格、材质、纹理与 Shader 资源编辑
- 3D 粒子、拖尾、动画（时间轴/状态机/烘焙）编辑
- 3D 物理编辑
- 着色器蓝图、程序蓝图
- 3D 预制体、3D UI、LOD 等组件配置

### 2.4 扩展与生态

- LayaPackage 插件包机制、插件导入与上架
- 官方/企业增值插件（如性能分析、Addressable 智能资源管理、CPU 粒子、Spine 烘焙、LOD 等）
- Unity / Cocos 资源导出插件，便于从其它工具链迁入



## 三、项目发布

一次开发，可面向 Web、小游戏、Native 多端发布。

### 3.1 Web 发布

- 标准 Web 发布：浏览器直接运行，也可作为 Native 打包的输入资源
- 单文件 / 特定 Web 渠道发布（如部分 HTML5 发行平台）

### 3.2 小游戏 / 快应用发布

提供各平台适配库与 IDE 快捷发布，常见目标包括：

- 微信小游戏、抖音（字节）小游戏、支付宝小游戏
- OPPO / vivo / 小米等厂商小游戏或快应用
- 淘宝小游戏、华为等其它已适配平台

### 3.3 Native 打包发布

支持一键或流水线发布为安装包 / 可执行程序，覆盖：

- **移动端**：Android、iOS、鸿蒙 NEXT（HarmonyOS）
- **桌面端**：Windows、macOS、Linux

Native 侧可对接现代图形 API，并提供本地存储、文件系统、网络、音频、WebView、热更新（如 DCC/Zip）、启动页与屏幕方向等配套能力。

### 3.4 命令行与自动化

支持通过 **CLI / 命令行构建** 接入 CI，实现构建、发布等流程自动化。



## 四、AI 与协同开发

LayaAir3 从引擎到 IDE 逐步打通 AI 工作流，便于用自然语言或 Agent 驱动开发：

- **IDE-MCP / Coding-MCP**：让 AI 理解并调度 IDE 与引擎相关工作流
- **[LayaAir CLI](/basics/developmentenvironment/cli/)**：脚本化创建、构建、发布与资源校验，便于 Agent 与 CI 自动化
- **LayaIdea / AIGC**：AI 辅助创作与开发环境能力
- **[layaair-skills](https://github.com/layabox/layaair-skills)**：提升 AI 对 CLI 命令与最佳实践的理解

更细的上手路径，可参考文档中的「AI 开发路线」与「AI 协同开发环境」相关章节。



## 五、如何继续阅读

建立整体印象后，建议按需求进入：

| 你想了解… | 建议入口 |
|---|---|
| 引擎历史与服务定位 | [引擎历史与服务](/services/) |
| 架构与模块关系 | [引擎架构概述](/basics/architecture/) |
| IDE 怎么用起来 | [IDE 主要模块概述](/basics/ide/gui/) |
| 核心编程概念 | [引擎核心功能](/basics/common/loader/)（加载/场景/节点/事件/ECS 等） |
| 2D / 3D 专题 | 侧栏「2D 开发基础」「3D 开发基础」 |
| 发布到各平台 | 侧栏「项目发布」相关章节 |
| API 细节 | [LayaAir3 引擎 API](https://layaair.com/3.x/api/) |
