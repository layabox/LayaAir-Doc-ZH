# 不受光材质

> Author: Charley

不受光材质（UnlitMaterial）是LayaAir引擎中一种不受灯光影响的材质类型。使用不受光材质的物体不会参与光照计算，直接显示纹理和颜色的原始外观。这使得它在特效、UI元素、调试可视化等不需要光照效果的场景中非常实用。

## 一、不受光材质概述

### 1.1 什么是不受光材质

不受光材质（Unlit）顾名思义，是一种"不点亮"的材质。在3D场景中，无论灯光如何设置——即使没有任何光源，使用不受光材质的物体也能正常显示其颜色和纹理，不会出现因无光而变黑的情况。

与BlinnPhong和PBR等感光材质相比，不受光材质的核心区别在于：

- **不参与光照计算**：不响应场景中的任何灯光（平行光、点光、聚光等）；
- **无高光和阴影**：材质表面不会产生高光反射、漫反射、阴影等光照效果；
- **显示原始颜色**：直接输出纹理颜色与反照率颜色的乘积结果。

![](img/1-1.png)
（图1-1）

### 1.2 适用场景

不受光材质在以下场景中特别有用：

| 场景 | 说明 |
|---|---|
| 特效制作 | 发光效果、魔法阵、光环等不需要光照影响的视觉效果 |
| UI元素 | 3D场景中的血条、名称标签、指示器等始终需要可见的元素 |
| 调试可视化 | 碰撞体可视化、路径显示、网格线框等调试辅助元素 |
| 卡通渲染 | 某些卡通风格不需要光照，直接用纹理表现明暗关系 |
| 天空盒/远景 | 不需要光照变化的远景装饰物 |
| 预烘焙光照 | 纹理中已包含光照信息（如光照贴图），不需要实时光照 |

### 1.3 类继承关系

```
Material → UnlitMaterial
```

在IDE中创建材质并选择 Unlit Shader时，使用的就是 `UnlitMaterial`。

## 二、反照率（Albedo）

### 2.1 反照率颜色（albedoColor）

`albedoColor` 属性定义材质表面的固有颜色，类型为 `Color`（RGBA）。由于不受光材质不参与光照计算，反照率颜色就是物体最终显示的颜色（与纹理颜色相乘）。

![](img/2-1.png)
（图2-1）

### 2.2 反照率贴图（albedoTexture）

`albedoTexture` 属性用于设置反照率贴图，提供逐像素的颜色细节。贴图颜色与 `albedoColor` 相乘后直接输出为最终渲染颜色。

![](img/2-2.png)
（图2-2）

### 2.3 反照率强度（albedoIntensity）

`albedoIntensity` 属性控制反照率的亮度强度，类型为 `number`。通过调节该值可以整体提亮或压暗颜色输出。

### 2.4 纹理平铺和偏移（tilingOffset）

`tilingOffset` 属性控制纹理在模型表面的重复次数和偏移量，类型为 `Vector4`：

| 分量 | 说明 |
|---|---|
| X | 纹理在U方向的重复次数（Tiling） |
| Y | 纹理在V方向的重复次数（Tiling） |
| Z | 纹理在U方向的偏移量（Offset） |
| W | 纹理在V方向的偏移量（Offset） |

## 三、顶点色

### 3.1 开启顶点色（enableVertexColor）

`enableVertexColor` 属性控制是否支持顶点颜色。开启后，网格顶点中携带的颜色信息将叠加到最终渲染结果中。

## 四、渲染模式（Render Mode）

不受光材质支持以下渲染模式，通过 `renderMode` 属性设置：

| 渲染模式 | 常量 | 值 | 说明 |
|---|---|---|---|
| 不透明 | `RENDERMODE_OPAQUE` | 0 | 默认模式，完全不透明渲染 |
| 透明裁剪 | `RENDERMODE_CUTOUT` | 1 | 根据Alpha阈值裁剪像素 |
| 透明混合 | `RENDERMODE_TRANSPARENT` | 2 | 半透明渲染，支持Alpha混合 |
| 加色法混合 | `RENDERMODE_ADDTIVE` | 3 | 加色法混合，常用于发光特效 |

> 提示：加色法混合模式（Additive）是不受光材质的一大特色，非常适合制作发光粒子、光圈、魔法阵等特效。在加色法模式下，材质颜色会与背景颜色叠加，产生越加越亮的效果。

## 五、属性汇总

以下是 `UnlitMaterial` 的完整属性列表：

| 属性 | 类型 | 说明 |
|---|---|---|
| `albedoColor` | Color | 反照率颜色 |
| `albedoTexture` | BaseTexture | 反照率贴图 |
| `albedoIntensity` | number | 反照率强度 |
| `tilingOffset` | Vector4 | 纹理平铺和偏移 |
| `enableVertexColor` | boolean | 是否支持顶点色 |
| `renderMode` | number | 渲染模式 |

## 六、代码示例

### 6.1 创建基础不受光材质

```typescript
// 创建不受光材质
let unlitMat = new Laya.UnlitMaterial();

// 设置颜色（纯红色）
unlitMat.albedoColor = new Laya.Color(1.0, 0.0, 0.0, 1.0);

// 应用到模型
let meshRenderer = sprite3D.getComponent(Laya.MeshRenderer);
meshRenderer.sharedMaterial = unlitMat;
```

### 6.2 带贴图的不受光材质

```typescript
let unlitMat = new Laya.UnlitMaterial();

// 加载纹理
Laya.loader.load("res/texture/sign.png").then((tex: Laya.Texture2D) => {
    unlitMat.albedoTexture = tex;
});

// 设置纹理平铺（重复3次）
unlitMat.tilingOffset = new Laya.Vector4(3, 3, 0, 0);

meshRenderer.sharedMaterial = unlitMat;
```

### 6.3 半透明不受光材质

```typescript
let unlitMat = new Laya.UnlitMaterial();

// 设置半透明颜色
unlitMat.albedoColor = new Laya.Color(0.0, 0.5, 1.0, 0.5);

// 使用透明混合模式
unlitMat.renderMode = Laya.UnlitMaterial.RENDERMODE_TRANSPARENT;

meshRenderer.sharedMaterial = unlitMat;
```

### 6.4 加色法发光效果

```typescript
let glowMat = new Laya.UnlitMaterial();

// 设置发光颜色
glowMat.albedoColor = new Laya.Color(0.0, 1.0, 0.8, 1.0);

// 加载发光纹理
Laya.loader.load("res/texture/glow.png").then((tex: Laya.Texture2D) => {
    glowMat.albedoTexture = tex;
});

// 使用加色法混合模式，产生发光效果
glowMat.renderMode = Laya.UnlitMaterial.RENDERMODE_ADDTIVE;

meshRenderer.sharedMaterial = glowMat;
```

## 七、注意事项

1. **性能最优**：由于不参与光照计算，不受光材质是所有材质类型中性能开销最低的，适合大量使用。

2. **不产生阴影**：不受光材质的物体不会产生投影阴影效果。如果需要阴影效果，应使用BlinnPhong或PBR材质。

3. **颜色直出**：不受光材质的最终颜色 = `albedoColor` × `albedoTexture` × `albedoIntensity` × 顶点颜色（如启用）。无论场景灯光如何变化，显示效果不受影响。

4. **默认材质禁止修改**：`UnlitMaterial.defaultMaterial` 为引擎内部默认材质，开发者不应修改。
