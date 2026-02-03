# 垂直布局容器组件（VBox）

VBox是容器类组件，继承自Box。VBox是用于垂直布局的容器组件，对比Box它增加了更为细致的功能。VBox的详细属性可以查看[API](https://layaair.com/3.x/api/Chinese/index.html?version=3.0.0&type=2D&category=UI&class=laya.ui.VBox)。

## 一、通过LayaAir IDE创建VBox组件

### 1.1 创建VBox

通过IDE的可视化操作可以直接在层级面板对VBox进行创建，如图1-1所示，可以在`层级`窗口中右键进行创建，也可以从`小部件`窗口中拖拽添加。

<img src="img/1-1.png" alt="1-1" style="zoom:50%;" />

（图1-1）



### 1.2 VBox属性

VBox的特有属性如下：

![1-2](img/1-2.png)

（图1-2）

| 属性    | 功能                                                         |
| ------- | ------------------------------------------------------------ |
| bgColor | 背景颜色，勾选后可以直接输入颜色值，例如：`#ffffff`，也可以点击输入条右侧的拾色器选取颜色 |
| space   | 子对象之间的垂直间隔，以像素为单位。                         |
| align   | 布局元素的水平对齐，共有四个选项。none：不进行水平对齐，left：居左水平对齐，center：居中水平对齐，right：居右水平对齐，默认为none。 |

space属性就是设置子对象之间的垂直间隔，以像素为单位，可以自行输入数字，也可以通过鼠标左键长按滑动来输入数值。假设VBox有三个Button组件子对象，调节space属性的效果如动图1-3所示。

![1-3](img/1-3.gif)

（动图1-3）

VBox的子节点无论在IDE中怎样排列，在设置了align属性后都会变成相对应的水平排序，如动图1-4所示。

![1-4](img/1-4.gif)

（动图1-4）



### 1.3 脚本控制VBox

在Scene2D的属性设置面板中，增加一个自定义组件脚本。然后，将VBox拖入到其暴露的属性入口中，由于只有一个VBox无法查看效果，所以开发者可以在VBox下添加一些子节点。示例代码如下：

```typescript
const { regClass, property } = Laya;

@regClass()
export class NewScript extends Laya.Script {

    @property({ type: Laya.VBox })
    public vbox: Laya.VBox;

    //组件被激活后执行，此时所有节点和组件均已创建完毕，此方法只执行一次
    onAwake(): void {
        this.vbox.pos(100, 100);
        this.vbox.bgColor = "#ffffff";
        this.vbox.space = 30;
        this.vbox.align = "center";
    }
}
```



## 二、通过代码创建VBox

有时，需要用代码管理UI，创建UI_VBox类用于创建VBox组件。由于单独创建一个VBox组件的意义并不大，所以再创建三个Button组件用于演示效果。示例代码如下：

```typescript
const { regClass, property } = Laya;

@regClass()
export class UI_VBox extends Laya.Script {

    private vbox: Laya.VBox;
    private btn1: Laya.Button;
    private btn2: Laya.Button;
    private btn3: Laya.Button;

    // 按钮皮肤资源
    private skins: string = "atlas/comp/button.png";

    //组件被激活后执行，此时所有节点和组件均已创建完毕，此方法只执行一次
    onAwake(): void {
        Laya.loader.load(this.skins).then(() => {
            this.createBtn();
            this.createvbox();
            // 添加VBox组件
            this.owner.addChild(this.vbox);
        });
    }

    // 创建Button组件
    private createBtn(): void {
        this.btn1 = new Laya.Button(this.skins);
        this.btn2 = new Laya.Button(this.skins);
        this.btn3 = new Laya.Button(this.skins);
    }

    // 创建VBox组件
    private createvbox(): void {
        this.vbox = new Laya.VBox;
        this.vbox.pos(100, 100);
        this.vbox.size(600, 300);
        this.vbox.bgColor = "#ffffff";
        this.vbox.addChild(this.btn1);
        this.vbox.addChild(this.btn2);
        this.vbox.addChild(this.btn3);
        this.vbox.space = 80;
        this.vbox.align = "center";
    }
}
```

