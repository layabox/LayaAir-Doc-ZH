# 基础文本（Text）

Text继承于Sprite，是静态文本的基础组件。这里我们介绍一下Text专属的组件属性。

## 1. LayaAir IDE中使用Text

### 1.1 创建Text

如图1-1所示，可以在`层级`窗口中右键进行创建，也可以从`小部件`窗口中拖拽添加。

![1-1](img/1-1.png)

（图1-1）

### 1.2 属性介绍

在IDE中，我们将Text组件添加到场景编辑的视图区后，属性面板中Text组件的专属属性如下图所示： 

![1-2](img/1-2.png)

（图1-2）

下面我们分别对这些属性进行介绍说明：

| 属性名         | 属性说明                                                     |
| -------------- | ------------------------------------------------------------ |
| text           | 文本的实际内容                                               |
| font           | 文本字体，例如：`Microsoft YaHei`，这里可以手动输入常用的字体，还可以是[位图字体](../../advanced/useText/readme.md) |
| fontSize       | 文本字体大小，例如： `50`，直接填写正整数                    |
| color          | 文本的颜色，可以直接输入颜色值，例如：`#ffffff`，也可以点击输入条右侧的拾色器选取颜色 |
| style          | “**B**”(bold)是否为粗体，“***I***”(italic)是否为斜体，“<u>**U**</u>”是否有下划线 |
| syntax         | 多样式混排，支持部分HTML语法和UBB语法。还可以勾选模板，能够在字符串中使用变量 |
| align          | 对齐方式，水平对齐(align)分别是left（居左对齐）、center（居中对齐）、right（居右对齐）;垂直对齐(valign)分别是top（居顶对齐）、middle（居中对齐）、bottom（居底对齐） |
| bgColor        | 背景颜色，勾选后可以直接输入颜色值，例如：`#ffffff`，也可以点击输入条右侧的拾色器选取颜色 |
| borderColor    | 文本边框颜色，勾选后可以直接输入颜色值，例如：`#ffffff`，也可以点击输入条右侧的拾色器选取颜色 |
| overflow       | 文本溢出处理，共有五种模式。visible（可见）：默认模式，不进行任何裁切。hidden（隐藏）：不显示超出文本域的字符。scroll（滚动）：不显示文本域外的字符像素，并且支持scroll接口，详见1.4节。shrink（自动收缩）：超出文本域时，文本整体缩小以适应文本框。ellipsis（显示省略号）：超出文本域时，文本被截断，并且文本最后显示省略号 |
| wordWrap       | 是否自动换行，布尔值选项，默认为`false`，选择`true`可以开启自动换行 |
| leading        | 垂直行间距，当开启自动换行时，文本内容多行时有效。间距以像素为单位，输入正整数即可 |
| padding        | 文本边距，以像素为单位，由4个整数值组成。“U”表示距上边框的距离、”R“表示距右边框的距离、”D“表示距下边框的距离、”L”表示距左边框的距离 |
| underlineColor | 下划线颜色，可以直接输入颜色值，例如：`#ffffff`，也可以点击输入条右侧的拾色器选取颜色 |
| stroke         | 描边宽度，范围为0~100                                        |
| strokecolor    | 描边颜色，可以直接输入颜色值，例如：`#ffffff`，也可以点击输入条右侧的拾色器选取颜色 |

以上属性都比较容易理解，开发者只需调整参数便可在IDE中看到对应的效果。以下只详细介绍一下**“syntax”属性**。

### 1.3 Syntax属性

#### 1.3.1 HTML和UBB

如果勾选HTML，则支持部分HTML语法；如果勾选UBB，则支持UBB语法，UBB语法比HTML更简洁一点；如果两个都勾选，则两种语法都支持。

支持的UBB语法如下表所示：

| 语法结构                    | 示例代码                              | 语句说明           |
| --------------------------- | ------------------------------------- | ------------------ |
| [img]image_url[/img]        | [img]atlas/comp/image.png[/img]       | 显示一张图片       |
| [url=link_href]text[/url]   | [url='www.layabox.com']蓝亚盒子[/url] | 显示一个超级链接   |
| [b]text[/b]                 | [b]这些字是粗体[/b]                   | 设置文本为粗体     |
| [i]text[/i]                 | [i]这些字是斜体[/i]                   | 设置文件为斜体     |
| [u]text[/u]                 | [u]这些字有下划线[/u]                 | 设置文本下划线     |
| [color=#FFFFFF]text[/color] | [color=#FF0000]这是红色的字[/color]   | 设置文本颜色       |
| [size=10]text[/size]        | [size=60]这是字体大小为60的字[/size]  | 设置文本的字体大小 |

> UBB支持标签之间的嵌套，可以将上表中多个标签嵌套使用，例如，`[color=#FF0000][size=60]红色且大小为60的字[/size] [/color]`。

支持的HTML语法如下表所示：

| 语法结构                                        | 示例代码                                                     | 语句说明                                     |
| ----------------------------------------------- | ------------------------------------------------------------ | -------------------------------------------- |
| `<b>Text</b>`                                   | `<b>这是粗体字</b>`                                          | 定义粗体字                                   |
| `<i>Text</i>`                                   | `<i>这是斜体字</i>`                                          | 定义斜体字                                   |
| `<u>Text</u>`                                   | `<u>这是下划线文本</u>`                                      | 定义下划线                                   |
| `<li>Text1</li> <li>Text2</li> <li>Text3</li>`  | `<li>苹果</li> <li>香蕉</li> <li>橘子</li>`                  | 定义列表                                     |
| `<img src='image_url' width = 200 height=100/>` | `<img src='atlas/comp/image.png' width = 200 height=100/>`   | 显示一张图片，还可以使用百分比指定图片的大小 |
| `<a href='xxx'>link text</a>`                   | `<a href='www.layabox.com'>蓝亚盒子</a>`                     | 显示一个超级链接                             |
| `<div> Text </div>`                             | `<div>文本的最外层</div>`                                    | div容器标签                                  |
| `<span> Text </span>`                           | `<span> 多个span之间不会自动换行，除非是达到了宽度限制</span>` | 行内元素                                     |
| `<p>Text</p>`                                   | `<p>多个p标签之间会自动换行，每个完整的p标签是一个单独的段落</p>` | 段落                                         |
| `Text1<br />Text2`                              | `换行<br />后面的就换行了`                                   | 换行                                         |
| `&nbsp;`                                        | `这里&nbsp;空一格`                                           | 空格                                         |

下面来看一个具体的例子，如图1-3所示，勾选HTML和UBB后，就可以在Text属性中输入符合语法的语句：

![1-3](img/1-3.png)

（图1-3）

Text中输入的示例语句如下：

```html
<img src='atlas/comp/image.png' width = 200 height=100/>

[url='www.layabox.com']蓝亚盒子[/url]

[size=60]text[/size]

[color=#FF0000]text[/color]

[u]text[/u]

[color=#FF0000][size=60]text[/size][/color]
```

上述这6条语句分别对应图1-3所示的6种效果：加载图片、显示链接、字体大小为60、字体颜色为红色、下划线、嵌套（大小和颜色）。每条语句之间可以不空行，示例中有空行是为了方便观察效果。

#### 1.3.2 模板

“syntax”属性还可以勾选`模板`选项，勾选后，就可以在字符串中使用变量了。比如，在Text属性中输入`Text{n=100}`，效果如图1-4所示：

![1-4](img/1-4.png)

（图1-4）

变量n还可以是字符串，例如，输入`Text{n=你好}`,显示的效果就是图1-5所示的了。当然，这个变量不一定必须是n，开发者可以自定义变量名。

![1-5](img/1-5.png)

（图1-5）

还可以在代码中使用`setVar`方法动态调节变量n，可以结合1.3节的脚本控制，在脚本中输入如下代码：

```typescript
const { regClass, property } = Laya;

@regClass()
export class NewScript extends Laya.Script {
    //declare owner : Laya.Sprite3D;

    @property({ type: Laya.Text })
    txt: Laya.Text;

    constructor() {
        super();
    }

    onAwake(): void {
        this.txt.text = "第{n=1}页"; //显示文本的初始化内容
    }

    onStart(): void {
        let page: number = 1;
        Laya.timer.frameLoop(10, this, () => {
            page += 1; //在定时器中让变量page每次自增1
            this.txt.setVar("n", page); //使用setVar方法，让text文本中变量n的值动态改变
        });
    }
}
```

效果如动图1-6所示：

![1-6](img/1-6.gif)

（动图1-6）

> 注：变量n还可以是从.json文件中获取的文本，开发者可以自己写一个.json文件，然后在脚本中进行加载，最后利用setVar方法赋值给变量n。

在游戏中比较常用的情况就是，如图1-7所示，当每个玩家进入游戏，都会遇到一段对白，只有不同玩家的角色名称不同。那么，采用文本模板功能之后，无需再去整体修改文本，直接改变文本模板中的变量即可。让局部文本的动态改变更加易用。

![1-7](img/1-7.png)

（图1-7）



### 1.4 脚本控制Text

在Scene2D的属性设置面板中，增加一个自定义组件脚本。然后，将Text拖入到其暴露的属性入口中。下面给出一个示例代码，实现脚本控制Text：

```typescript
const { regClass, property } = Laya;

@regClass()
export class TextControl extends Laya.Script {
    //declare owner : Laya.Sprite3D;

    @property( { type : Laya.Text } )
    public txt: Laya.Text;

    constructor() {
        super();
    }

    /**
     * 组件被激活后执行，此时所有节点和组件均已创建完毕，此方法只执行一次
     */
    onAwake(): void {
        this.txt.pos(Laya.stage.width >> 1, Laya.stage.height >> 1); //位置
        this.txt.size(500, 30); //大小
        this.txt.pivot(this.txt.width/2, this.txt.height/2); //轴心点
        this.txt.text = "大家好，欢迎各位开发者使用LayaAir IDE，这里是Text的文本内容，您可以基于此文本进行调试"; //文本内容
        this.txt.font = "宋体"; //字体
        this.txt.fontSize = 50; //字体大小
        this.txt.color = "#ff0000"; //字体颜色
        this.txt.bold = true; //加粗
        this.txt.italic = true; //斜体
        this.txt.underline = true; //下划线
        this.txt.underlineColor = "#ff0000"; //下划线颜色

        this.txt.stroke = 5; //描边宽度
        this.txt.strokeColor = "#000000" ; //描边颜色

        this.txt.wordWrap = true; //自动换行
        this.txt.leading = 20; //垂直行间距
        // this.txt.padding = [10, 10, 10, 10]; //文本边距

        this.txt.align = "center"; //水平对齐方式
        this.txt.valign = "top"; //垂直对齐方式

        this.txt.overflow = "visible"; //文本溢出

    }
}
```



下面再来看一个示例，这个是有关overflow属性中的滚动参数，如果文字超出了文本框，将其overflow属性设置为滚动，那么可以添加如下代码，实现通过鼠标拖拽显示超出的文字：

```typescript
const { regClass, property } = Laya;

let prevX = 0;
let prevY = 0;

@regClass()
export class UI_Text extends Laya.Script {

	constructor() {
		super();
	}

	@property({ type: Laya.Text })
	txt: Laya.Text;

	onAwake(): void {
		
		this.txt.text = 
			"Layabox是HTML5引擎技术提供商与优秀的游戏发行商，面向AS/JS/TS开发者提供HTML5开发技术方案！\n" +
			"Layabox是HTML5引擎技术提供商与优秀的游戏发行商，面向AS/JS/TS开发者提供HTML5开发技术方案！\n" +
			"Layabox是HTML5引擎技术提供商与优秀的游戏发行商，面向AS/JS/TS开发者提供HTML5开发技术方案！\n" +
			"Layabox是HTML5引擎技术提供商与优秀的游戏发行商，面向AS/JS/TS开发者提供HTML5开发技术方案！\n" +
			"Layabox是HTML5引擎技术提供商与优秀的游戏发行商，面向AS/JS/TS开发者提供HTML5开发技术方案！\n" +
			"Layabox是HTML5引擎技术提供商与优秀的游戏发行商，面向AS/JS/TS开发者提供HTML5开发技术方案！";
		this.txt.fontSize = 35;
		this.txt.size(400,150);
		this.txt.borderColor = "#fa1515";
		this.txt.overflow = "scroll";
		this.txt.on(Laya.Event.MOUSE_DOWN, this, this.startScrollText);
	}

	/* 开始滚动文本 */
	startScrollText() {

		prevX = this.txt.mouseX;
		prevY = this.txt.mouseY;

		Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.scrollText);
		Laya.stage.on(Laya.Event.MOUSE_UP, this, this.finishScrollText);
	}

	/* 停止滚动文本 */
	finishScrollText() {

		Laya.stage.off(Laya.Event.MOUSE_MOVE, this, this.scrollText);
		Laya.stage.off(Laya.Event.MOUSE_UP, this, this.finishScrollText);
	}

	/* 鼠标滚动文本 */
	scrollText() {

		let nowX = this.txt.mouseX;
		let nowY = this.txt.mouseY;

		this.txt.scrollX += prevX - nowX; //水平滚动距离 
		this.txt.scrollY += prevY - nowY; //垂直平滚动距离 

		prevX = nowX;//鼠标移动后，归位
		prevY = nowY;
	}

}
```

效果如下：

![1-8](img/1-8.gif)

（动图1-8）

这个示例说明，滚动与隐藏不同，它并没有把超出文本框的文字进行裁剪。

## 2. 代码创建Text

有时，不想让Text节点一开始就在舞台上，而是在要用的时候才添加，这就要通过代码来创建了。在Scene2D的属性设置面板中，增加一个自定义组件脚本，示例代码如下：

```typescript
const { regClass, property } = Laya;

@regClass()
export class NewScript extends Laya.Script {
    //declare owner : Laya.Sprite3D;

    constructor() {
        super();
    }

    /**
     * 组件被激活后执行，此时所有节点和组件均已创建完毕，此方法只执行一次
     */
    onAwake(): void {
        let txt = new Laya.Text();
        // 添加到舞台
        Laya.stage.addChild(txt);
        txt.pos(Laya.stage.width >> 1, Laya.stage.height >> 1); //位置
        txt.size(500, 30); //大小
        txt.pivot(txt.width/2, txt.height/2); //轴心点
        txt.text = "大家好，欢迎各位开发者使用LayaAir IDE，这里是Text的文本内容，本方法是代码创建Text"; //文本内容
        txt.wordWrap = true; //自动换行
    }
}
```

