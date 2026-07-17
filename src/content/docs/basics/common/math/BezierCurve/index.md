---
title: "贝塞尔曲线"
description: "Bezier 类提供贝塞尔曲线计算工具，位于 laya/maths/Bezier.ts。支持二次和三次贝塞尔曲线，常用于动画缓动、路径规划、UI曲线绘制。"
slug: "basics/common/math/beziercurve"
---

`Bezier` 类提供贝塞尔曲线计算工具，位于 `laya/maths/Bezier.ts`。支持二次和三次贝塞尔曲线，常用于动画缓动、路径规划、UI曲线绘制。

## 一、概述

引擎通过单例 `Laya.Bezier.I` 访问实例方法，或使用 `Laya.Bezier` 的静态方法。

- **二次贝塞尔**：3个控制点（起点、控制点、终点）
- **三次贝塞尔**：4个控制点（起点、控制点1、控制点2、终点）

## 二、二次贝塞尔曲线

![图2-1](./img/2-1.png)

（图2-1）

`getPoint2(t, rst)` 计算二次贝塞尔曲线上 t（0~1）处的点。使用前需通过 `insertPoints` 设置控制点。

```typescript
let bezier = Laya.Bezier.I;
// 通过 insertPoints 设置控制点并获取点序列
```

## 三、三次贝塞尔曲线

![图3-1](./img/3-1.png)

（图3-1）

`getPoint3(t, rst)` 计算三次贝塞尔曲线上 t（0~1）处的点。

## 四、获取曲线点序列

### 4.1 静态方法 getPoints

```typescript
// getPoints(pList, inSertCount, count, out)
// pList: 控制点坐标数组 [x0,y0, x1,y1, ...]
// inSertCount: 每段之间插入的点数（默认5）
// count: 贝塞尔曲线的阶数（默认2，2表示二次曲线，3表示三次曲线）
let controlPoints = [0,0, 100,200, 200,0];  // 3个二次贝塞尔控制点
let points = Laya.Bezier.getPoints(controlPoints, 10, 2);
// 返回曲线上的采样点数组
```

### 4.2 实例方法 getBezierPoints

```typescript
let bezier = Laya.Bezier.I;
let controlPoints = [0,0, 50,200, 150,200, 200,0];  // 4个三次贝塞尔控制点
let points = bezier.getBezierPoints(controlPoints, 10, 2);
```

## 五、缓动插值 getRate

![图5-1](./img/5-1.png)

（图5-1）

`getRate` 是最常用的方法，用于自定义缓动曲线。它在一条特殊的三次贝塞尔曲线上计算插值，该曲线固定起点 P0(0,0) 和终点 P3(1,1)，只需定义两个控制点。

```typescript
// getRate(t, px0, py0, px1, py1)
// t: 进度 0~1
// (px0,py0): 控制点1
// (px1,py1): 控制点2
// 返回: 插值后的 y 值 (0~1)

// 类似 CSS cubic-bezier(0.42, 0, 0.58, 1) 的 ease-in-out 效果
let eased = Laya.Bezier.getRate(t, 0.42, 0, 0.58, 1);

// 常用预设：
// ease:        getRate(t, 0.25, 0.1, 0.25, 1.0)
// ease-in:     getRate(t, 0.42, 0, 1.0, 1.0)
// ease-out:    getRate(t, 0, 0, 0.58, 1.0)
// ease-in-out: getRate(t, 0.42, 0, 0.58, 1.0)
// linear:      getRate(t, 0, 0, 1.0, 1.0)
```

## 六、应用示例

### 6.1 自定义缓动动画

```typescript
private elapsed: number = 0;
private duration: number = 1000;

onUpdate(): void {
    this.elapsed += Laya.timer.delta;
    let t = Math.min(this.elapsed / this.duration, 1);

    // 使用贝塞尔缓动
    let eased = Laya.Bezier.getRate(t, 0.42, 0, 0.58, 1);

    // 应用到位置
    this.sprite.x = this.startX + (this.endX - this.startX) * eased;
    this.sprite.y = this.startY + (this.endY - this.startY) * eased;
}
```

### 6.2 曲线路径绘制

```typescript
let points = Laya.Bezier.getPoints([0,0, 100,200, 300,200, 400,0], 20, 2);
let graphics = this.sprite.graphics;
for (let i = 0; i < points.length - 2; i += 2) {
    graphics.drawLine(points[i], points[i+1], points[i+2], points[i+3], "#ff0000", 2);
}
```
