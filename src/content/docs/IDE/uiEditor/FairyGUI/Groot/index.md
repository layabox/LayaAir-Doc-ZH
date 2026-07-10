---
title: "根节点与弹出"
description: "Author: 谷主"
slug: "ide/uieditor/fairygui/groot"
---

Author: 谷主

在UI系统中我们经常需要弹出一些组件，这些组件在用户点击空白地方的情况下就会自动消失。本UI系统内置了这个功能。

弹出和关闭Popup的API在GRoot中提供。

GRoot是UI系统的根节点，在游戏启动时自动创建。它在整个游戏中只有一个，并且总是显示在所有场景的最前面。一般来说，我们只做的UI界面直接放在场景（Scene2D）中即可，无需添加到GRoot下。如果调用GRoot的showPopup，或者显示窗口（GWindow），这些内容会自动添加在GRoot下。

因为GRoot只有一个实例，访问GRoot使用GRoot.inst即可。
- `showPopup` 弹出一个组件。如果指定了目标，则会调整弹出的位置到目标的下方，形成一个下拉的效果。同时提供了参数可以用来指定是向上弹出或者向下弹出。UI系统会根据组件的大小自动计算弹出位置，以确保组件显示不会超出屏幕。例如：

```typescript
//弹出在当前鼠标位置
GRoot.inst.showPopup(aComponent);

//弹出在aButton的下方
GRoot.inst.showPopup(aComponent, aButton);

//弹出在自定义的位置
GRoot.inst.showPopup(aComponent);
aComponent.pos(100, 100);
```

- 窗口也可以通过showPopup弹出，这样弹出的窗口也具有了点击空白关闭的特性：

```typescript
let aWindow: GWindow;
GRoot.inst.showPopup(aWindow);

//和使用aWindow.show显示窗口的唯一区别就是多了点击空白关闭的功能，其它用法没有任何区别。
```

- `hidePopup` 默认情况下，用户点击空白地方就会自动关闭弹出的组件。也可以调用此API手工关闭。可以指定需要关闭的Popup，不指定参数时，所有当前的弹出都关闭。