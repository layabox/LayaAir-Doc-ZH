# WebXR使用说明



## 一、WebXR简介

WebXR 是一组支持将渲染3D场景用来呈现虚拟世界（虚拟现实，也称作VR）或将图形图像添加到现实世界（增强现实，也称作AR）的标准。 WebXR 设备 API 实现了 WebXR 功能集的核心，管理输出设备的选择，以适当的帧速率将3D场景呈现给所选设备，并管理使用输入控制器创建的运动矢量。

从引擎层面上，通过计算应用于场景的透视图，以从每个用户的视角呈现场景，从而在3D中呈现场景，考虑到眼睛之间的常规距离，然后渲染场景两次，每只眼睛一次。然后将生成的图像(场景在一个帧上呈现两次，每只眼睛一半)显示给用户。如图1所示。

![img](img/1.png) 

（图1）



## 二、WebXR的现状与前景

XR我们可以理解为VR与AR的统称。无论是纯虚拟世界沉浸式体验的VR设备，还是现实世界增强显示体验的AR设备，均已开始走入到人们的生活，设备购买的人数不断在增加。这正如同智能手机早期的状态，随着设备越来越轻，佩戴体验越来越友好，相信普及度也会越来越广。

当然，我们也要认清当下的XR设备，如果普及度要达到智能手机的规模，那还是有不少硬指标要实现的。例如，要达到还原现实世界的视觉体验，必须要考虑VR设备的视场角（简称FOV）。人的单眼在没有遮挡的情况下所能看到的水平角度大概是150°左右，垂直角度大概在120°左右。如果我们要想在接近这个的FOV体验下达到视网膜级别的高清显示，那单眼就需要8K，双眼达到16K的视觉显示大小。这对web端的传输带宽和硬件性能的压力，绝对不是短期之内可以解决的。即便是采用毫秒级的眼球追踪技术，也需要达到单眼4K，双眼8K的物理分辨率。考虑到5G的普及速度与硬件性能的提升速度，产品的携带与佩戴体验等。至少也要几年后才勉强可以进入了全民级的基础门槛。

尽管当下和近期无法达到全民应用的级别，但VR的硬件配置、佩戴体验，平台内容质量等等生态都在明显的变好，所以用户量也是不断的增长。再加上2021年元宇宙的概念一波又一波的热度，使得资本市场对这种沉浸式体验的未来前景更加看好。所以2维显示的时代（没有真实空间感），早晚会过渡到沉浸式的3维显示时代。 提前了解与布局XR，率先进入蓝海领域，是不可错过的时代机遇。

LayaAir引擎于2.13版本开始支持WebXR标准，可以在主流VR设备的浏览器中直接运行，也可以在支持WebXR标准的手机端Chrome浏览器中运行。



## 三、LayaAir引擎WebXR应用

#### 3.1 在手机里显示

##### 3.1.1 支持webXR的手机浏览器

在手机里运行的时候，那种能夹住手机的VR盒子就可以满足VR的显示。如动图2所示。

![img](img/2.gif) 

（动图2）

由于现在手机里的浏览器对webXR支持的并不友好，目前已知的WebXR浏览器环境，只有Chrome 安卓79以上的版本和Samsung Internet 11.2以上的版本才可以。并且还需要翻墙去下webXR运行所必须的服务。交互操作方面，当前也没有非常成熟的配套设备。所以，手机上的VR，除了看片之外，对于互动体验的游戏来说，VR完全不适合我们当前的普通手机这种应用场景，除非是没有交互的3D展馆等演示性需求，我们并不推荐基于手机进行VR的开发。



##### 3.1.2 准备好webXR运行环境

本篇文档编写时的硬件设备是OPPO iQOO机型，浏览器环境采用的是Chrome 96。

还需要通过翻墙（中国香港的VPN）去下载安装Google Play应用商店。然后在应用商店里搜索安装Google Play Services For AR与Google VR服务。

> 运行环境不必和本篇完全一样，能安装好Google Play应用商店，和最新版的Chrome浏览器（安卓）即可。

完成以上准备后，才可以正常显示基于webXR标准的链接。



##### 3.1.3 如何用LayaAir开发webXR标准的产品

关于webXR的显示，官网的webXR已经有全部的示例代码，这里对主要的流程进行描述介绍，大家也可以前往官网示例查看完整的示例源码。

首先，场景的加载，摄像机的控制，脚本的添加，UI等，这与普通的3D游戏的编写没有什么区别（所以就不介绍这部分了）。

在启动VR模式之前，

通常开发者需要判断一下当前的环境是否支持webXR的VR模式，再决定是否启动VR模式，或者激活启动VR模式的UI按钮。

是否支持VR的API为：`WebXRExperienceHelper.supportXR("immersive-vr")`

```
//判断浏览器是否支持VR模式,有三种模式immersive-vr\immersive-ar\inline
this.changeActionButton.visible = await WebXRExperienceHelper.supportXR("immersive-vr");
```

immersive-vr就是VR模式的参数，如果是AR模式，参数换成immersive-ar即可。本篇文档只介绍VR模式。

如果检测到支持VR环境，那就可以直接进入VR模式，或者激活进入VR模式的UI按钮，通过侦听按钮的点击来进入VR模式。

```typescript
/** 初始化XR */
async initXR(){
  //创建一个webXR的摄像机
  let caInfo : WebXRCameraInfo = new WebXRCameraInfo();
  //设置远裁面
  caInfo.depthFar = this.camera.farPlane;
  //设置近裁面
  caInfo.depthNear = this.camera.nearPlane;
  //申请XR的交互，传入VR需要的信息
  let webXRSessionManager = await WebXRExperienceHelper.enterXRAsync("imersive-vr","local",caInfo);
  //设置WebXR摄像机
  WebXRExperienceHelper.setWebXRCamera(this.camera, webXRSessionManager);
}
```

通过以上的代码，就可以完成VR的显示了。



#### 3.2 在Oculus里显示与交互

##### 3.2.1 代码部分

无论是手机浏览器还是Oculus VR设备，由于都是基于WebXR标准的，不管是在哪里显示，开发者的代码流程上都是一样的。

只是，相对于手机浏览器，Oculus等专用的VR头显设备，不仅仅是天然的webXR环境（不需要额外安装XR服务），在交互操作方面也非常友好，这也是我们推荐的VR开发与体验环境。

所以，在这个小节里，我们不再介绍VR显示的部分，直接介绍交互部分即可。

```typescript
/** 初始化XR */
async initXR(){
  //创建一个webXR的摄像机
  let caInfo : WebXRCameraInfo = new WebXRCameraInfo();
  //设置远裁面
  caInfo.depthFar = this.camera.farPlane;
  //设置近裁面
  caInfo.depthNear = this.camera.nearPlane;
  //申请XR的交互，传入VR需要的信息
  let webXRSessionManager = await WebXRExperienceHelper.enterXRAsync("imersive-vr","local",caInfo);
  //设置WebXR摄像机
  let webXRCameraManager = WebXRExperienceHelper.setWebXRCamera(this.camera, webXRSessionManager);
  //注意，这里开始对VR进入手柄输入的控制交互
  let webXRInput = WebXEExperienceHelper.setWebXRInput(webXRSessionManager, webXRCameraManager); 
  this.bindMeshRender(webXRInput);
}
bindMeshRender(webXRInput:WebXRInputManager){
        let rightControl = Laya.loader.getRes("res/OculusController/controller.gltf") as Sprite3D;
        let leftControl = Laya.loader.getRes("res/OculusController/controller-left.gltf") as Sprite3D;
        let pixelright = new PixelLineSprite3D(20,"right");
        let pixelleft = new PixelLineSprite3D(20,"left");
        this.scene.addChild(rightControl);
        this.scene.addChild(leftControl);
        this.scene.addChild(pixelright);
        this.scene.addChild(pixelleft);
        webXRInput.bindMeshNode(leftControl,WebXRInput.HANDNESS_LEFT);
        webXRInput.bindMeshNode(rightControl,WebXRInput.HANDNESS_RIGHT);
        webXRInput.bindRayNode(pixelleft,WebXRInput.HANDNESS_LEFT);
        webXRInput.bindRayNode(pixelright,WebXRInput.HANDNESS_RIGHT);
        //获得xrInput的帧循环方案
        webXRInput.getController(WebXRInput.HANDNESS_RIGHT).on(WebXRInput.EVENT_FRAMEUPDATA_WEBXRINPUT,this,this.getRightInput);
        webXRInput.getController(WebXRInput.HANDNESS_LEFT).on(WebXRInput.EVENT_FRAMEUPDATA_WEBXRINPUT,this,this.getLeftInput);
        /**
         * 0    扳机
         * 1    侧扳机
         * 3     摇杆按下
         * 4    X、A键
         * 5    Y、B键
         */
        // 左控制器监听
        let leftXRInput = webXRInput.getController(WebXRInput.HANDNESS_LEFT);
        // 左控制器的按钮事件监听
        leftXRInput.addButtonEvent(0,ButtonGamepad.EVENT_TOUCH_OUT,this,this.LeftbuttonEvent0);
        // 注意同一按钮的不同触发
        leftXRInput.addButtonEvent(1,ButtonGamepad.EVENT_TOUCH_STAY,this,this.LeftbuttonEvent1);
        leftXRInput.addButtonEvent(1,ButtonGamepad.EVENT_TOUCH_OUT,this,this.LeftbuttonEvent1_1);
        leftXRInput.addButtonEvent(3,ButtonGamepad.EVENT_TOUCH_OUT,this,this.LeftbuttonEvent3);
        leftXRInput.addButtonEvent(4,ButtonGamepad.EVENT_TOUCH_ENTER,this,this.LeftbuttonEvent4);
        leftXRInput.addButtonEvent(5,ButtonGamepad.EVENT_TOUCH_OUT,this,this.LeftbuttonEvent5);
        // 左控制器的摇杆事件监听
        leftXRInput.addAxisEvent(1,AxiGamepad.EVENT_OUTPUT,this,this.LeftAxisEvent);
        // 右控制器监听
        let rightXRInput = webXRInput.getController(WebXRInput.HANDNESS_RIGHT);
        // 右控制器的按钮事件监听
        rightXRInput.addButtonEvent(0,ButtonGamepad.EVENT_PRESS_ENTER,this,this.RightbuttonEvent0);
        rightXRInput.addButtonEvent(0,ButtonGamepad.EVENT_PRESS_VALUE, this, this.rightTriggerOn);
        // 注意同一按钮的不同触发
        rightXRInput.addButtonEvent(1,ButtonGamepad.EVENT_PRESS_STAY,this,this.RightbuttonEvent1);
        rightXRInput.addButtonEvent(1,ButtonGamepad.EVENT_PRESS_OUT,this,this.RightbuttonEvent1_1);
        rightXRInput.addButtonEvent(3,ButtonGamepad.EVENT_PRESS_OUT,this,this.RightbuttonEvent3);
        rightXRInput.addButtonEvent(4,ButtonGamepad.EVENT_PRESS_ENTER,this,this.RightbuttonEvent4);
        rightXRInput.addButtonEvent(5,ButtonGamepad.EVENT_PRESS_OUT,this,this.RightbuttonEvent5);
        // 右控制器的摇杆事件监听
        rightXRInput.addAxisEvent(1,AxiGamepad.EVENT_OUTPUT,this,this.RightAxisEvent);
    }
/** 省略的代码请前往官网示例查看 **/
```

> 以上的代码，并不是全部代码，关于oculus显示与交互的全部代码请前往官网示例中查看。



##### 3.2.2 demo测试提示

代码编译好之后，直接前往Oculus Quest自带的浏览器中输入测试地址，即可运行测试效果。

> 提醒：Oculus Quest 设备的帐号激活也需要VPN翻墙
>
> 示例中默认状态为正常模式，需要点击按钮切换到WebXR模式，此时可查看VR示例并通过控制器进行交互。

在设定好VR设备的游戏区域后，打开VR设备的浏览器并跳转到WebXRController示例的地址，等待示例加载运行后，示例中默认状态为正常模式，同样需要点击按钮切换到WebXR模式，此时可查看VR示例并通过控制器进行交互。



**示例的控制器交互说明：**

- 射线检测并拾取物体

在VR场景内可见左右控制器及射线，可以通过射线来检测并拾取物体，具体操作为将射线末端或射线方向指向要拾取的物体，并**持续**按下左右控制器的侧扳机来锁定物体。

- 调节与拾取物体的距离

拾取到物体后，可以通过控制器上的按键来调节与物体的距离；右控制器上，”B“键为增加与物体的距离、”A“键为减小与物体的距离；左控制器上，”Y“键为增加与物体的距离、”X“键为减小与物体的距离。需要注意左控制器的X、Y按键为TOUCH类型的事件，触发灵敏，触摸按键即可触发。

- 调整拾取物体的旋转速度

拾取到物体后，可以通过控制器上的扳机键来控制物体的旋转速度；右控制器的扳机范围为线性范围，可在0~1的范围内通过对扳机施加的力度来控制旋转速度；左控制器的扳机事件也可以为线性范围，为了区别事件触发，左控制器扳机设置为固定值，无法通过左扳机进行调节。

- 调整拾取物体在x、y轴上的旋转角度

拾取到物体后，可以通过控制器上的摇杆来调整物体在x、y轴上的旋转角度，两个控制器摇杆逻辑一致，摇杆的前后移动调整物体在x轴上的角度；摇杆的左右移动调整物体在y轴上的角度。

- 控制器事件监听



控制器事件监听主要分为TOUCH与PRESS两大类，事件监听与实现逻辑如下：

EVENT_TOUCH_ENTER与EVENT_PRESS_ENTER: 对应监听为左右控制器的X、A键，逻辑区别为X键轻触即可触发，A键需要按下才能触发。

EVENT_TOUCH_STAY与EVENT_PRESS_STAY: 对应监听为左右控制器的侧扳机按键，需要持续轻触或持续按下。

EVENT_TOUCH_OUT与EVENT_PRESS_OUT: 对应监听为左右控制器的Y、B键，逻辑区别为Y键轻触离开与B键按下离开。

EVENT_PRESS_VALUE: 对应监听是右扳机这类输出类型存在一个范围的事件。逻辑实现为根据扳机的按压力度来返回浮动的value值。