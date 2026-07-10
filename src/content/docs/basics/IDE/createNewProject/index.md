---
title: "创建新项目"
description: "创建一个新项目文件往往是项目开发的第一步，LayaAir引擎可以使用项目模板来创建新项目。"
slug: "basics/ide/createnewproject"
---

创建一个新项目文件往往是项目开发的第一步，LayaAir引擎可以使用项目模板来创建新项目。

## 一、打开创建界面

运行LayaAirIDE，在右上角可以看到创建项目的按钮，点击就可以打开创建新项目的界面。

<img src="/basics/IDE/createNewProject/img/1-1.png" alt="1-1" style="zoom:80%;" />



界面的左侧是模板类别，IDE根据模板用途的不同，对模板进行了分类：

<img src="/basics/IDE/createNewProject/img/1-2.png" alt="1-2" style="zoom:80%;" />



界面中间是模板选择栏，开发者可以在此选择想要根据哪个模板来创建项目，如果模板数量很多，也可以使用搜索功能来找到想要的模板：

<img src="/basics/IDE/createNewProject/img/1-3.png" alt="1-3" style="zoom:80%;" />



界面右侧是模板介绍和项目设置，开发者可以根据模板介绍的内容大致了解这个模板的用途和效果：

<img src="/basics/IDE/createNewProject/img/1-4.png" alt="1-4" style="zoom:80%;" />

项目设置处可以对项目的名称和创建位置进行设置：

<img src="/basics/IDE/createNewProject/img/1-5.png" alt="1-5" style="zoom:80%;" />

`项目名称`：此项目的名称，如果不设置的话IDE会以LayaProject加编号的形式自动进行命名

`项目位置`：此项目保存的位置，如果勾选了下方`在此位置创建子目录`选项，IDE会在项目位置的路径下创建一个与项目名称同名的文件夹，否则会直接在项目路径下创建项目中的各个文件。

完成设置之后，点击创建项目即可创建一个新项目。

<img src="/basics/IDE/createNewProject/img/1-6.png" alt="1-6" style="zoom:80%;" />



## 二、项目模板

下面我们对引擎中的各类模板进行介绍。

### 2.1核心模板

核心模板是最基础的项目模板，这两个模板在安装LayaAirIDE时就会自动安装，无需通过网络进行下载：

<img src="/basics/IDE/createNewProject/img/2-1-1.png" alt="2-1-1" style="zoom:80%;" />

开发者可以根据要开发的项目类型选择2D空项目或3D空项目，但LayaAir引擎没有对2D项目和3D项目进行严格的分离，即使创建的是2D空项目，开发者也可以在其中添加并编辑3D场景。



### 2.2示例模板

示例模板用于对引擎的各项功能进行基础演示，这三个模板需要通过网络进行下载，点击模板右侧的按钮即可进行下载：

<img src="/basics/IDE/createNewProject/img/2-2-1.png" alt="2-2-1" style="zoom:80%;" />



如果模板右侧出现了下图所示的符号，开发者就需要更新这个模板，否则创建的项目可能出现已经解决的bug：

<img src="/basics/IDE/createNewProject/img/2-2-2.jpg" alt="2-2-2" style="zoom:80%;" />

下面来介绍一下这三个模板：

`新UI入门示例`：LayaAir引擎自3.3.0版本接入了基于FairyGUI框架的新UI系统，此模板是对新UI系统的基础演示。

`引擎API使用示例`：基于LayaAir引擎API的示例项目，此模板中包含直接通过代码调用API来创建游戏内容的基础使用示例和进阶使用示例，这个模板十分重要，开发者可以通过这个模板来了解引擎各项功能的具体使用方式。

`3D导航寻路示例`：此模板中包含3D寻路导航组件的使用方法，适合初学者学习和参考。



### 2.3学习模板

学习模板是相对复杂的引擎能力综合应用的进阶模板，这系列的模板会涉及到多个引擎功能的交互使用，还包括IDE中进行场景编辑的内容。与示例模板相同，学习模板同样需要通过网络进行下载与更新：

<img src="/basics/IDE/createNewProject/img/2-3-1.png" alt="2-3-1" style="zoom:80%;" />

`2D入门示例`：此模板中包含综合UI示例，脚本的进阶使用方法，以及物理游戏Demo，2D与3D混合应用的示例。

`3D入门示例`：此模板中包含引擎中常用3D功能在IDE中的使用方法，新手开发者可以此为学习参考。

`3D—RPG示例`：此模板中包含3D场景的搭建与烘焙，角色控制以及NPC战斗系统。



### 2.4已购源码

已购源码指的是开发者在LayaAir资源商店中免费或付费购买的源码项目。开发者可以在资源商店中打开需要的资源，并点击添加至我的资源，就可以在IDE中看到这个模板，已购源码也需要通过网络下载与更新：

<img src="/basics/IDE/createNewProject/img/2-4-1.png" alt="2-4-1" style="zoom:80%;" />

<img src="/basics/IDE/createNewProject/img/2-4-2.png" alt="2-4-2" style="zoom:80%;" />



### 2.5本地模板

本地模板是由开发者自行导出的项目模板，这种模板不需要上传资源商店，对有保密要求的项目十分友好。

有关本地模板的导出方式，开发者可以参考这篇文章[资源包导出与提交至资源商店](/ide/layapackage/exporttostore/)中的第四节。导出好的项目源码模板是一个.zip文件。

第一次使用某个模板时需要先导入模板，点击本地模板，可以看到右上角有一个导入本地模板的按钮，

<img src="/basics/IDE/createNewProject/img/2-5-1.png" alt="2-5-1" style="zoom:80%;" />



点击这个按钮，并选择要导入的模板（一个.zip文件），然后点击确认即可导入这个模板。

![2-5-2](/basics/IDE/createNewProject/img/2-5-2.png)

模板成功导入后开发者就可以使用这个模板创建项目了，本地模板的具体用法和其它模板一样，这里就不再重复。



点击模板右侧按钮，开发者可以对这个模板进行管理：

<img src="/basics/IDE/createNewProject/img/2-5-3.png" alt="2-5-3" style="zoom:80%;" />

`在文件管理器中打开`：引擎在导入模板时会将模板存放到指定文件路径，通过此选项可以打开模板所在路径。

`设置模板预览`：选择一张图片作为此模板的预览图。

<img src="/basics/IDE/createNewProject/img/2-5-4.png" alt="2-5-4" style="zoom:80%;" />

`设置模板描述`：为此模板添加一段描述，用于说明模板用途。

<img src="/basics/IDE/createNewProject/img/2-5-5.png" alt="2-5-5" style="zoom:80%;" />

`设置模板名称`：自定义此模板的名称，此设置不会影响创建出的项目的名称。

<img src="/basics/IDE/createNewProject/img/2-5-6.png" alt="2-5-6" style="zoom:80%;" />

`删除`：在模板目录中删除此模板。







