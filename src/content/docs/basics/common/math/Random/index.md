---
title: "随机数"
description: "LayaAir引擎提供了 Rand 和 RandX 两种带种子的随机数生成器，支持可复现的随机序列。"
slug: "basics/common/math/random"
---

LayaAir引擎提供了 `Rand` 和 `RandX` 两种带种子的随机数生成器，支持可复现的随机序列。

## 一、概述

与 `Math.random()` 不同，这两个类使用种子初始化，**相同种子产生相同的随机序列**。

| 类 | 种子 | 源码位置 | 特点 |
|---|------|---------|------|
| `Rand` | 32位无符号整型 | `laya/maths/Rand.ts` | 轻量快速 |
| `RandX` | 128位数组（4个数） | `laya/d3/math/RandX.ts` | 基于xorshift算法，质量更高 |

## 二、Rand

### 2.1 创建与使用

```typescript
let rand = new Laya.Rand(12345);   // 种子

rand.getFloat();        // [0, 1) 浮点数
rand.getSignedFloat();  // [-1, 1) 浮点数
rand.getUint();         // 无符号32位整数
```

### 2.2 种子控制

```typescript
// 获取/设置种子
let seed = rand.seed;
rand.seed = 54321;      // 重置随机序列

// seeds 属性（Uint32Array）
let seeds = rand.seeds;
```

### 2.3 静态工具方法

```typescript
// 从无符号32位整数获取 [0,1) 浮点数
let f = Laya.Rand.getFloatFromInt(rand.getUint());

// 从无符号32位整数获取 [0,255] 字节
let b = Laya.Rand.getByteFromInt(rand.getUint());
```

## 三、RandX

基于 xorshift 算法，使用128位种子，随机质量更高。

```typescript
// 种子为4个数的数组
let randx = new Laya.RandX([1, 2, 3, 4]);

randx.random();      // [0, 1) 浮点数
randx.randomint();   // 返回2x32位数组

// 全局默认实例（基于时间种子）
let globalRand = Laya.RandX.defaultRand;
let r = globalRand.random();
```

## 四、常用工具函数

### 4.1 范围随机

```typescript
function randomRange(rand: Laya.Rand, min: number, max: number): number {
    return min + rand.getFloat() * (max - min);
}

function randomInt(rand: Laya.Rand, min: number, max: number): number {
    return Math.floor(min + rand.getFloat() * (max - min + 1));
}
```

### 4.2 随机数组元素

```typescript
function randomElement<T>(rand: Laya.Rand, arr: T[]): T {
    return arr[Math.floor(rand.getFloat() * arr.length)];
}
```

### 4.3 随机方向向量

```typescript
function randomDirection(rand: Laya.Rand): Laya.Vector3 {
    let v = new Laya.Vector3(
        rand.getSignedFloat(),
        rand.getSignedFloat(),
        rand.getSignedFloat()
    );
    Laya.Vector3.normalize(v, v);
    return v;
}
```

## 五、应用示例

### 5.1 可复现的关卡生成

```typescript
function generateLevel(levelId: number): void {
    let rand = new Laya.Rand(levelId);  // 同一ID → 同一结果
    for (let i = 0; i < 50; i++) {
        let x = rand.getSignedFloat() * 100;
        let z = rand.getSignedFloat() * 100;
        let type = Math.floor(rand.getFloat() * 3);
        spawnObstacle(x, z, type);
    }
}
```

### 5.2 战斗概率

```typescript
function isCritical(rand: Laya.Rand, critRate: number): boolean {
    return rand.getFloat() < critRate;
}

function randomDamage(rand: Laya.Rand, baseDamage: number): number {
    let factor = 0.9 + rand.getFloat() * 0.2;  // ±10%浮动
    return Math.round(baseDamage * factor);
}
```
