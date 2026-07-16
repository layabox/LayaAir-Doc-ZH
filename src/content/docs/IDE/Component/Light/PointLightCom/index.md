---
title: "3D点光源 PointLight"
description: "PointLight（点光源）是向四面八方发射光线的光源，又称全向光或者球状光，现实中的点光源比如灯泡、蜡烛，可以感觉到点光源是有强度、颜色和衰减半径属性。"
slug: "ide/component/light/pointlightcom"
---

> Author : Charley

> 灯光类型概述请查看[《3D灯光与阴影》](/3d/light/)，阴影相关请查看[《3D阴影》](/ide/component/light/shadow/)。

PointLight（点光源）是向四面八方发射光线的光源，又称全向光或者球状光，现实中的点光源比如灯泡、蜡烛，可以感觉到点光源是有强度、颜色和衰减半径属性。

如图2-1所示，在一个建筑中，周围都是墙壁，其中创建的点光源，可以通过设置强度，颜色，半径来设置光源效果

<img src="./img/2-1.png" alt="image-20221221102723221" style="zoom: 50%;" />

（图2-1）

## 一、创建点光源

<img src="./img/2-2.gif" style="zoom:50%;" />

（动图2-2）

如动图2-2所示，在Scene3D或者任意节点下，鼠标右键选择Light，点击PointLight，即可在场景中创建一个点光源。

## 二、组件属性

### 2.1 基础属性

如图2-3所示，当创建一个PointLight后，在Inspector属性面板中会有如下几个属性

<img src="./img/2-3.png" alt="image-20221221104220653" style="zoom:55%;" />

（图2-3）

`Color`：点光源的颜色

<img src="./img/2-4.png" alt="image-20221221114439371" style="zoom: 40%;" />

（图2-4）

`Intensity`：点光源的强度

<img src="./img/2-5.png" alt="image-20221221114555840" style="zoom:40%;" />

（图2-5）

`Range`：设置点光源的范围，相当于点光源的照射范围，数值越大，光照范围越大。

<img src="./img/2-6.png" alt="image-20221221114650095" style="zoom:42%;" />

（图2-6）

`Lightmap Bake Type`：光源模式

​	`Mixed`：混合光源，结合了实时光源和光照烘焙。可以使用混合光源将动态阴影与来自同一光源的烘焙照明相结合。可在运行时更改混合光源的属性，这样做将更新光源的实时光照，但不会更新烘焙光照。

​	`Realtime`：实时光源，LayaAir会在运行时为实时光源执行光照计算，每帧进行一次。你可以在运行时更改实时光源的属性，从而创建诸如闪烁的灯泡或穿过暗室的火炬之类的效果。

​	`Baked`：烘焙光源，LayaAir为烘焙光源执行计算，并将结果作为光照数据保存到磁盘中。在运行时，LayaAir将加载烘焙的光照数据来照亮场景，可以减少运行时的着色成本和阴影的渲染成本。

### 2.2 烘焙属性

如图2-7所示，当选择Lightmap Bake Type为Baked时，下面会出现烘焙相关参数。

 <img src="./img/2-7.png" alt="image-20221221104220653" style="zoom:55%;" />

（图2-7）

`Power`：烘焙的光照强度

`Radius`：烘焙的光照半径

`Max Bounces`：烘焙的光照最大反弹数

<img src="./img/2-8.png" alt="image-20221221115124169" style="zoom:50%;" />

（图2-8）

图2-8所示，为对一个建筑场景添加多个点光源，烘焙后的效果

## 三、代码示例

```typescript
//创建点光源
let pointLight = new Laya.Sprite3D();
let pointCom = pointLight.addComponent(Laya.PointLightCom);
this.scene.addChild(pointLight);
//点光源的颜色
pointCom.color = new Laya.Color(1.0, 0.5, 0.0, 1);
//设置点光源的范围
pointCom.range = 3.0;
pointLight.transform.position = new Laya.Vector3(0.0, 1, 0.0);
```
