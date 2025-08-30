# 事件管理

## 1. 认识事件

### 1.1 什么是事件

事件Event指的是由系统事先设定的、能被对象识别和响应的动作，事件是指对象对于外部动作的响应，当对方发生了某个事件，就会执行于此事件对应的代码。比如用鼠标在一个对象上按下，这个对象预先设定了识别鼠标按下这个事件，就会执行对应的代码。

### 1.2 事件的分类

1，引擎内置的事件

2，自定义的事件

我们使用的事件可以是引擎内置的事件，也可以是自定义的事件，使用自定义类型的事件叫自定义事件。

## 2. 引擎内置的事件

LayaAir3.0引擎中的事件主要包含三部分

`Laya.Event` 事件类型，事件接口，不同的事件类型都要实现此接口。
`Laya.EventDispatcher` 事件派发，每个传递过来的事件都会由它分发给特定的处理者。
`Laya.Handler` 事件处理，不同的处理器需实现该接口。

### 2.1 事件类型 `Laya.Event`

`Laya.Event` 是事件类型的集合，当事件发生时`Laya.Event`对象将作为参数传递给事件侦听器。如图2-1，事件类型请参考[API](https://layaair.com/3.x/api/Chinese/index.html?version=3.0.0&type=Core&category=Event&class=laya.events.Event)文档。

<img src="images/2-1.png" alt="2-1" style="zoom:50%;" /> 

（图2-1）

例如 `Laya.Event.CLICK:string = "click"`。`CLICK` 静态属性用于定义事件对象的`type`类型属性值为单击事件。这个事件是由鼠标点击触发后系统派发的事件，开发者也可以调用event()方法派发这些事件，如何派发事件会在下面的内容涉及。

![2-2](images/2-2.png) 

（图2-2）

点击图2-2中3个按钮的任意一个，可以进入对应的功能。我们看看代码是如何使用`CLICK` 的（以下代码来自“2D入门示例”）：

```typescript
onEnable(): void {

        console.log("IndexRT onEnable")
        //侦听ui按钮点击事件
        this.uiBtn.on(Laya.Event.CLICK, this, () => {
            //点击后，打开UI场景示例
            console.log("uiBtn");
            Laya.Scene.open("scenes/UiMain.ls");
        });

        //侦听物理按钮点击事件
        this.phyBtn.on(Laya.Event.CLICK, this, () => {
            //点击后，打开物理游戏示例
            console.log("phyBtn");
            Laya.Scene.open("scenes/PhysicsGameMain.ls");
        });

        //侦听3D混合按钮点击事件
        this.d3Btn.on(Laya.Event.CLICK, this, () => {
            //点击后，打开3D混合场景示例
            console.log("d3Btn");
            Laya.Scene.open("scenes/D3Main.ls");
        });        
}
```



### 2.2 事件派发 `Laya.EventDispatcher` 

事件派发`Laya.EventDispatcher`模式是侦听模式的一种扩展，由事件驱动，每当有事件产生的时候，由事件分发器`Laya.EventDispatcher`分发给特定的事件处理器`Laya.Handler` 处理该事件。`Laya.EventDispatcher`表示事件发送者、事件捕获传递与分发。

`Laya.EventDispatcher` 事件分发器是可调度事件类的基类，比如作为基础节点的Node类继承自`Laya.EventDispatcher`类，只要继承此类就可以作为一个事件发送者发送事件给它的侦听者。那么比如上面示例代码中的Button就是继承自`Laya.EventDispatcher`，可以用`.on`的方法来侦听CLICK`事件。

`Laya.EventDispatcher` 具有如下功能：

#### 2.2.1 事件派发 `event`

```typescript
	/**
     * 派发事件。
     * @param type	事件类型。
     * @param data	（可选）回调数据。<b>注意：</b>如果是需要传递多个参数 p1,p2,p3,...可以使用数组结构如：[p1,p2,p3,...] ；如果需要回调单个参数 p ，且 p 是一个数组，则需要使用结构如：[p]，其他的单个参数 p ，可以直接传入参数 p。
     * @return 此事件类型是否有侦听者，如果有侦听者则值为 true，否则值为 false。
     */
    event(type: string, data: any = null)
```

用于派发事件，例如我们可以在代码中来派发一个`CLICK`事件 :

```typescript
//侦听ui按钮点击事件
this.uiBtn.on(Laya.Event.CLICK, this, () => {
	//点击后，打开UI场景示例
	console.log("uiBtn");
	Laya.Scene.open("scenes/UiMain.ls");
});

//uiBtn自己派发一个点击事件，由于上面有侦听，则立即执行打开uiMain场景
this.uiBtn.event(Laya.Event.CLICK);
```

#### 2.2.2 持续事件侦听 `on`

```typescript
	/**
     * 使用 EventDispatcher 对象注册指定类型的事件侦听器对象，以使侦听器能够接收事件通知。
     * @param type		事件的类型。
     * @param caller	事件侦听函数的执行域。
     * @param listener	事件侦听函数。
     * @param args		（可选）事件侦听函数的回调参数。
     * @return 此 EventDispatcher 对象。
     */
    on(type: string, caller: any, listener: Function, args: any[] = null)
```

用于向事件派发器注册指定类型的事件侦听器，使事件侦听器能够接收事件通知。当侦听到事件后，会调用作用域 `caller` 的回调方法 `listener`。

上述2.2.1的示例中 `this.uiBtn.on` 是使用了持续侦听。

#### 2.2.3 单次事件侦听 `once`

```typescript
	/**
     * 使用 EventDispatcher 对象注册指定类型的事件侦听器对象，以使侦听器能够接收事件通知，此侦听事件响应一次后自动移除。
     * @param type		事件的类型。
     * @param caller	事件侦听函数的执行域。
     * @param listener	事件侦听函数。
     * @param args		（可选）事件侦听函数的回调参数。
     * @return 此 EventDispatcher 对象。
     */
    once(type: string, caller: any, listener: Function, args: any[] = null)
```

用于向事件分发器注册指定类型的事件侦听器，使事件侦听器能够接收事件通知，事件侦听器响应一次后会自动移除。例如上述2.2.1示例中的按钮的侦听方式也可以改为单次事件侦听：

```typescript
//侦听一次ui按钮点击事件
this.uiBtn.once(Laya.Event.CLICK, this, () => {
	//点击后，打开UI场景示例
	console.log("uiBtn");
	Laya.Scene.open("scenes/UiMain.ls");
});
```

#### 2.2.4 删除指定的侦听 `off`

```typescript
	/**
     * 从 EventDispatcher 对象中删除侦听器。
     * @param type		事件的类型。
     * @param caller	事件侦听函数的执行域。
     * @param listener	事件侦听函数。
     * @return 此 EventDispatcher 对象。
     */
    off(type: string, caller: any, listener: Function, onceOnly: boolean = false)
```

用于从事件分发器对象中删除侦听器：

```typescript
onDestroy(): void {
	//删除ui按钮的侦听
	this.uiBtn.off(Laya.Event.CLICK, this);     
}
```

当这个场景删除销毁时，最好删除按钮的事件侦听，保证释放掉所有引用。

#### 2.2.5 删除指定事件类型的所有侦听 `offAll`

```typescript
	/**
     * 从 EventDispatcher 对象中删除指定事件类型的所有侦听器。
     * @param type	（可选）事件类型，如果值为 null，则移除本对象所有类型的侦听器。
     * @return 此 EventDispatcher 对象。
     */
    offAll(type: string = null)
```

用于从事件分发器对象中删除指定事件类型的所有侦听器。例如，uiBtn按钮注册了多个事件的侦听，可以用`offAll`方法来一次性删除所有点击事件的侦听 ：

```typescript
onDestroy(): void {
	//删除ui按钮的侦听
	this.uiBtn.offAll(Laya.Event.CLICK);    
}
```

#### 2.2.6 删除指定作用域的所有侦听 `offAllCaller`

```typescript
	/**
     * 移除caller为target的所有事件侦听
     * @param	caller caller对象
     */
    offAllCaller(caller: any)
```

用于从事件分发器对象中删除指定作用域的所有侦听器。例如，uiBtn按钮注册了多个事件的侦听，可以用`offAllCaller`方法来一次性删除this作用域上的所有侦听 ：

```typescript
onDestroy(): void {
	//删除this作用域的侦听
	this.uiBtn.offAllCaller(this);
}
```

#### 2.2.7 检查是否已注册侦听 `hasListener`

用于判断事件分发器对象是否为特定类型的事件注册了侦听器。

```typescript
    /**
     * 检查 EventDispatcher 对象是否为特定事件类型注册了任何侦听器。
     * @param	type 事件的类型。
     * @return 如果指定类型的侦听器已注册，则值为 true；否则，值为 false。
     */
    hasListener(type: string)
```

 例如：

```typescript
if( this.uiBtn.hasListener( Laya.Event.CLICK ) )
	console.log("uiBtn有点击事件侦听");
```



### 2.3 事件处理 `Laya.Handler`

当侦听到事件后，用来处理事件的处理器

- 处理器的属性包括：

  1，`caller: Object | null;` 执行域

  2，`method: Function | null` 执行方法

  3，`args: any[] | null` 参数

  4，`once = false` 表示是否只执行一次。如果为true，回调后执行recover()进行回收，回收后会被再利用，默认为false

- 处理器的方法包括：

  1，`create()`	从对象池内创建一个Handler

`Laya.Handler` 事件处理器，推荐使用`Laya.Handler.create()`方法从对象池创建，以减少对象创建消耗。当创建的`Handler`对象不再使用后，可使用`Laya.Handler.recover()`将其回收到对象池，回收后不要再使用此对象，否则会导致不可预料的错误。需要注意的是，由于鼠标事件也使用了对象池，不正确的回收以及调用，可能会影响事件的执行。

```typescript
onAwake(): void {
	console.log("Game Start");
	this.Tab.selectHandler = Laya.Handler.create(this,(index:number)=>{
		console.log(index);
	})
}
```

`Tab`会侦听用户点了某个标签，并从对象池创建一个处理器。

​	2，`clear(): Handler`	清理对象引用

```typescript
this.Tab.selectHandler.clear();  
```

​	3，`recover(): void`	清理并回收到 Handler 对象池内

```typescript
this.Tab.selectHandler.recover();
```

​	4，`run(): any`	执行处理器

```typescript
this.Tab.selectHandler.run(); //可以自行调用run()
```

​	5，`runWith(data: any): any` 	执行处理器，并携带额外数据

```typescript
this.Tab.selectHandler.runWith(1); //可以自行调用runWith(),并传入参数1
```

​	6，`setTo(caller: any, method: Function | null, args: any[] | null, once = false): Handler `	设置此对象的指定属性值。

```typescript
onAwake(): void {
	console.log("Game Start");
	this.Tab.selectHandler = Laya.Handler.create(this,(index:number)=>{
		// console.log(index);
	})
	this.Tab.selectHandler.setTo(this,(index:number)=>{
		console.log(index);
	},[],false);
}
```

可以自行更改指定的属性



## 3. 自定义的事件

大多数情况下，开发者使用的都是引擎内置的事件，有时也需要使用自定义的事件。下面举一个例子来说明派发自定义的事件。

在LayaAir IDE中，新建一个2D空项目，在Scene2D下新建一个自定义的组件脚本，并添加如下代码：

```typescript
onAwake(): void {
	//侦听自定义的事件"Click"
	this.owner.on("Click",this,()=>{
		console.log("侦听到自定义的“Click”事件");
	})
}

//鼠标点击后执行，发送Click事件。
onMouseClick(evt: Laya.Event): void {
	//自定义的事件
	this.owner.event("Click");
}
```

示例中的this.owner就是Scene2D，当鼠标点击场景后，就会派发自定义的事件"Click"，这个"Click"就是自定义的事件。当侦听到"Click"时，就会打印"侦听到自定义的“Click”事件"的日志。



