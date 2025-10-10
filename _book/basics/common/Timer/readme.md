# 定时器

定时器 `Laya.Timer` 是时钟管理类。它是一个单例，不要手动实例化此类，应该通过 `Laya.timer` 访问。

同时 `Laya.Timer` 表示游戏主时针，同时也是管理场景、动画、缓动等效果时钟，通过控制本时钟缩放可以达到快进慢播的效果。

## 1. 帧间隔

### 1.1 定时执行一次 (基于帧率)

`Laya.timer.frameOnce`，定义如下：

```typescript
    /**
     * 定时执行一次(基于帧率)。
     * @param	delay	延迟几帧(单位为帧)。
     * @param	caller	执行域(this)。
     * @param	method	定时器回调函数。
     * @param	args	回调参数。
     * @param	coverBefore	是否覆盖之前的延迟执行，默认为 true 。
     */
    frameOnce(delay: number, caller: any, method: Function, args: any[] = null, coverBefore: boolean = true): void {
        this._create(true, false, delay, caller, method, args, coverBefore);
    }
```

使用示例如下：

```typescript
const { regClass } = Laya;
import { RuntimeScriptBase } from "./RuntimeScript.generated";

@regClass()
export class RuntimeScript extends RuntimeScriptBase {
    onAwake(): void {
        //60帧后，图片的透明度变为0.5
        Laya.timer.frameOnce(60, this, () => {
            this.Image.alpha = 0.5;
        })
    }
}
```

### 1.2 定时重复执行  (基于帧率)

`Laya.timer.frameLoop`，定义如下：

```typescript
    /**
     * 定时重复执行(基于帧率)。
     * @param	delay	间隔几帧(单位为帧)。
     * @param	caller	执行域(this)。
     * @param	method	定时器回调函数。
     * @param	args	回调参数。
     * @param	coverBefore	是否覆盖之前的延迟执行，默认为 true 。
     */
    frameLoop(delay: number, caller: any, method: Function, args: any[] = null, coverBefore: boolean = true): void {
        this._create(true, true, delay, caller, method, args, coverBefore);
    }
```

使用示例如下： 

```typescript
const { regClass } = Laya;
import { RuntimeScriptBase } from "./RuntimeScript.generated";

@regClass()
export class RuntimeScript extends RuntimeScriptBase {
    onAwake(): void {
        //每60帧后，图片的透明度减少0.1
        Laya.timer.frameLoop(60, this, () => {
            this.Image.alpha -= 0.1;
        })
    }
}
```



## 2. 时间间隔

### 2.1 定时执行一次 (单位为毫秒)

`Laya.timer.once`，定义如下：

```typescript
    /**
     * 定时执行一次。
     * @param	delay	延迟时间(单位为毫秒)。
     * @param	caller	执行域(this)。
     * @param	method	定时器回调函数。
     * @param	args	回调参数。
     * @param	coverBefore	是否覆盖之前的延迟执行，默认为 true 。
     */
    once(delay: number, caller: any, method: Function, args: any[] = null, coverBefore: boolean = true): void {
        this._create(false, false, delay, caller, method, args, coverBefore);
    }
```

使用示例如下： 

```typescript
const { regClass } = Laya;
import { RuntimeScriptBase } from "./RuntimeScript.generated";

@regClass()
export class RuntimeScript extends RuntimeScriptBase {
    onAwake(): void {
        //1秒后，图片的透明度变为0.5
        Laya.timer.once(1000, this, () => {
            this.Image.alpha = 0.5;
        })
    }
}
```

### 2.2 定时重复执行(单位为毫秒)

`Laya.timer.loop`，定义如下：

```typescript
    /**
     * 定时重复执行。
     * @param	delay	间隔时间(单位毫秒)。
     * @param	caller	执行域(this)。
     * @param	method	定时器回调函数。
     * @param	args	回调参数。
     * @param	coverBefore	是否覆盖之前的延迟执行，默认为 true 。
     * @param	jumpFrame 时钟是否跳帧。基于时间的循环回调，单位时间间隔内，如能执行多次回调，出于性能考虑，引擎默认只执行一次，设置jumpFrame=true后，则回调会连续执行多次
     */
    loop(delay: number, caller: any, method: Function, args: any[] = null, coverBefore: boolean = true, jumpFrame: boolean = false): void {
        var handler: TimerHandler = this._create(false, true, delay, caller, method, args, coverBefore);
        if (handler) handler.jumpFrame = jumpFrame;
    }
```

使用示例如下：

```typescript
const { regClass } = Laya;
import { RuntimeScriptBase } from "./RuntimeScript.generated";

@regClass()
export class RuntimeScript extends RuntimeScriptBase {
    onAwake(): void {
        //每1秒后，图片的透明度减少0.1
        Laya.timer.loop(1000, this, () => {
            this.Image.alpha -= 0.1;
        })
    }
}
```



## 3. 暂停定时器执行

一旦定时器暂停，游戏将处于静止状态：

```typescript
    /**
     * 暂停时钟
     */
    pause(): void {
        this.scale = 0;
    }

    /**
     * 恢复时钟
     */
    resume(): void {
        this.scale = 1;
    }
```



## 4. 当前帧延迟执行

当前帧执行后立即执行。渲染之前执行，比延迟一帧的定时器，执行优先级更高：

```typescript
    /**
     * 延迟执行。
     * @param	caller 执行域(this)。
     * @param	method 定时器回调函数。
     * @param	args 回调参数。
     */
    callLater(caller: any, method: Function, args: any[] = null): void {
        CallLater.I.callLater(caller, method, args);
    }
```

使用示例如下：

```typescript
const { regClass } = Laya;
import { RuntimeScriptBase } from "./RuntimeScript.generated";

@regClass()
export class RuntimeScript extends RuntimeScriptBase {
    onAwake(): void {
        //循环调用10次，但是定时器回调函数只执行一次，即"hideImage"日志只打印一次
        for (let i = 0; i < 10; i++)
            Laya.timer.callLater(this, this.hideImage);
    }

    hideImage(): void {
        console.log("hideImage");
        this.Image.visible = false;
    }
}
```



## 5. 清理定时器

`Laya.timer.clear`：清理指定的定时器。定义如下：

```typescript
    /**
     * 清理定时器。
     * @param	caller 执行域(this)。
     * @param	method 定时器回调函数。
     */
    clear(caller: any, method: Function): void {
        var handler: TimerHandler = this._getHandler(caller, method);
        if (handler) {
            handler.clear();
        }
    }
```

`Laya.timer.clearAll`：清理对象指定作用域的所有定时器。定义如下：

```typescript
    /**
     * 清理对象身上的所有定时器。
     * @param	caller 执行域(this)。
     */
    clearAll(caller: any): void {
        if (!caller) return;
        for (var i: number = 0, n: number = this._handlers.length; i < n; i++) {
            var handler: TimerHandler = this._handlers[i];
            if (handler.caller === caller) {
                handler.clear();
            }
        }
    }
```

建议在一个模块功能销毁之前，清理定时器或者清除所有的定时器。



## 6. 立即执行并删除定时器

`Laya.timer.runCallLater`：立即执行callLater，执行后删除。定义如下：

```typescript
    /**
     * 立即执行 callLater 。
     * @param	caller 执行域(this)。
     * @param	method 定时器回调函数。
     */
    runCallLater(caller: any, method: Function): void {
        CallLater.I.runCallLater(caller, method);
    }
```

使用示例如下：

```typescript
const { regClass } = Laya;
import { RuntimeScriptBase } from "./RuntimeScript.generated";

@regClass()
export class RuntimeScript extends RuntimeScriptBase {
    onAwake(): void {
        //延迟一帧执行hideImage
        Laya.timer.callLater(this, this.hideImage);
        //当前帧立即执行hideImage，执行后删除定时器
        Laya.timer.runCallLater(this, this.hideImage);
    }

    hideImage(): void {
        console.log("hideImage");
        this.Image.visible = false;
    }
}
```

> 注：上述示例会打印一个"hideImage"，因为LayaAir中的runCallLater执行回调后，会删除定时器。如果不删除定时器，当前帧执行完runCallLater的回调hideImage后，还会执行callLater的回调hideImage，就会打印出两个"hideImage"。

`Laya.timer.runTimer`：立即提前执行定时器，执行之后从队列中删除。定义如下：

```typescript
    /**
     * 立即提前执行定时器，执行之后从队列中删除
     * @param	caller 执行域(this)。
     * @param	method 定时器回调函数。
     */
    runTimer(caller: any, method: Function): void {
        var handler: TimerHandler = this._getHandler(caller, method);
        if (handler && handler.method != null) {
            this._map[handler.key] = null;
            handler.run(true);
        }
    }
```

使用示例如下：

```typescript
const { regClass } = Laya;
import { RuntimeScriptBase } from "./RuntimeScript.generated";

@regClass()
export class RuntimeScript extends RuntimeScriptBase {
    onAwake(): void {
        //如果没有Laya.timer.runTimer，则5秒后才执行hideImage
        Laya.timer.loop(5000, this, this.hideImage);
        //立即执行hideImage
        Laya.timer.runTimer(this, this.hideImage);
    }

    hideImage(): void {
        console.log("hideImage");
        this.Image.visible = false;
    }
}
```

