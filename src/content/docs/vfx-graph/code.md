---
title: "代码篇 — 用代码控制 VFX"
description: "用代码在运行时驱动 VFX：获取 VisualEffect 组件、播放控制、动态读写图级属性、发送事件、接收 Output Event 回调、自定义 Spawn 回调与绑定 SkinnedMesh 源，附完整最小示例与 API 速查表。"
slug: "vfx-graph/code"
---

> 本篇讲如何在运行时用代码驱动 VFX：播放控制、动态改属性、发事件、接收回调。所有 API 以引擎 `VisualEffect.ts` 实际签名为准。

> 代码控制的对象是场景节点上的 **`VisualEffect` 组件**。`.vfx` 在 IDE 里编好、挂到节点后，运行时通过该组件操作。

---

## 1. 获取 VisualEffect 组件

`VisualEffect` 是引擎组件。在挂了该组件的节点脚本里获取：

```typescript
// 标准方式
const vfx = this.owner.getComponent(Laya.VisualEffect);

// 工程示例里用的稳妥写法（VisualEffect 是引擎符号，按组件名兜底查找）
private findVisualEffect(): any {
    const comps = (this.owner as any)._components;
    if (!comps) return null;
    for (const c of comps) {
        if (c && c.constructor?.name === "VisualEffect") return c;
    }
    return null;
}
```

> 参考：`LayaVFXSample/src/CustomSpawnerDemo.ts`、`OutputEventDemo.ts` 等 Demo 脚本均用此模式。

---

## 2. 播放控制

| API | 签名 | 作用 |
|---|---|---|
| `play()` | `play(): void` | 发送 `OnPlay` 事件启动生成（并触发 PreWarm） |
| `stop()` | `stop(): void` | 发送 `OnStop` 停止生成（已存在粒子继续模拟到死亡） |
| `pause` | `get/set pause: boolean` | 暂停/恢复模拟（暂停时 dt=0，保留已积累的时间） |
| `playRate` | `playRate: number`（默认 1.0） | 播放速率倍数（0.5=半速，2=两倍速） |
| `advanceOneFrame()` | `advanceOneFrame(): void` | 单步前进一帧（调试用） |

```typescript
const vfx = this.owner.getComponent(Laya.VisualEffect);
vfx.play();            // 启动
vfx.playRate = 0.5;    // 半速
vfx.pause = true;      // 暂停
vfx.pause = false;     // 恢复
vfx.stop();            // 停止
```

---

## 3. 基础字段

| 字段 | 签名 | 说明 |
|---|---|---|
| `asset` | `get/set asset: VFXAsset` | 资源；赋值时自动初始化整套系统 |
| `randomSeed` | `randomSeed: number`（默认 0） | 随机种子（`resetSeedOnPlay=false` 时生效，可复现） |
| `resetSeedOnPlay` | `resetSeedOnPlay: boolean`（默认 true） | 每次 play 是否重置种子 |
| `initialEvent` | `get/set initialEvent: string` | 初始事件名（默认取 asset 的 `initialEventName`） |
| `mainCamera` | `get/set mainCamera: Camera` | 主相机（billboard 朝向计算用，默认自动取场景主相机） |

---

## 4. 动态读写图级属性（Property）

对应 Blackboard 里 `Exposed=true` 的属性。**按类型选对应方法**：

| API | 签名 |
|---|---|
| Float | `setPropertyFloat(name: string, value: number): void` |
| Vec2 | `setPropertyVec2(name: string, x: number, y: number): void` |
| Vec3 | `setPropertyVec3(name: string, x: number, y: number, z: number): void` |
| Vec4 / Color | `setPropertyVec4(name: string, x: number, y: number, z: number, w: number): void` |

```typescript
vfx.setPropertyFloat("EmissionRate", 25);
vfx.setPropertyVec3("WindDir", 1, 0, 0);
vfx.setPropertyVec4("TintColor", 1, 0, 0, 1);   // 颜色用 Vec4 (rgba)
```

> `name` 必须与 Blackboard 里的属性名一致。Color 没有专门的 set 方法，用 `setPropertyVec4` 传 rgba。
> 这与 IDE 组件的 **Properties Override 面板**（[图级与组件](/vfx-graph/graph-and-components/#5-properties-override-面板组件-inspector)）是同一套机制 —— 面板里勾选覆盖的值，运行时也是通过这些方法应用。

### 绑定外部 GPU 缓冲

```typescript
setBuffer(name: string, buffer: Laya.DeviceBuffer): void
```
把外部 `DeviceBuffer` 绑到图里的 `sampleGraphicsBuffer` Operator，用于自定义数据驱动粒子（参考 `src/GraphicsBufferDemo.ts`）。

---

## 5. 发送事件

除了 `OnPlay`/`OnStop`，可触发自定义事件（图里加 Event 节点自定义名字）：

| API | 签名 | 说明 |
|---|---|---|
| 按 ID | `sendEvent(id: number, attribute?: VFXEventAttribute): void` | id 由 `Shader3D.propertyNameToID(name)` 得到 |
| 按名 | `sendEventByName(name: string, attribute?: VFXEventAttribute): void` | 直接用事件名 |
| 创建载荷 | `createEventAttribute(): VFXEventAttribute` | 创建事件附带属性对象 |

```typescript
// 简单触发
vfx.sendEventByName("Explode");

// 带载荷触发（把数据传给 Spawn/Initialize 的 Source 属性）
const attr = vfx.createEventAttribute();
attr.setVector3("position", hit.x, hit.y, hit.z);
attr.setFloat("size", 2.0);
vfx.sendEventByName("Explode", attr);
```

**VFXEventAttribute 设值方法**：`setFloat / setVector2 / setVector3 / setVector4 / setBool / setInt / setUint`。

---

## 6. 接收 Output Event 回调（GPU → CPU）

图里有 **Output Event** Context 时，粒子触发的事件会异步回调到 CPU（通常 1-2 帧延迟，因 GPU readback）。直接赋值 `outputEventReceived` 回调：

```typescript
vfx.outputEventReceived = (args) => {
    // args 字段:
    //   eventName: string   — Output Event 的事件名
    //   particleId: number  — 源粒子 id
    //   position: number[]  — [x, y, z]
    //   velocity: number[]  — [vx, vy, vz]
    //   age: number, lifetime: number
    //   color: number[]     — [r, g, b, a]
    //   size: number
    if (args.eventName === "OnHit") {
        this.spawnDecal(args.position[0], args.position[1], args.position[2]);
    }
};

// 卸载
vfx.outputEventReceived = null;
```

> 典型用途：粒子落地播音效、命中生成贴花、烟花炸点生成二级特效（CPU 侧逻辑）。参考 `src/OutputEventDemo.ts`。

---

## 7. 自定义 Spawn 回调（脚本驱动生成数量）

图里用 **Custom Spawner** Block（配 Callback Name）时，用代码决定每帧生成多少：

```typescript
setCustomSpawnCallback(name: string, callback: IVFXCustomSpawnCallback): void
clearCustomSpawnCallback(name: string): void
```

```typescript
// 回调签名: (state, dt) => 本帧要生成的粒子数
vfx.setCustomSpawnCallback("onClick", (state, dt) => {
    const base = 40 * dt;          // 基础每秒 40
    const burst = this._pending;   // 鼠标点击排队的爆发量
    this._pending = 0;
    return base + burst;
});

// 节点销毁时清理
vfx.clearCustomSpawnCallback("onClick");
```

> `name` 对应 Block 的 Callback Name。参考 `src/CustomSpawnerDemo.ts`（点击屏幕喷一团粒子）。

---

## 8. 绑定 SkinnedMesh 源（粒子贴骨骼动画角色）

图里用 `sampleSkinnedMeshXxx` Operator 时，用代码把场景里的 SkinnedMeshRenderer 注册进去：

```typescript
setSkinnedMeshSource(name: string, renderer: SkinnedMeshRenderer): void
clearSkinnedMeshSource(name: string): void
```

```typescript
const smr = monkey.getComponent(Laya.SkinnedMeshRenderer);
vfx.setSkinnedMeshSource("monkey", smr);   // "monkey" 与 Operator 的 Source Name 一致
```

> 用途：粒子贴在角色表面随骨骼动画运动（溶解/受击火星）。参考 `src/SampleSkinnedMeshDemo.ts`。

---

## 9. 完整最小代码示例

```typescript
const { regClass } = Laya;

@regClass()
export class MyVfxController extends Laya.Script {
    declare owner: Laya.Sprite3D;
    private _vfx: Laya.VisualEffect;

    onStart(): void {
        this._vfx = this.owner.getComponent(Laya.VisualEffect);
        this._vfx.play();
        this._vfx.setPropertyFloat("EmissionRate", 50);

        // 接收粒子命中事件
        this._vfx.outputEventReceived = (args) => {
            console.log("hit at", args.position);
        };
    }

    // 点击时触发一次爆发事件
    onClick(): void {
        this._vfx.sendEventByName("Burst");
    }

    onDestroy(): void {
        if (this._vfx) this._vfx.outputEventReceived = null;
    }
}
```

---

## API 速查表

| 分类 | API |
|---|---|
| 播放 | `play()` / `stop()` / `pause` / `playRate` / `advanceOneFrame()` |
| 字段 | `asset` / `randomSeed` / `resetSeedOnPlay` / `initialEvent` / `mainCamera` |
| 属性 | `setPropertyFloat/Vec2/Vec3/Vec4(name, ...)` / `setBuffer(name, buffer)` |
| 事件 | `sendEvent(id, attr?)` / `sendEventByName(name, attr?)` / `createEventAttribute()` |
| 回调 | `outputEventReceived = (args) => {...}` |
| 自定义生成 | `setCustomSpawnCallback(name, cb)` / `clearCustomSpawnCallback(name)` |
| 蒙皮源 | `setSkinnedMeshSource(name, renderer)` / `clearSkinnedMeshSource(name)` |

---

## 下一步

➡️ [属性详解·Operator](/vfx-graph/operator/)（第二批）
➡️ [示例验证索引](/vfx-graph/examples/)（第二批）
