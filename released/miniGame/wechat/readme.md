# 微信小游戏



## 一、概述

微信小游戏的运行环境并不是浏览器，也不能在浏览器中运行，而是运行于微信APP中的Runtime。尽管微信小游戏的接口兼容大部分Canvas和Webgl，具有即点即玩，无需下载安装的HTML5特性。但从严格的定义来讲，微信小游戏不是标准的HTML5游戏。

强烈推荐要看一看微信小游戏官方的[文档](https://developers.weixin.qq.com/minigame/dev/index.html)，LayaAir引擎的文档更多的是引擎相关的，当然也会混合了一些小游戏接口的应用介绍，但是仔细看看微信官方文档肯定没错。

**下载并安装微信开发者工具**

[微信开发者工具](https://developers.weixin.qq.com/minigame/dev/devtools/download.html)主要用于小游戏产品的预览与调试、真机测试、上传提交等。是小游戏开发的必备工具。

如果是采用微信小游戏官方[API](https://developers.weixin.qq.com/minigame/dev/api/)开发的话，还是要有一些要注意的，比如不支持DOM与BOM、小游戏只能有一个画布、不支持Eval、不支持XML等等……

但是，对于LayaAir引擎的开发者来讲，不用刻意去了解到底有哪些差异，照正常的LayaAir引擎开发规则去开发就可以了。



## 二、发布为微信小游戏



### 2.1 选择目标平台

点击构建发布，在弹出的界面里，选择发布平台为微信小游戏。如图2-1所示：

<img src="img/2-1.png" alt="2-1" style="zoom:80%;" />

（图2-1）

`Appid`：用户可以直接在发布的时候填写微信小游戏的AppID。

`生成开放数据域工程模板`：一般用来显示好友排行榜，发布完成后会生成openDataContext目录。（详见第五节）



### 2.2 发布后的小游戏目录介绍

发布后的目录结构如图2-2所示。

<img src="img/2-2.png" style="zoom:50%;" /> 

（图2-2）

**`js` 项目文件 与 `libs` 引擎库目录**

项目代码和类库。

**`resources`资源目录 与 Scene.js**

resources资源目录和资源文件Scene.js，小游戏由于初始包的限制，建议将初始包的内容在规划好，最好能放到统一的目录下，便于初始包的剥离。

**`game.js`微信小游戏的入口文件**

游戏项目入口JS文件与适配库JS等都是在这里进行引入。IDE创建项目的时候已生成好，一般情况下，这里不需要动。

**`game.json` 小游戏的配置文件**

开发者工具和客户端需要读取这个配置，完成相关界面渲染和属性设置。比如屏幕的横竖屏方向，状态栏的显示、小游戏分包等，都是在这里配置。具体如何配置，以及参数的使用，可以查看[微信小游戏的开发文档](https://mp.weixin.qq.com/debug/wxagame/dev/index.html?t=2018115)。

**`fileconfig.json` 小游戏的项目配置文件**

文件里包括了小游戏项目的一些信息，如果想修改appid等信息，可以直接在这里面编辑。

> 项目参数libVersion的值一定要是game，这里一般不会出错。但是，万一出现了LayaAirIDE里发布正常，也引用了适配库，发布为小游戏后，在开发者工具里还是有报错的话，可以检查libVersion里的值是不是game。不是的话要改为game。

**`weapp-adapter.js` **

微信小游戏适配库文件。



## 三、用微信开发者工具创建小游戏项目

### 3.1 开发者帐号登录，选择项目类型

打开”微信web开发者工具“，用开发者的微信扫码登录。然后选择**小游戏**点击进入项目设置，选择导入，如图3-1所示。

<img src="img/3-1.png" alt="image-20230105105443511" style="zoom:50%;" /> 

（图3-1）

### 3.2 导入小游戏项目

选择项目目录，就是在LayaAirIDE发布后的目标目录（通常在项目根目录下的release\wxgame）

<img src="img/3-2.png" style="zoom:50%;" /> 

（图3-2）

选择wxgame目录之后，如图3-3所示

<img src="img/3-3.png" style="zoom:50%;" /> 

（图3-3）

`AppID` 测试账号，可以点击注册，不输入也可以开发调试，可以使用测试号，不过功能会受到限制。所以最好还是输入 `AppID`

### 3.3 微信开发者工具的编译

完成小游戏项目的创建后，即可在工具内预览效果和调试。如图3-4所示

![](img/3-4.png)

（图3-4）

### 3.4 真机测试与调试

由于LayaAirIDE里也可以调试项目效果，除非是适配相关的问题，基本上两边的效果不会有不一一致的情况。所以这里最重要的是点击**预览**功能，通过手机微信扫码，在微信内进行真机测试与调试。如图3-5所示

<img src="img/3-5.png" style="zoom:50%;" /> 

（图3-5）

至此，一个完整的小游戏开发流程就结束了。采用LayaAir IDE开发的小游戏项目，基本上是无缝用于微信小游戏项目。



## 四、分包与动态资源加载

在微信小游戏中加载资源，如果引用的是本地路径，比如：

```typescript
Laya.loader.load("resources/layaair.png");
```

如果项目的目录中，全部大小加起来不超过4M的话，只要能找到本地的资源，怎么写也没问题。

但是，微信小游戏的本地包有4M的限制，一旦超过这个限制，那就不允许上传，不允许真机预览。

所以，**项目要是大于4M后，怎么处理呢？**

### 4.1 分包

一种方案是分包，

> 微信小游戏分包限制：
>
> - 整个小游戏所有主包+分包大小不超过 20M
> - 主包不超过 4M
> - 单个普通分包不限制大小
> - 单个独立分包不超过 4M
>
> 请参考微信小游戏[官方文档](https://developers.weixin.qq.com/minigame/dev/guide/base-ability/subPackage/useSubPackage.html)。

下面来介绍LayaAir IDE给微信小游戏分包的方法，开发者可以先看一下[《Web发布》](../../web/readme.md)的分包。

如图4-1所示，在构建发布中，开启分包后，选择要分包的文件夹，即可完成分包。开发者也可以选择是否使用远程包。

<img src="img/4-1.png" alt="4-1" style="zoom:80%;" />

（图4-1）

与Web分包不同的是，小游戏分包代码引用的资源的方法不同。在web平台中，使用`loadPackage`方法加载包的参数有三个，而小游戏分包需要使用两个参数的重载方式，两个参数的重载方式不仅仅用于微信小游戏，别的小游戏平台也同样适用。下面给出一段代码加载分包的示例代码：

```typescript
const { regClass, property } = Laya;

@regClass()
export class Script extends Laya.Script {
    //declare owner : Laya.Sprite3D;

    @property({ type: Laya.Scene3D })
    scene3d: Laya.Scene3D;

    constructor() {
        super();
    }

    /**
     * 组件被激活后执行，此时所有节点和组件均已创建完毕，此方法只执行一次
     */
    onAwake(): void {
        //小游戏加载分包
        Laya.loader.loadPackage("sub1", this.printProgress).then(() => {
            Laya.loader.load("sub1/Cube.lh").then((res: Laya.PrefabImpl) => {
                let sp3: Laya.Sprite3D = res.create() as Laya.Sprite3D;
                this.scene3d.addChild(sp3);
            });
        })

        Laya.loader.loadPackage("sub2", this.printProgress).then(() => {
            Laya.loader.load("sub2/Sphere.lh").then((res: any) => {
                let sp3 = res.create();
                this.scene3d.addChild(sp3);
            });
        })
    }

    printProgress(res: any) {
        console.log("加载进度" + JSON.stringify(res));
    }

}
```

下面重点介绍一下`printProgress`打印的内容，在微信开发者工具打开并编译我们导出的项目后，会打印如下日志：

![4-2](img/4-2.png)

（图4-2）

 [wx.loadSubpackage()](https://developers.weixin.qq.com/minigame/dev/api/base/subpackage/wx.loadSubpackage.html) 返回的一个 [LoadSubpackageTask](https://developers.weixin.qq.com/minigame/dev/api/base/subpackage/LoadSubpackageTask.html)，可以通过它获取当前下载进度。

> 参考微信小游戏[官方文档](https://developers.weixin.qq.com/minigame/dev/guide/base-ability/subPackage/useSubPackage.html)。

打印的参数的意义分别是：

`progress`：下载进度；

`totalBytesWritten`：已经下载的数据长度；

`totalBytesExpectedToWrite`：预期需要下载的数据总长度。



### 4.2 网络动态加载

另一种方案就是网络动态加载，

我们在本地包内，JS代码是必须要放进去的，因为JS是不允许网络加载动态创建的。所以如果本地包内JS超过4M，首先考虑的是如何优化JS体积，比如混淆压缩，和UI代码分离。还是不行的话，只能是通过小游戏的分包方案解决。如果JS没有超过4M，那还可以视情况再放一些预加载用的基础资源。

那**网络动态加载的路径怎么处理呢**。在本地加载的`load()`方法之后使用`URL.basePath`方法。

例如：

```typescript
onAwake(): void {
        //网络动态加载
        Laya.URL.basePath = "https://XXXX";//请把XXX换成自己的真实网址；
        //在此之下，再使用load加载资源，都会自动加入URL网址。从网络上动态加载。
        Laya.loader.load("resources/layaair.png").then((res: Laya.Texture) => {
            let sprite:Laya.Sprite = new Laya.Sprite();
            sprite.texture = res;
            this.owner.addChild(sprite);
        });
    }
```

使用`URL.basePath`方法后，再使用load加载本地路径，都会自动加上URL.basePath里的网址。这样就实现了本地与网络加载的结合。

> [!Tip]
>
> 开发者在给URL.basePath赋值时，一定要看一下官方对于[网络](https://developers.weixin.qq.com/miniprogram/dev/framework/ability/network.html)的说明文档，必须符合要求才可以。

**这样就结束了吗？并没有！**这里再拓展一个本地包白名单机制。

按刚刚的写法，`resources/layabox.png`如果已经上传到微信小游戏的本地目录，但是如果在使用`URL.basePath`之后，再次加载`res/layabox.png`则不会从本地加载使用，而是从网络动态加载使用。

所以，引擎针对使用`URL.basePath`之后，如何再次使用本地加载，进行了**特殊目录和文件的处理**，也就是本地包白名单机制。如下例所示：

```json
MiniAdpter.nativefiles=[
    "layaNativeDir",
    "wxlocal",
    "resources/layaair.png"
]
```

> 代码位于发布目录的“libs\min”下的“laya.wxmini.js”文件中，"resources/layaair.png"为手动增加的目录。

**只要是MiniAdpter.nativefiles里存在的目录名或文件，引擎会自动将该目录视为本地目录**，即便使用了URL.basePath，对于包含在nativefiles白名单内的目录名或文件，都不会从网络动态加载，只会从本地加载。



## 五、生成开放数据域工程模板

开放数据域一般用来显示好友排行榜。

### 5.1 开放数据域

首先，如图5-1所示，在层级面板中，向Scene2D中添加一个OpenDataContexView组件，即可激活开放数据域的显示（此时并没有排行榜的效果显示，需要发布后才能看到），组件的大小就是好友排行榜面板的大小。

<img src="img/5-1.png" alt="5-1" style="zoom:67%;" />

（图5-1）

添加后，在其属性设置面板中，可以看到FPS属性，如图5-2所示，表示sharedCanvas更新到主域的帧率。

![5-2](img/5-2.png)

（图5-2）

然后构建发布时，勾选图2-1所示的`生成开放数据域工程模板`。发布完成后，如图5-3所示，会生成openDataContext目录。开发者可以根据需求修改这里面的内容，下次发布时，如果没有按照5.2那样构建模板目录，那么这个目录不会被清除或者修改。

![5-3](img/5-3.png)

（图5-3）

> 修改生成的工程模板（openDataContext目录里的文件），推荐使用一个轻量的[第三方Canvas引擎](https://github.com/wechat-miniprogram/minigame-canvas-engine)解决这个需求。开发者可以使用此引擎制作自定义的好友排行榜，然后替换掉openDataContext目录下对应文件里的代码即可。

发布后，在“微信开发者工具”里进行调试，此时使用的是默认的工程模板，效果如图5-4所示。

<img src="img/5-4.png" alt="5-4" style="zoom: 67%;" />

（图5-4）

### 5.2 构建模板目录

开发者可以在项目目录中建立`build-templates/平台名称`，例如：build-templates/wxgame，发布时会将这里面的内容拷贝到输出目录。如果是json文件，还会进行合并。比如在build-templates/wxgame里放置game.json，并且内容为 `{"showStatusBar": true }`，那么最终的game.json文件里这个key值就会被加入，并且引擎模版里的game.json其他key值会保留。

在游戏好友排行榜的开发中，发布后的release目录一般不会加入版本管理，这里的openDataContext目录在协同开发中可能不方便，那么可以将自定义改好的openDataContext目录放入构建模版目录，即放置在图5-5所示的项目根目录下的build-templates下的wxgame，这样每次发布时选择的`生成开放数据域工程模板`就不再是图5-4所示的IDE默认的模板了，而会从模版目录`build-templates/wxgame`中拷贝。

![5-5](img/5-5.png)

（图5-5）



## 六、引擎插件

引擎插件能力是游戏引擎(作为插件)单独在微信客户端进行缓存。当小游戏首次启动时，如果本地已经存在同类别游戏引擎插件，可直接复用或可通过增量下载的方式快速下载，从而提升启动速度。建议开发者先看一下微信官方给出的插件[文档](https://developers.weixin.qq.com/minigame/dev/guide/base-ability/game-engine-plugin.html)。

### 6.1 版本说明

在Android微信和iOS微信的**7.0.7版本(>=7.0.7)**，可直接体验和测试插件分离功能。使用微信开发者工具的[RC](https://developers.weixin.qq.com/miniprogram/dev/devtools/rc.html)版本(>=1.02.1911181)或[Nightly](https://developers.weixin.qq.com/miniprogram/dev/devtools/nightly.html)版本(>=1.02.1911202)，使用2.9.0基础库(>=2.9.0)即可。

- 目前一个APPID，只支持引用一个插件。
- 目前支持**整包**小游戏使用插件，以及分包小游戏的**主包**使用插件。

LayaAir IDE的正式版从3.0.9开始，支持发布微信小游戏时使用引擎插件。更新纪录查询地址点击[这里](https://mp.weixin.qq.com/wxopen/pluginbasicprofile?action=intro&appid=wx8c0b1c048ce88ad2&token=&lang=zh_CN)。



### 6.2 使用引擎插件

当开发者在LayaAir IDE中发布微信小游戏的时候，可以勾选`是否使用引擎插件`的功能模块选项，如图6-1所示。

![6-1](img/6-1.png)

（图6-1）

勾选后，发布的微信小游戏版本，会自动配置好引擎插件的相关配置。然后和普通发布小游戏的流程一样就可以了。

> 不要勾选“开启版本管理”选项。

这里为大家讲解一下，勾选后LayaAir IDE做了哪些事。

#### 6.2.1 自动生成了引擎插件的本地目录

发布后的微信小游戏目录与没用引擎插件的目录相比，多了一个`laya-libs`目录。

这个多出来的`laya-libs`目录就是引擎插件本地版目录，这个目录的作用是为了兼容微信7.0.7以下版本用的。如果玩家的微信是低版本，则需使用本地包引擎插件目录`laya-libs`下的引擎插件，如果是微信7.0.7及以上版本。这个目录则不会使用。

假如开发者不考虑兼容7.0.7以下的版本用户，可以删除这个目录以减小本地包体的大小。但是，如果要删除这个目录，还需要把发布目录下game.json里的`"path"`字段也删除（详见6.2.2）。

#### 6.2.2 修改了game.json

除了多创建了一个`laya-libs`，IDE还修改了game.json。插件的使用全靠这里，game.json里多了plugins（插件）配置：

```json
  "plugins": {
    "layaPlugin": {
      "version": "3.0.9",
      "provider": "wx8c0b1c048ce88ad2",
      "path": "laya-libs"
    }
  }
```

其中，`version`字段的内容是版本号，字段必须保留。`provider`是引擎插件提供者appId，千万不要动这里。`path`字段，如果不考虑兼容7.0.7以下的用户和不需要使用本地版插件进行调试，可以删除本字段。



### 6.3 微信开发者工具中的配置

初次使用引擎插件时，需要添加插件。发布后，在微信开发者工具中会报如下错误，点击“添加插件”，然后在弹出的面板中将LayaAir3插件添加即可。

<img src="img/6-2.png" alt="6-2" style="zoom:80%;" />

（图6-2）

说明：

在使用微信开发者工具进行调试的过程中，项目设置中的本地设置会出现 “使用本地插件” 的选项，如图6-3所示。

<img src="img/6-3.png" alt="6-3" style="zoom:50%;" />

（图6-3）

- 勾选该选项后，代码调试过程中，将使用`path` 字段指定的目录中的文件作为插件代码文件进行调试(近似模拟微信低版本(<=7.0.6)的情况)，即本地`laya-libs`目录下的引擎库。
- 不勾选该选项，代码调试过程中，将使用线上已发布的插件版本进行调试。(默认选项-近似模拟支持插件分离的微信高版本(>=7.0.7)的情况)

> 如果怀疑公用版本可能存在BUG，也可以勾选开启本地插件，通过本地与公用版本的对比，用于排查问题。



### 6.4 FAQ

**插件版引擎中包括哪些引擎库？**

微信插件版引擎，并非是LayaAir引擎库的全部。LayaAir3.x引擎 包括的库为：

```
laya.ani.js
laya.core.js
laya.d3.js
laya.particle.js
laya.physics.js
laya.ui.js
```

对于这些，开发者知道即可，后续可能会有所变化，不需要管太多，之前不用插件的时候怎么开发还是怎么开发。哪怕不知道引擎插件库包括哪些，也不影响使用。LayaAir会自动识别哪些库属于引擎插件库。不在插件库里的，引擎也会自动处理引用关系。



**插件的代码包会占主包大小吗**

插件的设计并不是为了减少包体，插件在预览上传时，会占用主包大小。