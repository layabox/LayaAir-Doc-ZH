---
title: "按钮（GButton）"
description: "Author: 谷主"
slug: "ide/uieditor/fairygui/gbutton"
---

Author: 谷主

<img src="/IDE/uiEditor/FairyGUI/GButton/img/1-1.png" alt="1-1" style="zoom:50%;" />

- `Title` 标题。必须先设置好`Title Widget`。
- `Selected Title` 选中状态时的标题，对单选或多选按钮有意义。
- `Icon` 图标。必须先设置好`Icon Widget`。
- `Selected Icon` 选中状态时的图标，对单选或多选按钮有意义。
- `Title Color` 标题颜色。
- `Title Font Size` 标题字号。
- `Mode` 按钮模式。
  - `Common` 普通按钮。
  - `Check` 多选按钮。点击切换为选中状态，再点击切换为不选中状态。
  - `Radio` 单选按钮。点击切换为选中状态，但无法自动切换为不选中状态。通常由多个单选按钮组成一个单选组。单选组的制作方法参考[控制器和按钮的联动](/ide/uieditor/fairygui/controller/)。另外，单选按钮的一个重要用途是，如果它是在具有选择模式的面板中时，它将参与选择模式。
- `Selected` 选中状态。对单选或多选按钮有意义。
- `Selected Controller`  参考[控制器和按钮的联动](/ide/uieditor/fairygui/controller/)。
- `Selected Page` 参考[控制器和按钮的联动](/ide/uieditor/fairygui/controller/)。
- `Down Effect` 内置的简单按下效果，对普通按钮有意义。如果这几个效果不能满足你的需求，可以使用按钮内的控制器实现特殊效果。
  - `Dark` 按钮按下时有一个整体变暗的效果。
  - `UpScale` 按钮按下时有一个放大的效果。
  - `DownScale` 按钮按下时有一个缩小的效果。
- `Sound` 按钮按下时播放一个音效。

以下属性用于绑定按钮的功能部件。注意：当按钮节点是预制体实例的节点时，这些属性会隐藏。

- `Title Widget` 设置文本精灵。当设置按钮的Title属性时，实际改变的是这里设置的组件。
- `Icon Widget` 设置图标精灵。当设置按钮的Icon属性时，实际改变的是这里设置的组件。

通常，按钮内还需要包含一个按钮控制器，名字固定为"button"，当然，如果你不需要按钮有特殊效果，那么这个控制器不是必须的。

按钮控制器各个页面的说明：

- `up` 按钮正常的状态；
- `down` 普通按钮按下时的状态/单选或多选按钮被选中时的状态；
- `over` 当鼠标指针悬浮在按钮上方时的状态；
- `selectedOver` 当单选或多选按钮选中时，鼠标指针悬浮到按钮上方时的状态；
- `disabled` 按钮不可用时的状态；
- `selectedDisabled` 当单选或多选按钮选中时，按钮不可用时的状态。

通常我们设计一个4态按钮，用up/down/over/selectedOver就可以了，如果是用在移动设备上，那么也可以只使用up/down。当按钮不可用时，我们提供了一个默认的变灰的效果，如果你不想要这个效果，那就要用到disabled和selectedDisabled进行设计。

在控制器设计页面中，可以通过下面红框标注的按钮快速添加上述的页面，如下图1-1所示：

<img src="/IDE/uiEditor/FairyGUI/GButton/img/1-2.png" alt="1-1" style="zoom:50%;" />

（图1-1）