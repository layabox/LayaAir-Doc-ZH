---
title: "拖尾材质"
description: "拖尾材质（TrailMaterial）是LayaAir引擎中专门用于拖尾特效渲染的材质类型。拖尾效果常见于带有条状运动轨迹的3D特效中，如刀光拖尾、跑酷游戏中的运动轨迹、子弹飞行轨迹等。引擎内置了拖尾系统（TrailRenderer）和拖尾材质，开发者可以便捷地实现各种拖尾视觉效果。"
slug: "ide/assets/lmat/trail"
---

> Author: Charley

拖尾材质（TrailMaterial）是LayaAir引擎中专门用于拖尾特效渲染的材质类型。拖尾效果常见于带有条状运动轨迹的3D特效中，如刀光拖尾、跑酷游戏中的运动轨迹、子弹飞行轨迹等。引擎内置了拖尾系统（TrailRenderer）和拖尾材质，开发者可以便捷地实现各种拖尾视觉效果。

## 一、拖尾材质概述

### 1.1 什么是拖尾

拖尾是物体运动后留下的条状轨迹效果，类似流星划过天空时留下的尾迹。在游戏中，拖尾特效广泛应用于：

- **武器特效**：刀剑挥舞的光带、魔法武器的轨迹；
- **运动轨迹**：角色或物体移动时留下的尾迹；
- **子弹弹道**：子弹或飞行物的飞行轨迹；
- **装饰特效**：光圈、光带等装饰性视觉效果。

### 1.2 类继承关系

```
Material → TrailMaterial
```

拖尾材质的属性相对简洁，主要包含颜色、纹理和渲染模式设置。

## 二、属性详解

### 2.1 颜色（color）

`color` 属性设置拖尾的颜色，类型为 `Color`。颜色会与纹理颜色相乘产生最终效果。

![](./img/2-1.gif)
（图2-1）

### 2.2 贴图（texture）

`texture` 属性用于设置拖尾的纹理贴图，类型为 `BaseTexture`。纹理会沿着拖尾的延伸方向进行贴图映射。

![](./img/2-2.jpg)
（图2-2）

### 2.3 纹理平铺和偏移（tilingOffset）

`tilingOffset` 属性控制纹理在拖尾上的重复次数和偏移量，类型为 `Vector4`：

| 分量 | 说明 |
|---|---|
| X | 纹理在U方向的重复次数（Tiling） |
| Y | 纹理在V方向的重复次数（Tiling） |
| Z | 纹理在U方向的偏移量（Offset） |
| W | 纹理在V方向的偏移量（Offset） |

### 2.4 渲染模式（renderMode）

拖尾材质支持以下渲染模式：

| 渲染模式 | 常量 | 值 | 说明 |
|---|---|---|---|
| 透明混合 | `RENDERMODE_ALPHABLENDED` | 0 | 透明混合模式，默认模式 |
| 加色法混合 | `RENDERMODE_ADDTIVE` | 1 | 加色法混合，适合发光拖尾效果 |

> 提示：拖尾特效通常使用透明或加色法混合模式。透明混合适合烟雾、丝带等半透明拖尾；加色法混合适合光剑、电弧等发光拖尾效果。

## 三、属性汇总

| 属性 | 类型 | 说明 |
|---|---|---|
| `color` | Color | 拖尾颜色 |
| `texture` | BaseTexture | 拖尾纹理贴图 |
| `tilingOffset` | Vector4 | 纹理平铺和偏移 |
| `renderMode` | number | 渲染模式（0=透明混合，1=加色法混合） |

## 四、代码示例

### 4.1 创建基础拖尾材质

```typescript
// 创建拖尾材质
let trailMat = new Laya.TrailMaterial();

// 设置颜色（白色半透明）
trailMat.color = new Laya.Color(1.0, 1.0, 1.0, 0.8);

// 设置渲染模式为透明混合
trailMat.renderMode = Laya.TrailMaterial.RENDERMODE_ALPHABLENDED;

// 将材质应用到拖尾渲染器
let trailRenderer = sprite3D.getComponent(Laya.TrailRenderer);
trailRenderer.sharedMaterial = trailMat;
```

### 4.2 发光拖尾效果

```typescript
let glowTrailMat = new Laya.TrailMaterial();

// 设置发光颜色
glowTrailMat.color = new Laya.Color(0.2, 0.5, 1.0, 1.0);

// 加载拖尾纹理
Laya.loader.load("res/texture/trail_glow.png").then((tex: Laya.Texture2D) => {
    glowTrailMat.texture = tex;
});

// 使用加色法混合产生发光效果
glowTrailMat.renderMode = Laya.TrailMaterial.RENDERMODE_ADDTIVE;

trailRenderer.sharedMaterial = glowTrailMat;
```

### 4.3 带纹理平铺的拖尾

```typescript
let trailMat = new Laya.TrailMaterial();
trailMat.color = new Laya.Color(1.0, 0.8, 0.2, 1.0);

// 加载纹理并设置平铺
Laya.loader.load("res/texture/trail_pattern.png").then((tex: Laya.Texture2D) => {
    trailMat.texture = tex;
});

// 设置纹理沿拖尾方向重复3次
trailMat.tilingOffset = new Laya.Vector4(3, 1, 0, 0);

trailRenderer.sharedMaterial = trailMat;
```

## 五、注意事项

1. **配合TrailRenderer使用**：拖尾材质需要配合 `TrailRenderer` 组件使用，单独设置材质并无效果。`TrailRenderer` 组件负责生成拖尾网格，材质负责控制拖尾的视觉表现。

2. **默认渲染模式**：拖尾材质只有透明混合和加色法混合两种渲染模式，不支持不透明（Opaque）模式，因为拖尾本质上需要与背景进行混合。

3. **性能考量**：拖尾的性能开销主要取决于拖尾长度（段数）和宽度。过长或过密的拖尾会增加顶点数量和绘制调用。

4. **默认材质禁止修改**：`TrailMaterial.defaultMaterial` 为引擎内部默认材质，开发者不应修改。
