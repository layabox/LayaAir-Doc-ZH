# 窗口 （GWindow）
Author: 谷主

窗口是指可以弹出、关闭或隐藏的一种高级界面类型，在另外一些UI系统中，也有可能称作Dialog（对话框），他们都是一类东西。

在编辑器里，不能直接创建GWindow节点。GWindow需要运行时构建，但它只是一个壳对象，我们需要在编辑器内为它制作窗口内容。窗口内容通常使用预制体方式制作。没有规定预制体的根节点是什么类型。通常我们会在这个预制体内放置一个名称固定为"frame"的节点，如下图，在这个例子中，frame是另外一个预制体，这样会更方便复用。

<img src="img/1-1.png" alt="1-1" style="zoom:70%;" />

frame节点通常为GLabel类型，这样可以很方便的修改窗口的标题。另外，frame节点下约定名称的孩子节点可以激活一些常见的窗口功能：

- `closeButton` 一个名称为closeButton的按钮将自动作为窗口的关闭按钮。点击这个按钮时，窗口会自动隐藏。
- `dragArea` 一个名称为dragArea的精灵将自动作为窗口的检测拖动区域，当用户在此区域内按住并拖动时，窗口随之被拖动。
- `contentArea` 一个名称为contentArea的精灵将作为窗口的主要内容区域，这个区域只用于showModalWait。当调用showModalWait时，窗口会被锁定，如果设定了contentArea，则只锁定contentArea指定的区域，否则锁定整个窗口。如果你希望窗口在modalWait状态下依然能够拖动和关闭，那么就不要让contentArea覆盖标题栏区域。

注意以上的约定均为可选，是否含有frame，或者frame里是否含有约定名称的精灵，都不会影响窗口的正常显示和关闭。

窗口内容预制体制作完成后，运行时就可以使用以下的方式创建和使用窗口：

```TypeScript
let win = new GWindow();
win.contentPane = ((await Laya.loader.load("Examples/windows/Window1.lh")) as Laya.Prefab).create();
window.show();
```

也可以扩展GWindow类使用：

```TypeScript
class MyWindow extends Laya.GWindow {
    
    protected onInit() {
        this.contentPane = ((await Laya.loader.load("Examples/windows/Window1.lh")) as Laya.Prefab).create(); 
    }
    
    protected onShown() {
        //处理窗口显示后的逻辑，例如更新UI等。
    }
    
    protected onHide() {
        //处理窗口关闭后的逻辑
    }
}

let win = new MyWindow();
win.show();
```

窗口有一个特殊的锁定功能。例如当窗口在请求网络接口时，可以锁定窗口，这样用户就没办法操作窗口内的交互内容。锁定窗口需要一个预制体用于遮挡和显示一些提示的符号或文本，在“项目设置->UI系统->窗口模态等待”里设置这个预制体。

```TypeScript
aWindow.showModalWait();

//执行异步操作

aWindow.closeModalWait();
```

窗口还可以是模态的。模态窗口将阻止用户点击任何模态窗口后面的内容。

```TypeScript
aWindow.modal = true;

class MyWindow extends Laya.GWindow {
    constructor() {
        super();
        this.modal = true;
    }
}
```

当模态窗口显示时，模态窗口背后可以自动覆盖一层灰色的颜色，这个颜色可以自定义：

```TypeScript
Laya.UIConfig2.modalLayerColor = "#333333";
```

当点击窗口的关闭按钮关闭窗口时，或调用GWindow.hide方法时，窗口会被隐藏而不是销毁。这是因为窗口的设计理念是会被经常性的打开关闭，生命期一般都会比较长。如果窗口不再使用，需要手动调用destroy。