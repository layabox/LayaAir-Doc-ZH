# AI 出文档规范（路线 B：AI 直出 mdx）

> 适用对象：所有**不来自 GitBook 源**的新页面（演示页、专题页、首页区块等）。
> 来自 `LayaAir-Doc-ZH` 源的存量页走 `migrate.mjs` 重建，**不要手写**，会被覆盖。
> 本规范同时是「给 AI 的提示词」——把末尾「提示词模板」整段喂给 AI 即可产出合规页面。

---

## 1. 放哪 / 怎么命名

- 文件目录：`src/content/docs/`，扩展名一律 **`.mdx`**（要嵌组件/动效；纯文字也用 mdx，统一）。
- 建议放二级目录，便于管理与固定 import 深度，例如：
  - 演示/能力页 → `src/content/docs/showcase/xxx.mdx`
  - 专题页 → `src/content/docs/topics/xxx.mdx`
- 文件名用**英文小写 + 连字符**（与 slug 同形），如 `unity-export.mdx`、`live-demo.mdx`。

---

## 2. Frontmatter 规范（最关键）

```mdx
---
title: "页面标题（可中文）"
description: "一句话摘要，60–155 字，进 <meta description>，利于搜索/SEO"
slug: "showcase/unity-export"
---
```

- **`title`**：必填，可中文，**不要带 Markdown 符号**（`# * _ ``）。
- **`description`**：必填，1 句话，60–155 字，散文，不要列表/链接。
- **`slug`**：**必填且必须显式写**。规则：
  - 只能含 **小写字母 a-z、数字 0-9、连字符 `-`、斜杠 `/`**。
  - 不要中文、空格、大写、点号——否则 Windows 上看着正常，**Linux 上线会断链**（这是本项目踩过的头号坑）。
  - slug 与文件路径保持同形（文件 `showcase/unity-export.mdx` → slug `showcase/unity-export`）。
- 占位/草稿页若不想进搜索，加 `pagefind: false`。

---

## 3. 正文写作规范

- **标题层级**：正文里**不要再写 `# H1`**（H1 由 `title` 自动生成）。正文从 `## H2` 开始，逐级 `###`，不跳级。
- **提示框（aside）**：用 Starlight 语法，类型只有这五种：
  ```mdx
  :::note[可选标题]
  普通说明
  :::
  :::tip
  小技巧
  :::
  :::caution
  注意事项
  :::
  :::danger
  高风险/破坏性操作
  :::
  ```
- **代码块**：三反引号 + 语言（小写）。TypeScript 用 `typescript`，JS 用 `javascript`。
- **图片**：放 `public/` 下，正文用**站内绝对路径**引用，懒加载会自动加（标准 `![]()` 由构建插件处理）：
  ```mdx
  ![描述](/images/xxx/demo.png)
  ```
  不要用相对路径、不要用外链热链。
- **表格**：能用组件就用组件（见下）；普通表格用标准 Markdown 即可，全站已统一撑满+居中样式。
- **外链**：直接写 `[文字](https://...)`，会自动加新标签 + ↗ 图标。

---

## 4. 可用组件清单（mdx 里 import 后使用）

> import 路径按页面层级算：二级目录页（`docs/xxx/page.mdx`）用 `../../../components/`；
> 根级页（`docs/page.mdx`）用 `../../components/`。**推荐统一放二级目录**，固定用三层。

### 4.1 FeatureTable —— 能力对照徽章表

```mdx
import FeatureTable from '../../../components/FeatureTable.astro';

<FeatureTable rows={[
  { feat: '功能名', target: '对应实现/目标', level: 'full', note: '说明，可含 <b>html</b>' },
]} />
```
- `rows`（必填）：每项字段
  - `feat` string —— 功能名
  - `target` string —— 目标/对应实现（渲染为 `<code>`）
  - `level` —— 支持度，**只能取**：`'full'`(完整) / `'part'`(部分) / `'conf'`(看配置) / `'exp'`(实验性) / `'no'`(不支持)
  - `note` string —— 说明，**支持内联 HTML**（如 `<b>…</b>`）
- `cols`（可选）：四列表头，默认 `['功能','LayaAir 目标','支持度','说明']`。
- 组件自带图例，不用自己写图例。

### 4.2 LiveDemo —— 可交互 Canvas 演示

```mdx
import LiveDemo from '../../../components/LiveDemo.astro';

<LiveDemo />
```
- **无 props**，是一个固定的「旋转线框立方体 + 调速/调色/暂停」交互示范。
- 用途：证明文档页可嵌真实交互。要做**别的**交互演示时，照它的写法新建组件（注意 `astro:page-load` 重初始化、`astro:before-swap` 取消 rAF 的生命周期处理，别造内存泄漏）。

### 4.3 VersionSidebar —— 版本切换器
- 这是**侧栏覆写组件**，已全局接入，**不在正文里 import**。仅作说明：版本下拉（3.0–3.4）在侧栏顶部。

---

## 5. 让页面进侧栏

页面建好后只能直达 URL，侧栏入口要手动挂。当前做法：在 `migrate.mjs` 末尾这段追加条目（showcase 两页就是这么挂的）：

```js
finalSidebar.push({
  label: '框架能力演示', collapsed: true, items: [
    { label: 'Unity 导出能力一览', link: '/showcase/unity-export/' },
    { label: '可交互演示（动效）', link: '/showcase/live-demo/' },
    // ← 新页加在这里：{ label: '中文标签', link: '/你的slug/' }
  ],
});
```
> 注意 `link` 是带前后斜杠的 URL（`/slug/`），不是文件路径。改完需重跑 `node migrate.mjs` 重新生成 `sidebar.generated.json`。

---

## 6. 出稿后必做（验证清单）

```bash
npm run build          # astro build + add-lazy 补懒加载，必须无报错
node audit-links.mjs   # 断链审计，必须输出 0
npm run preview        # → http://localhost:4321/ ，开给用户看实物
```
- 改了 CSS/样式时，提醒用户 **Ctrl+Shift+R 强刷**（浏览器缓存旧 CSS 是常见误报源）。
- 交付方式：给可点的本地地址 + 必要时截图，**别只报告"改完了"**。

---

## 7. 提示词模板（喂给 AI 产页时整段复制）

```
你在为 LayaAir 文档站（Astro + Starlight）用「路线 B：AI 直出 mdx」生成一篇新文档。
严格遵守以下规范：

【输出】只输出一个完整 .mdx 文件内容，放置路径：src/content/docs/<二级目录>/<英文slug>.mdx

【Frontmatter】必须含 title（可中文、无 md 符号）、description（60–155 字散文摘要）、
slug（只用 a-z 0-9 - / ，与文件路径同形，禁止中文/空格/大写/点号，否则 Linux 断链）。

【正文】
- 不写 H1（title 自动生成），正文从 ## 开始，逐级不跳级。
- 提示框只用 :::note / :::tip / :::caution / :::danger 。
- 代码块标语言（typescript / javascript，小写）。
- 图片用站内绝对路径 /路径/图.png（文件须在 public/ 下）。
- 外链直接 [文字](https://...)。

【组件】（二级目录页用 ../../../components/ 路径 import）
- 能力对照表用 FeatureTable，传 rows：{ feat, target, level, note }，
  level 只能取 full|part|conf|exp|no，note 可含内联 HTML。表头默认即可。
- 需要交互演示示范用 <LiveDemo />（无 props）。

【主题】配色已是 logo 青绿，别引入蓝色；正文段距用 Starlight 默认（紧凑）。

【任务】文档主题：<在此填写主题与要点>
```

---

_本规范基于当前代码核对编写（migrate.mjs / 组件接口 / content.config.ts）。组件接口若变动，请同步更新本文件。_
