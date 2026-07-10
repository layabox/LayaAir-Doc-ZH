---
title: "静态碰撞器"
description: "在LayaAir3引擎中，静态碰撞器的类为 PhysicsCollider，继承自 PhysicsColliderComponent。本文档介绍静态碰撞器的专有属性。关于静态碰撞器的概念说明，请参考《3D物理组件》总览。"
slug: "ide/component/physics3d/staticcollider"
---

> Author : Charley

在LayaAir3引擎中，静态碰撞器的类为 **PhysicsCollider**，继承自 PhysicsColliderComponent。本文档介绍静态碰撞器的专有属性。关于静态碰撞器的概念说明，请参考[《3D物理组件》总览](/ide/component/physics3d/#12-静态碰撞器)。

## 1、碰撞器基类属性

静态碰撞器（PhysicsCollider）继承自物理碰撞器组件基类 PhysicsColliderComponent，因此具备与3D刚体（Rigidbody3D）相同的碰撞器基类属性，包括碰撞形状、碰撞分组、恢复系数、摩擦力、CCD连续碰撞检测等。

关于碰撞器基类属性的详细说明，请参考[《3D刚体》的碰撞器基类属性章节](/ide/component/physics3d/rigidbody3d/#1碰撞器基类属性)。

## 2、静态碰撞器属性

### 2.1 是否为触发器 isTrigger

触发器是一种特殊类型的碰撞体，它并不参与正常的物理碰撞计算，而是用于检测物体是否进入、离开或与其他物体发生接触。触发器常用于触发物理碰撞事件，执行特定的逻辑，比如触发游戏中的事件、激活区域、检测是否进入某个区域等。

当我们勾选`是否为触发器`后，碰撞器作为触发器，只会触发事件但不会产生实际的物理阻挡效果，如动图7-1所示，将斜坡设置为触发器后，方块直接穿透斜坡，掉落在不是触发器地板上。

![](/IDE/Component/physics3D/StaticCollider/img/7-1.gif)  

(动图7-1)

### 2.2 允许休眠 allowSleep

允许休眠属性用于设置静态碰撞器是否可以进入休眠状态。当物理引擎判断碰撞器长时间未参与碰撞交互时，可以将其标记为休眠状态以节省计算资源。

## 3、关联文档

### [《3D物理系统》](/ide/physicseditor/physics3d/)