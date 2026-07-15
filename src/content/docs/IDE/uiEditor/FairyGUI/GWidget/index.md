---
title: "精灵（GWidget）"
description: "Author: 谷主"
slug: "ide/uieditor/fairygui/gwidget"
---

Author: 谷主

<img src="./img/1-1.png" alt="1-1" style="zoom:60%;" />

<img src="./img/1-2.png" alt="1-2" style="zoom:60%;" />

- `Background` 为精灵设置背景颜色，边框宽度，边框颜色。
- `Grayed` 勾选后，精灵将呈现一个变灰的状态。注意，变灰不代表不能点击，如果需要不能点击，还需要另外设置`Mouse Enabled`属性。默认情况下，变灰是使用颜色滤镜实现的，但也可以通过控制器自定义实现方式。例如，一个按钮组件，由底图和上面的图片文字组成。左边是正常状态，中间是设置了“变灰”后的效果。如果我们只是希望处于变灰状态时，只要图片文字变灰，不希望底图变灰，那么可以像右图那样，在组件里定义一个名称为“grayed”的控制器，由这个控制器去控制具体变灰的状态。定义了这个名称的控制器后，默认的整体变灰效果消失。

<img src="./img/1-3.png" alt="1-3" style="zoom:100%;" />

- `Tooltips` 当鼠标移到元件范围内时，弹出一个文本提示，移出元件范围后，文本提示自动消失。使用Tooltips要按照下面几个步骤准备：
  - 制作一个预制体，这个预制体的根节点为GLabel，并设置好它的文本精灵，以便系统将TIPS文本设置到标签的“Title”属性中。
  - 打开“项目设置->UI系统”，将你制作好的预制体拖入“提示框”输入框中。

### text和icon

图片和文字是UI系统两个最基本的显示元素，在实际应用中，访问和设置组件的标题和图标是UI的高频操作，因此，本UI系统在基类GWidget提供了text和icon两个属性。
例如，对于图片，下面两行代码是等价的：

```typescript
aImage.src = 'xxx.png';
aImage.icon = 'xxx.png';
```
又例如，对于按钮，下面两行代码是等价的：
```typescript
aButton.text = 'hello';
aButton.title = 'hello';
```
所以当不清楚具体节点类型，又需要设置标题时，可以直接使用text。例如设置GTextField的文本是使用text，设置GButton的标题是使用title，但使用text都可以设置成功。icon同理。
