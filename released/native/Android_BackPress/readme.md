

# 接管android的后退按钮

在LayaNative中，有两种方式可以接管Android”后退键”的处理，两种方式都会被调用，推荐使用方法一。

如果需要退出应用，可以调用 `conch.exit()` 函数来实现。

**Tips**
*1、conch.exit() 只能在LayaNative环境下调用，在网页版本中是没有conch定义的，所以需要判断一下是否在LayaNative环境下。*

## 方法一：通过 conch.onBackPressed 回调（推荐）

直接设置 `conch.onBackPressed` 回调函数，当用户按下后退键时会优先调用此回调。

TS示例如下：
```typescript
if (Laya.Browser.onLayaRuntime) {
    (window as any).conch.onBackPressed = () => {
        (window as any).conch.exit();
    };
}
```

## 方法二：通过监听 KEY_DOWN 事件

通过监听 `Laya.Event.KEY_DOWN` 事件来处理后退键，当用户按下后退键时，`keyCode` 值为 4（即 Android 的 `KEYCODE_BACK`），开发者可以在回调中实现自定义逻辑。

TS示例如下：
```typescript
Laya.stage.on(Laya.Event.KEY_DOWN, this, (e: Laya.Event) => {
    if (e.keyCode === 4) { // Android KEYCODE_BACK
        if (Laya.Browser.onLayaRuntime) {
            (window as any).conch.exit();
        }
    }
});
```