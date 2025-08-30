# Static Batch Volume组件

在Object的inspect面板，增加组件，选择Rendering选项，找到Static Batch Volume组件

 ![image-20221226103902624](img/image-20221226103902624.png)

图1

在Scene视窗中拖动小白点选择合适的Volume大小

 ![image-20221226104054399](img/image-20221226104054399.png)

图2

Static Batch Volume组件的使用: 

在Scene中上面的Volume框选到合适的大小后，在组件的详情面板中，勾选Static Instance Batch，再点击reBatch，Volume中所框选的物件就会执行Batch操作，优化Draw Call，提升运行效率，勾选CheckLOD选项，启用LOD Cull Rate Array接管Volume中的物体LOD组，此时Volume中的所有物体的LOD判断不再是基于单个渲染对象的，而是基于Volume的LOD判断，系统会计算Volume与视野中计算出的Rate来选择不同的LOD层级。

在Game中Rebatch会自动调用, 位于Volume中的所有物体会自动判断并实行Static Batch Instance操作。

 ![image-20221226104233853](img/image-20221226104233853.png)

图3

 ![image-20230117103612204](img/image-20230117103612204.png)

图4

