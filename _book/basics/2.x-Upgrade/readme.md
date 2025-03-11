# 2.0引擎开发者使用3.0的差异汇总

> Author：谷主  && Charley

> [!Note]
> 本篇文档仅适用3.0以前的旧版引擎开发者，熟悉一些项目差异，后续还会进一步进行总结。

## 1、LayaAir3.0 Loader修改

### 1.1加载一个资源

示例：

```typeScript
var url = "xxx.png";
var type = Laya.Loader.IMAGE;
Laya.loader.load(url).then((res)=> {
    //不带类型，用于常规的资源
});

Laya.loader.load(url, type).then((res)=> {
    //带类型，用于区别同一后缀不同作用的资源。
    //例如，图片xxx.png被定义为TextureCube，使用load("xxx.png", Laya.Loader.TEXTURECUBE)。得到的是TextureCube。
}); 
```

### 1.2 加载多个资源（用数组）

```typescript
var url1 = "xxx.png";
var url2 = "xxxxx.png";
var type1 = Laya.Loader.IMAGE;
var type2 = Laya.Loader.TEXTURE2D;
Laya.loader.load([url1, url2]).then((res:Array<any>)=> {
    //加载多个，不带类型   
});                      
Laya.loader.load([url1, url2], type).then((res:Array<any>)=> {
  //加载多个，统一设置类型
});                            
Laya.loader.load([{ url:url1, type: type1 }, { url:url2, type: type2 }]).then((res:Array<any>)=> {
	//加载多个，分别设置类型
});
```

### 1.3 加载多个文件（组合）

```typeScript
let tasks:Array<Promise<any>> = [];
tasks.push(Laya.loader.load(url));
tasks.push(Laya.loader.load(url2));

Promise.all(tasks).then((res:Array<any>)=> {
    //用于异步加载
});
```

#### 1.4 Texture和Texture2D的问题

同一个资源地址，无论是加载Texture还是Texture2D，他们在内存中都只有一份，但可以获取不同类型。

```typescript
Laya.loader.load("1.png").then((res)=> { /* res是Texture */ });
Laya.loader.load("1.png", Loader.Texture2D).then((res)=> { /* res是Texture2D */ });

Laya.loader.getRes("1.png"); //res是Texture
Laya.loader.getRes("1.png", Loader.Texture2D); //res是Texture2D
Laya.Loader.getTexture2D("1.png"); //res是Texture2D
```

### 1.5 加载HTMLImage

```typescript
Laya.loader.fetch("1.png", Laya.Loader.IMAGE).then((res)=> { /* res是HTMLImage */ });
```

> [!Type|label:Tips]
>
> 不能使用Loader.getRes获得fetch结果，因为fetch方法不缓存

### 1.6 使用Options。

```typescript
Laya.loader.load(url, { group:xx, piority:1 }); //priority不限制0-5。为任意整数，数字越大优先级越高。
```

### 1.7 预制体/场景的问题

加载`lh/ls/gltf`这三种文件，会下载和加载所有依赖的资源。

但不会自动创建节点。缓存的也不是节点。

```typescript
Laya.loader.load("1.lh").then(res=> { 
    /* 注意res不是节点类型！ 类型也不必关心，只需要知道它有一个create方法实例化节点树。*/
        let node = res.create();
});
```

### 1.8 旧版本引擎load和create的兼容性问题

3.0以前的引擎，有Laya.loader.load()和Laya.loader.create()方法两个方法，分别用于加载2D和3D资源。

3.0引擎版本统一使用load()方法即可，

对于lh/ls/gltf这类资源，旧版本的create方法相当于3.0引擎的load+createNodes，

对于其他资源，create方法和load方法没有区别。旧引擎的create方法在3.0引擎中已取消，因为这个方法的不当使用会造成内存泄露，所以需要报编译错误强制开发者修改。

### 1.9扩展Loader能力

原来的parseMap，createMap都已经取消。

编写一个类实现IResourceLoader接口，例如一个最简单的实现：

```typescript
class MyLoader {
    load(task:ILoadTask) {
        return task.loader.fetch(task.url, "json", task.createCallback()).then(data=> {
            let obj = /*解析data*/;
            return obj;
        });
    }
}
```

加载类里不需要考虑是单独加载，还是是批量加载其中一个环节，因为task.createCallback可以很好的将总体进度归一化为0~1。

复杂的例子可以参考引擎里的TextureLoader/MaterialLoader/MeshLoader之类。

然后使用Loader.registerLoader注册这个类。例如

```typescript
Loader.registerLoader(["xyz"], YourLoader);
```



## 2、关于动态加载IDE里的资源说明

无论加载什么资源，编辑器内文件名是什么，路径就填什么。不用放到bin目录，直接放到assets目录，以assets为根路径。

例如：

1、拖入了FBX或者GLTF后，使用load("xxx.FBX", Laya.Loader.HIERARCHY)

加载编辑器里的fbx或者gltf。不需要自己手动搞成lh。编辑器会自动使用转换后的结果。

2、加载蓝图shader用load("xxxx.lbp")，而不是"xxx.shader"。



## 3、LayaAir3.0 输入处理模块修改

原有的MouseManager和KeyboardManager合并为InputManager。MouseManager以前在游戏中应该很少直接用到，所以影响不大。KeyboardManager原来只有一个接口hasKeyDown，现在改为调用InputManager.hasKeyDown即可。

新的输入处理系统的特性有：

### 3.1 2D和3D统一接口，

都可以通过事件监听方式和Laya.Script命名函数方式处理输入。例如：

```typescript
this.aNode.on(Laya.Event.CLICK, ()=> {
console.log("clicked");
});

class MyScript extends Laya.Script {
    //脚本事件
    onMouseClick(e:Event) {
        console.log("clicked");
    }
}
aNode.addComponent(MyScript);
```

以上两种方式是等价的，且在纯2D，或2D/3D混合这两种情况中均可正常使用。



### 3.2 2D能对3D正确遮挡。

输入处理时，2D能对3D正确遮挡。

### 3.3 新增 MOUSE_DRAG和MOUSE_DRAG_END

新增了两个事件：MOUSE_DRAG和MOUSE_DRAG_END。

在对一个物体按下鼠标并移动（无论是否在此物体上方），将持续对此物体派发MOUSE_DRAG，

松开鼠标后（无论是否在此物体上方）对此物体派发MOUSE_DRAG_END。

### 3.4  删除了RIGHT_MOUSE_DOWN和RIGHT_MOUSE_UP

 删除了RIGHT_MOUSE_DOWN和RIGHT_MOUSE_UP，改为派发MOUSE_DOWN和MOUSE_UP，可以通过Event.button区分鼠标左中右键。

### 3.5 事件汇总

Laya.Script 里相关的输入处理函数有：

```typescript
/**
     * 鼠标按下时执行
     */
    onMouseDown?(evt: Event): void;

    /**
     * 鼠标抬起时执行
     */
    onMouseUp?(evt: Event): void;

    /**
     * 鼠标在节点上移动时执行
     */
    onMouseMove?(evt: Event): void;

    /**
     * 鼠标进入节点时执行
     */
    onMouseOver?(evt: Event): void;

    /**
     * 鼠标离开节点时执行
     */
    onMouseOut?(evt: Event): void;

    /**
     * 鼠标按住一个物体后，拖拽时执行
     */
    onMouseDrag?(evt: Event): void;

    /**
     * 鼠标按住一个物体，拖拽一定距离，释放鼠标按键后执行
     */
    onMouseDragEnd?(evt: Event): void;

    /**
     * 鼠标点击时执行
     */
    onMouseClick?(evt: Event): void;

    /**
     * 鼠标双击时执行
     */
    onMouseDoubleClick?(evt: Event): void;

    /**
     * 鼠标右键点击时执行
     */
    onMouseRightClick?(evt: Event): void;

    /**
     * 键盘按下时执行
     */
    onKeyDown?(evt: Event): void;

    /**
     * 键盘产生一个字符时执行
     */
    onKeyPress?(evt: Event): void;

    /**
     * 键盘抬起时执行
     */
    onKeyUp?(evt: Event): void;
```

和老版本比较，有如下改变

1) onClick 名字变更为 onMouseClick

2) onDoubleClick 名字变更为 onMouseDoubleClick

3) 删除了onStageMouseDown，onStageMouseUp，onStageClick，onStageMouseMove

4) 删除了onMouseEnter，它与onMouseOver重复。





## 4、LayaAir3.0 组件系统修改

4.1 LayaAir2的组件系统中有3种组件的基类，Component、Script和Script3D。

1.  LayaAir3.0合并了Scirpt和Script3D，也就是只使用Script即可。Script3D仍然可以使用，但它只是Script的别名。Script可以挂载到2D对象，也可以挂载到3D对象。

4.2 LayaAir2中，Component与Script的区别，是Component主要通过继承方式写逻辑，Script则是比较纯正的组件机制。

1.  在LayaAir3.0中，Component具有完整的生命周期，即onAwake,onStart,onEnable,onUpdate,onLateUpdate,onDisable,onDestroy，不再使用_onEnable,_onDisable等下划线函数。 _onEnable,_onDisable等下换线函数仍然给内部使用

2.  对比Component, Script增加了交互行为，即onTriggerEnter, onCollisionEnter, onMouseClick, onKeyDown等与输入输出相关的回调。除此之外，Script与Component无本质区别。开发者一般使用Script。

4.3 Component或Script的Update/LateUpdate方法是否在IDE编辑模式下运行，由他们的runInEditor属性决定。开发者则一般通过给Script附加装饰@runInEditor实现。默认不运行。

关于修饰符的使用，参照下面的示例：

```typescript
const { regClass, property } = Laya;
//有了@regClass()，才会被识别为script脚本类
@regClass()
export class Script extends Laya.Script {
    //属性上面有了@property()，才会被识别为IDE里可暴露的属性，每一个属性只要需要暴露，上面就都需要加上@property()。
    @property( { type : String } )
    public text: string = "";

    constructor() {
        super();
    }
}
```





## 5、Runtime的使用差异

3.0的场景与2.0完全不是一个概念，

3.0的runtime只能在场景上的2D根节点Scene2D或预制体的根节点上设置，其它的子级节点，不再支持runtime，如果有代码的需求，要使用脚本script来实现。

3.0的UI没有var属性，name与var合并了，默认只需要name，如果需要在场景继承类上runtime通过this.xxx访问，那把name后面的 Declare Var给勾选上即可导出该属性到场景的基类里。

3.0不再把场景类统一生成到一个文件里，而是生成到Runtime类的同级目录，当为runtime指定一个场景类后，该场景类的同级目录会自动生成一个文件名相同，但后缀不同的基类。场景类基类的后缀名字为xxx.generated.ts

如果开发者不想看到.generated.ts的文件，可以在vscode的配置文件里，加上.generated.ts后缀名屏蔽生成的基类。



## 6、2D动画

2D动画不再支持ani格式，采用状态机与动画文件结合来使用



