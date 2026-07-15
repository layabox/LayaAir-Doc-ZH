---
title: "网格过滤器（MeshFilter）"
description: "MeshFilter（网格过滤器）组件用于持有和管理网格数据的引用。它继承自 Component 类，与同一节点上的 MeshRenderer 组件配合使用——MeshFilter 负责提供网格（Mesh）数据，MeshRenderer 负责将该网格渲染到场景中。"
slug: "ide/component/mesh/meshfilter"
---

## 一、概述

MeshFilter（网格过滤器）组件用于持有和管理网格数据的引用。它继承自 Component 类，与同一节点上的 MeshRenderer 组件配合使用——MeshFilter 负责提供网格（Mesh）数据，MeshRenderer 负责将该网格渲染到场景中。

在 IDE 的组件面板中，MeshFilter 组件的面板效果如图1-1所示：

![1-1](./img/1-1.png)

（图1-1）

## 二、属性说明

### 2.1 sharedMesh（共享网格）

MeshFilter 最核心的属性是 `sharedMesh`，类型为 `Mesh`。它持有对网格资源的引用，决定了该节点显示什么形状的模型。

在 IDE 面板中，点击 Mesh 属性名称旁的箭头标识符，可以调出选取列表，从中选择想要引用的网格资源。

> **注意**：当更改 MeshFilter 引用的网格时，该节点上其他组件的设置不会自动改变。例如，MeshRenderer 不会更新其设置，这可能导致渲染结果不符合预期。如果发生这种情况，请根据需要手动调整其他组件的设置。

## 三、代码示例

### 3.1 设置网格

```typescript
// 创建 3D 节点
let sprite3D = new Laya.Sprite3D();
scene.addChild(sprite3D);

// 添加 MeshFilter 组件
let meshFilter = sprite3D.addComponent(Laya.MeshFilter);

// 设置内置基础网格
meshFilter.sharedMesh = Laya.PrimitiveMesh.createBox(1, 1, 1);       // 立方体
meshFilter.sharedMesh = Laya.PrimitiveMesh.createSphere(0.5, 32, 32); // 球体
meshFilter.sharedMesh = Laya.PrimitiveMesh.createCylinder(0.5, 2);    // 圆柱
meshFilter.sharedMesh = Laya.PrimitiveMesh.createCapsule(0.5, 2);     // 胶囊体
meshFilter.sharedMesh = Laya.PrimitiveMesh.createPlane(10, 10);       // 平面
```

### 3.2 获取和替换网格

```typescript
// 获取当前网格引用
let meshFilter = node.getComponent(Laya.MeshFilter);
let currentMesh = meshFilter.sharedMesh;

// 通过加载替换网格
Laya.Mesh.load("res/models/myModel.lm", Laya.Handler.create(this, (mesh: Laya.Mesh) => {
    meshFilter.sharedMesh = mesh;
}));
```

### 3.3 配合 MeshRenderer 使用

MeshFilter 和 MeshRenderer 通常成对出现在同一个节点上：

```typescript
let sprite3D = new Laya.Sprite3D();
scene.addChild(sprite3D);

// 添加网格过滤器和网格渲染器
let meshFilter = sprite3D.addComponent(Laya.MeshFilter);
let meshRenderer = sprite3D.addComponent(Laya.MeshRenderer);

// 设置网格数据
meshFilter.sharedMesh = Laya.PrimitiveMesh.createBox(1, 1, 1);

// 设置渲染材质
meshRenderer.material = new Laya.BlinnPhongMaterial();
```

> 创建基础模型请参考 [3D基础显示对象](/ide/3d/displayobject/)
