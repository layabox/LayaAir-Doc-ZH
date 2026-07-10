---
title: "WebGPU启用配置"
description: "WebGPU 是新一代 Web 图形与计算标准，旨在为 Web 应用提供 更高性能、更低开销 的 GPU 访问能力。相较于传统的 WebGL，WebGPU 在接口设计上更贴近现代原生图形 API（如 Vulkan、Metal、DirectX 12），在渲染效率、资源管理以及并行计算能力方面具备明显优势。"
slug: "basics/ide/projectsettings/webgpu"
---

> Author: Charley

## 1、启用说明

`WebGPU `是新一代 Web 图形与计算标准，旨在为 Web 应用提供 **更高性能、更低开销** 的 `GPU` 访问能力。相较于传统的 `WebGL`，`WebGPU` 在接口设计上更贴近现代原生图形 `API`（如 `Vulkan`、Metal、`DirectX` 12），在渲染效率、资源管理以及并行计算能力方面具备明显优势。

在支持 `WebGPU ` 的浏览器环境中，启用 `WebGPU` 后，可显著提升 Web 应用在 **3D 渲染、复杂后处理以及 GPU 计算任务** 下的运行性能。如图 1-1 所示，浏览器在启用 `WebGPU`  后，可正常使用相关渲染能力。

![](/basics/IDE/projectSettings/webGPU/img/1-1.png) 

（图1-1）



## 2、调试 WebGPU 渲染效果

需要注意的是，**IDE 编辑器内置的预览环境目前不支持 `WebGPU` **。如需验证 `WebGPU` 渲染效果，必须将项目发布后，使用支持 `WebGPU` 的外部浏览器进行预览和测试。

以 Chrome 浏览器为例，开发者可通过实验性功能开关启用 `WebGPU` 支持。

1. 在浏览器地址栏中输入 `chrome://flags` 并访问；
2. 在页面顶部的搜索框中输入 `WebGPU`；
3. 将相关选项设置为 **Enabled**；
4. 按提示重启浏览器以使配置生效。

具体操作界面如图 2-1 所示。

![](/basics/IDE/projectSettings/webGPU/img/2-1.png)

（图2-1）

还需要注意的是，**`WebGPU` 只能在安全上下文（Secure Context）中运行**。这意味着在进行 `WebGPU` 调试和运行时，页面必须通过 `HTTPS` 访问。

在实际开发过程中，开发者往往会使用本地 `HTTPS` 服务进行调试。但本地 `HTTPS` 服务通常无法使用受信任的权威证书，因此在浏览器中进行本地调试访问时，可能会出现“**您的连接不是私密连接**”的安全警告页面，如图2-2所示。

![](/basics/IDE/projectSettings/webGPU/img/2-2.png)

（图2-2） 

当遇到该提示时，可点击页面中的 **“高级”** 选项，展开详细信息后，选择 **继续访问** 对应链接，如图 2-3 所示，即可进入页面进行 `WebGPU` 效果调试。

![](/basics/IDE/projectSettings/webGPU/img/2-3.png) 

（图2-3） 

需要强调的是，该警告仅与证书的信任链有关，并不影响 `WebGPU` 功能本身的正常使用。在本地开发和调试阶段，这是一个常见且可接受的操作行为。

在正式部署环境中，建议配置受信任的 `HTTPS` 证书，以避免安全警告并提升用户体验。