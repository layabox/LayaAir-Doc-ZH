# Selection支持
Author: 谷主

GPanel以及它的派生类（GList、GTree）都提供了选择（Selection）功能，当孩子节点的类型为GButton，并且它的模式是单选按钮时，就会参与到这个功能。

### 一、编辑器操作
<img src="img/1-1.png" alt="1-1" style="zoom:60%;" />
- `Mode` 选择模式。
  - `None` 无。
  - `Single` 单选。即选择其中一个就会清空其它选择。
  - `Multiple` 多选。通过shift+鼠标左键或ctrl+鼠标左键进行多选的操作。
  - `MultipleBySingleClick` 多选，但只通过单击完成。因为在手机上，没有shift和ctrl键，所以设计了这种模式。在这种模式下，点击一个按钮，选中，再点击这个按钮，就会取消选中。
  - `Disabled` 关闭。这时点击容器内的单选按钮将没有选中效果。
- `Controller`  控制器可以与Selection联动，当Selection发生改变时，控制器也同时跳转到相同索引的页面。反之亦然，如果控制器跳转到某个页面，那么也会同时选定相同索引的项目。
- `Scroll Item To View On Click` 勾选后，当点击某个孩子节点时，如果这个孩子节点处于部分显示状态，那么列表将会自动滚动到整个孩子节点显示完整。

### 二、常用API
Selection常用的是增删改查操作。

```typescript
//选中第10个孩子节点
aPanel.selection.add(10);

//取消第10个孩子节点的选择
aPanel.selection.remove(10);

//清除所有选择
aPanel.selection.clear();

//单选模式下，获取当前选中的孩子节点的索引
let selectedIndex = aPanel.selection.index;

//多选模式下，获取所有选中的孩子节点的索引
let indice = aPanel.selection.get();
```