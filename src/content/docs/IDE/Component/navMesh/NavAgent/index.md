---
title: "3D导航代理（NavAgent）"
description: "NavAgent（3D导航代理）是LayaAir 3D导航系统中用于控制寻路对象在导航网格上移动和寻路的组件。它是寻路对象与导航系统交互的主要组件，负责处理移动、避障和路径规划。"
slug: "ide/component/navmesh/navagent"
---

> Version >= LayaAir 3.2

## 一、概述

`NavAgent`（3D导航代理）是LayaAir 3D导航系统中用于控制寻路对象在导航网格上移动和寻路的组件。它是寻路对象与导航系统交互的主要组件，负责处理移动、避障和路径规划。

该组件继承自`BaseNavAgent`，寻路对象可以是游戏中的角色、NPC、载具等。NavAgent只有圆柱体碰撞形状，这样可以简化计算并保证移动的平滑性。

在LayaAir-IDE的属性面板中，该组件显示为`3D导航代理`。

> 关于3D寻路的整体介绍，请参考[3D寻路](/ide/component/navmesh/)。



## 二、属性说明

### 2.1 代理类型 agentType

设置该导航代理的类型，需要与导航网格表面（NavMeshSurface）中配置的代理类型匹配。默认值为`Humanoid`。



### 2.2 形状参数

| 属性 | 说明 |
| --- | --- |
| 半径 `radius` | 设置代理的碰撞半径。决定了代理在导航网格上的占用区域，并影响其与障碍物的碰撞检测 |
| 高度 `height` | 设置代理的碰撞高度。决定了代理在导航网格上的高度 |
| 高度偏移 `baseOffset` | 设置代理在导航网格上的垂直偏移量。允许将代理的碰撞体悬停在导航网格的一定高度之上 |



### 2.3 移动参数

| 属性 | 说明 |
| --- | --- |
| 速度 `speed` | 设置代理的最大移动速度。较大的速度可以让代理更快地到达目标点 |
| 加速度 `maxAcceleration` | 设置代理的最大加速度。决定了代理在开始移动、停止移动或改变方向时的加速度 |
| 角速度 `angularSpeed` | 设置代理的角速度，影响代理转向的速率 |



### 2.4 规避参数

| 属性 | 说明 |
| --- | --- |
| 规避品质级别 `quality` | 定义代理的回避品质。较高的质量可以生成更准确和优化的路径，但会增加计算开销 |
| 规避优先级别 `priority` | 设置代理的规避优先级。数值越小优先级越高，高优先级的代理在避障时获得更高的优先权 |



### 2.5 导航区域类型 areaMask

设置代理可以通过的导航区域类型。可以限制代理只在特定类型的区域内移动。通过该属性可以控制不同代理对不同区域的通行权限。



## 三、常用API

### 3.1 设置目标点

通过设置`destination`属性来指定代理的目标位置，代理会自动计算路径并移动：

```typescript
let agent = node.getComponent(Laya.NavAgent);
agent.destination = new Laya.Vector3(10, 0, 10);
```



### 3.2 状态查询

| API | 返回类型 | 描述 |
| --- | --- | --- |
| `isOnNavMesh` | `boolean` | 代理是否已绑定到导航网格上 |
| `isOnOffMeshLink` | `boolean` | 代理是否正在OffMeshLink（导航区域链接）上移动 |
| `isStop()` | `boolean` | 代理是否已停止移动 |
| `destination` | `Vector3` | 获取代理当前的目标位置 |



### 3.3 路径查询

| API | 返回类型 | 描述 |
| --- | --- | --- |
| `getCurrentPath()` | `Array<NavigationPathData>` | 获取代理当前的路径数据 |
| `findDistanceToWall()` | `{dist, pos, normal}` | 查找到最近墙面的距离、位置和法线 |

