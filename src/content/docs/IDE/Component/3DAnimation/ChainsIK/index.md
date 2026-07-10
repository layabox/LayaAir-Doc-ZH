---
title: "反向动力学"
description: "对于一般的动画，引擎会读取动画文件中的数据，然后将这些数据设置到模型骨架对应的关节上，在这个过程中，子关节的位置会根据父关节的位置和旋转来改变，这是一个从根部到末端的过程。一般我们称为正向动力学(FK)。"
slug: "ide/component/3danimation/chainsik"
---

## 一、前言

对于一般的动画，引擎会读取动画文件中的数据，然后将这些数据设置到模型骨架对应的关节上，在这个过程中，子关节的位置会根据父关节的位置和旋转来改变，这是一个从根部到末端的过程。一般我们称为`正向动力学(FK)`。

而`反向动力学(IK)`则是一个相反的过程，开发者只需要设置末端节点的位置，引擎会自动计算其它节点的旋转和位置。

相较于`正向动力学(FK)`，`反向动力学(IK)`更加灵活，例如一个角色要移动手臂，使用`正向动力学(FK)`需要制作一个动画文件，如果想要手臂移动到其它位置，就需要再制作一个动画文件，如果角色的手臂要到达随机的位置，使用`正向动力学(FK)`就很困难，因为开发者不可能制作无限多的动画；而使用`反向动力学(IK)`则没有这样的问题，无论角色的手臂要到达哪里，开发者只需要设置手掌的位置即可，引擎会自动计算出小臂，大臂等节点的位置。

> 可以看到，在移动cube节点后，角色的手臂跟随cube移动。

![1-1](/IDE/Component/3DAnimation/ChainsIK/img/1-1.gif)



## 二、创建ChainsIK

选中一个节点，在属性设置面板中点击增加组件，在动画选项中就可以找到ChainsIK。

![2-1](/IDE/Component/3DAnimation/ChainsIK/img/2-1.gif)

ChainsIK组件可以添加在任意3D节点上，对于节点层级没有特殊要求。开发者使用方便即可。添加好的组件如图所示。

![2-2](/IDE/Component/3DAnimation/ChainsIK/img/2-2.png)



## 三、ChainsIK的属性

### 3.1 创建Chain Datas

点击Chain Datas右侧的加号，创建一个Chain Datas实例。

![3-1-1](/IDE/Component/3DAnimation/ChainsIK/img/3-1-1.png)

创建后的内容如图所示：

![3-1-2](/IDE/Component/3DAnimation/ChainsIK/img/3-1-2.png)

`Name`：骨骼数据的名称，由开发者自行定义。设置名称后可以通过IK组件上的`getChain(name: string)`方法获取对应的Chain。如果未设置，则默认使用`end`节点的name。

`Type`：类型。有`position`和`lookAt`两种。

​	`position`：位置模式。在此模式下，链的末端节点会尽可能到达设置的空间坐标。

​	`lookAt`：注视模式，在此模式下，链的末端节点不再尽可能到达目标空间，而是骨骼的z轴始终指向目标点。

`End`：IK链中最末端的节点，也是直接受控的部分。

`Root`：IK链中的最高级父节点。

`BoneDatas`：骨骼数据。设置`End`和`Root`后，组件会自动检索这两个节点之间的节点，生成骨骼数据。只有勾选后才会进行IK计算。

![3-1-3](/IDE/Component/3DAnimation/ChainsIK/img/3-1-3.png)

`FixEnd`： 是否固定末端的父关节。勾选后倒数第二关节不参与计算。

`alignWithTarget`：末端朝向对其模式。

​	`no`：不对齐，进位置跟随。

​	`y`：Y轴对齐，常用于手部方向。

​	`all`：完全对齐，位置和旋转都匹配目标。

`Target`：目标对象。IK链将跟随此对象的位置/朝向。需要注意的是，`Target`不能设置为`BoneDatas`上的节点或其子节点，否则会引起错误。

`enablePoleTarget`：是否启用提示目标。

`PoleTarget`：提示目标。对于IK链而言，同一目标位置可能有多种关节配置，在`Target`的位置不变的情况下，关节既可以向左弯曲，也可以向右弯曲，在设置`PoleTarget`之后，关节会尝试朝向此对象，可以用于防止肘部/膝盖弯曲方向不自然。

`MaxError`：允许的最大误差。IK功能通过迭代算法来逼近目标，设置最大误差可以节省计算次数，提高性能。

`blendWeight`：IK混合权重。控制IK解算结果和动画数据的混合比例。值为0时IK完全失效，值为1时IK完全接管动画。

`smoothBlendWeight`：平滑混合权重。当`blendWeight`变化时，平滑过渡到新值。值越小，过渡越平滑，用于防止权重突变导致的跳变。

`Enable`：是否启用此数据链。



### 3.2 显示编辑工具

点击显示编辑工具后，属性设置面板中会显示出对应的属性。

![3-2-3](/IDE/Component/3DAnimation/ChainsIK/img/3-2-3.png)

![3-2-1](/IDE/Component/3DAnimation/ChainsIK/img/3-2-1.png)

`ShowBoneNames`：显示骨骼名称，勾选后会在骨骼的起点处显示骨骼名称。

​	`BoneNameScale`：骨骼名称缩放。勾选`ShowBoneNames`后会显示，用于调整骨骼名称的大小。

![3-2-4](/IDE/Component/3DAnimation/ChainsIK/img/3-2-4.png)

`DebugScale`：缩放。控制骨骼链显示的大小，可根据需求进行调整。



场景中会根据节点的层级显示骨骼链，一般的骨骼链会以白色显示，以包含在ChainDatas中的骨骼链会以黄色显示。

![3-2-2](/IDE/Component/3DAnimation/ChainsIK/img/3-2-2.png)

`ShowBoneNames`：显示骨骼名称，勾选后会在骨骼的起点处显示骨骼名称。

`DebugScale`：缩放。控制骨骼链显示的大小，可根据需求进行调整。



### 3.3 其它属性

除了Chain Datas上的各种属性外，IK组件上还有一些属性。

![3-3-1](/IDE/Component/3DAnimation/ChainsIK/img/3-3-1.png)

`SolverIteration `：解算器迭代次数。这个属性控制IK的最大求解次数，用于平衡求解的精度和性能。

`DirSolverIteration `：`lookAt`模式下的IK链的最大迭代次数。

`DampingFactor `：阻尼因子，控制求解的平滑度。值越小，运动越平滑但收敛越慢；值越大，响应越快但可能产生抖动。

`RunInEditor`：是否在编辑器中运行。



## 四、ChainsIK的使用

这里我们通过一个简单的示例，演示Ik的基础使用流程。

场景中添加一个基础角色模型。

![4-1](/IDE/Component/3DAnimation/ChainsIK/img/4-1.png)



接下来明确我们要的目标：通过IK功能控制角色的左臂的移动。

首先在角色的根节点上添加IK组件，并创建一个ChainDatas：

![4-2](/IDE/Component/3DAnimation/ChainsIK/img/4-2.png)



展开角色的节点层级，并找到角色左臂对应的节点，将左臂的根节点设置到`Root`上，这里我们不对手指的节点进行控制，因此骨骼链的末端节点为手掌节点。

![4-3](/IDE/Component/3DAnimation/ChainsIK/img/4-3.png)



在场景中添加一个节点作为目标节点，将这个节点移动到角色面前：

![4-4](/IDE/Component/3DAnimation/ChainsIK/img/4-4.png)



这里可以看到，角色的手臂已经有动作了，但手部的动作并不正常：

![4-5](/IDE/Component/3DAnimation/ChainsIK/img/4-5.png)

这是手掌节点作为末端节点没有被旋转导致的，我们可以通过添加一个空节点的方式解决这个问题。找到左手手掌对应的节点，在这个节点下添加一个子节点，将这个节点调整到手指指尖的位置：

![4-6](/IDE/Component/3DAnimation/ChainsIK/img/4-6.png)



然后将这个节点设置为Ik的`End`节点：

![4-7](/IDE/Component/3DAnimation/ChainsIK/img/4-7.png)

此时可以看到，手掌节点的效果恢复正常。







