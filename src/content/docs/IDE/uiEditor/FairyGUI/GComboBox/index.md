---
title: "下拉框（GComboBox）"
description: "Author: 谷主"
slug: "ide/uieditor/fairygui/gcombobox"
---

Author: 谷主

<img src="./img/1-1.png" alt="1-1" style="zoom:50%;" />

- `Title` 标题。必须先设置好`Title Widget`。
- `Icon` 图标。必须先设置好`Icon Widget`。
- `Title Color` 标题颜色。
- `Title Font Size` 标题字号。
- `Items` 每个item的标题。
- `Values` 每个item的值。用于代码逻辑。
- `Icons` 每个item的图标。
- `Popup Direction` 下拉框弹出的方向。
  - `Auto` 自动。根据下拉框所在位置决定弹出的方向，例如，如果下拉框处于舞台较下的位置，那么下拉框会自动改成向上弹出，避免看不到部分内容。
  - `Up` 向上弹出。
  - `Down` 向下弹出。
- `Visible Item Count` 可见item数量限制。如果超出这个数量，将使用滚动显示。
- `Selected Controller` 参考[控制器和下拉框的联动](/ide/uieditor/fairygui/controller/)。

以下属性用于绑定下拉框的功能部件。注意：当下拉框节点是预制体实例的节点时，这些属性会隐藏。

- `Dropdown Res` 下拉框资源，这是一个预制体。这个组件最基本的设计就是一个背景+一个列表。背景对容器组件做好宽高关联。列表需要固定命名为“list”。一般来说，需要为列表设置好垂直滚动。
- `Title Widget` 设置文本精灵。
- `Icon Widget` 设置图标精灵。

通常，下拉框内也需要一个名称为"button"的控制器，因为他和按钮的形态是一样的。可以按设计按钮的方式设计下拉框。当下拉框被点击下拉时，“button”控制器将停留在“down”页，下拉列表收回后，“button”控制器回到“up”页或“over”页。