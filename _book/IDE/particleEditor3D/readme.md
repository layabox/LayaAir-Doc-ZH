# 3D粒子编辑器



## 一、3D粒子编辑器基础

### 什么是3D粒子

在百科中，粒子是指能够以自由状态存在的最小物质组成部分。

在LayaAir引擎中，3D粒子系统中的粒子可用于模拟中烟、雾、水、火、雨、雪、流光等非固定形态的自然现象。而上述这些自然物体的形态由于没有固定的形态，所以不能用固定的模型来模拟实现，需要用多个模型组合成一个完整的视觉效果，而3D粒子正是组合效果的最小单元，但需要注意的是，粒子并非是三维模型，而是面片模型。

### 火焰效果展示

<img src="gif/1.gif" alt="1" style="zoom:50%;" /> 

（动图1）

## 二、LayaAir引擎中创建3D粒子

#### 2.1 粒子节点

在场景中的Scene3D节点下，可以通过鼠标右键来创建3D粒子

<img src="images/2.png" alt="2" style="zoom:40%;" /> 

（图2.1.1-1）

默认粒子系统添加完成效果

<img src="gif/10.gif" alt="10" style="zoom:33%;" /> 

（动图2）

#### 2.2 预制体

如果考虑到3D粒子是需要复用的，建议使用预制体，在Assets下创建预制体，双击打开预制体后，在Sprite3D节点下通过鼠标右键来创建3D粒子

<img src="images/12.png" style="zoom:60%;" /> 

（图2.1.2）

## 三、3D粒子的使用

### 3D粒子的使用由三部分构成

- ### **粒子系统组件**

- ### **粒子渲染模块**

- ### **粒子着色器**

  <img src="images/46.png" alt="image-20221104145528912" style="zoom:40%;" /> 

  （图3.0）从图3.0中看到，当创建一个3D粒子后，会自动添加这三个组件，下面我们来详细了解各系统的使用

### 3.1 粒子系统组件 `ParticleSystem`

粒子系统是LayaAir引擎特效表现的基础，通常粒子系统在三维空间中的位置与运动是由发射器控制的。发射器主要由一组粒子行为参数以及在三维空间中的位置所表示。粒子行为参数可以包括粒子生成速度（即单位时间粒子生成的数目）、粒子初始速度向量（例如什么时候向什么方向运动）、粒子寿命（经过多长时间粒子湮灭）、粒子颜色、在粒子生命周期中的变化以及其它参数等等。

#### 粒子系统组件分类

在LayaAir编辑器中，粒子系统组件由五个部分构成

<img src="images/1.png" alt="1" style="zoom:50%;" /> 

（图3.1）

#### 3.1.1 基础面板 `General`

默认的是粒子系统的通用模块，用于设置粒子系统的基础性的设置。此模块为固有模块，不可禁用。该模块定义了粒子初始化时的持续时间、循环方式、发射速度、大小等一些列基本的参数。

<img src="images/4.png" alt="4" style="zoom:50%;" /> 

（图3.1.1-1）

`Duration`：粒子系统不断发射粒子的持续时间，或者说一个周期时间内可以发射多次粒子，到达设置的时间后，粒子停止发射

​	*注意：不是一个粒子的生命周期时间，下面会介绍一个粒子的生命周期时间*

<img src="gif/2.gif" alt="2" style="zoom:50%;" /> 

（动图3）Duration为5的效果，5秒到达时，粒子不在发射，同时Loop要设为不启动

`Loop`：如果启用，粒子系统在上述持续时间结束时，再次启动并继续重复循环

`Play On Awake`：如果启用，粒子系统会在创建对象时自动启动

`Start Delay`：启用后系统开始发射前的延迟时间，可选择两种延迟方式
		`Constant` 固定时间
		`Random Between Two Constant` 从最小到最大两个时间中随机取值

<img src="gif/3.gif" alt="3" style="zoom: 40%;" /> 

（动图4）展示了使用最小2到最大5秒随机的方式，可以看到当第4秒时，粒子开始发射

`Start Lifetime`：控制每个粒子的生命周期，也就是粒子发生多长时间后消失，它可以是两个数字之间的随机值

<img src="gif/4.gif" alt="4" style="zoom:36%;" /> 

（动图5）展示了使用Start Lifetime为3时的效果，显示每个粒子从发射出生到消失用时3秒

`Start Speed`：每个粒子在适当方向上的初始速度，可选择两种延迟方式
		`Constant` 固定值
		`Random Between Two Constant` 从最小到最大中随机取值

​	动图5中展示了使用Start Speed为5时的速度效果

`Start Size`：每个粒子的初始大小，如果想分别控制每个轴的大小，请启用3D选项。可选择两种延迟方式
		`Constant` 固定值
		`Random Between Two Constant` 从最小到最大中随机取值

<img src="images/38.png" alt="image-20221104102146889" style="zoom: 38%;" /> 

（图3.1.1-2） 展示了Start Size在1和5之间随机，可以看到左边粒子有大有小

​	*注意：粒子的大小与它所使用的贴图大小是无关的，一个100像素的贴图与一个500像素的贴图绘制出来的同种粒子几乎差不多大，由此可见，StartSize规定了这个粒子的直径，而不是贴图缩放*

`Start Rotation`：每个粒子的初始旋转角度。如果您想分别控制每个轴的旋转，请启用3D选项。可选择两种延迟方式
		`Constant` 固定值
		`Random Between Two Constant` 从最小到最大中随机取值

<img src="images/39.png" alt="image-20221104102637418" style="zoom:39%;" /> 

（图3.1.1-3） 展示了Start Rotation在1和360之间随机，可以看到左边粒子有各个方向的旋转

`Start Color`：每个粒子的初始颜色

<img src="images/40.png" alt="image-20221104103039063" style="zoom:40%;" /> 

（图3.1.1-4） 展示了Start Color为红色的效果

*注意，即便在StartColor中规定了粒子为红色，显示出来的效果也不是纯红色，粒子与粒子，天空，红色方块叠加的地方都变成了不一样的颜色，这是因为画面的最终显示效果是由着色器调控的，我们在设置粒子材质的时候，选择的RenderingMode为Additive(叠加的)，所以最终显示效果会受到粒子背后传来的光的影响从而发生变色。可以尝试选择不同的着色器选项观察变化*

<img src="images/41.png" alt="image-20221104103526729" style="zoom:39%;" /> 

（图3.1.1-5） 展示了RenderingMode为Additive的效果

`Gravity Modifier`：设置物理重力值。零值会关闭重力

<img src="gif/5.gif" alt="5" style="zoom:50%;" /> 

（动图6）展示了使用`Gravity Modifier`为5时的效果 

`Simulation Space`：控制粒子是否跟随粒子发射器移动

​	`Local`：粒子生成后跟随粒子发射器坐标的移动而移动，这个模式下，粒子发射器的移动会表现在每个粒子上。

​	`World`：粒子生成后不跟随粒子发射器，直接在世界坐标系中移动。

`Simulation Speed`：调整整个粒子系统更新的速度

`Scale Mode`：控制粒子的缩放模式

​	`Hierarchy`：同时受自己与父节点的缩放影响

​	`Local`：只受自己的影响

​	`World`：不受影响

`Max Particles`：一次系统中的最大粒子数。如果达到限制，则会移除一些粒子。如果设置为1，则粒子系统会一个一个发射粒子
`Auto Random Seed`：自动粒子随机种子，启用后每次播放都会有不同。去掉勾选后，可以填随机种子的数值，不同的数值，发射粒子的表现略有不同

#### 3.1.2 发射模块 `Emission`

该模块是粒子系统组件的一部分，用来指定发射粒子的属性。当创建新的粒子系统时，Emission 模块会默认启用。

<img src="images/5.png" alt=" " style="zoom: 50%;" /> 

（图3.1.2）

`Enable`：是否启用
`Rate over Time`：每秒发射的粒子数
`Rate over Distance` 每个移动距离单位发射的粒子数，此模式对于模拟实际由对象运动产生的粒子非常有用（例如，泥路上车轮留下的尘土）
`Bursts`：爆发是产生粒子的事件。这些设置允许在指定时间发射粒子。可以设置多组爆发点，分别修改时间，最小粒子数，最大粒子数

<img src="gif/6.gif" alt="6" style="zoom:50%;" /> 

（动图7）展示了使用Rate Over Time为5，每秒发射5个粒子，同时使用一组Bursts，在第3秒时，突然发射30个粒子

#### 3.1.3 形状模块 `Shape`

该模块定义了发射粒子的体积或表面，以及起始速度的方向。

<img src="images/6.png" alt="6" style="zoom:50%;" /> 

（图3.1.3-1）

`Shape Type`：形状的选择会影响可以发射粒子的区域，还会影响粒子的初始方向。例如，一个Sphere向各个方向向外发射粒子，一个Cone发射一个发散的粒子流。
1，`Sphere` ：球，可以向四面八方发射粒子
	`Radius`：半径
	`Emit from shell`：根据壳发射
	`Randomize Direction`：随机化方向

<img src="gif/7.gif" alt="7" style="zoom: 45%;" /> 

（动图8）展示了使用球形，半径是3，从球体的边缘发射

2，`Hemisphere`：半球形状
	`Radius`：半径
	`Emit from shell`：根据壳发射
	`Randomize Direction`：随机化方向

<img src="images/42.png" alt="image-20221104113658052" style="zoom:50%;" /> 

（图3.1.3-2）

3，`cone`：锥形，让粒子像手电筒的光一样从一点开始向一个圆型扇出
	`Angle DEG`：形状的圆形方面的角度
	`Radius`：半径
	`Length`：长度
	`Emit from`：发射方式
		`Base`：基于锥形底部
		`Base Shell`：基于锥形底部壳
		`Volume`：基于锥形内部
		`Volume Shell`：基于锥形内部壳
	`Randomize Direction`：随机化方向

<img src="gif/8.gif" alt="8" style="zoom:50%;" /> 

 （动图9）展示了使用锥形，半径是2，锥形长度是6，从锥形内部发射

4，`Box`：盒子形，可以让所有粒子向单一方向发射，可以很好的模拟雨雪类粒子效果
	`Length`：XYZ各个方向的长度
	`Randomize Direction`：随机化方向

<img src="images/43.png" alt="image-20221104114904448" style="zoom: 40%;" /> 

（图3.1.3-3）

5，`circle`：环形
	`Radius`：半径
	`Angle DEG`：环形的角度
	`Emit From Edge`：基于边缘发射
	`Randomize Direction`：随机化方向

<img src="images/44.png" alt="image-20221104115105636" style="zoom:41%;" /> 

（图3.1.3-4） 

#### 3.1.4 生命周期`Lifetime`

该模块定义了发射出的粒子的生命周期内的属性

<img src="images/7.png" alt="7" style="zoom:50%;" /> 

（图3.1.4）

1，`Velocity over Lifetime`：生命周期中的速度
	`Constant`：常数模式，速度是恒定的
	`Curve`：曲线模式
	`Random from two Constant`：随机速度模式
	`Random between two Curve`：在两个曲线中随机取值	
	 `Space`：空间
		`Local`：模型空间
		`World`：世界空间
2，`Color over Lifetime`：生命周期中的颜色
	`Constant`：常数模式，颜色是恒定的
	`Gradient`：梯度模式
	`Random from two Constant`：随机两个颜色模式
	`Random between two Gradient`：在两个梯度中随机取值
3，`Size over Lifetime`：生命周期中的大小
		`Separate Axes`：按轴分离
		`Curve`：曲线模式
		`Random Between Two Contants`：在两个常数中随机取值
		`Random between two Curve`：在两个曲线中随机取值

4，`Rotation over Lifetime`：生命周期中的旋转
	 `Separate Axes`：按轴分离
		`Constant`：常数
		`Curve`：曲线模式
		`Random Between Two Contants`：在两个常数中随机取值
		`Random between two Curve`：在两个曲线中随机取值

#### 3.1.5 纹理动画 `Texture Sheet`

用来播放粒子动画的模块，粒子动画的原材料是一种纹理，它包含了一组**帧动画**，能够以动画方式渲染粒子。

帧动画：使用多张图片，每张图片为一帧，构成一个完整的动画叫帧动画。或一张大图片，图片中包含了一个动画的所有帧的图片

<img src="images/Fireball.png" alt="Fireball" style="zoom: 33%;" /> 

（图3.1.5-1）

<img src="images/8.png" alt="8" style="zoom:50%;" /> 

（图3.1.5-2）

目前LayaAir采用网格模式（Grid）

`Tiles`：纹理在 X（水平）和 Y（垂直）方向上划分的图块数量

`Animation`：动画模式可以设置为整张或单行（即，每行代表一个单独的动画序列）

`Frame`：设置帧

​	`Type`：帧类型

​		`Constant`：固定帧数

​		`Curve`：一条曲线，指定动画帧如何随着时间的推移而增加。

​		`Random Between two constant`：两个固定帧数之间随机

​		`Random Between two curve`：两个曲线之间随机

`Start Frame`：起始帧，允许您指定粒子动画应该从哪一帧开始

`Cycles`：动画序列在粒子生命周期内重复的次数

<img src="images/45.png" alt="image-20221104120252249" style="zoom:50%;" /> 

（图3.1.5-3）第四节火焰示例中会介绍使用过程

### 3.2 粒子渲染模块 `ShurikenParticleRenderer`

渲染器模块的设置决定了一个粒子的图像，模型，如何被其它粒子变换、着色和过度绘制。

#### <img src="images/9.png" alt="9" style="zoom: 50%;" />

（图3.2）

`Receive Shadows`：决定此系统中的粒子是否可以接收来自其它来源的阴影。只有不透明的材质才能接收阴影。

`Cast Shadows`：如果启用此属性，粒子系统会在投射阴影的灯光照射时创建阴影。

`Scale In Lightmap`：调整特定物体在最终LightMap中的像素密度。

`Materials`：用来渲染粒子的材质

`Render Mode`：如何从图形图像（或网格）生成渲染图像。

1，`Billboard`：将粒子渲染为广告牌，永远面向摄像机

2，`Stretched Billboard`：粒子面向摄像机的同时，允许使用粒子缩放
	`Speed Scale`： 根据粒子速度设置长度
	`Length Scale` ：通过比较粒子的宽度决定粒子的长度

3，`Horizontal Billboard`：粒子平面平行于XZ底平面

4，`Vertical Billboard`：粒子在Y轴上是直立的，但是面向相机

5，`Mesh`：粒子是从3D网格而不是纹理渲染的

<img src="gif/10.gif" alt="10" style="zoom:50%;" /> 

（动图）

`Sorting Fudge`：排序校正，使用这个将影响绘画顺序。粒子系统带有更低`Sorting Fudge`值，更有可能被最后绘制，从而显示在透明物体和其他粒子系统的前面

### 3.3 粒子着色器 `PARTICLESHURIKEN`

在材质中选择Laya的particle，可以添加Laya内置的粒子着色器（PARTICLESHURIKEN），其可渲染各种粒子系统
效果。所有的粒子都是用使用的这个材质。

#### <img src="images/10.png" alt="10" style="zoom:50%;" />

（图3.3）

`Color`：指定粒子的颜色。

`Texture`：指定粒子使用的纹理贴图

`Alpha Test Value`：透明测试开启时，当前像素根据设定条件决定是否输出颜色

`Tiling Offset`：获取纹理平铺和偏移

`Material Render Mode`：设置渲染模式

​	`Opaque`：默认设置，适用于没有透明区域的普通实体对象。
​	`Cutout`：允许创建在不透明和透明区域之间具有硬边的透明效果。在此模式下，没有半透明区域，纹理要么 100% 不透明，要么不可见。这在使用透明度来创建材料的形状（例如树叶或带孔和破烂的布）时很有用。
​	`Transparent`： 适用于渲染逼真的透明材质，例如透明塑料或玻璃。在此模式下，材质本身将采用透明度值（基于纹理的 Alpha 通道和色调颜色的 Alpha），但反射和照明高光将在完全清晰的情况下保持可见，就像真正的透明材质一样。
​	`Additive`： 叠加方式
​	`AlphaBlended`： 透明混合方式

`Cull`：剔除方式



## 四、火焰效果制作示例

#### 4.1 创建火焰预制体

<img src="images/13.png" alt="image-20221102094250016" style="zoom:50%;" /> 

（图4.1）

在Scene3D场景下，点击鼠标右键，选择创建Effects->Particle3D 默认创建一个3D粒子系统，命名为FireEffect，拖到Assets->Prefab目录下，创建好预制体

#### 4.2 火焰序列帧动画

<img src="images/15.png" alt="image-20221102095201473" style="zoom: 33%;" /> 

（图4.2）

准备好火焰序列帧动画贴图文件，放到Assets目录下，点击贴图，勾选sRGB和Alpha Channel，TextureType依然为Default，点击Apply按钮，确保修改成功

#### 4.3 设置火焰材质

<img src="images/16.png" alt="image-20221102095612863" style="zoom:33%;" /> 

（图4.3）

在Assets下创建一个材质，命名为FlameRoundYellowParticle，Shader使用Laya.Particle，基本上所有的粒子特效都使用此Shader。Color设置为191,191,191,255，texture选择上面添加的贴图，Material Render Mode选择ADDITIVE方式

#### 4.4 设置粒子系统渲染模块

<img src="images/17.png" alt="image-20221102100047289" style="zoom:33%;" /> 

（图4.4-1）

创建粒子系统后，Inspector面板中默认会添加ShurikenParticleRenderer组件，选择FlameRoundYellowParticle材质

<img src="images/18.png" alt="image-20221102101151815" style="zoom:33%;" /> 

（图4.4-2）

在Scene窗口中，可以看到粒子效果已经换成贴图，需要进一步设置贴图动画

#### 4.5 使用贴图动画

 <img src="images/19.png" alt="image-20221102101600360" style="zoom: 33%;" /> 

（图4.5-1）

在粒子系统的TextureSheet中，创建一个Instance，由于火焰贴图的组成方式为10x5，此时修改Tiles为X：10，Y：5。修改后粒子系统贴图变为火焰效果，但是依然是静态图，下面来修改Frame帧动画，修改Frame->Type为Curve，点击Curve打开面板，横轴为时间线，纵轴为帧动画的帧数，我们希望的效果是1秒中火焰帧动画循环播放一遍，也就是从0到50帧，那么我们修改Curve为下图

<img src="images/37.png" alt="image-20221102102312764" style="zoom:33%;" /> 

（图4.5-2）

完成Curve后，再看火焰效果已经可以播放帧动画

<img src="gif/9.gif" alt="9" style="zoom: 33%;" /> 

（动图10）

#### 4.6 设置基础属性

 <img src="images/20.png" alt="image-20221102102603464" style="zoom:33%;" />

（图4.6） 

Start Speed的Constant为0，火焰发射时的初始速度为0，Start Size的Constant为2，放大2倍火焰的尺寸，Simulation Speed为2，可以加快火焰播放的速度

#### 4.7 设置发射器

<img src="images/36.png" alt="image-20221103201917005" style="zoom:33%;" /> 

（图4.7） 

修改每单位时间发射的粒子数为5，相当于每秒中会燃烧5个火焰

#### 4.8 设置形状模块

<img src="images/21.png" alt="image-20221102103453699" style="zoom:33%;" /> 

（图4.8） 

我们希望粒子在一个圆形内发射，可以达到火焰聚集燃烧效果

#### 4.9 设置粒子生命周期

<img src="images/22.png" alt="image-20221102103927956" style="zoom:33%;" /> 

（图4.9-1） 

最重要一环为设置粒子生命周期，首先设置火焰生命周期内颜色的过程，创建Color Over Lifetime实例，Type设置为Gradient梯度变化曲线，打开Gradient面板，上面3个箭头向下的指示标表明颜色的透明度从 0%的不透明->80%的不透明->100%的全透明，下面的2个箭头向上的指示标表明颜色的区间变化从c99451到ff4500

<img src="images/23.png" alt="image-20221102104518054" style="zoom:33%;" /> 

（图4.9-2） 

由于火焰是粒子向上运动到消失，创建Velocity Over Lifetime实例，选择Curve曲线，只需要修改Y轴的位移为1秒钟从0到1，向上移动1个单位

<img src="images/24.png" alt="image-20221102104820089" style="zoom:33%;" /> 

（图4.9-3） 

由于火焰是会尺寸上有缩小的过程，创建Size Over Lifetime实例，选择Curve曲线，只需要修改0.5秒时间内，Size从1到0.5，缩小一倍

<img src="gif/1.gif" alt="1" style="zoom:50%;" /> 

（动图11）

此时在Scene窗口中看到，火焰效果已制作完成

## 五、应用场景及代码示例

往往在游戏的战斗过程中，需要大量创建粒子，那么需要用到对象池。对象池优化是游戏开发中非常重要的优化方式，也是影响游戏性能的重要因素之一。在游戏中有许多对象在不停的创建与移除，比如角色攻击子弹、特效的创建与移除，NPC的被消灭与刷新等，在创建过程中非常消耗性能，特别是数量多的情况下。对象池技术能很好解决以上问题，在对象移除消失的时候回收到对象池，需要新对象的时候直接从对象池中取出使用。优点是减少了实例化对象时的开销，且能让对象反复使用，减少了新内存分配与垃圾回收器运行的机会。

> *注意：对象移除时并不是立即从内存中抹去，只有认为内存不足时，才会使用垃圾回收机制清空，清空时很耗内存，很可能就会造成卡顿现象。用了对象池后将减少程序的垃圾对象，有效的提高程序的运行速度和稳定性。*

### 5.1 自定义Particle3D类

```typescript
import Node = Laya.Node;
import Sprite3D = Laya.Sprite3D;
import ShuriKenParticle3D = Laya.ShuriKenParticle3D;
import ShurikenParticleSystem = Laya.ShurikenParticleSystem;
import { Pool } from "./Pool";

//粒子特效的基类，包括创建，播放，暂停，销毁，清理对象池
export class Particle3D extends Sprite3D  {

    private _isInited: boolean = false;
    private _filePath: string = null;
    private _particle: Laya.Sprite = null;
    private _shuriKenParticle3D: Array<ShuriKenParticle3D>= [];
    private _shurikenParticleSystem: Array<ShurikenParticleSystem>= [];
    constructor() 
    {
        super();
    }
    
	//通过传入粒子特效的路径，创建一个粒子特效，从对象池里拿一个
    static Create(path: string): Particle3D
    {
        var ret:Particle3D = Pool.getInstance().getItemByClass("Particle3D@" + path, Particle3D);
        ret.Init(path);
        return ret;
    }
    
	//粒子特效初始化
    private Init(file_path:string): void
    {
        if (this._isInited)
        {
            return;
        }
        this._filePath = file_path;

        console.log("Particle3D");
        //从拿到的粒子系统克隆一个
        var res = Laya.loader.getRes(file_path);
        var particle = res.clone();

        this._particle = particle;
        //获取这个粒子特效的所有粒子系统，用于后面整体播放
        for (var i = 0, len = this._particle.numChildren; i < len; i++)
        {
            var child:Node = this._particle.getChildAt(i);
            if (child instanceof Laya.ShuriKenParticle3D)
            {
                this._shuriKenParticle3D.push(child);
                this._shurikenParticleSystem.push(child.particleSystem);
            }
        }

        this.addChild(this._particle);
        this._isInited = true;
    }

	//粒子特效播放，由于一个复杂的粒子特效由多个粒子系统组成，此时遍历粒子特效所有粒子系统对象调用play()
    play(): void 
    {
        for (var i = 0, len = this._shurikenParticleSystem.length; i < len; i++)
        {
            var particle_system = this._shurikenParticleSystem[i];
            particle_system.simulate(0, true);
            particle_system.play();
        }
    }

	//粒子特效暂停和恢复，由于一个复杂的粒子特效由多个粒子系统组成，此时遍历粒子特效所有粒子系统对象调用pause()和play()
    pause(): void 
    {
        for (var i = 0, len = this._shurikenParticleSystem.length; i < len; i++)
        {
            var particle_system:ShurikenParticleSystem = this._shurikenParticleSystem[i];
            if (this._isPaused)
            {
                particle_system.play();
                this._isPaused = false;
            }
            else
            {
                particle_system.pause();
                this._isPaused = true;               
            }
        }
    }

	//粒子系统对象池回收
    Recover(): void
    {
        this.removeSelf();
        Pool.getInstance().recover(this._filePath, this);
    };

	//彻底销毁清理一个粒子特效对象
    Clean(): void
    {
        if (this.destroyed)
        {
            return;
        }

        this.Recover();

        if (this._particle && !this._particle.destroyed)
        {
            this._particle.removeSelf();
            this._particle.destroy(true);
            this._particle = null;
        }

        this._shuriKenParticle3D = null;
        this._shurikenParticleSystem = null;

        this._isInited = false;

        this.destroy(true);
    };

	//通过传入粒子特效的路径，清除缓冲池
    static ClearPool(root_path: string): void
    {
        if (root_path == null)
        {
            root_path = "";
        }
        Pool.getInstance().ClearGroup("Particle3D@" + root_path, this, function(particle_3d:Particle3D)
        {
            particle_3d.Clean();
        });
    }

}
```

### 5.2 自定义对象池类

```typescript
export class Pool {
    
        private _poolDic:{[key: string]: any;} = {};
	    private InPoolSign: string = "__InPool";

        constructor() 
        {
        }

        private static _instance: Pool = new Pool();
        public static getInstance() {
            return this._instance;
        }

		//通过名字找到对应的对象池
        getPoolBySign(sign:string): any
        {
            return this._poolDic[sign] || (this._poolDic[sign] = []);
        };

		//回收
        recover(sign:string, item:any): void
        {
            item["__InPool"] = true;
        };

		//通过名字获得一个对象，如果对象池内没有对象，则创建一个
	    getItemByClass(sign:string, cls:any): any
        {
            var ret = null;
            var pool = this.getPoolBySign(sign);
            for (var i = 0, len = pool.length; i < len; i++)
            {
                var item = pool[i];
                if (item["__InPool"] && item instanceof cls)
                {
                    ret = item;
                    break;
                }
            } 
            if (!ret)
            {
                ret = new cls();
                pool.push(ret);         
            }
            ret["__InPool"] = false;
            return ret;
        };

		//通过名字，清理一组对象池
        ClearGroup(head_sign:string, caller:any, func:Function): void
        {
            for (var key in this._poolDic)
            {            
                if (key.indexOf(head_sign) == 0)
                {
                    var pool = this._poolDic[key];
                    if (func)
                    {
                        for (var i = 0, len = pool.length; i < len; i++)
                        {
                            var item = pool[i];
                            func.call(caller, item);
                        }
                    }
                    pool.length = 0;
                }
            }
        };

		//清理所有的对象池
        ClearAll(caller:any, func:Function): void
        {
            for (var key in this._poolDic)
            {            
                var pool = this._poolDic[key];
                if (func)
                {
                    for (var i = 0, len = pool.length; i < len; i++)
                    {
                        var item = pool[i];
                        func.call(caller, item);
                    }
                }
                pool.length = 0;
            }
        };
}
```

### 5.3 代码调用

```typescript
const { regClass, property } = Laya;
import { Particle3D } from "./Particle3D";

@regClass()
export class Main extends Laya.Script {

	//粒子特效的路径
    private filePath = "FireEffect";
    onStart() {
        console.log("Game start");  
        //加载粒子特效资源
        Laya.loader.load(this.filePath, Handler.create(this, () => {    
        }));        
    }

	//每次鼠标点下屏幕后，会创建一个特效
    mouseDown(e: Event): void {
        var particle = Particle3D.Create(this.filePath);
        this.owner.addChild(particle);             
    }

	//鼠标抬起后，会释放对象池
    mouseUp(e: Event): void {
        Particle3D.ClearPool(this.filePath);      
    }    
}
```



























