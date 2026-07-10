---
title: "3D区域光 AreaLight"
description: "AreaLight（区域光）可以通过空间中的两个形状之一定义区域光：矩形或圆盘。区域光从该形状的一侧发射光。发射的光在该形状的表面区域的所有方向上均匀传播。区域光提供的照明强度以与光源距离的平方反比确定的速率减小（见平方反比定律）。由于此照明计算非常占用处理器，因此区域灯光在运行时不可用…"
slug: "ide/component/3dlight/arealight"
---

> Author : Charley

> 灯光类型概述请查看[《3D灯光与阴影》](/3d/light/)。

AreaLight（区域光）可以通过空间中的两个形状之一定义区域光：矩形或圆盘。区域光从该形状的一侧发射光。发射的光在该形状的表面区域的所有方向上均匀传播。区域光提供的照明强度以与光源距离的平方反比确定的速率减小（见平方反比定律）。由于此照明计算非常占用处理器，因此区域灯光在运行时不可用，只能烘焙到光照贴图中。

由于区域光同时从几个不同方向照亮对象，因此阴影趋向于比其他光源类型更柔和、细腻。您可以使用这种光源来创建逼真的路灯或靠近玩家的一排灯光。小的区域光可以模拟较小的光源（例如室内光照），但效果比点光源更逼真。

如图5-1所示，在一个场景中，通过调整区域光的尺寸和扩散，可以调整场景的光照效果

<img src="/IDE/Component/3DLight/AreaLight/img/5-1.gif" style="zoom: 50%;" />

（动图5-1）

## 一、创建区域光

<img src="/IDE/Component/3DLight/AreaLight/img/5-2.gif" style="zoom:50%;" />

（动图5-2）

如动图5-2所示，在Scene3D或者任意节点下，鼠标右键选择Light，点击AreaLight，即可在场景中创建一个区域光。

## 二、组件属性

如图5-3所示，当创建一个AreaLight后，在Inspector属性面板中会有如下几个属性

<img src="/IDE/Component/3DLight/AreaLight/img/5-3.png" alt="image-20221221104220653" style="zoom:50%;" />

（图5-3）

`Color`：区域光的颜色

`Intensity`：区域光的强度

`Shape`：区域光的形状

​	`Rect`：矩形

​	`Elliptic`：圆形

`Size`：区域光的尺寸，类型为 Vector2，分别控制宽度和高度（矩形）或半径（圆形）。

`Power`：烘焙的光照强度

`Spread`：扩散度

`Max Bounces`：烘焙的最大反弹数
