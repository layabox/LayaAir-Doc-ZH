---
title: "装载器（GLoader）"
description: "Author: 谷主"
slug: "ide/uieditor/fairygui/gloader"
---

Author: 谷主

<img src="./img/1-1.png" alt="1-1" style="zoom:60%;" />

- `Src` 图片资源或者表达序列帧动画的图集资源。
- `Is Demo` Src设置的内容只作为Demo，也就是只在IDE编辑时显示，发布时将自动清空。
- `Align` 水平和垂直方向的对齐方式。
- `Fit Mode` 适配模式。
  - `None` 无。图片保持自身的大小，不缩放。
  - `Fill` 填满。图片拉伸填满容器的显示区域。
  - `Contain` 图片同比缩放至图片能完全显示在容器中，容器可能会有留白。
  - `Cover` 图片在保持其宽高比的同时填充容器的整个内容框。如果对象的宽高比与内容框不相匹配，该对象可能超出内容框。
  - `Cover Width` 和`Cover`模式类似，但必须适配宽度。高度有可能超出内容框。
  - `Cover Height` 和`Cover`模式类似，但必须适配高度。宽度有可能超出内容框。
- `Shrink Only` 勾选后，无论`Fit Mode`的设置如何，都不允许图片被放大。
- `Color` 图片的颜色。
- `Mesh` 为渲染器提供自定义的网格。参考图片的Mesh属性说明。
- `Animation` 如果Src是动画资源，则可以使用这里的动画设置。详细可参考GMovieClip的设置。