## LayaAir3-IDE可视化3D物理编辑详解

> Author : Charley     Version >= LayaAir 3.1

LayaAir3.1引擎版本中，我们对于物理引擎的接口架构进行了重构，使得3D物理不仅仅完善了物理组件的功能，还彻底满足了自由接入第三方的物理库的需求。

也就是说，除了本身就集成好的Bullet物理引擎与PhysX物理引擎，开发者也可以轻松的自行接入其它的物理引擎。

例如，我们在资源商店中提供了*Cannon.js*这样的轻量物理引擎库，由开发者通过自定义的方式引入到LayaAir中使用。

本篇文档，将会围绕可视化的3D物理组件的详细使用说明、物理组件脚本的使用、如何引入第三方物理库等内容，指导开发者快速上手物理引擎的基础使用。

### 一、刚体

#### 1.1 什么是刚体

无论是2D，还是3D，物理的开篇，都需要先了解刚体（RigidBody），这是物理引擎的基础之一。

大家都知道，自然界一切有形体的物质，都可以叫物体。

刚体是力学中为了体现物体特性的一种科学抽象概念，也是一种理想状态的力学表达模型，**是指在运动中和受到力的作用后，形状和大小不变，而且内部各点的相对位置不变的物体。** 

然而，现实中不可能存在这种理想模型，物体在受力之后，会根据力、材料、弹性、 塑性等综合因素，决定是否改变或改变多少。 如果物体本身的变化不影响整个运动过程，为使被研究的问题简化，仍将该物体当作刚体来处理而忽略物体的体积和形状，这样所得结果仍与实际情况相当符合。 

#### 1.2 常用的刚体属性

##### `isKinematic`是否为运动刚体

3D的刚体，默认是动力学刚体。受力的影响，可以位移。

一旦我们把刚体设置为运动刚体类型后，即将`isKinematic`的值设置为`true`。

那么运动刚体可以触发第三方的物理反馈，自己却不受物理影响。例如，运动刚体与动力学刚体发生撞击，动力学刚体会受力反弹，但运动刚体却不会受力的影响，不会产生受力位移，运动刚体的位移只能通过transform改变节点坐标。

> 与2D的运动学类型刚体不同，LayaAir 3D的运动刚体脱离了物理引擎运动，即使设置速度也不可以使其位移。这样做的好处是减少了物理运算，节省了性能。

##### `mass`质量

质量是物质的量的量度，Bullet引擎中的质量单位为kg。

刚体的质量越大，运动状态改变越难，比如，不同质量的两个物体相撞，质量大的一方改变更小一些，如动图1的左侧所示：

 <img src="img/1.gif" alt="img" style="zoom: 33%;" />  

（动图1）

> 静态刚体和运动刚体就相当于无限大质量，不受力的影响。

##### `gravity` 重力

自然界中物体受地心吸引的作用而受到的力叫重力，物理引擎中也同样模拟了重力，

动力学刚体在同等的质量下，重力越大，下落的加速度越大。对比效果如动图1-1。

<img src="img/1-1.gif" alt="img" style="zoom:33%;" />  

（动图1-1）

##### `angularVelocity` 角速度

刚体的angularVelocity属性是角速度， 角速度简单理解就是单位时间的角位移，以弧度每秒进行旋转 。当我们设置动力学刚体angularVelocity属性为正值的时候，则按顺时针旋转位移。angularVelocity属性为负值的时候，则按逆时针旋转位移。属性值的绝对值越大，旋转位移速度越快。

<img src="img/1-2.gif" alt="1-2" style="zoom:33%;" />  

（动图1-2）

angulaVelocity属性的值是3维向量`Vector3`类型值，Bullet使用欧拉角来描述物体的旋转，3D向量的每个分量代表绕x、y、z轴旋转的速度，单位是**弧度/秒**。动图1-2，就是在x轴分别设置了3.14与31.4的对比效果。

#####  `angularDamping` 角阻尼

刚体的角阻尼相当于是为角速度旋转方向施加了相反的力，使得旋转速度衰减。

动图1-3，是在同样的31.4角速度下，左侧为1的的角阻尼值，右侧为0.9的角阻尼值，对比效果。

<img src="img/1-3.gif" alt="img" style="zoom:33%;" />  

（动图1-3）

#####  `angularFactor` 角度因子

刚体的角度因子是在每个轴方向（速度和力）上缩放物理值的角度因子

动图1-4，是在同样的31.4角速度下，左侧为1的的角度因子，右侧为2的角度因子，对比效果。

<img src="img/1-4.gif" alt="img" style="zoom:33%;" />   

（动图1-4）

##### `linearVelocity` 线性速度

刚体的linearVelocity属性称为线速度或者线性速度，是指物体的直线运动速度。

动力学刚体的线速度是3维向量`Vector3`类型值，向量的方向即速度的方向，向量的长度即速度的大小。

动图1-5，是动力学刚体在同样重力值为0的情况下，没有设置线速度和y轴设置了线速度值的对比效果。

<img src="img/1-5.gif" alt="img" style="zoom:33%;" />  

（动图1-5）

##### `linearDamping` 线性阻尼

刚体的linearDamping属性，是指线性速度的阻尼系数，使得线性速度衰减。

动图1-6，是动力学刚体在重力为0并且y轴设置了同样为-1的线速度值情况下，左侧为0.9线性阻尼值和右侧为1线性阻尼值的对比效果。

<img src="img/1-6.gif" alt="img" style="zoom:33%;" />  

（动图1-6）

##### `linearFactor` 线性因子

刚体的linearFactor属性，是指个轴方向上缩放物理值（速度和力）的线性因子

刚体的linearDamping属性，是指线性速度的阻尼系数，使得线性速度衰减。

动图1-7，是动力学刚体在重力为0并且y轴设置了同样为-1的线速度值情况下，左侧为1线性因子和右侧为2线性因子的对比效果。

<img src="img/1-7.gif" alt="img" style="zoom:33%;" />  

（动图1-7）


### 二、物理碰撞

碰撞是物理引擎中最基础、最常用的功能。在这个小节里，我们对3D物理碰撞进行全面的认知。

#### 2.1 碰撞器与触发器

对于检测3D物理碰撞的方式，有碰撞器与触发器两种。我们先从概念认知开始。

##### 2.1.1 碰撞器 

在LayaAir引擎2D物理的时候，通过封装的不同形状的碰撞体，就可以直接实现带范围的物理碰撞。

而LayaAir引擎的3D物理，形状不再是最主要的特征，只是碰撞器用于检测碰撞范围的三维形状区域。

完整的3D碰撞器，由碰撞器和碰撞器形状两部分组成。

3D碰撞器根据特点的不同，分为静态碰撞器、刚体碰撞器、角色碰撞器。

这些碰撞器必须要添加三维碰撞器形状（例如：盒形、球形、圆锥形、圆柱形、胶囊形、平面、混合、模型网格），才可以实现有范围的物理碰撞。

<img src="img/2-1.png" alt="img" style="zoom:38%;" />  

（图2-1）

图2是胶囊形状角色碰撞器的编辑预览效果。

##### 2.1.2 触发器

LayaAir 3D物理的触发器相当于2D物理里的传感器。

触发器是碰撞器的一个属性，任何碰撞器的触发器属性设置生效后，当前的碰撞器即转变为触发器（比如，刚体碰撞器设置触发器后可称为刚体触发器）。即使发生物体接触，也不会产生碰撞的物理反馈。例如，动图3-1右侧所示。下落的盒子无视物理引擎，直接穿透而过。

<img src="img/2-1.gif" alt="img" style="zoom:33%;" />  

（动图2-1）

设置触发器后，虽然失去了物理引擎反馈，但是可以激活触发器的碰撞生命周期方法，用于检测物体间碰撞接触的发生。

> 激活触发器生命周期也有特定的情况除外，具体规则会在下面的物理生命周期章节介绍

当触发器`isTrigger`设置为true时，如图2-2所示。触发器即可设置生效。

<img src="img/2-2.png" alt="img" style="zoom:42%;" />  

（图2-2）

通过代码设置触发器的方式：

```typescript
/*
……省略若干代码
*/

//获取物理刚体组件
this.rigidbody1 = this.cube1.getComponent(Laya.Rigidbody3D) as Laya.Rigidbody3D;
this.rigidbody2 = this.cube2.getComponent(Laya.Rigidbody3D) as Laya.Rigidbody3D;

//设置rigidbody1为触发器,取消物理反馈
this.rigidbody1.isTrigger = true;
this.rigidbody2.isTrigger = false;

/*
……省略若干代码
*/
```





#### 2.2 理解各种碰撞器

##### 2.2.1 静态碰撞器 `PhysicsCollider`

LayaAir的3D物理碰撞器类是`PhysicsCollider`，为了便于记忆和理解，我们叫他静态碰撞器类。因为它的特性是不受力，不会产生物理移动。

当其与动力学刚体碰撞器或角色碰撞器发生物理碰撞后，可以触发物理碰撞生命周期方法，但不会产生物理的受力位移。

这种碰撞器可以用于不需要物理受力位移的物体，只需要触发碰撞逻辑的应用场景。例如墙体，撞墙后判定游戏结束。

<img src="img/2-3.png" alt="image-20221114173326345" style="zoom:50%;" /> 

（图2-3）

图2-3是添加LayaAir的3D物理碰撞器组件`PhysicsCollider`

##### 2.2.2 刚体碰撞器  `Rigidbody3D `

LayaAir的2D物理刚体与碰撞体是分开的，而3D物理的刚体与碰撞器是整合的，`Rigidbody3D`类即是刚体也是碰撞器，我们可称为刚体碰撞器。

默认情况下，`Rigidbody3D`是**动力学类型**的刚体碰撞器，这是可以受力影响的刚体类型碰撞器，所以我们通常用动力学刚体碰撞器进行受力的交互反馈。例如，撞击后的反弹、飞出或者倒下，放在空中会受重力影响而掉落，等等。

当我们将刚体`Rigidbody3D`的`isKinematic`设置为true后，那么默认的动力学刚体碰撞器就转变为运动刚体碰撞器。

运动刚体碰撞器从表象上看，与静态碰撞器基本上没有什么区别。都是不受重力、不受速度、不受其它力的影响，在物理世界中永远处于静止，只能通过transform去改变节点坐标来移动。

但实质上，运动刚体有物理特性，它可以是施力物体，可以对非运动刚体产生力，例如通过控制节点去移动运动刚体，会推着挡在前面的动力学刚体移动。而静态碰撞器的应用场景则是要永远不动，也无法施加力。并且，通过节点去移动静态碰撞器，也比较消耗性能。如果有移动的碰撞器需求，例如来回移动的跳板或障碍，使用运动刚体碰撞器就可以了。

通过代码设置运动刚体的方式：

```typescript
/*
……省略若干代码
*/

//获得刚体碰撞器
this.rigidbody = this.cube1.getComponent(Laya.Rigidbody3D) as Laya.Rigidbody3D;
//开启运动类型刚体
this.rigidbody.isKinematic = true;

/*
……省略若干代码
*/
```

在LayaAir中设置运动类型刚体的方式，如图2-4所示：

<img src="img/2-4.png" alt="img" style="zoom:43%;" />  

（图2-4）

由于LayaAir的3D物理中有了静态碰撞器`PhysicsCollider`，所以并没有在`Rigidbody3D `中去实现静力学类型的刚体碰撞器。有静止的碰撞反馈需求，直接使用静态碰撞器即可。

##### 2.2.3 角色碰撞器 `CharacterController`

角色控制器类`CharacterController`常用于对第一人称和第三人称游戏角色的控制，可以方便的控制角色的跳跃、跳跃速度、降落速度、行走、等。

由于角色控制器继承于`PhysicsComponent`，也具有碰撞器的特性，可以添加三维碰撞形状，产生碰撞的反馈，因此也称为角色碰撞器，属于碰撞器之一。

与静态碰撞器和刚体碰撞器都继承自物理触发器组件`PhysicsTriggerComponent`不同，角色控制器直接继承于物理组件的父类`PhysicsComponent`。所以，角色控制器是无法设置为触发器的。但是，角色碰撞器与触发器进行接触，仍然可以激活触发器的生命周期方法。

  <img src="img/2-5.png" alt="img" style="zoom:43%;" /> 

（图2-4）

图2-4是添加角色控制器类`CharacterController`

#### 2.3 碰撞形状

碰撞形状是用于检测碰撞接触的范围，只有添加了形状，碰撞器和触发器才能触发物理反馈和生命周期。

LayaAir引擎支持8种3D碰撞形状，分别为：

盒形`BoxColliderShape`、球形`SphereColliderShape`、圆柱形`CylinderColliderShape`、胶囊形`CapsuleColliderShape`、圆锥形`ConeColliderShape`、平面形状`StaticPlaneColliderShape`、复合形状`CompoundColliderShape`、网格形状`MeshColliderShape`。

##### 2.3.1 LayaAir中可创建的碰撞形状

盒形碰撞体`Box collider`、球形碰撞体`Sphere Collider`、胶囊形碰撞体`Capsule Collider`、圆柱形`CylinderColliderShape`、圆锥形`ConeColliderShape`、网格碰撞体 `Mesh Collider`，这6种组件是可以在LayaAir中使用的。

下面我们简单介绍一下这些碰撞体形状的基础属性设置

###### 盒形碰撞形状

盒形碰撞形状是通过设置XYZ调整长宽高的长方体（含立方体）形状。常用于盒子外形的长方体物体，如图2-6所示。

<img src="img/2-6.png" alt="img" style="zoom:33%;" />  

（图2-6）
在LayaAir中，设置盒形碰撞XYZ各轴的大小，如图2-7所示。

<img src="img/2-7.png" alt="img" style="zoom:50%;" />  

（图2-7）

###### 球形碰撞形状

球形碰撞形状是通过设置半径调整球体大小的碰撞形状。常用于球形外观的物体，如图2-8所示。

<img src="img/2-8.png" alt="img" style="zoom:35%;" />  

（图2-8）

在LayaAir中，设置球形碰撞半径，如图2-9所示。

<img src="img/2-9.png" alt="img" style="zoom: 50%;" /> 

（图2-9）

###### 胶囊形碰撞形状

胶囊形碰撞形状是由两个半球和一个圆柱体组成，需要通过设置球体半径和圆柱体的高来组成胶囊形状。常用于角色碰撞器。如图2-10所示。

<img src="img/2-10.png" alt="img" style="zoom:33%;" />   

（图2-10）

在LayaAir中，设置胶囊形碰撞半径和高，轴方向，如图2-11所示，导出后即可使用。

  <img src="img/2-11.png" alt="img" style="zoom:50%;" /> 

（图2-11）

###### 圆柱形碰撞形状

圆柱形碰撞形状是通过设置半径和高调整球体大小的碰撞形状。如图2-12所示。

<img src="img/2-12.png" alt="img" style="zoom:35%;" />  

（图2-12）

在LayaAir中，设置圆柱形碰撞半径和高，如图2-13所示。

<img src="img/2-13.png" alt="img" style="zoom: 50%;" /> 

（图2-13）

###### 圆锥形形碰撞形状

圆锥形形碰撞形状是通过设置半径和高调整球体大小的碰撞形状。如图2-14所示。

<img src="img/2-14.png" alt="img" style="zoom:35%;" />  

（图2-14）

在LayaAir中，设置圆锥形碰撞半径和高，如图2-15所示。

<img src="img/2-15.png" alt="img" style="zoom: 50%;" /> 

（图2-15）

###### 网格形碰撞形状

网格形碰撞形状是利用模型网格资源构建的形状，如图2-16-1的猴子所示。相对于其它固定规则的碰撞形状（LayaAir内置的3D碰撞基础形状），网格形碰撞形状属于自定义任意外观的碰撞形状，可以适用于任何模型网格。

<img src="img/2-16.jpg" alt="img" style="zoom: 41%;" /> 

（图2-16-1）

在LayaAir中，设置模型网格，如图2-16-2所示。

<img src="img/2-16.png" alt="image-20221114211401062" style="zoom: 50%;" /> 

（图2-16-2）

##### 2.3.2 其它LayaAir碰撞形状

除了碰撞体组件支持的一些形状外，LayaAir引擎中还内置了一些基础的3D碰撞形状。这些只能通过代码的方式进行添加。

###### 平面碰撞形状

平面碰撞形状，是一种无限大的2D平面碰撞形状。通常用于整个场景地面的碰撞形状。通过法线来确定在3维世界的平面朝向，可以通过偏移值来调整距离原点的偏移多少。API说明如图2-17所示。

![img](img/2-17.png) 

（图2-17）

通过API，我们可以看到normal是一个3维向量值，表示着平面的法线。例如这个值为`Vector3(0, 1, 0)`，则表示法线位于Y轴正方向，平面碰撞形状就是处于其垂直的X轴无限大水平面。

图2-18和2-19是法线同样位于Y轴正方向，偏移值offset分别为0（左侧）和为1（右侧）的效果对比。

<img src="img/2-18.png" alt="img" style="zoom:31%;" />   <img src="img/2-19.png" alt="img" style="zoom:38%;" />

（图2-18）																				（图2-19）

##### 2.3.3 碰撞器的形状代码添加示例

###### LayaAir内置的基础碰撞形状使用示例

内置的碰撞器使用思路为，创建节点对象，创建碰撞器，创建碰撞器形状，为碰撞器添加碰撞形状。

我们以创建圆锥形刚体碰撞器为例，编写代码如下所示：

```typescript
   /*
    ……省略若干代码
   */

/**增加圆锥形刚体碰撞器 */
	private addCone(): void {
        //生成随机值半径和高
		let raidius = Math.random() * 0.2 + 0.2;
		let height = Math.random() * 0.5 + 0.8;
		//创建圆锥形3D模型节点对象
		let cone = new Laya.MeshSprite3D(Laya.PrimitiveMesh.createCone(raidius, height));
		//把圆锥形3D节点对象添加到3D场景节点下
		this.newScene.addChild(cone);
		//设置随机位置
		this.tmpVector.setValue(Math.random() * 6 - 2, 6, Math.random() * 6 - 2);
		cone.transform.position = this.tmpVector;
		//为圆锥形3D节点对象创建刚体碰撞器
		let _rigidBody = <Laya.Rigidbody3D>(cone.addComponent(Laya.Rigidbody3D));
		//创建圆锥形碰撞器形状（使用节点对象的值，保持一致性）
		let coneShape = new Laya.ConeColliderShape(raidius, height);
		//为刚体碰撞器添加碰撞器形状
		_rigidBody.colliderShape = coneShape;
	}
    
    /*
    ……省略若干代码
   */
```

> 其它基础形状的创建可参考官网的引擎示例

###### 复合碰撞形状的使用示例

复合碰撞形状是由多个基础形状组合而成的碰撞器形状。例如桌子或者凳子等，可以由多个盒形碰撞形状组成，如图2-20所示。

<img src="img/2-20.png" alt="img" style="zoom:81%;" /> 

（图2-20）

复合碰撞形状主要就是可以添加多个不同的子形状，理解后其实也是非常简单。

创建复合碰撞形状的方式并不复杂，先实例化复合碰撞形状`CompoundColliderShape()`，再通过复合碰撞形状对象的addChildShape方法添加基础碰撞形状子对象即可。

我们继续通过代码和注释来理解。编写代码如下所示：

```typescript
   /*
    ……省略若干代码
   */
Laya.Mesh.load("res/threeDimen/Physics/table.lm", Laya.Handler.create(this, function(mesh:Laya.Mesh) {
    //读取桌子模型节点对象，添加到3D场景节点下，
    var table = scene.addChild(new Laya.MeshSprite3D(mesh)) as Laya.MeshSprite3D;
    //给桌子节点对象添加刚体碰撞器
    var rigidBody = table.addComponent(Laya.Rigidbody3D) as Laya.Rigidbody3D;
    //实例化一个复合碰撞形状对象
    var compoundShape:Laya.CompoundColliderShape = new Laya.CompoundColliderShape();
    
    //创建盒形碰撞形状
    var boxShape:Laya.BoxColliderShape = new Laya.BoxColliderShape(0.5, 0.4, 0.045);
    //获取本地偏移
    var localOffset:Laya.Vector3 = boxShape.localOffset;
    //修改偏移
    localOffset.setValue(0, 0, 0.125);
    boxShape.localOffset = localOffset;
    //为复合碰撞形状对象添加子形状（刚刚创建的盒形碰撞形状）
    compoundShape.addChildShape(boxShape);
    
    //后面的代码都是类似，把一个个的子形状都添加到复合碰撞形状对象上。子形状也可以是别的形状，例如球形、圆柱形等，根据模型节点的实际情况来。
   /*
    ……省略若干boxShapeXX类似的代码，只保持到boxShape4
   */    
    var boxShape4:Laya.BoxColliderShape = new Laya.BoxColliderShape(0.1, 0.1, 0.3);
    var localOffset4:Laya.Vector3 = boxShape4.localOffset;
    localOffset4.setValue(0.2, 0.153, -0.048);
    boxShape4.localOffset = localOffset3;
    compoundShape.addChildShape(boxShape4);
    
    //把组合好的复合碰撞形状添加给刚体碰撞器的碰撞器形状属性
    rigidBody.colliderShape = compoundShape;
    
}));
   /*
    ……省略若干代码
   */
```



#### 2.4 碰撞生命周期方法

生命周期是从开始到结束的完整周期过程，有主动触发的主干生命周期方法，例如`onAwake()`、`onEnable()`、等。也有被动触发的事件类生命周期虚方法，这种只有在某个条件达到时才会自动激活，例如，本小节要讲的物理事件相关的方法。

##### 2.4.1 物理事件的生命周期方法说明

前文介绍过，检测物理碰撞的方式有两种，那物理事件的方法，也对应着两种。分别是碰撞事件生命周期方法和触发事件生命周期方法。

###### 碰撞事件生命周期方法说明：

碰撞器之间发生碰撞后，自动激活的事件虚方法。

| 碰撞事件生命周期方法名称 | 碰撞事件生命周期方法说明                                     |
| ------------------------ | ------------------------------------------------------------ |
| onCollisionEnter         | **刚发生物理碰撞时**，也就是碰撞事件生命周期内的第一次进入碰撞，自动执行的生命周期虚方法，该方法只会执行一次。 |
| onCollisionStay          | **持续的物理碰撞时**，也就是碰撞事件生命周期内的第二次碰撞到碰撞离开前，自动执行的生命周期虚方法。该方法在持续碰撞期间，每帧都会执行。 |
| onCollisionExit          | **物理碰撞结束时**，自动执行的生命周期虚方法，该方法只会执行一次。 |

###### 触发事件生命周期方法说明：

设置为触发器之后，因物体接触而自动激活的事件虚方法。

| 触发事件生命周期方法名称 | 触发事件生命周期方法说明                                     |
| ------------------------ | ------------------------------------------------------------ |
| onTriggerEnter           | **刚发生物体接触时**，也就是触发事件生命周期内的第一次进行接触，自动执行的生命周期虚方法，该方法只会执行一次。 |
| onTriggerStay            | **持续的物体接触时**，也就是触发事件生命周期内的第二次接触到接触离开前，自动执行的生命周期虚方法。该方法在持续接触期间，每帧都会执行。 |
| onTriggerExit            | **物体接触结束时**，自动执行的生命周期虚方法，该方法只会执行一次。 |

###### 特别说明：

- 碰撞事件的生命周期方法永远不会与触发事件的生命周期方法同时激活，只能是碰撞事件或者是触发事件。并且，如果有一方是触发器，那两方一定无法进入碰撞事件，只有进入触发事件的可能。
- 无论是碰撞事件还是触发事件的生命周期方法，从进入到离开的顺序皆为“Enter,Stay,Stay,……,Exit”。

##### 2.4.2 碰撞事件生命周期方法的触发条件

根据碰撞器的类型不同，并不是所有碰撞器之间，都会触发碰撞的反馈，以及激活相应的生命周期方法。

下面通过表格的方式，对应了各碰撞器之间是否可触发碰撞事件的生命周期虚方法。

|                  | 静态碰撞器 | 动力学刚体碰撞器 | 运动刚体碰撞器 | 角色碰撞器 |
| ---------------- | ---------- | ---------------- | -------------- | ---------- |
| 静态碰撞器       | ✘          | ✔                | ✘              | ✔          |
| 动力学刚体碰撞器 | ✔          | ✔                | ✔              | ✔          |
| 运动刚体碰撞器   | ✘          | ✔                | ✘              | ✔          |
| 角色碰撞器       | ✔          | ✔                | ✔              | ✔          |

###### 总结：

通过上面的表格，我们发现，静态碰撞器和运动刚体碰撞器，只能与动力学刚体碰撞器或者是角色碰撞器碰撞才可以触发碰撞器生命周期方法，静态碰撞器和运动刚体碰撞器彼此之间，是无法触发碰撞器生命周期的。

而动力学刚体碰撞器和角色碰撞器，和任意的碰撞器发生碰撞都可以触发碰撞器生命周期方法。

##### 2.4.3 触发事件生命周期方法的触发条件

碰撞器是只能与碰撞器之间碰撞，才有可能进入碰撞器的生命周期，

而触发器则不然，触发器不仅与触发器之间有可能进入触发器的生命周期，当触发器与碰撞器之间接触，也有可能进入触发器的生命周期，所以，我们分成两个表来理解。

###### 触发器与触发器之间：

|                  | 静态触发器 | 动力学刚体触发器 | 运动刚体触发器 |
| ---------------- | ---------- | ---------------- | -------------- |
| 静态触发器       | ✘          | ✔                | ✔              |
| 动力学刚体触发器 | ✔          | ✔                | ✔              |
| 运动刚体触发器   | ✔          | ✔                | ✔              |

###### 触发器与碰撞器之间：

|                  | 静态触发器 | 动力学刚体触发器 | 运动刚体触发器 |
| ---------------- | ---------- | ---------------- | -------------- |
| 静态碰撞器       | ✘          | ✔                | ✔              |
| 动力学刚体碰撞器 | ✔          | ✔                | ✔              |
| 运动刚体碰撞器   | ✔          | ✔                | ✔              |
| 角色碰撞器       | ✔          | ✔                | ✔              |

###### 总结：

通过上面的两个表格，我们发现，无论是触发器与触发器之间，还是触发器与碰撞器之间，只有静态碰撞器与静态触发器彼此之间碰撞或者接触，是无法进入物理触发事件的。

而其它类型之间接触，哪怕碰撞器没有开启触发器，甚至没有触发器属性（角色碰撞器），只要有任意一方是触发器，那也会自动进入触发器的生命周期。

##### 2.4.4 使用生命周期方法

###### 创建**Script3D**脚本

生命周期的方法，只能在脚本类里使用，所以，我们需要创建一个脚本，3D游戏必须要继承3D的脚本**Script3D**。空脚本的示例代码如下：

```typescript
/**
 * TypeScript语言的3D脚本示例
 */
export default class TSDemo extends Laya.Script3D {
    constructor() { super(); }
}
```

> 2D脚本与3D脚本不要混用，如果是用IDE创建的脚本模板，需要将继承的2D脚本类（Laya.Script）改为3D脚本类（Laya.Script3D），

###### 添加物理脚本

只有为节点添加了我们自定义的脚本，我们才可以让该节点使用生命周期方法。

添加的方式很简单，直接在代码中，用节点的`addComponent()`方法，就可以轻松的把继承了脚本类的3D脚本添加到节点上。

例如，我们创建一个3D盒子，并为其绑定刚刚创建的TSDemo脚本。示例代码如下：

```typescript
//引入自定义脚本TSDemo
import TSDemo from "./TSDemo";
/**
 * TypeScript语言示例
 */
export default class GameUI extends GameUIBase {
    /*
    ……省略若干代码
    */
    private addBox(): void {
		//创建盒型MeshSprite3D
		let box = this.newScene.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createBox(0.75, 0.5, 0.5))) as Laya.MeshSprite3D;
		//设置材质
		box.meshRenderer.material = this.mat1;
        //设置空间位置
		let transform = box.transform;
		let pos = transform.position;
		pos.setValue(1, 6, 0);
		transform.position = pos;
		//创建刚体碰撞器
		let _rigidBody = box.addComponent(Laya.Rigidbody3D) as Laya.Rigidbody3D;
		//创建盒子形状碰撞器
		let boxShape = new Laya.BoxColliderShape(0.75, 0.5, 0.5);
		//设置盒子的碰撞形状
		_rigidBody.colliderShape = boxShape;
        
        //添加自定义脚本组件TSDemo
        box.addComponent(TSDemo);
    }
    /*
    ……省略若干代码
    */
}
```

###### 重写物理生命周期方法

之前介绍过，物理事件的生命周期方法分别为三个碰撞事件方法和三个触发事件方法。我们在使用的时候，重写这些虚方法即可，当物理行为触发了对应的物理事件就会自动执行。

重写生命周期方法的示例代码如下：

```typescript
/**
 * TypeScript语言的3D脚本示例
 */
export default class TSDemo extends Laya.Script3D {
    constructor() { super(); }

    onTriggerEnter(): void {
        /*
   	 	……省略若干逻辑代码
    	*/
        console.log("触发器物理事件onTriggerEnter");
    }
    onTriggerStay(): void {
        /*
   	 	……省略若干逻辑代码
    	*/
        console.log("触发器物理事件onTriggerStay");
    }    
    onTriggerExit(): void {
        /*
   	 	……省略若干逻辑代码
    	*/
        console.log("触发器物理事件onTriggerExit");
    }

    
    onCollisionEnter(): void {
        /*
   	 	……省略若干逻辑代码
    	*/
        console.log("碰撞器物理事件onCollisionEnter");
    }
    onCollisionStay(): void {
        /*
   	 	……省略若干逻辑代码
    	*/
        console.log("碰撞器物理事件onCollisionStay");
    }
    onCollisionExit(): void {
        /*
   	 	……省略若干逻辑代码
    	*/
        console.log("碰撞器物理事件onCollisionExit");
    }
}
```

#### 2.5 碰撞分组与过滤碰撞组

当我们产生复杂的碰撞需求时，例如，想碰哪个，不碰哪个。这时候就需要进行分组，并指定可以与哪个碰撞组进行碰撞。另外，设置碰撞组过滤，还会优化性能。

各种碰撞器从物理组件父类`PhysicsComponent`那里继承了collisionGroup与canCollideWith属性，用以实现碰撞分组和指定碰撞组。

##### 2.5.1 碰撞组 collisionGroup

碰撞组的值，我们通常设置为2的N次幂值。如果应用场景比较复杂，需要用到的碰撞分组比较多，记不住太多2的N次幂值，也可以直接使用LayaAir引擎内置的碰撞组工具类。

LayaAir引擎内置了17个碰撞组属性值，用于过滤不需要的碰撞。

引擎内置的碰撞组工具类为`Laya.Physics3DUtils`。

###### 全部可碰撞的组

由于碰撞组之间的碰撞依据是位运算的按位与，按位与的计算结果非0则可以碰撞，为0则不可碰撞。

Physics3DUtils工具类的`COLLISIONFILTERGROUP_ALLFILTER`属性值为-1，-1与任何2的幂值进行按位与都非0，所以取该属性值为分组时，则所有的碰撞组都可碰撞。
使用示例为：

```typescript
//指定xxx碰撞器所属哪个碰撞组（-1组与LayaAir任何内置组都可碰撞）
xxx.collisionGroup = Laya.Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER;
```

###### 自定义碰撞分组

LayaAir内置的碰撞组，不包括刚刚讲的-1（COLLISIONFILTERGROUP_ALLFILTER），我们可以用的还有10个，分别是`COLLISIONFILTERGROUP_CUSTOMFILTER1......10`。全都是2的幂，从64到32768。

为了方便记忆，我们可以不记实际值，记住CUSTOMFILTER后1到10的ID号区别即可。

使用示例为：

```typescript
//指定xxx碰撞器所属哪个碰撞组（COLLISIONFILTERGROUP_CUSTOMFILTER2对应的值为128）
xxx.collisionGroup = Laya.Physics3DUtils.COLLISIONFILTERGROUP_CUSTOMFILTER2;
```

###### 特定的碰撞分组

除了以上的分组外，LayaAir也对接了一些Bullet物理引擎预留的特定分组，用于比较简单的碰撞过滤需求。

例如，当前场景我们只有动态刚体碰撞器，静态碰撞器，运动学刚体碰撞器，只是对这几种碰撞器之间作碰撞过滤，那么我们就可以分别使用对应的默认碰撞组、静态碰撞组、运动学刚体碰撞组。

具体的预留分组属性说明如下：

| 碰撞组属性名                         | 属性值 | 说明             |
| ------------------------------------ | ------ | ---------------- |
| COLLISIONFILTERGROUP_DEFAULTFILTER   | 1      | 默认碰撞组       |
| COLLISIONFILTERGROUP_STATICFILTER    | 2      | 静态碰撞组       |
| COLLISIONFILTERGROUP_KINEMATICFILTER | 4      | 运动学刚体碰撞组 |
| COLLISIONFILTERGROUP_DEBRISFILTER    | 8      | 碎片碰撞组       |
| COLLISIONFILTERGROUP_SENSORTRIGGER   | 16     | 传感器触发器     |
| COLLISIONFILTERGROUP_CHARACTERFILTER | 32     | 字符过滤器       |

> 以上的属性是原样对接了Bullet物理引擎，例如碎片碰撞组和字符过滤器的概念，当前的引擎版本还没有。开发者想用也可以，但建议不采用，推荐使用自定义碰撞分组，以ID为分组标记更便于记忆。

##### 2.5.2 过滤碰撞组 canCollideWith

###### 指定碰撞单个组

碰撞器的`canCollideWith`属性可以用于指定与哪个组碰撞，指定哪个，就可以与哪个碰撞。其它的都不可以碰撞，起到了过滤其它碰撞组的效果。

使用示例为：

```typescript
//指定xxx碰撞器可以与其发生碰撞的碰撞组(本例只与自定义组1碰撞)
xxx.canCollideWith = Laya.Physics3DUtils.COLLISIONFILTERGROUP_CUSTOMFILTER1;
```

###### 指定碰撞多个组

如果我们想碰撞多个组，可以采用位运算的按位或`|` ，去指定多个可以与其发生碰撞的碰撞组。

使用示例为：

```typescript
//指定xxx碰撞器可以与其发生碰撞的碰撞组(本例只与自定义组1、2、5进行碰撞)
xxx.canCollideWith = Laya.Physics3DUtils.COLLISIONFILTERGROUP_CUSTOMFILTER1 | Laya.Physics3DUtils.COLLISIONFILTERGROUP_CUSTOMFILTER2 | Laya.Physics3DUtils.COLLISIONFILTERGROUP_CUSTOMFILTER5;
```

> 关于位运算用于碰撞的基础原理，如果不明白的可以参考[2D物理](../../../IDE/physicsEditor/physics2D/readme.md)

###### 指定不可碰撞的组

在多个碰撞分组的情况下，如果我们只想排除掉某个或者某几个碰撞组不与其发生碰撞，与其它所有的碰撞组发生碰撞如何处理呢？

这时候可以通过异或运算符`^`来实现。用 `-1`去异或`^`任何2的幂值，那该值的碰撞组就不会被碰撞。

使用示例为：

```typescript
//指定不可以与其发生碰撞的碰撞组(本例将不与自定义组2、5进行碰撞，除自定义2与5组之外，都可以发生碰撞)
xxx.canCollideWith = Laya.Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER ^ Laya.Physics3DUtils.COLLISIONFILTERGROUP_CUSTOMFILTER2 ^ Laya.Physics3DUtils.COLLISIONFILTERGROUP_CUSTOMFILTER5;
```



### 三、物理约束

在物理世界中，有些物体的运动会受到其它物体的影响，例如：人体关节、钟摆、链条、滑轮组、等等。

这种限制物体运动，避免其运动超出一定限度的物理方法就是约束。由于其还具有着关节的特性表现，所以有些引擎也称为关节。

#### 3.1 LayaAir支持哪些约束

目前在LayaAir引擎中只支持两种，分别是固定约束`Fixed Constraint`和可配置约束`Configurable Constraint`。

**固定约束**是比较常用的约束，而**可配置约束**可以模拟任意**约束**的效果，所以这两种约束可以满足绝大多数的常用需求。

#### 3.2 固定约束`Fixed Constraint`

固定约束将对象的移动限制为依赖于另一个对象，一个物体产生位移变化 ，另一个与其约束的物体也会随之变化 。有些类似父子节点关系，但它与父子节点不同，位移不是通过transform实现，而是基于物理引擎。

固定关节类似2D物理（Box2D）里的焊接关节，适用于游戏中的物体对象永久或暂时粘在一起的需求，最好是两个没有父子关系的物理一起运动。好处是不必通过脚本更改对象的层级视图来实现所需的效果。代价是所有使用固定关节的对象都必须使用刚体。

##### 3.2.1 设置连接刚体 setConnectRigidBody

`setConnectRigidBody`用于指定固定约束要连接的刚体，若不指定，则该约束连接到世界。

##### 3.2.2 断开力 breakForce

`breakForce`用于设置破坏固定约束需要施加的最大力。

##### 3.2.3 断开力矩 breakTorque

`breakTorque`用于设置破坏固定约束需要施加的最大力矩。

#### 3.3 **可配置约束**`Configurable Constraint`

可配置约束可实现各种约束类型的所有功能，比如上文介绍过的固定约束，也可以通过可配置约束来实现，并且提供更强大的角色移动控制。

当开发者想要自定义布娃娃的运动并对角色强制实施某些姿势时，这种约束特别有用。使用可配置约束还可以将约束修改为开发者自行设计的高度专业化约束。

##### 3.3.1 设置连接刚体 setConnectRigidBody 

`setConnectRigidBody`用于指定固定约束要连接的刚体，若不指定，则该约束连接到世界。

#####  3.3.2 锚点  anchor  

锚点`anchor` 是用于定义自身刚体约束中心的点。物理模拟会使用此点作为计算的中心点。

#####  3.3.3  主轴 axis

主轴 `axis`用于基于物理模拟来定义对象自然旋转的局部轴，该轴决定了对象在物理模拟下自然旋转的方向。

##### 3.3.4 连接锚点 connectAnchor 

连接锚点`connectAnchor` 用于设置所连接刚体的约束锚点。

例如自己是车轮，连接的刚体是车身。那锚点就是车轮的约束中心点，连接锚点就是所连接的车身约束中心点。

##### 3.3.5  副轴 secondaryAxis

副轴`secondaryAxis`的作用是与主轴`axis`共同定义了约束的局部坐标系。第三个轴会与这两个轴所构成的平面相垂直。

##### 3.3.6  沿XYZ轴平移约束模式 (X\Y\Z)Motion

 (X\Y\Z)Motion是表示沿 X、Y 、Z 轴平移约束的模式，根据属性设置的不同，约束的模式也不同。可以设置的值分别是：自由移动`Free`、锁定移动 `Locked`、限制性移动 `Limited`。

自由移动`Free`就是不作限制的沿某轴移动。

锁定移动 `Locked`是没有运动，完全固定住。

限制性移动 `Limited`是平移运动受限于用户定义的约束。

##### 3.3.7 绕XYZ轴旋转的角运动约束模式angular (X\Y\Z)Motion

angular (X\Y\Z)Motion是表示绕X、Y 、Z 轴旋转的角运动约束模式，也是根据自由移动`Free`、锁定移动 `Locked`、限制性移动 `Limited`三种值的设置来区别约束模式，与(X\Y\Z)Motion类似，只是运动形式的线性平移和角运动旋转的区别。

##### 3.3.8 弹簧线性限制 （linearLimitSpring、linearDamp）

###### 弹簧力Spring

其中的弹簧力`Spring` 在LayaAir引擎中对应线性限制的弹簧力`linearLimitSpring`，如果此处的值设置为零，则无法逾越限制；零以外的值将使限制变得有弹性。

###### 阻尼Damper

其中的阻尼`Damper`在LayaAir引擎中对应线性阻尼`linearDamp`，设置为大于零的值可让约束抑制振荡（否则将不断的进行振荡）。

##### 3.3.9 线性移动限制（minLinearLimit、maxLinearLimit、linearBounce）

###### 限制Limit

其中的`Limit`是从原点到限制位置的距离。在LayaAir引擎中需要分别设置线性移动限制的最小值`minLinearLimit`和线性移动限制的最大值`maxLinearLimit`。

###### 反弹力Boundciness

其中的反弹力 `Bounciness` 是当对象达到限制距离时，要将对象拉回而施加的弹力。在LayaAir引擎中对应线性反弹力`linearBounce`。

##### 3.3.10 弹簧角运动限制（angularLimitSpring、angularDamp）

###### 弹簧力Spring

其中的弹簧力`Spring` 在LayaAir引擎中对应角运动旋转限制的弹簧力`angularLimitSpring`，如果此处的值设置为零，则无法逾越限制；零以外的值将使限制变得有弹性。

###### 阻尼Damper

其中的阻尼`Damper`在LayaAir引擎中对应角运动旋转阻尼`angularDamp`，设置为大于零的值可让约束抑制振荡（否则将不断的进行振荡）。

##### 3.3.11 角运动限制（minAngularLimit、maxAngularLimit、angularBounce）

###### 限制Limit

其中的`Limit`是限制旋转角度，设置对象旋转角度的下限值。在LayaAir引擎中需要分别设置旋转角度限制的最小值`minAngularLimit`和旋转角度限制的最大值`maxAngularLimit`。这两个值都是3D向量值。

旋转限制最小值的X对应X轴旋转的下限`Low Angular X Limit`值，Y对应Y轴旋转的限制`Angular Y Limit`值取负，Z对应Z轴旋转的限制`Angular Z Limit`值取负。

旋转限制最大值的X对应X轴旋转的上限`Hight Angular X Limit`值，Y对应Y轴旋转的限制`Angular Y Limit`值，Z对应Z轴旋转的限制`Angular Z Limit`值。

###### 反弹力Boundciness

其中的反弹力 `Bounciness` 是当对象的旋转达到限制角度时在对象上施加的反弹力矩。在LayaAir引擎中对应角度反弹力矩`angularBounce`。

### 四、物理射线

#### 4.1 什么是物理射线

射线的定义是只有一个端点无限延长形成的直的线。LayaAir引擎的数学对象`Laya.Ray()`就是只有起点和方向的射线。

在LayaAir引擎中，射线常用于基础的碰撞检测，所以具有射线的发射特性，但用于碰撞检测功能的射线称为物理射线。

> 需要注意的是，射线可以用于物理射线检测，但是物理射线并不等同于射线。

#### 4.2 创建射线

LayaAir引擎提供了创建3D空间射线的类`Laya.Ray()`，以及通过摄像机从屏幕空间点去生成这个射线的方法`viewportPointToRay()`。

示例代码如下所示：

```typescript
/*
……省略若干代码
*/
//创建一个屏幕点
let point = new Laya.Vector2();
//创建一个射线 Laya.Ray(射线的起点，射线的方向)
let ray = new Laya.Ray(new Laya.Vector3(0, 0, 0), new Laya.Vector3(0, 0, 0));
//以鼠标点击的点作为原点
point.x = Laya.stage.mouseX;
point.y = Laya.stage.mouseY;
//计算一个从屏幕空间生成的射线
_camera.viewportPointToRay(point, ray);
/*
……省略若干代码
*/
```

#### 4.3 使用物理射线

在LayaAir 3D中实现射线检测是使用物理模拟器类`PhysicsSimulation`。

射线检测的方法有4个，分别为射线检测第一个碰撞物体的方法`raycast` 和 `raycastFromTo`以及射线检测所有碰撞物体的方法`raycastAll`和`raycastAllFromTo`。

检测一个和所有的区别比较容易理解，就是碰到第一个物体后射线立即结束，和射线可穿透所有碰撞物体一直不结束，这两种区别。如图4-1所示。

![](img/4-1.png) 

（图4-1）

那为什么同样的功能名称还有带FromTo和不带FromTo两种，又有什么区别呢？

与数学对象的射线所不同的是，用于检测碰撞的物理射线是有长度的，或者是需要设置世界空间的结束位置。

带FromTo的是使用两个点（射线的起始位置点和结束位置点）作为参数。

而不带FromTo的则是直接使用已经创建好的射线，不需要设置射线的结束位置点，但需要设置长度，如果我们不设置长度，则采用默认值长度`2147483647`。

如果是不带FromTo的射线检测，我们可以沿用上个小节创建射线的示例，稍加补充一下，具体代码如下所示：

```typescript
/*
……省略若干代码
*/
//创建一个屏幕点
let point = new Laya.Vector2();
//创建一个射线 Laya.Ray(射线的起点，射线的方向)
let ray = new Laya.Ray(new Laya.Vector3(0, 0, 0), new Laya.Vector3(0, 0, 0));
//以鼠标点击的点作为原点
point.x = Laya.stage.mouseX;
point.y = Laya.stage.mouseY;
//计算一个从屏幕空间生成的射线
_camera.viewportPointToRay(point, ray);
//拿到3D场景中射线碰撞的物体
_scene3D.physicsSimulation.rayCastAll(ray,this.outs);
//如果射线碰撞到物体
if (this.outs.length !== 0) {
    for (let i = 0; i < this.outs.length; i++){
        //在射线击中的位置添加一个立方体
        this.addBoxXYZ(this.outs[i].point.x, this.outs[i].point.y, this.outs[i].point.z );
    }        
}
/*
……省略若干代码
*/
```

带FromTo的射线检测使用示例，具体代码如下所示：

```typescript
/*
……省略若干代码
*/
/*进行射线检测,检测所有碰撞的物体
//_scene3D.physicsSimulation.raycastAllFromTo(this.from, this.to, this.outs);
//检测所有物体的射线使用与上个示例类似
*/

//进行射线检测,检测第一个碰撞物体
_scene3D.physicsSimulation.raycastFromTo(this.from, this.to, this.out);
//将射线碰撞到的物体设置为红色
((this.out.collider.owner as Laya.MeshSprite3D).meshRenderer.sharedMaterial as Laya.BlinnPhongMaterial).albedoColor = new Laya.Vector4(1.0, 0.0, 0.0, 1.0);
/*
……省略若干代码
*/
```

#### 4.4 使用异形物理射线

常规的物理射线是用一条射线来检测碰撞，LayaAir引擎中也提供了与物理射线检测类似的功能，但采用的是自定义碰撞器形状检测来代替物理射线，相当于异形的射线检测功能。

与普通的射线检测一样，异形射线也是有检测第一个和检测所有两个检测方法，分别是`shapeCast`和`shapeCastAll`。

![15](img/4-2.png) 

（图4-2）

图4-2的示例，就采用球形射线来实现碰撞检测，具体代码如下所示：

```typescript
//创建球型碰撞器
var sphereCollider:Laya.SphereColliderShape = new Laya.SphereColliderShape(0.5);

//通过按钮this.castAll状态切换是采用检测全部还是检测第一个
if (this.castAll) {
    //采用球形碰撞器进行形状检测,检测所有碰撞的物体
    this.scene.physicsSimulation.shapeCastAll(sphereCollider, this.from, this.to, this.outs);
    for (let i = 0; i < this.outs.length; i++){
        ((this.outs[i].collider.owner as Laya.MeshSprite3D).meshRenderer.sharedMaterial as Laya.BlinnPhongMaterial).albedoColor = new Laya.Vector4(1.0, 0.0, 0.0, 1.0);
} else {
    //采用球形碰撞器进行形状检测,检测第一个碰撞物体
    if (this.scene.physicsSimulation.shapeCast(sphereCollider, this.from, this.to, this.out))
        ((this.out.collider.owner as Laya.MeshSprite3D).meshRenderer.sharedMaterial as Laya.BlinnPhongMaterial).albedoColor = new Laya.Vector4(1.0, 0.0, 0.0, 1.0);
}
```

#### 4.5 设置射线碰撞组

无论是普通射线还是异形射线，都可以设置碰撞组，以及指定射线可碰撞的组。

如何设置碰撞组值collisonGroup和如何指定可发生碰撞的组值canCollideWith在前文中已经介绍过，

我们将值带入射线检测对应的方法即可实现射线的选择性碰撞。

> 射线检测里用于指定检测碰撞组的参数collisionMask对应的是前文介绍的canCollideWith



### 五、其它物理引擎的使用

之前的章节一直在介绍LayaAir基于Bullet物理引擎封装的物理引擎API。Bullet虽然强大，但是有些开发者对于物理精度要求不高，物理功能的使用也比较基础，只对物理引擎库的体积有要求，比如Cannon物理引擎库，其体积只有不足200k。目前LayaAir3.0的物理引擎接口正在改进中，以支持更多的第三方物理引擎，因此Cannon物理引擎暂时从IDE中删除，等后续改进完将会告知开发者。
