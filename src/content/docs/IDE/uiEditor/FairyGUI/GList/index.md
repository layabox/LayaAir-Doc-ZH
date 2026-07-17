---
title: "列表 （GList）"
description: "Author: 谷主"
slug: "ide/uieditor/fairygui/glist"
---

Author: 谷主

<img src="./img/1-1.png" alt="1-1" style="zoom:60%;" />

- `Template Node` item节点模版。从层级面板拖入一个节点。这个节点必须为GList节点的孩子。
- `Init Item Num` 初始item数量。如果大于0，将自动创建指定数量的item。
- `Is Demo` 如果勾选，`Init Item Num` 将只在IDE内起作用，运行期不起作用。也就是只作为一个IDE内的演示用途。
- `Item Data` 可以提供每个item的简单数据。
- `Layout` 参考[布局容器](/ide/uieditor/fairygui/layout/)
- `Clipping` 是否开启剪裁。开启后，超出容器尺寸的内容将会被隐藏。
- `Selection` 参考[Selection支持](/ide/uieditor/fairygui/selection/)
- `Scroller` 参考[滚动支持](/ide/uieditor/fairygui/scroller/)

### 一、 管理列表内容

运行时，可以直接通过addChild/removeChild等API修改列表的孩子。但在实际应用中，列表的内容通常被频繁的更新。典型的用法就是当接收到后台数据时，将列表清空，然后再重新添加所有项目。如果每次都创建和销毁UI对象，将消耗很大的CPU和内存。因此，GList内建了对象池。

使用对象池后的显示列表管理方法：

- `addItemFromPool` 从池里取出（如果有）或者新建一个对象，添加到列表中。如果不使用参数，则使用列表的“项目资源”的设置；也可以指定一个URL，创建指定的对象。
- `getFromPool`从池里取出（如果有）或者新建一个对象。
- `returnToPool` 将对象返回池里。
- `removeChildToPool` 删除一个item，并将对象返回池里。
- `removeChildToPoolAt` 删除一个指定位置的item，并将对象返回池里。
- `removeChildrenToPool` 删除一个范围内的item，或者全部删除，并将删除的对象都返回池里

聪明的你应该能知道，addItemFromPool = getFromPool + addChild ， removeChildToPool = removeChild + returnToPool。

当应用到池时，我们就应该非常小心，一个不停增长的池那将是游戏的灾难，但如果不使用池，对游戏性能也会有影响。

以下是几种错误用法的举例：

错误示例1：

```typescript
aList.addChild(obj);
aList.removeChildrenToPool();
```

添加对象时不使用池，但最后清除列表时却放到池里。这段代码持续运行，对象池将不断增大，可能造成内存溢出。

正确的做法：应从池中创建对象。将addChild改成addItemFromPool。

错误示例2：

```typescript
for(let i=0;i<10;i++)
    aList.addItemFromPool();

aList.removeChildren();
```

这里添加了10个item，但移除时并没有保存他们的引用，也没有放回到池里，这样就造成了内存泄漏。将aList.removeChildren改成aList.removeChildrenToPool();

**移除和销毁是两回事。**当你把item从列表移除时，如果以后不再使用，那么还应该销毁；如果还需要用，那么请保存它的引用。**但如果放入了池，切勿再销毁item**。

当添加大量item时，除了用循环方式ddChild或addItemFromPool外，还可以使用另一种回调的方式。首先为列表定义一个回调函数，例如:

```typescript
function renderListItem(index:number, obj:GButton) {
    obj.title = "" + index;
}
```

如果使用了对象池，意回调函数可能为同一个对象重复调用，所以在回调函数里注册事件侦听需要非常小心，避免使用临时函数，造成重复添加。

然后设置这个函数为列表的渲染函数：

```typescript
aList.itemRenderer = renderListItem;
```

最后直接设置列表中的项目总数，这样列表就会调整当前列表容器的对象数量，然后调用回调函数渲染item。

```typescript
//创建100个对象，注意这里不能使用numChildren，numChildren是只读的。
aList.numItems = 100;
```

如果新设置的项目数小于当前的项目数，那么多出来的item将放回池里。

使用这种方式生成的列表，如果你需要更新某个item，自行调用renderListItem(索引，getChildAt(索引))就可以了。

如果要侦听点击某一个item的事件，不必每个item加上Click事件的侦听器，而是直接侦听列表的ClickItem事件：

```typescript
list.on(Laya.UIEvent.ClickItem, this, this.onClickItem);

// 回调函数的第一个参数就是当前被点击的对象
function onClickItem(item: GButton): void {
    console.log("点击了对象：" + item.title);

    //获得这个对象在列表中的索引的方式
    let childIndex = list.getChildIndex(item);
}
```

从上面的代码可以看出，事件回调里都可以方便的获得当前点击的对象。如果要获得索引，那么可以使用getChildIndex。注意，item类型必须是按钮，即GButton，才可以触发ClickItem事件。

### 二、 虚拟列表

如果列表的item数量特别多时，例如几百上千，为每一条项目创建实体的显示对象将非常消耗时间和资源。本UI系统为列表内置了虚拟机制，也就是它只为显示范围内的item创建实体对象，并通过动态设置数据的方式实现大容量列表。

启用虚拟列表有几个条件：

- 需要定义itemRenderer。
- 需要创建Scroller。没有Scroller的列表不能开启虚拟。

满足条件后可以开启列表的虚拟功能：

```typescript
aList.setVirtual();
```

**提示：虚拟功能只能开启，不能关闭。**

虚拟列表的性能和itemRenderer的处理逻辑密切相关，你应该尽量简化这里面的逻辑，Promise、IO、高密度计算这类操作不应该在这里出现，否则会出现卡顿。如果需要在itemRenderer里发起异步操作，切勿让异步操作保存ITEM实例，并且在回调中直接修改ITEM实例，正确的做法是让异步操作保存ITEM的索引，异步操作完成后，查询这个索引的ITEM是否有对应的显示对象，有则更新，如果没有，放弃更新。

另外，itemRenderer里也不应该有new等会产生GC的操作，因为在滚动的过程中，itemRenderer调用的频率会非常高。

在虚拟列表里，ITEM是复用的，当一个ITEM需要被刷新时，itemRenderer就会被调用，你无需关心这个调用的时机，也不能依赖这个时机。

在虚拟列表中，显示对象和item的数量在数量上和顺序上是不一致的，item的数量可以通过numItems获得，而显示对象的数量可以由组件的API numChildren获得。

在虚拟列表中，需要注意item索引和显示对象索引的区分。通过selectedIndex获得的值是item的索引，而非显示对象的索引。selection.add/selection.remove等API同样需要的是item的索引。项目索引和对象索引的转换可以通过以下两个方法完成：

```typescript
//转换项目索引为显示对象索引。
let childIndex = aList.itemIndexToChildIndex(1);
    
//转换显示对象索引为项目索引。
let itemIndex = aList.childIndexToItemIndex(1);
```

使用虚拟列表时，我们很少会需要访问屏外对象。如果你确实需要获得列表中指定索引的某一个项目的显示对象，例如第500个，因为当前这个item是不在视口的，对于虚拟列表，不在视口的对象是没有对应的显示对象的，那么你需要先让列表滚动到目标位置。例如：

```typescript
//这里要注意，因为我们要立即访问新滚动位置的对象，所以第二个参数ani不能为true，即不使用动画效果
aList.scroller.scrollTo(500, false);

//转换到显示对象索引
let index = aList.itemIndexToChildIndex(500);

//这就是你要的第500个对象
let obj = aList.getChildAt(index);
```

虚拟列表的本质是数据和渲染分离，经常有人问怎样删除、或者修改虚拟列表的项目，答案就是先修改你的数据，然后刷新列表就可以了，不需要获得某个item对象来处理。

刷新虚拟列表的方式有两种：

- 使用numItems重新设置数量。
- GList.refreshVirtualList。

**不允许使用addChild或removeChild对虚拟列表增删对象。如果要清空列表，必须要通过设置numItems=0，而不是removeChildren。**

虚拟列表支持可变大小的item，可以通过两种方式动态改变item的大小：

- 在itemRenderer的内部使用width、height或size改变item的大小。
- item建立对内部元件的关联，然后在itemRenderer里修改内容触发内部元件的改变，从而自动改变item高度。例如item建立了一个对内部某个可变高度文本的高高关联，这样当文本改变时，item的高度自动改变。

**除这两种方式外，不可以通过其他在itemRenderer外的方式改变item大小，否则虚拟列表排列会错乱。但你可以通过调用refreshVirtualList强制触发itemRenderer。**

虚拟列表支持不同类型的item混合。首先为列表定义一个回调函数，例如

```typescript
//根据索引的不同，返回不同的资源URL string 
function getListItemResource(index:number) {
    let msg = _messages[index];
    if (msg.fromMe)
        return "url1.lh";
    else
        return "url2.lh";
}
```

然后设置这个函数为列表的item提供者：

```typescript
aList.itemProvider = getListItemResource;
```

对于横向流动、竖向流动和分页的列表，与非虚拟列表具有流动特性不同，虚拟列表每行或每列的item个数都是固定的。列表在初始化时会创建一个默认的item用于测算这个数量。

如果你仍然需要每行或每列不等item数量的排版，且必须使用虚拟化，那么可以插入一些用于占位的空组件或者空图形，并根据实际需要设置他们的宽度，从而实现那种排版效果。

### 三、 循环列表

循环列表是指首尾相连的列表，循环列表必须是虚拟列表。启用循环列表的方法为:

```typescript
    aList.setVirtualAndLoop()。
```

循环列表只支持单行或者单列的布局，不支持流动布局和分页布局。

因为循环列表是首尾相连的，指定一个item索引可能出现在不同的位置，所以需要指定滚定位置时，尽量避免使用item索引。例如，如果需要循环列表左/上滚一格或者右/下滚一格，最好的办法就是调用Scroller的API：scrollLeft/scrollRight/scrollUp/scrollDown。

### 四、列表项Runtime

列表可以通过代码动态设置item的Runtime类型，从而实现对item显示对象的逻辑的封装。例如

```typescript
//假设有一个自定义的组件类MyItem，注意基类必须和预制体根节点类型匹配，一般都是GButton。
class MyItem extends Laya.GButton {
    //注意！在onConstruct里才可以获取子对象，建议在这里做初始化，不要在构造函数里做初始化
    onConstruct() {
        //this.xx = this.getChild("xx");
        //this.xx.on(Laya.Event.CLICK, this, this.onClick);
    }

    sayHello() {
        console.log("Hello from MyItem");
    }
}

//设置列表的item的Runtime为MyItem
aList.itemPool.defaultRuntime = MyItem;
//设置了item的Runtime后，itemRenderer可以直接访问到MyItem的方法和属性
aList.itemRenderer = (index: number, item: MyItem) => {
    item.sayHello();
};
```

这个机制对虚拟列表非常有用，可以让itemRenderer的代码更简洁和高效。

