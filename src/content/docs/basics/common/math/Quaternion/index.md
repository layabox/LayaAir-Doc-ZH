---
title: "四元数"
description: "Quaternion 是3D旋转的核心表示方式，相比欧拉角不会出现万向节死锁问题，且支持平滑插值。位于 laya/maths/Quaternion.ts。"
slug: "basics/common/math/quaternion"
---

`Quaternion` 是3D旋转的核心表示方式，相比欧拉角不会出现万向节死锁问题，且支持平滑插值。位于 `laya/maths/Quaternion.ts`。

## 一、概述

![图1-1](./img/1-1.png)

（图1-1）

四元数由 `(x, y, z, w)` 四个分量组成。相比欧拉角的优势：

- **无万向节死锁**：欧拉角在特定旋转角度下会丢失一个自由度
- **平滑插值**：支持球面线性插值（Slerp），旋转角速度恒定
- **高效组合**：四元数乘法比矩阵乘法更轻量

```typescript
// 创建单位四元数（无旋转）
let q = new Laya.Quaternion(0, 0, 0, 1);

// 预定义常量
Laya.Quaternion.DEFAULT;   // 单位四元数 (0,0,0,1)
Laya.Quaternion.NAN;       // 无效四元数
```

## 二、创建四元数

### 2.1 从欧拉角

```typescript
let q = new Laya.Quaternion();
// yaw(Y轴偏航)、pitch(X轴俯仰)、roll(Z轴翻滚)，单位弧度
Laya.Quaternion.createFromYawPitchRoll(yaw, pitch, roll, q);
```

### 2.2 从轴角

```typescript
let axis = new Laya.Vector3(0, 1, 0);
let q = new Laya.Quaternion();
Laya.Quaternion.createFromAxisAngle(axis, Math.PI / 2, q);
```

### 2.3 从矩阵

```typescript
let q = new Laya.Quaternion();
// 从4x4矩阵
Laya.Quaternion.createFromMatrix4x4(mat4, q);
// 从3x3矩阵
Laya.Quaternion.rotationMatrix(mat3x3, q);
```

## 三、四元数运算

```typescript
let q1 = new Laya.Quaternion();
let q2 = new Laya.Quaternion();
let out = new Laya.Quaternion();

// 组合旋转（乘法）
Laya.Quaternion.multiply(q1, q2, out);

// 加法
Laya.Quaternion.add(q1, q2, out);

// 点积
let dot = Laya.Quaternion.dot(q1, q2);

// 求逆（反向旋转）
Laya.Quaternion.invert(q1, out);
q1.invert(out);

// 归一化
q1.normalize(out);

// 缩放
q1.scaling(2, out);

// 长度
let len = q1.length();
let lenSq = q1.lengthSquared();

// 设置值
q1.setValue(0, 0, 0, 1);
q1.set(0, 0, 0, 1);
q1.identity();   // 重置为单位四元数
```

## 四、旋转插值

### 4.1 线性插值（Lerp）

```typescript
Laya.Quaternion.lerp(startRot, endRot, 0.5, out);
```

### 4.2 球面线性插值（Slerp）

沿球面最短弧插值，旋转角速度恒定，推荐用于旋转动画：

```typescript
Laya.Quaternion.slerp(startRot, endRot, 0.5, out);
```

## 五、朝向控制

```typescript
let q = new Laya.Quaternion();
let eye = new Laya.Vector3(0, 0, 0);
let target = new Laya.Vector3(0, 0, 10);
let up = new Laya.Vector3(0, 1, 0);

// 适用Camera/灯光的观察四元数
Laya.Quaternion.lookAt(eye, target, up, q);

// 适用GameObject的观察四元数
Laya.Quaternion.forwardLookAt(eye, target, up, q);

// 从前方向+上方向计算旋转
let forward = new Laya.Vector3(0, 0, 1);
Laya.Quaternion.rotationLookAt(forward, up, q);
```

## 六、欧拉角互转

```typescript
// 四元数 → 欧拉角
let ypr = new Laya.Vector3();
q.getYawPitchRoll(ypr);
// ypr.x = yaw, ypr.y = pitch, ypr.z = roll

// 欧拉角 → 四元数
Laya.Quaternion.createFromYawPitchRoll(yaw, pitch, roll, q);
```

## 七、追加旋转

```typescript
let q = new Laya.Quaternion();
let out = new Laya.Quaternion();

q.rotateX(Math.PI / 6, out);   // 绕X轴追加旋转
q.rotateY(Math.PI / 6, out);   // 绕Y轴追加旋转
q.rotateZ(Math.PI / 6, out);   // 绕Z轴追加旋转
```

## 八、与向量配合

```typescript
// 通过四元数旋转三维向量
let v = new Laya.Vector3(1, 0, 0);
let rotated = new Laya.Vector3();
Laya.Vector3.transformQuat(v, q, rotated);
```

## 九、实用示例：平滑转向

```typescript
onUpdate(): void {
    let currentRot = (this.owner as Laya.Sprite3D).transform.rotation;
    let targetRot = new Laya.Quaternion();
    Laya.Quaternion.createFromYawPitchRoll(targetYaw, 0, 0, targetRot);

    let smoothRot = new Laya.Quaternion();
    Laya.Quaternion.slerp(currentRot, targetRot, 0.1, smoothRot);
    (this.owner as Laya.Sprite3D).transform.rotation = smoothRot;
}
```
