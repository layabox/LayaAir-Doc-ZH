---
title: "旋转关节 RevoluteJoint"
description: "旋转关节允许刚体围绕自身锚点旋转。该关节可以配置马达，施加扭矩以实现持续旋转，如模拟车轮转动效果；也可以设定角度限制，实现铰链动作效果，仅允许刚体在特定范围内旋转。"
slug: "ide/component/physics2d/revolutejoint"
---

> Author : Charley

> 关节的通用属性（编辑关节连线、绑定另一刚体、设置锚点、振动频率、阻尼、碰撞连接刚体）请查看 [2D物理编辑总览](/ide/physicseditor/physics2d/) 中关节通用功能章节。

旋转关节允许刚体围绕自身锚点旋转。该关节可以配置马达，施加扭矩以实现持续旋转，如模拟车轮转动效果；也可以设定角度限制，实现铰链动作效果，仅允许刚体在特定范围内旋转。

## 一、启用马达 `enableMotor`

在勾选**启用马达**后，有两个关联的属性，马达速度`motorSpeed`与最大扭矩`maxMotorTorque`，如图1所示：

![](/IDE/Component/physics2D/revoluteJoint/img/1.png)

（图1）

最大扭矩通常不用设置，采用默认值即可，该属性的作用与前文中的马达关节一致。

关键属性是马达速度，这将直接影响旋转的速度与方向。该值与扭矩的共同作用下，使得旋转关节可以产生持续旋转的动力。

另外，马达速度的正负值会影响旋转方向，如果马达速度为正值，旋转方向为顺时针旋转，为负值的时候旋转方向为逆时针旋转。

动图2中对比了不同转速与方向的效果：

<img src="/IDE/Component/physics2D/revoluteJoint/img/2.gif" alt="三个示例，分别是两个不同正速度旋转和一个负速度旋转" style="zoom:80%;" />

（动图2）

## 二、角度限制`enableLimit`

在勾选**角度限制**后，也有两个关联的属性，角度下限`lowerAngle`与角度上限`upperAngle`，如图3所示：

![](/IDE/Component/physics2D/revoluteJoint/img/3.png)

(图3)

角度限制由角度的下限与上限组成，下限表示最小的角度范围，上限表示最大的角度范围。

当启用马达或施加外力的时候，关节的刚体会在该角度的范围内具有旋转的自由度。效果如动图4所示；

![分别用带马达的限制效果和不带马达用鼠标力重力来演示限制效果](/IDE/Component/physics2D/revoluteJoint/img/4.gif)

（动图4）
