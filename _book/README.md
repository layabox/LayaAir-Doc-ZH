[![img](https://github.com/layabox/LayaAir/raw/LayaAir_3.2/logo.png)](https://layaair.com/)

# LayaAir引擎中文文档

**[Layabox](https://www.layabox.com/) 旗下的 [LayaAir](https://layaair.com/) 引擎是全平台引擎**，可一键发布到多个游戏平台，除HTML5 WEB外，还同时支持发布Native APP（安卓、iOS、鸿蒙NEXT、Windows、Mac、Linux），小游戏（微信小游戏、字节跳动小游戏、支付宝小游戏、OPPO小游戏、vivo小游戏、小米快游戏、淘宝小游戏等）。

支持2D与3D开发，应用于游戏、教育、广告、营销、数字孪生、元宇宙、AR导游、VR场景、建筑设计、工业设计等众多领域。

LayaAir引擎提供强大的IDE集成环境，包含3D场景编辑器、材质编辑器、粒子编辑器、蓝图编辑器、动画编辑器、物理编辑器、UI编辑器。IDE提供丰富的扩展能力给开发者自定义工作流，开发者更可更上传插件到资源商店分享和销售。

![Screenshot of LayaAirIDE](https://official.layabox.com/laya_data/news/2025/0104/7-1.gif)

（图1）2D粒子可视化编辑效果

![](https://official.layabox.com/laya_data/news/2023/0630/21.gif) 

（图2）3D粒子可视化编辑效果

## 贡献文档的规范

欢迎开发者修改和提交LayaAir引擎文档，让我们共同建设开发者生态。对于积极的优质生态贡献者，LayaAir引擎官方会颁发荣誉证书，以及提供免费的VIP级别LayaAir引擎服务。

### 1、基于MarkDown语法

LayaAir的文档基于MarkDown语法编写，如果语法较为熟悉，可以基于vscode等编辑工具编写和预览。

我们也推荐使用Typora等MarkDown文档编写工具，从读写体验上更优。

### 2、文件与目录命名规范

- 目录命名要基于引擎与IDE的结构与层级，目录名称合理清晰，可参照已有的目录结构。
- 文件名固定为`readme.md`。例如WebXR的文档属于3D引擎，所以在文件位于`3D/WebXR/readme.md`
- 文档中的图片需要统一存放在某个目录，通常与`readme.md`目录同级，例如，WebXR文档的图片目录位于`3D/WebXR/img`

### 3、文档质量要求

- 文章标题，必须为1级标题，语法标识为`#`
- 小节标题，必须为2级标题，语法标识为`##`
- 由于文档网页的导航只支持到3级标题，所以文档在规划时，尽可能控制在3级标题（语法标识为`###`）内。
- 文档导航结构清晰合理，图文并茂，尽可能面向新手开发者，将细节流程描述清楚。
- 每一处编写的内容需要经过实测验证，基于事实客观编定，不能凭借曾经的经验进行主观性编写。

如果在编写文档的过程中遇到问题，可联系官方客服，寻求帮助。

![](https://layaair.com/img/wechat.8197aa26.jpg) 

（扫码添加客服微信）

## 如何把MarkDown编为静态网站

通常，我们直接去引擎官网阅读编译后的网站文档（[https://layaair.com/3.x/doc/](https://layaair.com/3.x/doc/)）即可，如果我们需要在本地建立文档或预览效果。可以参照以下指南：

### 1、安装环境

LayaAir3的文档基于GitBook编译，但需要注意的是，**GitBook环境实测在Node 10.24.x的版本才是可用的。**

如果您本地的node环境不是这个版本的，为了后续管理多个node版本，推荐先安装nvm管理工具，[https://github.com/coreybutler/nvm-windows/releases](https://github.com/coreybutler/nvm-windows/releases)

#### nvm常用命令

安装某个node版本，例如安装10.24.1

```sh
nvm install 10.24.1
```

查询已安装的列表

```sh
nvm list
```

切换至某个node版本，例如10.24.1

```
//nvm use [version] [arch] ：使用制定版本node。可指定32/64位  
nvm use 10.24.1
```

#### 安装gitbook-cli

准备好以上环境，确保当前位于node 10.24.x版本时，再安装gitbook-cli

```\
npm install -g gitbook-cli
```

### 2、GitBook常用命令

仅把文档编译为静态网站

```sh
gitbook build
```

> 执行完 `gitbook build`命令会在根目录下生成 `_book` 文件夹，这个文件夹中的内容就是文档的静态网站。

把文档编译为网站并启动本地Web服务

```shell
gitbook serve
```

> `gitbook serve` 命令实际会先调用 `gitbook build` 编译书籍，完成后打开 web 服务器，默认监听本地 4000 端口，在浏览器打开 [http://localhost:4000](http://localhost:4000/) 即可浏览电子书。

### 3、编译相关文件说明

- `SUMMARY.md`文件是网站的目录导航，通过调整这个目录，可以改变网站的左侧导航结构。具体格式可以打开`SUMMARY.md`查看和参照。
- `book.json`文件是GitBook所需插件的配置文件，通过这个文件配置了GitBook的常用插件，让文档更好用。



