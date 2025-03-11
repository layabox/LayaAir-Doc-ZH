## LayaNative的资源更新方法
游戏发布之后必然会遇到更新的问题，这里的更新是指用LayaNative打包的游戏发布后，因为修改bug或者添加功能，想要修改客户端的部分代码和图片等数据。 

目前LayaNative基于LayaDCC支持两种资源更新方式：  

> LayaDCC的文档参考[这里](../LayaDcc_Tool/readme.md)。

## 1. 用户不可见的更新（推荐）

资源热更新方案。这是一种持续的，随时进行的更新。这种方式符合网页的更新思想：只有当需要使用某个资源的时候，才会触发资源的更新流程。这种化整为零的更新的机制，可以让用户立即进入游戏，在不知不觉间就完成了更新。



## 2. 用户可见的，进入游戏前的集中更新

大部分传统的app的更新方式，一上来就检查是否需要更新，如果需要更新就下载一个大的zip文件进行整体更新。这种更新的维护成本较高，用户需要较长时间的等待才能进入游戏，而且还明显违反Apple的禁止热更的政策。它的好处是用户可以在有wifi的地方更新，在没有wifi的地方玩，避免在没有wifi的时候浪费数据流量。
LayaNative虽然没有直接支持这种更新，但是通过LayaDCC提供的几个接口也能实现这个功能：  

> 这些接口属于内部接口，以后有改变的可能性。

* 支持断点续传的大文件下载函数downloadBigFile。

> 注意：不要用XMLHttpRequest下载大文件，因为这种方式下LayaNative会把结果先保存在内存中，所以大文件可能会导致内存爆掉，而这个函数是随时存盘的。

```typescript
/**
 * @param url 远程地址
 * @param local 存到本地文件
 * @param onprog 进度回调
 * @param oncomp 完成回调
 * @param trynum 重试次数（0无限重试） 
 * @param opttimeout 超时时间，
 * 注意如果成功了不会返回ArrayBuffer，不要使用这个参数。因为可能太大。
 */
declare var downloadBigFile:(url:string,
	local:string,
	onprog:(total:number,now:number,speed:number)=>boolean,oncomp:(curlret:number, httpret:number)=>void,
	trynum:number,
	opttimeout:number)=>void;
```
* 处理zip文件的ZipFile类。

```typescript
interface ZipFile{
    /**
     * 注意这个文件不要太大，因为需要在内存中解开，太大了会直接导致崩溃。
     */
    setSrc(src:string):boolean;
    /**
     * 遍历zip中的文件。
     * id:
     * name:文件名，包含路径
     * dir:是否是
     * sz:文件大小
     */
    forEach(func:(id:number,name:string,dir:boolean,sz:number)=>void):void;
    /**
     * 不要用。
     */
    readFile1():void;
    /**
     * 读取zip中的文件的内容，返回一个ArrayBuffer
     */
    readFile(id:number):ArrayBuffer;
    close():void;
    readAsTextByName(name:string):string;
    readAsArrayBufferByName(name:string):ArrayBuffer;
    new ():ZipFile;
}

declare var ZipFile:ZipFile;
```
* 手动更新dcc缓存的功能。  

```typescript
interface AppCache{
    ...
    
    delAllCache():void;
    /**
     * 更新dcc中的一个文件
     * @param nameid 更新的文件，自己计算。
     *   路径规则：/，表示app根目录。例如：hashstr('/index.html')， 不要带参数，如果带参数的话-- hashstr('/aa/bb.html?ff=2') 会导致谁也找不到这个文件
     * @param chksum 校验码，如果0则此函数自己计算。如果是外部版本控制，则这个是hashstr后的版本号。
     * @param buf ArrayBuffer 文件内容。
     * @param extversion 是否使用外部版本号
     * @return boolean 如果返回true则表示更新成功，否则的话，表示校验码不一致，即
     *      先要更新dcc才能工作。
     */
    updateFile(nameid:number,chksum:number,buf:ArrayBuffer,extversion:boolean):boolean;
    
    ...
}
```

通过这几个函数，就可以在layaDCC之上实现一个集中更新的功能。

例如，LayaNative提供的一个封装好了的更新函数updateByZip：

```javascript
    /**
     * 根据指定的zip文件更新本地缓存。
     * 这个zip文件可以通过DCC插件的补丁生成工具来生成。
     * 
     * 这个会修改本地保存的root
     * @param zipfile 打补丁的zip文件，注意这里必须是本地目录，所以需要自己实现下载zip到本地之后才能调用这个函数。
     * @param progress 进度提示，暂时没有实现。
     */
    async updateByZip(zipfile: string, zipClass: new () => IZip, progress: (p: number) => void) {
        let zip = new zipClass();
        zip.open(zipfile);
        //TODO 数据太多的时候要控制并发
        zip.forEach(async entry => {
            if (entry.entryName == 'head.json') {
            } else {
                await this.addObject(entry.entryName, entry.getData())
            }
        })
        //写head。zip中可能没有head.json，例如只是某个目录，这时候就不要更新root了
        try {
            let buf = zip.getEntry('head.json');
            await this._frw.write('head.json', buf.getData().buffer, true);
            //更新自己的root
            let localHeadStr = await this._frw.read('head.json', 'utf8', true) as string;
            let localHead = JSON.parse(localHeadStr) as RootDesc;
            await this._gitfs.setRoot(localHead.root);
        } catch (e) {

        }
    }
```
实际使用的时候，还要自己实现版本管理，界面，下载进度提示等功能。为了实现这些功能可能需要本地读写文件的接口，可以使用下面的全局函数：

>这些接口属于内部接口，以后有改变的可能性。

```typescript
declare var fs_readFileSync:(file:string)=>ArrayBuffer;
declare var fs_writeFileSync:(file:string,data:string|ArrayBuffer)=>boolean;
declare var readFileSync:(file:string,encode:string)=>string;//这个直接返回字符串。
```








