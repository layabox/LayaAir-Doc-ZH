---
title: "多媒体组件"
description: "LayaAir引擎提供了音频播放和视频播放两种多媒体组件，它们都继承自 Component，可以添加到任意节点上使用。"
slug: "ide/component/media"
---

LayaAir引擎提供了音频播放和视频播放两种多媒体组件，它们都继承自 `Component`，可以添加到任意节点上使用。

多媒体组件是原有多媒体节点（SoundNode、VideoNode）的组件化版本。相比节点方式，组件化的优势在于：不需要在场景中创建额外的节点，只需为已有节点添加组件即可具备多媒体播放能力，更符合组件化的开发理念。

> 除了使用多媒体组件，LayaAir 还支持通过 `SoundManager` 等 API 在代码中直接控制音频播放，详见[《代码控制音频》](/basics/common/device/media/)和[《代码控制视频》](/basics/common/device/video/)。

| 组件 | 说明 |
| --- | --- |
| [音频播放组件 SoundPlayer](/ide/component/media/soundplayer/) | 用于播放背景音乐或音效，支持设置循环次数、自动播放等，底层通过 `SoundManager` 播放 |
| [视频播放组件 VideoPlayer](/ide/component/media/videoplayer/) | 用于播放视频，支持播放器和解码器两种模式，解码器模式下可将视频渲染为纹理参与引擎渲染 |
