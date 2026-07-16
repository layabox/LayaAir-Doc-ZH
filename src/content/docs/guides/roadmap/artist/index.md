---
title: "美术路线"
description: "面向美术与技术美术（TA）的 LayaAir3 学习地图：从资源导入、UI制作、动画特效到材质光照与上线验收，建立可协作、可复用的内容生产流程。"
slug: "guides/roadmap/artist"
---

这条路线面向美术同学（2D UI、3D 场景、美术技术支持、TA）在 LayaAir3 中的完整制作流程。目标不是把你训练成程序员，而是让你在 IDE 内能独立完成**资源入库、表现搭建、效果调优、跨端验收**，并能与程序高效协作。

:::tip[适合谁]
- 会使用 Photoshop / Blender / Maya / Spine / FairyGUI 等任一内容工具，想把资源稳定落地到 LayaAir3
- 需要负责 UI、角色/场景表现、粒子特效、材质光照、动画烘焙等内容生产
- 希望减少“在 DCC 里好看，进引擎就不对”的返工
:::

:::caution[不适合当作]
- 编程入门路线 → 请先看 [程序新手路线](/guides/roadmap/beginner/)
- 引擎工程化与性能深潜主路线 → 请看 [程序进阶路线](/guides/roadmap/intermediate/)
:::


## 美术同学的核心协作原则

- **先定规范再批量生产**：命名、目录、尺寸、压缩策略先统一，后续返工会少很多。  
- **先搭“中性资产”再做风格化**：先保证结构正确、可复用，再做风格细节。  
- **每个阶段都要有可验收结果**：不是“看起来差不多”，而是有明确检查项。  


## 学习地图（建议 3～6 周）


## 阶段 0：认识工作台与资源流（0.5 天）

**目标**：理解 IDE 各面板在美术流程中的作用，知道“资源从导入到场景生效”的路径。  

- **建议阅读**
  - [IDE主要模块概述](/basics/ide/gui/)
  - [项目资源面板](/basics/ide/assets/)
  - [层级面板](/basics/ide/hierarchy/)
  - [属性设置面板](/basics/ide/inspector/)

- **产出**
  - 能独立完成：导入一个资源 → 放入场景 → 调属性 → 预览运行


## 阶段 1：资源规范与资产入库（0.5～1 周）

**目标**：建立可协作的资源规范，减少后期“找不到、重名、重复导入、压缩错误”。  

- **建议阅读**
  - [项目工程目录说明](/basics/ide/projecfolders/)
  - [IDE资源总览](/ide/assets/)
  - [纹理资源](/ide/assets/texture/)
  - [压缩纹理](/ide/uieditor/texturecompress/)
  - [自动图集配置](/ide/assets/atlascfg/)
  - [预制体](/ide/assets/prefab/)

- **产出**
  - 一份团队可执行的资源规范（命名、目录、图集策略、压缩策略、版本约定）
  - 一个“标准资源包”示例（含纹理、预制体、图集配置）


## 阶段 2：UI 生产流程（1 周）

**目标**：掌握经典 UI 与新 UI（FairyGUI 同构）的基本制作与复用方式。  

- **建议阅读**
  - [UI编辑器基础交互](/ide/uieditor/basic/)
  - [经典UI系统：基础使用与构成](/ide/uieditor/uicomponent/)
  - [新UI系统：基础使用](/ide/uieditor/fairygui/)
  - [Dialog](/ide/uieditor/dialog/)
  - [2D区域与相机](/ide/uieditor/area2d/)

- **产出**
  - 完成一套可复用 UI 页面（主界面 + 弹窗 + 列表/滚动）
  - 至少 1 个页面做到“皮肤替换不改结构”


## 阶段 3：动画与角色表现（0.5～1 周）

**目标**：把静态资源升级为可演出的内容，建立“状态-动作-过渡”的动画思维。  

- **建议阅读**
  - [动画编辑器](/ide/animationeditor/)
  - [动画状态机](/ide/animationeditor/anicontroller/)
  - [时间轴动画](/ide/animationeditor/timelinegui/)
  - [动画烘焙](/ide/animationeditor/anibake/)
  - [骨骼动画](/ide/uieditor/uicomponent/skeleton/)

- **产出**
  - 角色或 UI 动画状态机（至少包含待机/播放/过渡）
  - 一份动画命名与切片规范，便于程序侧调用


## 阶段 4：材质、灯光与场景质感（1～2 周）

**目标**：把“能显示”提升到“有质感”，并能解释当前效果由哪些参数决定。  

- **建议阅读**
  - [3D场景环境设置](/ide/sceneeditor/environment/)
  - [天空盒](/ide/sceneeditor/skybox/)
  - [环境光](/ide/sceneeditor/environmentlight/)
  - [环境反射](/ide/sceneeditor/environmentreflection/)
  - [材质资源概述](/ide/assets/lmat/)
  - [PBR材质](/ide/assets/lmat/pbr/)
  - [glTF PBR材质](/ide/assets/lmat/gltfpbr/)
  - [光照贴图烘焙设置](/ide/assets/lightmapbakesettings/)

- **产出**
  - 一个可复用的场景 LookDev 模板（光照 + 后处理 + 材质参数预设）
  - 一份“材质球与贴图通道”对照表，供团队统一标准


## 阶段 5：粒子、拖尾、后处理与蓝图（0.5～1 周）

**目标**：掌握高频特效制作工具，形成可批量复用的效果资产。  

- **建议阅读**
  - [2D粒子编辑器](/ide/particleeditor2d/)
  - [3D粒子编辑器](/ide/particleeditor3d/)
  - [2D拖尾组件](/ide/component/2d/2drender/trail2drender/)
  - [3D拖尾组件](/ide/component/3drender/trailrenderer/)
  - [2D后处理](/ide/uieditor/postprocess/)
  - [3D后处理](/3d/advanced/postprocessing/)
  - [蓝图资源概述](/ide/assets/blueprint/)
  - [着色器蓝图](/ide/assets/blueprint/shaderblueprint/)

- **产出**
  - 一组标准化特效资产（命名、参数、适用场景、性能等级）
  - 一个蓝图驱动的小效果（例如材质参数动画、交互触发特效）


## 阶段 6：性能验收与发布前检查（持续迭代）

**目标**：保证美术质量的同时，满足目标平台性能与包体要求。  

- **建议阅读**
  - [性能优化总览](/basics/performanceoptimization/)
  - [Stat性能面板](/basics/performanceoptimization/stat_panel/)
  - [渲染性能优化](/basics/performanceoptimization/rendering/)
  - [内存优化](/basics/performanceoptimization/memory/)
  - [Web 发布](/released/web/)
  - [小游戏发布总览](/released/minigame/)

- **产出**
  - 一份美术验收清单（分辨率适配、纹理压缩、粒子预算、drawcall/内存阈值）
  - 至少 2 个目标平台的效果一致性与性能对比记录


## 美术与程序协作的最小交付清单

建议每个功能包都至少包含：

- 资源目录与命名说明（可直接给版本管理）
- 预制体入口（场景中可直接拖用）
- 参数说明文档（哪些可调、默认值、推荐范围）
- 性能标注（贴图尺寸、粒子数量、是否高成本后处理）

这样程序同学接入成本最低，问题定位也会更快。


## 你现在应该从哪开始？

- 如果你是第一次接触引擎：先做 **阶段 0 + 阶段 1 + 阶段 2**。  
- 如果你主要负责 3D 场景表现：优先 **阶段 4 + 阶段 5**。  
- 如果你已在项目中：立刻补上 **阶段 6 验收清单**，把返工前置。  

把这条路线走完，你会从“会做单个资源”升级为“能设计并维护一整套美术内容生产管线”。