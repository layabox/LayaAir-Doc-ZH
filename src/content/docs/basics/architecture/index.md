---
title: "引擎架构概述"
description: "从分层结构理解 LayaAir3：启动入口、场景节点、ECS、渲染驱动、资源加载与平台适配如何协作。"
slug: "basics/architecture"
---

《[LayaAir3引擎功能概述](/basics/)》回答「引擎能做什么」，本文回答「这些能力如何组织在一起」。目标是建立一张**模块地图**：知道代码/概念落在哪一层、彼此如何协作，再按需深入专题文档与 [API](https://layaair.com/3.x/api/)。



## 一、总体分层

LayaAir3 引擎运行时可粗略看成自上而下的几层（上层依赖下层，下层对上层提供稳定接口）：

```
应用与内容层
  场景 / 预制体 / 组件脚本 / UI / 蓝图逻辑
        ↓
引擎业务层
  节点树 · ECS · 2D/3D 显示与动画 · 物理 · 寻路 · 粒子 · UI 系统 …
        ↓
渲染抽象层（RenderDriver / RenderEngine）
  设备、缓冲、着色器、2D/3D RenderPass、渲染命令
        ↓
图形后端
  WebGL · WebGPU · OpenGL ES · LayaX（DX12 / Metal / Vulkan 等）
        ↓
平台适配层（PAL）
  浏览器 · 文件系统 · 存储 · 字体 · 输入 · 媒体 · 设备
        ↓
宿主环境
  浏览器 / 各小游戏运行时 / Native 容器
```

阅读时抓住两条主线即可：

1. **内容怎么组织**：舞台 → 场景 → 节点树 → 组件脚本。  
2. **画面怎么画出来**：节点/渲染器 → RenderPass → RenderDriver → 具体图形 API。



## 二、启动流程与全局入口

### 2.1 `Laya` 全局入口

`Laya` 是引擎的全局引用入口，常用单例包括：

| 全局对象 | 职责 |
|---|---|
| `Laya.stage` | 舞台：显示列表根、屏幕适配与主交互区域 |
| `Laya.timer` | 游戏主时钟（场景、动画、缓动等） |
| `Laya.loader` | 资源加载管理器 |
| `Laya.systemTimer` / `Laya.physicsTimer` | 系统时钟、物理时钟（引擎内部/物理子系统使用） |

业务代码通常从 `Laya.init` 开始，初始化完成后再 `Scene.open` 打开入口场景。

### 2.2 初始化大致顺序

`Laya.init`（可传设计宽高或舞台配置）内部按依赖顺序推进，核心步骤可概括为：

1. 创建 `timer` / `loader` 等全局服务  
2. 初始化 **PAL** 平台适配器  
3. 创建主画布 / 离屏画布，启动浏览器（宿主）适配  
4. 通过 `RenderDeviceFactory` **创建渲染引擎实例**（选定图形后端）  
5. 初始化 2D 渲染与 **Stage**（设计分辨率、缩放/对齐/背景等）  
6. 若存在 3D 模块，执行 `Laya3D` 初始化（材质、Shader、物理创建器等）  
7. 执行注册的 init / afterInit 回调  

因此：**先有平台与渲染设备，再有舞台与场景；3D 是在 2D 运行时骨架之上挂接的模块。**



## 三、场景与节点体系

### 3.1 舞台（Stage）

- 舞台挂在画布之上，是引擎实际绘制与命中测试的可视根。  
- 设计宽高、缩放模式、对齐方式等在此生效（详见[屏幕适配](/basics/common/adaptscreen/)）。  
- 打开的 2D 场景会挂到舞台；若场景含 3D，对应的 `Scene3D` 也会加入舞台显示列表。

概念上的「画布 / 舞台 / 显示列表」说明见[引擎基础概念](/basics/common/basicconcepts/)。

### 3.2 场景（Scene）

API 中的 `Scene`（继承自 `Sprite`）对应 IDE 里常见的 **Scene2D 根**：

- 负责场景的打开、加载、切换与销毁；从节点移除后**不会自动回收**，需显式 `destroy`（可用未销毁场景列表排查泄漏）。  
- 一个 `Scene` 可关联 `_scene3D`（`Scene3D`）：2D 与 3D 在同一场景资源里并存，但**节点树仍然分家**。  
- 场景上还有 2D 专项管理（如 `Scene2DSpecialManager`）、2D 全局 Uniform、灯光管理等挂接点。

IDE 层级规则与本文一致：**2D 节点只能在 Scene2D 下，3D 节点只能在 Scene3D 下，二者不可互为父子**（见[层级面板](/basics/ide/hierarchy/)）。

### 3.3 节点继承关系（简化）

```
Node                 ← 可进显示列表、可挂组件
 ├─ Sprite           ← 2D 基础显示/容器（含 Scene、Text、Area2D …）
 └─ Sprite3D         ← 3D 基础显示/容器（Camera、MeshSprite3D、Light …）
```

- **实体**在工程上就是这些节点；逻辑通过挂在节点上的**组件脚本**扩展。  
- 2D 另有 `NodeRender2D` / `BaseRenderNode2D` 等，把灯光、网格、拖尾等 2D 渲染能力挂到节点渲染管线。  
- 3D 通过 `MeshFilter` / `MeshRenderer`、`BaseRender`、各类 Light / Camera 等组件参与 `Scene3D` 渲染。



## 四、ECS 与逻辑驱动

LayaAir 采用工程化的 ECS 思路（详见[实体组件系统](/basics/common/component/)）：

| 概念 | 在 LayaAir 中的落点 |
|---|---|
| Entity | `Node` 及其子类实例 |
| Component + System | 继承 `Component` / `Script` 的组件脚本（属性存数据，生命周期与事件方法跑逻辑） |
| 驱动 | `ComponentDriver` 等按节点激活状态调度 `onAwake` / `onEnable` / `onUpdate` … |

要点：

- **数据与表现**尽量落在节点与内置组件上；**玩法逻辑**写在自定义 `Script` 中。  
- 帧循环由 `Laya.timer` 驱动，物理可用独立 `physicsTimer`。  
- IDE 里用装饰器把属性暴露到属性面板，本质是同一套组件架构的可视化配置面。



## 五、渲染架构

### 5.1 为什么要有 RenderDriver

上层（Sprite / Scene3D / Material / Shader）不应直接绑死某一种图形 API。引擎用 **RenderDriver** 做后端无关的抽象：

```
业务渲染（2D Graphics / 3D Camera·RenderElement·CommandBuffer …）
        ↓
DriverDesign（设备、缓冲、Shader、2D/3D RenderPass 接口）
        ↓
具体 Driver 实现
  WebGLDriver · WebGPUDriver · OpenGLESDriver · LayaXDriver · …
```

- **DriverDesign**：约定 `IRenderEngine`、`IRenderDeviceFactory`、缓冲/纹理/Shader、ComputeShader、2D/3D Pass 等接口。  
- **RenderEngine**：跨后端的渲染基础类型（顶点/索引缓冲、混合/模板状态、Shader 数据结构等）。  
- **各 Driver**：实现同一套接口，并各自提供 `2DRenderPass` / `3DRenderPass`。

因此同一套场景与材质，可以在 WebGL、WebGPU 或 Native 现代图形 API 上切换运行（具体能力以当前平台与项目设置为准）。

### 5.2 2D 渲染路径（概念）

1. 节点树遍历 / 脏区与变换更新  
2. Graphics 命令、UI、粒子、Mesh2D、灯光等进入 2D 渲染处理（如 `Render2DProcessor`、Graphics 管线、RenderCMD2D）  
3. 经 2D RenderPass 提交到当前 RenderDriver  
4. 可选 2D 后处理（`PostProcess2D`）

### 5.3 3D 渲染路径（概念）

1. `Scene3D` 组织摄像机、灯光、可渲染对象与环境（天空、雾、反射等）  
2. `Camera` 构建视图，收集 `RenderElement`，可走阴影 Pass、深度 Pass、主绘制、后处理等  
3. 高级扩展：`CommandBuffer`、反射探针、Volumetric GI、自定义 Shader / 蓝图编译结果等  
4. 经 3D RenderPass 提交到同一套 RenderDriver

2D 与 3D 在 **Pass 与资源** 层共用设备抽象，在 **场景节点** 层保持分离，再通过 RenderTexture、Bridge3D、UI3D 等能力做混合显示。



## 六、资源与加载架构

```
磁盘 / 网络 / 包内资源
        ↓
Laya.loader（Loader）
        ↓
按类型分发的 Loader（Texture / Atlas / Hierarchy / Mesh / Material / Shader / Animation …）
        ↓
Resource 体系（Texture、Prefab/Hierarchy、Material、Mesh …）
        ↓
被节点、组件、渲染器引用
```

- 场景、预制体走 Hierarchy 加载，实例化后进入节点树。  
- 材质、Shader、网格等可被多处引用；生命周期与引用计数需结合资源管理与性能实践理解。  
- 模块通过 `ModuleDef` + `ClassUtils.regClass` 注册可序列化类型，保证 IDE 资源与运行时类型对得上。

专题入口：[资源加载](/basics/common/loader/)。



## 七、平台适配架构（PAL）

宿主差异（浏览器 DOM、微信 `wx`、Native 文件与输入等）收敛到 **PAL（Platform Adapter Libraries）**：

| 适配器 | 典型职责 |
|---|---|
| `browser` | 主画布创建、启动、与宿主窗口相关的能力 |
| `fs` | 文件系统 |
| `storage` | 本地存储 |
| `font` / `textInput` | 字体与文本输入 |
| `media` | 音视频 |
| `device` | 设备传感器等 |

`platforms/` 下按微信、抖音、支付宝、OPPO、vivo、小米、淘宝、华为、Native 等目录提供具体适配实现；上层网络、加载、输入、多媒体尽量只依赖 PAL 与引擎 API，从而做到「一次开发、多端发布」。



## 八、主要子系统如何挂接

不必一次记全 API，只需知道它们挂在哪一层：

| 子系统 | 挂接位置（概念） |
|---|---|
| 经典 UI / 新 UI（ui / ui2） | 2D 节点树，场景或预制体下 |
| 2D 灯光、TileMap、Spine、粒子、拖尾 | 2D 节点 + 对应渲染/管理器组件 |
| 3D 灯光、网格、动画、后处理、WebXR | `Scene3D` / `Sprite3D` 组件链 |
| 2D 物理 / 3D 物理 | 物理工厂接口 + 节点上的刚体/碰撞/约束组件；时钟可走 `physicsTimer` |
| 寻路（navigation） | 导航表面/代理等组件挂在 2D 或 3D 场景节点 |
| 网络（net） | 与显示树解耦的服务层，由脚本调用 |
| glTF / 部分桥接能力 | 资源加载 + 3D 节点实例化 |

IDE、发布、MCP/CLI 属于**工具链层**：编辑与构建产物最终仍落到上述运行时结构（场景、资源、平台包）。



## 九、一张心智图（建议记住）

```
Laya.init
   → PAL + RenderDevice + Stage
        → Scene.open
             → Scene（2D 根）[+ Scene3D]
                  → Node 树
                       → Component / Script（每帧与事件）
                       → 2D/3D Renderer
                            → RenderPass → RenderDriver → GPU
```

开发时自问三句，就能快速定位该查哪类文档：

1. **是节点/组件问题，还是纯逻辑服务？** → 场景节点 / ECS，或 Timer、Loader、Net  
2. **是 2D 还是 3D 显示列表？** → 不要跨树挂父子  
3. **是表现不对还是后端/平台差异？** → 材质与 Pass，或 WebGPU/Native/PAL 设置  



## 十、推荐阅读顺序

| 目的 | 文档 |
|---|---|
| 功能清单速览 | [LayaAir3引擎功能概述](/basics/) |
| 画布、舞台、节点、显示列表 | [引擎基础概念](/basics/common/basicconcepts/) |
| 场景与节点操作 | [场景管理](/basics/common/scene/) · [节点管理](/basics/common/node/) |
| 脚本与生命周期 | [实体组件系统（ECS）](/basics/common/component/) |
| 加载与资源 | [资源加载](/basics/common/loader/) |
| IDE 中的层级与场景 | [层级面板](/basics/ide/hierarchy/) · [IDE 主要模块概述](/basics/ide/gui/) |
| 图形后端与计算着色器 | [WebGPU 项目设置](/basics/ide/projectsettings/webgpu/) · [Compute Shader](/basics/webgpu/computeshader/) |
| 类与接口细节 | [LayaAir3 引擎 API](https://layaair.com/3.x/api/) |
