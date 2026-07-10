---
title: "动态图集"
description: "图集（Atlas）是一种将多张小纹理整合为一张大纹理的资源优化技术，能够有效减少 DrawCall、降低纹理切换次数、减少 I/O 请求，是 2D 产品中提升渲染性能与显存利用率的关键手段之一。"
slug: "2d/dynamicatlas"
---

## 一、概述

图集（Atlas）是一种将多张小纹理整合为一张大纹理的资源优化技术，能够有效减少 DrawCall、降低纹理切换次数、减少 I/O 请求，是 2D 产品中提升渲染性能与显存利用率的关键手段之一。

在LayaAir3.4.0版本之前，引擎中使用图集需要开发者提前制作好图集文件，或是通过配置自动图集规则在预览或发布阶段统一生成图集纹理与数据。这种方式在资源结构稳定的项目中表现良好，但在某些存在散图数量庞大、且不同用户加载资源集合不一致的项目中，也存在着图集冗余、显存浪费，影响加载效率等问题。

动态图集（DynamicAtlasManager）这一功能很好的解决了这个问题。动态图集可以在运行时根据实际加载的内容动态合并纹理，在保证灵活性的同时，显著提升了渲染性能与资源利用率。



## 二、使用动态图集

### 2.1 创建管理器

使用动态图集需要在脚本中实例化`DynamicAtlasManager`对象：

```typescript
//接口
constructor(config?: Partial<DynamicAtlasConfig>, autoReplace: boolean = true)
```

参数说明：

`config`是创建动态图集需要的配置参数，各项参数内容如下：

| 参数             | 类型               | 默认值       | 说明                                             |
| ---------------- | ------------------ | ------------ | ------------------------------------------------ |
| largeTextureSize | [number, number]   | [1024, 1024] | 大纹理尺寸 [宽度, 高度]                          |
| maxLargeTextures | number             | 4            | 最大大纹理数量                                   |
| textureUnitSize  | number             | 16           | 小纹理单元尺寸(用于空间划分)                     |
| extendSize       | number             | 1            | 纹理扩边尺寸(防止纹理采样渗透)                   |
| textureFormat    | RenderTargetFormat | R8G8B8A8     | 纹理格式                                         |
| immediately      | boolean            | false        | 是否立即执行合并(true则同步,false则延迟到下一帧) |
| autoExtend       | boolean            | true         | 空间不足时是否自动扩展大纹理数量                 |
| checkDuplicate   | boolean            | true         | 是否检查重复纹理(避免重复添加)                   |

`autoReplace`：是否自动替换原始纹理。设为 true时,添加纹理后会自动将原纹理对象替换为图集中的纹理引用,无需手动调用替换方法。

```typescript
//使用示例
const config: Partial<DynamicAtlasConfig> = {
    largeTextureSize: [512, 512],  // 大纹理尺寸 512x512
    maxLargeTextures: 2,           // 最多2张大纹理
    textureUnitSize: 16,           // 小纹理单元尺寸 16x16
    extendSize: 1,                 // 纹理扩边尺寸 1像素
    immediately: true,             // 立即执行合并
    autoExtend: true,              // 自动扩展大纹理数量
    checkDuplicate: true           // 查重
};
this.dynamicAtlasManager = new DynamicAtlasManager(config, true);
```



### 2.2 添加纹理到图集

#### 添加单个纹理对象

```typescript
//接口
addTexture(texture: Texture, scale: number = 1.0, largeTextureIndex: number = -1): boolean
```

参数说明：

`texture`: 要添加的 Texture 对象。

`scale`： 缩放系数。

`largeTextureIndex`：大纹理的索引，指定添加到哪个大纹理。

```typescript
//使用示例
const texture = Laya.loader.getRes("resources/hero.png", Laya.Loader.IMAGE);
const success = atlasManager.addTexture(texture, 0.5, 0); // 添加到指定图集,缩放为 0.5
```

---

#### 通过 URL 添加纹理


```typescript
//接口
addTextureByUrl(url: string, scale: number = 1.0, largeTextureIndex: number = -1): boolean
```

通过这种方法添加纹理需要保证纹理已通过Laya.loader.load() 预加载。

参数说明：

`url`：资源的URL。

`scale`：缩放系数。

`largeTextureIndex`：大纹理的索引，指定添加到哪个大纹理。

```typescript
//使用示例
Laya.loader.load("resources/hero.png").then(() => {
    // 加载完成后添加到图集
    atlasManager.addTextureByUrl("resources/hero.png");
});
```

---

#### 批量添加纹理

```typescript
//接口
addTextures(textures: Texture[], scale: number = 1.0, largeTextureIndex: number = -1): number
addTexturesByUrl(urls: string[], scale: number = 1.0, largeTextureIndex: number = -1): number
```

批量添加多个纹理，提高效率。接口会返回成功添加的纹理数量。

参数说明：

`textures`：要添加的纹理数组。

`urls`：要添加的资源URL数组。

`scale`：缩放系数。

`largeTextureIndex`：大纹理的索引，指定添加到哪个大纹理。

```typescript
//使用示例
const textures = [texture1, texture2, texture3];
const successCount = atlasManager.addTextures(textures);
console.log(`成功添加 ${successCount} 个纹理`);

const urls = [
    "resources/ui/button.png",
    "resources/ui/panel.png",
    "resources/ui/icon.png"
];
Laya.loader.load(urls).then(() => {
    atlasManager.addTexturesByUrl(urls);
});
```



### 2.3 移除纹理

#### 移除指定纹理

```typescript
//接口
removeTexture(textureId: number, largeTextureIndex: number = -1, event: boolean = true): boolean
```

参数说明：

`textureId`：纹理的 ID (可从 texture.bitmap.id 获取)

`largeTextureIndex`：指定从哪个大纹理移除(-1 表示从所有大纹理移除)

`event`：是否触发 Event.CHANGE 事件(默认 true)

```typescript
//使用示例
const texture = Laya.loader.getRes("resources/hero.png", Laya.Loader.IMAGE);
const textureId = texture.bitmap.id;
atlasManager.removeTexture(textureId);
```

---

#### 通过 URL 移除纹理


```typescript
//接口
removeTextureByUrl(url: string, largeTextureIndex: number = -1): boolean
```

参数说明：

`url`：纹理URL。

`largeTextureIndex`：指定从哪个大纹理移除(-1 表示从所有大纹理移除)。

```typescript
//使用示例
atlasManager.removeTextureByUrl("resources/hero.png");
```



### 2.4 手动替换纹理

#### 替换单个纹理

```typescript
//接口
replaceOriginalTexture(textureId: number): boolean
```

手动将原始纹理对象替换为图集中的纹理引用，当创建管理器时 autoReplace=false,需要手动控制替换时机。

参数说明：

`textureId`：纹理的索引。

```typescript
//使用示例
// 创建非自动替换的管理器
const atlasManager = new DynamicAtlasManager({}, false);

// 添加纹理
atlasManager.addTexture(texture);

// 手动触发替换(例如在帧末尾统一替换)
atlasManager.replaceOriginalTexture(texture.bitmap.id);
```

---

#### 批量替换纹理

```typescript
//接口
replaceOriginalTextures(textureIds?: number[]): number
```

批量手动替换原始纹理对象。如果不传参数或传入空数组，则替换所有已添加到图集的纹理。

参数说明：

`textureIds`：要替换的纹理 ID 数组。如果为空或不传，则替换所有已添加的纹理。

```typescript
//使用示例
const ids = [texture1.bitmap.id, texture2.bitmap.id];
const count = atlasManager.replaceOriginalTextures(ids);
console.log(`成功替换 ${count} 个纹理`);
```



### 2.5 查询纹理信息

#### 获取纹理信息对象

```typescript
//接口
getTextureInfo(textureId: number): TextureInfo | null
```

获取指定纹理在图集中的详细信息。

参数说明：

`textureId`：纹理的 ID。

返回值：TextureInfo 对象或 null（如果不存在）。

TextureInfo 包含的信息：

- `source`：原始 Texture2D 对象
- `textureId`：纹理 ID
- `url`：纹理 URL
- `uv`：在大图集中的 UV 坐标（Vector4）
- `largeTextureIndex`：所在的大纹理索引
- `isInAtlas`：是否已添加到图集
- `merged`：是否已合并完成
- `referenceCount`：引用计数

```typescript
//使用示例
const texture = Laya.loader.getRes("resources/hero.png", Laya.Loader.IMAGE);
const info = atlasManager.getTextureInfo(texture.bitmap.id);

if (info) {
    console.log(`纹理位于图集 ${info.largeTextureIndex}`);
    console.log(`UV 坐标: ${info.uv}`);
    console.log(`是否已合并: ${info.merged}`);
}
```

---

#### 通过 URL 获取纹理信息

```typescript
//接口
getTextureInfoByUrl(url: string): TextureInfo | null
```

通过资源 URL 获取纹理在图集中的详细信息。

参数说明：

`url`：纹理资源的 URL。

返回值：TextureInfo 对象或 null（如果不存在）。

```typescript
//使用示例
const info = atlasManager.getTextureInfoByUrl("resources/hero.png");

if (info) {
    console.log(`纹理 URL: ${info.url}`);
    console.log(`大纹理索引: ${info.largeTextureIndex}`);
}
```

---

#### 获取大纹理对象

```typescript
//接口
getLargeTexture(largeTextureIndex: number): LargeTexBase
```

获取指定索引的底层大纹理对象，用于调试或高级操作。

参数说明：

`largeTextureIndex`：大纹理的索引。

返回值：LargeTexBase 对象。

```typescript
//使用示例
// 获取第一个大纹理
const largeTex = atlasManager.getLargeTexture(0);
console.log(`大纹理尺寸: ${largeTex.width} x ${largeTex.height}`);
```

---

#### 获取所有大纹理对象

```typescript
//接口
getAllLargeTextures(): LargeTexBase[]
```

获取所有底层大纹理对象的数组，用于调试或高级操作。

返回值：LargeTexBase 对象数组。

```typescript
//使用示例
const allTextures = atlasManager.getAllLargeTextures();
console.log(`当前使用了 ${allTextures.length} 个大纹理`);

// 遍历所有大纹理
allTextures.forEach((largeTex, index) => {
    console.log(`大纹理 ${index}: ${largeTex.width} x ${largeTex.height}`);
});
```

---

#### 获取纹理数量

```typescript
//接口
getTextureCount(): number
```

获取当前图集中的纹理总数量。

返回值：纹理数量。

```typescript
//使用示例
const count = atlasManager.getTextureCount();
console.log(`图集中共有 ${count} 个纹理`);
```

---



### 2.6 统计与监控

#### 获取统计信息

```typescript
//接口
getStatistics(): object
```

获取图集的详细统计信息，用于性能监控和调试。

返回值：包含以下字段的统计对象：

- `textureCount`：图集中的纹理数量
- `usageRate`：图集空间使用率（0-1）
- `gpuMemoryUsage`：GPU 显存占用（字节）
- `largeTextureCount`：当前大纹理数量
- `config`：配置信息

```typescript
//使用示例
const stats = atlasManager.getStatistics();

console.log(`纹理数量: ${stats.textureCount}`);
console.log(`空间使用率: ${(stats.usageRate * 100).toFixed(2)}%`);
console.log(`显存占用: ${(stats.gpuMemoryUsage / 1024 / 1024).toFixed(2)} MB`);
console.log(`大纹理数量: ${stats.largeTextureCount}/${stats.config.maxLargeTextures}`);

// 定期监控
Laya.timer.loop(1000, this, () => {
    const stats = atlasManager.getStatistics();
    if (stats.usageRate > 0.9) {
        console.warn("图集空间使用率超过 90%，考虑增加 maxLargeTextures");
    }
});
```



### 2.7 清理与销毁

#### 清理未使用的纹理

```typescript
//接口
cleanupUnusedTextures(forceClean: boolean = false): number
```

清理引用计数为 0 的纹理，释放图集空间。适用于场景切换后清理旧场景的纹理、定期清理释放内存或资源重新整理。

参数说明：

`forceClean`：如果为 true，清理所有纹理；为 false 则只清理引用计数为 0 的纹理。默认 false。

返回值：清理的纹理数量。

```typescript
//使用示例
// 清理未使用的纹理（引用计数为 0）
const cleaned = atlasManager.cleanupUnusedTextures();
console.log(`清理了 ${cleaned} 个未使用的纹理`);

// 强制清理所有纹理
const total = atlasManager.cleanupUnusedTextures(true);
console.log(`强制清理了 ${total} 个纹理`);

// 场景切换时清理
function onSceneSwitch() {
    atlasManager.cleanupUnusedTextures();
}
```

---

#### 清空图集

```typescript
//接口
clear(): void
```

清空所有纹理，释放大纹理资源。会清理 RenderTarget，需要注意引用关系。

```typescript
//使用示例
// 清空图集
atlasManager.clear();
console.log("图集已清空");
```

---

#### 销毁管理器

```typescript
//接口
destroy(): void
```

完全销毁管理器，释放所有资源。销毁后管理器不可再使用。

```typescript
//使用示例
// 销毁管理器
atlasManager.destroy();
console.log("管理器已销毁");
```



## 三、使用建议

1. **合理设置图集尺寸**
   根据目标设备选择合适的 `largeTextureSize`：
   - 移动设备：1024x1024 或 2048x2048
   - PC/WebGL：2048x2048 或 4096x4096
   - 注意设备的最大纹理尺寸限制

2. **启用查重**
   保持 `checkDuplicate=true`，避免重复添加相同纹理浪费空间。

3. **扩边设置**
   如果纹理有缩放或旋转操作，建议 `extendSize` 设为 1-2，防止采样渗透。如果纹理不会缩放旋转，可设为 0 提高性能。

4. **批量操作**
   使用 `addTextures` 等批量 API 而非循环调用单个 API，提高效率。

5. **定期清理**
   在场景切换或资源重新整理时，调用 `cleanupUnusedTextures()` 释放空间。

6. **监控使用率**
   通过 `getStatistics()` 监控图集使用率，使用率接近 100% 时考虑增加 `maxLargeTextures`。

7. **合理使用 immediately**
   通常保持 `immediately=false`，让合并操作延迟到空闲时间；只有在必须同步完成时才设为 true。

8. **纹理单元尺寸设置**
   `textureUnitSize` 应该是常用纹理尺寸的公约数，例如如果纹理多为 32、64、128 像素，设为 16 或 32 比较合适。

9. **自动替换的选择**
   - 如果希望透明使用图集，设置 `autoReplace=true`
   - 如果需要精确控制替换时机（如批量替换），设置 `autoReplace=false` 并手动调用替换方法

10. **图集数量控制**
    `maxLargeTextures` 不宜过大，每个大纹理都会占用 RenderTarget 资源。建议根据实际需要设置，通常 4-8 个足够。





