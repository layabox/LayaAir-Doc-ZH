# 原生平台通信

在支持HarmonyOS、Linux和Window后新增一种和原生平台之间通信的接口。

## 1. 脚本接口
```javascript
//同步
postSyncMessage(eventName: string, data: string): string;
//异步
postAsyncMessage(eventName: string, data: string): Promise<string>;
```
简单测试案例如下：  
```javascript
var ret = conch.postSyncMessage("syncMessage", "syncMessage from js");
alert(ret);
conch.postAsyncMessage("asyncMessage", "asyncMessage from js").then(function (data) {
alert(data);
})
```
## 2. 原生平台端消息处理
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

