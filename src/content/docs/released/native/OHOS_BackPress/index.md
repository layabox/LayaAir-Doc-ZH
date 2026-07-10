---
title: "接管鸿蒙NEXT的后退按钮"
description: "在LayaNative中，可以通过设置 conch.onBackPressed 回调来接管鸿蒙NEXT\"后退键\"的处理。"
slug: "released/native/ohos-backpress"
---

在LayaNative中，可以通过设置 `conch.onBackPressed` 回调来接管鸿蒙NEXT"后退键"的处理。

如果需要退出应用，可以调用 `conch.exit()` 函数来实现。

**Tips**
*1、conch.exit() 只能在LayaNative环境下调用，在网页版本中是没有conch定义的，所以需要判断一下是否在LayaNative环境下。*

## 通过 conch.onBackPressed 回调

直接设置 `conch.onBackPressed` 回调函数，当用户按下后退键时会调用此回调。

TS示例如下：
```typescript
if (Laya.Browser.onLayaRuntime) {
    (window as any).conch.onBackPressed = () => {
        (window as any).conch.exit();
    };
}
```
