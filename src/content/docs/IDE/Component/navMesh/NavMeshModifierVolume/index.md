---
title: "动态区域体积（NavMeshModifierVolume）"
description: "NavMeshModifierVolume（动态区域体积）是LayaAir 3D导航系统中用于在三维体积区域内修改导航网格属性的组件。它允许在场景中定义一个盒状三维区域，通过设置不同的区域标记（areaFlag）来影响代理在该区域内的寻路行为。"
slug: "ide/component/navmesh/navmeshmodifiervolume"
---

> Version >= LayaAir 3.2

## 一、概述

`NavMeshModifierVolume`（动态区域体积）是LayaAir 3D导航系统中用于在三维体积区域内修改导航网格属性的组件。它允许在场景中定义一个盒状三维区域，通过设置不同的区域标记（areaFlag）来影响代理在该区域内的寻路行为。

该组件继承自`Component`。在LayaAir-IDE的属性面板中，该组件显示为`动态区域体积`。

> 关于3D寻路的整体介绍，请参考[3D寻路](/ide/component/navmesh/)。



## 二、属性说明

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| 代理类型 `agentType` | `string` | 设置该体积区域适用的代理类型 |
| 区域标记 `areaFlag` | `string` | 设置该体积区域的区域类型标记，如walk、unwalk、water等 |
| 中心 `center` | `Vector3` | 设置体积区域的中心位置偏移 |
| 大小 `size` | `Vector3` | 设置体积区域的尺寸（宽、高、长） |



## 三、使用说明

### 3.1 基本用法

动态区域体积通常用于在已有的导航网格上覆盖一片区域，并为该区域设置不同的代价值（cost）。该代价值会影响寻路时经过该区域的代价计算：

- 将区域标记设置为`unwalk`，代理在寻路时会绕开此区域。
- 将区域标记设置为较高cost的区域类型，代理会倾向于避开该区域，但在必要时仍会通过。
- 将区域标记设置为较低cost的区域类型，代理会倾向于通过该区域。

### 3.2 注意事项

- 动态区域体积不需要烘焙，设置后即时生效。
- 通过调整`center`和`size`属性可以灵活控制体积区域的位置和大小。
- 该组件的位置会跟随所在节点的世界变换而变化。

