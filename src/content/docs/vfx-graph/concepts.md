---
title: "概念篇 — VFX Graph 是什么"
description: "建立对 LayaAir VFX Graph 的初步认知：它是什么、解决什么痛点、四层节点体系、纵向处理流与横向表达式双工作流、资源与运行模型、典型应用场景，以及仅支持 WebGPU 的平台约束。"
slug: "vfx-graph/concepts"
---

> 本篇帮你建立对 VFX Graph 的初步认知：它是什么、解决什么问题、用在哪、有哪些核心概念。**先读这一篇，再去动手。**

---

## 1. 一句话定位

**VFX Graph 是 LayaAir 3.x 的 GPU 驱动可视化特效系统** —— 用「连节点」的方式编辑大规模粒子 / Mesh / 拖尾等视觉特效，模拟与渲染全部在 GPU（Compute Shader）上完成。

它对标 Unity 的 Visual Effect Graph，工作流、节点体系、术语高度一致。如果你用过 Unity VFX Graph，几乎可以无缝迁移认知。

---

## 2. 解决什么痛点

传统的 CPU 粒子系统（逐粒子在 CPU 上算位置/速度/碰撞，再上传到 GPU 绘制）有两个硬上限：

| 痛点 | CPU 粒子 | VFX Graph（GPU） |
|---|---|---|
| **数量** | 几千个粒子就开始卡（CPU 算不动 + 上传带宽瓶颈） | 几万~几十万粒子轻松跑，模拟在 GPU 并行 |
| **复杂行为** | 碰撞、SDF、矢量场、湍流等每帧逐粒子算，CPU 扛不住 | 全部在 Compute Shader 里并行，几乎零 CPU 成本 |

**核心价值**：把粒子的「生成 → 初始化 → 每帧更新 → 渲染」整条链路搬到 GPU，用可视化节点图描述，既能做海量粒子，又不写一行 shader。

---

## 3. 主要特点

- **GPU 全流程**：Spawn 计数、属性初始化、每帧积分/力场/碰撞、渲染，全在 GPU。
- **可视化节点编辑**：四层节点（Event / Context / Block / Operator）拖拽连线即可，无需手写 Compute Shader。
- **数据驱动**：图级属性（Property）+ Blackboard 暴露，运行时代码可动态读写（调速率、改颜色、换贴图）。
- **多种渲染形态**：Billboard（朝相机面片）、Mesh、Trail（拖尾）、Line / LineStrip、Point、Cube、Distortion（屏幕扭曲）、ShaderGraph 自定义着色等。
- **GPU 事件链**：粒子可在死亡 / 进入区域时触发另一组粒子（如烟花主弹炸开子弹），纯 GPU 无 CPU 往返。
- **与 Unity 对齐**：节点语义对标 Unity VFX Graph 17.3，并配套 Unity `.vfx` → Laya 转换工具链。

---

## 4. 核心概念：四层节点体系

VFX Graph 的图由四种节点组成，从大到小：

```
Event  ──flow──►  Context  ┐
                           │ 内含
                         Block（堆叠在 Context 里，从上到下顺序执行）
                           ▲
                           │ slot 输入
                        Operator（独立计算节点，算出值喂给 Block 的参数）
```

| 层级 | 是什么 | 举例 |
|---|---|---|
| **Event（事件）** | 整张图的触发入口 | `OnPlay`（组件 play 时）、`OnStop`、自定义事件、GPUEvent |
| **Context（上下文）** | 生命周期阶段容器，靠 flow 连成处理流水线 | Spawn / Initialize / Update / Output |
| **Block（块）** | 堆在 Context 里的「行为单元」，**唯一能写粒子属性的元素** | Set Position、Gravity、Collision、Color over Life |
| **Operator（运算符）** | 独立的纯计算节点，输出值连到 Block 的输入插槽 | add / multiply / sampleCurve / noise / getAttribute |

---

## 5. 双工作流：纵向处理流 + 横向表达式网络

理解这两个方向，就理解了整个图：

```
纵向（处理工作流，flow 连接）              横向（属性工作流，slot 连接）
─────────────────────────────            ───────────────────────────────
 Event                                     Operator ── Operator ─┐
   │                                                             ▼
 Spawn   ← 决定生成节奏（每秒几个）          Blackboard Property ──► Block 的输入参数
   │
 Initialize ← 粒子诞生时一次性设初值
   │
 Update  ← 每帧更新所有活粒子（力/碰撞/...）
   │
 Output  ← 每帧把活粒子画出来
```

- **纵向**：Context 之间用 `flow` 端口连接，定义粒子的生命周期顺序：**Event → Spawn → Initialize → Update → Output**。
- **横向**：Operator 组成表达式网络，输出值通过 `slot` 连到 Block 的参数端口；Blackboard 的图级属性也从这里喂入。

> 详细执行链路（每个阶段干什么）见 [IDE 操作流程](/vfx-graph/ide-workflow/) 第 3 节。

---

## 6. 资源与运行模型

```
.vfx  （节点图源文件，在 IDE「VFX Graph」面板里编辑）
  │
  │  导入/保存时编辑器编译
  ▼
.lvfx （运行时资源） + 一组 *.computeshader 子资产
  │
  │  VisualEffect 组件加载
  ▼
运行时：GPU Compute 模拟 + VFXRenderer 渲染
```

- **`.vfx`**：你编辑的节点图源文件。
- **`.lvfx` + computeshader**：编辑器把 `.vfx` 编译出的运行时产物（开发者一般不用手动管，IDE import 时自动生成）。
- **`VisualEffect` 组件**：挂在场景 `Sprite3D` 上，加载 `.vfx`/`.lvfx` 资源并驱动模拟；自动连带 `VFXRenderer` 负责绘制。

---

## 7. 典型应用场景

- **战斗特效**：技能命中、爆炸、冲击波、能量光环、Buff 光圈。
- **环境氛围**：火焰、烟雾、飘雪、落叶、萤火虫、瀑布水花。
- **拖尾光效**：子弹拖尾、刀光、能量束、闪电。
- **角色相关**：传送 / 溶解（配合 SkinnedMesh 采样让粒子贴在角色表面）、受击火星。
- **大规模场景**：星空、粒子海洋、点云可视化（几万~几十万粒子）。

> 本工程 `assets/resources/univfx/` 下有大量美术级游戏特效（光环 / 屏障 / 治疗 / 导弹 / 传送 / 溶解等）可直接参考。

---

## 8. 平台约束（重要）

> ⚠️ **VFX Graph 仅在 WebGPU 渲染后端下运行。**

- **原因**：GPU 粒子系统依赖 Compute Shader、StorageBuffer、IndirectDraw 等能力，**WebGL2 不支持**这些，WebGPU 原生支持。
- **影响**：项目需开启 WebGPU 后端；不需要考虑 WebGL 兼容或降级方案。
- 粒子不显示时，第一件事就是确认浏览器/设备是否启用了 WebGPU（见 01 篇调试表）。

---

## 9. 与 Unity VFX Graph 的关系

- **对标版本**：Unity Visual Effect Graph 17.3。
- **覆盖率**（持续完善中）：Block ~95% / Operator ~92% / Context ~80%。
- **迁移工具**：本工程 `tools/unity-vfx-to-laya.js` 可把 Unity `.vfx` 转成 Laya `.vfx`；`shadertools/unity-shader-to-laya.js` 转 ShaderGraph。
- **术语保持一致**：Context / Block / Operator / Spawn / Initialize / Update / Output 等不强行翻译，方便对照 Unity 文档。

---

## 下一步

➡️ 读 [IDE 操作流程](/vfx-graph/ide-workflow/)，跟着步骤在编辑器里从零做出第一个 VFX。
