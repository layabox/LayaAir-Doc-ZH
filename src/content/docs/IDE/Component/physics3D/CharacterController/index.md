---
title: "角色控制器"
description: "在LayaAir3引擎中，角色控制器的类为 CharacterController，继承自 PhysicsColliderComponent。本文档介绍角色控制器的碰撞形状、专有属性和运动控制方法。关于角色控制器的概念说明，请参考《3D物理组件》总览。"
slug: "ide/component/physics3d/charactercontroller"
---

> Author : Charley

在LayaAir3引擎中，角色控制器的类为 **CharacterController**，继承自 PhysicsColliderComponent。本文档介绍角色控制器的碰撞形状、专有属性和运动控制方法。

## 1、碰撞形状相关

**碰撞形状**是用于描述物体与其他物体发生碰撞时，如何检测和响应碰撞的几何体。它定义了物体的物理边界，即物体的外形，以便物理引擎能够准确判断物体之间是否发生接触，并据此计算碰撞后的反应。

由于角色控制器默认是胶囊碰撞形状，且不建议修改。所以角色控制器在IDE中无法更改碰撞形状类型，但是我们提供了碰撞形状大小改变（胶囊半径、胶囊高度）以及碰撞形状偏移（胶囊偏移）的属性，用于调整碰撞形状。

### 1.1 胶囊半径 radius

该属性表示角色控制器所使用的胶囊碰撞形状的半径。决定了角色在水平方向上的碰撞范围大小。如动图1-1所示：

![](./img/1-1.gif) 

(动图1-1)

### 1.2 胶囊高度 height

该属性表示角色控制器所使用的胶囊碰撞形状的高度，决定了角色在垂直方向上的碰撞范围大小。如动图1-2所示：

![](./img/1-2.gif) 

(动图1-2)

### 1.3 碰撞形状编辑工具

除了通过属性数值的调整，也可以直接在场景的碰撞形态上修改。

如动图1-3所示，直接点击碰撞形状顶部的“显示碰撞形状编辑工具”即可，

进入编辑模式后，可以看到几个白色方块，这些就是编辑点，通过拖动编辑点，可以实现便捷的形状外观改变。

![](./img/1-3.gif) 

(动图1-3)

### 1.4  胶囊偏移 centerOffset

该属性表示角色控制器所使用的胶囊碰撞形状的中心偏移，用于控制胶囊碰撞形状在角色控制器中的位置。

当角色模型的原点与实际的碰撞中心不一致时，使用中心偏移量来修正胶囊体的位置，确保碰撞检测的准确性。

![](./img/1-4.gif) 

(动图1-4)

## 2、碰撞分组设置

角色控制器继承自物理碰撞器组件基类 PhysicsColliderComponent，支持碰撞分组功能。通过设置所属碰撞组（collisionGroup）和可碰撞组（canCollideWith），可以控制角色与哪些物体发生碰撞。

关于碰撞分组的详细说明，请参考[《3D刚体》的碰撞分组章节](/ide/component/physics3d/rigidbody3d/#12-所属碰撞组-collisiongroup)。

## 3、IDE面板的专有属性

### 3.1 重力 gravity

重力指的是物理引擎施加在刚体上的一种恒定加速度，通常模拟现实世界中的引力。

重力会影响刚体的运动，使其向某个方向（通常是向下，即 Y 轴负方向）持续加速，从而模拟真实世界中的自由落体效果。

默认的重力值为 **(0, -9.8, 0)**，表示物体会以 9.8 m/s² 的加速度向下坠落，效果如动图3-1所示。

![](./img/3-1.gif)   

（动图3-1）

### 3.2 推动力 pushForce

当角色与其他可推动的物体发生碰撞时，推动力会作用在物体上，使其产生移动。

如动图3-2所示，设置了推动力后，方块障碍未能阻挡角色的步伐，如果推动力为0，则无法推开方块，角色会被挡住。

![](./img/3-2.gif) 

(动图3-2)

### 3.3 最大坡度 maxSlope

最大坡度是指角色控制器能够攀爬的最大坡度角度。如果斜坡的角度超过该值，角色将无法继续向上移动，可能会开始滑落或停在斜坡下方。

如动图3-3所示，当最大坡度设置为50的时候，角色可以轻松走上锥体，但是面对90度的方块障碍物就无法通过了。

![](./img/3-3.gif) 

(动图3-3)

### 3.4 脚步高度 stepHeight

角色行走的脚步高度，用于表示角色能够顺利跨越的台阶最大高度。如果台阶高度超过了这个设定值，角色就无法直接跨越该台阶，会被阻挡或者需要采用其他方式通过（比如绕路）。

该值通常在 `0.1 - 1`之间，例如动图3-4中，最大坡度为默认值90度，脚步高度设置为0.5，可以轻松通过图中较低障碍，但无法通过相对较高的障碍。

![](./img/3-4.gif) 

(动图3-4)

### 3.5 皮肤宽度 skinWidth

皮肤宽度用于设置角色控制器的碰撞皮肤厚度。它定义了角色与其他碰撞体之间保持的最小距离缓冲区。较大的值可以减少角色卡在几何体中的概率，但可能导致角色看起来悬浮在地面上方；较小的值使角色更贴近地面，但可能导致碰撞穿透。

### 3.6 起跳速度 jumpSpeed

起跳速度用于设置角色控制器跳跃时的初始速度大小。值越大，角色跳跃时的初始向上速度越快，跳得越高。

### 3.7 最小移动距离 minDistance

最小移动距离用于设置角色控制器移动时的最小距离阈值。当移动的距离小于该值时，角色不会产生实际位移。该属性可以用于过滤掉微小的抖动运动。

## 4、引擎中的运动控制

角色的运动控制相关，需要在代码逻辑中调用实现。

### 4.1 角色位置 position

角色位置用于获取和设置角色控制器的位置，通常应用于获取角色当前位置，或者设置角色位置初始化（例如出生点与传送点）等需求。

代码设置示例如下：

```typescript
const { regClass, property } = Laya;
@regClass()
export default class DirectMove extends Laya.Script {
    declare owner: Laya.Sprite3D;
    private characterController: Laya.CharacterController;
    onAwake(): void {
        // 获取 角色控制器 组件并赋值给 characterController
        this.characterController = this.owner.getComponent(Laya.CharacterController);
        //设置出生点位置
        this.characterController.position = new Laya.Vector3(0, 0, 0);
    }
}
```

### 4.2 角色移动 move()

角色移动用于通过指定移动向量来移动角色。

在代码中，如果要自由控制角色的移动，通常是放到每帧更新（`onUpdate()`）的时候执行，通过不断调用 `move` 方法并传入移动向量，角色会按照指定的方向和距离进行移动。

当需要停止的时候，不仅仅是停止调用move移动向量。还要将move的移动向量重置为零向量。否则会一直基于最后一次设置的向量移动。

代码设置示例如下：

```typescript
const { regClass, property } = Laya;
@regClass()
export default class DirectMove extends Laya.Script {
    declare owner: Laya.Sprite3D;
    private characterController: Laya.CharacterController;
    // 标记角色是否移动
    private ismoveing: boolean = false;
    //移动向量，速度与方向，向X轴正方向移动，速度为0.05
    private moveVector: Laya.Vector3 = new Laya.Vector3(0.05, 0, 0);
    onAwake(): void {
        // 获取 角色控制器 组件并赋值给 characterController
        this.characterController = this.owner.getComponent(Laya.CharacterController);
    }
    
    /**
     * 每帧更新时执行，尽量不要在这里写大循环逻辑或者使用 getComponent 方法
     * 此方法为虚方法，使用时重写覆盖即可
     */
    onUpdate(): void {
        // 如果角色可移动 (ismoveing为true时)
        if (this.ismoveing) {
            // 调用角色控制器的 move 方法，使角色按照 moveVector 向量移动
            this.characterController.move(this.moveVector);
        }
    }

    /**
     * 停止角色移动
     */
    public moveStop(): void {
        // 标记角色停止移动，不再每帧更新
        this.ismoveing = false;
        // 重置角色的移动向量置为零向量，使其停止移动
        this.characterController.move(Laya.Vector3.ZERO.clone());
    }
}
```

基于角色控制器，完整的自由控制角色行走示例，请使用LayaAirIDE 3.2或以上版本，创建`3D-RPG示例`模板项目，查看源码。

### 4.3 角色跳跃 jump()

角色跳跃可以控制角色控制器的跳跃方向和高度，通常是重力相反的方向（Y轴正方向），绝对值越大，单次跳跃的高度越高。

代码设置示例如下：

```typescript
const { regClass, property } = Laya;
@regClass()
export default class DirectMove extends Laya.Script {
    declare owner: Laya.Sprite3D;
    private characterController: Laya.CharacterController;
	/** 跳跃的向量，Y轴正方向，高度5 */
    private jumpVector: Laya.Vector3 = new Laya.Vector3(0, 5, 0);

    onAwake(): void {
        // 获取 角色控制器 组件并赋值给 characterController
        this.characterController = this.owner.getComponent(Laya.CharacterController);
        //设置出生点位置
        this.characterController.position = new Laya.Vector3(0, 0, 0);
    }
    
    onKeyDown(evt: Laya.Event): void {
        switch (evt.keyCode) {
            case Laya.Keyboard.SPACE: //按键盘空格时
                this.characterController.jump(this.jumpVector); // 跳跃
                break;
        }
    }
}
```

### 4.4 获得垂直速度 getVerticalVel()

垂直速度方法主要用于获取角色在垂直方向（通常是 Y 轴）的当前速度。这个值反映了角色受重力、跳跃或其他垂直运动影响时的状态。

开发者可以通过检测垂直速度来判断角色是否在空中或刚刚落地，根据当前状态实现相应的逻辑。

- **值为 0**，表示角色位于地面；
- **为正值**，表示角色正在上升（如跳跃）；
- **为负值**，表示角色在下落。

代码设置示例如下：

```typescript
const { regClass, property } = Laya;
@regClass()
export default class DirectMove extends Laya.Script {
    declare owner: Laya.Sprite3D;
    private characterController: Laya.CharacterController;

    onAwake(): void {
        // 获取 角色控制器 组件并赋值给 characterController
        this.characterController = this.owner.getComponent(Laya.CharacterController);
    }

	onUpdate(): void {
        if (this.characterController.getVerticalVel() !== 0)
            // 控制台输出角色的垂直速度
            console.log("垂直速度", this.characterController.getVerticalVel());
	}
}
```

### 4.5 判断是否在地面 isOnGround()

该方法用于判断角色是否站在地面上，返回布尔值。这是角色控制中非常常用的方法，可以用来控制跳跃逻辑（例如只有在地面上才能跳跃）或切换行走/下落动画。

代码设置示例如下：

```typescript
const { regClass, property } = Laya;
@regClass()
export default class DirectMove extends Laya.Script {
    declare owner: Laya.Sprite3D;
    private characterController: Laya.CharacterController;

    onAwake(): void {
        this.characterController = this.owner.getComponent(Laya.CharacterController);
    }

    onKeyDown(evt: Laya.Event): void {
        switch (evt.keyCode) {
            case Laya.Keyboard.SPACE:
                // 只有在地面上时才能跳跃
                if (this.characterController.isOnGround()) {
                    this.characterController.jump(new Laya.Vector3(0, 5, 0));
                }
                break;
        }
    }
}
```

## 5、关联文档

### [《3D物理系统》](/ide/physicseditor/physics3d/)
