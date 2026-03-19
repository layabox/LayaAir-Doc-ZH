# 2D动画组件（Animator2D）

`Animator2D` 是LayaAir引擎中用于2D节点的动画状态机组件，功能上与3D的 `Animator` 类似，但专门针对2D节点设计。通过 `Animator2D` 组件，可以为2D节点播放时间轴动画，并通过动画状态机来管理多个动画状态之间的切换。

> 关于动画状态机的通用概念（状态、切换、条件、分层等），请参考 [动画状态机详解](../../../../animationEditor/aniController/readme.md)。
>
> 关于时间轴动画的编辑操作，请参考 [时间轴动画编辑详解](../../../../animationEditor/timelineGUI/readme.md)。



## 一、添加Animator2D组件

### 1.1 在IDE中添加

选中一个2D节点后，在右侧属性面板中点击 `增加组件`，选择 `Animator2D` 即可为该节点添加2D动画组件。

> 注意：`Animator2D` 只能添加到2D节点上，3D节点只能添加 `Animator`。

### 1.2 创建动画时自动添加

当选中一个2D节点，在时间轴动画面板中点击 `创建` 按钮创建动画时，IDE会自动为该节点添加 `Animator2D` 组件，同时创建动画文件（`.mc`）和动画状态机文件（`.mcc`）。

### 1.3 通过代码添加

```typescript
let sprite = new Laya.Sprite();
// 添加Animator2D组件
let animator2D = sprite.addComponent(Laya.Animator2D);
```



## 二、组件属性

`Animator2D` 组件在IDE属性面板中有以下属性：

`Controller`：绑定的2D动画控制器文件（`.mcc`），即动画状态机文件。需要先创建或指定一个动画状态机文件，才能编辑和播放动画。

`Speed`：动画播放速度，默认为1.0。设置为0可暂停动画，设置为0.5可半速播放，设置为2可双倍速播放。负数可以倒播。



## 三、与3D Animator的差异

虽然 `Animator2D` 与 `Animator` 在状态机的整体架构上是一致的（状态、切换、条件、分层），但存在以下差异：

| 对比项         | Animator2D（2D）                | Animator（3D）                       |
| -------------- | ------------------------------- | ------------------------------------ |
| 适用节点       | 2D节点（Sprite等）              | 3D节点（Sprite3D等）                 |
| 动画文件后缀   | `.mc`                           | `.lani`                              |
| 状态机文件后缀 | `.mcc`                          | `.controller`                        |
| 动画状态类     | `AnimatorState2D`               | `AnimatorState`                      |
| 状态机层类     | `AnimatorControllerLayer2D`     | `AnimatorControllerLayer`            |
| 播放状态类     | `AnimatorPlayState2D`           | `AnimatorPlayState`                  |
| 状态脚本类     | `AnimatorState2DScript`         | `AnimatorStateScript`                |
| 录制模式       | 默认开启录制模式                | 需要手动点击录制按钮                 |
| 动画属性       | 每个属性值允许单独设置          | Vector属性不可缺少，删除会自动补上   |
| 循环控制       | 支持loop次数设定（-1/0/1/2...） | 通过Is Looping布尔值控制             |
| YoYo模式       | 支持（一次正播一次倒播）        | 不支持                               |



## 四、动画状态属性（AnimatorState2D）

2D动画状态 `AnimatorState2D` 拥有以下可配置的属性：

`Name`：动画状态名称，用于代码中指定播放。

`Speed`：该状态的播放速度，默认1.0。

`Loop`：动画循环次数。`-1` 表示使用动画文件自身的循环设置，`0` 表示无限循环，`1` 表示播放一次，`2` 表示播放两次，以此类推。

`Cycle Offset`：循环偏移，基于播放起始时间的偏移值，仅作用于动画首次播放（0-1之间）。

`Clip Start`：动画文件的起始播放位置（0-1之间）。

`Clip End`：动画文件的停止播放位置（0-1之间）。

`Clip`：动画文件（`.mc`）。

`YoYo`：是否为往返播放模式，即一次正向播放，一次反向播放。默认关闭。



## 五、代码中使用

### 5.1 获取组件

```typescript
// 获取2D动画组件
let animator2D = sprite.getComponent<Laya.Animator2D>(Laya.Animator2D);
```

### 5.2 播放动画

使用 `play()` 方法播放指定的动画状态：

```typescript
/**
 * 播放动画。
 * @param name 动画状态名称，为null则播放默认动画。
 * @param layerIndex 层索引，默认为0。
 * @param normalizedTime 归一化的播放起始时间。
 */
animator2D.play("idle");

// 指定从50%位置开始播放
animator2D.play("run", 0, 0.5);
```

### 5.3 融合过渡

使用 `crossFade()` 方法在当前动画和目标动画之间进行融合过渡：

```typescript
/**
 * 在当前动画状态和目标动画状态之间进行融合过渡播放。
 * @param name 目标动画状态名称。
 * @param layerIndex 层索引，默认为0。
 * @param normalizedTime 归一化的播放起始时间。
 * @param transitionDuration 过渡时间，归一化时间（0-1）。
 */
animator2D.crossFade("run", 0, Number.NEGATIVE_INFINITY, 0.3);
```

### 5.4 跳转到指定位置并停止

```typescript
// 跳转到指定动画状态的归一化时间位置并停止
animator2D.gotoAndStop("idle", 0, 0.5);

// 跳转到指定帧并停止
animator2D.gotoAndStopByFrame("idle", 0, 10);
```

### 5.5 停止动画

```typescript
animator2D.stop();
```

### 5.6 控制播放速度

```typescript
// 暂停动画
animator2D.speed = 0;
// 正常播放
animator2D.speed = 1.0;
// 半速播放
animator2D.speed = 0.5;
// 倒放
animator2D.speed = -1.0;
```

### 5.7 判断是否正在播放

```typescript
if (animator2D.isPlaying) {
    console.log("动画正在播放中");
}
```

### 5.8 动画切换条件

与3D Animator一样，`Animator2D` 支持通过参数来控制状态切换：

```typescript
// 设置Float参数
animator2D.setParamsNumber("speed", 2.0);

// 设置Bool参数
animator2D.setParamsBool("isRunning", true);

// 触发Trigger
animator2D.setParamsTrigger("attack");
```

### 5.9 获取播放状态

```typescript
// 获取控制器层
let layer = animator2D.getControllerLayer(0);

// 获取当前播放状态
let playState = layer.getCurrentPlayState();

// 获取当前动画持续时间（秒）
let duration = playState.duration;

// 获取当前动画状态
let currentState = playState.animatorState;
```

### 5.10 获取与操作动画状态

```typescript
// 获取默认动画状态
let defaultState = animator2D.getDefaultState(0);

// 通过层获取指定动画状态
let layer = animator2D.getControllerLayer(0);
let state = layer.getStateByName("idle");

// 修改状态属性
state.speed = 2.0;
state.loop = 0; // 无限循环
```



## 六、状态脚本（AnimatorState2DScript）

2D动画状态支持添加状态脚本 `AnimatorState2DScript`，用于在动画状态的不同生命周期阶段执行自定义逻辑。

### 6.1 脚本生命周期

`AnimatorState2DScript` 提供以下回调方法：

- `onStateEnter()`：动画状态开始时执行。
- `onStateUpdate(normalizeTime)`：动画状态运行中执行，参数为归一化播放时间。
- `onStateExit()`：动画状态退出时执行。
- `onStateLoop()`：动画循环时，每次循环结束时执行。
- `onStateSwitch(currentState)`：切换到新状态时执行。

### 6.2 使用示例

在IDE中为动画状态添加脚本后，编写如下代码：

```typescript
const { regClass } = Laya;

@regClass()
export class MyAniScript extends Laya.AnimatorState2DScript {

    constructor() {
        super();
    }

    /**
     * 动画状态开始时执行
     */
    onStateEnter(): void {
        console.log("2D动画状态进入");
    }

    /**
     * 动画状态运行中
     * @param normalizeTime 0-1 归一化播放时间
     */
    onStateUpdate(normalizeTime: number): void {
        if (normalizeTime > 0.5) {
            console.log("动画播放过半");
        }
    }

    /**
     * 动画状态退出时执行
     */
    onStateExit(): void {
        console.log("2D动画状态退出");
    }

    /**
     * 动画循环时执行
     */
    onStateLoop(): void {
        console.log("动画完成一次循环");
    }
}
```

### 6.3 通过事件监听状态

除了状态脚本，`AnimatorState2D` 还支持通过事件来监听状态变化：

```typescript
let layer = animator2D.getControllerLayer(0);
let state = layer.getStateByName("idle");

// 监听状态进入
state.on(Laya.AnimatorState2D.EVENT_OnStateEnter, this, () => {
    console.log("进入idle状态");
});

// 监听状态退出
state.on(Laya.AnimatorState2D.EVENT_OnStateExit, this, () => {
    console.log("退出idle状态");
});

// 监听状态更新
state.on(Laya.AnimatorState2D.EVENT_OnStateUpdate, this, () => {
    console.log("idle状态更新");
});

// 监听状态循环
state.on(Laya.AnimatorState2D.EVENT_OnStateLoop, this, () => {
    console.log("idle状态完成一次循环");
});
```
