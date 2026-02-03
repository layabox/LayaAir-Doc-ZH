# 垂直滑动条组件（VSlider）

## 一、通过LayaAir IDE创建VSlider组件

HSlider与VSlider组件都是Slider组件的子类，它们分别表示横向滑动条与纵向滑动条。用户可以通过在滑块轨道之间移动滑块来选择值。常用于如播放器进度控制、音量大小控制，一些UI上的数值调整等。VSlider的详细属性可查看[API](https://layaair.com/3.x/api/Chinese/index.html?version=3.0.0&type=2D&category=UI&class=laya.ui.VSlider)。

### 1.1 创建VSlider

如图1-1所示，可以在`层级`窗口中右键进行创建，也可以从`小部件`窗口中拖拽添加。

<img src="img/1-1.png" alt="1-1" style="zoom: 50%;" />

（图1-1）

滑动条可由两部分或三部分组成。如果是两部分，则包含底图资源`vslider.png`、滑块资源`vslider$bar.png`，如图1-2所示。资源至少应当有这两个，否则无法实现滑动功能。

![1-2](img/1-2.png)

（图1-2）

如果是三部分组成的滑动条，则包含滑块资源`vslider$bar.png`、进度条资源`vslider$progress.png` 、底图资源`vslider.png`，如图1-3所示。如果缺少了进度条资源组件也不会报错，只是不显示进度。

![1-3](img/1-3.png)

（图1-3）

>进度条资源`vslider$progress.png`可以与底图资源`vslider.png`互换，互换后进度可以反向显示。

LayaAir默认创建的VSlider组件是由两部分组成的，如动图1-4所示，VSlider组件采用纵向排列。滑块轨道从上向下扩展，鼠标拖动滑块会显示数值的标签。

<img src="img/1-4.gif" alt="1-4" style="zoom:50%;" />

（动图1-4）



### 1.2 VSlider属性

VSlider的特有属性如下：

![1-5](img/1-5.png)

（图1-5）

| **属性**       | **功能说明**                                                 |
| -------------- | ------------------------------------------------------------ |
| max            | 滑块拖动到最下边时的值，默认数值为100                        |
| min            | 滑块拖动到最上边时的值，默认数值为0                          |
| showLabel      | 是否显示标签。默认为true，运行时拖动滑块会显示value值        |
| showProgress   | 是否显示进度条。默认为false，如果存在进度条资源`vslider$progress.png`，则可以勾选该项 |
| skin           | 滑动条的底图资源                                             |
| skinGrid       | 滑动条底图资源的有效缩放网格数据（九宫格数据）               |
| tick           | 滑动条刻度值的最小单位。每次拖动滑块value值改变的量，默认值为1 |
| value          | 当前所在刻度，即滑块目前所处的数值，应当等于max或min，或是它们之间的值 |
| allowClickBack | 是否允许通过点击滑动条改变value值。默认为false，禁止通过点击滑动条改变value值，此时只有拖动滑块一种方式改变value值。为true时，可以通过点击滑动条目标区域，使滑块快速跳转到当前所在刻度，改变value值 |

设置VSlider的属性max的值为20、属性min的值为0、属性value的值为5后，显示效果如下：

<img src="img/1-6.png" alt="1-6" style="zoom: 50%;" />

（图1-6）

设置属性showLabel为true、属性showProgress为true、属性tick值为3，效果如下动图所示：

<img src="img/1-7.gif" alt="1-7" style="zoom:80%;" />

（动图1-7）

进度条资源`vslider$progress.png`可以与底图资源`vslider.png`互换，效果如下：

<img src="img/1-8.gif" alt="1-8" style="zoom:80%;" />

（动图1-8）



### 1.3 脚本控制VSlider

在Scene2D的属性设置面板中，增加一个自定义组件脚本。然后，将VSlider拖入到其暴露的属性入口中。需要添加如下的示例代码，实现脚本控制VSlider：

```typescript
const { regClass, property } = Laya;

@regClass()
export class NewScript extends Laya.Script {

    @property({type:Laya.VSlider})
    public vslider: Laya.VSlider;

    //组件被激活后执行，此时所有节点和组件均已创建完毕，此方法只执行一次
    onAwake(): void {
        this.vslider.pos(300,300);//滑动条位置
        this.vslider.skin = "resources/vslider.png";//滑动条底图皮肤
        this.vslider.value = 0.5;
        this.vslider.max = 50;
        this.vslider.min = 0;
        this.vslider.tick = 1;
        this.vslider.showProgress = true;//必须存在vslider$progress.png资源，否则会报错
    }
}
```



## 二、通过代码创建VSlider组件

有时，需要用代码控制UI组件，创建UI_VSlider类，并通过代码设置VSlider。下述示例用代码创建了一个VSlider组件，并在控制台输出其value值。

示例代码：

```typescript
const { regClass, property } = Laya;

@regClass()
export class UI_VSlider extends Laya.Script {

    constructor() {
        super();
    }

    onAwake(): void {
		let skins: any[] = [];
		skins.push("vslider.png", "vslider$bar.png");//图片资源来自“引擎API使用示例”
		Laya.loader.load(skins, Laya.Handler.create(this, this.placeVSlider));
	}

	private placeVSlider(): void {
		let vs: Laya.Slider = new Laya.VSlider();
		vs.skin = "vslider.png";

		vs.height = 300;
		vs.pos(400, 50);
		vs.min = 0;
		vs.max = 100;
		vs.value = 50;
		vs.tick = 1;

		vs.changeHandler = new Laya.Handler(this, this.onChange);
		this.owner.addChild(vs);
	}

	private onChange(value: number): void {
		console.log("滑块的位置：" + value);
	}
}
```

运行效果：

<img src="img/2-1.gif" alt="2-1" style="zoom: 50%;" />

（动图2-1）

