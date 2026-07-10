---
title: "音频播放组件（SoundPlayer）"
description: "SoundPlayer 是LayaAir引擎中用于播放背景音乐或音效的组件，继承自 Component。它是原有音频节点（SoundNode）的组件化版本，可以添加到任意节点上使用。"
slug: "ide/component/media/soundplayer"
---

## 一、概述

`SoundPlayer` 是LayaAir引擎中用于播放背景音乐或音效的组件，继承自 `Component`。它是原有音频节点（SoundNode）的组件化版本，可以添加到任意节点上使用。

与直接通过 `SoundManager` 代码控制音频相比，`SoundPlayer` 组件可以在IDE中可视化配置音频属性，更加方便直观。

> 关于音频节点的使用，请参考[《音频节点》](/2d/displayobject/soundnode/)。
>
> 关于代码控制音频的更多用法，请参考[《代码控制音频》](/basics/common/device/media/)。



## 二、添加组件

选中一个节点后，在右侧属性面板中点击 `增加组件`，选择 `SoundPlayer` 即可添加音频播放组件。

<img src="/IDE/Component/Media/SoundPlayer/img/1-1.gif" style="zoom:50%;" />

（动图2-1）



## 三、组件属性

SoundPlayer 组件的属性面板如图3-1所示，与音频节点（SoundNode）的属性一致。

<img src="/IDE/Component/Media/SoundPlayer/img/1-2.png" style="zoom:100%;" />

（图3-1）

| 属性 | 说明 |
| --- | --- |
| 源 `Source` | 音频文件资源路径 |
| 是否背景音乐 `IsMusic` | 是否为背景音乐。勾选后，当前音频按背景音乐播放（同一时间只能播放一个背景音乐）；不勾选则作为音效播放（可与背景音乐及其它音效同时播放） |
| 循环次数 `Loop` | 循环播放的次数。设置为 0 表示无限循环；设置为 1 表示只播放一次。默认值为 1 |
| 自动播放 `AutoPlay` | 组件启用时是否自动播放音频，默认为 `false` |



## 四、代码控制

### 4.1 通过属性引用控制

在自定义脚本中通过 `@property` 装饰器引用 SoundPlayer 组件进行控制：

```typescript
const { regClass, property } = Laya;

@regClass()
export class SoundScript extends Laya.Script {

    @property({ type: Laya.SoundPlayer })
    public soundPlayer: Laya.SoundPlayer;

    onAwake(): void {
        this.soundPlayer.source = "resources/sound.wav"; // 设置音频路径
        this.soundPlayer.loop = 0;          // 无限循环
        this.soundPlayer.isMusic = false;   // 作为音效播放
        this.soundPlayer.autoPlay = true;   // 自动播放
    }
}
```

### 4.2 通过代码添加组件

```typescript
let sprite = new Laya.Sprite();
Laya.stage.addChild(sprite);

// 添加 SoundPlayer 组件
let soundPlayer = sprite.addComponent(Laya.SoundPlayer);
soundPlayer.source = "resources/sound.wav";
soundPlayer.loop = 0;
soundPlayer.autoPlay = true;
soundPlayer.isMusic = false;
```

### 4.3 播放与停止

```typescript
// 播放音频（可指定循环次数、完成回调、起始时间）
soundPlayer.play();
soundPlayer.play(3); // 播放3次
soundPlayer.play(1, (success) => {
    console.log("播放完成", success);
});

// 停止播放
soundPlayer.stop();
```

> **注意**：`loop` 属性需要在 `autoPlay` 设置之前赋值，否则自动播放时会使用默认的循环次数。



## 五、SoundPlayer 与 SoundNode 的区别

| 对比项 | SoundPlayer（组件） | SoundNode（节点） |
| --- | --- | --- |
| 类型 | 组件（Component） | 节点（Sprite） |
| 使用方式 | 添加到任意节点上 | 作为独立节点添加到场景中 |
| 属性 | source、isMusic、loop、autoPlay | source、isMusic、loop、autoPlay |
| 功能 | 完全一致 | 完全一致 |

两者的属性和功能完全相同，SoundPlayer 是 SoundNode 的组件化封装。推荐使用 SoundPlayer 组件，更符合组件化的开发理念。
