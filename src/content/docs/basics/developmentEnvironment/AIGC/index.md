---
title: "AI协同开发环境"
description: "在当下的软件开发领域，如果仍然固守传统的开发环境与工作模式，已经难以被视为一名具备前沿竞争力的程序员。如何掌握并善用各种 AIGC 工具，充分发挥人工智能在理解、生成与创作方面的能力，正在成为提升开发效率与创新能力的关键所在。"
slug: "basics/developmentenvironment/aigc"
---

> Author: Charley

在当下的软件开发领域，如果仍然固守传统的开发环境与工作模式，已经难以被视为一名具备前沿竞争力的程序员。如何掌握并善用各种 AIGC 工具，充分发挥人工智能在理解、生成与创作方面的能力，正在成为提升开发效率与创新能力的关键所在。

AI 协同开发的形态正在快速演进，主流类型大致可以分为四类：一是 **AI 问答**，用于知识检索与问题解答；二是 **AIGC 创作**，利用生成式模型创作文本、图像或代码内容；三是 **代码助手与智能补全**，通过上下文理解实现代码生成与优化；四是 **智能体（Agent）协作**，让 AI 具备自主执行任务与持续协同开发的能力。

## 1、AI问答

### 1.1 主流的AI问答模型推荐

从交互方式与使用场景的角度来看，AI问答系统主要可以分为三种典型的表现形式：**网页问答型**、**开发环境内置型**以及**API调用型**。这三种形态覆盖了当下AI问答的主要使用场景，体现了人工智能在不同层面的融合方式与应用深度。

其中，**开发环境内置型**将在后续章节中单独介绍；**API调用型**由于更偏向企业集成与系统开发，不太适用于个人开发者，这里暂不展开。

**网页问答型**以网页为主要交互界面，用户无需编程或配置，便可直接通过自然语言与AI模型进行对话，获取技术知识（例如新手对语言与语法的困惑）、灵感或创作辅助。

国际主流产品包括：[ChatGPT](https://chatgpt.com/)、[Gemini](https://gemini.google.com/)、[Perplexity AI](https://www.perplexity.ai/) 、[Claude.ai](https://claude.ai/)等；

国内主流产品包括：[豆包](https://www.doubao.com/chat/)、[腾讯元宝](https://yuanbao.tencent.com/chat/)、[腾讯混元](https://hunyuan.tencent.com/)、[文心一言](https://yiyan.baidu.com/)、[通义千问](https://www.tongyi.com/)、[智谱清言](https://chatglm.cn/main/)、[Kimi](https://www.kimi.com/)等。

### 1.2 推理与检索的AI模型推荐

在早期的大语言模型中，由于缺乏**联网搜索能力**，模型只能依赖训练语料生成回答。这种机制容易出现“生成幻觉”（Hallucination）问题，并且也经常是老旧的信息，在查询专业技术资料时，尤其是一些新的知识，模型可能给出看似合理但实际错误的信息。

因此，用户在使用AI问答时，往往仍需依赖传统搜索引擎，以确保答案的准确性。

随着**联网搜索与检索增强（RAG, Retrieval-Augmented Generation）**技术的成熟，越来越多的AI模型开始具备实时访问互联网信息的能力，从而在事实准确性与推理深度之间实现了更好的平衡。

总体而言，具备联网搜索能力的推理型AI问答模型，正在逐步取代传统搜索与问答的边界，为开发者与内容创作者带来更高效、更可靠的知识获取方式。

在当前主流产品中，笔者认为在“**联网检索能力**”与“**逻辑推理表现**”两方面兼顾得较好的模型主要为：**[腾讯元宝](https://yuanbao.tencent.com/)**和**[DeepSeek](https://chat.deepseek.com/)**。

## 2、**AIGC 创作**

AIGC（Artificial Intelligence Generated Content），即**人工智能生成内容**，是指利用人工智能技术生成文本、图像、音频、视频、代码等内容的生产方式。

### 2.1 常规的AIGC创作

现在主流的自然语言处理（NLP）大模型都具有文本生成的AIGC能力，例如，生成商业文案、文学作品、代码等文本内容。

随着AIGC的竞争与发展，图像生成的能力，也越来越多的成为了大模型的标配能力。例如：**ChatGPT、豆包、腾讯混元、文心一言、通义千问、智谱清言**等。

### 2.2 垂直领域的AIGC创作

除了自然语言的通用大模型之外，也有很多专门从事垂直领域的AIGC大模型。例如，文生图、文生3D模型、文生音频、文生视频、文生游戏等等、文生视频对于LayaAir开发者而言，基本用不上，这里不作介绍。重点推荐一些可用于游戏等互动产品的AIGC创作的AI模型。

#### 2.2.1 文生图、图生图

AI生成图片可以用于生成游戏背景图、贴图纹理、2D角色、UI等。有些需求，可以直接生成使用，有些则需要美术二次处理（也可以提升效率）。

除了自带生成图片的通用大模型外，[Midjourney](https://www.midjourney.com/editor/)、Stable Diffusion、[即梦AI](https://jimeng.jianying.com/ai-tool/home)、[腾讯混元](https://hunyuan.tencent.com/image/)等都是比较优质的图像生成大模型。

这些大模型，都可以通过用户输入提示（prompt）文字，生成风格化、高质量的图像。也有的大模型具备图生图的能力，通过上传参照图进行修改创作。

#### 2.2.2 文生3D模型

文生3D模型在当下的成熟度相对成生图像要差一些，我推荐几个当下主流的一些3D模型，大家可以进行体验与尝试。

分别为：[**Tripo 3D**](https://studio.tripo3d.ai/home)、[**Fast3D**](https://fast3d.io/zh)、[**Luma AI - Genie**](https://lumalabs.ai/genie?view=create) 、[**Meshy AI**](https://www.meshy.ai/)

#### 2.2.3 文生音频

文生音频比较火的是**ElevenLabs SFX **和 **MusicGen**，

**ElevenLabs SFX v2** 由AI音频研发公司ElevenLabs推出，在线网址为：[https://elevenlabs.io/](https://elevenlabs.io/)

**MusicGen**是由Meta 研发并开源的一个大模型，Github地址为：[https://github.com/facebookresearch/audiocraft](https://github.com/facebookresearch/audiocraft)

#### 2.2.4 文生游戏

文生游戏在当下的难度还比较大，通用大模型生成的JS游戏代码，仅仅是基础的DEMO玩法级，很难形成商业化。

目前只有LayaIdea可以做到生成游戏原型、简单游戏，以及试玩广告的商业化产品。

更多介绍可以查看公众号文章：[https://mp.weixin.qq.com/s/8ANLuz4vcnexhoija9eumA](https://mp.weixin.qq.com/s/8ANLuz4vcnexhoija9eumA)



## 3、代码辅助开发

AI 在代码领域的应用是提升开发效率最直接的方向之一。它不仅能够辅助程序员进行自动补全、函数生成、代码优化，还逐渐发展出具备深度理解与自主改写能力的智能化编程环境。

### 1.1 代码辅助开发插件

代码辅助插件是最早普及的 AI 编程工具形态，其中最具代表性的产品是 **GitHub Copilot**。它基于大规模代码训练模型，能够在开发者输入代码时自动给出补全、重构与注释建议，极大提高编码效率。

随后，国内也出现了多款功能类似的 AI 编程插件，例如：腾讯的CodeBuddy、百度的文心快码（Baidu Comate）等。

这些插件可以通过vscode插件的形式安装到编码环境中，可以基于上下文自动补全代码、生成函数、文档、重构建议等。是比较实用的提升效率的工具。

### 1.2 深度辅助开发的编辑器

与传统插件不同，**智能编辑器（Agentic IDE）** 是一种更高层次的 AI 协同开发形态。它不再只是“代码建议工具”，而是一个具备更全面的上下文理解与任务规划能力的**AI编程伙伴**。

其中最具代表性的产品是 **[Cursor](https://www.cursor.com/)**。

Cursor 基于开源的 VS Code 架构，集成了 AI 智能体（Agent）功能，具有深度思考的能力。能够：

- 全局理解项目结构与依赖关系；
- 根据自然语言指令新增或修改代码文件；
- 执行多步逻辑推理与代码生成；
- 辅助进行大型项目的功能迭代与Bug修复等。

这种编辑器的出现，标志着 AI 从“代码辅助”正式迈向“代码协同”。

国内与 Cursor 类似的智能体编码平台产品也在迅速发展，例如：字节旗下的[Trae](https://www.trae.cn/)、阿里巴巴旗下的[Qoder](https://qoder.com/)等。

推荐大家下载使用。



## 4、MCP

MCP（Model Context Protocol，模型上下文协议）是由Anthropic开发的开放标准协议，旨在标准化大型语言模型（LLM）与外部数据源、工具及应用之间的交互方式，被视为“AI界的USB-C接口”。

其核心优势在于通过统一协议打破AI与外部资源的“碎片化”壁垒，实现“一次开发、多端适配”，大幅降低AI应用与数据源/工具的集成复杂度；支持实时数据交互与多工具协同，提升AI在现实场景中的响应准确性与灵活性；

目前，MCP已成为AI领域的主流协议，被Google、Notion、Figma、OpenAI等科技巨头支持，应用于跨库分析、3D设计、智能日程生成等多个场景。

LayaAir3-IDE中，已经支持基于MCP协议实现AI智能体的协作开发。

LayaAir引擎的MCP插件地址与使用说明：https://store.layaair.com/info.php?id=10394

LayaAir-MCP插件使用文档：[LayaAir MCP 开发指南](/basics/developmentenvironment/ide-mcp/)。