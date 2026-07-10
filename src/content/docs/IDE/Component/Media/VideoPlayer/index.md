---
title: "视频播放组件（VideoPlayer）"
description: "VideoPlayer 是LayaAir引擎中用于播放视频的组件，继承自 Component。它是原有视频节点（VideoNode）的组件化版本，可以添加到任意节点上使用。"
slug: "ide/component/media/videoplayer"
---

## 一、概述

`VideoPlayer` 是LayaAir引擎中用于播放视频的组件，继承自 `Component`。它是原有视频节点（VideoNode）的组件化版本，可以添加到任意节点上使用。

> 关于视频节点的使用，请参考[《视频节点》](/2d/displayobject/videonode/)。
>
> 关于代码控制视频的更多用法，请参考[《代码控制视频》](/basics/common/device/video/)。



## 二、添加组件

选中一个节点后，在右侧属性面板中点击 `增加组件`，选择 `VideoPlayer` 即可添加视频播放组件。

<img src="/IDE/Component/Media/VideoPlayer/img/1-1.gif" style="zoom:50%;" />

（动图2-1）



## 三、组件属性

VideoPlayer 组件的属性面板如图3-1所示，与视频节点（VideoNode）的属性基本一致。

<img src="/IDE/Component/Media/VideoPlayer/img/1-2.png" style="zoom:100%;" />

（图3-1）

| 属性 | 说明 |
| --- | --- |
| 源 `source` | 视频源文件路径 |
| 播放模式 `mode` | 播放模式，有两种：`player`（播放器）和 `decoder`（解码器）。如果设置的模式不支持，会尝试使用另一种模式 |
| 自动播放 `autoPlay` | 视频是否自动播放，默认为 `false` |
| 允许后台播放 `allowBackground` | 是否允许后台播放，默认为 `false` |
| 循环 `loop` | 是否循环播放，默认为 `false` |
| 静音 `muted` | 是否静音，默认为 `false` |

### 3.1 播放模式 mode

两种播放模式的区别：

- **解码器（decoder）**：视频被解码为纹理（Texture）显示，与节点的宽高一致，可以参与引擎的渲染流程。适合需要将视频作为游戏画面一部分的场景。如动图3-2所示：

<img src="/IDE/Component/Media/VideoPlayer/img/1-3.gif" style="zoom:50%;" />

（动图3-2）

- **播放器（player）**：视频直接浮动在主画布上方显示，维持视频原本的宽高比。适合全屏播放视频的场景。如动图3-3所示：

<img src="/IDE/Component/Media/VideoPlayer/img/1-4.gif" style="zoom:50%;" />

（动图3-3）



## 四、只读属性

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `duration` | `number` | 视频时长（秒），在视频加载完成后可用 |
| `currentTime` | `number` | 当前播放位置（秒），可读写 |
| `paused` | `boolean` | 是否处于暂停状态 |
| `ended` | `boolean` | 是否播放结束 |
| `readyState` | `number` | 就绪状态（0-4） |
| `videoWidth` | `number` | 视频源宽度 |
| `videoHeight` | `number` | 视频源高度 |
| `videoTexture` | `VideoTexture` | 视频纹理对象（decoder 模式下可用） |
| `player` | | 底层播放器实例 |



## 五、代码控制

### 5.1 通过属性引用控制

```typescript
const { regClass, property } = Laya;

@regClass()
export class VideoScript extends Laya.Script {

    @property({ type: Laya.VideoPlayer })
    public videoPlayer: Laya.VideoPlayer;

    onAwake(): void {
        // 鼠标点击触发播放
        Laya.stage.on(Laya.Event.MOUSE_DOWN, () => {
            this.videoPlayer.play();
        });
    }
}
```

### 5.2 通过代码添加组件

```typescript
let sprite = new Laya.Sprite();
Laya.stage.addChild(sprite);

// 添加 VideoPlayer 组件
let videoPlayer = sprite.addComponent(Laya.VideoPlayer);
videoPlayer.source = "resources/layaAir.mp4";
videoPlayer.loop = true;
videoPlayer.play();
```

### 5.3 播放控制

```typescript
// 播放
videoPlayer.play();

// 暂停
videoPlayer.pause();

// 恢复播放
videoPlayer.resume();

// 跳转到指定时间（秒）
videoPlayer.currentTime = 10;
```

### 5.4 音量与播放速度

```typescript
// 设置音量（0-1）
videoPlayer.volume = 0.5;

// 静音
videoPlayer.muted = true;

// 设置播放速度（1.0为正常速度）
videoPlayer.playbackRate = 2.0;  // 双倍速
videoPlayer.playbackRate = 0.5;  // 半速
```

### 5.5 视频纹理帧率

在 decoder 模式下，可以通过代码设置视频纹理的更新帧率：

```typescript
videoPlayer.videoTexture.useFrame = true;
videoPlayer.videoTexture.updateFrame = 30;
```

> **注意**：在 Chrome 浏览器中，自动播放只允许静音自动播放。只有用户进行交互（单击、双击等）后，才允许自动播放有声音的视频。在 IDE 中运行不受此限制。



## 六、VideoPlayer 与 VideoNode 的区别

| 对比项 | VideoPlayer（组件） | VideoNode（节点） |
| --- | --- | --- |
| 类型 | 组件（Component） | 节点（Sprite） |
| 使用方式 | 添加到任意节点上 | 作为独立节点添加到场景中 |
| 核心功能 | 完全一致 | 完全一致 |

VideoPlayer 是 VideoNode 的组件化版本。推荐使用 VideoPlayer 组件，更符合组件化的开发理念。

> **注意**：VideoNode 额外支持 `controls`（显示控件）、`underGameView`（显示在画布之下）、`objectFit`（缩放模式 fill/contain/cover）等面板属性，这些属性可通过 `videoPlayer.options` 进行配置。
