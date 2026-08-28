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
// 相对图片路径（本地 Markdown 预览用）→ 站内绝对路径（public）
import { remarkDocImages } from './tools/remark-doc-images.mjs';

const SITE_BASE = '/3.x/doc';

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
        if (slug) hidden.add(('/' + (slug[1] ? slug[1] + '/' : '')).toLowerCase());
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

// 最终 HTML AST 阶段统一补部署子目录，覆盖 Markdown 链接和 Starlight MDX 组件链接。
function rehypeBaseUrls() {
  const keys = ['href', 'src', 'poster', 'dataSrc'];
  return (tree) => {
    const walk = (node) => {
      if (node.properties) {
        for (const key of keys) {
          const value = node.properties[key];
          if (typeof value === 'string' && value.startsWith('/') && !value.startsWith('//')) {
            if (value !== SITE_BASE && !value.startsWith(SITE_BASE + '/')) {
              node.properties[key] = SITE_BASE + value;
            }
          }
        }
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
  // 正式站部署在域名的子目录中。Astro 会据此为构建资源和站内路由添加前缀。
  // 构建末尾 relativize-build-urls.mjs 再改成相对路径 + 运行时 <base>，
  // 同一套 _book 可挂到 /3.x/doc/、/3.4/doc/，或本地 anywhere。
  base: SITE_BASE,
  // 构建输出目录与旧版 GitBook 保持一致
  outDir: './_book',
  vite: {
    server: {
      // _book 是构建产物，dev 监视它会锁住目录，Windows 下次 build 重命名/删除就会 EPERM
      watch: { ignored: ['**/_book/**'] },
    },
  },
  // 预取：鼠标移到链接上即提前加载目标页，点击瞬间显示（配合无刷新切换）
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  // 站外链接自动新标签打开 + 安全 rel；图片相对路径在 remark 阶段转绝对（见 remark-doc-images）
  markdown: {
    remarkPlugins: [[remarkDocImages, { base: SITE_BASE }]],
    rehypePlugins: [
      rehypeBaseUrls,
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
      // Starlight 会自动为 favicon 添加 Astro 的 base。
      favicon: '/favicon-32.ico',
      customCss: ['./src/styles/custom.css'],
      // 页脚显示本文最近更新时间（优先 frontmatter.lastUpdated，否则取该文件 Git 最近提交时间）
      lastUpdated: true,
      components: {
        // 更新时间展示：中文文案 + 本地时区日期
        LastUpdated: './src/components/LastUpdated.astro',
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
      // 侧边导航 —— 数据源是 src/sidebar.generated.json；dev 模式下可在页内「编辑目录」面板中
      // 直接调整（见 dev-editor/README.md），保存后自动重启生效；正式构建时裁掉 draft 页条目
      sidebar,
    }),
  ],
});
