* [文档首页](index.md)

- 引擎介绍
  * [引擎历史与服务](services.md)
  * [引擎功能概述](basics/readme.md)
  <!-- [hidden:empty-leaf(text=0)] * [引擎架构概述](basics/architecture/readme.md) -->
  * [Unity转LayaAir差异说明](basics/UnityToLayaAir/readme.md)
  * [2.x引擎项目升级说明](basics/2.x-Upgrade/readme.md)
  <!-- [hidden:empty-group] - 学习路线图 -->
  <!-- [hidden:empty-leaf(text=12)] * [程序新手路线](guides/roadmap/beginner/readme.md) -->
  <!-- [hidden:empty-leaf(text=12)] * [程序进阶路线](guides/roadmap/intermediate/readme.md) -->
  <!-- [hidden:empty-leaf(text=12)] * [美术路线](guides/roadmap/artist/readme.md) -->
  <!-- [hidden:empty-leaf(text=12)] * [AI开发路线](guides/roadmap/AI/readme.md) -->
  <!-- [hidden:empty-leaf(text=12)] * [Unity/Cocos迁移路线](guides/roadmap/migration/readme.md) -->
- 快速入门
  - [初学者必读](basics/developmentEnvironment/readme.md)
    * [搭建基础开发环境](basics/developmentEnvironment/download/readme.md)
    * [AI协同开发环境](basics/developmentEnvironment/AIGC/readme.md)
    * [TS语言基础](basics/language/readme.md)
    * [如何阅读LayaAir的API](basics/developmentEnvironment/API/readme.md)
  - [基础开发模块与流程](basics/IDE/readme.md)
    * [IDE主要模块概述](basics/IDE/GUI/readme.md)
    * [创建新项目](basics/IDE/createNewProject/readme.md)
    * [项目工程目录说明](basics/IDE/projecFolders/readme.md)
    * [项目启动入口说明](basics/IDE/entry/readme.md)
    * [开发流程: Hello World](basics/IDE/helloWorld/readme.md)
    * [DevTools调试工具](basics/DevTools/readme.md)
    <!-- [hidden:empty-parent(text=0)] - [游戏入门实例](basics/IDE/gameDevelopment/readme.md) -->
  * [一个2D入门游戏](2D/advanced/2DGame/readme.md)
  <!-- [hidden:empty-leaf(text=60)] * [一个3D入门游戏](3D/advanced/3DGame/readme.md) -->
  * [IDE快捷键与鼠标交互操作大全](basics/IDE/shortcutKeyCombinations/readme.md)
  * [Unity资源导出插件](3D/advanced/Unity/readme.md)
  * [Cocos资源导出插件](basics/developmentEnvironment/CocosToLayaAir/readme.md)
  * [AI开发环境：LayaAir-MCP](basics/developmentEnvironment/IDE-MCP/readme.md)
  * [AI开发工具：LayaIdea](basics\developmentEnvironment\LayaIdea/readme.md)
  
- IDE主要面板
  * [面板布局](basics/IDE/layouts/readme.md)
  - [场景面板](basics/IDE/Scene/readme.md)
  <!-- [hidden:empty-leaf(text=0)] * [2D场景交互工具](basics/IDE/Scene/2DInteraction/readme.md) -->
  <!-- [hidden:empty-leaf(text=0)] * [3D场景交互工具](basics/IDE/Scene/3DInteraction/readme.md) -->
  * [预览运行面板](basics/IDE/Game/readme.md)
  * [属性设置面板](basics/IDE/Inspector/readme.md)
  * [层级面板](basics/IDE/Hierarchy/readme.md)
  * [项目资源面板](basics/IDE/assets/readme.md)
  <!-- [hidden:empty-leaf(text=0)] * [控制台面板](basics/IDE/console/readme.md) -->
  * [小部件面板](IDE/uiEditor/widgets/readme.md)
  * [时间轴动画面板](IDE/animationEditor/timelineGUI/readme.md)
  * [动画状态机面板](IDE/animationEditor/aniController/readme.md)
  - [项目设置面板](basics/IDE/projectSettings/readme.md)
    * [运行配置](basics/IDE/projectSettings/runConfig/readme.md)
    * [引擎模块](basics/IDE/projectSettings/engineModule/readme.md)
    <!-- [hidden:empty-leaf(text=0)] * [UI系统](basics/IDE/projectSettings/uiSystem/readme.md) -->
    * [物理系统](basics/IDE/projectSettings/physicalSystem/readme.md)
    * [WebGPU](basics/IDE/projectSettings/webGPU/readme.md)
    * [启动页](basics/IDE/projectSettings/startPage/readme.md)
    * [统计信息](basics/IDE/projectSettings/statistics/readme.md)
    * [脚本编译](basics/IDE/projectSettings/scriptCompiler/readme.md)
    * [预览服务](basics/IDE/projectSettings/previewServer/readme.md)
    * [预设值](basics/IDE/projectSettings/preset/readme.md)
  * [资源依赖面板](basics/IDE/AssetDependency/readme.md)
  <!-- [hidden:empty-leaf(text=0)] * [帧调试器面板](basics/IDE/frameDebugger/readme.md) -->

- 引擎核心功能
  * [资源加载](basics/common/Loader/readme.md)
  * [场景管理](basics/common/Scene/readme.md)
  * [节点管理](basics/common/Node/readme.md)
  * [事件管理](basics/common/Event/readme.md)
  * [定时器](basics/common/Timer/readme.md)
  * [缓动](basics/common/Tween/readme.md)
  * [对象池](basics/common/Pool/readme.md)
  * [实体组件系统](basics/common/Component/readme.md)
  
- 数学工具
  * [向量](basics/common/math/Vector234/readme.md)
  * [矩阵](basics/common/math/Matrix4/readme.md)
  * [四元数](basics/common/math/Quaternion/readme.md)
  * [射线](basics/common/math/Ray/readme.md)
  * [插值](basics/common/math/Interpolation/readme.md)
  * [贝塞尔曲线](basics/common/math/BezierCurve/readme.md)
  * [随机数](basics/common/math/Random/readme.md)
  
- 2D开发基础
  * [引擎基础概念](basics/common/basicConcepts/readme.md)
  * [UI编辑器基础交互](IDE/uiEditor/basic/readme.md)
  * [UI小部件](IDE/uiEditor/widgets/readme.md)
  <!-- [hidden:empty-parent(text=0)] - [2D基础显示对象](2D/displayObject/readme.md) -->
  * [精灵](2D/displayObject/Sprite/readme.md)
  * [2D区域](IDE/uiEditor/Area2D/readme.md)
  * [动画节点](2D/displayObject/Animation/readme.md)
  * [基础文本](2D/displayObject/Text/readme.md)
  * [开放数据域视图](IDE/uiEditor/uiComponent/OpenDataContextView/readme.md)  
  * [音频节点](2D/displayObject/SoundNode/readme.md)
  * [视频节点](2D/displayObject/VideoNode/readme.md)
  * [图形绘制](IDE/uiEditor/graphics/readme.md)
  <!-- [hidden:empty-leaf(text=0)] * [2D动画概述](2D/animation/readme.md) -->
  * [2D相机](IDE/uiEditor/Area2D/Camera2D/readme.md)
  * [2D粒子](IDE/particleEditor2D/readme.md)
  * [2D拖尾](IDE/Component/2D/2DRender/Trail2DRender/readme.md)
  * [2D网格](IDE/Component/2D/2DRender/Mesh2DRender/readme.md)
  <!-- [hidden:empty-leaf(text=0)] * [2D材质](IDE/assets/lmat/2D/readme.md) -->
  * [自定义2D着色器](2D/advanced/customShader/readme.md)
  - [2D灯光与阴影](IDE/Component/2D/BaseLight2D/readme.md) 
      * [2D方向光](IDE/Component/2D/DirectionLight2D/readme.md)
      * [2D精灵光](IDE/Component/2D/SpriteLight2D/readme.md)
      * [2D自由形态光](IDE/Component/2D/FreeformLight2D/readme.md)
      * [2D聚光灯](IDE/Component/2D/SpotLight2D/readme.md)
      * [2D光遮挡器与阴影](IDE/Component/2D/LightOccluder2D/readme.md)  
  * [2D后处理](IDE/uiEditor/PostProcess/readme.md)
  * [动态图集](2D/dynamicAtlas/readme.md)
  * [UI运行时脚本](IDE/uiEditor/runtime/readme.md)
  * [2D节点使用3D](IDE/uiEditor/use3D/readme.md)
  
- 新UI系统
  * [基础使用](IDE/uiEditor/FairyGUI/readme.md)
  * [控制器](IDE/uiEditor/FairyGUI/controller/readme.md)
  * [关联系统](IDE/uiEditor/FairyGUI/relation/readme.md)
  * [布局容器](IDE/uiEditor/FairyGUI/layout/readme.md)
  * [滚动支持](IDE/uiEditor/FairyGUI/scroller/readme.md)
  * [选择支持](IDE/uiEditor/FairyGUI/selection/readme.md)
  * [精灵组件](IDE/uiEditor/FairyGUI/GWidget/readme.md)
  * [图像组件](IDE/uiEditor/FairyGUI/GImage/readme.md)
  * [序列帧动画组件](IDE/uiEditor/FairyGUI/GMovieClip/readme.md)
  * [装载器组件](IDE/uiEditor/FairyGUI/GLoader/readme.md)
  * [文本组件](IDE/uiEditor/FairyGUI/GTextField/readme.md)
  * [输入文本组件](IDE/uiEditor/FairyGUI/GTextInput/readme.md)
  * [盒子容器组件](IDE/uiEditor/FairyGUI/GBox/readme.md)
  * [面板容器组件](IDE/uiEditor/FairyGUI/GPanel/readme.md)
  * [列表组件](IDE/uiEditor/FairyGUI/GList/readme.md)
  * [树状列表组件](IDE/uiEditor/FairyGUI/GTree/readme.md)
  <!-- [hidden:empty-leaf(text=0)] * [标签组件](IDE/uiEditor/FairyGUI/GLabel/readme.md) -->
  * [按钮组件](IDE/uiEditor/FairyGUI/GButton/readme.md)
  * [下拉选项框组件](IDE/uiEditor/FairyGUI/GComboBox/readme.md)
  * [进度条组件](IDE/uiEditor/FairyGUI/GProgressBar/readme.md)
  * [滑动条组件](IDE/uiEditor/FairyGUI/GSlider/readme.md)
  * [滚动条组件](IDE/uiEditor/FairyGUI/GScrollBar/readme.md)
  * [窗口组件](IDE/uiEditor/FairyGUI/GWindow/readme.md)
  * [根节点与弹窗](IDE/uiEditor/FairyGUI/Groot/readme.md)
  * [国际化](IDE/uiEditor/FairyGUI/i18n/readme.md)
  
- 经典UI系统
  * [基础使用与构成](IDE/uiEditor/uiComponent/readme.md)
  * [UI组件资源命名规则](IDE/uiEditor/uiComponent/namingRule/readme.md)
  * [图像组件](IDE/uiEditor/uiComponent/Image/readme.md)
  * [显示文本组件](IDE/uiEditor/uiComponent/Label/readme.md)
  - [输入文本组件](IDE/uiEditor/uiComponent/TextInput/readme.md)
    * [多行输入文本组件](IDE/uiEditor/uiComponent/TextArea/readme.md)
  - [位图切片组件](IDE/uiEditor/uiComponent/Clip/readme.md)
    * [字体切片组件](IDE/uiEditor/uiComponent/FontClip/readme.md)
  * [按钮组件](IDE/uiEditor/uiComponent/Button/readme.md)
  - [滚动条组件](IDE/uiEditor/uiComponent/scroll/readme.md)
    * [水平滚动条组件](IDE/uiEditor/uiComponent/HScrollBar/readme.md)
    * [垂直滚动条组件](IDE/uiEditor/uiComponent/VScrollBar/readme.md)
  - [滑动条组件](IDE/uiEditor/uiComponent/slider/readme.md)
    * [水平滑动条组件](IDE/uiEditor/uiComponent/HSlider/readme.md)
    * [垂直滑动条组件](IDE/uiEditor/uiComponent/VSlider/readme.md)
  * [进度条组件](IDE/uiEditor/uiComponent/ProgressBar/readme.md)
  - [容器组件](IDE/uiEditor/uiComponent/Box/readme.md)
    * [水平布局容器组件](IDE/uiEditor/uiComponent/HBox/readme.md)
    * [垂直布局容器组件](IDE/uiEditor/uiComponent/VBox/readme.md)
    * [面板容器组件](IDE/uiEditor/uiComponent/Panel/readme.md)
  - [列表组件](IDE/uiEditor/uiComponent/List/readme.md)
    * [树状列表组件](IDE/uiEditor/uiComponent/Tree/readme.md)
  - [选项框](IDE/uiEditor/uiComponent/optionBox/readme.md)
    * [下拉选项框组件](IDE/uiEditor/uiComponent/ComboBox/readme.md)
    * [单选框组件](IDE/uiEditor/uiComponent/Radio/readme.md)
    * [单选框组容器组件](IDE/uiEditor/uiComponent/RadioGroup/readme.md)
    * [复选框组件](IDE/uiEditor/uiComponent/CheckBox/readme.md)
  - [导航菜单](IDE/uiEditor/uiComponent/navigationMenu/readme.md)
    * [导航标签组组件](IDE/uiEditor/uiComponent/Tab/readme.md)
    * [导航容器组件](IDE/uiEditor/uiComponent/ViewStack/readme.md)
  * [取色器组件](IDE/uiEditor/uiComponent/ColorPicker/readme.md)
  * [弹窗视图组件](IDE/uiEditor/Dialog/readme.md)
  
- 3D开发基础
  * [3D概念入门](basics/3D/beginner/readme.md)
  * [3D变换](basics/3D/Transform/readme.md)
  * [3D场景编辑基础交互](IDE/sceneEditor/basic/readme.md)
  * [3D场景环境设置](IDE/sceneEditor/environment/readme.md)
  <!-- [hidden:empty-leaf(text=0)] * [天空盒](IDE/sceneEditor/skybox/readme.md) -->
  <!-- [hidden:empty-leaf(text=0)] * [环境光](IDE/sceneEditor/environmentLight/readme.md) -->
  <!-- [hidden:empty-leaf(text=0)] * [环境反射](IDE/sceneEditor/environmentReflection/readme.md) -->
  <!-- [hidden:empty-leaf(text=0)] * [环境雾](IDE/sceneEditor/environmentFog/readme.md) -->
  <!-- [hidden:empty-leaf(text=0)] * [光照贴图](IDE/sceneEditor/lightmap/readme.md) -->
  * [3D基础显示对象](3D/displayObject/readme.md)
  * [3D精灵](3D/Sprite3D/readme.md)
  * [3D摄像机](3D/Camera/readme.md)
  <!-- [hidden:empty-leaf(text=0)] * [摄像机属性设置](3D/Camera/inspector/readme.md) -->
  <!-- [hidden:empty-leaf(text=0)] * [IDE摄相机使用](3D/Camera/useCamera/readme.md) -->
  <!-- [hidden:empty-leaf(text=0)] * [摄像机动画](3D/Camera/cameraAnimation/readme.md) -->
  - [3D网格](IDE/Component/Mesh/readme.md)
    * [网格过滤器](IDE/Component/Mesh/MeshFilter/readme.md) 
    * [网格渲染器](IDE/Component/Mesh/MeshRenderer/readme.md)
  * [3D灯光与阴影](3D/Light/readme.md)
    * [3D方向光](IDE/Component/3DLight/DirectionLight/readme.md)
    * [3D点光](IDE/Component/3DLight/PointLight/readme.md)
    * [3D聚光灯](IDE/Component/3DLight/SpotLight/readme.md)
    * [3D区域光](IDE/Component/3DLight/AreaLight/readme.md)
    * [3D阴影](IDE/Component/3DLight/Shadow/readme.md)
  * [模型](3D/useModel/readme.md)
  * [3D粒子](IDE/particleEditor3D/readme.md)
  * [3D拖尾](IDE/Component/3DRender/TrailRenderer/readme.md)
  * [Spine动画3D渲染器](IDE/Component/3DRender/Spine3DRenderer/readme.md)
  - [3D材质](IDE/assets/lmat/readme.md)
    * [布林冯材质](IDE/assets/lmat/BlinPhong/readme.md)
    * [不受光材质](IDE/assets/lmat/Unlit/readme.md)
    * [基于物理渲染材质](IDE/assets/lmat/PBR/readme.md)
    * [基于物理渲染材质(glTF)](IDE/assets/lmat/glTFPBR/readme.md)
    * [粒子材质](IDE/assets/lmat/ParticleShuriken/readme.md)
    * [拖尾材质](IDE/assets/lmat/Trail/readme.md)
    * [天空材质](IDE/assets/lmat/Sky/readme.md)
    <!-- [hidden:missing] * [3D动画概述](3D/animationOverview/readme.md) -->
    <!-- [hidden:missing] - [3D渲染](3D/advanced/3DRender/readme.md) -->
  * [反射探针](IDE/Component/ReflectionProbe/readme.md)
  * [体积全局照明](IDE/Component/VolumetricGI/readme.md)
  * [3D后处理](3D/advanced/PostProcessing/readme.md)  
  * [CommandBuffer](3D/advanced/CommandBuffer/readme.md)
  * [3D UI](IDE/uiEditor/3DUI/readme.md)
  * [WebXR](3D/WebXR/readme.md)
  
- 粒子
  * [2D粒子](IDE/particleEditor2D/readme.md)
  * [3D粒子](IDE/particleEditor3D/readme.md)
  
- 动画
  <!-- [hidden:empty-leaf(text=0)] * [2D逐帧动画](2D/animation/frameAnimation/readme.md) -->
  <!-- [hidden:empty-leaf(text=0)] * [缓动动画](basics/animation/tweenAnimation/readme.md) -->
  <!-- [hidden:empty-leaf(text=27)] * [模型内置动画](3D/useModel/animation/readme.md) -->
  * [时间轴动画](IDE/animationEditor/timelineGUI/readme.md)
  * [动画状态机](IDE/animationEditor/aniController/readme.md)
  * [IK动画](IDE/Component/3DAnimation/ChainsIK/readme.md)
  <!-- [hidden:empty-leaf(text=0)] * [摄像机动画](3D/Camera/animation/readme.md) -->
  - [骨骼动画](IDE/uiEditor/uiComponent/skeleton/readme.md)
    * [Spine骨骼动画](IDE/Component/2D/2DRender/Spine2DRenderNode/readme.md)
    * [Spine3D渲染器](IDE/Component/3DRender/Spine3DRenderer/readme.md) 
    * [内置骨骼动画](IDE/uiEditor/uiComponent/skeleton/sk/readme.md)
  * [动画烘焙](IDE/animationEditor/aniBake/readme.md)
  <!-- [hidden:empty-leaf(text=0)] * [动画脚本](basics/animation/aniScript/readme.md) -->
  
- 物理引擎
  - [2D物理系统](IDE/physicsEditor/physics2D/readme.md)
    * [刚体](IDE/Component/physics2D/rigidBody/readme.md)
    * [静态碰撞器](IDE/Component/physics2D/staticCollider/readme.md)
    * [距离关节](IDE/Component/physics2D/distanceJoint/readme.md)
    * [鼠标关节](IDE/Component/physics2D/mouseJoint/readme.md)
    * [焊接关节](IDE/Component/physics2D/weldJoint/readme.md)    
    * [滑轮关节](IDE/Component/physics2D/pulleyJoint/readme.md)
    * [马达关节](IDE/Component/physics2D/motorJoint/readme.md)
    * [旋转关节](IDE/Component/physics2D/revoluteJoint/readme.md)
    * [平移关节](IDE/Component/physics2D/PrismaticJoint/readme.md)
    * [轮子关节](IDE/Component/physics2D/wheelJoint/readme.md)
    * [齿轮关节](IDE/Component/physics2D/gearJoint/readme.md)
    <!-- [hidden:empty-leaf(text=0)] * [2D物理全局配置](basics/IDE/projectSettings/physicalSystem/Physics2DGlobalConfig/readme.md) -->
  - [3D物理系统](IDE/physicsEditor/physics3D/readme.md)
    * [3D刚体](IDE/Component/physics3D/Rigidbody3D/readme.md)
    * [静态碰撞器](IDE/Component/physics3D/StaticCollider/readme.md)
    * [角色控制器](IDE/Component/physics3D/CharacterController/readme.md)
    * [固定约束](IDE/Component/physics3D/FixedConstraint/readme.md)
    * [铰链约束](IDE/Component/physics3D/HingeConstraint/readme.md)
    * [弹簧约束](IDE/Component/physics3D/SpringConstraint/readme.md)
    * [可配置约束](IDE/Component/physics3D/ConfigurableConstraint/readme.md)
    <!-- [hidden:empty-leaf(text=0)] * [3D物理全局配置](basics/IDE/projectSettings/physicalSystem/Physics3DGlobalConfig/readme.md) -->
  * [自定义物理引擎](3D/advanced/customPhysicsEngine/readme.md)
  
- 着色器
<!-- [hidden:empty-leaf(text=0)] * [Shader模板](IDE/assets/shader/readme.md) -->
  * [自定义2D Shader](2D/advanced/customShader/readme.md)
  * [自定义3D Shader](3D/advanced/customShader/readme.md)
  * [计算着色器](basics/WebGPU/ComputeShader/readme.md)

- 蓝图
  * [着色器蓝图](IDE/assets/blueprint/shaderBlueprint/readme.md)
  <!-- [hidden:empty-leaf(text=0)] * [蓝图函数](IDE/assets/blueprint/ShaderFunction/readme.md) -->
  * [程序蓝图](IDE/assets/blueprint/BlueprintScript/readme.md)

- 设备接口与适配  
  * [屏幕适配](basics/common/adaptScreen/readme.md)
  * [浏览器接口](basics/common/Browser/readme.md)
  * [陀螺仪与加速计](basics/common/device/motion/readme.md)
  * [获取位置信息](basics/common/device/geolocation/readme.md)
  * [使用百度地图](basics/common/device/baiduMap/readme.md)
  <!-- [hidden:empty-leaf(text=0)] * [保存游戏](basics/common/saveGameData/readme.md) -->
  
- 音频与视频
  * [音频节点](2D/displayObject/SoundNode/readme.md)
  * [音频播放组件](IDE/Component/Media/SoundPlayer/readme.md)
  * [代码控制音频](basics/common/device/media/readme.md)
  * [视频节点](2D/displayObject/VideoNode/readme.md)
  * [视频播放组件](IDE/Component/Media/VideoPlayer/readme.md)
  * [代码控制视频](basics/common/device/video/readme.md)
  
- 网络通信
  * [HTTP通信](basics/common/network/HTTP/readme.md)
  * [WebSocket通信](basics/common/network/WebSocket/readme.md)
  * [ProtocolBuffer通信](libs/Protobuf/readme.md)
  * [多人联机游戏实战](basics/common/network/multiplayerGame/readme.md)
  
- 性能
  * [性能统计信息的使用](basics/IDE/projectSettings/statistics/readme.md)
  * [2D性能优化](2D/performanceOptimization/readme.md)
  * [3D性能优化](3D/advanced/performanceOptimization/readme.md)
  
- 引擎组件
  * [实体组件系统](basics/common/Component/readme.md)
    - [组件脚本的内置方法](IDE/customComponent/system/readme.md)
    - [组件装饰器说明](IDE/customComponent/decorators/readme.md)
    - [组件属性的代码使用](IDE/customComponent/componentProperties/readme.md)
  - [2D内置组件](IDE/Component/2D/readme.md)
    - [2D渲染](IDE/Component/2D/2DRender/readme.md)
      * [2D网格渲染器](IDE/Component/2D/2DRender/Mesh2DRender/readme.md)
      * [Spine渲染器](IDE/Component/2D/2DRender/Spine2DRenderNode/readme.md)
      * [2D拖尾渲染器](IDE/Component/2D/2DRender/Trail2DRender/readme.md)
      * [2D线渲染器](IDE/Component/2D/2DRender/Line2DRender/readme.md)
      * [瓦片地图层](IDE/Component/2D/TileMapLayer/readme.md)
      * [2D粒子渲染器](IDE/particleEditor2D/readme.md)
      <!-- [hidden:missing] - [2D动画](IDE/Component/2D/2DAnimation/readme.md) -->
    * [2D动画组件](IDE/Component/2D/2DAnimation/Animator2D/readme.md)
    * [序列帧动画组件](IDE/Component/2D/2DAnimation/FrameAnimation/readme.md)
    * [2D灯光](IDE/Component/2D/BaseLight2D/readme.md) 
      * [2D方向光](IDE/Component/2D/DirectionLight2D/readme.md)
      * [2D精灵光](IDE/Component/2D/SpriteLight2D/readme.md)
      * [2D聚光灯](IDE/Component/2D/SpotLight2D/readme.md)
      * [2D自由形态光](IDE/Component/2D/FreeformLight2D/readme.md)
      * [2D光遮挡器与阴影](IDE/Component/2D/LightOccluder2D/readme.md)
    - [2D物理](IDE/physicsEditor/physics2D/readme.md)
      * [刚体](IDE/Component/physics2D/rigidBody/readme.md)
      * [静态碰撞器](IDE/Component/physics2D/staticCollider/readme.md)
      * [距离关节](IDE/Component/physics2D/distanceJoint/readme.md)
      * [鼠标关节](IDE/Component/physics2D/mouseJoint/readme.md)
      * [焊接关节](IDE/Component/physics2D/weldJoint/readme.md)    
      * [滑轮关节](IDE/Component/physics2D/pulleyJoint/readme.md)
      * [马达关节](IDE/Component/physics2D/motorJoint/readme.md)
      * [旋转关节](IDE/Component/physics2D/revoluteJoint/readme.md)
      * [平移关节](IDE/Component/physics2D/PrismaticJoint/readme.md)
      * [轮子关节](IDE/Component/physics2D/wheelJoint/readme.md)
      * [齿轮关节](IDE/Component/physics2D/gearJoint/readme.md)
    - [多媒体](IDE/Component/Media/readme.md)
      * [音频播放组件](IDE/Component/Media/SoundPlayer/readme.md)
      * [视频播放组件](IDE/Component/Media/VideoPlayer/readme.md)
    - [导航寻路](IDE/Component/2D/navMesh/readme.md)
      * [2D导航网格表面](IDE/Component/2D/navMesh/NavMesh2DSurface/readme.md)
      * [2D导航代理](IDE/Component/2D/navMesh/Nav2DAgent/readme.md)
    * [程序蓝图2D组件](IDE/Component/2D/BlueprintScript/readme.md)
  - [3D内置组件](IDE/Component/readme.md)
    - [3D网格](IDE/Component/Mesh/readme.md)
      * [网格过滤器](IDE/Component/Mesh/MeshFilter/readme.md)
      * [网格渲染器](IDE/Component/Mesh/MeshRenderer/readme.md)
    - [3D渲染](IDE/Component/3DRender/readme.md)
      * [粒子渲染器](IDE/particleEditor3D/readme.md)
      * [网格像素线](IDE/Component/PixelLine/readme.md)
      * [拖尾渲染器](IDE/Component/Trail/readme.md)
      * [3D UI](IDE/uiEditor/3DUI/readme.md)
      * [反射探针](IDE/Component/ReflectionProbe/readme.md)
      * [体积全局照明](IDE/Component/VolumetricGI/readme.md)
      * [细节层次组](IDE/Component/LOD/readme.md)
      * [Spine3D渲染器](IDE/Component/3DRender/Spine3DRenderer/readme.md)
    - [3D灯光](IDE/Component/Light/readme.md)
      * [方向光](IDE/Component/Light/DirectionLightCom/readme.md)
      * [点光源](IDE/Component/Light/PointLightCom/readme.md)
      * [聚光灯](IDE/Component/Light/SpotLightCom/readme.md)
      * [区域光](IDE/Component/Light/AreaLightCom/readme.md)
    - [3D动画](IDE/Component/3DAnimation/readme.md)
      * [动画组件](IDE/animationEditor/aniController/readme.md)
      * [IK链](IDE/Component/3DAnimation/ChainsIK/readme.md)
      * [骨骼约束](IDE/Component/3DAnimation/BoneConstraints/readme.md)
    - [3D物理](IDE/Component/physics3D/readme.md)
      * [3D刚体](IDE/Component/physics3D/Rigidbody3D/readme.md)      
      * [静态碰撞器](IDE/Component/physics3D/PhysicsCollider/readme.md)
      * [角色控制器](IDE/Component/physics3D/CharacterController/readme.md)
      * [固定约束](IDE/Component/physics3D/FixedConstraint/readme.md)
      * [铰链约束](IDE/Component/physics3D/HingeConstraint/readme.md)
      * [弹簧约束](IDE/Component/physics3D/SpringConstraint/readme.md)
      * [可配置约束](IDE/Component/physics3D/ConfigurableConstraint/readme.md)      
    - [3D导航寻路](IDE/Component/navMesh/readme.md)
      * [导航网格表面](IDE/Component/navMesh/NavMesh3DSurface/readme.md)
      * [动态导航表面](IDE/Component/navMesh/NavMeshModifileSurface/readme.md)
      * [导航障碍物](IDE/Component/navMesh/NavMeshObstacles/readme.md)
      * [3D导航代理](IDE/Component/navMesh/NavAgent/readme.md)
      * [导航区域链接](IDE/Component/navMesh/NavMeshLink/readme.md)
      * [动态区域体积](IDE/Component/navMesh/NavMeshModifierVolume/readme.md)
    * [程序蓝图3D组件](IDE/Component/BlueprintScript/readme.md)

- IDE资源
  * [模型资源设置](IDE/assets/model/readme.md)
  - [纹理资源](IDE/assets/texture/readme.md)
    * [压缩纹理](IDE/uiEditor/textureCompress/readme.md)
    <!-- [hidden:empty-leaf(text=0)] * [场景资源](IDE/assets/scene/readme.md) -->
  * [预制体](IDE/assets/prefab/readme.md)
  - [材质资源](IDE/assets/lmat/readme.md)
    * [布林冯材质](IDE/assets/lmat/BlinPhong/readme.md)
    * [不受光材质](IDE/assets/lmat/Unlit/readme.md)
    * [基于物理渲染材质](IDE/assets/lmat/PBR/readme.md)
    * [基于物理渲染材质(glTF)](IDE/assets/lmat/glTFPBR/readme.md)
    * [粒子材质](IDE/assets/lmat/ParticleShuriken/readme.md)
    * [拖尾材质](IDE/assets/lmat/Trail/readme.md)
    * [天空材质](IDE/assets/lmat/Sky/readme.md)
    <!-- [hidden:empty-leaf(text=0)] * [2D材质](IDE/assets/lmat/2D/readme.md) -->
    <!-- [hidden:empty-leaf(text=0)] * [着色器资源](IDE/assets/shader/readme.md) -->
  * [立方体贴图](IDE/assets/cubemap/readme.md)
  <!-- [hidden:empty-leaf(text=0)] * [渲染纹理](IDE/assets/renderTexture/readme.md) -->
  <!-- [hidden:empty-leaf(text=0)] * [纹理数组](IDE/assets/texture2DArray/readme.md) -->
  <!-- [hidden:empty-leaf(text=0)] * [镜头光晕数据](IDE/assets/lensFlareData/readme.md) -->
  <!-- [hidden:empty-parent(text=0)] - [蓝图资源](IDE/assets/blueprint/readme.md) -->
  * [着色器蓝图](IDE/assets/blueprint/shaderBlueprint/readme.md)
  <!-- [hidden:empty-leaf(text=0)] * [蓝图函数](IDE/assets/blueprint/blueprint/ShaderFunction/readme.md) -->
  <!-- [hidden:empty-leaf(text=0)] * [程序蓝图](IDE/assets/blueprint/BlueprintSprite/readme.md) -->
  <!-- [hidden:empty-leaf(text=0)] * [动画状态机](IDE/assets/animation/controller/readme.md) -->
  <!-- [hidden:empty-leaf(text=0)] * [动画遮罩](IDE/assets/animation/lavm/readme.md) -->
  <!-- [hidden:empty-leaf(text=0)] * [光照贴图烘焙设置](IDE/assets/LightmapBakeSettings/readme.md) -->
  * [自动图集配置](IDE/assets/atlascfg/readme.md)
  <!-- [hidden:empty-leaf(text=0)] * [国际化配置](IDE/assets/i18ns/readme.md) -->
  <!-- [hidden:empty-leaf(text=0)] * [脚本](IDE/assets/script/readme.md) -->
  * [脚本集定义](IDE/assets/bundledef/readme.md)
  <!-- [hidden:empty-leaf(text=0)] * [位图字体](IDE/assets/bitmapFont/readme.md) -->
  * [瓦片地图](IDE/assets/TileSet/readme.md)
  <!-- [hidden:empty-leaf(text=0)] * [IDE插件安装包](IDE/assets/packages/readme.md) -->
  <!-- [hidden:empty-leaf(text=0)] * [IDE内部资源](IDE/assets/editor-widgets/readme.md) -->
  
- IDE插件
  * [插件开发说明](IDE/layapackage/plug-in/readme.md)
  * [包管理器与资源包导入](IDE/layapackage/pluginImport/readme.md)
  * [资源包导出与上传至商店](IDE/layapackage/exportToStore/readme.md)
  - [官方插件](IDE/layapackage/Layabox/readme.md)
    * [LOD减面插件](IDE/layapackage/Layabox/LOD/readme.md)
    * [3D骨骼动作烘焙插件](IDE/layapackage/Layabox/BakeAnimation/readme.md)
  - [VIP增值功能插件](IDE/layapackage/enterprise/readme.md)
    * [性能分析插件](IDE/layapackage/enterprise/performanceAnalysis/readme.md)
    * [智能资源管理插件](IDE/layapackage/enterprise/addressable/readme.md)
    * [CPU粒子系统](IDE/layapackage/enterprise/cpuParticle/readme.md)
    * [Spine动画烘焙插件](IDE/layapackage/enterprise/spineBake/readme.md)

- 外部资源与脚本使用
  * [引用外部脚本的方式](basics/IDE/importJsLibrary/readme.md)
  * [实战ProtocolBuffer通信](libs/Protobuf/readme.md)
  * [TiledMap地图](2D/TiledMap/readme.md)

- 进阶与实例
  - [2D](2D/advanced/readme.md)
    * [文本进阶使用](2D/advanced/useText/readme.md)
    * [多线程Worker](2D/useWorker/readme.md)
    * [和原生Dom交互](2D/dom/readme.md)
    <!-- [hidden:empty-leaf(text=0)] * [2D角色的控制](2D/advanced/2DGame/controlCharacter/readme.md) -->
    * [一个2D入门游戏](2D/advanced/2DGame/readme.md)
    <!-- [hidden:empty-leaf(text=39)] * [一个2/3D混合游戏](3D/advanced/2_3DMixGame/readme.md) -->
    * [多人联机游戏实战](basics/common/network/multiplayerGame/readme.md) 
  - [3D](3D/advanced/readme.md)
    * [3D角色的控制](3D/advanced/3DGame/controlCharacter/readme.md)
    <!-- [hidden:empty-leaf(text=60)] * [一个3D入门游戏](3D/advanced/3DGame/readme.md) -->
    * [饥荒类型3D游戏](3D/advanced/3DGame/dstGame/readme.md)
  
- 构建发布
  * [通用发布设置](released/generalSetting/readme.md)
  * [命令行发布](released/commandLine/readme.md)
  - [Web发布](released/web/readme.md)
    * [CrazyGames](released/CrazyGames/readme.md)
    * [Poki](released/Poki/readme.md)
  * [Web单文件发布](released/singleWeb/readme.md)
  - [小游戏发布](released/miniGame/readme.md)
    - [微信小游戏](released/miniGame/wechat/readme.md)
      * [微信小游戏Worker使用](released/miniGame/wechat/Worker/readme.md)
    * [抖音小游戏](released/miniGame/byteDance/readme.md)
    * [OPPO小游戏](released/miniGame/OPPO/readme.md)
    * [vivo小游戏](released/miniGame/vivo/readme.md)
    * [小米快游戏](released/miniGame/xiaomi/readme.md)
    * [支付宝小游戏](released/miniGame/alipaygame/readme.md)
    * [淘宝小游戏](released/miniGame/tbgame/readme.md)
    * [华为小游戏](released/miniGame/huawei/readme.md)
    <!-- [hidden:missing] - [淘宝平台](released/miniGame/taobao/readme.md) -->
    <!-- [hidden:missing] * [淘宝小游戏](released/miniGame/taobao/tbgame/readme.md) -->
    <!-- [hidden:missing] * [淘宝小部件](released/miniGame/taobao/tbWidget/readme.md) -->
    <!-- [hidden:missing] * [淘宝小程序](released/miniGame/taobao/tbProgram/readme.md) -->
  - [安装包开发基础](released/native/LayaNative_Introduction/readme.md)
    * [LayaNative不是浏览器](released/native/native_index/readme.md)
    * [横竖屏设置](released/native/screen_orientation/readme.md)
    * [启动页设置](released/native/SplashScreenSettings/readme.md)
    * [APP预览运行器](released/native/previewRunner/readme.md)
    * [关于网络监听](released/native/network/readme.md)
    * [缓存工具-layadcc](released/native/LayaDcc_Tool/readme.md)
    * [原生语言与JS通信](released/native/platform_communication/readme.md)
    * [嵌入字体](released/native/built_in_font/readme.md)
    * [APK扩展机制](released/native/apk_expansion/readme.md)
    * [扩展插件开发](released/native/Extension/readme.md)
    * [其他](released/native/Other_settings/readme.md)
  - [Windows发布](released/Windows/readme.md)
    * [Steam扩展实例](released/Windows/steam/readme.md)
  - [鸿蒙NEXT构建](released/Harmony/readme.md)
    * [鸿蒙NEXT真机调试JavaScript](released/Harmony/debug/readme.md)
    * [鸿蒙NEXT接管后退按钮](released/native/OHOS_BackPress/readme.md) 
  - [Android构建](released/Android/readme.md)
    * [Android真机调试JavaScript](released/Android/debug/readme.md)
    * [Android接管后退按钮](released/native/Android_BackPress/readme.md) 
  * [iOS构建](released/iOS/readme.md)
  * [Linux构建](released/Linux/readme.md)
