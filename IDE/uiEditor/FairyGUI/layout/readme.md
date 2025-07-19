# 布局容器
Author: 谷主

在制作自适应分辨率的UI界面时，除了关联系统，布局容器是另一个常用的方式。布局容器一般是指GBox，但它的派生类例如GPanel、GList也具有相同的功能。

### 一、编辑器操作

<img src="img/1-1.png" alt="1-1" style="zoom:50%;" />

（图1-1）


- `Type` 布局类型
  - `None` 不开启布局。子节点自由保持它们原来的位置和尺寸。
  - `Single Column ` 每行一个item，竖向排列。
  - `Single Row` 每列一个item，横向排列。
  - `FlowX`  item横向依次排列，到达视口右侧边缘或到达指定的列数，自动换行继续排列。
  - `FlowY`  item竖向依次排列，到达视口底部边缘或到达指定的行数，返回顶部开启新的一列继续排列。
- `Rows` 这个选项只对FlowY布局类型布局有效。如果设置了大于0的值，则每列的数量到达设定的值才会开启新的一列。
- `Columns` 这个选项只对FlowX布局类型布局有效。如果设置了大于0的值，则每行的数量到达设定的值才会开启新的一行。
- `Row Gap` 每行之间的距离。可以为负数。
- `Column Gap` 每列之间的距离。可以为负数。
- `Padding` 设定容器内部四个方向的留空。
- `Align` 在水平方向的对齐方式。
- `Valign` 在垂直方向的对齐方式。
- `Fold Invisibles`  如果勾选，当某个item不可见时（visible=false），布局时不会为他留位置，也就是排版时会忽略这个item；如果不勾选，则会为这个item保留位置，显示效果就是一个空白的占位。
- `Min Child Size` 当根据布局参数自动改变子节点的大小时，不会小于这里设置的值。例如，如果这里设置了30，并且一个节点在排列时要求宽度为10，则节点最后的宽度会被设置为30。
- `Scroll Item To View On Click` 勾选后，当点击某个item时，如果这个item处于部分显示状态，那么将会自动滚动到整个item显示完整。
- `Stretch X` 在水平方向上的缩放操作。
  - `None` 不使用缩放。这意味item不会改变它的宽度。
  - `Stretch` 缩放。举例，假设布局类型是`Single Column`，即每行只有一个item，那么这个item的宽度会被设置为视口的宽度。
  - `Resize to Fit` 调整视口宽度以适配水平方向上所有item宽度的最大值。举例，假设布局类型是`Single Column`，即每行只有一个item，那么item的宽度不会改变，视口的宽度会被设置为所有item的最大宽度。
- `Stretch Y` 在垂直方向上的缩放操作。参考`Stretch X` 。
- `Stretch Params X` 在水平方向上进行缩放时的参数。这是一个数组，每个元素对应相同顺序的列，即第一个元素应用于第一列的布局，第二个元素应用于第二列的布局，以此类推。需要注意的是，如果某一个列因为`Fold Invisibles` 导致不可见和不占位，不会影响数组元素与列的对应顺序。
  - `Ratio` 设置比例。假设设置为0.5，则表示对应的列在水平方向占50%的宽度。
  - `Piority` 设置优先级。在运行时，这个值会被标准化为(-1, 0, 1)三个值之一。当item的宽度超出或者不足列的宽度时，会先调整优先级高的item的宽度。举例，假设一行中有两个item水平排列，它们的宽度都是100，视口宽度是300，如果都不设置Piority，那么两个item的宽度都为150；如果设置第二个元素的Piority为1，则第一个item的宽度是100，第二个item的宽度是200。
  - `Min` 设置最小值。在这一列的item的宽度不会小于这个值。
  - `Max` 设置最大值。在这一列的item的宽度不会大于这个值。
  - `Fixed` 表示这列的宽度的固定的。item的宽度将保持不变。
- `Stretch Params Y` 在垂直方向上进行缩放时的参数。参考`Stretch Params X` 。

### 二、常用API

当改变layout的属性时，布局容器会自动标记为脏状态，并在下次渲染前刷新，但有一个例外，设置stretchParamsX和stretchParamsY这两个属性时，需要我们手动设置脏状态。
```typescript
//无需手动设置脏状态
aBox.layout.foldInvisibles = true;

//需要手动设置脏状态
aBox.layout.stretchParams.push(new StretchParam().setRatio(0.5));
aBox.setLayoutChangedFlag();

aBox.layout.stretchParamsX[0].ratio = 0.8;
aBox.setLayoutChangedFlag();
```
当容器内的子节点的位置、尺寸、可见性改变时，或者添加孩子，移除孩子等操作后，布局容器会自动在下次渲染前根据布局刷新位置。如果你希望立刻访问item的正确坐标，需要执行如下代码：
```typescript
aBox.layout.refresh();
```

