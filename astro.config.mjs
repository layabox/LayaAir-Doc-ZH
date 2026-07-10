// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import rehypeExternalLinks from 'rehype-external-links';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import generatedSidebar from './src/sidebar.generated.json' with { type: 'json' };
// 页内编辑器：仅 astro dev 生效，build 时集成内部直接 return，正式产物零残留
import devEditor from './dev-editor/integration.mjs';

// —— 未完成文档的目录裁剪 ——
// 两类页面不进正式版目录：
//   1. draft: true —— 空文档/占位文档且无其他文档链接，正式构建时 Starlight 直接不输出该页；
//   2. pagefind: false —— 「内容整理中」占位页（被其他文档正文链接着，必须保留页面防死链），
//      页面照常构建但不出现在目录、不进站内搜索、noindex。
// dev 模式不裁——本地预览/编辑模式照常可见可编辑；某篇写完后删掉 frontmatter 里的
// draft: true（或 pagefind/noindex 几行）并替换占位正文，页面和目录条目即自动恢复上线。
const IS_BUILD = process.argv.includes('build');
function collectHiddenLinks() {
  const hidden = new Set();
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (/\.mdx?$/i.test(e.name)) {
        const head = fs.readFileSync(p, 'utf8').slice(0, 2000);
        const fm = head.match(/^---\r?\n([\s\S]*?)\r?\n---/);
        if (!fm) continue;
        if (!/^draft:\s*true/m.test(fm[1]) && !/^pagefind:\s*false/m.test(fm[1])) continue;
        const slug = fm[1].match(/^slug:\s*"([^"]*)"/m);
        if (slug) hidden.add('/' + (slug[1] ? slug[1] + '/' : ''));
      }
    }
  };
  walk(fileURLToPath(new URL('./src/content/docs', import.meta.url)));
  return hidden;
}
function pruneSidebar(items, hidden) {
  return items
    .map((it) => {
      if (it.items) {
        const kids = pruneSidebar(it.items, hidden);
        return kids.length ? { ...it, items: kids } : null;
      }
      return it.link && hidden.has(it.link.toLowerCase()) ? null : it;
    })
    .filter(Boolean);
}
const sidebar = IS_BUILD ? pruneSidebar(generatedSidebar, collectHiddenLinks()) : generatedSidebar;

// 全站图片懒加载：给每个 <img> 加 loading="lazy" + decoding="async"。
// 正文图走 public 绝对路径，Astro 不会自动优化，所以这里手动注入 ——
// 打开页面时只下载视口内的图，滚到哪加载到哪，图多的页首屏立刻变快。零依赖递归遍历 hast。
function rehypeLazyImages() {
  return (tree) => {
    const walk = (node) => {
      if (node.tagName === 'img' && node.properties) {
        if (node.properties.loading == null) node.properties.loading = 'lazy';
        if (node.properties.decoding == null) node.properties.decoding = 'async';
      }
      if (node.children) node.children.forEach(walk);
    };
    walk(tree);
  };
}

// LayaAir 引擎文档 — Astro + Starlight
// 外壳（导航/搜索/版本/主题）全部由本框架统一提供；
// 内容只需写正文（MDX/HTML 友好），AI 可直接生成。
export default defineConfig({
  site: 'https://www.layaair.com',
  // 构建输出目录与旧版 GitBook 保持一致
  outDir: './_book',
  // 预取：鼠标移到链接上即提前加载目标页，点击瞬间显示（配合无刷新切换）
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  // 站外链接自动新标签打开 + 安全 rel
  markdown: {
    rehypePlugins: [
      [rehypeExternalLinks, { target: '_blank', rel: ['noopener', 'noreferrer'] }],
      rehypeLazyImages,
    ],
  },
  integrations: [
    devEditor(),
    starlight({
      title: 'LayaAir 引擎文档',
      // 简体中文为根语言 —— Pagefind 据此启用中文(CJK)分词搜索
      defaultLocale: 'root',
      locales: {
        root: { label: '简体中文', lang: 'zh-CN' },
      },
      // logo 配置已被下方 SiteTitle 组件覆写取代（完整品牌图 + 「文档」二字），此处仅作回退
      logo: { src: './src/assets/layabox-logo.svg', alt: 'LayaAir' },
      favicon: '/favicon-32.ico',
      customCss: ['./src/styles/custom.css'],
      components: {
        // 站点标题：LayaAir3 完整品牌 logo + 「文档」二字（与字标同大小同颜色）
        SiteTitle: './src/components/SiteTitle.astro',
        // 侧栏顶部加版本切换器(3.0–3.4)
        Sidebar: './src/components/VersionSidebar.astro',
        // 页脚注入图片点击放大灯箱
        Footer: './src/components/CustomFooter.astro',
        // Head 注入 ClientRouter（无刷新切换；过场动画已在 custom.css 中关闭）
        Head: './src/components/Head.astro',
        // 搜索：修复 ClientRouter 换页后搜索框不再挂载的问题（挂载改到自定义元素构造函数内）
        Search: './src/components/Search.astro',
        // 右上角：原生浅色/深色下拉换成「太阳/月亮」一键切换按钮（与 A 阅读设置面板状态同源）
        ThemeSelect: './src/components/EmptyThemeSelect.astro',
        // GitHub 图标：按当前页动态指向 LayaAir-Doc-ZH 仓库中的对应源文件（见 SocialIcons.astro）
        SocialIcons: './src/components/SocialIcons.astro',
      },
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/layabox/LayaAir-Doc-ZH' },
      ],
      // 侧边导航 —— 由 migrate.mjs 解析 SUMMARY.md 自动生成；正式构建时裁掉 draft 页条目
      sidebar,
    }),
  ],
});
