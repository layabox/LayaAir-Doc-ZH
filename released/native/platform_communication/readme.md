# 原生语言与JavaScript通信

有的时候，我们需要在Native里扩展一些原生语言的功能，那怎么和LayaAir引擎的JS语言项目之间互相通讯呢，本篇将进行全面的介绍。

# 1.JS端脚本的执行

### 1.1 在 JS端向原生端发送消息

 在JS中使用的脚本接口如下：

```javascript
//同步
postSyncMessage(eventName: string, data: string): string;
//异步
postAsyncMessage(eventName: string, data: string): Promise<string>;
```
JS中简单的测试案例如下：  
```javascript
var ret = conch.postSyncMessage("syncMessage", "syncMessage from js");
alert(ret);
conch.postAsyncMessage("asyncMessage", "asyncMessage from js").then(function (data) {
alert(data);
})
```
### 1.2 在原生端中主动执行JS端脚本

原生端主动执行 JS 脚本时，建议只调用一个稳定的 JS 入口方法，将复杂数据通过 JSON 传递，避免直接拼接业务逻辑。JS 侧可以先定义一个统一接收器：

```javascript
window.NativeBridge = {
    dispatch(eventName, data) {
        switch (eventName) {
            case "nativeEvent":
                console.log("native event:", JSON.stringify(data));
                break;
            case "loginResult":
                console.log("login result:", JSON.stringify(data));
                break;
            case "purchaseResult":
                console.log("purchase result:", JSON.stringify(data));
                break;
            default:
                console.warn("unknown native event:", eventName, JSON.stringify(data));
                break;
        }
    }
};
```

iOS/OC执行JS脚本：

```objectivec
#import "conchRuntime.h"

[[conchRuntime GetIOSConchRuntime] runJS:@"alert('hello')"];
```

iOS/OC传递JSON数据：

```objectivec
    NSDictionary *payload = @{
        @"message": @"hello from iOS",
        @"time": @([[NSDate date] timeIntervalSince1970] * 1000)
    };


    NSData *jsonData = [NSJSONSerialization dataWithJSONObject:payload options:0 error:nil];
    NSString *json = [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
    NSString *js = [NSString stringWithFormat:
        @"window.NativeBridge && NativeBridge.dispatch('nativeEvent', %@);",
        json
    ];


    [[conchRuntime GetIOSConchRuntime] runJS:js];
```

Android/Java执行JS脚本：

```java
import layaair.game.browser.ConchJNI;

ConchJNI.RunJS("alert('hello world')");
```

Android/Java传递JSON数据：

```java
import org.json.JSONObject;
import layaair.game.browser.ConchJNI;

try {
    payload.put("message", "hello from Android");
    payload.put("time", System.currentTimeMillis());
} catch (JSONException e) {
    throw new RuntimeException(e);
}

String js = "window.NativeBridge && NativeBridge.dispatch('nativeEvent', "
        + payload.toString()
        + ");";

ConchJNI.RunJS(js);
```

> 注意：原生端调用 JS 前，需要确保引擎和 JS 业务脚本已经初始化完成。如果调用时机太早，`window.NativeBridge` 等 JS 对象可能还不存在。

# 2. 原生端的消息处理
注意:原生端处理消息函数各个代码分支一定要返回相应值或者消息，以免造成卡死

### 1. HarmonyOS
在libSysCapabilities/src/main/ets/event/HandleMessageUtils.ts添加消息处理代码
```typescript
    /**
    * 同步事件
    * @param eventName 事件名称
    * @param data 数据
    */
    static handleSyncMessage(eventName: string, data: string): string {
        if (eventName == "syncMessage") {
            return "sync message from platform";
        }
        return "default sync result";
    }

    /**
    * 异步事件
    * @param eventName 事件名称
    * @param data 数据
    * @param cb callback
    */
    static async handleAsyncMessage(eventName: string, data: string, cb: Function): Promise<void> {
        if (eventName == "asyncMessage") {
            cb("async message from platform");
        }
    }
```
### 2. Android
在app/src/main/java/demo/HandleMessageUtils.java添加消息处理代码
```java
    public static String handleSyncMessage(String eventName, String data) {
        Log.d(LOG_TAG, eventName +" " + data);
        if (eventName.equals("syncMessage")) {
            return "sync message from platform";
        }
        return "default sync result";
    }
    public static void handleAsyncMessage(String eventName, String data, HandleMessageCallback cb) {
        Log.d(LOG_TAG, eventName +" " + data);
        if (eventName.equals("asyncMessage")) {
            cb.callback("async message from platform");
        }
    }
```
### 3. iOS
在HandleMessageUtils.mm添加消息处理代码  
```c
+(NSString*)handleSyncMessageWithEventName:(NSString*)eventName data:(NSString*)data {
    NSLog(@"%@ %@", eventName, data);
    if ([eventName isEqualToString:@"syncMessage"]) {
        return @"sync message from platform";
    }
    return @"default sync result";
}
+(void)handleAsyncMessageWithEventName:(NSString*)eventName data:(NSString*)data callback:(void (^)(NSString *))cb {
    NSLog(@"%@ %@", eventName, data);
    if ([eventName isEqualToString:@"asyncMessage"]) {
        cb(@"async message from platform");
    }
}
```
### 4. windows
conchSetHandleMessageCallback函数设置处理异步和同步消息的回调  
conchSendHandleMessageResult根据事件名称把数据传递回JS侧    
详见Runtime/x64/include/Exports.h  

```c
CONCH_EXPORT void CONCH_CDECL conchSetHandleMessageCallback(handleSyncMessageCallback handleSyncMessageCb,
                                                            handleAsyncMessageCallback handleAsyncMessageCb);
CONCH_EXPORT void CONCH_CDECL conchSendHandleMessageResult(const char *eventName, const char *result);
```
消息处理  
```c
int WINAPI wWinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, LPWSTR lpCmdLine, int nShowCmd)
{
    conchSetHandleMessageCallback(
        [](const char *eventName, const char *data) -> void {
            if (strcmp(eventName, "syncMessage") == 0)
            {
                conchSendHandleMessageResult(eventName, "sync message from platform");
            }
        },
        [](const char *eventName, const char *data) -> void {
            if (strcmp(eventName, "asyncMessage") == 0)
            {
                conchSendHandleMessageResult(eventName, "async message from platform");
            }
        });
    return conchMain(hInstance, hPrevInstance, lpCmdLine, nShowCmd);
}
```
### 5. Linux
和windows相同
conchSetHandleMessageCallback函数设置处理异步和同步消息的回调  
conchSendHandleMessageResult根据事件名称把数据传递回JS侧    
详见Runtime/x86_64/include/Exports.h  
```c
CONCH_EXPORT void CONCH_CDECL conchSetHandleMessageCallback(handleSyncMessageCallback handleSyncMessageCb,
                                                            handleAsyncMessageCallback handleAsyncMessageCb);
CONCH_EXPORT void CONCH_CDECL conchSendHandleMessageResult(const char *eventName, const char *result);
```
消息处理 
```c
int main(int argc, char *argv[])
{
    conchSetHandleMessageCallback(
        [](const char *eventName, const char *data) -> void {
            if (strcmp(eventName, "syncMessage") == 0)
            {
                conchSendHandleMessageResult(eventName, "sync message from platform");
            }
        },
        [](const char *eventName, const char *data) -> void {
            if (strcmp(eventName, "asyncMessage") == 0)
            {
                conchSendHandleMessageResult(eventName, "async message from platform");
            }
        });
    return conchMain(argc, argv);
}
```
