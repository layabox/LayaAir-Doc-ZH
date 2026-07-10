---
title: "拖尾渲染器（TrailRenderer）"
description: "拖尾渲染器（TrailRenderer）用于在3D场景中制作跟随物体运动的拖尾效果，例如残影、烟雾轨迹、光剑拖尾等。它会在物体经过的路径上生成带状网格，并随时间逐渐淡出消失。"
slug: "ide/component/3drender/trailrenderer"
---

## 一、概述

拖尾渲染器（`TrailRenderer`）用于在3D场景中制作跟随物体运动的拖尾效果，例如残影、烟雾轨迹、光剑拖尾等。它会在物体经过的路径上生成带状网格，并随时间逐渐淡出消失。

<img src="/IDE/Component/Trail/img/1-1.gif" alt="img" style="zoom: 50%;" />

（动图1-1）

`TrailRenderer` 继承自 `BaseRender`，在引擎内部通过 `TrailFilter` 管理拖尾的几何形状生成逻辑。开发者在IDE中通过 Trail Renderer 组件配置属性，也可以通过代码动态控制。



## 二、IDE中创建与使用

### 2.1 创建拖尾对象

在3D场景的 Hierarchy 窗口中，可以在任何节点下或空白位置通过鼠标右键创建拖尾对象，如动图2-1所示：

<img src="/IDE/Component/Trail/img/2-1.gif" style="zoom: 43%;" />

（动图2-1）

创建后，会生成一个空节点并自动添加 `TrailRenderer` 组件。此时场景中看不到任何效果，需要进一步配置材质和属性。

也可以在已有节点上手动添加组件：选中节点 -> Inspector 面板 -> Add Component -> Trail Renderer。



### 2.2 基础属性

TrailRenderer 继承自 BaseRender，因此具备基础渲染器属性，如图2-2和图2-3所示：

<img src="/IDE/Component/Trail/img/2-2.png" style="zoom:50%;" />

（图2-2）

<img src="/IDE/Component/Trail/img/2-3.png" style="zoom:50%;" />

（图2-3）

基础属性包括：

| 属性 | 说明 |
| --- | --- |
| Receive Shadow | 是否接收阴影 |
| Cast Shadow | 是否产生阴影 |
| Lightmap Scale Offset | 光照贴图的缩放和偏移 |



## 三、拖尾材质

拖尾渲染器需要使用 `Laya.Trail` Shader 的材质来显示效果。

### 3.1 创建材质

在 Assets 面板中新建一个 Material，默认 Shader 为 BlinnPhong。将 Shader 切换为 `Laya.Trail`，如动图3-1所示：

<img src="/IDE/Component/Trail/img/2-4.gif" style="zoom: 50%;" />

（动图3-1）

### 3.2 材质属性

Laya.Trail Shader 的材质属性如图3-2所示：

<img src="/IDE/Component/Trail/img/2-5.png" alt="image-20221226104854987" style="zoom:50%;" />

（图3-2）

| 属性 | 说明 |
| --- | --- |
| Main Texture | 拖尾纹理贴图 |
| Main Color | 拖尾纹理颜色 |
| Material Render Mode | 渲染模式（Opaque、Additive 等） |
| Cull | 剔除模式（Back、Front、Off） |

### 3.3 设置贴图

要制作拖尾效果，需要一张拖尾纹理贴图。例如下图是一张常用的拖尾纹理：

![](/IDE/Component/Trail/img/2-6.jpg)

（图3-3）

将纹理贴图拖入材质的 Main Texture 属性中：

<img src="/IDE/Component/Trail/img/2-7.gif" style="zoom:50%;" />

（动图3-4）

### 3.4 颜色与渲染模式

为实现烟雾等半透明效果，可以调整材质颜色和透明度。例如设置为灰色半透明：

<img src="/IDE/Component/Trail/img/2-8.png" alt="image-20221226105620269" style="zoom: 50%;" />

（图3-5）

同时需要将 `Material Render Mode` 设为 `Additive` 模式（使贴图中黑色区域变为透明），并将 `Cull` 设为 `Off`（双面显示）：

<img src="/IDE/Component/Trail/img/2-9.png" alt="image-20221226115732845" style="zoom:50%;" />

（图3-6）

配置完成后效果如动图3-7：

<img src="/IDE/Component/Trail/img/2-10.gif" style="zoom:50%;" />

（动图3-7）



## 四、拖尾过滤器属性

拖尾过滤器（TrailFilter）控制拖尾的几何形状，包括时间、轨迹、宽度等。在 Inspector 面板中，这些属性显示在 Trail Renderer 组件下方，如图4-1所示：

<img src="/IDE/Component/Trail/img/2-11.png" alt="image-20221226105829772" style="zoom:55%;" />

（图4-1）

### 4.1 淡出时间（Time）

`Time`：拖尾段从创建到完全消失的持续时间，单位为秒。值越大，拖尾越长。

默认值为 5 秒：

<img src="/IDE/Component/Trail/img/2-12.gif" style="zoom:50%;" />

（动图4-2）

调整为 1 秒后效果明显缩短：

<img src="/IDE/Component/Trail/img/2-13.gif" style="zoom:50%;" />

（动图4-3）

### 4.2 轨迹准线（Alignment）

`Alignment`：设置拖尾面片的朝向方式。

| 值 | 说明 |
| --- | --- |
| View | 拖尾始终面向摄像机（默认） |
| TransformZ | 拖尾朝向其自身 Transform 的 Z 轴方向 |

### 4.3 最小顶点距离（Min Vertex Distance）

`Min Vertex Distance`：新旧顶点之间的最小距离（世界单位）。该值决定拖尾的细分精度：

- **值越小**（如 0.1）：顶点越密集，拖尾曲线越平滑，但性能消耗越大
- **值越大**（如 1.5）：顶点越稀疏，拖尾外观可能出现锯齿

> 出于性能考虑，建议使用能够实现所需效果的最大值。

### 4.4 宽度设置（Width）

`Width`：通过宽度值和曲线控制拖尾沿长度方向的宽度变化。

- **宽度倍数**（`widthMultiplier`）：控制整体宽度
- **宽度曲线**（`widthCurve`）：在每个顶点处采样以确定该位置的宽度比例，最多支持 10 个关键帧

在 IDE 中可以通过双击曲线上的红线添加节点，拖动白色旋转手柄调整曲线，双击节点可删除：

<img src="/IDE/Component/Trail/img/2-14.gif" style="zoom:50%;" />

（动图4-4）

### 4.5 颜色设置（Color）

`Color`：使用 `Gradient`（颜色梯度）设置拖尾沿长度方向的颜色变化，支持两种模式：

| 模式 | 说明 |
| --- | --- |
| Fixed | 固定颜色 |
| Blend | 混合渐变 |

如图4-5所示，设置从半透明到白色再到半透明的渐变效果：

<img src="/IDE/Component/Trail/img/2-15.png" alt="image-20221226111319095" style="zoom:50%;" />

（图4-5）

### 4.6 纹理模式（Texture Mode）

`Texture Mode`：控制纹理贴图在拖尾上的映射方式。

| 模式 | 说明 |
| --- | --- |
| Stretch | 将纹理拉伸应用到轨迹的整个长度（常用） |
| Tile | 纹理沿轨迹长度平铺重复 |

Tile 平铺效果：

<img src="/IDE/Component/Trail/img/2-16.gif" style="zoom:50%;" />

（动图4-6）

Stretch 拉伸效果（推荐）：

<img src="/IDE/Component/Trail/img/2-17.gif" style="zoom:50%;" />

（动图4-7）



## 五、代码使用

### 5.1 创建拖尾

通过代码为节点添加 TrailRenderer 组件：

```typescript
const { regClass, property } = Laya;

@regClass()
export class TrailDemo extends Laya.Script {

    onAwake(): void {
        let sprite3D = this.owner as Laya.Sprite3D;

        // 添加拖尾渲染器
        let trailRenderer = sprite3D.addComponent(Laya.TrailRenderer);

        // 设置拖尾材质（需要使用 Laya.Trail Shader）
        Laya.loader.load("res/trail/trailMat.lmat").then((mat: Laya.Material) => {
            trailRenderer.material = mat;
        });
    }
}
```

### 5.2 动态修改属性

运行时可以通过代码动态调整拖尾参数：

```typescript
let trailRenderer = node.getComponent(Laya.TrailRenderer);

// 设置淡出时间（秒）
trailRenderer.time = 2.0;

// 设置最小顶点距离
trailRenderer.minVertexDistance = 0.5;

// 设置宽度倍数
trailRenderer.widthMultiplier = 1.5;

// 设置纹理模式
trailRenderer.textureMode = Laya.TrailTextureMode.Stretch;

// 设置轨迹准线
trailRenderer.alignment = Laya.TrailAlignment.View;
```

### 5.3 设置宽度曲线

通过 `FloatKeyframe` 数组控制拖尾宽度沿长度的变化（最多 10 个关键帧）：

```typescript
let trailRenderer = node.getComponent(Laya.TrailRenderer);

// 创建宽度曲线关键帧：从宽到窄
let keyFrames: Laya.FloatKeyframe[] = [];

let startKey = new Laya.FloatKeyframe();
startKey.time = 0;       // 起始位置
startKey.inTangent = 0;
startKey.outTangent = 0;
startKey.value = 1.0;    // 起始宽度比例

let endKey = new Laya.FloatKeyframe();
endKey.time = 1;         // 结束位置
endKey.inTangent = 0;
endKey.outTangent = 0;
endKey.value = 0.0;      // 结束宽度比例（逐渐变窄）

keyFrames.push(startKey, endKey);
trailRenderer.widthCurve = keyFrames;
```

### 5.4 设置颜色梯度

通过 `Gradient` 设置拖尾颜色沿长度的渐变：

```typescript
let trailRenderer = node.getComponent(Laya.TrailRenderer);

let gradient = new Laya.Gradient(2, 2);

// 设置颜色关键帧（从白色到白色）
gradient.addColorRGB(0, new Laya.Color(1, 1, 1, 1));
gradient.addColorRGB(1, new Laya.Color(1, 1, 1, 1));

// 设置透明度关键帧（从不透明到完全透明）
gradient.addColorAlpha(0, 1.0);
gradient.addColorAlpha(1, 0.0);

trailRenderer.colorGradient = gradient;
```

### 5.5 清除拖尾

运行时调用 `clear()` 可以立即清除当前所有拖尾段：

```typescript
let trailRenderer = node.getComponent(Laya.TrailRenderer);
trailRenderer.clear();
```



## 六、API 参考

### TrailRenderer 属性

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| time | number | 拖尾淡出时间，单位秒 |
| widthMultiplier | number | 宽度倍数 |
| widthCurve | FloatKeyframe[] | 宽度曲线（最多10个关键帧） |
| colorGradient | Gradient | 颜色梯度 |
| minVertexDistance | number | 新旧顶点之间的最小距离 |
| alignment | TrailAlignment | 轨迹准线方向 |
| textureMode | TrailTextureMode | 纹理映射模式 |
| bounds | Bounds | 包围盒（只读） |

### TrailRenderer 方法

| 方法 | 说明 |
| --- | --- |
| clear() | 清除所有拖尾段 |

### 枚举值

**TrailAlignment**：

| 值 | 说明 |
| --- | --- |
| View | 面向摄像机 |
| TransformZ | 朝向 Z 轴 |

**TrailTextureMode**：

| 值 | 说明 |
| --- | --- |
| Stretch | 拉伸 |
| Tile | 平铺 |
