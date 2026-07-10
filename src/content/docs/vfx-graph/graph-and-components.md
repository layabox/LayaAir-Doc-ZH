---
title: "属性详解 · 图级属性 / Blackboard / 组件"
description: "详解 VFX Graph 节点之外的参数：图级属性、Blackboard 暴露属性、场景里的 VisualEffect 与 VFXRenderer 组件字段，以及组件 Inspector 中 Properties 覆盖面板的分组、编辑与类型支持情况。"
slug: "vfx-graph/graph-and-components"
---

> 本篇覆盖节点之外的参数：**图级属性**（整张图的全局设置）、**Blackboard 暴露属性**（运行时可读写的变量）、场景里的 **VisualEffect / VFXRenderer 组件**字段，以及组件 Inspector 里的 **Properties Override 面板**。

---

## 1. 图级属性（Graph Settings）

在 VFX Graph 面板里**不选中任何节点**时，节点属性栏显示整张图的全局设置（对应一个名为 `VFX Graph` 的属性集）。

| 参数 (Caption) | 类型 | 默认 | 说明 |
|---|---|---|---|
| Fixed Delta Time (`fixedDeltaTime`) | bool | false | 是否用固定 dt 步进（不随帧率波动，模拟更稳定/可复现） |
| Exact Fixed Time (`exactFixedTime`) | bool | false | Fixed Delta 下是否严格不丢帧（精确累计时间） |
| Ignore Time Scale (`ignoreTimeScale`) | bool | false | 忽略全局时间缩放（游戏暂停 `timeScale=0` 时 VFX 仍播放） |
| PreWarm Total Time (`preWarmTotalTime`) | number | 0 | 预热总时长（秒）。让粒子在场景初始时就已存在「演过一段」的状态 |
| PreWarm Step Count (`preWarmStepCount`) | number | 0 | 预热步数（整数） |
| PreWarm Delta Time (`preWarmDeltaTime`) | number | 0 | 预热单步 dt。三者满足 `Total = Step × Delta` |
| Initial Event Name (`initialEventName`) | string | OnPlay | 启动时触发的事件名 |

> **PreWarm 典型用法**：让瀑布/烟雾在场景一加载就已经是「流动中」的状态，而不是从零开始慢慢生成。设 `Total Time = Step Count × Delta Time`（如 2 = 40 × 0.05）。

---

## 2. Blackboard 暴露属性（Property）

左下「属性 / Blackboard」面板里添加的图级变量，可在节点图里用 `getProperty` 取用，也可在**运行时用代码动态读写**（见 [代码篇](/vfx-graph/code/)）。

### 2.1 支持的属性类型

`number(float)` / `int` / `bool` / `vec2` / `vec3` / `vec4` / `color` / `Gradient` / `Curve` / `Texture2D` / `Mesh`。

### 2.2 Property Settings（每个属性的配置面板）

点开一个属性，可配置：

| 设置 (Caption) | 类型 | 默认 | 说明 | 显隐 |
|---|---|---|---|---|
| Exposed | bool | true | 是否对外暴露（暴露后运行时代码 / 组件 Inspector 可见可改） | |
| Group | string | "" | 分组名，用于组件 Inspector 的 Properties 面板折叠分组 | |
| Display Name | string | "" | Inspector 友好显示名（不填则用属性原名） | |
| Value (`default`) | 随类型 | 各类型默认 | 默认值（number/vec/color/Gradient 等各有对应编辑器） | |
| Tooltip | string | "" | 鼠标悬停提示 | |
| Mode | 枚举 | Default | Default（无约束）/ Range（限定 min~max） | 仅 number / int |
| Min / Max | number | 0 / 0 | 取值范围 | Mode=Range |

> `Group` / `Display Name` 直接决定组件 Inspector 里 Properties 面板的分组与显示名（见下文第 5 节）。

---

## 3. VisualEffect 组件（场景节点）

把 `.vfx`/`.lvfx` 挂到场景的桥梁。位于 **增加组件 → Rendering / Visual Effect**，会自动连带 `VFXRenderer`。

| 字段 (Caption) | 类型 | 默认 | 说明 |
|---|---|---|---|
| Asset (`asset`) | VFXAsset | — | 引用的 `.vfx` / `.lvfx` 资源 |
| Random Seed (`randomSeed`) | number | 0 | 随机种子。同种子 + 同时间序列可复现完全一致的随机粒子（仅 `Reset Seed On Play=false` 时生效） |
| Reset Seed On Play (`resetSeedOnPlay`) | bool | true | 每次 `play()` 是否重置随机种子 |
| Initial Event (`initialEvent`) | string | OnPlay | 初始触发的事件名（要和图里 Event 节点名对得上才会启动） |
| Properties (`propertyOverrides`) | — | — | 暴露属性的覆盖面板，见第 5 节 |

---

## 4. VFXRenderer 组件

实际负责绘制的渲染组件，由 VisualEffect 自动挂上（一般不手动添加）。它继承引擎通用渲染基类（BaseRender），含标准渲染字段：

| 字段 | 说明 |
|---|---|
| Receive Shadow | 是否接收阴影 |
| Cast Shadow | 是否投射阴影 |
| Scale In Lightmap | 光照贴图缩放 |
| Reflection Mode | 反射模式 |
| Lightmap Index / Scale Offset | 光照贴图索引与偏移 |
| Materials | 材质列表（VFX 一般由 Output 节点决定 shader，此处通常不手动设） |

> 这些是引擎通用渲染属性，VFX 场景下大多保持默认即可。

---

## 5. Properties Override 面板（组件 Inspector）

当 `Asset` 引用的 `.vfx` 在 Blackboard 里**暴露了属性**（`Exposed=true`）时，VisualEffect 组件 Inspector 会自动出现一个 **「Properties」分组**，列出这些暴露属性，允许**在不改 `.vfx` 的前提下，对单个场景实例覆盖属性值**。

### 使用方式

```
▼ MainVFX                          ← 按 Blackboard Group 分组，点组标题箭头可折叠/展开
  ☑ ColorOverLife    [▆▆渐变条▆▆ HDR]   ← Gradient 可编辑（点开渐变编辑器）
  ☑ SecondaryColor   [██纯色██  HDR]     ← Color 颜色拾取器
  ☑ RingMaskTexture  [🖼 uni_ring_thin]  ← Texture2D 资源选择器（可拖/选换图）
  ☑ GroundSpawnRate  [——●——— 64]        ← 有 Min/Max 区间 → 滑动条
  ☑ TrailsThinSpawnHeightMinMax [ X 0.5 ][ Y 1.5 ]
  ☐ Bounds           [ 0 ]               ← 未勾选时灰显，用 .vfx 默认值
```

- **勾选 checkbox** → 该属性被「覆盖」，编辑控件可交互，新值写入组件的 `propertyOverrides`。勾选状态对齐 Unity 的 `m_Overridden`（从 prefab 带出的覆盖标记）。
- **不勾选** → 编辑控件灰显，运行时使用 `.vfx` 的默认值。
- 按 Blackboard 的 **Group** 分组展示，组标题可**点击折叠/展开**。
- 编辑控件随面板宽度自适应，value 列与上方标准属性面板对齐。

### 各类型支持情况

| 类型 | 编辑方式 |
|---|---|
| float / int | 数值输入框；若 Blackboard 设了 **Min/Max 区间**（Unity `m_ValueFilter=Range`）→ **滑动条 + 数字框**（float 保留 1 位小数，对齐 Unity Inspector） |
| vec2 / vec3 / vec4 | 多个数值输入框横排 |
| color | **颜色拾取器**（ColorInput）；HDR 见下 |
| Gradient | **可编辑**（点开渐变编辑器改色标）；HDR 见下 |
| Texture2D | **资源选择器**（拖入或点选一张图，写 `res://uuid`） |
| Texture3D / Cube / Mesh 等 | 显示「暂不支持」 |

### HDR 颜色/渐变显示（对齐 Unity）

Unity VFX 的颜色/渐变常含 **HDR 值**（分量 >1，由「基色 × 2^曝光」得到）。面板按 Unity 的方式显示：

- **Gradient**：超亮分量 **clamp 截白**显示（对齐 Unity 渐变条爆白主视觉）。
- **Color**：按最大分量**归一化保留色相**显示（clamp 会变白丢色相，故单色用归一化）；并 `hideAlpha` 当不透明显示纯色。
- **HDR 标签**：任一分量 >1 时，在色条/色块中央叠一个灰色 **`HDR`** 字样（点击穿透，不挡编辑），与 Unity 一致。
- **编辑保留 HDR**：编辑器内部是 LDR 编辑，但**未改动的色标/颜色**在提交时会按位置匹配**还原完整 HDR 强度**，只有被你实际改过的项才落为 LDR。

> 运行时这些覆盖值在加载后自动通过 `setPropertyFloat/Vec*/Texture/Gradient` 应用；代码侧也可直接调用 API 改写（见 [代码篇](/vfx-graph/code/)）。

---

## 下一步

➡️ [代码篇](/vfx-graph/code/)：用代码控制 VFX（播放、属性读写、事件、回调）。
