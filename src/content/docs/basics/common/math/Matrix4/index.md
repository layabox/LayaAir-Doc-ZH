---
title: "矩阵"
description: "Matrix4x4 是4×4变换矩阵，用于表示3D空间中的平移、旋转、缩放及其组合变换，位于 laya/maths/Matrix4x4.ts。"
slug: "basics/common/math/matrix4"
---

`Matrix4x4` 是4×4变换矩阵，用于表示3D空间中的平移、旋转、缩放及其组合变换，位于 `laya/maths/Matrix4x4.ts`。

## 一、创建矩阵

```typescript
// 创建单位矩阵
let mat = new Laya.Matrix4x4();

// 预定义常量（只读）
Laya.Matrix4x4.DEFAULT;       // 单位矩阵
Laya.Matrix4x4.ZERO;          // 零矩阵
Laya.Matrix4x4.DEFAULTINVERT; // 默认逆矩阵

// 矩阵元素以 Float32Array 存储
let elements: Float32Array = mat.elements;
```

## 二、创建变换矩阵

### 2.1 平移

```typescript
let trans = new Laya.Vector3(10, 5, 0);
let mat = new Laya.Matrix4x4();
Laya.Matrix4x4.createTranslate(trans, mat);
```

### 2.2 缩放

```typescript
let scale = new Laya.Vector3(2, 2, 2);
let mat = new Laya.Matrix4x4();
Laya.Matrix4x4.createScaling(scale, mat);
```

### 2.3 旋转

```typescript
let mat = new Laya.Matrix4x4();

// 绕单轴旋转（弧度）
Laya.Matrix4x4.createRotationX(Math.PI / 4, mat);
Laya.Matrix4x4.createRotationY(Math.PI / 4, mat);
Laya.Matrix4x4.createRotationZ(Math.PI / 4, mat);

// 绕任意轴旋转
let axis = new Laya.Vector3(0, 1, 0);
Laya.Matrix4x4.createRotationAxis(axis, Math.PI / 2, mat);

// 从四元数创建
Laya.Matrix4x4.createRotationQuaternion(quat, mat);
Laya.Matrix4x4.createFromQuaternion(quat, mat);

// 从欧拉角创建
Laya.Matrix4x4.createRotationYawPitchRoll(yaw, pitch, roll, mat);
```

### 2.4 仿射变换（组合平移+旋转+缩放）

```typescript
let trans = new Laya.Vector3(10, 0, 0);
let rot = new Laya.Quaternion();
let scale = new Laya.Vector3(1, 1, 1);
let mat = new Laya.Matrix4x4();

Laya.Matrix4x4.createAffineTransformation(trans, rot, scale, mat);
```

## 三、矩阵运算

```typescript
let a = new Laya.Matrix4x4();
let b = new Laya.Matrix4x4();
let out = new Laya.Matrix4x4();

// 矩阵乘法（组合变换，注意顺序）
Laya.Matrix4x4.multiply(a, b, out);

// 转置
let transposed = mat.transpose();

// 求逆
mat.invert(out);

// 归一化
mat.normalize();

// 判断是否为单位矩阵
let isId = mat.isIdentity();

// 判断两矩阵是否相等
let eq = mat.equalsOtherMatrix(other);
```

## 四、分解矩阵

```typescript
let translation = new Laya.Vector3();
let rotation = new Laya.Quaternion();
let scale = new Laya.Vector3();

// 分解为 平移 + 旋转四元数 + 缩放
mat.decomposeTransRotScale(translation, rotation, scale);

// 分解为 平移 + 旋转矩阵 + 缩放
let rotMat = new Laya.Matrix4x4();
mat.decomposeTransRotMatScale(translation, rotMat, scale);

// 分解旋转为欧拉角
let ypr = new Laya.Vector3();
mat.decomposeYawPitchRoll(ypr);
// ypr.x = yaw, ypr.y = pitch, ypr.z = roll
```

## 五、存取位置与方向

```typescript
let pos = new Laya.Vector3();
let fwd = new Laya.Vector3();

// 获取/设置平移分量
mat.getTranslationVector(pos);
mat.setTranslationVector(new Laya.Vector3(10, 0, 0));
mat.setPosition(new Laya.Vector3(10, 0, 0));

// 获取/设置前向量
mat.getForward(fwd);
mat.setForward(new Laya.Vector3(0, 0, 1));

// 设置旋转分量（四元数）
mat.setRotation(quaternion);

// 判断是否为反向矩阵
let invFront = mat.getInvertFront();
```

## 六、相机矩阵

### 6.1 观察矩阵

```typescript
let eye = new Laya.Vector3(0, 5, -10);
let target = new Laya.Vector3(0, 0, 0);
let up = new Laya.Vector3(0, 1, 0);
let viewMat = new Laya.Matrix4x4();

Laya.Matrix4x4.createLookAt(eye, target, up, viewMat);
```

### 6.2 透视投影

```typescript
let projMat = new Laya.Matrix4x4();
Laya.Matrix4x4.createPerspective(
    Math.PI / 4,   // FOV（弧度）
    16 / 9,        // 宽高比
    0.1,           // 近裁面
    1000,          // 远裁面
    projMat
);
```

### 6.3 正交投影

```typescript
let orthoMat = new Laya.Matrix4x4();
Laya.Matrix4x4.createOrthoOffCenter(-10, 10, -10, 10, 0.1, 100, orthoMat);
```

### 6.4 Billboard矩阵

```typescript
let mat = new Laya.Matrix4x4();
Laya.Matrix4x4.billboard(objectPos, cameraPos, cameraUp, cameraForward, mat);
```
