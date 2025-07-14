# 图片（GImage）

Author: 谷主

<img src="img/1-1.png" alt="1-1" style="zoom:60%;" />
- **Src** 图片资源。
- **Is Demo Src**设置的内容只作为Demo，也就是只在IDE编辑时显示，发布时将自动清空。
- **Auto Size** 是否自动大小。在改变Src时，如果Auto Size是true，则节点的大小会自动改变为图片的大小。
- **Color** 图片的颜色。
- **Mesh** 为渲染器提供自定义的网格。目前内置支持的有：
  - **RoundedRectMesh** 实现将图片遮罩为圆角矩形。
  - **ProgressMesh** 实现指定比例的填充效果，并且可选水平、垂直、圆形等填充方向。
  - **CircleMesh** 实现将图片遮罩为圆形。
  - **FlipMesh** 实现将图片水平、垂直翻转。
  - **RegularPolygonMesh** 实现将图片遮罩为正多边形的效果。文档编写中