# 对象池使用



## 一、概述

在项目开发过程中，有许多对象会不停的创建与移除，比如角色攻击子弹、特效的创建与移除，NPC（非玩家角色）的被消灭与刷新等，在创建过程中非常消耗性能，特别是数量多的情况下，此时会造成卡顿的现象。

因此使用对象池就可以避免大量对象的创建。如果我们每次对象使用完了都放到池子里，比如怪物，子弹等等，怪物被杀死了，不需要用了，就可以放到池子里，下次使用的时候可以直接从池子里拿，对象池没有才需要创建。

对象池的优点是减少了实例化对象时的开销，且能让对象反复使用，减少了新内存分配与垃圾回收器运行的机会。另外对象移除时并不是立即从内存中抹去，只有认为内存不足时，才会使用垃圾回收机制清空，清空时很耗内存，很可能就会造成卡顿现象。用了对象池后将减少程序的垃圾对象，有效的提高程序的运行速度和稳定性。

接下来，我们来看看在LayaAir中是如何使用对象池（Pool）的。



## 二、对象池 Pool

Pool 是对象池类，用于对象的存贮、重复使用。合理使用对象池，可以有效减少对象创建的开销，避免频繁的垃圾回收，从而优化游戏流畅度。

### 2.1 获得一个对象池

```typescript
    /**
     * 根据对象类型标识字符，获取对象池。
     * @param sign 对象类型标识字符。
     * @return 对象池。
     */
    static getPoolBySign(sign: string): any[] {
        return Pool._poolDic[sign] || (Pool._poolDic[sign] = []);
    }
```

Laya.Pool 是通过对象类型标识符，也就是一个字符串名字来标识和管理对象池的。如果对象池系统中没有这个标识，那么会创建一个标识的对象池。因此我们也可以通过标识来定义多个对象池，分别处理不同类型的对象。比如攻击的子弹是一个对象池，NPC玩家是一个对象池。

所以，当我们想使用一个对象池的话，需要这样在代码中调用：

```typescript
let bulletPool = Laya.Pool.getPoolBySign("Bullet");
```

有了对象池，我们可以查看对象池当前的情况，比如查看对象池内对象的数量，继续添加对象等等。比如代码：

```typescript
let bulletPool = Laya.Pool.getPoolBySign("Bullet");
// 查看当前对象池内对象数量
console.log( bulletPool.length );

if( bulletPool.length == 0 )
{
	// 把子弹放入对象池
	pool.push( new Bullet() );
}	
```



### 2.2 清理一个对象池

```typescript
    /**
     * 清除对象池的对象。
     * @param sign 对象类型标识字符。
     */
    static clearBySign(sign: string): void {
        if (Pool._poolDic[sign]) Pool._poolDic[sign].length = 0;
    }
```

比如在游戏中，当一场战斗结束时，当没有需要子弹的对象池的需求了，我们可以通过代码来清理对象池：

```typescript
Laya.Pool.clearBySign("Bullet");
```



### 2.3 从池中获得对象

#### 2.3.1 通过标识获得

```typescript
    /**
     * 根据传入的对象类型标识字符，获取对象池中已存储的此类型的一个对象，如果对象池中无此类型的对象，则返回 null 。
     * @param sign 对象类型标识字符。
     * @return 对象池中此类型的一个对象，如果对象池中无此类型的对象，则返回 null 。
     */
    static getItem(sign: string): any {
        var pool: any[] = Pool.getPoolBySign(sign);
        var rst: any = pool.length ? pool.pop() : null;
        if (rst) {
            rst[Pool.POOLSIGN] = false;
        }
        return rst;
    }
```

这是最基本的操作，从对象池中拿到一个对象的示例，如果对象池里已经没有可以拿的对象时，返回 null，使用代码如下：

```typescript
let bullet = Pool.getItem("Bullet");
```

此时如果拿到的对象是 null，那么我们应该考虑下，有两种情况：

1，对于特别频繁需要创建的某个对象，或者创建这个对象的过程比较消耗性能，我们可以在进入这个场景的加载过程中，预先创建好一组对象，并把这组对象放入对象池中

```typescript
// 第一次创建子弹的对象池
let bulletPool = Laya.Pool.getPoolBySign("Bullet");
// 创建10个子弹对象，并放入对象池中
for( var i = 0 ; i < 10 ; i++ )
{
    // 创建一个子弹
    let bullet = new Bullet();
    bulletPool.push( bullet );
}
// 当需要的时候，可以从对象池中拿子弹对象
let bullet = Pool.getItem("Bullet");
```

2，对于创建对象性能要求不高，我们可以通过下面的方法来创建对象，并随时把对象放入对象池中

#### 2.3.2 通过标识获得，没有则创建

```typescript
    /**
     * <p>根据传入的对象类型标识字符，获取对象池中此类型标识的一个对象实例。</p>
     * <p>当对象池中无此类型标识的对象时，则使用传入的创建此类型对象的函数，新建一个对象返回。</p>
     * @param sign 对象类型标识字符。
     * @param createFun 用于创建该类型对象的方法。
     * @param caller this对象
     * @return 此类型标识的一个对象。
     */
    static getItemByCreateFun(sign: string, createFun: Function, caller: any = null): any {
        var pool: any[] = Pool.getPoolBySign(sign);
        var rst: any = pool.length ? pool.pop() : createFun.call(caller);
        rst[Pool.POOLSIGN] = false;
        return rst;
    }
```

基于上述的情况，如果对象池中没有对象了，可以随时利用这个方法创建对象：

```typescript
let bullet = Laya.Pool.getItemByCreateFun("Bullet", function()
{
	// 创建一个子弹
    let bullet = new Bullet();
    // 拿到子弹的对象池
    var pool = Laya.Pool.getPoolBySign("Bullet");
    // 把子弹放入对象池，也可以不放入对象池，根据开发者需求
    pool.push( bullet );
    // 返回子弹对象
    return bullet;
});
```



### 2.4 回收对象到池中

#### 2.4.1 通过对象进行回收

```typescript
    /**
     * 将对象放到对应类型标识的对象池中。
     * @param sign 对象类型标识字符。
     * @param item 对象。
     */
    static recover(sign: string, item: any): void {
        if (item[Pool.POOLSIGN]) return;
        item[Pool.POOLSIGN] = true;
        Pool.getPoolBySign(sign).push(item);
    }
```

比如在游戏的一场战斗过程中，从对象池中拿出的子弹已经结束了它的生命周期时，我们可以通过代码来回收这个子弹对象到对象池中：

```typescript
Laya.Pool.recover("Bullet", bullet);
```



### 2.5 通过类名，获得和回收对象

往往我们在做复杂的系统架构过程中，通过使用类名来获得和回收对象是一种很好的处理方式。Laya的Pool对象已经为我们考虑了这种情况，我们先来看看

#### 2.5.1 通过类名获得对象

```typescript
    /**
     * <p>根据传入的对象类型标识字符，获取对象池中此类型标识的一个对象实例。</p>
     * <p>当对象池中无此类型标识的对象时，则根据传入的类型，创建一个新的对象返回。</p>
     * @param sign 对象类型标识字符。
     * @param cls 用于创建该类型对象的类。
     * @return 此类型标识的一个对象。
     */
    static getItemByClass<T>(sign: string, cls: new () => T): T {
        if (!Pool._poolDic[sign]) return new cls();

        var pool = Pool.getPoolBySign(sign);
        if (pool.length) {
            var rst = pool.pop();
            rst[Pool.POOLSIGN] = false;
        } else {
            rst = new cls();
        }
        return rst;
    }
```

#### 2.5.2 根据类名进行回收

```typescript
    /**
     * 根据类名进行回收，如果类有类名才进行回收，没有则不回收
     * @param	instance 类的具体实例
     */
    static recoverByClass(instance: any): void {
        if (instance) {
            var className: string = instance["__className"] || instance.constructor._$gid;
            if (className) Pool.recover(className, instance);
        }
    }
```

有了这两种对应的方式，我们可以不用在代码中去关心每个对象的创建和回收，只关心对象的内部逻辑就好了。比如在战斗过程中有很多的技能特效，我们可以对每个特效用统一的方式进行管理对象池：

```typescript
export class EffectA {    
    
    constructor() {
        super();
    }
    
    static create(): EffectA {
		Pool.getItemByClass(EffectA);
	}

    recover(): void {
    	Pool.recoverByClass(this);
    }
    
}

export class EffectB {    
    
    constructor() {
        super();
    }
    
    static create(): EffectB {
		Pool.getItemByClass(EffectB);
	}

    recover(): void {
    	Pool.recoverByClass(this);
    }
    
}
```



总结，Laya提供的Pool是一个比较基本的对象池，开发者可以根据自己的需求来扩展对象池的使用，从而更方便的实现更复杂的对象管理。