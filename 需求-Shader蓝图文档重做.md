# 需求文档：Shader 蓝图文档重做

提出：BurntBroccoli ｜ 日期：2026-07-27 ｜ 执行：待分配
现有文档：`src/content/docs/IDE/assets/blueprint/shaderBlueprint/index.md`

---

## 一、目标

**用现代化的表现手段，替代以前冗杂的部分。**

现有文档靠静态截图堆砌，正文冗长、信息密度低。重做后优先用可运行演示、交互组件、结构化表格承载信息。

**文档尽可能简明，字数越少越好。**

---

## 二、范围

蓝图文档是一个系列，**本次只交付前两篇**：

| 篇目 | 本次 |
|---|---|
| ① 入门基础（实际应用 / 启发式） | ✅ |
| ② API 参考 | ✅ |
| ③ 进阶扩展 | ❌ 后续补 |

结构上要为进阶篇留扩展位，不要写成一次性单篇。

---

## 三、需求

### 1. 解耦为两篇

| 文档 | 定位 |
|---|---|
| 实际应用文档 | 启发式，讲怎么用、怎么上手 |
| API 参考 | 查阅型，按需检索 |

各自独立成页。

### 2. 实际应用文档：精讲一个 Demo

**验收（硬性）：**

1. 按文档流程走，**必须跑通**
2. 流程中**可能遇到的问题，文档里要有对应说明**

即：不允许出现"照着做但做不出来、文档里也查不到原因"。

**Demo 选题（三选一或多选）：**

| 选题 | 备注 |
|---|---|
| 发光轮廓（描边） | **最好做一个 2D 的、一个 3D 的** |
| Blinn-Phong | |
| 溶解效果 | |

**选题原则：实现效果要尽可能真能解决游戏中常见的效果问题。**

### 3. 基础篇必含内容

用简明的话讲清：

1. 蓝图是**做什么的**
2. **学习路径**
3. **优势和局限性**
4. **编辑面板有哪些功能**
5. **节点类型的颜色代表什么**（源码依据见附录 B）

---

## 四、验收清单

| # | 验收项 |
|---|---|
| 1 | 已拆为「实际应用」「API 参考」两篇 |
| 2 | 实际应用文档精讲了 Demo，选题符合"解决常见效果问题" |
| 3 | **按文档流程可跑通** |
| 4 | **可能遇到的问题有对应说明** |
| 5 | 基础篇含需求 3 的 5 项 |
| 6 | 表现手段现代化，篇幅精简 |
| 7 | 为进阶篇留了扩展位 |

---

## 附录 A：现有文档已知问题（重做时一并处理）

**残缺**
- `### 2.3 ShaderName //待定项` —— 标题残留编辑标记，正文只有一句同义反复
- `### 2.4 ShadowCaster` —— 正文停在"开启此开关时，"，无下文

**技术错误**
- `mix / max` 释义写成"最小值，最大值" —— mix 是线性插值，不是 min
- `step / smoothstep` 释义 `x > value : 0.0 : 1.0` —— 表达式不成立且语义写反

**拼写**
`Assert窗口`→Assets、`Metallica`→Metallic、`alophatest`→alphaTest、`Aplha`→Alpha（3 处）、`ADDTIVE`→ADDITIVE、`子母键t`→字母键

**表现形式**
- 节点说明全是"一张截图 + 一句话"，节点名与参数名在图里，站内搜不到
- 截图均为 2022 年 11 月版本

---

## 附录 B：节点与颜色的源码依据

节点注册表：`LayaPro/src/shaderEditor/datas/BluePrintInit.ts`（3245 行）
颜色定义：`LayaPro/src/shaderEditor/datas/ConstValue.ts`

**节点数量：右键菜单可创建的节点 117 个**（按 `menuDir` 字段统计）。分类分布：

| 分类 | 数量 | 分类 | 数量 |
|---|---|---|---|
| function | 16 | inputdata/vertex | 6 |
| math/common | 13 | uv | 5 |
| basic | 13 | math/basic | 5 |
| math/trigonometry | 9 | inputdata/geometry | 5 |
| math/geometric | 8 | inputdata/tmp | 3 |
| math/exponential | 7 | shaderFunction / math/expression / math / effect / color | 各 2 |
| inputdata/camera | 7 | math/effect / inputdata/scene / inputdata/object / debug | 各 1 |
| texture | 6 | | |

> 数量按当前源码统计，是否随版本变动请自行复核。

**节点标题颜色**（`ConstValue.ts:144`，按 `menuDir` 取色，节点也可用 `titleColor` 单独覆盖）：

| 分类 | 色值 |
|---|---|
| outOnly（只有输出的节点） | `#8659B2` 紫 |
| basic | `#59B259` 绿 |
| texture | `#B37759` 棕 |
| math/basic | `#95B259` 黄绿 |
| uniform（Params 变量） | `#B35959` 红 |
| function | `#5977B3` 蓝 |

**端口颜色**（`SlotTypeColor`）按数据类型区分：白 / 黄 / 浅蓝 / 绿 / 黄 / 粉 / 蓝 / 紫 / 红 / 灰，共 11 档，对应 `ShaderType`（bool / int / float / bvec / ivec / vec / color / mat / sampler2D / samplerCube 等）。

---

## 附录 C：可用组件与参考文档

组件用法见站内《文档站写作与编辑指南》`/guides/authoring/` 第四章。

| 组件 | 用途 |
|---|---|
| `EngineEmbed` | 嵌入 LayaAir 发布产物，点击运行 |
| `VideoEmbed` | 视频 |
| `ImageCompare` | 前后对比滑块（改参数前后效果） |
| `FeatureTable` | 能力对照表（带支持度徽章） |
| `LiveDemo` | 页内可交互 Canvas |
| Starlight 内置 | `Steps`、`LinkCard`、`CardGrid`、`Tabs`、`:::note/:::tip/:::caution` |

**站内标杆**（同为节点图系统）：

- `/vfx-graph/operator/` —— API 参考写法：142 算子分层，特有的逐参数详解、通用的用速查表
- `/vfx-graph/ide-workflow/` —— 上手文档写法：含新手自检与调试排查表

---

## 附录 D：已明确的边界

- 文档标题、文件名、slug —— 不作要求
- 原文件如何处置 —— 不作要求
- 程序蓝图（BlueprintScript）—— 不需要与 Shader 蓝图做区分
