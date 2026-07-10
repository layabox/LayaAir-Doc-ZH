---
title: "属性详解 · Block（块 / 行为单元）"
description: "按类别详解 VFX Graph 全部 Block 行为单元的参数：Spawn、Attribute、Position、Velocity、Force、Collision、Kill、Orient、Output、GPUEvent 与自定义块，配置粒子行为时逐项查阅。"
slug: "vfx-graph/block"
---

> Block 是堆在 Context 里的「行为单元」，**唯一能写粒子属性的元素**，在 Context 内从上到下顺序执行。本篇按类别详解每个 Block 的参数。

> 表格列：**参数 (Caption)** · **类型** · **默认** · **取值/范围** · **说明**。带「显隐」列的表示该参数仅在特定条件显示。
> 多数 Block 含一个 **Composition（组合模式）** 高级项：`Overwrite`（覆盖）/`Add`（累加）/`Multiply`（相乘）/`Blend`（混合）—— 决定本 Block 的结果如何与已有属性值合并。
> 📷 标记处为后续补充截图/对比图占位。

---

## 目录

| 类别 | Block |
|---|---|
| [1. Spawn 生成](#1-spawn-生成) | Constant Rate / Single Burst / Periodic Burst / Spawn Over Distance / Variable Rate / Set SpawnEvent Attribute / Custom Spawner |
| [2. Attribute 属性](#2-attribute-属性) | Set Attribute / Set Attribute (Curve) / Set Attribute from Map / Calculate Mass From Volume / Increment Strip Index / Set Spawn Time |
| [3. Position 位置](#3-position-位置) | Set Position (Shape) / Position (Sequential) / Position (SDF) / Set Position (Mesh) / Set Position (Depth Buffer) / Tile-Warp Positions |
| [4. Velocity 速度](#4-velocity-速度) | New Direction / Random / Spherical / Along Velocity / Tangent / Speed |
| [5. Force 力场](#5-force-力场) | Gravity / Linear Drag / Turbulence / Force / Vector Field Force / Attractor / Conform To… / Vortex |
| [6. Collision 碰撞](#6-collision-碰撞) | Plane / Sphere / AABox / OrientedBox / Cone / Torus / SDF / Depth Buffer |
| [7. Kill 销毁](#7-kill-销毁) | Sphere / AABox / Plane / Cone / Torus / OrientedBox |
| [8. Orient 朝向](#8-orient-朝向) | Orient |
| [9. Output 输出](#9-output-输出) | Color over Life / Alpha over Life / Camera Fade / Flipbook Play / Screen Space Size / Connect Target / Subpixel AA |
| [10. GPUEvent](#10-gpuevent) | Trigger Event / Trigger Event on Shape Enter |
| [11. Custom / Static Mesh](#11-custom--static-mesh) | Custom GLSL Block / Set Static Mesh Attr |

---

## 1. Spawn 生成

> 仅用于 **Spawn** Context，决定生成节奏。

### Constant Rate（固定速率）
| 参数 | 类型 | 默认 | 说明 |
|---|---|---|---|
| Rate | number | 10 | 每秒生成的粒子数 |

### Single Burst（一次性爆发）
| 参数 | 类型 | 默认 | 说明 | 显隐 |
|---|---|---|---|---|
| Spawn Mode | 枚举 | Constant | Constant / Random | |
| Delay Mode | 枚举 | Constant | Constant / Random | |
| Count | number | 0 | 爆发数量（固定） | Spawn Mode=Constant |
| Count | vec2 | (0,10) | 爆发数量随机区间 | Spawn Mode=Random |
| Delay | number | 0 | 延迟多少秒后爆发 | Delay Mode=Constant |
| Delay | vec2 | (0,1) | 随机延迟区间 | Delay Mode=Random |

> 也可用插槽 `Count` / `Delay` 接 Operator 动态控制。

### Periodic Burst（周期爆发）
| 参数 | 类型 | 默认 | 说明 | 显隐 |
|---|---|---|---|---|
| Spawn Mode | 枚举 | Constant | Constant / Random | |
| Count | number | 10 | 每次爆发数量 | Spawn Mode=Constant |
| Count | vec2 | (5,15) | 数量随机区间 | Spawn Mode=Random |
| Delay Mode | 枚举 | Constant | Constant / Random | |
| Period | number | 1 | 每隔几秒爆发一次 | Delay Mode=Constant |
| Period | vec2 | (0.5,2) | 周期随机区间 | Delay Mode=Random |

### Spawn Over Distance（按移动距离生成）
| 参数 | 类型 | 默认 | 说明 |
|---|---|---|---|
| Distance | number | 1 | 发射器每移动这么远生成一个粒子（拖尾/足迹效果） |

### Variable Spawn Rate（可变速率）
| 参数 | 类型 | 默认 | 说明 |
|---|---|---|---|
| Rate | number | 10 | 速率（可用插槽 `Rate` 接 Operator 让速率随时间/属性变化） |

### Set SpawnEvent Attribute（设置生成事件属性）
给 SpawnEvent 附带数据（传给下游 Initialize 作为 Source 属性）。
| 参数 | 类型 | 默认 | 说明 |
|---|---|---|---|
| Attribute | 枚举 | position | 要设置的属性名 |
| Value / X / Y / Z / W | number | 0 | 标量或各分量值 |
| From Loop Index | bool | false | 用循环索引作为值 |
| Loop Index % N | number | 0 | 对循环索引取模（0=不取模） |

### Custom Spawner（自定义生成器）
| 参数 | 类型 | 默认 | 说明 |
|---|---|---|---|
| Callback Name | string | default | 回调名。代码里 `vfx.setCustomSpawnCallback(name, (state, dt)=>count)` 注册，返回本帧生成数。见 [代码篇](/vfx-graph/code/) |

---

## 2. Attribute 属性

### Set Attribute（设置属性）
直接给属性赋值（position / velocity / color / size / lifetime / ...）。可用插槽 `Value` 接 Operator。
| 参数 | 类型 | 默认 | 说明 | 显隐 |
|---|---|---|---|---|
| Attribute | 枚举 | position | 目标属性名（全部可写属性列表见 [Operator·getAttribute](/vfx-graph/operator/)） | |
| Source | 枚举 | Slot | Slot=用本块插槽/属性值；Source=用上游 SpawnEvent 附带的同名值 | |
| Composition | 枚举 | Overwrite | 组合模式 | |
| Random | 枚举 | Off | Off / Per Component（各分量独立随机）/ Uniform（统一随机） | Source=Slot |

#### 🧩 详解 · Composition（组合模式）

几乎所有写属性的 Block 都有 `Composition`，决定本块算出的值**如何与已有属性值合并**（属性在 Context 内从上到下被前面的块一路改过来）：

| 模式 | 行为 | 典型用途 |
|---|---|---|
| `Overwrite` | 直接覆盖 `attr = value` | 设初值 |
| `Add` | 累加 `attr += value` | 叠加偏移/速度/力 |
| `Multiply` | 相乘 `attr *= value` | 缩放（size、alpha 衰减） |
| `Blend` | 按权重 `attr = mix(attr, value, blend)` | 半量混入 |

⚠️ **`Multiply` 放进 Update 会逐帧累乘 → 指数衰减**：Update 每帧执行，`attr *= 0.9` 这种会一帧比一帧小，几帧后 size/alpha 趋近 0、脉冲效果直接消失。「随寿命缩放」应放在 **Initialize 设一次**，或改用 [Set Attribute (Curve)](#2-attribute-属性) 的 OverLife（曲线本身就是按归一寿命取值，不累积）。

⚠️ **Overwrite 写 color 会连 alpha 一起冲掉**：若 Initialize 已设了较低的 init alpha，后面再用 `Set Attribute(color, Overwrite)` 写一个 alpha=1 的颜色，会把 alpha 顶回 1 → Additive 下整屏过曝发白。解决：让写 color 的块**只写 RGB 通道**（见下 Random 旁的 channels），或确保 alpha 链顺序正确。

#### 🎲 详解 · Random（随机）

`Random≠Off` 时，本块的值变成一个 **[A, B] 区间**（面板会多出 B 这一组输入），每个粒子取 `mix(A, B, rand)`：

- `Per Component`：每个分量（x/y/z）**各自独立**取随机 → 方向/颜色更杂乱。
- `Uniform`：三个分量**共用同一个**随机数 → 等比缩放、保持比例（如统一变亮/变大）。

⚠️ 随机只在**该粒子诞生时 roll 一次并固定**（除非放在 Update 且每帧 re-roll）。想要「每粒子一个固定随机值」用 Initialize；放 Update 会逐帧抖动。

> 写 **vec 属性的部分分量**：高级里可选 channels（只写 X / XY / Z…），未选中的分量保持原值。注意 channels 是「选哪些分量」而非位运算输入。

### Set Attribute (Curve)（曲线/渐变设属性）
用曲线（或颜色用渐变）按某个 t 采样作为属性值。
| 参数 | 类型 | 默认 | 说明 | 显隐 |
|---|---|---|---|---|
| Attribute | 枚举 | size | 目标属性 | |
| Curve | 曲线 | 线性 0→1 | 采样曲线 | Attribute≠color |
| Gradient | 渐变 | 白→透明 | 颜色渐变（attribute=color 时用渐变编辑器） | Attribute=color |
| Sample Mode | 枚举 | OverLife | OverLife（按归一寿命）/ BySpeed（按速度）/ Random / RandomConstantPerParticle / Custom | |
| Composition | 枚举 | Overwrite | 组合模式 | |
| Custom T | number | 0 | 自定义采样位置 | Sample Mode=Custom |
| Min/Max Speed | number | 0 / 1 | 速度映射区间 | Sample Mode=BySpeed |

### Set Attribute from Map（纹理采样设属性）
| 参数 | 类型 | 默认 | 说明 | 显隐 |
|---|---|---|---|---|
| Attribute | 枚举 | color | 目标属性 | |
| Composition | 枚举 | Overwrite | 组合模式 | |
| Sample Mode | 枚举 | RandomConstantPerParticle | Random / Sequential / Sample2DLOD | |
| Texture | Texture2D | — | 采样纹理 | |
| UV | vec2 | (0,0) | 采样 UV | Sample Mode=Sample2DLOD |
| LOD | number | 0 | mip 级别 | Sample Mode=Sample2DLOD |

### Calculate Mass From Volume（按体积算质量）
| 参数 | 类型 | 默认 | 说明 |
|---|---|---|---|
| Shape | 枚举 | Box | Box / Sphere / Cylinder / Cone（各有体积公式，按 size 算体积 × 密度 = 质量） |
| Density | number | 1 | 密度 |
| Composition | 枚举 | Overwrite | Overwrite / Add / Multiply |

### Increment Strip Index / Set Spawn Time
| Block | 参数 | 说明 |
|---|---|---|
| Increment Strip Index | Step (number, 1) | strip 索引步进（多 strip 分配） |
| Set Spawn Time | （无参数） | 记录粒子生成时刻 |

---

## 3. Position 位置

### Set Position (Shape)（形状内/表面布点）— 核心 Block
在球/盒/锥/环/圆/线/平面上随机或自定义生成位置。是最常用的位置 Block。
| 参数 | 类型 | 默认 | 说明 | 显隐 |
|---|---|---|---|---|
| Shape | 枚举 | Sphere | Sphere / Box / Cone / Torus / Circle / Line / Plane | |
| Position Mode | 枚举 | Volume | Surface（表面）/ Volume（体内）/ Thickness Absolute / Thickness Relative | |
| Thickness | number | 0.1 | 壳层厚度 | Position Mode=Thickness* |
| Height Mode | 枚举 | Volume | Volume / Base | Shape=Cone |
| Spawn Mode | 枚举 | Random | Random / Custom（用序列器精确控制角度/高度） | Shape≠Box |
| Height/Arc/Line Sequencer | number | — | Custom 模式下的归一序列位置（也可用同名插槽接 Operator） | Spawn Mode=Custom + 对应 Shape |
| Arc Sphere / Oriented Box / Arc Cone / Arc Torus / Arc Circle / Line | 复合 | — | 各形状的几何参数（含 transform/半径/弧度等），按所选 Shape 显示对应一个 | 按 Shape |
| Plane Center / Normal / Size | position/direction/vec2 | (0,0,0)/(0,1,0)/(2,2) | 平面位置/法线/2D 尺寸 | Shape=Plane |

> 高级（默认隐藏）：`Apply Orientation`、`Position/Direction/Axes Composition` 控制是否同时写方向/朝向轴及其组合方式。

#### 📐 详解 · Position Mode / Spawn Mode

- **`Position Mode`（点布在哪）**
  - `Volume`：在形状**体内**均匀随机（实心球/盒内）。
  - `Surface`：只在**表面**（空心壳）。
  - `Thickness Absolute / Relative`：在「表面向内 `Thickness` 厚」的壳层里（Absolute=世界单位，Relative=按半径比例）。做「环 / 壳」效果用它。
- **`Spawn Mode`（随机还是有序）**
  - `Random`：形状内随机撒点。
  - `Custom`：用 **Sequencer**（Height/Arc/Line Sequencer，0~1 归一）**精确控制每个粒子的角度/高度** —— 配合 `particleIndex/count` 这类 Operator 接到 Sequencer 插槽，就能让粒子沿弧/螺旋精确排布（不是乱撒）。

⚠️ **半径/弧度被 Operator 驱动时容易「塌成内联常量」**：当形状的 `Radius`/`Arc` 等子参数接了 Operator（如让半径随属性变化），若转换/编译链没正确读到上游算子、只读了 slot 的内联默认值，就会塌成一个固定常量 → **本该散开的盘/环变成规则细环、或半径恒定**。现象：形状「太规整、没有该有的随机散布」。排查时核对生成的 compute shader 里半径到底是常量还是变量。

🔗 各形状（Arc Sphere/Cone/Torus/Circle）的几何参数含 `transform`（位置/旋转/缩放）+ 半径 + `arc`（弧度，2π=整圈）。改 `arc` 可做「扇形/缺口环」。

### Position (Sequential)（序列布点）
按规则把粒子排成线/圆/三维阵列（非随机，索引决定位置）。
| 参数 | 类型 | 默认 | 说明 | 显隐 |
|---|---|---|---|---|
| Mode | 枚举 | Line | Line / Circle / ThreeDimensional | |
| Start / End | position | (-1,0,0)/(1,0,0) | 线段两端 | Mode=Line |
| Center | position | (0,0,0) | 中心 | Mode≠Line |
| Radius / Axis | number/vector | 1 / (0,1,0) | 圆半径/法线轴 | Mode=Circle |
| Count | number | 16 | 点数 | Mode≠ThreeDimensional |
| Origin / Step Size | vec3 | (0,0,0)/(1,1,1) | 阵列原点/步距 | Mode=ThreeDimensional |
| Count X / Y / Z | number | 16/1/1 | 三轴点数 | Mode=ThreeDimensional |

### Position (SDF)（SDF 表面/体内布点）
| 参数 | 类型 | 默认 | 说明 | 显隐 |
|---|---|---|---|---|
| SDF Texture | Texture3D | — | 符号距离场 3D 纹理 | |
| Center / Size | position/vec3 | (0,0,0)/(1,1,1) | 场在世界中的位置/尺寸 | |
| Position Mode | 枚举 | Surface | Surface / Volume | |
| Thickness | number | 0.1 | 体内厚度 | Position Mode=Volume |
| Projection Steps | number | 2 | 投影到表面的迭代次数（1~8） | |
| Composition | 枚举 | Overwrite | Overwrite / Add | |

### Set Position (Mesh)（网格采样布点）
| 参数 | 类型 | 默认 | 说明 |
|---|---|---|---|
| Mesh | Mesh | — | 采样的网格 |
| Sample Mode | 枚举 | Vertex | Vertex（顶点）/ Surface（表面面积加权）/ Volume（体内） |
| Point Count | number | 1024 | 烘焙点云数量 |
| Composition | 枚举 | Overwrite | Overwrite / Add |

#### 🗿 详解 · Set Position (Mesh)

把粒子布到一个网格的表面/顶点/体内，做「粒子组成雕像 / 物体溶解」等效果。引擎会先把 mesh **烘焙成一份点云**（`Point Count` 个点），运行时每个粒子从点云里取一个位置。

- **`Sample Mode`**
  - `Vertex`：直接用网格顶点（点数受顶点数限制，分布跟随建模疏密）。
  - `Surface`：在三角面上按**面积加权**随机采样（大面更多点，分布更均匀）。
  - `Volume`：在网格**体内**填充（需要封闭网格）。
- **`Point Count`** 越大点云越细，但烘焙与显存成本越高。

⚠️ **粒子全堆在原点 / 读到 (0,0,0) 多半是「异步烘焙时序」问题，不是绑定坏了**：点云烘焙是异步的，若 compute 在纹理还没就绪时就去采样，会读到全 0 → 粒子塌在原点。**同步生成的内置网格**（如 `builtin:Capsule`）立即就绪，能正常布点，可用来快速排除「是时序还是逻辑」。自定义 mesh 要确保烘焙完成后再采样。

⚠️ 别与 Output Mesh 混淆：这里是**用 mesh 当「布点形状」**（粒子还是各自独立的点/billboard），Output Mesh 才是「每个粒子画成一个 mesh」。

### Set Position (Depth Buffer) / Tile-Warp Positions
| Block | 参数 | 说明 |
|---|---|---|
| Set Position (Depth Buffer) | Surface Offset (number, 0.01) | 把粒子贴到屏幕深度表面（仅 Update） |
| Tile/Warp Positions | Center (position), Size (vec3, (10,10,10)) | 把超出盒范围的粒子环绕回另一侧（无限滚动场效果） |

---

## 4. Velocity 速度

> 一组「按方向×速度初始化/累加速度」的 Block，共享 **Speed Mode**（Constant/Random）+ **Speed / Min Speed / Max Speed** + **Composition** + **Blend Velocity**（Blend 模式下的混合权重）。下表只列各自的特有参数。

| Block | 特有参数 | 说明 |
|---|---|---|
| Velocity from Direction & Speed (New Direction) | Direction (direction, (0,1,0)), Blend Direction (0~1) | 沿指定方向给速度 |
| Velocity Random | （仅共享参数） | 随机方向给速度 |
| Velocity from Direction & Speed (Spherical) | Center (position), Blend Direction | 从中心向外辐射 |
| Velocity Along Velocity | （Composition 默认 Add） | 沿当前速度方向加速 |
| Velocity Tangent | Center (position), Axis (vector, (0,1,0)) | 绕轴切向速度（漩涡/公转） |
| Velocity from Direction & Speed (Speed) | （仅共享参数） | 用已有方向 × 速度 |

共享参数：Speed Mode（Constant→`Speed`；Random→`Min/Max Speed`）、Composition、Blend Velocity（Composition=Blend 时显示）。

---

## 5. Force 力场

> 仅用于 **Update**。施加在粒子速度上。

### Gravity / Linear Drag / Force
| Block | 参数 | 默认 | 说明 |
|---|---|---|---|
| Gravity | Force (vector) | (0,-9.81,0) | 重力（可用插槽 `Force`/`Force X/Y/Z` 动态接 Operator） |
| Linear Drag | Use Particle Size (bool) / Drag Coefficient (number) | false / 1 | 线性阻力；勾选后阻力随粒子尺寸 |
| Force | Mode (Absolute/Relative) / Force (vector) / Drag | Absolute / (0,0,0) / 1 | 恒定力（如风）。Relative 模式下 `Drag` 生效 |

### Turbulence（湍流）
| 参数 | 类型 | 默认 | 说明 |
|---|---|---|---|
| Noise Type | 枚举 | Perlin | Value / Perlin / Cellular |
| Mode | 枚举 | Absolute | Absolute / Relative |
| Intensity | number | 1 | 强度（可用插槽接 Operator 让强度随寿命变化） |
| Frequency | number | 1 | 噪声频率（越大越细碎） |
| Octaves | number | 3 | 叠加倍频数（1~8，越多越细节） |
| Roughness | number | 0.5 | 粗糙度（0~1） |
| Lacunarity | number | 2 | 倍频间频率倍增 |
| Drag | number | 1 | 阻力 | （Mode=Relative） |

#### 🌀 详解 · Turbulence（湍流噪声）

用程序噪声给粒子速度叠加随机扰动，做飘动、湍流、烟雾翻滚：

- **`Frequency`**：噪声采样频率，越大扰动越细碎（高频小尺度抖动），越小越大块缓慢飘动。
- **`Octaves`（倍频层数）**：把多层不同尺度的噪声叠加，层数越多细节越丰富（也越贵）。
- **`Roughness`**：高频层的权重；**`Lacunarity`**：层与层之间频率的倍增系数（默认 2 = 每层频率翻倍）。
- **`Intensity`**：整体强度，可接 Operator 让扰动随寿命增减。
- **`Mode`**：`Absolute`=力直接施加；`Relative`=带 `Drag`，速度向噪声场目标逼近。

⚠️ **轨迹/拖尾「乱线、甩飞、漂移失控」常见根因＝噪声的 range（输出区间）被忽略**：Unity 的 Noise 输出会按一个 `range`（vec2，如 [-1,1]）缩放（`value = fit/导数 × (range.y−range.x)`）。若实现只读了 `amplitude` 默认值 1 而忽略 range，噪声幅度会被放大成百上千倍 → 粒子被巨大扰动甩飞、trail 变乱线。表现为「加一点湍流就炸开」。这类问题用 GPU readback 看 velocity 量级即可确认。

### Vector Field Force（矢量场力）
| 参数 | 类型 | 默认 | 说明 |
|---|---|---|---|
| Vector Field (3D) | Texture3D | — | 矢量场 3D 纹理 |
| Mode | 枚举 | Absolute | Absolute / Relative |
| Intensity | number | 1 | 强度 |
| Field Center / Size | vec3 | (0,0,0)/(2,2,2) | 场的位置/尺寸 |
| Drag | number | 1 | 阻力（Relative 模式） |

### Attractor（引力吸引）— Sphere / AABox
共享：Attraction Speed (5) / Stick Distance (0.1) / Stick Force (10) / Center。
| Block | 特有参数 |
|---|---|
| Attractor (Sphere) | Radius (number, 1) |
| Attractor (AABox) | Size (vec3, (2,2,2)) |

### Conform To…（吸附到形状表面）— Sphere / AABox / OrientedBox / Cone / Shape(SDF)
共享：Attraction Speed (5) / Attraction Force (20) / Stick Distance (0.1) / Stick Force (50)。
| Block | 形状参数 |
|---|---|
| Conform to Sphere | Center, Radius |
| Conform to AABox | Center, Size |
| Conform to OrientedBox | Center, Euler Angles, Size |
| Conform to Cone | Apex, Axis, Height, Base Radius |
| Conform to Shape (SDF) | SDF Texture, Center, Size |

### Vortex（漩涡力场）
| 参数 | 类型 | 默认 | 说明 |
|---|---|---|---|
| Vortex Plane | plane | y 平面 | 漩涡所在平面（位置+法线） |
| Drag | number | 0 | 阻力 |
| Channel / Distance | 曲线 | — | 沿轴向（channel）力随到中心距离变化 |
| Gravity / Distance | 曲线 | — | 径向拉力随距离变化 |
| Vortex / Distance | 曲线 | — | 切向旋转力随距离变化 |

#### 🌪️ 详解 · Vortex（漩涡）

绕一个轴（`Vortex Plane` 的法线）把粒子卷成漩涡。它的力由**三条「按到轴距离」的曲线**叠加，分别控制三个正交方向的分量：

- **Vortex / Distance（切向）**：绕轴旋转的力 → 决定「转多快」，是漩涡的主体。
- **Gravity / Distance（径向）**：指向/背离轴心的拉力 → 正值吸向中心收紧，负值向外甩开。
- **Channel / Distance（轴向）**：沿轴方向的力 → 让漩涡同时上抽/下压（龙卷风的「往上卷」）。

每条曲线横轴是「粒子到漩涡轴的距离」，纵轴是该方向力的大小 —— 所以可以做「近轴转得快、远处几乎不动」这种真实漩涡。

⚠️ **切向方向是「轴 × 径向」的叉积（伪矢量）**，左右手坐标系不一致时旋转方向会反。如果漩涡转向跟参考反了，是切向叉积的符号问题，应在公式层翻号修正，**不要靠按粒子奇偶 hack 或别的 band-aid**。曲线要按真实采样取值，别只读图省算子（如漏掉 Normalize 会让力的模长错）。

---

## 6. Collision 碰撞

> 仅用于 **Update**。共享参数：**Mode**（Solid=实心，粒子从外面弹开 / Inverted=反转，粒子被关在内部）、**Bounce**（弹性 0~1）、**Friction**（摩擦）、**Lifetime Loss**（每次碰撞损失的寿命比例 0~1）。下表列各形状特有参数。

| Block | 形状参数 |
|---|---|
| Collide with Plane | Position (position), Normal (direction, (0,1,0)) |
| Collide with Sphere | Center, Radius |
| Collide with AABox | Center, Size |
| Collide with OrientedBox | Center, Euler Angles (deg), Size |
| Collide with Cone | Center, Base Radius, Top Radius, Height |
| Collide with Torus | Center, Major Radius, Minor Radius |
| Collision (SDF) | SDF Texture, Center, Size；Mode=Kill/Bounce；Surface Offset(radius) |
| Collision (Depth Buffer) | Mode=Kill/Bounce；Radius(0.05)；与屏幕深度表面碰撞 |

> SDF / Depth Buffer 的 Mode 是 `Kill`/`Bounce`（不是 Solid/Inverted）。Bounce 模式下才有 Bounce/Friction。

---

## 7. Kill 销毁

> 粒子进入（或离开）指定区域即死亡。可用于 Initialize / Update。共享 **Mode**（Solid=区域内杀 / Inverted=区域外杀；Plane 为 Above/Below）。

| Block | 形状参数 |
|---|---|
| Kill (Sphere) | Center, Radius |
| Kill (AABox) | Center, Size |
| Kill (Plane) | Plane Position, Plane Normal（Mode=Above/Below） |
| Kill (Cone) | Apex, Axis, Height, Base Radius |
| Kill (Torus) | Center, Major Radius, Minor Radius |
| Kill (OrientedBox) | Center, Euler Angles, Size |

---

## 8. Orient 朝向

> 仅用于 Output 类 Context。控制粒子面片/网格的朝向。

| 参数 | 类型 | 默认 | 说明 | 显隐 |
|---|---|---|---|---|
| Mode | 枚举 | Face Camera Plane | Face Camera Plane / Face Camera Position / Along Velocity / Fixed Axis / Look At Position / Look At Line / Advanced | |
| Up | vector | (0,1,0) | 固定上方向轴 | Mode=Fixed Axis |
| Position | position | (0,0,0) | 注视点 | Mode=Look At Position |
| Line | line | (0,0,0)-(0,1,0) | 注视线 | Mode=Look At Line |
| Axes | 枚举 | ZY | XY/XZ/YX/YZ/ZX/ZY 轴对 | Mode=Advanced |
| Primary / Secondary Axis | vector | (0,0,1)/(0,1,0) | 主/次朝向轴 | Mode=Advanced |

📷 各 Mode 朝向对比图。

#### 🧭 详解 · Orient（朝向模式）

控制 billboard 面片 / mesh 的朝向：

- **`Face Camera Plane`**（默认）：面片平行于相机平面（所有粒子同朝向，最常用，烟/光斑）。
- **`Face Camera Position`**：每个粒子各自朝向相机位置（球面分布时更自然，略贵）。
- **`Along Velocity`**：面片长轴对齐速度方向（拖尾火花、雨丝）。
- **`Fixed Axis`**：绕固定 `Up` 轴朝相机（草、火焰这类「立着但面向你」的）。
- **`Look At Position / Line`**：朝向某点/某条线。
- **`Advanced`**：手动指定 `Primary/Secondary Axis` + `Axes` 轴对，完全自定义两个朝向轴。

⚠️ **Mode 的枚举顺序在 Unity 端不是直觉顺序**：`Advanced / Fixed Axis / Along Velocity` 等的内部 enum 值有特定映射（转换时若按字面顺序会错位）。从 Unity 资产转过来时务必核对 enum 真值，否则朝向模式张冠李戴。

⚠️ **粒子 angle 手性 / mesh 朝向**：Unity 左手系 → Laya 右手系，angle、朝向轴可能需要翻号。但**翻号只走一条路径**：要么在转换器翻粒子 attribute，要么在 mesh 顶点翻，**不能两边都翻**（双重取反 = 没翻）。另：**有 orient 输出的 system 不要再对 angle 取反**（orient 已经定姿态，再翻 angle 会错）。z+180 这类 mesh 补偿**只对 mesh 输出加，billboard 不加**。

---

## 9. Output 输出

> 用于 Output 类 Context，控制渲染表现。

### Color over Life（生命周期颜色）
| 参数 | 类型 | 默认 | 说明 |
|---|---|---|---|
| Color A / Color B | color | 橙 / 蓝 | 起止两色 |
| Transition | number | 0.5 | A→B 过渡点（0~1） |
| Smoothness | number | 0.05 | 过渡平滑度（0~0.5） |
| Composition | 枚举 | Multiply | Overwrite / Multiply |

> 颜色想用多段渐变时，用 [Set Attribute (Curve)](#2-attribute-属性) 的 color+Gradient 模式。

#### 🌈 详解 · Color over Life

按归一寿命在 `Color A → Color B` 间过渡（`Transition` 是切换点、`Smoothness` 是过渡软硬）。只够两段；多段渐变改用 Set Attribute (Curve) 的 Gradient。

⚠️ **`Composition` 选 `Overwrite` 会把 alpha 一起冲掉**：颜色含 alpha 分量，Overwrite 写 A/B 两色（alpha 常为 1）会覆盖掉 Initialize 里设的低 alpha → **Additive 下整屏过曝、辉光糊满**。两种修法：① 用 `Multiply`（在原色基础上乘，保留原 alpha 趋势）；② 让这个块**只写 RGB 通道**不写 alpha（channels=RGB）。这也是「additive 效果莫名全屏发白」的高频根因之一。

⚠️ HDR：A/B 是 HDR 颜色（分量 >1）时走 HDR 直通烘焙；显示/编辑见 [HDR 小节](/vfx-graph/graph-and-components/#hdr-颜色渐变显示对齐-unity)。

### Alpha over Life（生命周期透明度）
| 参数 | 类型 | 默认 | 说明 |
|---|---|---|---|
| Fade In End | number | 0.0 | 淡入结束点（归一寿命） |
| Fade Out Start | number | 0.8 | 淡出开始点 |

### Camera Fade / Screen Space Size / Connect Target / Subpixel AA / Flipbook Play
| Block | 参数 | 说明 |
|---|---|---|
| Camera Fade | Near Fade Distance (0.5), Far Fade Distance (50) | 距相机太近/太远时淡出 |
| Screen Space Size | Reference Size (pixels, 10) | 让粒子保持固定屏幕像素大小（不随距离缩放） |
| Connect Target | Mode (Position/Direction), Target (position) | 把粒子拉伸连接到目标点（链状/光束） |
| Subpixel AA | （无参数） | 极小粒子的亚像素抗锯齿 |
| Flipbook Play | Mode (Constant/OverLife/BySpeed), Frame Rate (30), Frame Count (16) | 序列帧播放（配合 Output 的 UV Mode=Flipbook） |

---

## 10. GPUEvent

> 仅用于 **Update**，输出 `Evt` flow 连到 GPUEvent 节点，触发另一组粒子。

### Trigger Event（触发事件）
| 参数 | 类型 | 默认 | 说明 |
|---|---|---|---|
| Event Type | 枚举 | OnDie | OnDie（死亡时）/ Always（每帧）/ OverTime（按时间）/ OverDistance（按移动距离） |
| Param | number | 1 | OverTime=每秒次数 / OverDistance=每段距离 / OnDie/Always=触发个数 |

#### 🎆 详解 · Trigger Event（GPU 事件触发）

让一个粒子在特定时机「生出」另一组粒子（烟花炸开、火花拖尾再分裂、子弹命中溅射）。`Evt` flow 连到 GPUEvent 节点 → 下游另一套 Spawn/Initialize。

- **`OnDie`**：粒子死亡瞬间触发（烟花弹升顶后炸开）。
- **`Always`**：每帧触发（持续洒落）。
- **`OverTime`**：按时间，`Param`=每秒触发次数。
- **`OverDistance`**：按移动距离，`Param`=每移动一段距离触发一次（拖尾洒火星）。

⚠️ **`Event Type` 必须按 Unity 原字段转，别一律当 OnDie**：从 Unity 资产转过来时，若把 OverDistance/OverTime 都翻译成 OnDie，会让「持续洒落 / 按距离触发」的效果变成「只在死亡时来一发」。逐 system 核对真实 mode。

⚠️ **`OnDie` + 子粒子 `lifetime=0` 会瞬死**：引擎 Update 先递增 age 再 fire 事件，接收方读到的 source 寿命若为 0 → 子粒子当帧即死、看不到。子粒子要给 >0 的 lifetime。

🔗 下游怎么用 Source 属性（继承父粒子位置/速度/颜色）见 Spawn 类的 Set SpawnEvent Attribute + Initialize 的 `Source` 选项。

### Trigger Event on Shape Enter（进入形状触发）
| 参数 | 类型 | 默认 | 说明 | 显隐 |
|---|---|---|---|---|
| Shape | 枚举 | Sphere | Sphere / AABox | |
| Mode | 枚举 | Solid | Solid / Inverted | |
| Center | position | (0,0,0) | 形状中心 | |
| Radius | number | 1 | 球半径 | Shape=Sphere |
| Size | vec3 | (2,2,2) | 盒尺寸 | Shape=AABox |
| Event Type | 枚举 | OnDie | OnDie / Always | |
| Param | number | 1 | 触发个数 | |

---

## 11. Custom / Static Mesh

### Custom GLSL Block（自定义 GLSL）
| 参数 | 类型 | 默认 | 说明 |
|---|---|---|---|
| GLSL Code | string | 示例片段 | 直接写 GLSL 读写粒子属性，用 `$p` 引用粒子（如 `$p.position += vec3(0, sin($p.age*5.0)*0.1, 0);`）。可用于 Initialize/Update/Output |

### Set Static Mesh Attr（驱动静态网格属性）
> 仅用于 Output Static Mesh。把一个 graph 值绑到静态网格的 transform/color。
| 参数 | 类型 | 默认 | 说明 |
|---|---|---|---|
| Target | 枚举 | color | position / rotation / scale / color，配合插槽 `Value` 或 `vfx.setProperty*` 驱动 |

---

## 下一步

➡️ [属性详解·图级与组件](/vfx-graph/graph-and-components/)：图级属性、Blackboard、VisualEffect / VFXRenderer 组件、Properties 面板。
