#  横竖屏设置

本篇文档进一步全面介绍LayaNative横竖屏的设置。

## 一、项目构建前横竖屏的设置

如果想设置横竖屏，通过LayaAirIDE的菜单栏`工具`--> `app构建` ，打开的构建项目窗口里，屏幕方向那里配置好即可，配置方式如下图所示。

<img src="img/0.png" style="zoom:50%;" /> 

当设置屏幕方向后，点击版本发布，在index.js中会添加screenOrientation属性：

```javascript
/**
 * 设置LayaNative屏幕方向，可设置以下值
 * landscape           横屏
 * portrait            竖屏
 * sensor_landscape    横屏(双方向)
 * sensor_portrait     竖屏(双方向)
 */
window.screenOrientation = "portrait"; // 设置屏幕为竖屏
//-----引擎库开始-----
loadLib("libs/laya.core.js")
loadLib("libs/laya.ui.js")
loadLib("libs/laya.d3.js")
//-----引擎库结束-------
loadLib("js/bundle.js");//项目代码js
```

## 二、项目构建后横竖屏的设置

### 2.1 iOS

iOS项目构建成功后，打开resource/config.ini文件，修改`orientation=16`的值，如下图所示：

![图1](img/1.png)

参数的意义如下：
```
orientation=2   //竖屏：IOS home键在下   
orientation=4   //竖屏：IOS home键在上   
orientation=8   //横屏：IOS home键在左   
orientation=16  //横屏：IOS home键在右   
```
orientation的值可以使用`按位或`的方式进行设置，例如:
```   
orientation=6   //代表竖屏可以任意旋转  
orientation=24  //代表横屏可以任意旋转  
```

**注意：** iOS工程项目内的横竖屏设置最好和config.ini设置一致。如果设置的不一致可能会导致未知的情况发生。设置如下图： 

![图](img/2.png)

### 2.2 Android

android项目构建成功，打开AndroidManifest.xml文件，在activity标签内有一个screenOrientation参数，开发者可以根据自己需求进行修改，如下图所示：
![图2](img/3.jpg)

可配置的参数是android的标准，在这不做过多解释，如下所示：

```
"landscape","portrait","full_sensor","sensor_landscape","sensor_portrait","reverse_landscape","reverse_portrait"
```

## 三、执行顺序

应用程序在启动的时候会先读取iOS的config.ini中设置的屏幕方向或android的AndroidManifest.xml中设置的屏幕方向。当解析到index.js的时候再读取屏幕横竖屏设置的值，并重新设置屏幕方向。  

例如：android的AndroidManifest.xml中设置为portrait，index.js中的标签设置为landscape，运行过程中就会发现在android设备上，屏幕会旋转一下，从竖屏旋转成了横屏。

**Tips：建议开发者把两个值设定一致，这样避免程序在执行过程中出现屏幕旋转的现象。**