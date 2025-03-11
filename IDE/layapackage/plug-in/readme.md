# 插件开发说明

## 一、插件能力

编辑器使用Electron框架开发，本质是对Chrome浏览器的封装。编辑器实际是一个HTML+JS+CSS制作的单页应用。但我们封装了大部分功能，所以游戏开发者和插件开发者都不需要学习HTML/CSS或者相关的前端框架。我们在开发插件时，需要使用编辑器提供的UI框架，一般不允许直接去修改编辑器的DOM结构。考虑到用户体验和兼容性，资源商店也一般不允许这类插件上架。

在项目的engine/types目录，有三个与编辑器插件开发相关的声明文件，editor.d.ts, editor-ui.d.ts, editor-env.d.ts，他们包含了大量编辑器的扩展API。

- editor.d.ts 是编辑器UI进程的API。常用的是全局对象Editor和IEditor命名空间下的类和接口。
- editor-env.d.ts 是场景场景进程的API。常用的是全局对象EditorEnv和IEditorEnv命名空间下的类和接口。
- editor-ui.d.ts 编辑器UI库。使用IEditorUI命名空间下的类和接口。

其中IEditor.utils/IEditorEnv.utils暴露了大量实用的工具函数，包括UUID生成，加密解密，ZIP压缩/解压，文件/目录拷贝/移动，HTTP请求，上传/下载等等。

开发者可以直接使用node模块，另外，IDE也内置了一些常用的npm库，例如sharp，glob，pinyin, @svgdotjs/svg.js等。

```typescript
//使用nodejs模块的方式
import fs from "fs";
import path from "path";
const sharp = window.require("sharp");
const glob = window.require("glob");
```



## 二、插件运行环境

编辑器是多进程体系，主要有三个进程：Main进程/UI进程/Scene进程。插件只能运行在UI进程和Scene进程。UI进程没有载入引擎库，也就是没有LayaAir引擎环境；Scene进程有LayaAir引擎环境，与UI通讯只能通过编辑器提供的异步通讯API。此外，插件脚本也可能在预览（含编辑器内预览和外部浏览器预览）中运行，它与Scene进程的区别是，预览进程中没有node环境。总结一下，插件脚本可能运行的环境有3种：

(1) UI进程：可直接使用node等本地模块，不可使用Laya引擎；

(2) Scene进程：可直接使用node等本地模块，可使用Laya引擎；

(3) 预览进程：不可使用node等本地模块，可使用Laya引擎；

如果插件脚本错误使用了当前环境中不存在的特性，脚本可能无法运行。例如，在一个Laya自定义组件脚本里使用node的fs模块去访问文件系统，会导致脚本在预览或者最终发布时运行报错。

为了脚本能在各种环境正确运行，开发者编写脚本时，需要自行在文件级别隔离这三种代码。比如，一个自定义面板的TS文件，不能引用Laya引擎，因为它是运行在UI进程里的。又比如，一个Laya.Script，不能使用fs，path等模块，因为它可能会运行在预览进程。但这两种需求也是常见的，应该怎么办？



### 2.1 在Laya.Script中使用本地能力

下面是一个推荐做法：

```TypeScript
//Script.ts
@Laya.regClass()
class Script extends Laya.Script {

    wantToUseNode() {
        EditorEnv.scene.runScript("TestSceneScript.visitNode");
    }
}

//TestSceneScript.ts
import fs from "fs";

//注意是IEditorEnv.regClass，不是Laya.regClass!!
@IEditorEnv.regClass()
class TestSceneScript {

    static visitNode() {
        fs.readFileSync(....)        
    }
}
```

> TestSceneScript.ts这个文件会在发布中被裁剪，因为它没有被Laya.Script直接引用。



### 2.2 UI进程脚本和Scene进程脚本通讯的方式

1、设置节点/组件属性后，场景里的节点/组件会自动刷新，无需代码。例如：

```TypeScript
//下面是UI进程代码

//获取选中的节点
let node = Editor.scene.getSelection()[0];

//修改节点属性，场景里的对象会自动同步，无需手动
node.props.x = 100;

//修改组件属性，场景里的对象会自动同步，无需手动
node.getComponent("MeshRenderer").props.enabled = false;
```



2、调用节点/组件的一个方法，并返回值。例如：

```TypeScript
//下面是UI进程代码

//获取选中的节点
let node = Editor.scene.getSelection()[0];

//调用MyScript组件里的test方法，传入参数abc
let ret = await Editor.scene.runNodeScript(node.id, node.getComponent("MyScript").id, "test", "abc");
console.log(ret);
```



3、自定义一个函数，并执行。例如：

```TypeScript
//下面是场景进程的代码

//注意：IEditorEnv.regClass是必须的
@IEditorEnv.regClass()
export class TestSceneScript {
    //注意：this是当前的IEditorEnv.IGameScene对象，如果不需要，也可以省略这个声明
    static test(this: IEditorEnv.IGameScene, msg: string) {
        console.log(msg); //hello
        
        return "ok";
    }
}
//下面是UI进程的代码

let ret = await Editor.scene.runScript("TestSceneScript.test", "hello");
console.log(ret); //ok
```

特别的用法，可以通过window对象调用eval执行脚本，用于一些简单的需求，例如：

```typescript
let str = await Editor.scene.runScript("window.eval", `
    (function() {
        //do something
        return "hello";
    }())
`);
```



4、场景进程向UI进程发送消息：

```typescript
//选中项目资源面板一个资源
EditorEnv.postMessageToPanel("ProjectPanel", "select", assetId);

//调用自定义的Panel的一个方法，并返回结果
let ret = await EditorEnv.sendMessageToPanel("MyPanel", "getResult");

//使用eval执行一些简单的脚本
let ret = await EditorEnv.runUIScript("window.eval", `
    (function() {
        //do something
        return "hello";
    }())
`);
```



### 2.3 预览运行进程和UI进程的通讯方式

1、预览运行进程调用UI进程的脚本：

```typescript
let EditorClient = (<any>window).EditorClient;
EditorClient.postMessageToPanel("ProjectPanel", "select", assetId);

//调用自定义的Panel的一个方法，并返回结果
let ret = await EditorClient.sendMessageToPanel("MyPanel", "getResult");

//使用eval执行一些简单的脚本
let ret = await EditorClient.runUIScript("window.eval", `
    (function() {
        //do something
        return "hello";
    }())
`);
```



2、 UI进程调用预览运行进程的脚本：

```typescript
//下面是游戏的逻辑代码

@Laya.regClass()
export class TestGameScript {
    static test(msg: string) {
        console.log(msg); //hello
        
        return "ok";
    }
}

//下面是UI进程的代码

//这里用runScriptMax而不是runScript，因为在播放状态下，runScript依然会发送到源场景，而不是正在播放的场景
let ret = await Editor.scene.runScriptMax("TestGameScript.test", "hello");
console.log(ret); //ok
```

编辑器实现脚本隔离的机制是将脚本编译成三个js，bundle.js包含可以在预览环境，也就是在浏览器可以运行的版本；bundle.editor.js是在UI进程运行的脚本；bundle.scene.js是在Scene进程的脚本。这个机制是自动的，但开发者需了解这个机制的运作方式：

1、所有含有@Laya.regClass装饰器的脚本会编译进bundle.js和bundle.scene.js。注意，这里指的“所有”，仅限于Debug版本。在release版本的bundle.js里，只会包含有被场景引用的脚本。bundle.scene.js不会出现在发布版本中。

2、所有含有@IEditorEnv.regClass装饰器的脚本会编译进bundle.scene.js。这个js只在编辑器内部运行，可以放心使用node能力。

3、所有含有@IEditor.xxx装饰器的脚本会编译进bundle.editor.js。这个js只运行在UI进程，可以放心使用node能力，但如果引用Laya的类会报错。

虽然这种识别机制能够解决标记不同脚本使用用途的问题，但还是建议开发者自行用目录方式进行隔离。例如将UI进程运行的脚本放入到editor名称的目录，将只在编辑器内运行的脚本放入到scene名称的目录，这样维护起来会更清晰。



## 三、制作编辑器UI

LayaAirIDE提供了开发编辑器UI的可视化编辑器。在`项目资源`面板的菜单里，新建一个`编辑器界面预制体`，例如MyWidget.widget。建议将此类预制体放置到editorResources目录或其子目录。

> editorResources目录是一个LayaAirIDE里约定名称的特殊目录，它和resources的特性类似，也就是无论它放在多深的子目录下，资源的路径都可以从editorResources开始。例如一个资源位于”/MaDaHa/v1/editoResources/a/b.png“，在引用资源时可以直接填写”editorResources/a/b.png“，而不用理会前面的”MaDaHa/v1/“。
>
> 这在插件体系中是很重要的，因为在开发插件时，插件开发者无法确定用户使用时会将插件资源放置在什么目录下，只能确定用户不会破坏插件内部的目录结构。
>
> resources目录里具有相同的特性，差别在于，resources目录在发布时会拷贝到发布目录里，但editorResources则永远不会。

双击打开MyWidget.widget，使用内置UI编辑器制作好插件需要的UI界面。

![3-1](img/3-1.png)

以面板为例，代码里载入该预制体的方法为：

```TypeScript
@IEditor.panel("Test")
export class MyPanel extends IEditor.EditorPanel {
    async create() {
        this._panel = await gui.UIPackage.createWidget("editorResources/UI/MyWidget.widget");
        let input: gui.TextInput = this._panel.getChild("TextInput").getChild("title");
        input.on("changed", () => {
            console.log("改变了！");
        })
    }
}
```



## 四、程序化生成界面

### 4.1 常用方法

除了使用UI编辑器制作界面，也可以使用代码的方式去创建一些常用的UI组件，它们在IEditor.GUIUtils。

```typescript
export interface IGUIUtils {
    /**
     * 编辑器默认的背景颜色
     */
    bgColor: gui.Color;
    /**
     * 编辑器默认的分割线颜色
     */
    lineColor: gui.Color;
    /**
     * 编辑器默认的文字颜色
     */
    textColor: gui.Color;

    createButton(autoSize?: boolean): gui.Button;
    createIconButton(flat?: boolean): gui.Button;
    createCheckbox(autoSize?: boolean): gui.Button;
    createIconCheckbox(flat?: boolean): gui.Button;
    createRadio(): gui.Button;
    createComboBox(): gui.ComboBox;
    createTextInput(): TextInput;
    createTextArea(): TextArea;
    createSearchInput(): SearchInput;
    createNumericInput(): NumericInput;
    createColorInput(): ColorInput;
    createGradientInput(): GradientInput;
    createCurveInput(): CurveInput;
    createResourceInput(): ResourceInput;
    createNodeRefInput(): NodeRefInput;
    createProgressBar(): gui.ProgressBar;
    createSlider(): gui.Slider;
    createListItem(): ListItem;
    createIconListItem(): ListItem;
    createCheckboxListItem(): ListItem;
    createCheckboxIconListItem(): ListItem;
    
    createInspectorPanel(): InspectorPanel;
}
```



### 4.2 示例

例如要动态创建一个按钮，可以用以下代码。

```typescript
let button = IEditor.GUIUtils.createButton();

//它实现的功能其实和以下代码是相同的，只是更加简洁
//let button = gui.UIPackage.createWidgetSync("~/ui/basics/Button/Button.widget");
```

IEditor.InspectorPanel是一个通过配置生成界面的通用界面类，下面举一个例子，完全通过配置方式生成一个面板

```typescript
@IEditor.panel("Test")
export class MyPanel extends IEditor.EditorPanel {
    private _data : any;
    declare _panel : IEditor.InspectorPanel;
    async create() {
        this._panel = IEditor.GUIUtils.createInspectorPanel();
        
        Editor.typeRegistry.addTypes([
            {
                name : "MyPanelType", //请注意，名字是全局唯一的，一定要长
                properties : [
                    { name : "text", type : "string" },
                    { name : "count" , type: "number" },
                    { name : "actions", inspector: "Buttons",
                        options : { buttons : [ { caption : "点我", event: "my_click" } ] }
                    }
                ]
             }
        ]);
        
        this._panel.allowUndo = true; //根据需要设置
        //如果不需要undo功能，也可以直接this._data = {};
        this._data = IEditor.DataWatcher.watch({}); 
        
        //inspect可以多次调用，将多个数据组合在一个面板编辑
        this._panel.inspect(this._data, "MyPanelType");
        
        this._panel.on("my_click", ()=> {
            alert("hello");
        });
    }
} 
```

执行效果如下：

![4-1](img/4-1.png)

如果不需要顶部的'My Panel Type'栏目显示，可以稍微修改代码，加入以下红字：

```typescript
{
    name : "MyPanelType",
    catalogBarStyle: "hidden",
    properties : [
       ....
    ]
 }
```

效果如下：

![4-2](img/4-2.png)

配置方式可以生成非常复杂的界面，它不但可以用于制作单一的面板，也可以嵌入到其他UI中。例如，在UI编辑器制作界面时中拖入InspectorPanel预制体（它放在"editor-widgets/baisc/Inspector/InspectorPanel.widget），然后在代码里通过getChild获得的Widget对象类型则自动为IEditor.InspectorPanel，然后可以通过上述的API（inspect等）进行填充。

> 类型和属性定义语法请参考[文档](../../../basics/common/Component/readme.md)。



## 五、自定义Inspector字段编辑界面

当我们编写一个组件，并暴露某些字段到IDE编辑后，有时希望能够自定义某个字段的编辑界面，可以通过以下步骤：

1、编写一个InspectorField

 ```TypeScript
@IEditor.inspectorField("MyTestField")
export class TestField extends IEditor.PropertyField {
    @IEditor.onLoad
    static async onLoad() {
        await gui.UIPackage.resourceMgr.load("MyField.widget");
    }
    
    create() {
        let input = gui.UIPackage.createWidgetSync("MyField.widget");

        return { ui: input };
    }
    
    refresh() {
        //这里负责将数据设置到界面上
    }
}
 ```

MyTestField是注册的名字，实际应用需要保证不要和其他人取的名字冲突，所以建议取"com.layabox.test"这样的名字。

InspectorField的create方法是同步的，所以这里不能用createWidget，而需要用createWidgetSync。这需要确保预制体在创建之前已经载入。所以这里使用了一个IEditor.onLoad的回调用于提前载入资源。



2、设置字段的inspector属性为刚才取的名字，这里为MyTestField

 ```TypeScript
@Laya.regClass()
export class Script extends Laya.Script {
     @property({ type : Laya.Node, inspector: "MyTestField" })
     public node: Laya.Node;
}
 ```



3、实际效果：

<img src="img/5-1.png" alt="5-1" style="zoom:50%;" />



## 六、自定义面板

可以通过以下方式给编辑器增加一个面板

```TypeScript
@IEditor.panel("test", {
    title: "Test",
    icon : "editorResources/20230710-161955.png"
})
export class TestPanel extends IEditor.EditorPanel {

    async create() {
        this._panel = await gui.UIPackage.createWidget("MyPanel.widget");
    }
}
```

效果如下图：

<img src="img/6-1.png" alt="6-1" style="zoom:50%;" />



## 七、使用对话框

可以通过以下方式创建一个弹出的对话框：

```TypeScript
//MyDialog.ts
export class MyDialog extends IEditor.Dialog {
    async create() {
        this.contentPane = await gui.UIPackage.createWidget("MyDialog.widget");
    }
    
    onShown() {
    }
    
    onHide() {
    }
}
```

在编辑器内，所有对话框都是单例。显示这个对话框的方式为：

```TypeScript
import { MyDialog } from "./MyDialog";

Editor.showDialog(MyDialog, null);
```



## 八、扩展内置菜单

支持对编辑器现有菜单的扩展。如以下代码，在应用程序菜单栏的工具菜单下，新增了一个test的菜单，并且点击菜单会调用test函数。

```TypeScript
class AnyName {
    @IEditor.menu("App/tool/test")
    static test() {
        console.log("click menu");
    }
}
```

menu的第一个参数表示菜单的路径，路径用"/"分隔，"App/tool/test"表示App菜单下的tool子菜单的test子项。注意这里的路径使用的是ID，不是菜单显示的文字。编辑器内部支持扩展的所有菜单名称和它的子菜单可以通过下面的方法打印出来参考：

<img src="img/8-1.png" alt="8-1" style="zoom:50%;" />

menu方法的第二个参数是可选参数，通过它可以进行一些额外的配置。例如：

```TypeScript
class AnyName {
    @IEditor.menu("App/tool/test", { position: "before openDevTools" } )
    static test() {
        console.log("click menu");
    }
}
```

通过position选项可以设置这个新加的test菜单显示在原有菜单“打开开发者工具 - 编辑器"的前面，而不是默认加到最后。

常用的选项有：

`position` :  设置菜单的位置，支持的语法: "first" / "last" / "before ids" / "after ids" / "beforeGroup ids" / "afterGroup ids"。

> "before"和"beforeGroup"的区别是，"before"是插入到参考菜单的前面，而"beforeGroup"是插入到参考菜单前面最近的一个分割线之前。
>
> "after"和"afterGroup"的区别是，"after"是插入到参考菜单的后面，而"afterGroup"是插入到参考菜单后面最近的一个分割线之后。
>
> 在同一个类的扩展定义里，默认是添加到上一个扩展的菜单的后面。如果不在同一个类里，不指定position则默认添加到菜单的最后面。
>
> 多个参考菜单的id值用逗号分隔。

`checkbox` :  设置菜单为一个可以打勾的效果。

`sepBefore` : 在此菜单之前显示一条分割线。

`sepAfter`: 在此菜单之后显示一条分割线。

`enableTest` : 给定返回布尔值的一个函数，在菜单显示之前会执行此函数，用于决定菜单的激活（变灰）状态。**App菜单不支持。**

`visibleTest`: 给定返回布尔值的一个函数，在菜单显示之前会执行此函数，用于决定菜单的显隐状态。仅调用show方法弹出的菜单有效。**App菜单不支持。**

`checkedTest`：给定返回布尔值的一个函数，在菜单显示之前会执行此函数，用于决定菜单的显隐状态。**App菜单不支持。**

下面的例子演示了enableTest的用法。这个新加的菜单， 如果场景中没有选中的物体，则会显示变灰并且无法触发点击回调。

```TypeScript
class AnyName {
    static testEnable() {
        return Editor.scene.getSelection().length > 0;
    }
    
    @IEditor.menu("Hierarchy/test", { enableTest: ()=> AnyName.testEnable() } )
    static test() {
        console.log("click menu");
    }
}
```



## 九、创建菜单

可以创建新菜单，并用代码控制弹出。方法为：

```TypeScript
let menu = IEditor.Menu.create([ 
    { label: "test" , click : function() { console.log("clicked"); } }
 ]);

//当需要弹出时
menu.show();
```

菜单也支持级联，并且不限层数。例如：

```TypeScript
IEditor.Menu.create([ 
    { 
        label: "test" , 
        submenu: [ 
            { label : "a" },
            { 
                label : "b",
                submenu : [
                    { label : "c" }
                ]
            }
        ]
    }
 ]);
```

可以给菜单指定一个ID，通过ID引用菜单。但要注意ID值不要和编辑器内置的菜单或者其他人的菜单的ID冲突。

```TypeScript
IEditor.Menu.create("MyTestMenu", [ 
    { label: "test" , click : function() { console.log("clicked"); } }
 ]);
 
 //当需要弹出时
 IEditor.Menu.getById("MyTestMenu").show();
```



## 十、在场景视图中绘制形状以及交互式手柄

使用IEditorEnv.Gizmos/IEditorEnv.Handles/IEditorEnv.Gizmos2D提供的接口，在场景视图中绘制形状和交互式手柄。假设我们已经有一个自定义的组件Script1，通过IEditorEnv.customEditor这个装饰器，给Script1绑定一个CustomEditor脚本，以实现在编辑器内的自定义编辑。

```TypeScript
//Script1.ts

@regClass()
export class Script1 extends Laya.Script {
    declare owner : Laya.Sprite3D;
}
//TestCustomEditor.ts

@IEditorEnv.customEditor(Script1)
export class TestCustomEditor extends IEditorEnv.CustomEditor {
    declare owner: Laya.Sprite3D;

    onSceneGUI(): void {
        IEditorEnv.Handles.drawHemiSphere(this.owner.transform.position, 2);
    }
    
    onDrawGizmos(): void {
        IEditorEnv.Gizmos.drawIcon(this.owner.transform.position, "editorResources/UI/ready1.png");
    }
}
```

实现效果如下：

![10-1](img/10-1.png)

2D的实现方式有所不同，它必须通过IEditorEnv.Gizmos2D接口，并且目前只支持onDrawGizmosSelected事件，不支持onDrawGizmos和onSceneGUI事件。

以下是2D的一个例子：

```TypeScript
@IEditorEnv.customEditor(Script2)
export class TestCustomEditor extends IEditorEnv.CustomEditor {
    private _c: IEditorEnv.IGizmoCircle;

    onDrawGizmosSelected(): void {
        if (!this._c) {
            let manager = IEditorEnv.Gizmos2D.getManager(this.owner);
            this._c = manager.createCircle(10);
            this._c.fill("#ff0");
        }
        this._c.setLocalPos(10, 10);
    }
}
```

实现效果如下：

![10-2](img/10-2.png)



## 十一、自定义配置

插件开发者可以自定义一些配置数据，这些数据可以保存到文件，也可以只保存在内存中。例如：

```typescript
@IEditor.onLoad
static onLoad() {
    //注意这里面的属性不要使用到Laya引擎里的类型，比如Vector3这些，是不可以的
    Editor.typeRegistry.addTypes([
        {
            name: "MyTestSettingsType",
            properties: [
                {
                    name: "option1",
                    type: "boolean",
                    default: true
                },
                {
                    name: "option2",
                    type: "string",
                    default: "",
                }
            ]
        }
    ]);
    Editor.extensionManager.createSettings("MyTestSettings", "project", "MyTestSettingsType");
}
```

createSettings的第一个参数是这个配置的名称，它是全局的，请取一个不会和其他人冲突的名字。第二个参数是配置数据放置的地方，可选的值为：

- project : 保存到路径“项目/settings”。这是一个项目所有成员共享的配置文件放置位置。保存的文件名是"plugin-配置名称.json”，plugin前缀使用户能够清晰地分辨出这是第三方插件创建的配置文件。

- local: 保存到路径“项目/local"。这是IDE使用者对项目的个性设置。这里的文件通常不建议项目成员间共享。
- application: 保存到系统的用户数据目录。这是IDE使用者对IDE的个性设置，它应该是和具体项目不相关的。
- memory：仅存在于内存中，不会保存到文件。

第三个参数是类型名称，对应上面addTypes的操作。如果类型名称和配置名称一致，第三个参数也可以省略。

配置创建后，UI进程可以通过Editor.getSettings访问配置数据，然后进行读写，例如：

```typescript
let data = Editor.getSettings("MyTestSettings").data;
data.option2 = "hello";
```

配置是自动载入和保存的，无需手动操作。

场景进程可以通过EditorEnv.getSettings访问配置数据，**但是是只读的，无法修改**。而且因为是跨进程，所以要获得最新的数据，要先调用sync，例如：

```typescript
let settings = EditorEnv.getSettings("MyTestSettings");
await settings.sync();
console.log(settings.data.option2); //hello
```



## 十二、扩展编辑器配置界面

如果我们通过上一节创建了一些自定义的配置数据，可以将它展现在项目配置界面，或者首选项界面让用户修改。例如：

```typescript
@IEditor.panel("TestSettings", { usage: "project-settings", title: "测试" })
export class TestSettings extends IEditor.EditorPanel {
    async create() {
        let panel = IEditor.GUIUtils.createInspectorPanel();
        panel.inspect(Editor.getSettings("MyTestSettings").data, "MyTestSettings");
        this._panel = panel;
    }
}
```

@IEditor.panel这个装饰器在“六、使用面板”中已经介绍过，这里不再赘述，唯一不同的是usage这个选项的设置。usage可以取的值有：

- project-settings: 显示在项目配置界面
- build-settings：显示在构建发布界面
- preference: 显示在首选项界面

上述代码的显示效果为：

<img src="img/12-1.png" alt="12-1" style="zoom:80%;" />



## 十三、扩展构建流程

构建流程除了在界面中启动外，也可以通过API调用，下面的例子演示了通过一个自定义菜单启动构建任务:

```typescript
class Abc {
    IEditor.menu("App/my/build")
    static build() {
        IEditor.BuildTask.start("web");
    }
}
```

在场景进程也可以手动启动构建任务：

```typescript
IEditorEnv.BuildTask.start("web");
```

通过构建插件定制插件流程，构建插件的接口是IBuildTask。IBuildTask的定义为：

```typescript
export interface IBuildPlugin {
    /**
     * 构建任务初始化时。可以在这个事件里修改config和platformConfig等配置。
     * @param task 
     */
    onSetup?(task: IBuildTask): Promise<void>;

    /**
     * 构建任务开始。可以在这个事件里在初始化目标目录的结构，或者进行必要的检查和安装等。
     * @param task
     */
    onStart?(task: IBuildTask): Promise<void>;

    /**
     * 正在收集需要发布的资源。assets集合是系统根据依赖、resources目录规则等所有有效的规则收集的所有需要发布的资源对象，你可以额外向集合添加资源对象。
     * @param task 
     * @param assets 
     */
    onCollectAssets?(task: IBuildTask, assets: Set<IAssetInfo>): Promise<void>;

    /**
     * 正在导出资源。exportInfoMap包含了导出资源的信息，包括保存的位置等信息。可以修改outPath自定义资源的输出位置。
     * @param task 
     * @param exportInfoMap 
     */
    onBeforeExportAssets?(task: IBuildTask, exportInfoMap: Map<IAssetInfo, IAssetExportInfo>): Promise<void>;

    /**
     * 导出资源完成。如果开发者需要添加自己的文件，或者及进行压缩等操作，可以在这个事件里处理。
     * @param task 
     * @param exportInfoMap 
     */
    onAfterExportAssets?(task: IBuildTask): Promise<void>;

    /**
     * 构建已经完成，可以在这个事件生成一些清单文件，配置文件等。
     */
    onCreateManifest?(task: IBuildTask): Promise<void>;

    /**
     * 如果有原生的构建流程，在这里处理。
     * @param task 
     */
    onCreatePackage?(task: IBuildTask): Promise<void>;

    /**
     * 构建任务完成事件。
     * @param task 
     */
    onEnd?(task: IBuildTask): Promise<void>;
}
```

所有钩子函数都是可选的，可以根据需要实现需要的逻辑。需要通过IEditorEnv.regBuildPlugin装饰器注册插件。下面的例子演示了怎样在web这个平台构建时，手动添加一个参加构建的资源。

```typescript
@IEditorEnv.regBuildPlugin("web")
class MyBuildPlugin implements IEditorEnv.IBuildPlugin {
    async onCollectAssets(task : IEditorEnv.IBuildTask, assets: Set<IAssetInfo>) {
        let myAsset = ...
        assets.add(myAsset);
        
        //在发布插件里，需要使用task.logger输出日志
        task.logger.debug("add my asset");
    }
}
```

如果需要构建插件在所有平台都生效，那么regBuildPlugin的第一个参数可以传递"*"。regBuildPlugin的第二个参数可以传递一个优先级的数值，优先级越大，构建时这个插件会被更早的调用。

在插件中经常会用到的一些工具方法有：

（1）使用task.logger接口记录日志；

（2）使用IEditorEnv.utils.renderTemplateFile渲染模版文件，使用的是mustache库；

（3）使用task.mergeConfigFile合并配置文件。即，如果在内置模版目录和项目模版目录(build-templates)有相同路径和名字的json格式的配置文件，通过此方法可以将他们合并；

（4）使用IEditorEnv.utils.intallCli安装公共的一些cli包，它将安装在library/cli-package下。例如：

```typescript
await IEditorEnv.utils.installCli("@oppo-minigame/cli", options);
```

（5）使用IEditorEnv.utils.exeCli执行npm/npx或者使用installCli安装的cli。例如：

```typescript
await IEditorEnv.utils.exeCli("npm", ["install"], options);

await IEditorEnv.utils.exeCli("quickgame", args, options); //假设quickgame已通过installCli安装
```

（6)  使用IEditorEnv.utils.exec执行任意本地命令。

（7） 使用IEditorEnv.utils.downloadFile下载文件。

（8）使用IEditorEnv.utils.ZipFileR解压文件。

可以扩展构建选项面板，添加一些自定义的参数，如“自定义面板”一节中描述那样，我们将面板的usage设置为“build-settings"即可。

```typescript
@IEditor.panel("TestBuildSettings", { usage: "build-settings", title: "测试" })
export class TestBuildSettings extends IEditor.EditorPanel {
@IEditor.onLoad
    static start() {
        Editor.typeRegistry.addTypes([
            {
                name: "MyBuildSettings",
                catalogBarStyle : "hidden",
                properties: [
                    {
                        name: "option1",
                        type: "boolean",
                        default: true
                    },
                    {
                        name: "option2",
                        type: "string",
                        default: "2332",
                    }
                ]
            }
        ]);
        Editor.extensionManager.createSettings("MyBuildSettings", "project");
    }

    async create() {
        let panel = IEditor.GUIUtils.createInspectorPanel();
        panel.allowUndo = true;
        panel.inspect(Editor.getSettings("MyBuildSettings").data, "MyBuildSettings");
        this._panel = panel;
    }
}
```

效果如下：

![13-1](img/13-1.png)

在构建插件中可以通过Settings机制访问这些参数，例如：

```typescript
@IEditorEnv.regBuildPlugin("web")
class MyBuildPlugin implements IEditorEnv.IBuildPlugin {
    async onSetup(task : IEditorEnv.IBuildTask) {
        let mySettings = EditorEnv.getSettings("MyBuildSettings");
        await mySettings.sync();
        
        task.logger.debug(mySettings.data.option1);
    }
}
```



## 十四、自定义发布目标平台

可以通过插件给IDE新增一个发布目标平台。例如：

```typescript
Editor.extensionManager.createBuildTarget("test",  //平台的唯一id，不能冲突
{ 
    caption: "自定义平台", //目标名称
    settingsName:"MyBuildPlatformtSettings", //需要先用Edition.extensionManager.createSettings注册
    inspector: "TestBuildSettings"  //一个usage为build-settings的面板
    templatePath : "editorResources/testTemplate" //可选的一个参数，指定的目录内放置构建模版文件，构建时将会自动拷贝到输出目录
});
```

以下是一个完整的实例：

```typescript
@IEditor.panel("TestBuildSettings", { usage: "build-settings", title: "测试" })
export class TestBuildSettings extends IEditor.EditorPanel {
    @IEditor.onLoad
    static start() {
        Editor.typeRegistry.addTypes([
            {
                name: "MyTestSettings2",
                catalogBarStyle : "hidden",
                properties: [
                    {
                        name: "option1",
                        type: "boolean",
                        default: true
                    },
                    {
                        name: "option2",
                        type: "string",
                        default: "2332",
                    }
                ]
            }
        ]);
        Editor.extensionManager.createSettings("MyBuildPlatformtSettings", "project");
        Editor.extensionManager.createBuildTarget("test", { caption: "自定义平台", settingsName:"MyTestSettings2", inspector: "TestBuildSettings" });
    }

    async create() {
        let panel = IEditor.GUIUtils.createInspectorPanel();
        panel.allowUndo = true;
        panel.inspect(Editor.getSettings("MyBuildPlatformtSettings").data, "MyBuildPlatformtSettings");
        this._panel = panel;
    }
}
```

效果如下：

![14-1](img/14-1.png)

在场景进程中，需要添加一个或者多个构建插件，用于这个新的自定义平台。

```typescript
@IEditorEnv.regBuildPlugin("test")
export class TestBuildPlugin implements IEditorEnv.IBuildPlugin {

    async onCreatePackage(task: IEditorEnv.IBuildTask) {
        //这里platformConfig，对应的是MyBuildPlatformtSettings，不需要自行再getSettings
        task.logger.info(task.platformConfig.option2);
    }
}
```

构建完成后，如果需要支持“运行”，构建插件需要定义runHandler。下面这个例子演示了通过Web访问构建后的内容，Web站的根目录就是构建的目标目录，所以传入了一个空串，如果是子目录，可以传入子目录的路径。

```typescript
@IEditorEnv.regBuildPlugin("test")
export class TestBuildPlugin implements IEditorEnv.IBuildPlugin {

    async onCreatePackage(task: IEditorEnv.IBuildTask) {
        task.config.runHandler = {
            serveRootPath : ""
        };
    }
}
```



## 十五、资源导入预处理和后处理

我们有时候需要在导入资源的时候做一些自动化处理，比如导入图片时自动设置为精灵纹理，设置压缩格式等，这时可以使用IAssetProcessor接口，接口的定义如下：

```typescript
export interface IAssetProcessor {
    //在图片资源被导入前调用
    onPreprocessImage?(assetImporter: IImageAssetImporter): void | Promise<void>;
    //在任意类型资源被导入前调用
    onPreprocessAsset?(assetImporter: IAssetImporter): void | Promise<void>;

    //在图片资源被导入后调用
    onPostprocessImage?(assetImporter: IImageAssetImporter): void | Promise<void>;
    //在任意类型资源被导入后调用
    onPostprocessAsset?(assetImporter: IAssetImporter): void | Promise<void>;
}
```

实现IAssetProcessor接口的类需要通过装饰器IEditorEnv.regAssetProcessor注册。以下是一个AssetProcessor的简单例子，它把类型不是精灵纹理的图片都设置为压缩格式。

```typescript
@IEditorEnv.regAssetProcessor()
export class TestAssetProcessor implements IEditorEnv.IAssetProcessor {
    onPreprocessImage(assetImporter: IEditorEnv.IImageAssetImporter): void | Promise<void> {
        if (assetImporter.config.textureType != 2) {
            assetImporter.config.platformDefault = { format: 10 };
        }
    }
}
```

> (1)可以使用assetImporter.isNew区分是否是新增加的资源；
>
> (2)增加或者修改IAssetProcessor后，资源库没有自动为现有资源重新执行脚本的行为。需要用户自己使用资源库的右键菜单“重新导入”。当然也可以通过插件代码重新导入：EditorEnv.assetMgr.importAsset(asset).



## 十六、国际化支持

使用LayaAirIDE提供的接口，可以实现插件界面国际化以及插件代码里输出的信息国际化。首先我们需要一个新建一个配置文件，如果这个配置是用于界面国际化，请将它新建在你的所有界面文件所在的目录或上级目录。

<img src="img/16-1.png" alt="16-1" style="zoom:50%;" />

<img src="img/16-2.png" alt="16-2" style="zoom:50%;" />

**标识**：国际化配置文件的唯一标识，自动生成，不可修改（如果确实要修改，可以用文本方式打开配置文件直接修改，但需要自行保证唯一。但修改后已经在界面上绑定的会全部丢失）。

**使用范围：**运行时或编辑器扩展。运行时表示用于游戏（暂不支持）。目前我们选择编辑器扩展，即在插件界面中使用。

**默认语言ID**：通过可视化方式制作编辑器预制体时，在界面设计时使用的文本语言。举例，如果你用中文制作界面，那这里就是zh-CN，如果你用英文制作界面，那这里是en，等等。如果这里设定的语言与运行时的语言一致，那么将直接使用界面上的文本，不会使用翻译文件进行替换。

**后备语言ID**：如果找不到匹配运行时语言的翻译文件，就会使用后备语言ID继续进行匹配。例如，如果运行时语言是德语，而翻译文件里没有德语（de）的翻译文件，就会使用后备语言ID（en）的翻译文件。

**翻译参考**：一般用于自动收集界面上的文字，形成一个参考文件。然后用这个参考文件去翻译成各种语言，再添加到翻译文件列表中。参考文件不需要添加到翻译文件列表中，因为参考文件内的文字都是界面上现存的。

**收集文本：**点击后，将分析配置文件所在目录和子目录下的所有预制体文件，收集所有需要翻译的文字到参考文件中，并将这些文本转换为国际化的格式。如果参考文件未设定，则会自动生成一个。

**同步**：当重新收集文本后，点击同步，可以使所有翻译文件的条目与参考文件匹配。例如，如果界面上新建了一个文本“abc”，点击收集文本后，参考文件将增加一个条目“abc"。点击同步后，所有翻译文件都会增加一个条目"abc"。

除了自动收集界面上的文字，我们也可以手动设定，例如一个按钮的标题：

<img src="img/16-3.png" alt="16-3" style="zoom:80%;" />

点击右上角的按钮，将弹出界面：

<img src="img/16-4.png" alt="16-4" style="zoom: 50%;" />

在这里可以选择，或者新建语言文件中的条目。选择一项后，输入框更新显示为：

<img src="img/16-5.png" alt="16-5" style="zoom:50%;" />

绿色的横条显示着翻译文件的键值，表示这个文本已经国际化。

**界面国际化后，语言的适配是全自动的，无需代码干预。**



除了界面国际化，代码输出的信息也需要国际化。通常我们建议使用另外的配置文件，不要和界面使用的配置文件混淆。我们新建一个国际化配置：

<img src="img/16-6.png" alt="16-6" style="zoom:50%;" />

这里只要手动创建多个翻译文件，拖入到翻译文件列表中就可以了。这些文件的键值需要自行同步。

翻译参考功能可以忽略，因为无需从界面上收集。

![16-7](img/16-7.png)

代码里使用的方式为：

```typescript
myI18n: gui.Translations;

@IEditor.onLoad
async onLoad() {
    myI18n = await gui.UIPackage.resourceMgr.load("editorResources/i18nSettings.i18ns");
}

test() {
    console.log(myI18n.t("a"));
}
```

在很多情况下，如果只是代码里用到的一些小量国际化的支持，并不想创建多个json文件，那么也有全代码的方法。

```typescript
//第一个参数需要全局唯一
let myI18n = gui.Translations.create("LodSimplify");
myI18n.setContent("zh-CN", {
    meshRate : "模型压缩比例",
    meshRateTips : "根据设置的比例对模型网格进行压缩2x"
});

Editor.typeRegistry.addTypes([
{
    name: "LodSimplifyData",
    properties: [
        {
            name: "meshRate",
            type : "number",
            caption: myI18n.t("meshRate", "Mesh Rate"),
            tips: myI18n.t("meshRateTips", "Compress the model mesh based on the set ratio."),
        }
     ]
 }
```

可以多次调用setContent添加不同语言的翻译，下面的例子添加了语言en的翻译，所以在应用t函数时可以省略默认值。

```typescript
//第二个参数是备用语言ID，默认是en，所以在这里是可以省略不写的
let myI18n = gui.Translations.create("LodSimplify", "en");
myI18n.setContent("zh-CN", {
    meshRate : "模型压缩比例",
    meshRateTips : "根据设置的比例对模型网格进行压缩2x"
}).setContent("en", {
    meshRate: "Mesh Rate2",
    meshRateTips: "Compress the model mesh based on the set ratio."
});

Editor.typeRegistry.addTypes([
{
    name: "LodSimplifyData",
    properties: [
        {
            name: "meshRate",
            type : "number",
            caption: myI18n.t("meshRate"),
            tips: myI18n.t("meshRateTips"),
        }
     ]
 }
```



## 十七、命令行支持

### 17.1 启动编辑器

下载LayaAir-IDE后，在本地环境变量中添加Path，如图17-1所示，其中`D:\Program Files\LayaAirIDE`为安装路径，

![17-1](img/17-1.png)

（图17-1）

然后打开命令行窗口，即可在终端中启动IDE，命令为：

```
> LayaAirIDE --project=/path/to/project
```

**--project:**  要打开的项目路径（全路径）。例如，在`C:\Users\ASUS\Desktop\LayaProject`有一个LayaAir项目，在终端中输入`LayaAirIDE --project=C:\Users\ASUS\Desktop\LayaProject`即可打开该项目，如图17-2所示。

![17-2](img/17-2.png)

（图17-2）



### 17.2 执行脚本

还可以在终端中输入命令，并在后台执行脚本，命令为：

```
> LayaAirIDE --project=/path/to/project --script=MyScript.buildWeb
```

**--project:**  项目路径（全路径）。

**--script:** 指定执行的脚本文件。

例如，在项目中添加`MyScript.ts`脚本文件，并添加如下代码，然后就可以使用命令`LayaAirIDE --project=C:\Users\ASUS\Desktop\LayaProject --script=MyScript.buildWeb`构建Web平台，如图17-3所示。后台脚本执行结束后，后台进程会自动退出。

```typescript
@IEditorEnv.regClass()
class MyScript {
    static async buildWeb() {
        return IEditorEnv.BuildTask.start("web").waitForCompletion();
    }
}
```

![17-3](img/17-3.png)

（图17-3）

下面给出各平台的发布脚本，

```typescript
@IEditorEnv.regClass()
class MyScript {
    // 构建web
    static async buildWeb() {
        return IEditorEnv.BuildTask.start("web").waitForCompletion();
    }

    // 构建微信小游戏
    static async buildWxgame() {
        return IEditorEnv.BuildTask.start("wxgame").waitForCompletion();
    }

    // 构建抖音小游戏
    static async buildBytedancegame() {
        return IEditorEnv.BuildTask.start("bytedancegame").waitForCompletion();
    }

    // 构建oppo小游戏
    static async buildOppogame() {
        return IEditorEnv.BuildTask.start("oppogame").waitForCompletion();
    }

    // 构建vivo小游戏
    static async buildVivogame() {
        return IEditorEnv.BuildTask.start("vivogame").waitForCompletion();
    }

    // 构建小米快游戏
    static async buildXmgame() {
        return IEditorEnv.BuildTask.start("xmgame").waitForCompletion();
    }

    // 构建支付宝小游戏
    static async buildAlipaygame() {
        return IEditorEnv.BuildTask.start("alipaygame").waitForCompletion();
    }

    // 构建淘宝小游戏
    static async tbgame() {
        return IEditorEnv.BuildTask.start("tbgame").waitForCompletion();
    }
}
```

对应的终端命令为：

```
// 构建web
>LayaAirIDE --project=C:\Users\ASUS\Desktop\LayaProject --script=MyScript.buildWeb
// 构建微信小游戏
>LayaAirIDE --project=C:\Users\ASUS\Desktop\LayaProject --script=MyScript.buildWxgame
// 构建抖音小游戏
>LayaAirIDE --project=C:\Users\ASUS\Desktop\LayaProject --script=MyScript.buildBytedancegame
// 构建oppo小游戏
>LayaAirIDE --project=C:\Users\ASUS\Desktop\LayaProject --script=MyScript.buildOppogame
// 构建vivo小游戏
>LayaAirIDE --project=C:\Users\ASUS\Desktop\LayaProject --script=MyScript.buildVivogame
// 构建小米快游戏
>LayaAirIDE --project=C:\Users\ASUS\Desktop\LayaProject --script=MyScript.buildXmgame
// 构建支付宝小游戏
>LayaAirIDE --project=C:\Users\ASUS\Desktop\LayaProject --script=MyScript.buildAlipaygame
// 构建淘宝小游戏
>LayaAirIDE --project=C:\Users\ASUS\Desktop\LayaProject --script=MyScript.tbgame
```

还可以指定执行脚本参数，命令为：

```
> LayaAirIDE --project=/path/to/project --script=Script.Speak --script-args="say \"hello world\""
```

**--project:**  项目路径（全路径）。

**--script:** 指定执行的脚本文件。

**--script-args**: 指定执行的脚本参数。上述示例中，脚本的参数就会传递("say", "hello world")。

例如，在项目中新建脚本文件Script.ts，然后添加如下代码：

```typescript
@IEditorEnv.regClass()
class Script {
    
    static speak(arg1: any, arg2: any) {
        console.log(arg1); 
        console.log(arg2); 
    }
}
```

然后打开终端，输入命令`LayaAirIDE --project=C:\Users\ASUS\Desktop\LayaProject --script=Script.speak --script-args="say \"hello world\""`后，如图17-4所示，可以看到进行了成功的输出。

> 注意：传入的参数中，外层的引号用来定义参数字符串的边界。反斜杠是转义字符，它与内层引号的组合用于指示这里的双引号是字符串内容的一部分，而不是边界标识。

![17-4](img/17-4.png)

（图17-4）



