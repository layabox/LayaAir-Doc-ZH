---
title: "VFX Graph 教学文档集"
description: "面向 LayaAir 3.x VFX Graph（GPU 粒子特效系统）的官方教学文档集，涵盖概念入门、IDE 操作流程、Context 与 Block 与 Operator 属性详解、代码驱动与示例验证，从认知到 API 一站式查阅。"
slug: "vfx-graph"
---

> 面向 LayaAir 3.x **VFX Graph（GPU 粒子特效系统）** 的官方教学文档，依据《引擎新特性功能文档与 Demo 规范》2.1.2 的四个核心板块编写。

本文档集是 VFX Graph 功能的完整教学资料：从「这是什么、能解决什么问题」，到「在 IDE 里怎么一步步用起来」，到「每一个参数到底是干嘛的」，再到「代码里怎么驱动」，最后给出「现有示例 → 预期效果」的验证清单。

> ⚙️ **运行前提**：VFX Graph 基于 Compute Shader，**仅在 WebGPU 渲染后端下运行**，不支持 WebGL / WebGL2。详见 [概念篇](/vfx-graph/concepts/)。

---

## 阅读顺序

| 文档 | 规范板块 | 内容 | 适合谁 |
|---|---|---|---|
| [概念篇](/vfx-graph/concepts/) | ① 概念篇 | VFX Graph 是什么、解决什么痛点、四层节点体系、典型应用场景、平台约束 | 第一次接触，先建立认知 |
| [IDE 操作流程](/vfx-graph/ide-workflow/) | ② IDE 操作流程 | 创建 `.vfx`、打开编辑器、面板分区、加节点连线、挂组件运行（最小示例从零跑通） | 想立刻上手做一个效果 |
| [属性详解·Context](/vfx-graph/context/) | ③ 属性详解 | Spawn / Initialize / Update / 各 Output 上下文的每个参数 | 配置上下文时查参数 |
| [属性详解·Block](/vfx-graph/block/) | ③ 属性详解 | 按类别详解所有 Block（行为单元）的每个参数 | 配置粒子行为时查参数 |
| [属性详解·图级与组件](/vfx-graph/graph-and-components/) | ③ 属性详解 | 图级属性、Blackboard 暴露属性、VisualEffect / VFXRenderer 组件、Properties 面板 | 配置整图与场景组件时查 |
| [代码篇](/vfx-graph/code/) | ④ 代码篇 | 用代码控制 VFX：播放控制、属性读写、事件、OutputEvent 回调等 | 程序运行时驱动 VFX |
| [属性详解·Operator](/vfx-graph/operator/) | ③ 属性详解 | 运算符（表达式节点）：VFX 特有逐参数 + 通用速查表 | 搭表达式网络时查 |
| [示例验证索引](/vfx-graph/examples/) | 验证 | 功能 → 示例 `.vfx` → 所在场景 → 预期效果，逐项验收 | 社区工程师照表验证 |

> 06、07 属于第二批交付。00~05 为第一批核心文档。

---

## 文档与规范四板块的对应

《规范》要求每个功能的教学文档含 4 个核心板块。VFX Graph 是一个完整系统，板块映射如下：

- **① 概念篇** → `00-概念篇.md`
- **② IDE 操作流程** → `01-IDE操作流程.md`
- **③ 属性详解篇**（IDE 面板每个参数）→ `02` / `03` / `04` / `06`（按节点种类拆分，避免单文件过长）
- **④ 代码篇**（API 动态创建与调用）→ `05-代码篇.md`

---

## 相关资料

- 旧版精简使用指南：`../VFX-Guide.md`（与插件 `VfxEditor/README.md` 同步，本文档集是其扩展正式版）
- 示例工程：本工程 `assets/resources/`（90+ 学习模板 + 40+ 功能示例）
- 运行时引擎源码：`LayaAir/src/layaAir/laya/vfx/`
- 编辑器插件源码：`com.layabox.vfx`（`VfxEditor/`）

---

*文档集版本：v1.0 起草 · 简体中文*
