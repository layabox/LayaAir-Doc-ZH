---
title: "3D聚光灯 SpotLight"
description: "SpotLight（聚光灯）指的是从特定光源方向射出的光，比如手电筒，舞台筒灯等。光照区域根据距离因素逐渐放大，同时光照区域边缘也有衰减现象。"
slug: "ide/component/3dlight/spotlight"
---

> Author : Charley

> 灯光类型概述请查看[《3D灯光与阴影》](/3d/light/)，阴影相关请查看[《3D阴影》](/ide/component/3dlight/shadow/)。

SpotLight（聚光灯）指的是从特定光源方向射出的光，比如手电筒，舞台筒灯等。光照区域根据距离因素逐渐放大，同时光照区域边缘也有衰减现象。

如图4-1所示，在一个场景中，通过调整聚光的锥形角度，可以调整场景的光照效果

<img src="/IDE/Component/3DLight/SpotLight/img/4-1.gif" style="zoom: 50%;" />

（动图4-1）

## 一、创建聚光灯

<img src="/IDE/Component/3DLight/SpotLight/img/4-2.gif" style="zoom:50%;" />

（动图4-2）

如动图4-2所示，在Scene3D或者任意节点下，鼠标右键选择Light，点击SpotLight，即可在场景中创建一个聚光灯。

## 二、组件属性

### 2.1 基础属性

如图4-3所示，当创建一个SpotLight后，在Inspector属性面板中会有如下几个属性

<img src="/IDE/Component/3DLight/SpotLight/img/4-3.png" alt="image-20221221104220653" style="zoom:50%;" />

（图4-3）

`Color`：聚光灯的颜色

<img src="/IDE/Component/3DLight/SpotLight/img/4-4.png" alt="image-20221221114439371" style="zoom: 40%;" />

（图4-4）

`Intensity`：聚光灯的强度

`Range`：聚光灯的照射范围，与点光类似，区别只是聚光有方向，而点光无方向

<img src="/IDE/Component/3DLight/SpotLight/img/4-5.png" alt="image-20221221114439371" style="zoom: 40%;" />

（图4-5）

`Spot Angle`：聚光灯的锥形角度，设置的值越小，聚光光圈的越小，反之光圈越大。

<img src="/IDE/Component/3DLight/SpotLight/img/4-6.png" alt="image-20221221114439371" style="zoom: 40%;" />

（图4-6）

`Lightmap Bake Type`：光源模式，同点光源一样，支持 Mixed、Realtime、Baked 三种模式。

### 2.2 烘焙属性

如图4-7所示，当选择Lightmap Bake Type为Baked时，下面会出现烘焙相关参数。

 <img src="/IDE/Component/3DLight/SpotLight/img/4-7.png" alt="image-20221221104220653" style="zoom:55%;" />

（图4-7）

`Power`：烘焙的光照强度

`Radius`：烘焙的光照半径

`Max Bounces`：烘焙的光照最大反弹数

`Spot Size`：聚光的尺寸

`Blend`：混合比例，0-1之间

## 三、代码示例

```typescript
//聚光灯
let spotlightSprite = new Laya.Sprite3D();
let spotcom = spotlightSprite.addComponent(Laya.SpotLightCom);
this.scene.addChild(spotlightSprite);
//设置聚光灯颜色
spotcom.color = new Laya.Color(1, 1, 0, 1);
spotlightSprite.transform.position = new Laya.Vector3(0.0, 1.2, 0.0);
//设置聚光灯的方向
var mat: Laya.Matrix4x4 = spotlightSprite.transform.worldMatrix;
mat.setForward(new Laya.Vector3(0.15, -1.0, 0.0));
spotlightSprite.transform.worldMatrix = mat;
//设置聚光灯范围
spotcom.range = 1.6;
spotcom.intensity = 8.0;
//设置聚光灯锥形角度
spotcom.spotAngle = 32;
```

<img src="/IDE/Component/3DLight/SpotLight/img/4-8.gif" style="zoom:50%;" />

（动图4-8）

如动图4-8，设置聚光灯旋转看到的效果
