---
title: "属性详解 · Context（上下文）"
description: "逐一详解 VFX Graph 每个 Context 节点的属性参数：Spawn 生成节奏、Initialize 初始化、Update 每帧更新，以及 Billboard、Mesh、Trail、Distortion 等十种 Output 渲染形态的公共与专有参数。"
slug: "vfx-graph/context"
---

> 本篇详解每个 Context 节点属性面板里的**每一个参数**。Context 是生命周期阶段容器，用 flow 串成 `Event → Spawn → Initialize → Update → Output` 流水线。

> 表格列含义：**参数 (Caption)** = 面板显示名 · **类型** · **默认值** · **取值/范围** · **说明** · **显隐** = 何时显示该参数。
> 📷 标记处为后续 review 补充截图/对比图的占位。

---

## 处理流水线总览

| Context | 作用 | flow 输入 → 输出 |
|---|---|---|
| **Spawn** | 决定生成节奏（每秒/爆发多少个） | OnStart / OnStop → SpawnEvent |
| **Initialize** | 粒子诞生时一次性设初值 | Input → Output |
| **Update** | 每帧更新所有活粒子 | Input → Output |
| **Output\*** | 每帧把活粒子绘制出来（多种形态） | Input →（无输出） |
| **Output Event** | CPU 端接收粒子事件回调 | Event →（无输出） |

---

## 1. Spawn — 生成节奏

**作用**：只决定「何时生成多少粒子」，不关心粒子长什么样。通过 `SpawnEvent` flow 连到下游 Initialize。
**可加 Block**：Constant Rate / Single Burst / Periodic Burst / Variable Rate / Set Spawn Event Attribute（见 [Spawn 类](/vfx-graph/block/#1-spawn-生成)）。

| 参数 (Caption) | 类型 | 默认 | 取值/范围 | 说明 | 显隐 |
|---|---|---|---|---|---|
| Loop Duration (`durationMode`) | 枚举 | `Infinite` | Infinite / Constant / Random | 一次循环的时长模式。Infinite=不停循环 | 总显示 |
| Duration (`loopDuration`) | number | 1 | ≥0，步进 0.1 | 固定循环时长（秒） | 仅 durationMode=Constant |
| Duration (`loopDurationRange`) | vec2 | (1, 3) | ≥0 | 随机循环时长区间 [min, max] | 仅 durationMode=Random |
| Loop Count (`countMode`) | 枚举 | `Infinite` | Infinite / Constant / Random | 循环次数模式 | 总显示 |
| Count (`loopCount`) | number | 1 | ≥0，整数 | 固定循环次数 | 仅 countMode=Constant |
| Count (`loopCountRange`) | vec2 | (1, 3) | ≥0，整数 | 随机循环次数区间 | 仅 countMode=Random |
| Delay Before Loop (`delayBeforeLoop`) | bool | false | — | 是否在每次循环**前**插入间隔 | 总显示 |
| Delay After Loop (`delayAfterLoop`) | bool | false | — | 是否在每次循环**后**插入间隔 | 总显示 |

> 💡 SingleBurst（一次性爆发）效果：用 Single Burst Block + `Loop Count = Constant 1`。

#### 🔄 详解 · 循环机制（durationMode / countMode / delay）

Spawn 上下文按**循环（loop）**节奏运行：每个循环是一段时长，期间内部的 Spawn Block（Constant Rate / Burst）按各自规则发射粒子；一个循环结束后，若还没达到 `loopCount` 上限，就**重启**进入下一循环。**「循环何时重启」是用对 Burst 类效果的关键** —— 因为 Single Burst 是在「每个循环开始」时爆发一次。

- **`durationMode`（一个循环多长）**
  - `Infinite`（默认）：单个**永不重启**的无限循环（内部 `loopDuration = -1`）。适合持续型（火焰、烟雾的 Constant Rate）。
  - `Constant`：每循环固定 `loopDuration` 秒，到点重启。
  - `Random`：每循环时长在 `loopDurationRange [min,max]` 内随机。
- **`countMode`（循环几次后停）**：`Infinite` 永远循环；`Constant` 跑满 `loopCount` 次后**彻底停止**；`Random` 次数在区间内随机。
- **`delayBeforeLoop` / `delayAfterLoop`**：在每个循环前/后插一段**不发射**的空档，做「喷一阵→停一阵→再喷」的节奏。

⚠️ **陷阱 1 · Burst 在 Infinite 模式只触发一次**：`Infinite` 是永不重启的单循环，Single Burst 只会在 `t=0` 爆发**一次**，之后不再触发。要周期性爆发，改用 `durationMode=Constant` + `loopDuration`（每次重启都重新 burst），或换 **Periodic Burst** Block。

⚠️ **陷阱 2 · `loopDuration = 0` 不发射**：循环时长为 0 → 循环瞬间结束 → Spawn 来不及发射 → 整个效果**不出粒子**。`Constant` 模式务必给 >0 的时长。

⚠️ **陷阱 3 · `loopCount` 跑满后不再自动重播**：`countMode=Constant, loopCount=1` ＝「只播一次」。要重复播放需 `Infinite`，或代码侧 `vfx.play()` 重新触发（见 [代码篇](/vfx-graph/code/)）。

💡 **常见配方**
| 想要的效果 | 配置 |
|---|---|
| 持续火焰 / 烟雾 | `durationMode=Infinite` + Constant Rate Block |
| 一次性爆炸 | `durationMode=Constant`（小 `loopDuration`）+ `countMode=Constant loopCount=1` + Single Burst Block |
| 周期脉冲（每 2 秒喷一团） | `durationMode=Constant loopDuration=2` + Single Burst Block，或 Periodic Burst Block |

🔗 相关：[Spawn 类 Block](/vfx-graph/block/#1-spawn-生成)（Constant Rate / Single Burst / Periodic Burst 逐参数）。

---

## 2. Initialize — 诞生初始化

**作用**：新粒子诞生**当帧执行一次**，设置初始属性，结束后值被「烘」到粒子上（除非 Update 再改）。
**可加 Block**：Set Attribute / Set Position (Shape) / Position Sequential / Position SDF / 各 Velocity / Kill 等。

| 参数 (Caption) | 类型 | 默认 | 取值/范围 | 说明 | 显隐 |
|---|---|---|---|---|---|
| Space (`space`) | 空间 | `Local` | Local / World | Local=属性相对组件节点本地坐标；World=世界坐标 | 总显示 |
| Capacity (`capacity`) | number | 64 | ≥1，整数 | 粒子池容量。同时存在的活粒子数 ≤ 此值，超出的 spawn 被直接丢弃 | 总显示 |
| Bounds Mode (`boundsMode`) | 枚举 | `Automatic` | Automatic / Manual | 包围盒（视锥剔除用）。Automatic=引擎自动算 | 总显示 |
| Bounds Center (`boundsCenter`) | vec3 | (0,0,0) | — | 手动包围盒中心 | 仅 boundsMode=Manual |
| Bounds Size (`boundsSize`) | vec3 | (1,1,1) | — | 手动包围盒尺寸 | 仅 boundsMode=Manual |

> ⚠️ **Capacity 是硬上限**，并非「目标数量」。生成速率 × 寿命 > Capacity 时多出的会被丢弃。

#### 📦 详解 · Capacity（粒子池容量）

`Capacity` 决定该粒子系统的**预分配 GPU 缓冲大小** —— 引擎在初始化时按这个数一次性开好所有粒子的属性 buffer（position/velocity/color…），运行期不再扩容。它是**硬上限**，不是「想要多少个」。

- **稳态活粒子数 ≈ 生成速率 × 平均寿命**。例如 `Constant Rate = 100/s`、`lifetime = 2s` → 稳态约 200 个活粒子，所以 `Capacity` 至少要 ≥ 200，否则超出的 spawn 被直接丢弃。
- **容量耗尽的视觉症状**：粒子数「卡住」不再增长、新粒子稀疏或闪烁、爆发型效果「缺一截」。看到这种现象先调大 Capacity 复核。
- **不是越大越好**：Capacity 直接决定显存占用与每帧 compute 派发的线程数。设成远超实际需要的值会**白白吃显存和性能**。原则：按「稳态/峰值活粒子数」留 ~1.2 倍余量即可。
- Burst 型效果按**单次峰值**估：一次 burst N 个且寿命内不消失 → Capacity ≥ N（多次叠加的还要乘叠加层数）。

💡 估算口诀：**Constant Rate → `rate × lifetime`；Burst → `单次个数 × 同时存活的 burst 波数`**，再留点余量。

---

## 3. Update — 每帧更新

**作用**：对**所有活粒子**每帧执行。即使不加任何 Block，也有自带的隐式行为（位置积分 / 老化 / 死亡）。
**可加 Block**：各 Velocity / Force（gravity/drag/turbulence/attractor/vectorField/conform...）/ Collision / Kill / Trigger Event 等。

| 参数 (Caption) | 类型 | 默认 | 说明 |
|---|---|---|---|
| Update Position (`updatePosition`) | bool | true | 自动按速度积分位置：`position += velocity × dt` |
| Age Particles (`ageParticles`) | bool | true | 自动累加粒子 age |
| Reap Particles (`reapParticles`) | bool | true | 自动按 `age ≥ lifetime` 杀死粒子 |
| Skip Zero Delta Time (`skipZeroDeltaTime`) | bool | false | dt=0（暂停帧）时跳过更新 |

> 这 4 个是 Context 级开关（不是 Block）。一般保持默认全开。关掉 `Update Position` 可做「位置完全由 Block 控制」的特殊效果。

---

## 4. Output 系列 — 渲染

每个 Output Context 对应一个 draw call，把活粒子按选定几何形态绘制。下面先讲**公共参数**，再讲各形态的专有参数。

### 4.0 公共参数（多数 Output 都有）

| 参数 (Caption) | 类型 | 默认 | 取值/范围 | 说明 |
|---|---|---|---|---|
| Blend Mode (`blendMode`) | 枚举 | `Alpha` | Alpha / Additive / Premultiplied / Opaque | 混合模式。Additive=发光叠加（火/光），Alpha=常规半透明 |
| Use Alpha Clipping (`useAlphaClipping`) | bool | false | — | 开启像素 alpha 测试裁切（atlas 字符 / brush） |
| Alpha Threshold (`alphaThreshold`) | number | 0.5 | 0~1 | alpha 低于此值的像素被丢弃 | （仅开启 Alpha Clipping） |
| Soft Particle Fade (`softParticleFade`) | number | 0 | ≥0 | 与场景深度相交处柔化淡出的距离（眼空间），0=关闭 |
| UV Mode (`uvMode`) | 枚举 | `Default` | Default / Flipbook / FlipbookBlend | Default=单帧；Flipbook=序列帧硬切；FlipbookBlend=帧间平滑混合 |
| Flipbook Size (`flipbookSize`) | vec2 | (4, 4) | — | 序列帧图集的列数、行数 | （仅 UV Mode≠Default） |
| Camera Sort (`cameraSort`) | bool | false | — | 是否按距相机距离排序（半透明前后正确遮挡） |
| Frustum Culling (`frustumCull`) | bool | false | — | 视锥剔除（屏幕外不绘制） |

**可加 Block**（Output 通用）：Orient（朝向）/ Color over Life / Alpha over Life / Camera Fade / Flipbook Play / Screen Space Size / Connect Target。

#### 🎨 详解 · Blend Mode（混合模式）

决定粒子像素如何与已有画面混合，是「发光」还是「半透明」的根本开关：

| 模式 | 公式（简化） | 适合 |
|---|---|---|
| `Alpha` | `dst×(1-a) + src×a` | 常规半透明：烟、尘、贴图粒子 |
| `Additive` | `dst + src×a` | **发光叠加**：火、光、能量、火花（越叠越亮） |
| `Premultiplied` | `dst×(1-a) + src` | 颜色已预乘 alpha 的素材（部分序列帧） |
| `Opaque` | 直接覆盖 | 不透明粒子（实体碎片、mesh） |

⚠️ **Additive 全屏糊成实心白 / 椭圆，最常见根因＝场景相机没开 `enableHDR`**。Additive 把颜色不断相加，HDR 颜色（分量 >1）在非 HDR 管线下会被钳到 1 并迅速饱和成纯白。开启相机 HDR + 合适的后处理（tonemapping）才能正确显示发光层次。

⚠️ **Additive / Premultiplied 不参与深度排序也无所谓**（相加可交换），但 `Alpha` 半透明叠多层时前后顺序会错 → 需要 `Camera Sort`（见下）。

#### 🌫️ 详解 · Soft Particle Fade（软粒子）

`softParticleFade > 0` 时，粒子在**与场景已有几何相交处**按眼空间深度差**柔化淡出**，消除粒子面片硬插进地面/墙体的「硬边切割」感。值＝开始淡出的深度距离（眼空间单位），0=关闭。

⚠️ 依赖**相机深度纹理**：场景相机需提供 depth texture，否则软粒子无效果（拿不到场景深度无法比较）。

#### 🎞️ 详解 · UV Mode / Flipbook（序列帧动画）

把一张**图集（atlas）**按网格当作逐帧动画播放，做火焰跳动、爆炸、烟雾翻滚：

- `Default`：整张图当单帧贴图，不做序列帧。
- `Flipbook`：按 `flipbookSize`（列×行）切帧，**硬切**到下一帧。
- `FlipbookBlend`：相邻两帧**平滑混合**，动画更顺，但每像素采样两帧 → **约 2× 采样开销**。

帧的推进由 **Flipbook Play** Block（按 age 或自定义驱动 `texIndex`）控制。

⚠️ **`flipbookSize` 必须与图集实际行列数一致**，否则切帧错位（采样到半张帧/串帧）。
⚠️ 图集纹理的 **wrap/filter** 要正确：相邻帧间若用 `Repeat` + 双线性会在帧边缘渗色，序列帧图集通常应 `Clamp`。

---

### 4.1 Output Billboard — 朝向相机的面片（最常用）

**作用**：把粒子绘制成朝向相机的 quad，贴图特效（烟、火、闪光）首选。

| 专有参数 (Caption) | 类型 | 默认 | 取值 | 说明 |
|---|---|---|---|---|
| Primitive (`primitive`) | 枚举 | `Quad` | Quad / Triangle / Octagon | 面片形状。Quad=四边形(6顶点)；Triangle=三角形(3顶点)；Octagon=八边形(18顶点，裁角减 overdraw) |
| Crop Factor (`cropFactor`) | number | 0.146 | 0~0.5 | 八边形裁角因子，越大越接近圆 | 仅 Primitive=Octagon |

外加全部公共参数。📷 三种 Primitive 形状对比图。

---

### 4.2 Output Mesh — 任意网格

**作用**：把每个粒子绘制成一个 mesh（飞镖、子弹、碎片、岩石）。

| 专有参数 (Caption) | 类型 | 默认 | 说明 |
|---|---|---|---|
| Mesh (`mesh`) | Mesh 资源 | — | 每个粒子用的网格 |

外加全部公共参数（Blend / Alpha Clip / Soft / UV / Sort / Cull）。

---

### 4.3 Output Composed Particle — 拓扑+着色合一

**作用**：对齐 Unity VFXComposedParticleOutput，把「拓扑形状」和「着色」配在同一节点。Topology=Quad/Triangle/Octagon 走 Billboard 路径，=Mesh 走 Mesh 路径，视觉等价但 API 统一。

| 专有参数 (Caption) | 类型 | 默认 | 取值 | 说明 | 显隐 |
|---|---|---|---|---|---|
| Topology (`topology`) | 枚举 | `Quad` | Quad / Triangle / Octagon / Mesh | 几何拓扑 | 总显示 |
| Crop Factor (`cropFactor`) | number | 0.146 | 0~0.5 | 八边形裁角 | 仅 Topology=Octagon |
| Mesh (`mesh`) | Mesh | — | 网格资源 | 仅 Topology=Mesh |

外加全部公共参数。

---

### 4.4 Output Particle (ShaderGraph) / Output Mesh (ShaderGraph) — 自定义着色

**作用**：用自定义 ShaderGraph（`.bps` 编译出的 shader）接管粒子表面着色。Quad 版是面片，Mesh 版是网格。

| 专有参数 (Caption) | 类型 | 默认 | 说明 |
|---|---|---|---|
| Shader Name (`shaderName`) | string | `VFXUnlit` | 使用的 shader 名 |
| Shader Res (`shaderRes`) | string | "" | shader 资源引用 |
| Mesh (`mesh`) | Mesh | — | （仅 Mesh 版）网格资源 |

外加公共参数（ShaderGraph Quad 版无 Alpha Clip / Soft 专属项，Mesh 版有）。

---

### 4.5 Output Trail — 拖尾（Strip）

**作用**：沿粒子运动轨迹连成带状拖尾（子弹拖尾、刀光、能量流）。

| 专有参数 (Caption) | 类型 | 默认 | 取值/范围 | 说明 |
|---|---|---|---|---|
| Blend Mode (`blendMode`) | 枚举 | `Alpha` | — | 同公共 |
| Strip Capacity (`stripCapacity`) | number | 1 | ≥1，整数 | 同时存在的拖尾条数 |
| Particles Per Strip (`particlePerStripCount`) | number | 128 | ≥2，整数 | 每条拖尾的粒子节点数（决定拖尾分段精度/长度） |

> **Output Trail (ShaderGraph)**（`outputParticleStripSGQuad`）：同上 + `Shader Name`（默认 `VFXStrip`），用自定义 shader 渲染拖尾。

#### 🎏 详解 · Strip 拖尾（stripCapacity / particlePerStripCount）

拖尾不是普通粒子，而是把**一串粒子节点**沿轨迹连成一条带（ribbon）。两个容量参数共同决定拖尾的「条数 × 每条精度」：

- **`stripCapacity`（拖尾条数）**：能同时存在多少条独立拖尾。一发子弹一条尾 → 几发并存就要几条。
- **`particlePerStripCount`（每条节点数）**：每条拖尾由多少个粒子节点串成。**节点越多 → 拖尾越长/越平滑，但显存和带宽也越高**。它是每条拖尾的**环形缓冲（ring buffer）长度**：新节点不断写入、最老的被覆盖，形成「拖尾跟着头部滚动」的效果。
- 总粒子预算 ≈ `stripCapacity × particlePerStripCount`，与 `Capacity` 一样是**硬上限**。

⚠️ **拖尾「截断 / 碎片化 / 整条突然消失」最常见根因＝跨代复用（cross-generation reuse）**：一条 strip 的槽位被回收后立刻分给新的一条，旧尾还没渲染完就被新数据覆盖 → 视觉上断裂闪烁。表现为拖尾忽长忽短、中间断节。

⚠️ **多 Output 同存时，Strip 输出必须排在第一个**（作为主 output）；排在普通 billboard/mesh 输出之后会导致 strip 几何不正确或不渲染。

⚠️ **环形缓冲不滚动 → 拖尾不动**：若 Update 没有让死粒子退出 alive 列表（或拖尾的头部索引没推进），ring buffer 不滚动，拖尾会「钉」在原地不延伸。

💡 拖尾长度的两个调法：增 `particlePerStripCount`（更多节点→更长更平滑），或让节点间距更大（粒子移动更快/spawn 更稀）。要先看清是「节点不够」还是「节点太密」。

🔗 相关：Strip 的逐 strip 随机、流动 UV、OnDie 寿命等行为见 [Block](/vfx-graph/block/) 的 Strip 相关 Block。

---

### 4.6 Output Line / Output LineStrip — 线段 / 折线

| Context | 作用 | 专有参数 |
|---|---|---|
| **Output Line** | 每个粒子画一条线段（粒子位置→目标偏移） | `Target Offset` (vec3，默认 (0,0.1,0))：线段终点相对粒子的偏移 + Blend Mode |
| **Output LineStrip** | 粒子按生成顺序连成连续折线（beam/闪电/激光/轨迹） | 仅 Blend Mode |

可加 Block：Set Attribute / Camera Fade（+ LineStrip 还支持 Color/Alpha over Life）。

---

### 4.7 Output Point — 点

**作用**：每个粒子画成 1 像素点（点云、星空、debug）。
**参数**：仅 Blend Mode。

---

### 4.8 Output Cube — 实体立方体

**作用**：把粒子绘制成 3D 实体立方体（非 billboard，6 面 36 顶点 procedural）。

| 参数 (Caption) | 类型 | 默认 | 说明 |
|---|---|---|---|
| Blend Mode (`blendMode`) | 枚举 | Alpha | 混合模式 |
| Camera Sort (`cameraSort`) | bool | false | 距离排序 |
| Frustum Culling (`frustumCull`) | bool | false | 视锥剔除 |

---

### 4.9 Output Distortion — 屏幕扭曲

**作用**：采样相机不透明纹理做 UV 偏移，做热浪 / 冲击波 / 爆炸折射。
> ⚠️ 相机必须启用 `opaqueTexture` 才能采样到场景。

| 专有参数 (Caption) | 类型 | 默认 | 取值/范围 | 说明 |
|---|---|---|---|---|
| Distortion Strength (`distortionStrength`) | number | 0.05 | 0~1 | 扭曲强度（UV 偏移乘法因子），实际强度还乘 particle.alpha × 边缘 mask |
| Mode (`mode`) | 枚举 | `Procedural` | Procedural / NormalMap | Procedural=径向透镜（中心向外）；NormalMap=用 albedo 的 RG 当法线 xy |

外加公共参数（Blend / UV / Sort / Cull）。📷 扭曲效果动图。

---

### 4.10 Output Static Mesh — 静态网格

**作用**：渲染单个静态 mesh（不跑粒子模拟），mesh 跟随组件节点 transform。可由 graph 驱动 transform/color。
**可加 Block**：Set Static Mesh Attr。

| 参数 (Caption) | 类型 | 默认 | 说明 |
|---|---|---|---|
| Mesh (`mesh`) | Mesh | — | 要渲染的网格 |
| Material (`material`) | Material | — | 材质（不指定则 fallback unlit） |

---

## 5. Output Event — CPU 端事件回调

**作用**：把粒子事件（死亡/触发等）从 GPU 回传到 CPU，触发代码回调（如粒子落地播音效、生成道具）。上游从 Update 的 Trigger Event Block 经 flow 路由进来。

| 参数 (Caption) | 类型 | 默认 | 取值/范围 | 说明 |
|---|---|---|---|---|
| Event Name (`eventName`) | string | `OnReceived` | — | 回调里用于区分的事件名 |
| Buffer Capacity (`capacity`) | number | 256 | 1~4096，整数 | 每帧最多回传的事件数（GPU→CPU 缓冲大小） |

> 代码侧如何注册回调、回调 payload 结构，见 [代码篇](/vfx-graph/code/)。

---

## 下一步

➡️ [属性详解·Block](/vfx-graph/block/)：堆在 Context 里的行为单元参数详解。
