---
title: "3D阴影"
description: "投影是灯光照射模型时产生的即时阴影，可随着灯光角度、灯光强度、模型位置等变化而变化。投影是3D世界最重要的因素之一，能产生更加强烈的立体感。"
slug: "ide/component/3dlight/shadow"
---

> Author : Charley

> 灯光类型概述请查看[《3D灯光与阴影》](/3d/light/)。

投影是灯光照射模型时产生的即时阴影，可随着灯光角度、灯光强度、模型位置等变化而变化。投影是3D世界最重要的因素之一，能产生更加强烈的立体感。

即时阴影非常损耗性能，不能用得太多，特别是游戏场景，模型量较大，一般我们不使用实时投影，而使用静态的光照贴图。

## 一、阴影模式

<img src="/IDE/Component/3DLight/Shadow/img/6-1.png" style="zoom:60%;" />

（图6-1）

`ShadowMode`：阴影模式，共分为四种模式：

​	`None`：不产生阴影

​	`Hard`：硬阴影，对性能要求较低

<img src="/IDE/Component/3DLight/Shadow/img/6-1-1.png" alt="image-20221221175204586" style="zoom: 50%;" />

（图6-1-1）

​	`SoftLow`：低强度软阴影，对性能要求一般

<img src="/IDE/Component/3DLight/Shadow/img/6-1-2.png" alt="image-20221221175737980" style="zoom:50%;" />

（图6-1-2）

​	`SoftHigh`：高强度软阴影，对性能要求较高

<img src="/IDE/Component/3DLight/Shadow/img/6-1-3.png" alt="image-20221221175849308" style="zoom:50%;" />

（图6-1-3）效果最好

硬阴影和软阴影的区别：硬阴影（hard shadow）是指由理想电光源产生的阴暗均一、边界分明的阴影，它只包含物体的本影（umbra）。软阴影（soft shadow）则是由线、面或体光源等产生的边界柔和、有一定明暗过度的阴影，它包括物体的本影和半影（penumbra）。

## 二、阴影属性

当我们选择一种阴影模式后，可以看到设置阴影的属性

<img src="/IDE/Component/3DLight/Shadow/img/6-2.png" style="zoom:60%;" />

（图6-2）

`shadowStrength`：阴影强度，该值越大，阴影越明显。

<img src="/IDE/Component/3DLight/Shadow/img/6-2-1.gif" style="zoom:50%;" />

（动图6-2-1）

`shadowDistance`：灯光产生阴影的范围，范围是指摄像机到模型的距离，超出这个范围的模型将不会产生阴影与接受阴影，开发者可以根据场景大小进行设置。

<img src="/IDE/Component/3DLight/Shadow/img/6-2-2.png" alt="image-20221221201246233" style="zoom:50%;" />

（图6-2-2）

`shadowDepthBias`：阴影贴图基于深度的偏移，将深度做一个偏移可以有效解决阴影痤疮（"shadow acne"）。但 `shadowDepthBias` 过大时会导致阴影脱离物体，即"Peter Panning"现象。

`shadowNormalBias`：阴影贴图基于法线的偏移，将阴影Caster的表面沿着法线方向的反方向偏移，以防止自身阴影伪影。较大的值可以更好地防止阴影痤疮，但要以阴影形状小于实际对象为代价。

`shadowNearPlane`：阴影视锥的近裁面。

`shadowResolution`：阴影贴图分辨率，值越大阴影越清晰，但性能消耗也越大。常用值为 512、1024、2048 等。

## 三、阴影级联模式

 <img src="/IDE/Component/3DLight/Shadow/img/6-3.png" style="zoom:60%;" />

（图6-3）

`shadowCascadesMode`：阴影的级联模式，数量越大，产生阴影贴图时，将视锥体划分的子视锥体越多，阴影的质量会越好。

`TwoCascades`：二级级联阴影分割比例。

<img src="/IDE/Component/3DLight/Shadow/img/6-3-1.png" alt="image-20221221201556335" style="zoom:50%;" />

（图6-3-1）

`FourCascades`：四级级联阴影分割比例，X、Y、Z依次为其分割比例，Z必须大于Y，Y必须大于X。

<img src="/IDE/Component/3DLight/Shadow/img/6-3-2.png" alt="image-20221221201744907" style="zoom:50%;" />

（图6-3-2）

## 四、模型的投影属性

除了光源的阴影设置，需要在模型上设置投影属性：如图6-4所示

<img src="/IDE/Component/3DLight/Shadow/img/6-4.png" style="zoom: 50%;" />

（图6-4）

`receiveShadow`：是否接受阴影，当模型此属性为true时，计算出的阴影会在此模型上显示出来。

`castShadow`：是否产生阴影，当模型此属性为true时，灯光根据产生阴影的模型位置、模型网格形状大小、与灯光的角度等进行阴影计算，然后在接受阴影的模型上产生阴影。

如动图6-5所示，展现了平行光实时阴影的效果

<img src="/IDE/Component/3DLight/Shadow/img/6-5.gif" style="zoom: 33%;" />

（动图6-5）

如动图6-6所示，展现了聚光灯实时阴影的效果

<img src="/IDE/Component/3DLight/Shadow/img/6-6.gif" style="zoom: 33%;" />

（动图6-6）

## 五、代码示例

```typescript
// Use soft shadow.
dircom.shadowMode = Laya.ShadowMode.SoftLow;
// Set shadow max distance from camera.
dircom.shadowDistance = 50;
// Set shadow resolution.
dircom.shadowResolution = 1024;
// Set shadow cascade mode.
dircom.shadowCascadesMode = Laya.ShadowCascadesMode.NoCascades;
// Set shadow normal bias.
dircom.shadowNormalBias = 1;
```

> 注：需要开启对应地面的接收阴影和模型的产生阴影。
