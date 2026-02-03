
# 关于网络状态监听
由于移动设备网络环境不太稳定，当网络发生变化的时候，项目中经常需要给用户一些提示，在LayaNative中有两种方法，可以获得网络环境变化。

## 1.监听方式

开发者可以使用注册监听函数的方式进行监听网络变化，代码如下：

```javascript
if( conch )
{
    conch.setNetworkEvtFunction(function(type)
    {
	    alert(type)
    });
}
```

注意：

1、conch只能在LayaNative环境下调用，在网页版本中是没有conch定义的，所以需要判断一下是否存在。  

> 在LayaAir-IDE中的脚本中添加代码时，如果没有定义，可以这样写：`(window as any).conch.config.xxxx`。

2、还可以使用`if(Render.isConchApp)`进行判断。  

**返回值类为int类型**

```java
NET_NO = 0;
NET_WIFI = 1;
NET_2G = 2;
NET_3G = 3;
NET_4G = 4;
NET_YES = 5;
```
```java
	/**
	 * 枚举网络状态
	 * NET_NO:没有网络
	 * NET_2G:2g网络
	 * NET_3G:3g网络
	 * NET_4G:4g网络
	 * NET_WIFI:wifi
	 * NET_UNKNOWN:未知网络
	 */
```



## 2.查询方式

开发者还可以通过主动查询的方式，查询网络状态，代码如下：

```javascript
if( conch )
{
    var nType = conch.config.getNetworkType();
}
```

**返回值类为int类型**

```java
NET_NO = 0;
NET_WIFI = 1;
NET_2G = 2;
NET_3G = 3;
NET_4G = 4;
NET_YES = 5;
```

例如，在LayaAir-IDE中增加一个脚本，添加如下代码：

```typescript
    onStart(): void {
        var nType = (window as any).conch.config.getNetworkType();
        console.log("network type: " + nType);
    }
```

发布Android项目后，测试使用的网络环境为WiFi环境，因此Android Studio控制台打印的信息为：`network type: 1`。











