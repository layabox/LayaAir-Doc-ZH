# ECS-系统：组件脚本的内置方法

> Author：Charley

在 LayaAir 引擎采用的 ECS（实体 - 组件 - 系统）架构中，系统是逻辑处理单元，根据组件提供的数据驱动实体行为。

当开发者继承了 LayaAir 组件脚本类（ `Laya.Script` ）后，即可使用引擎提供的一系列生命周期方法（如 `onAwake`、`onEnable`、`onUpdate` 等）和事件响应方法（如 `onMouseDown`、`onMouseClick` 等）。**这些内置方法作为组件脚本的逻辑执行入口，对应于 ECS 架构中系统的逻辑处理部分。**

> 如果想了解 ECS-组件 相关内容，请跳转到《[组件装饰器说明](../../../IDE/customComponent/decorators/readme.md)》
>
> 要了解**更全面的ECS相关知识**，请跳转到[《实体组件系统》](../../../basics/common/Component/readme.md)。



## 1、脚本内置方法概述

组件脚本主要由四个部分组成，分别是生命周期方法、鼠标事件方法、键盘事件方法、物理事件方法。如图1-1所示：

![](img/1-1.png)

（图1-1）

## 2、生命周期方法

在 LayaAir 引擎中，生命周期方法是指在游戏对象（如场景、角色、UI 元素等）从创建到销毁的整个过程中，引擎会在特定的阶段自动调用的一系列方法。这些方法允许开发者在不同的阶段执行特定的代码逻辑，以实现对游戏对象的初始化、更新、渲染以及销毁等操作的控制。

例如，`onEnable`方法是在组件被启用时调用，比如节点被添加到舞台后，可在此方法中进行一些初始化的操作，如获取组件引用、设置初始状态等。`onDestroy`方法在游戏对象被销毁时调用，可在此方法中释放游戏对象所占用的资源，如内存、纹理等，以避免内存泄漏和资源浪费。通过合理利用这些生命周期方法，开发者能够更好地管理游戏对象的状态和行为，提高游戏的性能和稳定性。

### 2.1 全部的生命周期方法列表

全部的生命周期方法如下面列表所示：

| 名称         | 条件                                                         |
| ------------ | ------------------------------------------------------------ |
| onAdded      | 被添加到节点后调用，和Awake不同的是即使节点未激活onAdded也会调用 |
| onReset      | 重置组件参数到默认值，如果实现了这个函数，则组件会被重置并且自动回收到对象池，方便下次复用。如果没有重置，则不进行回收复用 |
| onAwake      | 组件被激活后执行，此时所有节点和组件均已创建完毕，此方法只执行一次 |
| onEnable     | 组件被启用后执行，比如节点被添加到舞台后                     |
| onStart      | 第一次执行onUpdate之前执行，只会执行一次                     |
| onUpdate     | 每帧更新时执行，尽量不要在这里写大循环逻辑或者使用getComponent方法 |
| onLateUpdate | 每帧更新时执行，在onUpdate之后执行，尽量不要在这里写大循环逻辑或者使用getComponent方法 |
| onPreRender  | 渲染之前执行                                                 |
| onPostRender | 渲染之后执行                                                 |
| onDisable    | 组件被禁用时执行，比如从节点从舞台移除后                     |
| onDestroy    | 手动调用节点销毁时执行                                       |

### 2.2 在代码中使用生命周期方法

在代码中，只要我们继承了Laya.Script，就可以直接使用相应名称的生命周期方法，LayaAir引擎会按特定的时机（如节点创建、启用等）自动执行相应的方法。

使用示例如下：

```typescript
const { regClass } = Laya;
@regClass()
export class NewScript extends Laya.Script {
	//被添加到节点后调用，和Awake不同的是即使节点未激活onAdded也会调用
    onAdded(): void {
        console.log("Game onAdded");
    }

    //组件被激活后执行，此时所有节点和组件均已创建完毕，此方法只执行一次
    onAwake(): void {
        console.log("Game onAwake");
    }

    //组件被启用后执行，比如节点被添加到舞台后
    onEnable(): void {
        console.log("Game onEnable");
    }

    //第一次执行update之前执行，只会执行一次
    onStart(): void {
        console.log("Game onStart");
    }

    //每帧更新时执行，尽量不要在这里写大循环逻辑或者使用getComponent方法
    onUpdate(): void {
        console.log("Game onUpdate");
    }

    //每帧更新时执行，在update之后执行，尽量不要在这里写大循环逻辑或者使用getComponent方法
    onLateUpdate(): void {
        console.log("Game onLateUpdate");
    }

    //渲染之前执行
    onPreRender(): void {
        console.log("Game onPreRender");
    }

    //渲染之后执行
    onPostRender(): void {
        console.log("Game onPostRender");
    }

    //重置组件参数到默认值，如果实现了这个函数，则组件会被重置并且自动回收到对象池，方便下次复用。如果没有重置，则不进行回收复用
    onReset(): void {
        console.log("Game onReset");
    }

    //组件被禁用时执行，比如从节点从舞台移除后
    onDisable(): void {
        console.log("Game onDisable");
    }

    //手动调用节点销毁时执行
    onDestroy(): void {
        console.log("Game onDestroy");
    }
}
```

下面以 “2D入门示例” 中的一个物理游戏示例的脚本`DropBox.ts`为例，讲解生命周期方法的使用，示例代码如下：

```typescript
const { regClass, property } = Laya;
import PhysicsGameMainRT from "../scence/physicsDemo/PhysicsGameMainRT";
/**
 * 掉落盒子脚本，实现盒子碰撞及回收流程
 */
@regClass()
export default class DropBox extends Laya.Script {

    /**盒子爆炸动画的预制体 */
    @property({ type: Laya.Prefab, caption: "爆炸动画" })
    private burstAni: Laya.Prefab;
    /**等级文本对象引用 */
    private _text: Laya.Text;
    /**盒子等级 */
    private _level: number;

    constructor() { super(); }
    
    //组件被启用后执行
    onEnable(): void {
        this._level = Math.round(Math.random() * 5) + 1;
        this._text = this.owner.getChildByName("levelTxt") as Laya.Text;
        this._text.text = this._level + "";

    }

	//每帧更新时执行
    onUpdate(): void {
        //让持续盒子旋转
        (this.owner as Laya.Sprite).rotation++;
    }
	//开始碰撞时执行
    onTriggerEnter(other: any): void {
        var owner: Laya.Sprite = this.owner as Laya.Sprite;
        if (other.label === "buttle") {
            //碰撞到子弹后，增加积分，播放声音特效
            if (this._level > 1) {
                this._level--;
                this._text.text = (this._level + "");
                owner.getComponent(Laya.RigidBody).setVelocity({ x: 0, y: -10 });
                Laya.SoundManager.playSound("resources/sound/hit.wav");
            } else {
                if (owner.parent) {
                    let effect: Laya.Sprite = Laya.Pool.getItemByCreateFun("effect", this.createEffect, this);
                    owner.parent.addChild(effect);//将爆炸动画添加到父节点中
                    effect.pos(owner.x, owner.y);//设置爆炸动画的位置，让其跟随方块
                    owner.removeSelf();//删除方块自身节点对象
                    Laya.SoundManager.playSound("resources/sound/destroy.wav");
                }
            }
            PhysicsGameMainRT.instance.addScore(1);
        } else if (other.label === "ground") {
            //只要有一个盒子碰到地板，则停止游戏
            owner.removeSelf();
            PhysicsGameMainRT.instance.stopGame();
        }
    }

    /**使用对象池创建爆炸动画 */
    createEffect(): Laya.Sprite {
        //获取动画预制体的节点对象
        const aniNode: Laya.Sprite = this.burstAni.create() as Laya.Sprite;
        const ani: Laya.Animator2D = aniNode.getComponent(Laya.Animator2D);//获取动画组件对象
        //帧听默认状态机上的动画播放事件，在动画播放完毕后，删除节点对象并回收到对象池中。 
        ani.getControllerLayer().defaultState.on(Laya.AnimatorState2D.EVENT_OnStateExit, () => {
            aniNode.removeSelf();//删除动画节点
            Laya.Pool.recover("effect", aniNode);//回收动画预制体到对象池中，方便下次复用。
        });
        return aniNode;
    }
	
    //组件被禁用时执行
    onDisable(): void {
        //盒子被移除时，回收盒子到对象池，方便下次复用，减少对象创建开销。
        Laya.Pool.recover("dropBox", this.owner);
    }
}
```

除了代码中的注释，需要注意的是，`onEnable()`与`onAwake()`是开发者比较容易错误使用的方法。

在上面的示例中，需求是，将盒子添加到舞台上时，每次都需要重置随机等级，但如果将`onEnable()`的逻辑换到`onAwake()`生命周期里。如果是从对象池中取出时，那这个随机等级的逻辑就无法被执行。

这是由于盒子在移除后，并不是销毁了，而是被回收到了对象池，再次出现的时候，也是从对象池里取出，而不是重新创建，由于`onAwake()`只是在首次激活后执行一次，盒子并没有真正的死亡，那么就不会再重新出生。所以，只能放到每次添加到舞台都会执行的`onEnable()`生命周期方法，才会被执行。



## 3、什么是事件方法

在 LayaAir 引擎中，事件方法是用于响应各种事件的脚本方法。这些事件可以是用户操作（如鼠标点击、键盘输入）、物理状态变化（如：碰撞开始、碰撞进行，碰撞结束）等。通过注册事件方法，开发者可以让游戏在特定事件发生时执行相应的逻辑。

事件方法是指在某些特定的情况下，会根据条件自动触发的方法。当使用自定义的组件脚本时，可以通过事件方法方便快速开发业务逻辑。

### 3.1 物理事件

使用物理引擎时，我们有时候需要根据物理的碰撞事件在代码中实现逻辑交互。为此，LayaAir引擎在物理碰撞的首次发生时、持续碰撞时以及退出碰撞时，均会触发这些特定的物理事件方法。这些方法在引擎中默认不包含具体实现，可以视为待开发者重写的方法。开发者只需继承`Laya.Script`类，并在其中重写这些方法，就可以实现自定义的逻辑响应，替代默认的空W实现。

这样，通过重写这些特定方法，开发者可以根据物理碰撞的具体阶段执行相应的游戏逻辑或者交互效果，从而使得游戏或应用能够在遇到物理碰撞时，有更自然、更真实的响应。下面表格罗列了全部的物理事件方法：

| 名称             | 条件                                                         |
| ---------------- | ------------------------------------------------------------ |
| onTriggerEnter   | 3D物理触发器事件与2D物理碰撞事件，开始碰撞时执行，仅执行一次 |
| onTriggerStay    | 3D物理触发器事件与2D物理碰撞事件(不支持传感器)，持续碰撞时执行，每帧都执行 |
| onTriggerExit    | 3D物理触发器事件与2D物理碰撞事件，结束碰撞时执行，仅执行一次 |
| onCollisionEnter | 3D物理碰撞器事件（不适用2D），开始碰撞时执行，仅执行一次     |
| onCollisionStay  | 3D物理碰撞器事件（不适用2D），持续碰撞时执行，每帧都执行     |
| onCollisionExit  | 3D物理碰撞器事件（不适用2D），结束碰撞时执行，仅执行一次     |

通过以上表格可以看出，2D物理事件只有三个事件方法，而3D物理事件，则分为触发器事件和碰撞器事件两类，有六个事件方法。

碰撞器事件是指反生物理反馈的事件，触发器事件是只有物理事件的触发，但没有实际物理碰撞反馈的一种事件，这与2D碰撞体启用了传感器的效果是一样的，只不过2D物理无论是碰撞反馈事件还是启用了传感器的无反馈物体事件，都是只用onTrigger事件。

特别提醒的是，2D物理启用传感器之后，onTriggerStay事件是不被触发的，这一点需要新手开发者注意。

在脚本中的事件使用示例如下：

```typescript
class DemoScript extends Laya.Script {
    
    /**
     * 3D物理触发器事件与2D物理碰撞事件, 在每一次发生物理碰撞的开始时，引擎都会调用一次的事件方法。
     * @param other 碰撞目标对象的碰撞体以及所属节点对象等信息
     * @param self  自身的碰撞体以及所属节点对象等信息（该参数只有2D物理有，3D物理只有other）
     * @param contact  物理引擎携带的碰撞信息b2Contact，开发者可以通过查询b2Contact对象来获取两个刚体碰撞有关的详细信息。但是通常用不上，other和self中已存在常规需要的信用，足够用了。（该参数只有2D物理有，3D物理只有other）
     */
     onTriggerEnter(other: Laya.PhysicsComponent | Laya.ColliderBase, self?: Laya.ColliderBase, contact?: any): void {
        // 假如碰到了炸弹
        if (other.label == "bomb") {
            // 此处省略爆炸伤害的逻辑

            console.log("碰到炸弹：" + self.label + "受到伤害，生命值减少xx");

        } else if (other.label == "Medicine") {  // 假如碰到了药箱
            // 此处省略恢复生命值的逻辑

            console.log("碰到药箱：" + self.label + "接受治疗，生命值恢复xx");
            
        }
        console.log("onTriggerEnter:", other, self);
    }	

    /**
    * 3D物理触发器事件与2D物理碰撞事件(不支持传感器), 发生持续的物理碰撞时，也就是碰撞生命周期内的第二次碰撞到碰撞结束前，每帧都在触发调用的事件方法。
    * 尽量不要在该事件方法中执行复杂的逻辑和函数调用，尤其是运算等消耗性能的代码，否则会对性能有明显的影响。
    * @param other 碰撞目标对象的碰撞体以及所属节点对象等信息
    * @param self  自身的碰撞体以及所属节点对象等信息（该参数只有2D物理有，3D物理只有other）
    * @param contact  物理引擎携带的碰撞信息b2Contact，开发者可以通过查询b2Contact对象来获取两个刚体碰撞有关的详细信息。但是通常用不上，other和self中已存在常规需要的信用，足够用了（该参数只有2D物理有，3D物理只有other）
    */
    onTriggerStay(other: Laya.PhysicsComponent | Laya.ColliderBase, self?: Laya.ColliderBase, contact?: any): void {
        //持续碰撞时，打印日志，尽量不使用该事件方法，如果使用不当对性能的消耗会影响较大。
        console.log("onTriggerStay====", other, self);
    }

    /**
    * 在每一次的物理碰撞结束时，引擎都会调用一次的事件方法。
    * @param other 碰撞目标对象的碰撞体以及所属节点对象等信息
    * @param self  自身的碰撞体以及所属节点对象等信息（该参数只有2D物理有，3D物理只有other）
    * @param contact  物理引擎携带的碰撞信息b2Contact，开发者可以通过查询b2Contact对象来获取两个刚体碰撞有关的详细信息。但是通常用不上，other和self中已存在常规需要的信用，足够用了（该参数只有2D物理有，3D物理只有other）
    */
    onTriggerExit(other: Laya.PhysicsComponent | Laya.ColliderBase, self?: Laya.ColliderBase, contact?: any): void {   
        //模拟角色离开毒气区域，触发逃脱奖励
        if (other.label == "poison") {
            // 此处省略逃脱奖励的逻辑

            console.log("离开毒气区域：" + self.label + "获得逃脱奖励，生命值+10");
        }

        console.log("onTriggerExit========", other, self);
    }

    /**
     * 3D物理碰撞器事件（不适用2D），在每一次发生物理碰撞的开始时，引擎都会调用一次的事件方法。
     * @param other 碰撞目标对象
     */
    onCollisionEnter(other:Laya.Collision): void {
        //碰撞开始后，物体改变颜色
        (this.owner.getComponent(Laya.MeshRenderer).material as Laya.BlinnPhongMaterial).albedoColor = new Laya.Color(0.0, 1.0, 0.0, 1.0);//绿色
    }

    /**
    * 发生持续物理碰撞时的3D物理碰撞器事件（不适用2D），也就是碰撞生命周期内的第二次碰撞到碰撞结束前，每帧都在触发调用的事件方法。
    * 尽量不要在该事件方法中执行复杂的逻辑和函数调用，尤其是运算等消耗性能的代码，否则会对性能有明显的影响。
    * @param other 碰撞目标对象
    */
    onCollisionStay(other:Laya.Collision): void {
    	//持续碰撞时，打印日志，尽量不使用该事件方法，如果使用不当对性能的消耗会影响较大。
        console.log("peng");
    }

   /**
    * 3D物理碰撞器事件（不适用2D），在每一次的物理碰撞结束时，引擎都会调用一次的事件方法。
    * @param other 碰撞目标对象
    */
    onCollisionExit(other:Laya.Collision): void {
        ////碰撞离开后，物体变回原本颜色
		(this.owner.getComponent(Laya.MeshRenderer).material as Laya.BlinnPhongMaterial).albedoColor = new Laya.Color(1.0, 1.0, 1.0, 1.0);//白色
    }
}
```

基于上面的代码示例，为3D模型添加脚本。如动图3-1所示。

![2-2](img/3-1.gif)

（动图3-1）

### 3.2 鼠标事件

| 名称               | 条件                                               |
| ------------------ | -------------------------------------------------- |
| onMouseDown        | 鼠标按下时执行                                     |
| onMouseUp          | 鼠标抬起时执行                                     |
| onRightMouseDown   | 鼠标右键或中键按下时执行                           |
| onRightMouseUp     | 鼠标右键或中键抬起时执行                           |
| onMouseMove        | 鼠标在节点上移动时执行                             |
| onMouseOver        | 鼠标进入节点时执行                                 |
| onMouseOut         | 鼠标离开节点时执行                                 |
| onMouseDrag        | 鼠标按住一个物体后，拖拽时执行                     |
| onMouseDragEnd     | 鼠标按住一个物体，拖拽一定距离，释放鼠标按键后执行 |
| onMouseClick       | 鼠标点击时执行                                     |
| onMouseDoubleClick | 鼠标双击时执行                                     |
| onMouseRightClick  | 鼠标右键点击时执行                                 |

在代码中的使用如下：

```typescript
	//鼠标按下时执行
    onMouseDown(evt: Laya.Event): void {
    }

    //鼠标抬起时执行
    onMouseUp(evt: Laya.Event): void {
    }

    //鼠标右键或中键按下时执行
    onRightMouseDown(evt: Laya.Event): void {
    }

    //鼠标右键或中键抬起时执行
    onRightMouseUp(evt: Laya.Event): void {
    }

    //鼠标在节点上移动时执行
    onMouseMove(evt: Laya.Event): void {
    }

    //鼠标进入节点时执行
    onMouseOver(evt: Laya.Event): void {
    }

    //鼠标离开节点时执行
    onMouseOut(evt: Laya.Event): void {
    }

    //鼠标按住一个物体后，拖拽时执行
    onMouseDrag(evt: Laya.Event): void {
    }

    //鼠标按住一个物体，拖拽一定距离，释放鼠标按键后执行
    onMouseDragEnd(evt: Laya.Event): void {
    }

    //鼠标点击时执行
    onMouseClick(evt: Laya.Event): void {
    }

    //鼠标双击时执行
    onMouseDoubleClick(evt: Laya.Event): void {
    }

    //鼠标右键点击时执行
    onMouseRightClick(evt: Laya.Event): void {
    }
```

下面以onMouseDown和onMouseUp为例，在自定义的组件脚本“Script.ts”中加入以下代码：

```typescript
const { regClass, property } = Laya;

@regClass()
export class Script extends Laya.Script {
    /**
     * 鼠标按下时执行
     */
	onMouseDown(evt: Laya.Event): void {
        console.log("onMouseDown");
    }
    /**
     * 鼠标抬起时执行
     */
    onMouseUp(evt: Laya.Event): void {
        console.log("onMouseUp");
    }
}
```

如图3-2所示，将组件脚本添加到Scene2D的属性面板后，先不勾选 Mouse Through，因为如果勾选它，Scene2D下鼠标事件将不会响应。如果是一个3D场景，它会传递到Scene3D中。

![2-3](img/3-2.gif)

（图3-2）

运行项目，如动图3-3所示，当鼠标按下时执行onMouseDown，打印“onMouseDown”；松开鼠标，鼠标弹起时执行onMouseUp，打印“onMouseUp”。

![](img/3-3.gif)

（动图3-3）



### 3.3 键盘事件

| 名称       | 条件                   |
| ---------- | ---------------------- |
| onKeyDown  | 键盘按下时执行         |
| onKeyPress | 键盘产生一个字符时执行 |
| onKeyUp    | 键盘抬起时执行         |

在代码中的使用如下：

```typescript
	//键盘按下时执行
     onKeyDown(evt: Laya.Event): void {
    }

    //键盘产生一个字符时执行
    onKeyPress(evt: Laya.Event): void {
    }

    //键盘抬起时执行
    onKeyUp(evt: Laya.Event): void {
    }
```

> 注意：onKeyPress是产生一个字符时执行，例如字母“a”、“b”，“c”等。像上、下、左、右键，F1、 F2等不是字符输入的按键，就不会执行此方法。

