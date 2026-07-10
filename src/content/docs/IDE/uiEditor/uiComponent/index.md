---
title: "UI组件基础使用与构成"
description: "UI 组件是经典 UI 系统的核心构成，封装了大量常用且实用的界面功能，便于开发者高效构建各类用户界面。"
slug: "ide/uieditor/uicomponent"
---

> Author: Charley  

**UI 组件**是经典 UI 系统的核心构成，封装了大量常用且实用的界面功能，便于开发者高效构建各类用户界面。

## 1、什么是UI组件

从引擎类结构来看，`UIComponent` 是经典 UI 系统中所有 UI 组件的基类。也就是说，所有 UI 组件本质上都是继承自 `UIComponent` 的派生类，具备统一的接口和行为特征。

UI 组件按照功能类型可分为**基础组件**和**容器组件**。其中，`Box` 及其所有子类被归类为容器组件，用于承载和布局其他 UI 节点；而除 `Box` 系列以外的组件，则通常属于基础组件，用于直接显示文本、图片、按钮等界面元素。

### 1.1  基础UI组件

基础UI组件显示对象，一共有17个，直接或间接继承于`UIComponent`，如图1-1的高亮部分所示。

![1-1](/IDE/uiEditor/uiComponent/img/1-1.png) 

（图1-1）

### 1.2 容器组件

继承于Box的组件，加上Box容器本身，容器对象一共有9个。如图1-2的高亮部分所示。

![1-2](/IDE/uiEditor/uiComponent/img/1-2.png) 

(图1-2)

这些容器单单自己是没有意义的，必须要包括基础的UI组件作为子节点，才能使得组件功能完整。

例如，List必须要有基础UI组件作为列表的渲染单元，单选框组（RadioGroup）是多个单选框（Radio）组件的容器。

### 1.3 弹窗视图组件

从引擎的类结构上看，弹窗视图组件 `Dialog` **并不继承自 `UIComponent`**，因此在严格意义上不属于 UI 组件体系中的一员，其继承关系如图 1-3 所示。

![1-3](/IDE/uiEditor/uiComponent/img/1-3.png) 

（图1-3）

但在功能上，`Dialog` 是经典 UI 系统中使用频率极高的组件之一，所在IDE创建UI组件时，也归类在其中。常用于弹窗界面、提示窗口、对话框等应用场景。



## 2、UI组件的使用

UI组件的创建有三种方式：分别是从小部件（Widgets）面板里拖拽UI组件使用、从层级管理（Hierarchy）面板的右键菜单里创建、通过组件资源命名规则为资源命名，然后拖拽资源使用，直接被IDE识别。

### 2.1  小部件面板中拖拽

小部件（Widgets）面板里包括了基础节点，也包括了UI组件，使用时直接拖拽到层级面板或场景编辑窗口内即可。效果如动图2-1所示。

![](/IDE/uiEditor/uiComponent/img/2-1.gif)

(动图2-1)

### 2.2  层级右键菜单中创建

层级管理（Hierarchy）面板的2D节点下，右键菜单里也可以直接创建UI组件，效果如图2-2所示。

<img src="/IDE/uiEditor/uiComponent/img/2-2.png" alt="2-2" style="zoom: 80%;" /> 

(图2-2)

### 2.3 资源面板中拖拽

如果资源命名符合 UI 组件命名规则（具体规则可参见相关文档），则在将其拖拽到层级面板或场景视图时，IDE 会**自动创建对应的 UI 组件**，如图 2-3 所示。

![](/IDE/uiEditor/uiComponent/img/2-3.png) 

(图2-3)

## 3、UI组件基类属性

在 UI 组件中，**相对布局**、**数据源绑定**、**灰化显示（变灰）以及禁用鼠标事件**等，都是 UI 系统特有的功能属性。这些能力在 2D 基础对象（如 `Sprite`）中并不具备。

### 3.1 相对布局layout

如图 3-1 所示，每个 UI 组件都具备一组用于相对定位的布局属性。而基础显示对象（如 `Sprite`）仅支持**绝对布局**。

![3-1](/IDE/uiEditor/uiComponent/img/3-1.png) 

（图3-1）

在相对布局中，UI 组件的位置是**相对于其父节点**来计算的。这种布局方式提供了高度的灵活性，能在不同屏幕尺寸和方向下自动适配，确保界面元素在各类设备上的一致性与可用性。

代码中的使用示例如下：

```typescript
this.xx.left = 0;
this.xx.right = 0;
this.xx.top = 0;
this.xx.bottom = 0;
this.xx.CenterX = 0;
this.xx.CenterY = 0;
```

### 3.2 数据源dataSource

在实际开发中，从网络获取的数据有时候与 UI 组件预期的数据结构不完全一致，尤其在处理列表组件时更为常见。此时可以通过设置组件的 `dataSource`，对原始数据进行结构调整，使其满足列表渲染所需的格式。

示例代码如下：

```typescript
import { ItemBoxBase } from "./ItemBox.generated";

const { regClass, property } = Laya;

@regClass()
export class Script extends ItemBoxBase {
  	constructor() {
        super();
    }

    get dataSource(): any {
        return super.dataSource;
    }
    set dataSource(value: any) {
        super.dataSource = value;
        if (!value) return;

        //把数据源里的值，给到子节点属性
        if (value.avatar) {
            let redHot = this.getChildByName("avatar").getChildByName("redHot") as Laya.Image;
            redHot.visible = value.avatar.redHot.visible;
        }

        if (value.flag) {
            let flagText = this.getChildByName("flag").getChildByName("flagText") as Laya.Text;
            flagText.text = value.flag.flagText.text;
        }
    }
}
```

### 3.3  变灰与禁用鼠标事件

在 UI 组件中，设置 `gray` 属性可使组件进入**灰化状态**，将具有颜色的元素以灰色形式显示，如图3-2所示。用于提示“不可用”或“非当前状态”。

![](/IDE/uiEditor/uiComponent/img/3-2.png) 

而设置 `disabled` 属性，则不仅会**禁用鼠标交互**（例如点击按钮无响应），还会自动将组件强制切换为灰化显示。这种视觉反馈可以让用户明显感知到该组件当前处于不可操作状态。

代码使用示例如下：

```typescript
this.xx.disabled = true;
```