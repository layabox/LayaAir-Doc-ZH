---
title: "基于物理的渲染材质(PBR)"
description: "PBR（Physically Based Rendering，基于物理的渲染）材质是LayaAir引擎中最常用的高品质材质类型。它通过模拟自然界的物理光照规律，使3D模型呈现出更加真实的质感，能够准确还原金属、木材、塑料、皮革等各种不同材料的外观特征。"
slug: "ide/assets/lmat/pbr"
---

> Author: Charley

PBR（Physically Based Rendering，基于物理的渲染）材质是LayaAir引擎中最常用的高品质材质类型。它通过模拟自然界的物理光照规律，使3D模型呈现出更加真实的质感，能够准确还原金属、木材、塑料、皮革等各种不同材料的外观特征。

## 一、PBR材质概述

### 1.1 什么是PBR

PBR是一种基于物理规律的着色模型，其核心思想是通过物理上合理的方式来描述光线与材质表面的交互。与传统的光照模型（如Blinn-Phong）相比，PBR材质的优势在于：

- **物理正确性**：遵循能量守恒定律，光照效果更加真实；
- **直观的参数**：使用金属度、粗糙度等直观参数描述材质，美术调参更加方便；
- **环境一致性**：材质在不同的光照环境下都能呈现合理的效果。

### 1.2 PBR材质类的继承关系

在LayaAir引擎中，PBR材质的类继承关系为：

```
Material → PBRMaterial → PBRStandardMaterial
```

- `PBRMaterial`：PBR材质的基类，包含了PBR材质的通用属性（反照率、法线、遮蔽、自发光等）；
- `PBRStandardMaterial`：PBR标准材质，在 `PBRMaterial` 基础上增加了金属度工作流相关属性。

在IDE中创建材质并选择PBR（Standard）Shader时，使用的就是 `PBRStandardMaterial`。

## 二、反照率（Albedo）

反照率描述了材质表面的基础颜色，即物体本身的颜色（不包含光照信息）。

### 2.1 反照率颜色（albedoColor）

反照率颜色定义了材质表面的固有颜色，是一个RGBA值。

![](/IDE/assets/lmat/PBR/img/2-1.png)
（图2-1）

### 2.2 反照率贴图（albedoTexture）

反照率贴图用于提供逐像素的颜色信息，使材质表面呈现更丰富的细节。贴图颜色会与反照率颜色相乘。

![](/IDE/assets/lmat/PBR/img/2-2.png)
（图2-2）

### 2.3 纹理平铺和偏移（tilingOffset）

控制纹理在模型表面的重复次数和偏移量。类型为 `Vector4`，其中：
- X、Y分量：纹理在U、V方向的重复次数（Tiling）
- Z、W分量：纹理在U、V方向的偏移量（Offset）

## 三、金属度与光滑度

金属度和光滑度是PBR材质的核心参数，它们共同决定了材质对光线的反射方式。

### 3.1 金属度（metallic）

金属度描述物体表面在多大程度上像金属。取值范围为0到1：

| 值 | 说明 |
|---|---|
| 0 | 非金属（绝缘体），如木头、塑料、皮革等 |
| 1 | 纯金属，如金、银、铁等 |
| 0~1 | 过渡值，用于模拟带有氧化层或涂层的金属 |

![](/IDE/assets/lmat/PBR/img/3-1.gif)
（图3-1）

### 3.2 光滑度（smoothness）

光滑度描述物体表面的光滑程度。取值范围为0到1：

| 值 | 说明 |
|---|---|
| 0 | 完全粗糙，漫反射为主，如未打磨的石头 |
| 1 | 完全光滑，镜面反射为主，如镜子 |

![](/IDE/assets/lmat/PBR/img/3-2.gif)
（图3-2）

> 注意：在某些PBR工作流中，使用"粗糙度"（Roughness）代替光滑度，两者是互补关系：`粗糙度 = 1 - 光滑度`。

### 3.3 金属光滑度贴图（metallicGlossTexture）

金属光滑度贴图可以在一张纹理中同时提供金属度和光滑度信息，实现逐像素的精确控制。

### 3.4 光滑度数据源（smoothnessSource）

`smoothnessSource` 属性控制光滑度数据的来源，类型为 `PBRMetallicSmoothnessSource`：

| 值 | 说明 |
|---|---|
| 0 | 从金属光滑度贴图的Alpha通道读取 |
| 1 | 从反照率贴图的Alpha通道读取 |

## 四、法线贴图（Normal Map）

### 4.1 法线贴图（normalTexture）

法线贴图通过修改表面法线方向来模拟凹凸细节，而无需增加实际的几何面数。它可以让低面数模型呈现出丰富的表面细节效果。

![](/IDE/assets/lmat/PBR/img/4-1.png)
（图4-1）

### 4.2 法线贴图缩放系数（normalTextureScale）

控制法线贴图的影响强度。值越大，凹凸效果越明显；值为0时法线贴图不生效。

## 五、遮蔽贴图（Occlusion Map）

### 5.1 遮蔽贴图（occlusionTexture）

遮蔽贴图（也称AO贴图，Ambient Occlusion）用于模拟环境光在缝隙、角落等位置的遮蔽效果，使这些区域看起来更暗，增强立体感和真实感。
![](/IDE/assets/lmat/PBR/img/5-1.png)
（图5-1）

### 5.2 遮蔽贴图强度（occlusionTextureStrength）

控制遮蔽效果的强度，取值范围为0到1。值为1时遮蔽效果最强，值为0时无遮蔽效果。

## 六、自发光（Emission）

自发光效果使材质看起来像是自身在发光，常用于LED屏幕、霓虹灯、岩浆等效果。自发光不会对周围物体产生照明效果。

### 6.1 开启自发光（enableEmission）

通过设置 `enableEmission` 为 `true` 来开启自发光功能。

### 6.2 自发光颜色（emissionColor）

设置自发光的颜色。

### 6.3 自发光贴图（emissionTexture）

自发光贴图可以精确控制模型不同区域的发光效果和颜色。

### 6.4 自发光强度（emissionIntensity）

控制自发光的亮度强度。

## 七、各向异性（Anisotropy）

各向异性反射用于模拟在特定方向上具有不同反射特性的材质，如拉丝金属、丝绸、光盘等。

### 7.1 开启各向异性（anisotropyEnable）

设置 `anisotropyEnable` 为 `true` 开启各向异性功能。

### 7.2 各向异性属性

| 属性 | 类型 | 说明 |
|---|---|---|
| `anisotropy` | number | 各向异性强度 |
| `anisotropyRotation` | number | 各向异性在切线空间中的旋转角度 |
| `anisotropyTexture` | Texture2D | 各向异性强度贴图 |


![](/IDE/assets/lmat/PBR/img/7-1.png)
（图7-1)

## 八、清漆层（Clear Coat）

清漆层用于模拟表面有透明涂层的材质，如汽车漆面、漆器、包装薄膜等。

### 8.1 开启清漆层（clearCoatEnable）

设置 `clearCoatEnable` 为 `true` 开启清漆层。

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

细节贴图用于在近距离观察时为材质添加更多的表面细节：

| 属性 | 类型 | 说明 |
|---|---|---|
| `detailAlbedoTexture` | BaseTexture | 细节反照率贴图 |
| `detailNormalTexture` | BaseTexture | 细节法线贴图 |
| `detailNormalScale` | number | 细节法线缩放系数 |
| `detailTilingOffset` | Vector4 | 细节贴图的平铺和偏移 |

### 9.2 视差贴图

视差贴图通过偏移纹理坐标来模拟更强的深度效果：

| 属性 | 类型 | 说明 |
|---|---|---|
| `parallaxTexture` | BaseTexture | 视差贴图 |
| `parallaxTextureScale` | number | 视差贴图缩放系数 |

## 十、渲染模式

PBR材质支持以下渲染模式，通过 `renderMode` 属性设置：

| 渲染模式 | 值 | 说明 |
|---|---|---|
| Opaque | 0 | 不透明渲染，默认模式，性能最优 |
| Cutout | 1 | Alpha裁剪，根据Alpha阈值决定像素是否可见 |
| Transparent | 2 | 半透明渲染，支持Alpha混合 |
| Additive | 3 | 加色法混合渲染 |

### 10.1 渲染质量（renderQuality）

PBR材质还提供了渲染质量设置（`PBRRenderQuality` 枚举），可在高质量和低质量之间切换，以适应不同平台的性能需求。

## 十一、其他属性

| 属性 | 类型 | 说明 |
|---|---|---|
| `enableVertexColor` | boolean | 是否支持顶点色，开启后可叠加网格的顶点颜色 |

## 十二、代码示例

### 12.1 创建PBR标准材质

```typescript
// 创建PBR标准材质
let pbrMat = new Laya.PBRStandardMaterial();

// 设置反照率
pbrMat.albedoColor = new Laya.Color(0.8, 0.2, 0.2, 1.0);

// 设置金属度和光滑度
pbrMat.metallic = 0.9;
pbrMat.smoothness = 0.7;

// 加载反照率贴图
Laya.loader.load("res/texture/albedo.png").then((tex: Laya.Texture2D) => {
    pbrMat.albedoTexture = tex;
});

// 加载法线贴图
Laya.loader.load("res/texture/normal.png").then((tex: Laya.Texture2D) => {
    pbrMat.normalTexture = tex;
    pbrMat.normalTextureScale = 1.0;
});

// 设置渲染模式为不透明
pbrMat.renderMode = Laya.PBRMaterial.RENDERMODE_OPAQUE;

// 应用到模型
let meshRenderer = sprite3D.getComponent(Laya.MeshRenderer);
meshRenderer.sharedMaterial = pbrMat;
```

### 12.2 创建自发光PBR材质

```typescript
let emissiveMat = new Laya.PBRStandardMaterial();
emissiveMat.albedoColor = new Laya.Color(0.1, 0.1, 0.1, 1.0);
emissiveMat.metallic = 0.0;
emissiveMat.smoothness = 0.5;

// 开启自发光
emissiveMat.enableEmission = true;
emissiveMat.emissionColor = new Laya.Color(0, 1, 0.5, 1);
emissiveMat.emissionIntensity = 2.0;

meshRenderer.sharedMaterial = emissiveMat;
```

### 12.3 创建各向异性PBR材质

```typescript
let anisotropicMat = new Laya.PBRStandardMaterial();
anisotropicMat.albedoColor = new Laya.Color(0.8, 0.8, 0.8, 1.0);
anisotropicMat.metallic = 1.0;
anisotropicMat.smoothness = 0.8;

// 开启各向异性
anisotropicMat.anisotropyEnable = true;
anisotropicMat.anisotropy = 0.8;
anisotropicMat.anisotropyRotation = 0.0;

meshRenderer.sharedMaterial = anisotropicMat;
```
