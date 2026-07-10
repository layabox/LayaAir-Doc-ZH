---
title: "射线"
description: "Ray 类表示从一个起点沿指定方向无限延伸的射线，位于 laya/d3/math/Ray.ts。广泛用于物体拾取、碰撞检测、视线判断等场景。"
slug: "basics/common/math/ray"
---

`Ray` 类表示从一个起点沿指定方向无限延伸的射线，位于 `laya/d3/math/Ray.ts`。广泛用于物体拾取、碰撞检测、视线判断等场景。

## 一、基本结构

```typescript
// 创建射线：起点 + 方向（归一化向量）
let origin = new Laya.Vector3(0, 10, 0);
let direction = new Laya.Vector3(0, -1, 0);
let ray = new Laya.Ray(origin, direction);

// 属性
ray.origin;      // Vector3 - 起点
ray.direction;   // Vector3 - 方向
```

## 二、获取射线上的点

```typescript
// at(t, out)：获取距起点距离 t 处的点
let point = new Laya.Vector3();
ray.at(5, point);
// point = origin + direction * 5
```

## 三、屏幕射线（鼠标拾取）

最常用的场景：将2D屏幕坐标转换为3D空间射线。

### 3.1 生成射线

![图3-1](/basics/common/math/Ray/img/3-1.png)

（图3-1）

```typescript
let ray = new Laya.Ray(new Laya.Vector3(), new Laya.Vector3());
let mousePos = new Laya.Vector2(Laya.InputManager.mouseX, Laya.InputManager.mouseY);

// 从相机和屏幕坐标生成射线
camera.viewportPointToRay(mousePos, ray);
```

### 3.2 物理射线检测（单个）

```typescript
let hitResult = new Laya.HitResult();

if (scene.physicsSimulation.rayCast(ray, hitResult)) {
    let hitNode = hitResult.collider.owner;     // 击中的节点
    let hitPoint = hitResult.point;              // 击中点坐标
    let hitNormal = hitResult.normal;            // 击中面法线
    let hitFraction = hitResult.hitFraction;     // 击中距离比例
}
```

### 3.3 射线检测全部物体

```typescript
let results: Laya.HitResult[] = [];
if (scene.physicsSimulation.rayCastAll(ray, results)) {
    for (let result of results) {
        console.log("击中：", result.collider.owner.name);
    }
}
```

## 四、应用示例

### 4.1 点击地面定位

```typescript
onMouseDown(): void {
    let ray = new Laya.Ray(new Laya.Vector3(), new Laya.Vector3());
    let mousePos = new Laya.Vector2(Laya.InputManager.mouseX, Laya.InputManager.mouseY);
    this.camera.viewportPointToRay(mousePos, ray);

    let hitResult = new Laya.HitResult();
    if (this.scene.physicsSimulation.rayCast(ray, hitResult)) {
        this.player.transform.position = hitResult.point;
    }
}
```

### 4.2 前方障碍检测

```typescript
let origin = this.owner.transform.position;
let forward = new Laya.Vector3();
this.owner.transform.getForward(forward);
let ray = new Laya.Ray(origin, forward);

let hitResult = new Laya.HitResult();
if (this.scene.physicsSimulation.rayCast(ray, hitResult, 100)) {
    console.log("前方有障碍物");
}
```
