# 视频

在制作游戏时，播放视频这一功能有很广泛的应用，例如播放过场动画，游戏加载界面的背景等，本问总结了LayaAir引擎中可以用于播放视频的一些方法，供开发者参考。

## 一、视频节点

开发者可以在场景中添加视频节点，用于播放视频。程序运行时视频节点不会自动播放，需要开发者使用代码控制。有关视频节点的具体使用方法，可以参考[视频节点](../../../../2D/displayObject/VideoNode/readme.md)。

![1-1](img/1-1.gif)



## 二、Dom元素video

开发者也可以使用Dom元素来播放视频，具体的使用方法[ LayaAir和原生Dom](../../../../2D/dom/readme.md)这篇文档中的`LayaAir之Dom元素video`小节已有详细的讲解，这里不再重复。

![](img/2-1.gif)



## 三、视频纹理

如果开发者希望在3D场景中播放视频，可以使用视频纹理。视频纹理需要通过代码来使用。

下面这段代码提供了一个简单的示例，演示了如何使用视频纹理：

```typescript
const { regClass, property } = Laya;

/**
 * 使用视频纹理
 */
@regClass()
export class Script extends Laya.Script {
    declare owner: Laya.Sprite3D;

    @property(Laya.Scene3D)
    private scene: Laya.Scene3D;

    private videoPlane: Laya.Sprite3D;
    private videoTexture = new Laya.VideoTexture();

    onAwake(): void {
        //获取场景中要添加视频纹理的3D节点
        this.videoPlane = this.scene.getChildByName("Plane") as Laya.Sprite3D;
        //使用指定路径的视频文件
        this.createVideo("resources/mov_bbb.mp4");
    }

    //创建视频纹理并将其应用到Sprite3D上
    private createVideo(url: string): void {

        //设置纹理的路径
        this.videoTexture.source = url;
        //开始播放视频
        this.videoTexture.play();
        //设置纹理的播放模式为循环播放
        this.videoTexture.loop = true;

        //创建一个不受光材质
        let mat = new Laya.UnlitMaterial();
        //将创建好的视频纹理设置为材质的贴图
        mat.albedoTexture = this.videoTexture;
        //将材质应用到Sprite3D上
        this.videoPlane.getComponent(Laya.MeshRenderer).sharedMaterial = mat;

    }
}
```

效果如图所示：

![3-1](img/3-1.gif)

下面我们来介绍一下videoTexture中常用的属性和方法，开发者也可以在[API文档](https://layaair.layabox.com/3.x/api/Chinese/index.html?version=3.0.0&type=Core&category=Media&class=laya.media.VideoTexture)中查看videoTexture的所有属性和方法。

**属性**：

| 名称                   | 用途                     |
| ---------------------- | ------------------------ |
| currentSrc             | 获取当前视频源路径。     |
| currentTime            | 当前视频播放的起始位置。 |
| duration               | 视频长度，以秒为单位。   |
| ended                  | 视频的播放是否已结束。   |
| loop                   | 播放结束时是否重新播放。 |
| muted                  | 视频是否静音。           |
| playbackRate           | 视频的当前播放速度。     |
| source                 | 视频的源路径。           |
| videoHeight/videoWidth | 视频源高度/视频源宽度。  |
| volume                 | 当前音量。               |

方法：

| 名称        | 用途                           |
| ----------- | ------------------------------ |
| canPlayType | 检测是否支持播放指定格式视频。 |
| load        | 重新加载视频。                 |
| pause       | 暂停播放视频。                 |
| play        | 开始播放视频。                 |



























