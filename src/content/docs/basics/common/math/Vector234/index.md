---
title: "向量"
description: "向量（Vector）是游戏开发中最基础的数学工具，用于表示位置、方向、速度等。LayaAir引擎提供了 Vector2、Vector3、Vector4 三种向量类，分别位于 laya/maths/ 下。"
slug: "basics/common/math/vector234"
---

向量（Vector）是游戏开发中最基础的数学工具，用于表示位置、方向、速度等。LayaAir引擎提供了 `Vector2`、`Vector3`、`Vector4` 三种向量类，分别位于 `laya/maths/` 下。

## 一、Vector2（二维向量）

`Vector2` 表示2D空间中的点或方向，包含 `x`、`y` 两个分量。

### 1.1 创建与常量

```typescript
let v = new Laya.Vector2(3, 4);

// 预定义常量（只读，禁止修改）
Laya.Vector2.ZERO;   // (0, 0)
Laya.Vector2.ONE;    // (1, 1)
```

### 1.2 常用方法

![图1-1](/basics/common/math/Vector234/img/1-1.png)

（图1-1）

```typescript
let a = new Laya.Vector2(1, 2);
let b = new Laya.Vector2(3, 4);
let out = new Laya.Vector2();

// 设置值
a.setValue(5, 6);

// 缩放
Laya.Vector2.scale(a, 2, out);       // out = a * 2

// 点积
let dot = Laya.Vector2.dot(a, b);    // 标量结果

// 归一化（单位向量）
Laya.Vector2.normalize(a, out);

// 两点距离
let dist = Laya.Vector2.distance(a, b);

// 标量长度
let len = Laya.Vector2.scalarLength(a);

// 判断相等
let eq = Laya.Vector2.equals(a, b);

// 克隆
let c = a.clone();
a.cloneTo(out);

// 与数组互转
let arr = a.toArray();        // [x, y]
a.fromArray([10, 20]);
```

## 二、Vector3（三维向量）

`Vector3` 是3D开发中最核心的向量类型，包含 `x`、`y`、`z` 三个分量。

### 2.1 创建与常量

```typescript
let v = new Laya.Vector3(1, 2, 3);

// 预定义常量（只读）
Laya.Vector3.ZERO;        // (0, 0, 0)
Laya.Vector3.ONE;         // (1, 1, 1)
Laya.Vector3.Up;          // (0, 1, 0)
Laya.Vector3.UnitX;       // (1, 0, 0)
Laya.Vector3.UnitY;       // (0, 1, 0)
Laya.Vector3.UnitZ;       // (0, 0, 1)
Laya.Vector3.ForwardRH;   // (0, 0, -1) 右手坐标系前方
Laya.Vector3.ForwardLH;   // (0, 0, 1)  左手坐标系前方
```

### 2.2 基本运算

```typescript
let a = new Laya.Vector3(1, 2, 3);
let b = new Laya.Vector3(4, 5, 6);
let out = new Laya.Vector3();

Laya.Vector3.add(a, b, out);           // 加法
Laya.Vector3.subtract(a, b, out);      // 减法
Laya.Vector3.multiply(a, b, out);      // 分量相乘
Laya.Vector3.scale(a, 2, out);         // 缩放
Laya.Vector3.normalize(a, out);        // 归一化

let dot = Laya.Vector3.dot(a, b);      // 点积
Laya.Vector3.cross(a, b, out);         // 叉积

let dist = Laya.Vector3.distance(a, b);           // 距离
let distSq = Laya.Vector3.distanceSquared(a, b);   // 距离平方（避免开方，用于比较）
let len = Laya.Vector3.scalarLength(a);            // 标量长度

// 实例方法
a.set(10, 20, 30);
let l = a.length();
let lsq = a.lengthSquared();
a.normalize();
let d = a.dot(b);
a.cross(b, out);
a.vadd(b, out);       // 实例加法
a.vsub(b, out);       // 实例减法
a.scale(2, out);      // 实例缩放
```

### 2.3 插值

```typescript
let start = new Laya.Vector3(0, 0, 0);
let end = new Laya.Vector3(10, 10, 10);
let out = new Laya.Vector3();

// t 从 0 到 1，实现平滑过渡
Laya.Vector3.lerp(start, end, 0.5, out);  // out = (5, 5, 5)
```

### 2.4 范围限制

```typescript
let min = new Laya.Vector3(0, 0, 0);
let max = new Laya.Vector3(10, 10, 10);
let v = new Laya.Vector3(15, -3, 5);
let out = new Laya.Vector3();

Laya.Vector3.Clamp(v, min, max, out);  // out = (10, 0, 5)

// 取两向量各分量最小/最大值
Laya.Vector3.min(a, b, out);
Laya.Vector3.max(a, b, out);
```

### 2.5 变换

```typescript
let v = new Laya.Vector3(1, 0, 0);
let out = new Laya.Vector3();
let out4 = new Laya.Vector4();

// 通过矩阵变换坐标（会做透视除法归一化）
Laya.Vector3.transformCoordinate(v, matrix, out);

// 通过矩阵变换为四维向量
Laya.Vector3.transformV3ToV4(v, matrix, out4);

// 通过矩阵变换为三维向量
Laya.Vector3.transformV3ToV3(v, matrix, out);

// 通过法线矩阵变换法线方向
Laya.Vector3.TransformNormal(normal, matrix, out);

// 通过四元数旋转向量
Laya.Vector3.transformQuat(v, quaternion, out);
```

## 三、Vector4（四维向量）

`Vector4` 包含 `x`、`y`、`z`、`w` 四个分量，常用于齐次坐标、Shader数据传递。

### 3.1 创建与常量

```typescript
let v = new Laya.Vector4(1, 2, 3, 1);

Laya.Vector4.ZERO;     // (0, 0, 0, 0)
Laya.Vector4.ONE;      // (1, 1, 1, 1)
Laya.Vector4.UnitX;    // (1, 0, 0, 0)
Laya.Vector4.UnitY;    // (0, 1, 0, 0)
Laya.Vector4.UnitZ;    // (0, 0, 1, 0)
Laya.Vector4.UnitW;    // (0, 0, 0, 1)
```

### 3.2 运算方法

```typescript
let a = new Laya.Vector4(1, 2, 3, 4);
let b = new Laya.Vector4(5, 6, 7, 8);
let out = new Laya.Vector4();

Laya.Vector4.add(a, b, out);
Laya.Vector4.subtract(a, b, out);
Laya.Vector4.multiply(a, b, out);
Laya.Vector4.scale(a, 2, out);
Laya.Vector4.normalize(a, out);
Laya.Vector4.lerp(a, b, 0.5, out);

let dot = Laya.Vector4.dot(a, b);
let dist = Laya.Vector4.distance(a, b);

// 通过4x4矩阵变换
Laya.Vector4.transformByM4x4(v, matrix, out);

// 范围限制
Laya.Vector4.Clamp(v, min, max, out);
```

## 四、实用技巧

### 4.1 计算方向向量

```typescript
let direction = new Laya.Vector3();
Laya.Vector3.subtract(targetPos, currentPos, direction);
Laya.Vector3.normalize(direction, direction);
```

### 4.2 计算两向量夹角

![图4-1](/basics/common/math/Vector234/img/4-1.png)

（图4-1）

```typescript
let aNorm = new Laya.Vector3();
let bNorm = new Laya.Vector3();
Laya.Vector3.normalize(a, aNorm);
Laya.Vector3.normalize(b, bNorm);
let cosAngle = Laya.Vector3.dot(aNorm, bNorm);
let angle = Math.acos(cosAngle);          // 弧度
let degrees = angle * 180 / Math.PI;      // 角度
```

### 4.3 判断物体在前方还是后方

```typescript
let toTarget = new Laya.Vector3();
Laya.Vector3.subtract(targetPos, myPos, toTarget);
let dot = Laya.Vector3.dot(forward, toTarget);
// dot > 0：前方  |  dot < 0：后方  |  dot ≈ 0：侧面
```

### 4.4 计算法线（叉积）

![图4-2](/basics/common/math/Vector234/img/4-2.png)

（图4-2）

```typescript
// 由三角形三个顶点计算面法线
let edge1 = new Laya.Vector3();
let edge2 = new Laya.Vector3();
let normal = new Laya.Vector3();
Laya.Vector3.subtract(p1, p0, edge1);
Laya.Vector3.subtract(p2, p0, edge2);
Laya.Vector3.cross(edge1, edge2, normal);
Laya.Vector3.normalize(normal, normal);
```
