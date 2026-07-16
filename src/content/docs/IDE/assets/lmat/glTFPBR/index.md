---
title: "基于物理渲染材质(glTF)"
description: "基于物理渲染材质(glTF)是LayaAir引擎中遵循glTF标准的PBR材质类型，对应的引擎类为 PBRMaterial。它与PBR标准材质（PBRStandardMaterial）共享大部分PBR属性，但在工作流和用途上有所不同。glTF PBR材质主要用于导入glTF/glb格式模型时自动关联的材质…"
slug: "ide/assets/lmat/gltfpbr"
---

> Author: Charley

基于物理渲染材质(glTF)是LayaAir引擎中遵循glTF标准的PBR材质类型，对应的引擎类为 `PBRMaterial`。它与PBR标准材质（`PBRStandardMaterial`）共享大部分PBR属性，但在工作流和用途上有所不同。glTF PBR材质主要用于导入glTF/glb格式模型时自动关联的材质，同时也可以在IDE中手动创建使用。

## 一、glTF PBR材质概述

### 1.1 什么是glTF

glTF（GL Transmission Format）是由Khronos Group制定的3D资产传输格式标准，被称为"3D界的JPEG"。glTF格式支持网格、材质、纹理、动画、骨骼等数据的高效传输和加载。

glTF标准定义了一套基于物理的材质模型（PBR Metallic-Roughness），即金属度-粗糙度工作流。LayaAir引擎的 `PBRMaterial` 类正是对这一标准的实现。

### 1.2 与PBR标准材质的关系

在LayaAir引擎中，PBR材质的类继承关系为：

```
Material → PBRMaterial → PBRStandardMaterial
```

- `PBRMaterial`：PBR材质基类，包含所有通用PBR属性（反照率、法线、遮蔽、自发光、各向异性、清漆层等）。在IDE中对应 **PBR(glTF)** Shader；
- `PBRStandardMaterial`：继承自 `PBRMaterial`，额外增加了金属度（metallic）和光滑度数据源（smoothnessSource）等属性。在IDE中对应 **PBR(Standard)** Shader。

### 1.3 两者的主要区别

| 对比项 | PBR(glTF) / PBRMaterial | PBR(Standard) / PBRStandardMaterial |
|---|---|---|
| 金属度属性 | 通过基类统一设置 | 提供独立的 `metallic` 属性 |
| 金属光滑度贴图 | 无独立属性 | 提供 `metallicGlossTexture` |
| 光滑度数据源 | 无 | 提供 `smoothnessSource` 选择 |
| 典型用途 | glTF/glb模型导入 | IDE中手动创建PBR材质 |
| glTF标准兼容 | 完全兼容 | 在glTF基础上扩展 |

### 1.4 适用场景

- **导入glTF/glb模型**：当在IDE中导入glTF或glb格式模型时，模型内嵌的材质会自动使用 `PBRMaterial`；
- **跨平台/跨引擎资产共享**：glTF是通用的3D格式标准，使用glTF PBR材质可以保持与其他软件（如Blender、3ds Max glTF导出器等）的材质一致性；
- **标准PBR工作流**：遵循Khronos标准的金属度-粗糙度工作流。

## 二、反照率（Albedo）

### 2.1 反照率颜色（albedoColor）

`albedoColor` 属性定义材质表面的基础颜色，类型为 `Color`。对应glTF标准中的 `baseColorFactor`。

![](./img/2-1.png)
（图2-1）

### 2.2 反照率贴图（albedoTexture）

`albedoTexture` 属性用于设置基础颜色贴图，对应glTF标准中的 `baseColorTexture`。贴图颜色与 `albedoColor` 相乘后决定最终基础颜色。

### 2.3 纹理平铺和偏移（tilingOffset）

`tilingOffset` 属性控制纹理在模型表面的重复和偏移，类型为 `Vector4`（X/Y为重复次数，Z/W为偏移量）。

## 三、光滑度（Smoothness）

### 3.1 光滑度（smoothness）

`smoothness` 属性描述表面的光滑程度，取值范围为0到1。光滑度越高，表面越光滑，镜面反射越强。

> 注意：glTF标准使用"粗糙度"（roughness）概念，其中 `粗糙度 = 1 - 光滑度`。LayaAir引擎统一使用光滑度进行参数设置。

### 3.2 光滑度贴图缩放（smoothnessTextureScale）

`smoothnessTextureScale` 属性用于缩放贴图中的光滑度值。

## 四、法线贴图（Normal Map）

### 4.1 法线贴图（normalTexture）

`normalTexture` 属性设置法线贴图，用于模拟表面凹凸细节。

### 4.2 法线贴图缩放系数（normalTextureScale）

`normalTextureScale` 属性控制法线贴图的影响强度。值越大，凹凸效果越明显。

## 五、遮蔽贴图（Occlusion Map）

### 5.1 遮蔽贴图（occlusionTexture）

`occlusionTexture` 属性设置环境光遮蔽贴图（AO），对应glTF标准中的 `occlusionTexture`。

### 5.2 遮蔽贴图强度（occlusionTextureStrength）

`occlusionTextureStrength` 属性控制遮蔽效果的强度，取值范围为0到1。

## 六、自发光（Emission）

### 6.1 开启自发光（enableEmission）

设置 `enableEmission` 为 `true` 开启自发光。对应glTF标准中的 `emissiveFactor` 和 `emissiveTexture`。

### 6.2 自发光属性

| 属性 | 类型 | 说明 |
|---|---|---|
| `emissionColor` | Color | 自发光颜色 |
| `emissionTexture` | BaseTexture | 自发光贴图 |
| `emissionIntensity` | number | 自发光强度 |

## 七、各向异性（Anisotropy）

### 7.1 开启各向异性（anisotropyEnable）

设置 `anisotropyEnable` 为 `true` 开启各向异性反射。

### 7.2 各向异性属性

| 属性 | 类型 | 说明 |
|---|---|---|
| `anisotropy` | number | 各向异性强度 |
| `anisotropyRotation` | number | 各向异性在切线空间中的旋转角度 |
| `anisotropyTexture` | Texture2D | 各向异性强度贴图 |

## 八、清漆层（Clear Coat）

### 8.1 开启清漆层（clearCoatEnable）

设置 `clearCoatEnable` 为 `true` 开启清漆层效果。对应glTF的 `KHR_materials_clearcoat` 扩展。

### 8.2 清漆层属性

| 属性 | 类型 | 说明 |
|---|---|---|
| `clearCoat` | number | 清漆层强度 |
| `clearCoatRoughness` | number | 清漆层粗糙度 |
| `clearCoatTexture` | BaseTexture | 清漆层强度贴图 |
| `clearCoatRoughnessTexture` | BaseTexture | 清漆层粗糙度贴图 |
| `clearCoatNormalTexture` | BaseTexture | 清漆层法线贴图 |

## 九、细节贴图与视差贴图

### 9.1 细节贴图

| 属性 | 类型 | 说明 |
|---|---|---|
| `detailAlbedoTexture` | BaseTexture | 细节反照率贴图 |
| `detailNormalTexture` | BaseTexture | 细节法线贴图 |
| `detailNormalScale` | number | 细节法线缩放系数 |
| `detailTilingOffset` | Vector4 | 细节贴图的平铺和偏移 |

### 9.2 视差贴图

| 属性 | 类型 | 说明 |
|---|---|---|
| `parallaxTexture` | BaseTexture | 视差贴图 |
| `parallaxTextureScale` | number | 视差贴图缩放系数 |

## 十、渲染模式与渲染质量

### 10.1 渲染模式（renderMode）

| 渲染模式 | 值 | 说明 |
|---|---|---|
| Opaque | 0 | 不透明渲染 |
| Cutout | 1 | Alpha裁剪 |
| Transparent | 2 | 半透明渲染 |
| Additive | 3 | 加色法混合 |

### 10.2 渲染质量（renderQuality）

`renderQuality` 属性用于设置PBR渲染质量，类型为 `PBRRenderQuality` 枚举，可在高质量（High）和低质量之间切换以适应不同平台的性能需求。默认值为 `PBRRenderQuality.High`。

## 十一、代码示例

### 11.1 加载glTF模型（材质自动创建）

`PBRMaterial` 是抽象基类，不能直接实例化。在实际使用中，通过导入 glTF/glb 模型，引擎会自动创建 `PBRMaterial` 实例并关联到模型上：

```typescript
// 加载glTF/glb模型，材质会自动使用PBRMaterial
Laya.loader.load("res/model/scene.gltf").then((res: any) => {
    let modelNode = res.create();
    scene3D.addChild(modelNode);
});
```

### 11.2 手动创建PBR材质

如果需要在代码中手动创建PBR材质，应使用其子类 `PBRStandardMaterial`。`PBRStandardMaterial` 继承了 `PBRMaterial` 的所有属性，同时扩展了金属度等属性：

```typescript
// PBRMaterial为抽象类，手动创建时使用子类PBRStandardMaterial
let pbrMat = new Laya.PBRStandardMaterial();

// 设置基础颜色
pbrMat.albedoColor = new Laya.Color(0.9, 0.9, 0.9, 1.0);

// 设置光滑度（继承自PBRMaterial的属性）
pbrMat.smoothness = 0.6;

// 加载纹理
Laya.loader.load("res/texture/baseColor.png").then((tex: Laya.Texture2D) => {
    pbrMat.albedoTexture = tex;
});

// 应用到模型
let meshRenderer = sprite3D.getComponent(Laya.MeshRenderer);
meshRenderer.sharedMaterial = pbrMat;
```

## 十二、注意事项

1. **导入模型自动使用**：通过IDE导入glTF/glb模型时，材质会自动使用glTF PBR类型，开发者一般不需要手动切换。

2. **与标准PBR可互换**：glTF PBR材质和标准PBR材质共享大部分属性。如需使用金属度等扩展属性，可在IDE中将Shader切换为PBR(Standard)。

3. **glTF扩展支持**：LayaAir引擎支持glTF的多种材质扩展（KHR_materials_clearcoat、KHR_materials_anisotropy等），导入模型时会自动解析这些扩展属性。

4. **默认渲染质量**：`renderQuality` 默认为高质量模式。在移动设备等低端平台上，可适当降低渲染质量以提升性能。
