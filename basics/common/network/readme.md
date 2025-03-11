# 网络通信



## 一、概述

在我们的项目开发过程中，除了单机不需要使用网络通信，开发一个网络项目，难免要处理网络通信。本章将讲解LayaAir的网络通信部分。通常我们使用 Http 和WebSocket 这两种网络通信方式。首先我们来对比一下两者的区别:

- **HTTP**：

优点：协议成熟，应用广泛，基于TCP/IP，拥有TCP的可靠性，研发成本低，开发快速，被广泛支持，如nginx/apache/tomcat等。

缺点：无状态无连接，只有PULL模式，不支持PUSH，数据报文较大，每次请求都要带上所有的头信息。

特性：无状态，无连接（短连接），支持C/S模式，适用于文本传输，但也可以传输其他类型的数据，如图片、视频等。

- **WebSocket**：

优点：协议较新，但已趋于成熟，基于TCP/IP，拥有TCP的可靠性，数据报文较小，只有在建立连接时的握手阶段需要较大的头信息，之后的数据交换阶段头信息较小，面向连接，有状态协议，支持服务器主动推送数据（PUSH模式）。

缺点：WebSocket 是应用层协议，虽然数据包较简洁，但相比于TCP/IP协议，其数据包头部信息相对较大，对于非常小的数据包，这可能会导致一些额外的流量消耗。此外，由于需要维持连接，可能会占用更多的服务器资源。

特性：有状态，面向连接，数据报头较小，支持全双工通信，适用于需要实时通信的应用。



通过以上对协议特性分析，建议：

1，对于弱联网类游戏，比如消除类的，卡牌类的，可以直接HTTP协议，考虑安全的话直接HTTPS，或者对内容体做对称加密；

2，对于实时性，交互性要求较高，且team有过相关经验，可以优先选择websocket协议，比如SLG和RPG等大型网络游戏。



## 二、Http连接

HTTP协议即超文本传送协议(Hypertext Transfer Protocol )，是Web联网的基础，也是手机联网常用的协议之一，HTTP协议是建立在TCP协议之上的一种应用。



### 2.1 Laya.HttpRequest

在LayaAir引擎中 `HttpRequest` 就是我们发送请求的基本类。`HttpRequest` 类其实包装的就是原生的 `XMLHttpRequest`，我们先来了解下 `HttpRequest`。

#### 2.1.1 原生 XMLHttpRequest 对象

```typescript
    /**
     * 本对象所封装的原生 XMLHttpRequest 引用。
     */
    get http(): any {
        return this._http;
    }
```

通过 ._http 属性可以获得`XMLHttpRequest`。`XMLHttpRequest` 中文可以解释为可扩展超文本传输请求。它为客户端提供了在客户端和服务器之间传输数据的功能。它提供了一个通过 URL 来获取数据的简单方式，并且不会使整个页面刷新。这使得网页只更新一部分页面而不会打扰到用户。

1，属性

| 属性                 | 类型                         | 描述                                                         |
| :------------------- | :--------------------------- | ------------------------------------------------------------ |
| `onreadystatechange` | `function`                   | 一个JavaScript函数对象，当readyState属性改变时会调用它。     |
| `readyState`         | `unsigned short`             | 请求的五种状态                                               |
| `response`           | `varies`                     | 响应实体的类型由 responseType 来指定， 可以是 `ArrayBuffer` ，`Blob`， [`Document`](https://developer.mozilla.org/zh-CN/docs/Web/API/Document)， JavaScript 对象 (即 “json”)， 或者是字符串。如果请求未完成或失败，则该值为 `null` |
| `responseText`       | `DOMString`                  | 此次请求的响应为文本，或是当请求未成功或还未发送时为 `null`只读。 |
| `responseType`       | `XMLHttpRequestResponseType` | 设置该值能够改变响应类型。就是告诉服务器你期望的响应格式。   |
| `status`             | `unsigned short`             | 该请求的响应状态码 (例如，状态码200 表示一个成功的请求).只读 |
| `statusText`         | `DOMString`                  | 该请求的响应状态信息，包含一个状态码和原因短语 (例如 “`200 OK`“)。 只读 |
| `upload`             | `XMLHttpRequestUpload`       | 可以在 upload 上添加一个事件监听来跟踪上传过程。             |
| `withCredentials`    | `boolean`                    | 表明在进行跨站(cross-site)的访问控制(Access-Control)请求时，是否使用认证信息(例如cookie或授权的header)。 默认为 `false` |
| `timeout`            | `number`                     | 请求超时时间                                                 |

2，方法

`abort()`

如果请求已经被发送,则立刻中止请求。

`getAllResponseHeaders()`

返回所有响应头信息(响应头名和值)， 如果响应头还没接受,则返回`null`。

`getResponseHeader()`

返回指定的响应头的值, 如果响应头还没被接受,或该响应头不存在,则返回null。

`open()`

初始化一个请求.

`send()`

发送请求. 如果该请求是异步模式(默认)，该方法会立刻返回。 相反，如果请求是同步模式，则直到请求的响应完全接受以后，该方法才会返回。

`setRequestHeader()`

给指定的HTTP请求头赋值。在这之前，你必须确认已经调用 `open()`方法打开了一个url。

因此使用 `HttpRequest` 的过程中，我们也可以获得 `XMLHttpRequest` 对象，并对 `XMLHttpRequest` 对象做相关的操作，在此我们就不对 `XMLHttpRequest` 做过多讲解，开发者可以自行查阅相关文档。

- 详细的`XMLHttpRequest`，请看 [W3C的xhr 标准](https://www.w3.org/TR/XMLHttpRequest/);

- `XMLHttpRequest`发各种类型的数据，可以参考[发送数据](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Sending_and_Receiving_Binary_Data)和[html5rocks上的这篇文章](http://www.html5rocks.com/zh/tutorials/file/xhr2/)

- 了解`XMLHttpRequest`的基本使用，可以参考[MDN的XMLHttpRequest介绍](https://developer.mozilla.org/zh-CN/docs/Web/API/XMLHttpRequest)；

- 想了解跨域请求，则可以参考[W3C的 cors 标准](https://www.w3.org/TR/cors/);

  

#### 2.1.2 send() 方法

发送请求， 通常发送的请求是异步方式，其中send的参数类型如下：

```typescript
    /**
     * 发送 HTTP 请求。
     * @param	url				请求的地址。大多数浏览器实施了一个同源安全策略，并且要求这个 URL 与包含脚本的文本具有相同的主机名和端口。
     * @param	data			(default = null)发送的数据。
     * @param	method			(default = "get")用于请求的 HTTP 方法。值包括 "get"、"post"、"head"。
     * @param	responseType	(default = "text")Web 服务器的响应类型，可设置为 "text"、"json"、"xml"、"arraybuffer"。
     * @param	headers			(default = null) HTTP 请求的头部信息。参数形如key-value数组：key是头部的名称，不应该包括空白、冒号或换行；value是头部的值，不应该包括换行。比如["Content-Type", "application/json"]。
     */
    send(url: string, data: any = null,
        method: "get" | "post" | "head" = "get",
        responseType: "text" | "json" | "xml" | "arraybuffer" = "text",
        headers: any[] | null = null)
```



#### 2.1.3 支持的事件类型

我们常用的基本就是进度事件，完成事件，错误事件等

```typescript
/**
 * 请求进度改变时调度。
 * @eventType Event.PROGRESS
 * */
/*[Event(name = "progress", type = "laya.events.Event")]*/
/**
 * 请求结束后调度。
 * @eventType Event.COMPLETE
 * */
/*[Event(name = "complete", type = "laya.events.Event")]*/
/**
 * 请求出错时调度。
 * @eventType Event.ERROR
 * */
/*[Event(name = "error", type = "laya.events.Event")]*/
```



#### 2.1.4 在代码中怎么使用

LayaAir引擎中用 `HttpRequest` 继承的是 `EventDispatcher`，具有事件派发的功能。加上本身具备发送请求的功能。我们写个简单的例子来看下用法：

```typescript
class LayaSample {
    constructor() {
    
    	//创建HttpRequest对象
        let http: Laya.HttpRequest = new Laya.HttpRequest();
        //设置超时时间
        http.http.timeout = 10000;
        //发送了一个简单的请求
        http.send("resources/data.txt", "", "get", "text");//需要在resources文件夹下新建一个data.txt文件
        //设置完成事件，添加回调方法
        http.once(Laya.Event.COMPLETE, this, this.completeHandler);
        //设置错误事件，添加回调方法        
        http.once(Laya.Event.ERROR, this, this.errorHandler);
        //设置进度事件，添加回调方法        
        http.on(Laya.Event.PROGRESS, this, this.processHandler);
    }
    
    private processHandler(data:any): void {
        console.log("processHandler");
    }
    
    private errorHandler(error:any): void {
        console.log("errorHandler");
    }
    
    private completeHandler(data:any): void {
        console.log("completeHandler");
    }
}
new LayaSample();
```



### 2.2 GET

上面这个示例我们发送了一个简单的请求，方式是get方式。用来获取一个远端的文件，格式为文本的格式。假如我们动态请求远端数据可以改成如下格式：

```typescript
this.hr = new HttpRequest();
this.hr.once(Event.PROGRESS, this, this.onHttpRequestProgress);
this.hr.once(Event.COMPLETE, this, this.onHttpRequestComplete);
this.hr.once(Event.ERROR, this, this.onHttpRequestError);
//发送了一个get请求，携带的参数为 name=myname 和 psword=xxx
this.hr.send('http://xkxz.zhonghao.huo.inner.layabox.com/', null, 'get', 'text');
```

这里的重点是send方法，这个send方法要和 `XMLHttpRequest` 的send区分开。



### 2.3 POST

下面用post方法请求一个数据方式如下：

```typescript
this.hr = new HttpRequest();
this.hr.once(Event.PROGRESS, this, this.onHttpRequestProgress);
this.hr.once(Event.COMPLETE, this, this.onHttpRequestComplete);
this.hr.once(Event.ERROR, this, this.onHttpRequestError);
//发送了一个post请求，携带的参数为 name=myname 和 psword=xxx
this.hr.send('http://xkxz.zhonghao.huo.inner.layabox.com/', 'name=myname&psword=xxx', 'post', 'text');
```

**注意：GET和POST请求是有区别的：**

*GET请求参数是通过URL进行传递的，POST请求的参数包含在请求体当中。*

*GET请求比POST请求更不安全，因为参数直接暴露在URL中，所以，GET请求不能用来传递敏感信息。*

*GET请求在url中传递的参数是有长度限制的(在HTTP协议中并没有对URL的长度进行限制，限制是特定的浏览器以及服务器对他的限制，不同浏览器限制的长度不同)，POST对长度没有限制。*

*GET请求参数会完整的保留在浏览器的历史记录中，POST请求的参数不会保留。*

*GET请求进行url编码(百分号编码)，POST请求支持多种编码方式。*



### 2.4 扩展HttpRequest

在开发过程中 `HttpRequest` 可能不能满足我们的需求，比如上传文件，比如设置超时时间，比如操作表单数据等等。扩展 `HttpRequest` 很简单，你继承`HttpRequest`，或者干脆自己重写 `HttpRequest` 这个类都可以，这个看开发者的需求，重写 `HttpRequest` 建议直接继承 `EventDispatcher`。重写就是重新包装 `XMLHttpRequest` 这个类。下面是一个简单的继承的示范：

```typescript
 class HttpRequestExtension extends Laya.HttpRequest {
     constructor() {
         super();
     }
     public send(url:string,data:any=null,method:string="get", responseType:string="text", headers:any=null):void{
         super.send(url,data,method,responseType,headers);
             this._http.upload.onprogress= function(e:any):void
             {
                 //上传进度
             }
             this._http.upload.onload= function(e:any):void
             {
             }
             this._http.upload.onerror= function(e:any):void
             {
             }
             this._http.upload.onabort = function(e:any):void
             {
             }
     }
 }
```

上面是一个上传文件的示范，添加了 `XMLHttpRequest` 的upload的一些事件，这里的 super.send 简单的用了父类的方法，开发者可以不用，完全自己另写一套来满足自己的需求。



## 三、 WebSocket连接

WebSocket是一种基于ws协议的技术，它使得建立双全工连接成为可能。websocket常见于浏览器中，但是这个协议不受使用平台的限制。

websocket发送数据的格式一般为二进制和字符串。LayaAir引擎已经为我们封装好了 Socket 和 Byte 类，收发数据结合Byte类就可以完成。



### 3.1 Laya.Sokcet

在LayaAir引擎中 `Socket` 就是我们使用 WebSocket 的基本类。 `Socket` 封装了 HTML5 WebSocket ，允许服务器端与客户端进行全双工（full-duplex）的实时通信，并且允许跨域通信。在建立连接后，服务器和 Browser/Client Agent 都能主动的向对方发送或接收文本和二进制数据。我们先来了解下 `Socket` 的用法



#### 3.1.1 Connect 服务器

Socket 连接服务器有三种方式：

| 方式             | 说明                                                         |
| :--------------- | :----------------------------------------------------------- |
| 构造函数传参     | 立即连接 比如 new Socket(“192.168.1.2”,8899)；注意这里的host参数没有ws前缀。 |
| connect方法      | 传递url和端口号，连接服务器；socket.connect(“192.168.0.1.2”，8989)；注意这里的host参数没有ws前缀。 |
| connectByUrl方法 | 传递整个url，比如 socket.connectByUrl(“ws://localhost:8989”)；这里有ws前缀。 |



#### 3.1.2 发送数据

发送数据很简单，只需要调用Socket的send函数即可，参数可以是string或者是ArrayBuffer。

- **发送字符串格式：**

```
this.socket.send("hello world");//这是发送字符串的形式。
```

- **发送二进制格式的数据：**

```typescript
//写入一个字节
this.byte.writeByte(1);
//写入一个int16的数据
this.byte.writeInt16(20);
//写入一个32位的浮点数据
this.byte.writeFloat32(20.5);
// 写入一个字符串；
this.byte.writeUTFString("hello");
//这里声明一个临时Byte类型
var by:Laya.Byte = new Laya.Byte();
//设置endian；
by.endian = Laya.Byte.LITTLE_ENDIAN;
//写入一个int32数据
by.writeInt32(5000);
//写入一个uint16 数据
by.writeUint16(16);
//把临时字节数据的数据写入byte中，这里注意写入的是by.buffer;
this.byte.writeArrayBuffer(by.buffer);
//这里是把字节数组的数据通过socket发送给服务器。
this.socket.send(this.byte.buffer);
//清除掉数据;方便下次读写；
this.byte.clear();
```

上面我们看到，通过一个字节数组把我们需要的数据读入一个Byte数组，最后发送给服务器的是`byte.buffer`，这是一个ArrayBuffer的数据类型。这里一定要注意send的参数是 ArrayBuffer，很多开发者可能不注意，直接传递成了Byte，导致发送数据不正确。假如写成 `this.socket.send(this.byte)`；这是错误的，这点一定要注意。



#### 3.1.3 接收数据

客户端从服务器接收到的数据都会派发到 Event.MESSAGE 监听函数中。receiveHandler的参数就是服务器发送回来的数据。可能是字符串，也可能是二进制ArrayBuffer。接收到的是字符串我们不用读，拿来直接用就可以。但是接收到的是二进制的话我们需要读取出来，转成我们需要的类型。

```typescript
 private receiveHandler(msg: any = null): void {
   ///接收到数据触发函数
   //.............这里我们假设收到的是二进制ArrayBuffer
   this.byte.clear();
   this.byte.writeArrayBuffer(msg);//把接收到的二进制数据读进byte数组便于解析。
   this.byte.pos = 0;//设置偏移指针；
   ////下面开始读取数据，按照服务器传递过来的数据，按照顺序读取
   var a:number = this.byte.getByte();
   var b:number = this.byte.getInt16();
   var c:number = this.byte.getFloat32();
   var d:string = this.byte.getString();
   var e:string = this.byte.getUTFString();
 }
```



#### 3.1.4 支持的事件类型

我们常用的基本就是连接建立成功，接收到数据，连接被关闭，出现异常后调度等

```typescript
/**
 * 连接建立成功后调度。
 * @eventType Event.OPEN
 * */
/*[Event(name = "open", type = "laya.events.Event")]*/
/**
 * 接收到数据后调度。
 * @eventType Event.MESSAGE
 * */
/*[Event(name = "message", type = "laya.events.Event")]*/
/**
 * 连接被关闭后调度。
 * @eventType Event.CLOSE
 * */
/*[Event(name = "close", type = "laya.events.Event")]*/
/**
 * 出现异常后调度。
 * @eventType Event.ERROR
 * */
/*[Event(name = "error", type = "laya.events.Event")]*/
```



#### 3.1.5 在代码中怎么使用

我们举一个简单的发送和接收数据的 WebSocket 代码示例：

```typescript
	private connect(): void {
	
		//创建Socket对象
		this.socket = new Socket();
		
		//对服务器建立连接
		this.socket.connectByUrl("ws://echo.websocket.org:80");
		
		//表示需要发送至服务端的缓冲区中的数据
		this.output = this.socket.output;
		
		//添加监听事件
		this.socket.on(Event.OPEN, this, this.onSocketOpen);
		this.socket.on(Event.CLOSE, this, this.onSocketClose);
		this.socket.on(Event.MESSAGE, this, this.onMessageReveived);
		this.socket.on(Event.ERROR, this, this.onConnectError);
	}

	//连接建立成功回调
	private onSocketOpen(e: any = null): void {
		console.log("Connected");

		// 发送字符串
		this.socket.send("demonstrate <sendString>");

		// 使用output.writeByte发送
		var message: string = "demonstrate <output.writeByte>";
		for (var i: number = 0; i < message.length; ++i) {
			// 直接写缓冲区中的数据
			this.output.writeByte(message.charCodeAt(i));
		}
		
		// 发送缓冲区中的数据到服务器
		this.socket.flush();
	}

	// 连接断开后的事件回调
	private onSocketClose(e: any = null): void {
		console.log("Socket closed");
	}

	// 有数据接收时的事件回调
	private onMessageReveived(message: any = null): void {
		console.log("Message from server:");
		if (typeof (message) == 'string') {
			console.log(message);
		}
		else if (message instanceof ArrayBuffer) {
			console.log(new Byte(message).readUTFBytes());
		}
		// 清理缓存的服务端发来的数据
		this.socket.input.clear();
	}

	// 出现异常后的事件回调
	private onConnectError(e: Event = null): void {
		console.log("error");
	}
```



### 3.2 Laya.Byte 二进制读写

在开发项目中，二进制的操作是不可或缺的。在html5时代，对二进制的支持已经有了很大的突破。但是api的繁琐，对开发者开发项目来说不太方便。在页游时代，ActionScript3.0的二进制数组ByteArray，功能完善，api操作简单易懂，因此LayaAir的Byte在参考ByteArray的同时承接了html5的TypedArray类型化数组的特点。下面看下主要的用法

#### 3.2.1 常用方法

- **构造方法**

  参数：

  `length` ：长度

  当传入length参数时，一个内部数组缓冲区被创建,该缓存区的大小是传入的length大小。

  `typedArray`：类型化数组

  当传入一个包含任意类型元素的任意类型化数组对象(typedArray) (比如 **Int32Array)**作为参数时，typeArray被复制到一个新的类型数组。typeArray中的每个值会在复制到新的数组之前根据构造器进行转化。新的生成的类型化数组对象将会有跟传入的数组相同的length(比如原来的typeArray.length==2，那么新生成的数组的length也是2，只是数组中的每一项进行了转化)。

  `ArrayBuffer`：二进制数据缓冲区。

  上面的三种方法都可以实例化一个Byte，根据参数的不同创建二进制数据。

  ```typescript
  //实例化一个二进制数组Byte
  var byte:Laya.Byte = new Laya.Byte();
  //或者传入一个类型化数组
  var uint8Byte:Uint8Array = new Uint8Array(10);
  var byte:Laya.Byte = new Laya.Byte(uint8Byte);
  //或者传入一个ArrayBuffer类型
  var buffer:ArrayBuffer = new ArrayBuffer(20);
  var byte:Laya.Byte = new Laya.Byte(buffer);
  ```

- **writeArrayBuffer**(arraybuffer:*, offset:number = 0, length:number = 0):void

  写入指定的二进制缓冲数据。指定数据的偏移量和长度，如下：

  ```typescript
  var byte:Laya.Byte = new Laya.Byte();
  var byte1:Laya.Byte = new Laya.Byte();
  byte1.writeFloat32(20.0);//写入一个四个字节的浮点数
  byte1.writeInt16(16);//写入一个两个字节的整数
  byte1.writeUTFString("hell world");//写入一个字符串；
  byte.writeArrayBuffer(byte1.buffer,6);//把byte1的数据从第六个字节开始读入byte中。省略其中的浮点数20.0和整数16
  byte.pos = 0;//
  console.log(byte.readUTFString())//从byte中读出字符串。
  ```

- **读取数据**

  `getByte():number`

  从字节流中读取带符号的字节。

  `getInt16():number`

  从字节流的当前字节偏移量位置处读取一个 Int16 值。

  `getInt32():number`

  从字节流的当前字节偏移量位置处读取一个 Int32 值。

  `getFloat32():number`

  从字节流的当前字节偏移位置处读取一个 IEEE 754 单精度（32 位）浮点数。

  `getFloat32Array(start:number, len:number)any`

  从指定的位置读取指定长度的数据用于创建一个 Float32Array 对象并返回此对象。

  `getFloat64():number`

  从字节流的当前字节偏移量位置处读取一个 IEEE 754 双精度（64 位）浮点数。

  `getInt16():number `

  从字节流的当前字节偏移量位置处读取一个 Int16 值。

  `getInt32():number`

  从字节流的当前字节偏移量位置处读取一个 Int32 值。

  `getUint8():number`

  从字节流的当前字节偏移量位置处读取一个 Uint8 值。

  `getUint16():number`

  从字节流的当前字节偏移量位置处读取一个 Uint16 值。

  `getUint32():number`

  从字节流的当前字节偏移量位置处读取一个 Uint32 值。

  `getInt16Array(start:number, len:number):any`

  从指定的位置读取指定长度的数据用于创建一个 Int16Array 对象并返回此对象。

  `getString():string`

  读取字符型值。

  `getUTFBytes(len:number = -1):string `

  读字符串，必须是 writeUTFBytes 方法写入的字符串。

  `getUTFString():string `

  读取 UTF-8 字符串。

  

- **写入数据**

  `writeByte(value:number):void`在字节流中写入一个字节。	

```typescript
 var byte:Laya.Byte = new Laya.Byte(); 
 byte.writeByte(10);//0-255之间
```

​	  `writeFloat32(value:number):void`在当前字节偏移量位置处写入 Float32 值。范围是$\left[-2^{128}, 2^{127}\right]$，约为-3.4E38—3.4E+38。

```typescript
var byte:Laya.Byte = new Laya.Byte();
byte.writeFloat32(10.021);
```

​	  `writeFloat64(value:number):void`写入float64位数值 其数值范围为-1.7E308～1.7E+308。

​	  `writeInt16(value:number):void`在当前字节偏移量位置处写入 Int16 值。范围-32768 到 +32767之间。	

```typescript
var byte:Laya.Byte = new Laya.Byte();
byte.writeInt16(120);
```

​	  `writeInt32(value:number):void`在当前字节偏移量位置处写入 Int32 值。-2,147,483,648 到 +2,147,483,647 之间的有符号整数。

```typescript
 **writeUint16**(value:number):void在当前字节偏移量位置处写入 Uint16 值。
```

​	  `writeUint32(value:number):void`在当前字节偏移量位置处写入 Uint32 值。

​	  `writeUint8(value:number):void`在当前字节偏移量位置处写入 Uint8 值。

​	  `writeUTFBytes(value:string):void`写入字符串，该方法写的字符串要使用 readUTFBytes 方法读取。

​	  `writeUTFString(value:string):void`将 UTF-8 字符串写入字节流。



- `clear():void`清除数据。

  ```typescript
  var byte:Laya.Byte = new Laya.Byte();
  byte.writeInt16(120);
  byte.pos =0;//读取位置归零。
  ```

  

- `getSystemEndian():string[static]`获取系统的字节存储顺序。

  ```typescript
  console.log(Laya.Byte.getSystemEndian());//打印系统的字节顺序
  ```



#### 3.2.2 属性

- `BIG_ENDIAN : string= bigEndian[static]` 表示多字节数字的最高有效字节位于字节序列的最前面。

- `LITTLE_ENDIAN : string= littleEndian[static]` 表示多字节数字的最低有效字节位于字节序列的最前面。

- `pos `number当前读取到的位置。

  ```typescript
  var byte:Laya.Byte = new Laya.Byte();
  byte.writeInt16(120);
  byte.pos =0;//读取位置归零。
  ```

- `length: number`字节长度。

- `endian : string`字节顺序。

  ```typescript
  var byte:Laya.Byte = new Laya.Byte();
  byte.endian = Laya.Byte.BIG_ENDIAN;//设置为大端；
  ```

- `bytesAvailable : number[read-only]`可从字节流的当前位置到末尾读取的数据的字节数。

  ```typescript
  var byte:Laya.Byte = new Laya.Byte();
  byte.writeFloat32(20.0);
  byte.writeInt16(16);
  byte.writeUTFString("hell world");
  byte.pos = 6;
  console.log(byte.bytesAvailable)
  ```



#### 3.2.3 代码演示

下面我们通过一个完整的代码来演示下这个类的应用，比如网络连接中，我们接收和发送网络消息。

```typescript
var msg:any ={name:"xxx",age:18,weight:65.5,height:175};
var byte:Laya.Byte = new Laya.Byte();
//实例化byte数组
byte.endian = Laya.Byte.LITTLE_ENDIAN;
//设置大小端
byte.writeUTFString(msg.name);
//写入数据
byte.writeByte(msg.age);
byte.writeFloat32(msg.weight);
byte.writeInt16(msg.height);
```

输出看下结果：

```typescript
//设置pos为0 开始从头开始按照写入的顺序读取读取
byte.pos = 0;
console.log(byte.getUTFString());
console.log(byte.getByte());
console.log(byte.getFloat32());
console.log(byte.getInt16());
```



#### 3.2.4 类型化数组

Laya的byte封装的就是类型化数组，开发者可以参考mdn的官方api说明。来扩展自己的项目的应用。

- [DataView ](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/DataView)视图提供了一个与平台中字节在内存中的排列顺序(字节序)无关的从[`ArrayBuffer`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer)读写多数字类型的底层接口。
- [Uint8Array](https://developer.mozilla.org/zh_CN/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) 数组类型表示一个8位无符号整型数组，创建时内容被初始化为0。创建完后，可以以对象的方式或使用数组下标索引的方式引用数组中的元素。
- **Int8Array** :类型数组表示二进制补码8位有符号整数的数组。内容初始化为0。 一旦建立，你可以使用对象的方法引用数组中的元素，或使用标准数组索引语法。
- **Int16Array()**;类型数组表示二进制补码16位有符号的数组。
- **Uint16Array()**;类型数组表示二进制补码16位无符号的数组
- **Int32Array()**;类型数组表示二进制补码32位有符号的数组
- **Uint32Array()**;类型数组表示二进制补码32位无符号的数组
- **Float32Array()**;类型数组表示32位浮点数数组。
- **Float64Array()**;类型数组表示64位浮点数数组。



## 四、ProtocolBuffer使用

**protocolbuffer**（以下简称PB）是google 的一种数据交换的格式，它独立于语言，独立于平台。类似于XML，JSON这样的数据表示语言，ProtocolBuffer是用于结构化数据串行化的灵活、高效、自动的方法，格式有点类似XML，可以自己定义数据格式，它是一种二进制格式允许你使用规范的语言定义一个模式。

ProtocolBuffer 作为网络通信的协议格式，是现在一种非常流行的方式，下来我们来了解一下。



### 4.1 Message 定义

这里简单的给出一个例子，是一个非常简单的请求的message格式

```typescript
// awesome.proto
package awesomepackage;

//指定proto版本
syntax = "proto3";

//message包含多个种类的fields
message AwesomeMessage {
    string awesome_field = 1; // becomes awesomeField
}
```

上述例子中fields的种类是字符串型的（string），当然也可以指定更加复杂的fields，比如枚举类型enum，或者是嵌套的message类型

上述Message定义好之后，我们把协议文件保存到项目目录中

"assets/res/protobuf/awesome.proto";



### 4.2 项目中添加protobuf 类库

我们可以从 https://github.com/protobufjs/protobuf.js 下载最新 `protobuf` 类库，并放到项目的bin目录中，同时在index.html 中引用到 protobuf.js

```typescript
	<script type="text/javascript" src="protobuf.js"></script>
```



### 4.3 加载协议文件

`protobuf` 类库，通过 load 方法来加载协议文件

```typescript
/**
 * Loads one or multiple .proto or preprocessed .json files into a common root namespace and calls the callback.
 * @param {string|string[]} filename One or multiple files to load
 * @param {Root} root Root namespace, defaults to create a new one if omitted.
 * @param {LoadCallback} callback Callback function
 * @returns {undefined}
 * @see {@link Root#load}
 */
function load(filename, root, callback) {
    if (typeof root === "function") {
        callback = root;
        root = new protobuf.Root();
    } else if (!root)
        root = new protobuf.Root();
    return root.load(filename, callback);
}
```



### 4.4 Message 方法

- Message.verify(message: Object): null|string

验证一个Message对象是否满足有效消息的要求。

- Message.create(properties: Object): Message

对满足有效消息要求的一组Javascirpt数据创建新消息实例。

- Message.encode(message: Message|Object , writer: Writer): Writer

对Message对象进行编码，用于网络通信传输。

- Message.decode(reader: Reader|Uint8Array): Message

网络通信传输数据中，解码获得Mesaage对象。

- Message.toObject(message: Message , options: ConversionOptions): Object

转换Message对象数据到一组Javascirpt数据。



### 4.5 代码示例

```typescript
    onAwake(): void {
    
		var resPath: string = "assets/res/protobuf/awesome.proto";
		// 加载protobuf文件
		this.ProtoBuf.load(resPath, this.onAssetsLoaded);
	}

	private onAssetsLoaded(err: any, root: any): void {
		if (err)
			throw err;

		// 获得一个Message消息类型
		var AwesomeMessage: any = root.lookupType("awesomepackage.AwesomeMessage");

		console.log(AwesomeMessage);

		// 初始化数据
		var payload: any = { awesomeField: "AwesomeString" };
		console.log(payload);

		// 验证数据是否有效
		var errMsg: any = AwesomeMessage.verify(payload);

		// 如果有异常抛出异常并终止
		if (errMsg)
			throw Error(errMsg);

		// 创建Message的实体
		var message: any = AwesomeMessage.create(payload);
		console.log(message);

		// 编译Message实体成 Buffer 数据格式，等待发送数据
		var buffer: any = AwesomeMessage.encode(message).finish();
		console.log(buffer);

	}
```



