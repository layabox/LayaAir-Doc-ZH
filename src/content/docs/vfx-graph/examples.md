---
title: "示例验证索引"
description: "把 VFX Graph 功能点映射到工程里现成的示例资源，给出在哪个场景打开、应当看到的预期效果，供社区工程师照表逐项验收，并附美术级综合示例与一份验收清单小结。"
slug: "vfx-graph/examples"
---

> 本篇把 VFX 功能点映射到工程里**现成的示例资源**，给出「在哪个场景打开、应该看到什么」，供社区工程师**照表逐项验收**：打开示例运行，对照「预期效果」核对是否一致。

> 路径均相对工程根 `LayaVFXSample/`。示例 `.vfx` 大多在 `assets/resources/` 下；`*_Converted` 后缀为 Unity 转换版。

---

## 如何验证

1. 打开对应场景（`assets/scenes/*.ls`）或直接双击 `.vfx` 在 VFX Graph 面板预览。
2. 运行，观察粒子表现。
3. 对照「预期效果」一栏核对：形态、颜色、运动、数量级是否一致。
4. 不一致 → 记录现象，结合 [Context](/vfx-graph/context/)/[Block](/vfx-graph/block/)/[Operator](/vfx-graph/operator/) 的参数说明排查。

主要演示场景：
- `assets/scenes/LearningTemplates.ls` —— 学习模板集合（`LearningTemplates/vfx/` 下示例）
- `assets/scenes/Scene.ls` —— VfxSample 系列功能示例
- `assets/scenes/SDFScene.ls` —— SDF 碰撞/吸附
- `assets/scenes/CollisionDepthBufferScene.ls` —— 深度缓冲碰撞

---

## 1. 生成 / Spawn

| 功能点 | 示例 | 预期效果 | 文档 |
|---|---|---|---|
| Constant Rate | `VfxGraph.vfx` | 每秒稳定冒出固定数量粒子 | [Spawn](/vfx-graph/context/#1-spawn--生成节奏) |
| Single Burst | `VfxSample_Burst.vfx` | 一次性爆发一团粒子后停止 | [Spawn](/vfx-graph/block/#1-spawn-生成) |
| Loop Burst | `VfxSample_LoopBurst.vfx` | 周期性反复爆发 | 同上 |
| Fountain（连续喷射） | `VfxSample_Fountain.vfx` | 持续喷泉状粒子流 | 同上 |
| PreWarm（预热） | `VfxSample_PreWarm.vfx` | 场景一加载粒子就已是「演过一段」的状态 | [图级属性](/vfx-graph/graph-and-components/#1-图级属性graph-settings) |
| Spawn Over Distance | `VfxSample_SpawnOverDistance.vfx` | 发射器移动才生成粒子（足迹/拖尾） | [Spawn](/vfx-graph/block/#spawn-over-distance按移动距离生成) |
| Custom Spawner（脚本驱动） | `LearningTemplates/vfx/CustomSpawnerTest.vfx` + `src/CustomSpawnerDemo.ts` | 点击屏幕喷一团 30 颗，无点击 0 颗 | [CustomSpawn](/vfx-graph/code/#7-自定义-spawn-回调脚本驱动生成数量) |
| Capacity（容量上限） | `LearningTemplates/vfx/CapacityCount.vfx` | 活粒子数被 Capacity 限制不再增长 | [Initialize](/vfx-graph/context/#2-initialize--诞生初始化) |

---

## 2. 位置 / 形状

| 功能点 | 示例 | 预期效果 | 文档 |
|---|---|---|---|
| Set Position (Plane) | `LearningTemplates/vfx/SetPositionPlaneTest.vfx` | 粒子在平面区域内随机分布 | [Position](/vfx-graph/block/#set-position-shape形状内表面布点-核心-block) |
| Position Sequential | `VfxSample_PositionSequential.vfx` | 粒子按序列排成线/圆/阵列 | [Position](/vfx-graph/block/#position-sequential序列布点) |
| Set Position (Mesh) Surface | `LearningTemplates/vfx/SetPositionMeshSurfaceTest.vfx` | 粒子贴附网格表面 | [Position](/vfx-graph/block/#set-position-mesh网格采样布点) |
| Set Position (Mesh) Volume | `LearningTemplates/vfx/SetPositionMeshVolumeTest.vfx` | 粒子填满网格体内 | 同上 |
| Position SDF | `LearningTemplates/vfx/PositionSDF.vfx` | 粒子分布在 SDF 表面/体内 | [Position](/vfx-graph/block/#position-sdfsdf-表面体内布点) |

---

## 3. 速度 / 朝向 / 旋转

| 功能点 | 示例 | 预期效果 | 文档 |
|---|---|---|---|
| Orient Face Camera | `LearningTemplates/vfx/OrientFaceCamera.vfx` | 面片始终朝向相机 | [Orient](/vfx-graph/block/#8-orient-朝向) |
| Orient Fixed Axis | `LearningTemplates/vfx/OrientFixedAxis.vfx` | 面片绕固定轴朝向 | 同上 |
| Pivot Attribute | `LearningTemplates/vfx/PivotAttribute.vfx` | 粒子绕自定义轴心旋转/缩放 | [getAttribute](/vfx-graph/operator/#4-属性读取attribute) |
| Rotation Angle | `LearningTemplates/vfx/RotationAngle.vfx` | 粒子按角度自转 | [Attribute](/vfx-graph/block/#2-attribute-属性) |
| Box Rotation | `VfxSample_BoxRotation.vfx` | mesh 粒子持续旋转 | 同上 |
| Connect Target | `VfxSample_ConnectTarget.vfx` | 粒子拉伸连接到目标点（链状） | [Output](/vfx-graph/block/#camera-fade--screen-space-size--connect-target--subpixel-aa--flipbook-play) |

---

## 4. 力场 / 物理

| 功能点 | 示例 | 预期效果 | 文档 |
|---|---|---|---|
| Attractor（引力） | `VfxSample_Attractor.vfx` / `LearningTemplates/vfx/AttractorAABoxTest.vfx` | 粒子被吸向中心/区域 | [Force](/vfx-graph/block/#attractor引力吸引-sphere--aabox) |
| Turbulence（湍流） | `VfxSample_Turbulence.vfx` | 粒子受噪声扰动飘动 | [Force](/vfx-graph/block/#turbulence湍流) |
| Vector Field（矢量场） | `VfxSample_VectorField.vfx` | 粒子沿 3D 矢量场流动 | [Force](/vfx-graph/block/#vector-field-force矢量场力) |
| Conform To Sphere | `VfxSample_ConformToSphere.vfx` | 粒子吸附到球面 | [Force](/vfx-graph/block/#conform-to吸附到形状表面-sphere--aabox--orientedbox--cone--shapesdf) |
| Conform To AABox/OrientedBox/Cone | `LearningTemplates/vfx/ConformTo{AABox,OrientedBox,Cone}Test.vfx` | 粒子吸附到对应形状 | 同上 |
| Conform To SDF | `LearningTemplates/vfx/ConformToSDF.vfx`（`SDFScene.ls`） | 粒子吸附到 SDF 形状表面 | 同上 |
| Calculate Mass From Volume | `LearningTemplates/vfx/CalculateMassFromVolumeTest.vfx` | 按体积算质量影响受力 | [Attribute](/vfx-graph/block/#calculate-mass-from-volume按体积算质量) |

---

## 5. 碰撞 / Kill

| 功能点 | 示例 | 预期效果 | 文档 |
|---|---|---|---|
| Collision Simple | `VfxSample_Collision.vfx` / `LearningTemplates/vfx/CollisionSimple.vfx` | 粒子撞平面/球反弹 | [Collision](/vfx-graph/block/#6-collision-碰撞) |
| Collision OrientedBox / Torus | `LearningTemplates/vfx/Collision{OrientedBox,Torus}Test.vfx` | 粒子与对应形状碰撞 | 同上 |
| Collision SDF | `LearningTemplates/vfx/CollisionSDF.vfx`（`SDFScene.ls`） | 粒子与 SDF 形状碰撞 | 同上 |
| Collision Depth Buffer | `VfxSample_CollisionDepthBuffer.vfx`（`CollisionDepthBufferScene.ls`） | 粒子与屏幕深度（场景几何）碰撞 | 同上 |
| Kill Plane/Cone/Torus/OrientedBox/Baseline | `LearningTemplates/vfx/Kill{Plane,Cone,Torus,OrientedBox,Baseline}Test.vfx` | 进入对应区域的粒子立即消失 | [Kill](/vfx-graph/block/#7-kill-销毁) |

---

## 6. 渲染 / Output

| 功能点 | 示例 | 预期效果 | 文档 |
|---|---|---|---|
| Billboard | `VfxSample_Billboard.vfx` / `LearningTemplates/vfx/BillboardPrimitive.vfx` | 朝相机面片贴图 | [Billboard](/vfx-graph/context/#41-output-billboard--朝向相机的面片最常用) |
| Output Mesh / Cube | `VfxSample_OutputMesh.vfx` / `LearningTemplates/vfx/CubeOutput.vfx` | 粒子显示为网格/立方体 | [Mesh](/vfx-graph/context/#42-output-mesh--任意网格) |
| Output Point | `VfxSample_OutputPoint.vfx` | 粒子显示为点（点云） | [Point](/vfx-graph/context/#47-output-point--点) |
| Output Line / LineStrip | `VfxSample_OutputLine.vfx` / `LearningTemplates/vfx/LineStripOutput.vfx` | 线段 / 连续折线 | [Line](/vfx-graph/context/#46-output-line--output-linestrip--线段--折线) |
| Output Distortion | `LearningTemplates/vfx/DistortionTest.vfx` | 屏幕热浪/扭曲（需相机 opaqueTexture） | [Distortion](/vfx-graph/context/#49-output-distortion--屏幕扭曲) |
| Output ShaderGraph (Quad/Strip) | `VfxSample_ShaderGraphQuad.vfx` / `VfxSample_StripSGQuad.vfx` | 自定义 shader 着色的粒子/拖尾 | [ShaderGraph](/vfx-graph/context/#44-output-particle-shadergraph--output-mesh-shadergraph--自定义着色) |
| Output Static Mesh | `LearningTemplates/vfx/StaticMeshOutputTest.vfx` / `StaticMeshBindingTest.vfx` + `src/StaticMeshBindingDemo.ts` | 静态网格由 graph/代码驱动 transform/color | [StaticMesh](/vfx-graph/context/#410-output-static-mesh--静态网格) |
| Multiple Outputs | `VfxSample_MultiOutput.vfx` / `LearningTemplates/vfx/ComposedOutputTest.vfx` | 一个系统多种渲染叠加 | [Output 总览](/vfx-graph/context/#4-output-系列--渲染) |
| Soft Particle | `VfxSample_SoftParticleShowcase.vfx` | 与场景相交处柔化淡出 | [公共参数](/vfx-graph/context/#40-公共参数多数-output-都有) |
| Screen Space Size | `VfxSample_ScreenSpaceSize.vfx` | 粒子保持固定屏幕像素大小 | [Output](/vfx-graph/block/#camera-fade--screen-space-size--connect-target--subpixel-aa--flipbook-play) |
| Subpixel AA | `VfxSample_SubpixelAA.vfx` | 极小粒子抗锯齿更平滑 | 同上 |
| Camera Fade | `VfxSample_CameraFade.vfx` | 靠近/远离相机时淡出 | 同上 |

---

## 7. 颜色 / Flipbook / 渐变

| 功能点 | 示例 | 预期效果 | 文档 |
|---|---|---|---|
| Color over Life | `LearningTemplates/vfx/ColorizeTest.vfx` | 粒子颜色随寿命渐变 | [Output](/vfx-graph/block/#color-over-life生命周期颜色) |
| Gradient Property | `VfxSample_GradientProperty.vfx` / `LearningTemplates/vfx/InlineGradientTest.vfx` | 用渐变控制颜色 | [sampleGradient](/vfx-graph/operator/#24-sdf--点云--buffer--曲线--渐变) |
| Flipbook Mode | `LearningTemplates/vfx/FlipbookMode.vfx` | 序列帧动画硬切播放 | [公共参数 UV Mode](/vfx-graph/context/#40-公共参数多数-output-都有) |
| Flipbook Blend | `VfxSample_FlipbookBlend.vfx` | 序列帧帧间平滑混合 | 同上 |
| Tile/Warp | `VfxSample_TileWarp.vfx` | 粒子超出范围环绕回另一侧 | [Position](/vfx-graph/block/#set-position-depth-buffer--tile-warp-positions) |

---

## 8. 采样 / 噪声 / 自定义

| 功能点 | 示例 | 预期效果 | 文档 |
|---|---|---|---|
| Sample Texture2D | `LearningTemplates/vfx/SampleTexture2D.vfx` | 用纹理采样驱动粒子属性 | [纹理采样](/vfx-graph/operator/#21-纹理采样) |
| Sample Mesh（位置/法线/UV/色/切线） | `LearningTemplates/vfx/SampleMesh{Position,Normal,UV,Color,Tangent}Test.vfx` | 粒子按网格对应属性采样 | [网格采样](/vfx-graph/operator/#22-网格采样sample-mesh) |
| Sample Skinned Mesh | `LearningTemplates/vfx/SampleSkinnedMeshTest.vfx` + `src/SampleSkinnedMeshDemo.ts` | 粒子贴在骨骼动画角色表面随动 | [SkinnedMesh](/vfx-graph/code/#8-绑定-skinnedmesh-源粒子贴骨骼动画角色) |
| Sample Point Cache | `LearningTemplates/vfx/SamplePointCacheTest.vfx` / `VfxSample_MeshPointCache.vfx` | 粒子按点云数据分布 | [点云](/vfx-graph/operator/#24-sdf--点云--buffer--曲线--渐变) |
| Worley Noise | `LearningTemplates/vfx/WorleyNoiseTest.vfx` | cellular 噪声驱动 | [噪声](/vfx-graph/operator/#3-噪声noise) |
| Custom GLSL | `LearningTemplates/vfx/CustomGlslTest.vfx` / `CustomGlslBlockTest.vfx` | 用户 GLSL 代码控制粒子 | [Custom](/vfx-graph/operator/#7-自定义custom) / [Custom](/vfx-graph/block/#11-custom--static-mesh) |
| Graphics Buffer | `VfxSample_GraphicsBuffer.vfx` + `src/GraphicsBufferDemo.ts` | 外部 GPU buffer 数据驱动粒子 | [setBuffer](/vfx-graph/code/#4-动态读写图级属性property) |
| Change Space / Gamma-Linear | `LearningTemplates/vfx/ChangeSpaceTest.vfx` / `GammaLinearTest.vfx` | 坐标空间/色彩空间转换 | [Math/Vector](/vfx-graph/operator/#mathvector22) / [Color](/vfx-graph/operator/#color7) |

---

## 9. 拖尾 / Strip

| 功能点 | 示例 | 预期效果 | 文档 |
|---|---|---|---|
| Trail（简单拖尾） | `VfxSample_Trail.vfx` | 粒子拖出连续尾迹 | [Trail](/vfx-graph/context/#45-output-trail--拖尾strip) |
| Head And Trail | `VfxSample_HeadAndTrail.vfx` | 头部粒子 + 跟随拖尾 | 同上 |
| Fountain Trail / Multi Trail | `VfxSample_FountainTrail.vfx` / `VfxSample_MultiTrail.vfx` | 喷泉拖尾 / 多条拖尾 | 同上 |
| Strip Spawn Rate | `LearningTemplates/vfx/StripSpawnRate.vfx` | 按速率生成的 strip 流动 | 同上 |
| Multi Strip（SingleBurst/SpawnRate/PeriodicBurst） | `LearningTemplates/vfx/MultiStrip*_Converted.vfx` | 多条 strip 不同生成模式 | 同上 |
| Ratio Over Strip | `LearningTemplates/vfx/RatioOverStripTest.vfx` | 属性沿 strip 位置渐变 | [ratioOverStrip](/vfx-graph/operator/#4-属性读取attribute) |

---

## 10. 事件 / GPU Event

| 功能点 | 示例 | 预期效果 | 文档 |
|---|---|---|---|
| Trigger Event（OnDie 链式） | `VfxSample_Firework.vfx` | 主弹粒子死亡时炸开二级粒子（烟花） | [GPUEvent](/vfx-graph/block/#10-gpuevent) |
| Trigger Event on Shape Enter | `VfxSample_TriggerEventShape.vfx` | 粒子进入形状时触发新粒子 | 同上 |
| Trigger Event Collide | `LearningTemplates/vfx/TriggerEventCollide_Converted.vfx` | 碰撞时触发事件 | 同上 |
| GPU Event 多 strip 链 | `LearningTemplates/subvfx/MultiStripGPUEvents/T*.vfx` | GPU 事件驱动多 strip 链式生成 | 同上 |
| Output Event（CPU 回调） | `LearningTemplates/vfx/OutputEventTest.vfx` + `src/OutputEventDemo.ts` | 粒子事件回调到 CPU（控制台打印） | [OutputEvent](/vfx-graph/code/#6-接收-output-event-回调gpu--cpu) |

---

## 11. 美术级综合示例（Unity 转换）

`assets/resources/univfx/` 下有大量成品游戏特效，适合作为「综合效果」参考验收（不逐参数，看整体观感是否与 Unity 一致）：

| 系列 | 路径 | 内容 |
|---|---|---|
| Essentials Visual Effects | `univfx/Essentials/...` | 光环 / 屏障 / Buff / 爆炸 / 治疗 / 跳跃 / 近战 / 导弹 / 拾取 / 传送 |
| Dissolve & Teleport | `univfx/Dissolve & Teleport/...` | 溶解（突发/能量/烟雾/线条/图案）/ 传送门 / 虫洞（含 SkinnedMesh 版） |
| AuraDebug (VFX1~14) | `univfx/Essentials/Prefabs/AuraDebug/` | 光环类逐步调试版本 |

---

## 验收清单小结

- [ ] 每个功能点都能打开对应示例运行、看到「预期效果」。
- [ ] 属性详解（02/03/04/06）的参数与 IDE 面板逐项对得上。
- [ ] 代码篇（05）的 API 片段对照 `src/*Demo.ts` 能跑通。
- [ ] 不一致项记录现象 + 截图，反馈给引擎开发同事。

---

*VFX Graph 教学文档集到此完整（00~07）。*
