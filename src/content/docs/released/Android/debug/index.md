---
title: "在Android真机上调试JavaScript代码"
description: "LayaAir-IDE发布后的代码，最终都会被编译为JS。而JavaScript代码的调试，是使用调试机上的Chrome浏览器进行的。Android测试机上的LayaNative启动的时候，会同时启动一个WebSocket服务器。Chrome浏览器通过WebSocket与LayaNative连接通信…"
slug: "released/android/debug"
---

## 一、调试的原理

LayaAir-IDE发布后的代码，最终都会被编译为JS。而JavaScript代码的调试，是使用调试机上的Chrome浏览器进行的。Android测试机上的LayaNative启动的时候，会同时启动一个WebSocket服务器。Chrome浏览器通过WebSocket与LayaNative连接通信，从而实现使用Chrome对项目的JavaScript的调试。


在调试项目中的JavaScript的代码时，有以下两种调试模式可以选择：

（1）Debug/Normal模式

在该模式下，Android测试机上的项目可以直接启动并运行，Chrome浏览器可以在项目运行后连接调试。

（2）Debug/Wait模式

在该模式下，Android测试机上的项目启动后，会一直等待Chrome浏览器的连接。当Chrome连接成功后，才会继续执行JavaScript脚本。当需要对启动时加载的JavaScript脚本进行调试时，请优先选择该模式。

**注意：在调试的工程中请确保调试机与Android测试机在同一局域网中。**



## 二、调试LayaAir-IDE构建的Android项目

### 步骤1:   构建项目

使用LayaAir-IDE对项目进行构建，生成Android的工程。

> 参考[安卓/iOS构建](/released/android/build-tool/)。

### 步骤2：修改调试模式

使用Android Studio打开构建后的工程。

打开`android_studio/app/src/main/assets/config.ini`，修改`JSDebugMode`的值,设置需要的调试模式。如图2-1所示，

![2-1](./img/2-1.png)

（图2-1）

JSDebugMode的取值和含义如下：

|取值|含义|
|:--:|:--:|
|0|关闭调试功能|
|1|Debug/Normal模式|
|2|Debug/Wait模式|

> 当项目正式发布后，请将JSDebugMode的值设置为0，否者会对项目运行时的性能有影响。

### 步骤3：编译并运行项目

使用Android Studio编译工程。

- 如果选择的是Debug/Normal模式，等待Android测试机成功**启动并运行**项目。

<img src="./img/2-2.png" alt="2-2" style="zoom:70%;" />

（图2-2）

- 如果选择的是Debug/Wait模式，等待Android测试机成功**启动**项目。


<img src="./img/2-3.png" alt="2-3" style="zoom:150%;" />

（图2-3）

### 步骤4：使用Chrome连接工程

连接调试有以下两种方式，**推荐优先使用方式一**，连接速度更快。方式二（`chrome://inspect`）连接较慢。

#### 方式一：直接通过DevTools URL连接（推荐，3.3.8版本起支持）

从3.3.8版本开始，可以直接在Chrome浏览器地址栏中输入以下格式的URL来连接调试：

```
devtools://devtools/bundled/js_app.html?v8only=true&ws=<设备IP或localhost>:5959/laya
```

根据调试环境的不同，有以下两种使用场景：

**场景一：通过localhost连接（适用于USB连接并进行了端口转发的场景）**

当Android测试机通过USB连接到调试机，并使用`adb forward tcp:5959 tcp:5959`进行了端口转发后，可以在Chrome浏览器中直接输入：

```
devtools://devtools/bundled/js_app.html?v8only=true&ws=localhost:5959/laya
```

**场景二：通过设备IP连接（适用于同一局域网的场景）**

当调试机与Android测试机处于同一局域网时，将URL中的设备IP替换为Android测试机的实际IP地址。例如，测试机的IP地址为192.168.31.43，则在Chrome浏览器中输入：

```
devtools://devtools/bundled/js_app.html?v8only=true&ws=192.168.31.43:5959/laya
```

#### 方式二：通过chrome://inspect连接

打开调试机上的Chrome浏览器，输入网址`chrome://inspect/#devices`后，可以看到LayaNative，表示连接成功。

<img src="./img/2-4.png" alt="2-4" style="zoom:80%;" />

（图2-4）

需要注意，需要在`Configure`中，配置设备地址，图2-5中的地址192.168.31.43就是测试机的ip，端口号5959是config.ini文件（图2-1）中的JSDebugPort值。

![2-5](./img/2-5.png)

（图2-5）





### 步骤5：进行调试

点击图2-4中的`inspect`后，便可以使用Chrome对项目中JavaScript进行调试。如图2-6所示，

<img src="./img/2-6.png" alt="2-6" style="zoom:80%;" />

（图2-6）

















