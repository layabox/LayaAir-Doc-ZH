# LayaNative综述

LayaNative是LayaAir引擎针对移动端原生App的开发、测试、发布的一套完整的开发解决方案，但不局限于LayaAir引擎。LayaNative以LayaPlayer为核心运行时的基础上，利用反射机制、渠道对接方案提供开发者在原生App上进行二次开放和渠道对接，并提供测试器、构建工具，为开发者将html5项目打包、发布成原生App提供便利。



## 一、概述

**LayaNative包含以下内容:**


### 1. 测试器：
下载安装测试器后，通过扫码URL二维码的方式，帮助开发者快速在移动端看到运行效果, 节省大量反复打包测试的时间。

> 3.x版本的测试器正在加速开发中。



### 2. 构建工具：

构建工具支持自动打包成为各平台的安装包（例如exe、apk、ipa），并且可选择快速构建移动端APP原生项目工程，然后使用Android Studio、XCode 等开发工具进行开发。



### 3. 反射机制:
通过反射机制，开发者可以实现JavaScript与原生语言(Android/Java 或 iOS/Objective-C)的相互调用，通过反射机制开发者可以很方便的对应用程序进行二次扩展。



### 4. 渠道对接工具内(conchMarket):
渠道对接工具内嵌了渠道常用对接API，例如: 登录, 分享, 充值,好友关系链等；



### 5. LayaPlayer：
LayaPlayer是LayaNative最核心的部分，它是一个基于JavaScript脚本引擎 + openGLES硬件加速渲染的跨平台引擎，通过对内存与渲染流程进行极致优化，为基于HTML5、WEBGL的多媒体应用、游戏等产品加速，使其性能媲美原生Native-APP。LayaPlayer采用C++语言编写，可嵌入浏览器或操作系统运行，也可以独立运行。  



## 二、LayaNative的原理和开发流程
（1）使用LayaAir开发的项目，准备发布成APP版本（iOS、Android、Windows）。  

（2）LayaNative会使用核心引擎LayaPlayer进行加速。  

（3）开发者可以使用测试器，快速安装到移动设备上进行简单的测试。  

（4）最终通过LayaAir-IDE，构建发布为对应的工程，进行编译、执行。  

（5）如果需要发布到各大渠道，需要通过反射机制进行二次开发（即：对接渠道的SDK，登录、充值、分享等）。  

（6）最后构建成app进行安装、测试、发布。  

流程如图1所示：

![1](img/1.png)

（图1）








