---
title: "3D方向光 DirectionLight"
description: "Direction Light（方向光/平行光）与点光区别较大，它有固定的一个方向，可通过弧度值设定，并且没有衰减和光照范围，会对全场景所有模型进行照亮。3D世界中经常用来模拟固定方向的太阳光。"
slug: "ide/component/3dlight/directionlight"
---

> Author : Charley

> 灯光类型概述请查看[《3D灯光与阴影》](/3d/light/)，阴影相关请查看[《3D阴影》](/ide/component/3dlight/shadow/)。

Direction Light（方向光/平行光）与点光区别较大，它有固定的一个方向，可通过弧度值设定，并且没有衰减和光照范围，会对全场景所有模型进行照亮。3D世界中经常用来模拟固定方向的太阳光。

当新建一个3D场景时，DirectionLight是默认自带的。

如图3-1所示，在一个场景中，通过调整平行光的角度，可以调整场景的光照效果

<img src="./img/3-1.gif" style="zoom: 50%;" />

（动图3-1）

## 一、创建方向光

<img src="./img/3-2.gif" style="zoom:50%;" />

（动图3-2）

如动图3-2所示，在Scene3D或者任意节点下，鼠标右键选择Light，点击DirectionLight，即可在场景中创建一个方向光。

## 二、组件属性

### 2.1 基础属性

如图3-3所示，当创建一个DirectionLight后，在Inspector属性面板中会有如下几个属性

<img src="./img/3-3.png" alt="image-20221221104220653" style="zoom:50%;" />

（图3-3）

`Color`：方向光的颜色

<img src="./img/3-4.png" alt="image-20221221114439371" style="zoom: 40%;" />

（图3-4）

`Intensity`：方向光的强度

<img src="./img/3-5.png" alt="image-20221221114555840" style="zoom:40%;" />

（图3-5）

`Lightmap Bake Type`：光源模式，同点光源一样，支持 Mixed、Realtime、Baked 三种模式。

`Shadow Mode`：阴影模式，详见[《3D阴影》](/ide/component/3dlight/shadow/)。

`Shadow Cascades Mode`：阴影的级联模式

<img src="./img/3-6.gif" style="zoom:50%;" />

（动图3-6）

如动图3-6所示，可以开启阴影模式的效果，同时调整平行光的角度，可以看到阴影随着改变。

### 2.2 烘焙属性

如图3-7所示，当选择Lightmap Bake Type为Baked时，下面会出现烘焙相关参数。

 <img src="./img/3-7.png" alt="image-20221221104220653" style="zoom:55%;" />

（图3-7）

`Power`：烘焙的光照强度

`Radius`：烘焙的光照角度

`Max Bounces`：烘焙的光照最大反弹数

## 三、代码示例

```typescript
//创建方向光
let directlightSprite = new Laya.Sprite3D();
let dircom = directlightSprite.addComponent(Laya.DirectionLightCom);
this.scene.addChild(directlightSprite);
//方向光的颜色
dircom.color.setValue(1.0, 0.5, 0.0, 1);
//设置平行光的方向
var mat: Laya.Matrix4x4 = directlightSprite.transform.worldMatrix;
mat.setForward(new Laya.Vector3(-1.0, -1.0, -1.0));
directlightSprite.transform.worldMatrix = mat;
```

 **setForward** 平行光的方向，分别代表x、y、z轴上的方向，负数为负轴，正数为正轴，值的范围为 -1 ~ 0 ~ 1，超过范围后为-1或1，初学者们可以在这个范围内设值观察方向的变化。

<img src="./img/3-8.gif" style="zoom:50%;" />

（动图3-8）

如动图3-8，设置平行光旋转看到的效果
