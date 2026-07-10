---
title: "属性详解 · Operator（运算符）"
description: "详解 VFX Graph 全部 142 个 Operator 运算符：采样、噪声、属性读取、内置量、相机、自定义等 VFX 特有节点逐参数说明，以及通用数学、向量、逻辑、颜色等类别的分类速查表。"
slug: "vfx-graph/operator"
---

> Operator 是独立的纯计算节点，输出值通过插槽连到 Block/Operator 的输入。共 **142** 个。
> 本篇**分层**编写：**VFX 特有 Operator**（采样/噪声/属性/内置/相机等）逐参数详解；**通用数学/向量/逻辑** Operator 用分类速查表（标题即功能）。

> **多态 Operator**：`add`/`multiply`/`clamp` 等带 `supportedTypes`，节点上用齿轮按钮切换处理的数据类型。两个常用类型集：
> `ALL_NUMERIC = [float, int, uint, vec2, vec3, vec4]`；`FLOAT_VEC = [float, vec2, vec3, vec4]`。

---

## 第一部分 · VFX 特有 Operator（逐参数）

### 1. 内置量（Builtin）

无输入，直接输出运行时内置量。

| typeId | title | 输出 | 说明 |
|---|---|---|---|
| `builtinDeltaTime` | Delta Time | dt: float | 当前帧时间步长 |
| `builtinTotalTime` | Total Time | t: float | 累计总时间 |
| `builtinSystemSeed` | System Seed | Seed: uint | 系统随机种子 |
| `builtinLoopIndex` | Get Loop Index | Loop Index: int | 当前循环序号 |
| `builtinLocalToWorld` | Local To World | Matrix: transform | 本地→世界变换矩阵 |
| `builtinWorldToLocal` | World To Local | Matrix: transform | 世界→本地变换矩阵 |
| `periodicTotalTime` | Periodic Total Time | T: float | totalTime 按 `Period`(默认5) 周期循环并映射到 `Range`(默认 0~1) |

#### Spawn State（`spawnState`）
暴露 spawner 运行时状态给图（仅 Initialize 有效）。无输入，多输出：
`NewLoop`(bool) / `LoopState`(int) / `LoopIndex`(int) / `SpawnCount`(float) / `SpawnDeltaTime`(float) / `SpawnTotalTime`(float) / `LoopDuration`(float) / `LoopCount`(int) / `DelayBeforeLoop`(float) / `DelayAfterLoop`(float)。

---

### 2. 采样（Sampling）

#### 2.1 纹理采样
| typeId | title | 输入 | 输出 | 属性 |
|---|---|---|---|---|
| `sampleTexture2D` | Sample Texture2D | UV(vec2), Mip Level(float) | Color(vec4) | Texture(Texture2D) |
| `sampleTexture3D` | Sample Texture3D | UVW(vec3), Mip Level | Color(vec4) | Texture(Texture3D) |
| `sampleTextureCube` | Sample TextureCube | UVW(vec3), Mip Level | Color(vec4) | Texture(TextureCube) |
| `sampleTexture2DArray` | Sample Texture2DArray | UV(vec2), Slice(float), Mip Level | Color(vec4) | Texture(Texture2DArray) |
| `loadTexture2D` | Load Texture2D | X, Y, Mip Level (float) | Color(vec4) | Texture(Texture2D) | 整数坐标精确 texelFetch，无插值 |
| `loadTexture3D` | Load Texture3D | X, Y, Z, Mip Level | Color(vec4) | Texture(Texture3D) |
| `loadTexture2DArray` | Load Texture2DArray | X, Y, Slice, Mip Level | Color(vec4) | Texture(Texture2DArray) |
| `loadTextureCube` | Load Texture Cube | Direction(vec3), Mip Level | Color(vec4) | Texture(TextureCube) |
| `textureDimensions2D` | Get Texture2D Dimensions | Mip Level | Dim(vec2) | Texture(Texture2D) |
| `textureDimensions3D` | Get Texture3D Dimensions | Mip Level | Dim(vec3) | Texture(Texture3D) |
| `textureDimensionsCube` | Get TextureCube Dimensions | Mip Level | Dim(vec2) | Texture(TextureCube) |

> `Load*` = 整数像素精确取值（`texelFetch`）；`Sample*` = 带插值的 UV 采样。

#### 2.2 网格采样（Sample Mesh）
按顶点索引读网格属性（runtime 烘焙到 N×1 纹理）。统一输入 `Vertex Index`(int)，属性均为 `Mesh`。
| typeId | title | 输出 |
|---|---|---|
| `sampleMeshPosition` | Sample Mesh Position | Position(vec3) |
| `sampleMeshNormal` | Sample Mesh Normal | Normal(vec3) |
| `sampleMeshTangent` | Sample Mesh Tangent | Tangent(vec4) |
| `sampleMeshUV` | Sample Mesh UV | UV(vec2) |
| `sampleMeshColor` | Sample Mesh Color | Color(vec4) |
| `sampleMeshIndex` | Sample Mesh Index | Vertex ID(int)（从 indexBuffer 按位置读顶点 ID，喂给 sampleMeshPosition） |
| `meshVertexCount` | Mesh Vertex Count | Count(int) |
| `meshIndexCount` | Mesh Index Count | Count(int) |
| `meshTriangleCount` | Mesh Triangle Count | Count(int)（=indexCount/3） |

#### 2.3 蒙皮网格采样（Skinned Mesh）
从 SkinnedMeshRenderer 读 skinned 顶点（代码侧 `vfx.setSkinnedMeshSource(name, renderer)` 注册，见 [代码篇](/vfx-graph/code/#8-绑定-skinnedmesh-源粒子贴骨骼动画角色)）。输入 `Vertex Index`(int)，属性 `Source Name`(默认 "default")。
| typeId | title | 输出 |
|---|---|---|
| `sampleSkinnedMeshPosition` | Sample Skinned Mesh Position | Position(vec3) |
| `sampleSkinnedMeshNormal` | Sample Skinned Mesh Normal | Normal(vec3) |

#### 2.4 SDF / 点云 / Buffer / 曲线 / 渐变
| typeId | title | 输入 | 输出 | 属性 |
|---|---|---|---|---|
| `sampleSDF` | Sample SDF | Position(vec3) | Distance(float) | SDF Texture(Texture3D), Center(vec3), Size(vec3) |
| `samplePointCache` | Sample Point Cache | Index(int) | Value(vec4) | Point Cache(string), Attribute(string, 默认 position) |
| `sampleGraphicsBuffer` | Sample Graphics Buffer | Index(int) | Value(vec4) | Buffer Property(string) |
| `bufferCount` | Buffer Count | — | Count(int) | Buffer Property(string) |
| `sampleCameraBuffer` | Sample Camera Buffer | Screen UV(vec2) | Value(float) | Buffer(Depth/Color) |
| `loadCameraBuffer` | Load Camera Buffer | X, Y, Mip Level(float) | Value(float) | Buffer(Depth/Color) |
| `sampleBezier` | Sample Bezier | A,B,C,D(vec3), T(float) | Position(vec3) | — |
| `sampleGradient` | Sample Gradient | Time(float) | Color(vec4) | Gradient(inline，可被 Graph Property 名替代) |

> `sampleGradient`：填了 `Graph Property` 名则用图级 Gradient 属性，留空用 inline 渐变（二者编辑器互斥显示）。

---

### 3. 噪声（Noise）

| typeId | title | 输入 | 输出 | 属性 |
|---|---|---|---|---|
| `noise` | Noise | Coordinate(vec3), Frequency(5), Octaves(int 3), Roughness(0.5), Lacunarity(2), Amplitude(1) | Noise(float), Derivatives(vec3) | Type: Value/Perlin/Cellular |
| `curlNoise` | Curl Noise | 同上（无 Amplitude 默认 1） | Curl(vec3) | Type: Value/Perlin/Cellular |
| `worleyNoise` | Worley Noise | Coordinate(vec3), Frequency(1), Octaves(3), Roughness(0.5), Lacunarity(2) | Noise(vec4) | — |
| `voroNoise2D` | Voro Noise 2D | Coordinate(vec2), Angle Offset(0.5), Cell Density(1) | Noise(float) | — |

> 配合 Turbulence Block（[Block](/vfx-graph/block/#turbulence湍流)）或直接接 Set Attribute 做位移扰动。

#### 🎚️ 详解 · Noise 调参

- **`Coordinate`**：采样坐标 —— 接 `position` 让噪声随空间变化，接 `position + totalTime*方向` 让噪声「流动」。
- **`Frequency`**：空间频率，越大花纹越细碎、越小越大块。
- **`Octaves` / `Roughness` / `Lacunarity`**：分形叠加 —— 层数越多细节越丰富；Roughness 是高频层权重；Lacunarity 是层间频率倍增（默认 2）。
- **`Amplitude`**：输出幅度。
- **输出 `Noise` + `Derivatives`**：`Derivatives`（梯度）可用来做沿等值线流动、curl 类无散度运动（`curlNoise` 直接给无散度向量场，适合烟雾/流体感的不炸开扰动）。

⚠️ **噪声直接驱动位移/速度时极易「放大几百倍甩飞」**：Perlin/Value 噪声原始输出量级很小，乘上不当的强度/频率会让粒子瞬间炸开、trail 变乱线。先用很小的强度（如 0.01~0.1）起步，再逐步加。若一加噪声就失控，核对噪声输出的实际量级（GPU readback velocity），别盲目调大。`curlNoise` 比裸 `noise` 更稳（无散度、不会把粒子整体吹散）。

---

### 4. 属性读取（Attribute）

| typeId | title | 输出 | 说明 |
|---|---|---|---|
| `getAttribute` | Get Attribute | Value(any) | 读粒子属性。`Attribute`=属性名，`Location`=Current/Source（Source=上游 SpawnEvent 附带值） |
| `getCustomAttribute` | Get Custom Attribute | Value | 读自定义属性。`Name`+`Type`(float/int/uint/bool/vec2/3/4/color) |
| `perParticleTotalTime` | Per-Particle Total Time | Age(float) | 等价于 getAttribute(age) |
| `ageOverLifetime` | Age Over Lifetime | Out(float) | age/lifetime 归一寿命 |
| `ratioOverStrip` | Get Ratio Over Strip | T(float) | 粒子在 strip 上的位置比例 0~1（仅 Trail/Strip Output 有效） |

#### 可读写的粒子属性（getAttribute / Set Attribute 的 Attribute 列表）
`position`(vec3) · `velocity`(vec3) · `direction`(vec3) · `color`(color) · `alpha`(float) · `age`(float) · `lifetime`(float) · `normalizedAge`(只读) · `size`(float) · `scale`(vec3) · `angle`(vec3) · `angularVelocity`(vec3) · `mass`(float) · `oldPosition`(vec3) · `targetPosition`(vec3) · `pivot`(vec3) · `texIndex`(float) · `axisX/Y/Z`(vec3) · `alive`(bool) · `seed`(只读) · `particleId`(只读) · `spawnIndex`(只读) · `spawnCount`(只读) · `spawnTime`(只读) · `stripIndex` · `particleIndexInStrip`(只读) · `particleCountInStrip`(只读) · `collisionEventPosition`(vec3)。

#### 🔍 详解 · getAttribute（读粒子属性）

`getAttribute` 是「**逐粒子**」读值的核心：它在每个粒子上**各自取该粒子当前的属性值**，所以同一个图、不同粒子读出来的值是不同的 —— 这就是「每个粒子表现不一样」的来源。常见用法：把 `age/normalizedAge` 接进曲线做随寿命变化、把 `velocity` 接进 Orient/拉伸、把 `particleId/spawnIndex` 接进随机或序列布点。

- **`Location` = `Current`**：读该粒子**此刻**的属性（已被前面的块改过的最新值）。
- **`Location` = `Source`**：读**上游 SpawnEvent 附带**的值（父粒子传下来的继承值，用于 GPU Event 子粒子继承父位置/颜色）。
- **只读属性**（`normalizedAge / seed / particleId / spawnIndex / particleIndexInStrip …`）只能 get 不能 Set。

⚠️ **执行阶段决定能读到什么**：在 Initialize 里 `age` 还是 0、`velocity` 还没被力改过；要读「演化后的值」（如当前速度、当前位置）得在 **Update / Output** 阶段。读出来全是初值时，先确认是不是放错了 Context。

💡 `ageOverLifetime`(= age/lifetime) 和 `ratioOverStrip`(粒子在拖尾上的 0~1 位置) 是两个最常用的归一驱动量，直接接曲线/渐变即可做「随寿命/沿拖尾」的渐变。

---

### 5. 图级属性（Property）

| typeId | title | 输出 | 说明 |
|---|---|---|---|
| `getProperty` | Get Property | Value(any) | 读 Blackboard 暴露属性（`Property`=属性名）。运行时可被 `vfx.setPropertyXxx` 改写 |

---

### 6. 相机（Camera）

| typeId | title | 输入 | 输出 |
|---|---|---|---|
| `getMainCamera` | Get Main Camera | — | Value(camera) |
| `worldToViewport` | World To Viewport | World Position(vec3), View-Proj(transform) | Viewport(vec3) |
| `viewportToWorld` | Viewport To World | Viewport Position(vec3), Inv View-Proj(transform) | World(vec3) |

---

### 7. 自定义（Custom）

| typeId | title | 输入 | 输出 | 属性 |
|---|---|---|---|---|
| `customGlsl` | Custom GLSL | A,B,C,D(vec4) | Out(vec4) | GLSL Code(string，函数体须含 return，签名固定 `vec4(a,b,c,d)→vec4`) |

---

## 第二部分 · 通用 Operator（速查表）

> 标题即功能。多态者标 `supportedTypes`（ALL=ALL_NUMERIC，FV=FLOAT_VEC）。

### Inline（字面量常量，26 个）
提供各类型的常量值，连到下游作为输入。
`Float / Int / Uint / Bool / Color / Matrix 4x4 / Vector2 / Vector3 / Vector4 / Position / Vector / Direction / Transform / Sphere / Arc Sphere / AABox / Oriented Box / Cone / Arc Cone / Torus / Arc Torus / Circle / Arc Circle / Plane / Line / Camera`（typeId 均为 `inline*`）。

### Math/Arithmetic（17）
| title | types | title | types |
|---|---|---|---|
| Add | ALL | Subtract | ALL |
| Multiply | ALL | Divide | ALL |
| Modulo | ALL | Negate | ALL |
| Absolute | ALL | Sign | ALL |
| Power | FV | Reciprocal | FV |
| Square Root | FV | Fractional | FV |
| One Minus | FV | Step | FV |
| Smoothstep | FV | Lerp | FV |
| Inverse Lerp | FV | | |

### Math/Trigonometry（6）
Sine · Cosine · Tangent · Arc Sine · Arc Cosine · Arc Tangent 2（atan2）—— 均 FV。

### Math/Clamp（8）
Clamp(ALL) · Saturate([0,1]) · Minimum(ALL) · Maximum(ALL) · Floor · Ceiling · Round · Discretize（按 step 离散）。

### Math/Wave（4）
Sine Wave · Triangle Wave · Sawtooth Wave · Square Wave —— 均 FV。

### Math/Exp · Constants · Remap
| typeId | title | 功能 |
|---|---|---|
| exp / log | Exp / Log | e^x / 对数 |
| pi / epsilon | Pi / Epsilon | π / 极小常量 |
| remap | Remap | 区间重映射 oldMin/Max→newMin/Max |
| linearRemap | Remap [-1..1]=>[0..1] | x*0.5+0.5 |

### Math/Geometry（26）
Distance · Squared Distance · Length · Squared Length · Dot Product · Cross Product · Normalize · Reflect · Refract · Rotate 2D · Rotate 3D · Look At · Distance To Line/Plane/Sphere/AABox/OrientedBox/Torus/Cone/Cylinder（点到形状 SDF） · AABox/OrientedBox/Sphere/Cone/Torus Volume · Circle Area。

### Math/Vector（22）
Append 系列（float→vec2/3/4、vec2+float→vec3 等拼接） · Swizzle（分量重排） · Component Mask(Vec3/Vec4) · Transform Position/Direction/Vector/Vector4/Matrix · Construct/Transpose/Inverse/Inverse TRS Matrix · Change Space（Local↔World） · Sequential Line/Circle/3D（按 index 等分布点）。

### Math/Coordinates（6）
极坐标 / 球坐标 / 柱坐标 ↔ 直角坐标 互转（Polar/Spherical/Cylindrical ↔ Rectangular）。

### Logic（9）
| typeId | title | 功能 |
|---|---|---|
| compare | Compare | 比较 Equal/Less/Greater… → bool |
| branch | Branch | predicate ? a : b（FV） |
| logicAnd/Or/Not/Nand/Nor | And/Or/Not/Nand/Nor | 逻辑运算 |
| switchOp | Switch | 按 index 选输入（2~8 路） |
| weightedSelector | Weighted Selector | 按权重选值（2~8 路） |

### Bitwise（6）
And · Or · Xor · Complement · Left Shift · Right Shift。

### Color（7）
| typeId | title | 功能 |
|---|---|---|
| rgbToHsv / hsvToRgb | RGB↔HSV | 色彩空间互转 |
| gammaToLinear / linearToGamma | Gamma↔Linear | sRGB↔线性 |
| colorLuma | Luma | 亮度 |
| colorize | Colorize | 渐变采样（同 sampleGradient 语义） |

### Random（3）
| typeId | title | 功能 |
|---|---|---|
| randomNumber | Random Number | min~max 随机（seed: PerParticle / PerComponent / PerParticleStrip）（FV） |
| probabilitySampling | Probability Sampling | 按 vec4 权重随机取索引 |

#### 🎲 详解 · Random Number 的 seed 模式

输出 `[min, max]` 区间内的随机值，关键是 **seed 模式决定「随机的粒度」**：

- **`PerParticle`**：每个粒子一个随机数（vec 各分量共用同一个）→ 等比、保持比例（统一变大/变亮）。
- **`PerComponent`**：每个粒子、每个分量各自独立随机 → 方向/颜色更杂乱。
- **`PerParticleStrip`**：**同一条 strip 上的所有粒子共用一个随机数** → 用于「每条拖尾一个固定随机色/随机弧」，而不是拖尾内部每个节点都跳。

⚠️ **随机的「固定性」取决于放在哪个阶段**：在 Initialize 取一次 → 该粒子一生固定；在 Update 取 → 每帧 re-roll（抖动）。要「每粒子一个稳定随机值」务必在 Initialize。

⚠️ **随机分布塌成一条弧/扇形、或逐周期重复同一批值**：多为「纯按槽位算种子」+ 槽位回收复用导致（短命中继粒子尤其明显）。健康的随机应掺入单调 id / 时间盐，避免槽位回收后逐帧同值。

### Utility（2）
| typeId | title | 功能 |
|---|---|---|
| curve | Curve | 曲线常量 |
| sampleCurve | Sample Curve | 采样曲线（curve + t → float） |

---

## 下一步

➡️ [示例验证索引](/vfx-graph/examples/)：功能 → 现有示例 → 预期效果，照表验收。
