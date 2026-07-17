---
title: "序列帧动画组件（FrameAnimation）"
description: "FrameAnimation 是LayaAir引擎中用于播放序列帧动画的组件。它通过快速切换一系列连续的图片帧来产生动画效果，常用于2D游戏中的角色动画、特效动画、UI动画等场景。"
slug: "ide/component/2d/2danimation/frameanimation"
---

`FrameAnimation` 是LayaAir引擎中用于播放序列帧动画的组件。它通过快速切换一系列连续的图片帧来产生动画效果，常用于2D游戏中的角色动画、特效动画、UI动画等场景。

与 `Animator2D` 基于时间轴动画不同，`FrameAnimation` 更加轻量，适合简单的逐帧图片切换动画。



## 一、添加FrameAnimation组件

### 1.1 在IDE中添加

选中一个2D节点后，在右侧属性面板中点击 `增加组件`，选择 `FrameAnimation` 即可为该节点添加序列帧动画组件。

### 1.2 通过代码添加

```typescript
let sprite = new Laya.Sprite();
let frameAni = sprite.addComponent(Laya.FrameAnimation);
```



## 二、组件属性

`FrameAnimation` 组件在IDE属性面板中有以下属性：

`Source`：图集资源路径。指定一个图集（Atlas），组件会自动从图集中提取所有帧图片作为动画帧。

`Images`：图片路径数组。当不使用图集时，可以手动指定一组图片路径作为动画帧。

`AutoPlay`：是否在组件激活后自动播放动画，默认为 `true`。

`Loop`：是否循环播放，默认为 `true`。

`Interval`：帧切换间隔时间，单位为毫秒。用于控制动画的整体播放速度。

`TimeScale`：播放速度倍率，默认为1。可用于加速或减速动画播放。

`WrapMode`：播放顺序模式，支持正序播放、逆序播放、往返播放（PingPong）。

`StretchMode`：拉伸模式，控制帧图片如何适配节点尺寸。默认为 `None`（不拉伸，使用原始图片尺寸）。

`Offset`：动画偏移量，仅在拉伸模式为 `None` 时生效。

`Color`：颜色叠加，可对动画帧图片进行颜色调整。



## 三、设置动画资源

### 3.1 通过图集设置

图集（Atlas）是最常用的序列帧动画资源方式。将一组连续的帧图片打包成图集后，通过 `source` 属性指定图集路径：

```typescript
let frameAni = sprite.addComponent(Laya.FrameAnimation);
frameAni.source = "resources/ani/explosion.atlas";
```

也可以通过 `setAtlas()` 方法设置已加载的图集资源：

```typescript
let atlasRes = Laya.loader.getRes("resources/ani/explosion.atlas");
frameAni.setAtlas(atlasRes);
```

### 3.2 通过图片数组设置

如果不使用图集，可以通过 `images` 属性指定一组独立的图片路径：

```typescript
frameAni.images = [
    "resources/ani/frame1.png",
    "resources/ani/frame2.png",
    "resources/ani/frame3.png",
    "resources/ani/frame4.png"
];
```

### 3.3 直接设置纹理数组

也可以通过 `frames` 属性直接设置 `Texture` 数组：

```typescript
// 假设已经获取了纹理数组
let textures: Laya.Texture[] = [...];
frameAni.frames = textures;
```



## 四、播放控制

### 4.1 播放与停止

```typescript
// 播放动画
frameAni.play();

// 停止动画
frameAni.stop();
```

### 4.2 自动播放

```typescript
// 组件激活后自动播放
frameAni.autoPlay = true;
```

### 4.3 循环播放

```typescript
// 开启循环播放
frameAni.loop = true;

// 关闭循环播放（播放一次后停止）
frameAni.loop = false;
```

### 4.4 播放速度控制

```typescript
// 通过interval控制帧切换间隔（毫秒）
frameAni.interval = 100; // 每100毫秒切换一帧

// 通过timeScale控制速度倍率
frameAni.timeScale = 2.0; // 双倍速播放
frameAni.timeScale = 0.5; // 半速播放
```

### 4.5 播放顺序

```typescript
// 正序播放（默认）
frameAni.wrapMode = Laya.AnimationWrapMode.Positive;

// 逆序播放
frameAni.wrapMode = Laya.AnimationWrapMode.Reverse;

// 往返播放（PingPong）
frameAni.wrapMode = Laya.AnimationWrapMode.PingPong;
```

### 4.6 判断播放状态

```typescript
if (frameAni.isPlaying) {
    console.log("动画正在播放");
}
```



## 五、帧控制

### 5.1 获取与设置当前帧

```typescript
// 获取当前帧索引
let currentFrame = frameAni.frame;

// 设置当前帧索引（跳转到指定帧）
frameAni.frame = 5;
```

### 5.2 获取帧信息

```typescript
// 获取当前帧图片数组
let allFrames = frameAni.frames;
console.log("总帧数：" + allFrames.length);
```

### 5.3 设置每帧延迟

`frameDelays` 属性可以为每一帧单独设置延迟时间（毫秒），用于实现不均匀的帧率效果：

```typescript
// 获取每帧的延迟时间数组
let delays = frameAni.frameDelays;
```

### 5.4 重置节点状态

```typescript
// 重置节点，使节点恢复到动画之前的状态
frameAni.resetNodes();
```



## 六、其它属性

### 6.1 重复延迟

```typescript
// 设置每次重复播放之间的延迟时间（毫秒）
frameAni.repeatDelay = 500; // 每次循环间隔500毫秒
```

### 6.2 颜色设置

```typescript
// 设置动画颜色叠加
frameAni.color = new Laya.Color(1, 0.5, 0.5, 1); // 偏红色
```



## 七、FrameAnimation与Animator2D的对比

| 对比项       | FrameAnimation                           | Animator2D                             |
| ------------ | ---------------------------------------- | -------------------------------------- |
| 适用场景     | 简单的逐帧图片切换动画                   | 复杂的属性动画、需要状态机管理的动画   |
| 动画资源     | 图集或图片数组                           | 时间轴动画文件（.mc）                  |
| 状态管理     | 无状态机，单一播放控制                   | 完整的动画状态机（状态、切换、条件）   |
| 动画内容     | 只能切换图片帧                           | 可对任意属性做动画（位置、旋转、缩放等）|
| 性能         | 更轻量                                   | 功能更强但开销稍大                     |
| 使用复杂度   | 简单，设置资源即可播放                   | 需要配置状态机                         |

选择建议：
- 如果只需要简单的逐帧图片切换（如爆炸特效、角色行走），使用 `FrameAnimation`。
- 如果需要对节点的多种属性做动画，或需要状态机来管理多个动画之间的切换逻辑，使用 `Animator2D`。
