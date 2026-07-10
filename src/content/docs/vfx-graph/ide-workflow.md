---
title: "IDE 操作流程 — 从零做出第一个 VFX"
description: "傻瓜式上手指引：从创建 vfx 资源、认识编辑器面板、理解 Event 到 Output 执行链路、加节点连线，到挂 VisualEffect 组件运行，十分钟做出第一个会动的粒子，并附新手自检与调试排查表。"
slug: "vfx-graph/ide-workflow"
---

> 本篇是**傻瓜式上手指引**：从创建资源、认识面板、加节点连线，到挂组件运行。跟着步骤走，10 分钟做出第一个会动的粒子。

> 前置：项目已开启 **WebGPU** 渲染后端（VFX 仅在 WebGPU 下运行）。

---

## 1. 创建一个 `.vfx` 资源

1. 在 IDE **项目资源** 面板中，定位到要存放的目录。
2. 右键 → **创建（新建）→ VFX Graph**，得到一个 `.vfx` 文件。
3. **双击** 该 `.vfx` 文件 → 打开 **「VFX Graph」编辑面板**。

> 保存 `.vfx` 时，编辑器会自动编译出运行时产物 `.lvfx` + 一组 `*.computeshader` 子资产，无需手动处理。

---

## 2. 认识 VFX Graph 面板

打开后，面板大致分为几个区域：

```
┌───────────────────────────────────────────────┬───────────────┐
│                                               │  节点属性栏    │
│              画布 (Canvas)                     │ (选中节点的    │
│   摆放 / 连接 Event · Context · Operator       │  参数面板)     │
│                                               │               │
│                                               │               │
├───────────────────────────────────────────────┤               │
│  属性 / Blackboard 面板                         │               │
│  (图级暴露属性 int/float/Color/Texture...)      │               │
└───────────────────────────────────────────────┴───────────────┘
```

- **画布**：放置和连接节点的主区域。
- **节点属性栏**（右）：选中某个节点时，显示它的全部参数（即「属性详解篇」讲的那些）。
- **属性 / Blackboard 面板**：管理图级暴露属性（运行时代码可读写）。
- **预览**：在 IDE 场景/预览中实时看到效果。

---

## 3. 执行链路：Event → Spawn → Initialize → Update → Output

一个 VFX 图由若干 **Context** 用 `flow`（流程线）串成一条数据流。理解这条链路是用好 VFX 的关键：

```
┌─────────┐      ┌──────────┐      ┌────────────┐      ┌────────┐      ┌──────────┐
│  Event  ├─────►│  Spawn   ├─────►│ Initialize ├─────►│ Update ├─────►│  Output  │
│ OnPlay  │trigger│ rate=10 │spawn │ pos/vel/.. │ flow │ /tick  │ flow │ Mesh/... │
└─────────┘      └──────────┘ Evt  └────────────┘      └────────┘      └──────────┘
                  每秒生成 N 个      诞生时一次性          每帧全部活粒子      每帧绘制
```

| 阶段 | 干什么 | 一句话 |
|---|---|---|
| **Event** | 触发入口 | 组件 `play()` 触发 `OnPlay`，启动整张图 |
| **Spawn** | 决定生成节奏 | 只管「何时生成多少个」，不管粒子长什么样 |
| **Initialize** | 诞生时一次性初始化 | 给新粒子设初始 位置/速度/颜色/大小/寿命 |
| **Update** | 每帧更新所有活粒子 | 力场/碰撞/湍流/Kill 等（不加 Block 也会自动积分位置+老化+死亡） |
| **Output** | 每帧绘制 | 用 Billboard/Mesh/Trail 等形态把活粒子画出来 |

> 每个 Context、Block 的**具体参数**见 [Context](/vfx-graph/context/) / [Block](/vfx-graph/block/)。

---

## 4. 加节点、连线的基本操作

### 4.1 添加 Event / Context / Operator

- 在画布**空白处右键** → 弹出**节点选择器**（顶部有搜索框，下面是按类别组织的树：Event / Context / Operator/<子类>）。
- 用搜索框输入名字（按英文名搜更直观，如 `Spawn`、`add`、`sampleCurve`），或展开分类树，选中即添加到画布。

### 4.2 添加 Block（粒子行为）

- Block 必须挂在某个 Context 里。在目标 Context 上点 **「+」**（添加 Block）→ 弹出该 Context **兼容的 Block 菜单** → 选一个加进去。
- Block 在 Context 内**从上到下顺序执行**，可拖动调整顺序、可临时禁用。

### 4.3 连接 flow（纵向处理流）

- 从一个节点底部的 **flow 输出端口**拖到下一个节点顶部的 **flow 输入端口**。
- 标准顺序：`Event.evt → Spawn.OnStart`，`Spawn.spawnEvt → Initialize.input`，`Initialize.output → Update.input`，`Update.output → Output.input`。

### 4.4 连接 slot（横向表达式）

- 从一个 **Operator 的输出插槽**拖到 **Block/Operator 的输入插槽**，把算出来的值喂进去。
- 例：`getProperty("Speed")` 的输出连到 `Set Velocity` Block 的速度输入。

### 4.5 切换 Operator 数据类型

- 多态 Operator（如 `add` / `multiply` / `normalize`）节点上有**齿轮/箭头按钮**，点开可切换它处理的数据类型（float / vec2 / vec3 ...）。

---

## 5. 挂到场景里运行

`.vfx` 编好后，要通过 **Visual Effect 组件**挂到场景节点上才能播放：

1. 往 3D 场景拖一个 **`Sprite3D`**（空节点）。
2. 选中该节点 → **增加组件 → Rendering / Visual Effect**。组件会**自动连带创建 `VFXRenderer`**（实际负责绘制）。
3. 设置 `Visual Effect` 组件字段：
   - **Asset**：拖入你的 `.vfx` / `.lvfx` 资源。
   - **Initial Event**：默认 `OnPlay`（要和图里 Event 节点的事件名对得上才会启动）。
   - 其余字段见 [属性详解·图级与组件](/vfx-graph/graph-and-components/)。
4. 运行场景 → `VisualEffect` 自动开始模拟，`VFXRenderer` 把每个 Output 的粒子绘制出来。

> 组件字段、Blackboard 暴露属性、Properties Override 面板的细节，见 [图级与组件](/vfx-graph/graph-and-components/)。

---

## 6. 最小示例（从零跑通）

工程里的最小示例：`assets/resources/VfxGraph.vfx`（IDE 打开即可看到完整节点图）。

链路：

```
OnPlay
  │
  ▼
Spawn  (Loop: Infinite)
  └ Constant Rate (Rate = 10)          每秒生成 10 个
  │ spawnEvt
  ▼
Initialize (Space: Local, Capacity: 64)
  ├ Set Position  position = (0,0,0)
  └ Set Velocity  velocity = (0,5,0)    初速度向上
  │ output
  ▼
Update  (无自定义 Block)               默认: pos += vel·dt + 老化 + 死亡
  │ output
  ▼
Output Mesh  (Mesh = Sphere.lm, Blend = Alpha)   把活粒子画成小球
```

**效果**：组件 `play()` → 每秒冒出 10 个小球，向上飘，到寿命自动消失。

**新手三步自检**：
1. 粒子不出来 → 确认 WebGPU 开了 + `Initial Event` 名字对得上。
2. 粒子出来但不动 → 确认 Initialize 设了 velocity、Update 的 `Update Position` 勾着。
3. 数量不够 → Initialize 的 `Capacity` 调大（默认 64）。

---

## 7. 调试与排查

| 现象 | 排查 |
|---|---|
| 粒子完全不出来 | 1) 浏览器/设备是否开 WebGPU；2) `Initial Event` 是否对得上图里事件名 |
| 粒子能出但不动 | Initialize 是否设了 velocity；Update 的 `Update Position` 是否勾选 |
| 数量达不到预期 | Initialize 的 `Capacity` 太小（默认 64，密集场景调到几百~几千） |
| 改了节点设置没生效 | 部分 Settings 改动需重新编译/保存 `.vfx`；属性值改动一般实时生效 |
| `.vfx` 没生成 `.lvfx` 子资产 | dev 模式需安装本地工具链（KTX 工具等） |

---

## 下一步

➡️ 按需查阅属性详解：[Context](/vfx-graph/context/) · [Block](/vfx-graph/block/) · [图级与组件](/vfx-graph/graph-and-components/)
➡️ 用代码驱动 VFX：[代码篇](/vfx-graph/code/)
