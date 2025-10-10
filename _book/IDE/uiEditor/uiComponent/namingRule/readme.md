# UI组件资源命名规则

> Author: Charley  

在 LayaAir 的经典UI系统 中，图像资源的命名会影响其在 IDE 中的识别方式。**如果图像文件遵循 UI 组件的资源命名规则**，导入 IDE 后会自动被识别为 **2D 精灵纹理**，并默认使用 **伽马颜色空间（Gamma）** 进行渲染。

如果未采用LayaAir引擎UI命名规则，图像资源则会被识别为默认的纹理类型，并使用 **线性颜色空间（Linear）**。线性色彩空间通常用于 3D 场景中的材质纹理，颜色表现方式与伽马空间存在差异，可能导致图像在 2D 场景中出现色彩偏差或效果不符合设计的情况。

因此，**对于用于 2D 场景的图像资源，尤其是存在3D场景与2D场景并存的项目中，我们强烈建议在导入前按照 UI 资源命名规则命名文件**，以确保其被正确识别为精灵纹理并使用适合的颜色空间，避免导入后还需手动修改纹理类型，提升工作效率并保证显示效果一致性。

## 一、资源命名规则

对于一些常用的UI组件，LayaAir引擎与IDE，提供了资源命名的规则。

当图像资源文件按照LayaAir引擎UI组件命名规则命名时，会直接被IDE识别为基础UI组件。

组件资源的命名有两类，分别是**常规资源**与**组合资源**。

### 1.1  常规资源命名规则

一个资源就对应一个UI组件的为**常规资源**，例如，`img_layabox.png`，会被识别为Image组件。

**常规资源命名规则如下：**

| 组件名     | 中文组件名   | 资源文件名前缀 | 资源文件名前缀缩写 |
| ---------- | ------------ | -------------- | ------------------ |
| Image      | 图像         | image_         | img_               |
| Button     | 按钮         | button_        | btn_               |
| ComboBox   | 下拉框       | comboBox_      | combo_             |
| TextInput  | 文本输入     | textInput_     | input_             |
| TextArea   | 文本域       | textArea_      | area_              |
| CheckBox   | 多选框       | checkBox_      | check_             |
| Label      | 显示文本     | label_         | 无缩写             |
| RadioGroup | 单选框组     | radioGroup_    | 无缩写             |
| Radio      | 单选框       | radio_         | 无缩写             |
| Tab        | 导航标签组   | tab_           | 无缩写             |
| Clip       | 位图切片     | clip_          | 无缩写             |
| FontClip   | 位图字体切片 | fontClip_      | 无缩写             |

> 资源前缀不区分大小写

### 1.2 组合资源命名规则

多个资源对应一个UI组件的**组合资源**，例如，`progress_loading.png`与`progress_loading$bar.png`组合形成一个progress组件，`progress_loading.png`为组件名是进度条的背景资源，另一个在`progress_loading`后面带了一个`$bar`的是进度条的进度资源。

总结以上，我们会发现两点规律：

- 无论是哪种资源，下划线`_`之前是组件规则名称，并且必须要放到文件名的开头。
- 组合资源，在主资源名称的后面，再通过美元符号`$`相隔，带一个辅助标识名，方便IDE与引擎识别。

**组合资源命名规则如下：**

| 组件名      | 中文组件名 | 资源文件名前缀 | 资源文件名前缀缩写 | 辅助标识名                                            |
| ----------- | ---------- | -------------- | ------------------ | ----------------------------------------------------- |
| VScrollBar  | 垂直滚动条 | vscrollbar_    | vscroll_           | 垂直划动条`$bar`、上点击按钮`$up` 、下点击按钮`$down` |
| HScrollBar  | 水平滚动条 | hscrollbar_    | hscroll_           | 水平划动条`$bar`、左点击按钮`$up` 、右点击按钮`$down` |
| ProgressBar | 进度条     | progressbar_   | progress_          | 进度条`$bar`                                          |
| VSlider     | 垂直划动条 | vslider_       | 无缩写             | 垂直划动按钮`$bar`、进度条资源`$progress`（可选）     |
| HSlider     | 水平划动条 | hslider_       | 无缩写             | 水平划动按钮`$bar`、进度条资源`$progress`（可选）     |

> 资源前缀不区分大小写

**示例说明：**

- 垂直滚动条aa，由四个资源文件构成。分别是`vscroll_aa.png、vscroll_aa$bar.png、vscroll_aa$up.png、vscroll_aa$down.png`。
- 进度条bb，由两个资源文件构成。分别是`progress_bb.png、progress_bb$bar.png`。
- 水平划动条cc，由两个或三个资源文件构成。分别是`hslider_cc.png、hslider_cc$bar.png、hslider_cc$progress.png（可选）`，若缺少了进度条资源hslider_cc$progress.png不会报错，只是不显示进度。

## 二、 容器组件的创建与解除

容器组件中，仅有继承自 UI 组（`UIGroup`）的 `RadioGroup` 和 `Tab` 组件支持通过资源名称前缀自动识别并创建。其他类型的容器组件并**不支持通过资源命名规则自动识别**，需在 IDE 中手动创建。

### 2.1 创建容器UI组件

在层级面板里选中一个或多个基础组件，右键菜单中点击 `转换为容器`（或者使用`Ctrl+B`快捷键）。如图2-1所示。然后选择要转换的容器类型即可。

![](img/2-1.png) 

（图2-1）

### 2.2 解除容器UI组件

如果不需要容器组件了，也可以选中容器，通过`Ctrl+U`解除当前选中的容器，或者点击右键菜单底层的打散容器，如图2-2所示。

![](img/2-2.png) 

（图2-2）