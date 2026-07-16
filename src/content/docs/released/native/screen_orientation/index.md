---
title: "横竖屏设置"
description: "本篇文档进一步全面介绍LayaNative屏幕方向的设置。"
slug: "released/native/screen-orientation"
---

本篇文档进一步全面介绍LayaNative屏幕方向的设置。

## 一、发布前在IDE中设置

如果想设置屏幕方向，通过LayaAir-IDE的构建发布面板 ，在Android/iOS发布的选项里，如图1-1所示，屏幕方向这里配置好即可，

![1-1](./img/1-1.png)

（图1-1）

建议开发者设置的方向与项目设置面板中的一致。

![1-2](./img/1-2.png)

（图1-2）

`横屏`：设备水平放置，宽度大于高度。屏幕内容横向显示。

`竖屏`：设备垂直放置，高度大于宽度。屏幕内容纵向显示。

`反向横屏`：设备水平放置，但屏幕内容旋转180度。

`反向竖屏`：设备垂直放置，但屏幕内容旋转180度。

`传感器横屏旋转`：根据设备的重力传感器，在两种横屏方向之间自动切换。

`传感器竖屏旋转`：根据设备的重力传感器，在两种竖屏方向之间自动切换。

`随传感器旋转`：根据设备的重力传感器，在所有四个方向之间自动切换。



## 二、项目构建后横竖屏的设置

构建发布后，可以修改原生项目相应配置设置横竖屏。

### 2.1 iOS

iOS项目构建成功后，打开XCode工程设置页面，根据需要勾选相应Device Orientation选项，如图2-1所示：



<img src="./img/2-2.png" alt="2-2" style="zoom: 50%;" />

（图2-1）


### 2.2 Android

Android项目构建成功后，打开`AndroidManifest.xml`文件，在activity标签内有一个screenOrientation参数，开发者可以根据自己需求进行修改，如图2-3所示：

<img src="./img/2-3.png" alt="2-3" style="zoom:80%;" />

（图2-3）

landscape：横屏

portrait：竖屏

reverseLandscape：反向横屏

reversePortrait：反向竖屏

sensorLandscape：传感器横屏旋转

sensorPortrait：传感器竖屏旋转

fullSensor：随传感器旋转


## 三、通过代码动态设置横竖屏

还可以通过代码动态设置横竖屏，接口与微信小游戏接口类似：
> Version >= LayaAir 3.4

```typescript
    /**
    * 设置LayaNative屏幕方向，可设置以下值：
    * landscape：横屏
    * portrait：竖屏
    * reverseLandscape：反向横屏
    * reversePortrait：反向竖屏
    * sensorLandscape：传感器横屏旋转
    * sensorPortrait：传感器竖屏旋转
    * fullSensor：随传感器旋转
    */
    conch.setDeviceOrientation({
        value: value,
        success: function () {
            console.log("success");
        },
        fail: function () {
            console.log("fail");
        },
        complete: function () {
            console.log("complete");
        },
    });
```