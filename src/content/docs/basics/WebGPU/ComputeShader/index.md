---
title: "计算着色器（ComputeShader）"
description: "WebGPU Compute 是 WebGPU 提供的通用 GPU 计算能力，允许开发者在浏览器环境中通过计算着色器将高并行、计算密集型任务直接交由 GPU 执行，而不再局限于传统的“只为渲染服务”的图形管线。是把 Web 端引擎带入 “现代图形架构” 的关键一步。没有 Compute，WebGPU 只是…"
slug: "basics/webgpu/computeshader"
---

> Author: Charley

WebGPU Compute 是 WebGPU 提供的通用 GPU 计算能力，允许开发者在浏览器环境中通过计算着色器将高并行、计算密集型任务直接交由 GPU 执行，而不再局限于传统的“只为渲染服务”的图形管线。是把 Web 端引擎带入 “现代图形架构” 的关键一步。没有 Compute，WebGPU 只是 “更快的 WebGL” ，有了 Compute，它才让 Web 端图形能力逐步具备 “通用计算” 的现代特征。

## 1. 计算着色器简介

### 1.1 什么是计算着色器

计算着色器（Compute Shader）是一种在 GPU 上执行的**通用计算程序**。它不参与顶点变换或片元着色，也不直接输出到屏幕，而是通过 **StorageBuffer、StorageTexture 等可读写资源** 对 GPU 内存进行并行读写。这类资源读写主要体现在 WebGPU 计算路径中，引擎会基于 uniformMaps 自动生成绑定布局，开发者无需手工管理 binding。

与顶点 / 片元着色器相比，Compute Shader 的核心差异在于：

- **没有固定渲染阶段约束**：不依赖几何、不绑定光栅化
- **以工作组（Workgroup）为调度单位**：完全由开发者决定并行粒度
- **面向数据而非图形**：适合任何“可并行、可批量”的计算问题

从能力边界上看，它更接近 CUDA / OpenCL 的轻量版本，只是运行在 WebGPU 的安全沙箱中。

> 仅 WebGPU 模式上可用，WebGL 不支持

### 1.2 计算着色器的核心作用

计算着色器（Compute Shader）的核心价值不在于“能算”，而在于：

- **把高度并行、规则一致的计算从 CPU 迁移到 GPU**，降低 CPU 压力
- Compute Shader 可直接读写 Storage Texture 与 Storage Buffer，**避免 CPU ↔ GPU 之间频繁的数据往返与同步**
- **让 GPU 直接参与引擎运行时系统的构建过程**

Compute Shader 通常承担以下职责：

- GPU 剔除（Frustum / HiZ / 批次级剔除）
- 批处理与实例参数构建（Indirect Draw Args）
- 粒子、实例、动画数据的并行更新
- 图像与体数据的通用计算（滤波、模糊、统计）

这些任务的共同特征是：**数据量大、规则统一、可高度并行**。

### 1.3 能力边界与不适用场景

Compute Shader 并不是“GPU 上的万能函数”，它有明确的能力边界：

- 不适合分支极其复杂、线程发散严重的逻辑
- 不适合强顺序依赖、需要频繁跨线程同步的算法
- 不适合小数据量、低并行度的零散计算

在这些场景下，CPU 往往更高效、更易维护。

因此，一个健康的引擎架构应当遵循原则：

**Compute Shader 用于规模化、结构化的数据处理，而不是业务逻辑本身。**

明确这一点，才能避免“为了用 Compute 而用 Compute”的反模式。



## 2. 计算着色器在引擎中的能力支持

引擎对 Compute Shader 的支持，并不是简单“能跑一段 WGSL”，而是围绕**工程化可用性**建立了一整套机制，主要体现在三个层面。

### 2.1 资源系统集成

引擎注册了 `computeshader` 资源加载类型，允许 Compute Shader 以资源文件形式存在，并参与完整的资源生命周期管理（加载、缓存、复用、释放）。

- 支持 `.computeshader` 扩展名
- 内部结构完全沿用 `.shader` 的 `Shader3D Start / GLSL Start` 语法
- 由 `ComputeShaderLoader` 与 `ComputeShaderParser` 负责解析

这使得 Compute Shader 可以像材质、Shader 一样，被工程化管理，而不是零散的字符串代码。

### 2.2 GLSL → WGSL 的完整编译链

为了降低学习与迁移成本，引擎选择 **继续使用 GLSL 450 作为编写语言**，并在内部完成到 WebGPU 所需 WGSL 的转换：

1. GLSL 450 代码拼接（自动插入 layout / binding）
2. glslang 编译为 SPIR-V
3. Naga 将 SPIR-V 转换为 WGSL

这一流程完全自动完成，开发者无需直接接触 WGSL，也无需手动维护 binding 编号。

### 2.3 uniformMaps 驱动的资源绑定自动化

Compute Shader 的所有资源（uniform、texture、storage buffer 等）都通过 `uniformMaps` 声明。引擎会基于这些声明：

- 自动生成 WebGPU bind group layout
- 自动分配 set / binding 索引
- 自动处理 StorageBuffer / StorageTexture 的访问权限

开发者只需要保证 **GLSL 声明、uniformMaps、ShaderData 三者在语义上一致**，即可完成完整的资源绑定。



## 3. Compute Shader 的整体开发流程

从宏观上看，Compute Shader 的使用流程可以理解为一条清晰的管线：

**编写计算逻辑 → 声明资源 → 创建 Shader → 准备参数 → dispatch 执行**

### 3.1 编写 GLSL 计算代码

Compute Shader 必须声明本地工作组大小：

```
layout(local_size_x = 16, local_size_y = 16, local_size_z = 1) in;
```

`local_size` 决定了一个 workgroup 内的线程数量，是性能调优的重要参数。

### 3.2 声明 uniformMaps

`uniformMaps` 是一个 **数组**，每个元素对应一个 bind group。它定义了：

- 使用哪些资源
- 资源的类型（Uniform / Texture / Storage）
- Storage 资源的访问权限与格式

这是 Compute Shader 与引擎交互的核心契约。

### 3.3 创建 ComputeShader

ComputeShader 可以通过两种方式创建：

- **资源文件加载**：适合正式项目与可维护代码
- **代码动态创建**：适合运行时生成、调试、实验性逻辑

两种方式在底层完全一致。

### 3.4 准备 ShaderData

运行 Compute Shader 时，必须为每一个 uniformMap 准备一个对应的 `ShaderData`，并 **按索引顺序传入**。

uniformMaps[0] ↔ shaderData[0] uniformMaps[1] ↔ shaderData[1]

顺序不一致会导致绑定错位，这是最常见的错误来源之一。

### 3.5 dispatch 执行

Compute Shader 的执行推荐通过 ComputeCommandBuffer 发起，先添加 dispatch 命令，再在合适时机统一执行。

dispatch 的参数表示 workgroup 数量，而不是线程总数，因此需要结合 local_size 计算实际并行规模。



## 4. 资源文件结构与解析流程

### 4.1 ComputeShader 加载入口

`.computeshader` 文件由 `ComputeShaderLoader` 加载，内部直接调用 `ComputeShaderParser.parse()` 完成解析与编译。

从资源系统视角看，Compute Shader 与普通 Shader 没有本质区别。

### 4.2 Shader3D / GLSL 结构

Compute Shader 使用标准的 Shader3D 结构：

- `type: ComputeShader`
- `uniformMaps`: 资源声明
- `code`: 指向 GLSL 代码块

Parser 会负责：

- uniformMaps 的类型转换与默认值补齐
- StorageTexture / StorageBuffer 的特殊处理
- GLSL 代码提取与预处理



## 5. uniformMaps 规则详解

### 5.1 uniformMaps 是数组而不是对象

这一设计直接对应 WebGPU 的 **多 bind group 模型**。每一个 uniformMap 就是一个 bind group。

执行时：

- uniformMaps.length 必须等于 ShaderData[].length
- 索引顺序必须严格一致

### 5.2 StorageTexture2D 与 StorageBuffer 规则

- StorageTexture2D
  - 必须声明 `format`
  - 必须声明 `access`（read / write）
- StorageBuffer
  - 必须声明 `access`（readonly / readwrite）
  - 会映射为 DeviceBuffer 或 ReadOnlyDeviceBuffer

虽然引擎提供默认值，但在正式项目中**强烈建议显式声明**。

### 5.3 未声明资源的自动补齐机制

当 GLSL 中存在未在 uniformMaps 中声明的 uniform 或 SSBO 时，

引擎会在 WebGPU Compute 的 GLSL 预处理阶段将这些资源自动补充到第一个 uniformMap 中，并重新生成 bind group 布局。

这个机制用于提升调试与试验效率，但不建议作为长期依赖。



## 6. 编译流程与底层实现

### 6.1 ComputeShader 创建与缓存

`ComputeShader.createComputeShader()` 会以 name 作为 key 进行缓存，避免重复编译。

### 6.2 GLSL → SPIR-V → WGSL

Compute Shader 编译时会强制使用 `#version 450` ，并启用 `std430` 作为 SSBO 布局，

同时自动插入 set / binding 声明。

这些是 Compute 能正确映射到 WebGPU 的关键基础。



## 7. 自动绑定机制与 SSBO 约束

### 7.1 绑定点自动分配原则

每个 uniformMap 对应一个 bind group，组内 binding 从 0 递增。

Texture 会在 WebGPU 的绑定布局中拆分为 Texture 与 Sampler 两个 binding，Storage 资源直接使用 storage binding。

开发者无需手动维护绑定编号，但必须保证命名一致。

### 7.2 SSBO 必须使用 BlockName 匹配

GLSL 中 SSBO 必须使用：

```typescript
buffer BlockName {
  ...
} instanceName;
```

引擎使用 **BlockName** 进行匹配，而不是实例名。这意味着：

- uniformMap 中声明的名字
- ShaderData 中赋值的名字
- GLSL 中的 BlockName

三者必须完全一致。



## 8. 示例

### 8.1 资源文件方式

下面的示例采用 .shader 文件结构，定义 compute shader 资源文件


```glsl
Shader3D Start
{
    type: ComputeShader,
    name: "BlurTexture",
    uniformMaps: [
        {
            inputTex: { type: Texture2D },
            outputTex: { type: StorageTexture2D, format: "rgba8", access: "writeonly" },
        }
    ],
    code: "blur_CS",
}
Shader3D End

GLSL Start

#defineGLSL blur_CS
 
buffer s_Params {
    int filterDim;
    uint blockDim;
    uint value;
};

shared vec3 tile[4][128];

layout(local_size_x = 32, local_size_y = 1, local_size_z = 1) in;
void main()
{
    int filterOffset = (filterDim - 1) / 2;
    ivec2 dims = textureSize(inputTex, 0);

    ivec2 workGroup = ivec2(int(gl_WorkGroupID.x), int(gl_WorkGroupID.y));
    ivec2 local = ivec2(int(gl_LocalInvocationID.x), int(gl_LocalInvocationID.y));

    ivec2 baseIndex = workGroup * ivec2(int(blockDim), 4) + ivec2(local.x * 4, local.y * 1) - ivec2(filterOffset, 0);

    // load 4x4 block per thread
    for (int r = 0; r < 4; ++r) {
        for (int c = 0; c < 4; ++c) {
            ivec2 loadIndex = baseIndex + ivec2(c, r);
            if (value != 0u) {
                loadIndex = ivec2(loadIndex.y, loadIndex.x);
            }

            vec2 uv = (vec2(loadIndex) + vec2(0.5, 0.5)) / vec2(dims);
            vec3 col = textureLod(inputTex, uv, 0.0).rgb;
            int idx = 4 * local.x + c;
            tile[r][idx] = col;
        }
    }

    // ensure all loads visible
    barrier();

    // compute and write results
    for (int r = 0; r < 4; ++r) {
        for (int c = 0; c < 4; ++c) {
            ivec2 writeIndex = baseIndex + ivec2(c, r);
            if (value != 0u) {
                writeIndex = ivec2(writeIndex.y, writeIndex.x);
            }

            int center = 4 * local.x + c;
            if (center >= filterOffset && center < 128 - filterOffset && all(lessThan(writeIndex, dims))) {
                vec3 acc = vec3(0.0);
                float invFilter = 1.0 / float(filterDim);
                for (int f = 0; f < filterDim; ++f) {
                    int i = center + f - filterOffset;
                    acc += invFilter * tile[r][i];
                }
                imageStore(outputTex, writeIndex, vec4(acc, 1.0));
            }
        }
    }
}
GLSL End
```

该示例展示了 SSBO BlockName（s_Params）的实际用法，也展示了 StorageTexture2D 在 uniformMap 与 GLSL 中的对应关系。



### 8.2 使用 GLSL 代码动态创建 Compute Shader

**GLSL 示例代码：**

```glsl
#include "CullResourceCommon.glsl"

layout(local_size_x = 64, local_size_y = 1, local_size_z = 1) in;

void main()
{
    uint instanceIndex = gl_GlobalInvocationID.x;
    uint batchCount = u_getResultParamsArray[0].x;

    if (instanceIndex >= batchCount) {
        return;
    }

    // WGSL: atomicStore(&indirectArgs[instanceIndex].instanceCount, 0u);
    // GLSL: 使用 atomicExchange 实现原子赋值
    atomicExchange(indirectArgs[instanceIndex].instanceCount, 0u);

    indirectArgs[instanceIndex].instanceoffset = batchPosBuffer[instanceIndex];
}

```

**TypeScript 创建与绑定示例代码：**

```typescript
let uniformMap = Laya.LayaGL.renderDeviceFactory.createGlobalUniformMap("ComputeShaderName");
uniformMap.addShaderUniform(Laya.Shader3D.propertyNameToID("u_Image", "u_Image", Laya.ShaderDataType.StorageTexture2D, {format: "rgba8", access: "writeonly"});

let computeShader = Laya.ComputeShader.createComputeShader(`ComputeShaderName`, ComputeCode, [uniformMap]);
```

**注意要点：**

- `IndirectArgs` 是 SSBO 的 BlockName
- uniformMap、ShaderData、GLSL 中三者名称必须一致
- StorageBuffer 的访问权限需与 GLSL 行为匹配



### 8.3 ShaderData 与 dispatch 的对应关系说明

执行 Compute Shader 时，推荐使用 ComputeCommandBuffer 添加 dispatch 命令，并在统一时机执行。

这样可以避免直接调用底层 compute context。ShaderData 的数组顺序必须与 uniformMaps 对应。

示例如下：

```typescript
const cmd = new Laya.ComputeCommandBuffer();
cmd.addDispatchCommand(Laya.computeShader, Laya.shaderDefine, [shaderData0, shaderData1], new Laya.Vector3(x, y, z));
cmd.executeCMDs();
```



## 9. 常见问题与最佳实践

Compute Shader 初学阶段的问题，几乎都集中在**声明不一致**：

- uniformMaps 与 ShaderData 顺序不一致
- SSBO BlockName 不一致
- StorageTexture 未声明 format / access

建议：

- 所有资源声明显式、完整
- 命名严格一致
- 尽量减少依赖自动补齐机制

当 Compute Shader 能稳定跑通后，再逐步利用这些机制提升开发效率。

