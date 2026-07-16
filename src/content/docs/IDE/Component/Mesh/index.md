---
title: "组件系统之Mesh"
description: "Mesh是指模型的网格数据，3D模型是由多边形拼接而成，而一个复杂的多边形，实际上是由多个三角形拼接而成。所以一个3D模型的表面是由多个彼此相连的三角面构成。三维空间中，构成这些三角形的顶点的数据以及三角形的索引数据的集合就是Mesh。"
slug: "ide/component/mesh"
---

## 一、概述

Mesh是指模型的网格数据，3D模型是由多边形拼接而成，而一个复杂的多边形，实际上是由多个三角形拼接而成。所以一个3D模型的表面是由多个彼此相连的三角面构成。三维空间中，构成这些三角形的顶点的数据以及三角形的索引数据的集合就是Mesh。

![1-1](./img/1-1.png)

（图1-1）

## 二、Mesh数据

一个网格数据中包含了很多的数据信息，Shader中常见的顶点，法线等数据都是从Mesh数据中获取而来。

一个标准的网格数据由以下的几部分属性组成：

- Vertex：三维空间中位置的集合
- Topology：Mesh的基本片元类型
- Index：索引数据，描述顶点组合片元的整数集合

**Vertex：顶点数据**

每个顶点可以具有以下的属性内容：

- position顶点

顶点位置标示顶点在模型空间的具体位置，在引擎中使用这个值来确定Mesh的表面，所有的网格都需要这个顶点属性，为必须项

- normal法线

顶点法线表示从顶点位置的表面直接 "向外" 指出的方向。

- tangent切线

顶点切线表示沿着顶点位置表面的" u"(水平纹理)轴指向的方向

- color颜色

顶点颜色表示顶点的基本颜色(如果有的话)。

- uv坐标

一个网格最多可以包含八组纹理坐标。纹理坐标通常称为 UV，这些集合称为通道。

- 骨骼（可选）

在蒙皮网格中，混合指数表示哪些骨骼影响顶点，骨骼重量描述这些骨骼对顶点的影响程度

**Topology：片元拓扑**

网格的拓扑结构定义了索引缓冲区的结构，而索引缓冲区又描述了顶点位置如何组合成面。每种拓扑类型在索引数组中使用不同数量的元素来定义单个面

LayaAir支持以下网格拓扑:

- Triangle
- Quad
- Lines
- Points

**Index Data : 索引数据**

索引数组包含引用顶点位置数组中元素的整数。这些整数称为索引

例如，对于包含下列值的索引数组的网格:

0,1,2,3,4,5

如果网格具有三角形拓扑，那么前三个元素(0,1,2)识别一个三角形，而后三个元素(3,4,5)识别另一个三角形。顶点可以贡献的面的数量没有限制。这意味着同一个顶点可以多次出现在索引数组中。

## 三、Mesh API

Mesh 类提供了丰富的方法来访问和修改网格数据：

| 方法 | 说明 |
| --- | --- |
| `getPositions(positions: Vector3[])` | 获取顶点位置数据 |
| `setPositions(positions: Vector3[])` | 设置顶点位置数据 |
| `getNormals(normals: Vector3[])` | 获取法线数据 |
| `setNormals(normals: Vector3[])` | 设置法线数据 |
| `getTangents(tangents: Vector4[])` | 获取切线数据 |
| `setTangents(tangents: Vector4[])` | 设置切线数据 |
| `getColors(colors: Color[])` | 获取颜色数据 |
| `setColors(colors: Color[])` | 设置颜色数据 |
| `getUVs(uvs: Vector2[], channel)` | 获取纹理坐标数据 |
| `setUVs(uvs: Vector2[], channel)` | 设置纹理坐标数据 |
| `getIndices()` | 获取索引数据 |
| `setIndices(indices)` | 设置索引数据 |
| `getSubMesh(index: number)` | 获取子网格 |
| `calculateBounds()` | 从顶点数据生成包围盒 |
| `markAsUnreadbale()` | 标记为不可读以减少内存 |
| `clone()` | 克隆网格 |

常用属性：

| 属性 | 说明 |
| --- | --- |
| `vertexCount` | 顶点个数 |
| `indexCount` | 索引个数 |
| `subMeshCount` | 子网格个数 |
| `indexFormat` | 索引格式 |
| `bounds` | 包围盒 |

## 四、相关组件

在 LayaAir 中，要将网格渲染到场景中，需要 MeshFilter 和 MeshRenderer 两个组件配合使用：

- [MeshRenderer（网格渲染器）](/ide/component/mesh/meshrenderer/)：负责渲染网格，设置材质、阴影、光照贴图等
- [MeshFilter（网格过滤器）](/ide/component/mesh/meshfilter/)：负责持有网格数据的引用

> 创建基础模型请参考[3D基础显示对象](/ide/3d/displayobject/)
