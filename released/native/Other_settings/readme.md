

# 其他说明

## 1. 关于第三方地图

LayaNative底层渲染使用OpenGL ES渲染，使用android的GLSurfaceView控件和iOS的GLKView控件，所以无法支持第三方地图，如百度地图。

## 2. 关于文件格式

**项目中的文本格式文件（例如:ini、xml、html、json、js等）都必须是utf8编码格式，因为iOS设备不支持非utf8格式编码的文件。**

## 3. 日志级别

LayaNative底层LOG分为五种：

```c
enum class LogType
{
    Debug,
    Info,
    Warn,
    Error,
    Fatal,
};
```
每种日志对应的日志级别如下：
```c
enum class LogLevel
{
    Debug = 5,  // 最详细 - 调试信息
    Info = 4,   // 一般信息
    Warn = 3,   // 警告
    Error = 2,   // 错误
    Fatal = 1,   // 致命错误
    Close = 0,   // 关闭所有日志
};
```

**日志级别说明：**
- 数值表示"日志详细程度"，数值越大输出越详细
- 设置 `g_nLogLevel = n` 时，输出所有 `LogLevel` 值 <= n 的日志
- 默认值为 5（Debug），表示输出所有级别的日志

在js脚本中，开发者可以通过以下函数设置日志级别,默认值为5：

```javascript
if (window.conch)
{
    // 日志级别设置说明：
    // 值为0：关闭所有日志输出
    // 值为1：只输出 Fatal（致命错误）日志
    // 值为2：输出 Fatal + Error（错误）日志
    // 值为3：输出 Fatal + Error + Warn（警告）日志
    // 值为4：输出 Fatal + Error + Warn + Info（信息）日志
    // 值为5：输出所有日志，包括 Debug（调试）日志（默认值）
    // 
    // 过滤规则：值为n时，输出所有 LogLevel <= n 的日志
    window.conch.config.setLogLevel(2);
}
```

**Tips**
*1、conch只能LayaNative环境下调用，在网页版本中是没有conch定义的，所以需要判断一下是否存在。*

## 4.关于iOS对接微信

在iOS平台下对接微信SDK，微信1.77版本以后需要增加-Objc的参数，微信的官方文档中默认让增加`-Objc -all_load`,但是这样会导致编译报错。
遇到到这种情况可以把参数变成 `-Objc -force_load libWeChatSDK.a`，配置后，如图1所示：

![1](img/1.png)

## 5. 关于iOS模拟器

LayaNative支持iOS模拟器，但是由于模拟器运行效率比较低，建议开发者使用iOS真机调试。

## 6. 获取各种信息

| 函数名称                 | 函数说明               | 返回值说明                                    | 备注                               |
| -------------------- | ------------------ | ---------------------------------------- | -------------------------------- |
| getTotalMem()        | 获得运行设备总内存          | 单位为KB                                    |                                  |
| getUsedMem()         | 获得当前应用程序占用的内存      | 单位为KB                                    | 返回值不太准确，但是可以作为参考                 |
| getAvalidMem()       | 获得可用的内存            | 单位为KB                                    | 返回值不太准确，但是可以作为参考                 |
| getNetworkType()     | 获得网络状态             | 返回int值，NET_NO = 0;NET_WIFI = 1;NET_2G = 2;NET_3G = 3;NET_4G = 4;NET_UNKNOWN=5 |                                  |
| getRuntimeVersion()  | 获得Runtime的版本       | 返回值是一个字符串，类似ios-conch5-0.9.2、android-conch5-0.9 |                                  |
| getOS()              | 获得当前系统             | 返回值类似“Conch-ios” “Conch-android”字符串      |                                  |
| getAppVersion()      | 获得iOS-App的版本号      | 返回字符串 1.1                                | iOS-app的版本号，通过这个版本号，可以做APP的更新提示。 |
| getAppLocalVersion() | 获得iOS-App的Local版本号 | 返回字符串1.2                                 | iOS-app的版本号，通过这个版本号，可以做APP的更新提示。 |

这些函数都属于conch.config类的函数，调用实例：

```javascript
if (window.conch)
{
    window.conch.config.getRuntimeVersion();
}
```

**Tips**
*1、conch只能LayaNative环境下调用，在网页版本中是没有conch定义的，所以需要判断一下是否存在。*

## 7. 屏蔽项目中报错弹框

项目运行过程中有时会弹出一些错误的提示，这些提示都是项目中有代码写错了。我们的建议是解决掉这些错误弹框里边的错，如果实在是解决不掉再去屏蔽。  
屏蔽弹框在IDE项目设置中取消勾选杂项下面的弹窗显示全局错误选项，如图2所示：

![2](img/2.png)


## 8. 引擎初始化或加载启动脚本过程中的异常处理
在LayaNative版本中，当引擎初始化、加载启动脚本过程中，如果发生异常（如网络不稳定），引擎会自动调用到window.onLayaInitError(error)函数，该函数默认在config.js中定义，代码如下：
```javascript
window.onLayaInitError = function(e)
{
	console.log("onLayaInitError error=" + e);
	alert("加载游戏失败，可能由于您的网络不稳定，请退出重进");
}
```
开发者可以根据自己需求，修改报错信息和报错方式。

## 9. 获取设备型号
在LayaNative中，iOS可以通过调用conch.config.getDeviceInfo()获取设备型号。可以用于iPhone X的头帘适配，代码如下：
```javascript
if (window.conch)
{
    var devInfo = JSON.parse(window.conch.config.getDeviceInfo());

    if (devInfo.devicename === 'iPhone10,3' || devInfo.devicename === 'iPhone10,6')
    {
        // iPhone X适配
    }
}
```