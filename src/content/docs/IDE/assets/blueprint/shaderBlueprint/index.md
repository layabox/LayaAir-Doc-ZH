---
title: "着色器蓝图"
description: "着色器蓝图让开发者用连线的方式可视化构建 Shader，不写 GLSL 也能做出完整的 PBR、Unlit、Blinnphong 材质，本页是入口导航与上手示例，详细内容见着色器蓝图文档集。"
slug: "ide/assets/blueprint/shaderblueprint"
---

着色器蓝图（Shader Blueprint）让开发者用连线的方式可视化地构建 Shader，不写一行 GLSL 也能做出
完整的 PBR、Unlit、Blinnphong 材质效果。

本页是入口与上手示例，完整内容见 **[着色器蓝图文档集](/shader-blueprint/)**。

## 文档导航

| 文档 | 内容 |
|---|---|
| [概念篇](/shader-blueprint/concepts/) | 蓝图是什么、`.bps` 与 `.bpsf` 两种资源、编译管线、类型系统与连线规则 |
| [IDE 操作流程](/shader-blueprint/ide-workflow/) | 创建、编辑器分区、加节点连线、Params 变量、快捷键、在材质与代码中使用 |
| [材质类型与终端](/shader-blueprint/terminals/) | PBR / Blinnphong / Unlit / Particle 四种终端的每一个输入槽、混合方式、渲染状态、附加 Pass |
| [节点手册 · 输入与坐标](/shader-blueprint/nodes-input/) | 常量、顶点与几何、相机、场景、光照、UV、纹理、程序化图形 |
| [节点手册 · 数学与逻辑](/shader-blueprint/nodes-math/) | 四则与常用函数、指数三角、几何向量、波形、矩阵、导数、逻辑分支、通道操作 |
| [节点手册 · 颜色与艺术效果](/shader-blueprint/nodes-color/) | 色彩空间、色相饱和度、22 种混合模式、法线处理、噪声、自定义 GLSL |
| [Unity ShaderGraph 对照](/shader-blueprint/unity-shadergraph/) | 162 条节点映射表、未覆盖清单、已知语义差异 |

## 快速上手

### 创建蓝图

在资源面板右键 Create 菜单选择 **着色器蓝图**，创建一个 `.bps` 文件。

> 蓝图文件未打开时，对应的 Shader 文件并未创建；打开蓝图文件时才会创建 Shader 文件，完成蓝图与 Shader 的映射对应。

 ![创建蓝图](./img/image-20221109201659272.png)

（图 1-1）

### 界面预览

![蓝图界面](./img/image-20221109202804652.png)

（图 1-2）

1. 蓝图文件 Inspector 窗口
2. 蓝图 Params 窗口
3. 蓝图文件 Pass 窗口
4. 蓝图预览窗口

各分区的详细说明见 [IDE 操作流程](/shader-blueprint/ide-workflow/#二编辑器分区)。

### 节点数据的传输方式

在蓝图中，一个节点左侧为输入数据，右侧为输出数据。输入数据可以来自一个源数据、Params 变量，
或者其他节点的输出。

  ![节点数据](./img/data.png)

（图 1-3）

## 示例一：显示一个简单的模型

 ![简单示例](./img/simple.png)

（图 2-1）

1. 通过 Params 传入一张纹理
2. 通过 UV 采样传入的纹理
3. 将从纹理中采样到的颜色作为 Unlit 的 Color 输入
4. 将世界法线传入 Unlit 的法线输入中

蓝图的结果展示如下：

 ![结果](./img/show1.png)

（图 2-2）

## 示例二：Blinnphong 材质球

![Blinnphong 示例](./img/blinphongShow.png)

（图 2-3）

1. 传入世界法线
2. 通过 Params 传入表面颜色

蓝图的结果展示如图：

 ![结果](./img/image-20221109173504079.png)

（图 2-4）

## 示例三：会随风摆动的草

 ![进阶示例](./img/simple2.png)

（图 3-1）

### 顶点着色器片段

1. 使用柏林噪声模拟出一个 vec4 的向量

 ![噪声](./img/image-20221111115321264.png)

（图 3-2）

2. 对噪声值进行变换

把生成的噪声值缩小 0.016，分别与外部传入的 Color 的 g 通道和 a 通道相乘，将分别乘完的结果求和，
将得到的和与一个干扰值相加，最后与世界矩阵相乘。

![变换](./img/image-20221111162359520.png)

（图 3-3）

3. 将与世界矩阵相乘完的结果取出 xz 分量，与 positionOS 的 xz 分量相加作为新的 positionOS 的 xz 分量

 ![位移](./img/image-20221111170752684.png)

（图 3-4）

### 片段着色器片段

1. 判断是否启用了 SNOW 宏：宏启用时计算 `1 - 顶点颜色 g 值的平方` 在 (0,1) 的结果，宏关闭时值为 0

 ![宏判断](./img/image-20221111172019508.png)

（图 3-5）

2. 将 UV 坐标偏移与一个三角函数组成的 2×2 矩阵相乘，再偏移回原来的位置

![UV 旋转](./img/image-20221111173037213.png)

（图 3-6）

3. 采样草体纹理贴图，提取其中 A 通道转换为伽马值作为草体的 Alpha 值传入 PBR 终端，
   BaseColor 为传入颜色值 × 纹理采样值 + 宏判断的值

![采样](./img/image-20221111195609867.png)

（图 3-7）

蓝图的结果展示如下：

 ![结果](./img/show2.png)

（图 3-8）

## 自定义函数

### 创建蓝图函数

在 Project 窗口右键 Create 菜单，选择 **着色器蓝图函数** 创建一个 `.bpsf` 文件。

 ![创建函数](./img/image-20221110104114705.png)

（图 4-1）

### 添加参数

在蓝图编辑窗口下，右键空白处，选择 ShaderFunction 选项，选择 Input In 选项卡。

 ![添加参数](./img/func.png)

（图 4-2）

### 自动返回值

在最后的 Default Output Result 节点，输入的数据类型决定了该 Shader 函数的输出类型，
函数蓝图会自动判断输出类型，如下图所示。

 ![返回值](./img/image-20221110105721791.png)

 ![返回值](./img/image-20221110105826038.png)

（图 4-3）

### 函数中调用函数

在蓝图函数界面，在需要放置蓝图函数节点的位置右键，在 CustomFun-BlueMap 项选择创建蓝图函数时
定义的函数（蓝图函数文件名）。

 ![嵌套调用](./img/image-20221110105132325.png)

（图 4-4）

## 快捷操作

长按对应按键，再用鼠标左键点击画布位置，即可快速生成节点：

| 按键 | 生成节点 | 按键 | 生成节点 |
| ---- | ---- | ---- | ---- |
| `1` | Float | `a` | add |
| `2` | Vector2 | `M` | minus |
| `3` | Vector3 | `m` | multiply |
| `4` | Vector4 | `d` | divide |
| `b` | Boolean | `o` | oneMinus |
| `I` | Int | `l` | mix |
| `i` | if | `e` | pow |
| `t` | sampler2D | `n` | normalize |
| `u` | uv1 | `p` | panner |

完整说明见 [IDE 操作流程 · 快捷键快速生成](/shader-blueprint/ide-workflow/#快捷键快速生成)。
