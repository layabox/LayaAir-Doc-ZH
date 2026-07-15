---
title: "材质资源"
description: "材质（Material）是游戏开发中用于描述物体表面外观的重要资源。在LayaAir引擎中，材质定义了物体的颜色、纹理、光照反应、透明度等视觉属性，是将网格模型从不可见变为可见的关键要素。"
slug: "ide/assets/lmat"
---

> Author: Charley

材质（Material）是游戏开发中用于描述物体表面外观的重要资源。在LayaAir引擎中，材质定义了物体的颜色、纹理、光照反应、透明度等视觉属性，是将网格模型从不可见变为可见的关键要素。

## 一、材质资源概述

### 1.1 什么是材质资源

材质资源是LayaAir引擎中以 `.lmat` 为后缀的资源文件，它包含了着色器（Shader）类型、纹理贴图引用、颜色参数、渲染状态等信息。材质与着色器紧密关联——材质是着色器的参数载体，着色器决定了材质的渲染方式。

简单来说，网格（Mesh）决定了物体的形状，材质（Material）决定了物体的外表。例如，同一个球体网格，使用金属材质和木头材质会呈现完全不同的视觉效果。

### 1.2 LayaAir支持的材质类型

LayaAir引擎支持多种材质类型，按用途可分为以下几类：

**3D模型材质：**

| 材质类型 | 类名 | 说明 |
|---|---|---|
| [PBR标准材质](/ide/assets/lmat/pbr/) | `PBRStandardMaterial` | 基于物理的渲染材质，模拟真实世界的光照效果 |
| [布林冯材质](/ide/assets/lmat/blinphong/) | `BlinnPhongMaterial` | 经典的Blinn-Phong光照模型材质，性能开销较低 |
| [不受光材质](/ide/assets/lmat/unlit/) | `UnlitMaterial` | 不受灯光影响的材质，直接显示纹理颜色 |
| [glTF PBR材质](/ide/assets/lmat/gltfpbr/) | `PBRMaterial` | 遵循glTF标准的PBR材质，用于glTF/glb模型 |

**特殊用途材质：**

| 材质类型 | 类名 | 说明 |
|---|---|---|
| [天空材质](/ide/assets/lmat/sky/) | `SkyBoxMaterial` / `SkyProceduralMaterial` / `SkyPanoramicMaterial` | 用于天空渲染的专用材质 |
| [拖尾材质](/ide/assets/lmat/trail/) | `TrailMaterial` | 用于拖尾特效的材质 |
| [粒子材质](/ide/assets/lmat/particleshuriken/) | `ShurikenParticleMaterial` | 用于粒子系统的材质 |

**2D材质：**

| 材质类型 | 类名 | 说明 |
|---|---|---|
| [2D材质总览](/ide/assets/lmat/2d/) | — | 2D渲染材质体系概述 |
| [2D基础渲染材质](/ide/assets/lmat/2d/baserender2d/) | `BaseRenderNode2D` | 2D渲染节点的基础材质 |

## 二、材质资源的创建

### 2.1 在IDE中创建材质

在LayaAir IDE中，可以通过以下步骤创建材质资源：

1. 在项目资源面板（Assets）中，右键点击目标文件夹；
2. 在弹出菜单中选择 `创建` → `材质`；
3. 新创建的材质文件将出现在资源面板中，默认以 `New Material` 命名。

![](./img/2-1.gif)
（图2-1）

创建完成后，选中该材质文件，右侧的属性面板（Inspector）将显示材质的属性配置界面。

### 2.2 切换材质的Shader类型

材质的外观效果由其使用的Shader决定。在属性面板中，可以通过切换Shader来更改材质类型：

![](./img/2-2.gif)
（图2-2）

IDE内置的Shader类型包括：BlinnPhong、PBR（Standard）、PBR（glTF）、Unlit、Sky Box、Sky Procedural、Sky Panoramic、Trail、ShurikenParticle等。

## 三、材质的通用属性

所有材质类型都继承自 `Material` 基类，因此共享一些通用属性和渲染状态设置。

### 3.1 渲染模式（Render Mode）

渲染模式控制材质的透明度处理方式。不同材质类型支持的渲染模式略有不同，常见的渲染模式包括：

| 渲染模式 | 值 | 说明 |
|---|---|---|
| Opaque（不透明） | 0 | 完全不透明，不进行透明度计算，性能最优 |
| Cutout（透明裁剪） | 1 | 根据Alpha值进行裁剪，像素要么完全可见要么完全不可见 |
| Transparent（透明混合） | 2 | 支持半透明效果，按Alpha值进行混合 |
| Additive（加色法混合） | 3 | 使用加色法混合，常用于发光、特效等场景 |

### 3.2 渲染队列（Render Queue）

渲染队列决定了材质的绘制顺序。`Material` 类提供了三个预定义的渲染队列常量：

| 渲染队列 | 值 | 说明 |
|---|---|---|
| `RENDERQUEUE_OPAQUE` | 2000 | 不透明物体的渲染队列 |
| `RENDERQUEUE_ALPHATEST` | 2450 | Alpha测试物体的渲染队列 |
| `RENDERQUEUE_TRANSPARENT` | 3000 | 透明物体的渲染队列 |

渲染队列值越小越先绘制。不透明物体先绘制可以利用深度缓冲区剔除被遮挡的像素，从而提升渲染性能。

### 3.3 深度和模板设置

`Material` 类还提供了深度和模板缓冲区相关的设置：

| 属性 | 类型 | 说明 |
|---|---|---|
| `depthWrite` | boolean | 是否写入深度缓冲区 |
| `depthTest` | number | 深度测试方式 |
| `depthBias` | boolean | 是否启用深度偏移 |
| `stencilTest` | number | 模板测试方式 |
| `stencilWrite` | boolean | 是否写入模板缓冲区 |
| `stencilRef` | number | 模板参考值 |
| `cull` | number | 面剔除方式 |
| `blend` | number | 混合方式 |

### 3.4 Alpha测试

当需要使用透明裁剪（Cutout）模式时，可以设置Alpha测试相关属性：

- `alphaTest`：是否开启Alpha测试（boolean）
- `alphaTestValue`：Alpha测试的阈值（number），低于此值的像素将被丢弃

## 四、材质资源的使用

### 4.1 通过代码创建和使用材质

以下示例演示了如何通过代码创建材质并应用到3D模型上：

```typescript
// 创建PBR标准材质
let mat = new Laya.PBRStandardMaterial();

// 设置反照率颜色
mat.albedoColor = new Laya.Color(1.0, 0.5, 0.5, 1.0);

// 设置金属度和光滑度
mat.metallic = 0.8;
mat.smoothness = 0.6;

// 加载并设置纹理
Laya.loader.load("res/texture/albedo.png").then((tex: Laya.Texture2D) => {
    mat.albedoTexture = tex;
});

// 将材质应用到MeshRenderer组件
let meshRenderer = sprite3D.getComponent(Laya.MeshRenderer);
meshRenderer.sharedMaterial = mat;
```

### 4.2 加载.lmat材质文件

也可以直接加载IDE中编辑好的 `.lmat` 材质资源：

```typescript
// 加载.lmat材质文件
Laya.loader.load("res/materials/myMaterial.lmat").then((mat: Laya.Material) => {
    let meshRenderer = sprite3D.getComponent(Laya.MeshRenderer);
    meshRenderer.sharedMaterial = mat;
});
```

### 4.3 克隆材质

如果需要基于已有材质创建变体，可以使用 `clone()` 方法：

```typescript
// 克隆材质
let newMat = originalMat.clone();

// 修改克隆后的材质属性
newMat.albedoColor = new Laya.Color(0, 1, 0, 1);

// 应用到其他模型
otherMeshRenderer.sharedMaterial = newMat;
```

### 4.4 通过Shader数据设置自定义属性

`Material` 类提供了丰富的底层API，可以直接操作Shader数据：

```typescript
// 设置Float值
mat.setFloat("u_CustomFloat", 1.5);

// 设置颜色值
mat.setColor("u_CustomColor", new Laya.Color(1, 0, 0, 1));

// 设置纹理
mat.setTexture("u_CustomTexture", myTexture);

// 设置Vector4值
mat.setVector4("u_CustomVec4", new Laya.Vector4(1, 2, 3, 4));

// 添加Shader宏定义
let define = Laya.Shader3D.getDefineByName("CUSTOM_DEFINE");
mat.addDefine(define);
```

## 五、注意事项

1. **默认材质禁止修改**：每种材质类型都有一个静态的 `defaultMaterial` 属性，该默认材质仅供引擎内部使用，开发者不应修改它，否则可能影响其他使用默认材质的对象。

2. **材质与Shader的对应关系**：每种材质类型都有对应的Shader，切换Shader类型会改变材质可用的属性集。确保使用的Shader与目标渲染效果匹配。

3. **性能考量**：透明材质（Transparent/Additive）的渲染开销通常高于不透明材质（Opaque），应尽量减少透明材质的使用。PBR材质虽然效果更真实，但计算量也更大，对于不需要高真实感的场景，可以使用BlinnPhong或Unlit材质。

4. **材质共享与实例化**：多个模型使用同一个材质实例时，修改该材质会影响所有使用它的模型。如需单独调整某个模型的材质，应先克隆材质再修改。
