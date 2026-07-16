// 页内编辑器 · 浏览器端（仅本地预览模式注入，见 integration.mjs）
// 右下角「编辑本页」按钮 → 右侧滑出 Markdown 编辑面板（页面整体让位，不遮正文）。
// Ctrl+S / 保存按钮写回源文件，Astro 热更新自动刷新正文；粘贴/拖拽图片自动上传并插入引用。
// 样式全部取 Starlight 的 CSS 变量，自动跟随站点明暗主题。
(() => {
  if (window.__devEditorLoaded) return;
  window.__devEditorLoaded = true;

  const API = '/__dev-editor';
  const ROOT_ID = 'dev-editor-root';
  const stateKey = () => 'devEditor:' + location.pathname;

  const getState = () => {
    try { return JSON.parse(sessionStorage.getItem(stateKey())) || {}; } catch { return {}; }
  };
  const patchState = (patch) => {
    sessionStorage.setItem(stateKey(), JSON.stringify(Object.assign(getState(), patch)));
  };

  // 目录编辑面板的状态(全站共用一份,不分页面)
  const SB_KEY = 'devEditorSb';
  const sbGet = () => { try { return JSON.parse(sessionStorage.getItem(SB_KEY)) || {}; } catch { return {}; } };
  const sbPatch = (patch) => sessionStorage.setItem(SB_KEY, JSON.stringify(Object.assign(sbGet(), patch)));

  let initSeq = 0;
  async function init() {
    const seq = ++initSeq; // 初始加载时 DOMContentLoaded 与 astro:page-load 都会触发，只让最后一次生效
    document.getElementById(ROOT_ID)?.remove();
    document.documentElement.removeAttribute('data-de-open');
    let data = null; // 非文档页(搜索页等) data 为 null,只显示「编辑目录」按钮
    try {
      const r = await fetch(API + '/load?pathname=' + encodeURIComponent(location.pathname));
      if (r.ok) data = await r.json();
    } catch { return; }
    if (seq !== initSeq) return;
    document.getElementById(ROOT_ID)?.remove();
    buildUI(data);
    if (data && getState().open) openPanel();
    else if (sbGet().open) openSb();
  }

  let ui = null; // { root, panel, ta, status, file, disk }

  function buildUI(data) {
    const root = document.createElement('div');
    root.id = ROOT_ID;
    root.innerHTML = `
      <style>
        /* 面板打开时页面整体右让位，正文不被遮挡；同时隐藏右侧目录栏给正文腾宽度 */
        :root[data-de-open] { margin-right: var(--de-w, min(620px, 45vw)); }
        :root[data-de-open] .right-sidebar-container { display: none; }
        /* Starlight 给 .main-pane 留了右目录的 300px（width: calc(100% - sidebar)），编辑模式下占满 */
        :root[data-de-open] .main-pane { width: 100% !important; }
        #${ROOT_ID} .de-btns { position: fixed; right: 1rem; bottom: 1rem; z-index: 99998;
          display: flex; gap: 0.5rem; }
        #${ROOT_ID} .de-btn {
          padding: 0.5rem 1rem; border: 1px solid var(--sl-color-hairline, #888);
          border-radius: 0.5rem; cursor: pointer; font-family: inherit;
          background: var(--sl-color-bg-nav, var(--sl-color-bg));
          color: var(--sl-color-text); font-size: var(--sl-text-sm, 0.875rem);
          box-shadow: var(--sl-shadow-md, 0 2px 8px rgba(0,0,0,.15)); }
        #${ROOT_ID} .de-btn:hover { color: var(--sl-color-text-accent); border-color: var(--sl-color-text-accent); }
        :root[data-de-open] #${ROOT_ID} .de-btns { display: none; }
        #${ROOT_ID} .de-panel { position: fixed; top: 0; right: 0; height: 100vh; z-index: 99999;
          width: var(--de-w, min(620px, 45vw)); display: none; flex-direction: column;
          background: var(--sl-color-bg-nav, var(--sl-color-bg)); color: var(--sl-color-text);
          border-left: 1px solid var(--sl-color-hairline, #888); font-size: var(--sl-text-sm, 0.875rem); }
        #${ROOT_ID} .de-panel.open { display: flex; }
        #${ROOT_ID} .de-head { display: flex; align-items: center; gap: 0.5rem;
          padding: 0.5rem 0.75rem; border-bottom: 1px solid var(--sl-color-hairline, #888); }
        #${ROOT_ID} .de-file { flex: 1; overflow: hidden; text-overflow: ellipsis;
          white-space: nowrap; color: var(--sl-color-gray-3, #888); direction: rtl; text-align: left; }
        #${ROOT_ID} .de-head button { padding: 0.25rem 0.75rem; font-family: inherit; font-size: inherit;
          border: 1px solid var(--sl-color-hairline, #888); border-radius: 0.5rem;
          background: transparent; color: var(--sl-color-text); cursor: pointer; }
        #${ROOT_ID} .de-head button:hover { color: var(--sl-color-text-accent); border-color: var(--sl-color-text-accent); }
        #${ROOT_ID} .de-head button.de-save { background: var(--sl-color-text-accent);
          border-color: var(--sl-color-text-accent); color: var(--sl-color-black, #fff); }
        #${ROOT_ID} .de-head button.de-save:hover { opacity: 0.85; color: var(--sl-color-black, #fff); }
        #${ROOT_ID} textarea { flex: 1; width: 100%; resize: none; border: none; outline: none;
          background: var(--sl-color-bg); color: var(--sl-color-text);
          padding: 0.75rem 0.875rem; box-sizing: border-box;
          font: 13px/1.7 Consolas, "Courier New", monospace; tab-size: 2; overflow-wrap: break-word; }
        #${ROOT_ID} .de-status { padding: 0.3rem 0.75rem; border-top: 1px solid var(--sl-color-hairline, #888);
          color: var(--sl-color-gray-3, #888); min-height: 1.4em; }
        #${ROOT_ID} .de-grip { position: absolute; left: -3px; top: 0; width: 6px; height: 100%;
          cursor: ew-resize; }
        /* 编辑器选中文字在预览中的定位高亮：高饱和黄，明暗主题都足够醒目 */
        ::highlight(de-locate) { background-color: #ffd83d; color: #1a1a1a; }
        :root[data-theme='dark'] ::highlight(de-locate) { background-color: #f5c518; color: #111; }
        /* 定位到图片时的高亮框 */
        .sl-markdown-content img.de-img-flash { outline: 3px solid #f5c518; outline-offset: 3px; }
      </style>
      <div class="de-btns">
        ${data ? '<button class="de-btn de-btn-page" type="button">编辑本页</button>' : ''}
        <button class="de-btn de-btn-sb" type="button">编辑目录</button>
      </div>
      ${data ? `<div class="de-panel de-page-panel">
        <div class="de-grip"></div>
        <div class="de-head">
          <span class="de-file" title="${data.file}">${data.file}</span>
          <button class="de-save" type="button">保存 (Ctrl+S)</button>
          <button class="de-undo" type="button" title="撤销上一步 (Ctrl+Z)">撤回</button>
          <button class="de-close" type="button">关闭</button>
        </div>
        <textarea spellcheck="false"></textarea>
        <div class="de-status">输入后正文实时预览；Ctrl+S 保存落盘；粘贴或拖入图片自动上传</div>
      </div>` : ''}
      <div class="de-panel de-sb-panel">
        <div class="de-grip"></div>
        <div class="de-head">
          <span class="de-file" title="src/sidebar.generated.json">目录（侧边导航）</span>
          <button class="de-save de-sb-save" type="button">保存 (Ctrl+S)</button>
          <button class="de-sb-close" type="button">关闭</button>
        </div>
        <textarea class="de-sb-ta" spellcheck="false"></textarea>
        <div class="de-status de-sb-status">- [名称](/链接/) 是条目，无链接的行是分组；Tab 缩进层级，Alt+↑/↓ 移动行</div>
      </div>`;
    document.body.appendChild(root);

    buildSb(root);
    if (!data) { ui = null; return; }

    ui = {
      root,
      panel: root.querySelector('.de-page-panel'),
      ta: root.querySelector('.de-page-panel textarea'),
      status: root.querySelector('.de-page-panel .de-status'),
      file: data.file,
      disk: data.content,
      replaced: new Set(), // 本次会话里被「换图」覆盖、尚未保存提交的图片名
      replaceStack: [],    // 换图动作栈 {name,url,time}——撤回时若最近一步是换图,直接还原原图
      lastInputTime: 0,    // 最近一次文字输入时间,用于判断"最近一步"是打字还是换图
    };
    root.querySelector('.de-btn-page').onclick = openPanel;
    root.querySelector('.de-close').onclick = closePanel;
    root.querySelector('.de-page-panel .de-save').onclick = save;
    // 撤回：最近一步是换图 → 还原原图；否则走原生撤销栈（打字、插入图片引用一步步退）
    root.querySelector('.de-undo').onclick = undoOnce;

    // 输入时暂存草稿（防刷新丢字）+ 实时预览（渲染不落盘，正文原地替换，无整页刷新）
    let t, pt;
    ui.ta.addEventListener('input', () => {
      ui.lastInputTime = performance.now();
      clearTimeout(t);
      t = setTimeout(() => patchState({ draft: ui.ta.value }), 300);
      clearTimeout(pt);
      pt = setTimeout(livePreview, 500);
    });
    ui.ta.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); save(); }
      // Ctrl+Z：最近一步是换图时接管,还原原图;否则放行给原生文字撤销
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'z') {
        const top = ui.replaceStack[ui.replaceStack.length - 1];
        if (top && top.time >= ui.lastInputTime) { e.preventDefault(); undoOnce(); }
      }
    });

    // 粘贴 / 拖入图片 → 上传到本页 public 图片目录，光标处插入引用
    ui.ta.addEventListener('paste', (e) => {
      const files = [...(e.clipboardData?.items || [])]
        .filter((i) => i.type.startsWith('image/'))
        .map((i) => i.getAsFile()).filter(Boolean);
      if (files.length) { e.preventDefault(); uploadImages(files); }
    });
    // 双击/划选文字 → 预览定位并高亮
    ui.ta.addEventListener('dblclick', tryLocate);
    ui.ta.addEventListener('mouseup', () => setTimeout(tryLocate, 0));

    ui.ta.addEventListener('dragover', (e) => e.preventDefault());
    ui.ta.addEventListener('drop', (e) => {
      const files = [...(e.dataTransfer?.files || [])].filter((f) => f.type.startsWith('image/'));
      if (files.length) { e.preventDefault(); uploadImages(files); }
    });

    bindGrip(root.querySelector('.de-page-panel .de-grip'));
  }

  // 拖动面板左缘调宽度（页面让位宽度同步变化）；两个面板共用同一宽度
  const setW = (w) => document.documentElement.style.setProperty('--de-w', w + 'px');
  function bindGrip(grip) {
    grip.addEventListener('mousedown', (e) => {
      e.preventDefault();
      const move = (ev) => {
        const w = Math.max(320, window.innerWidth - ev.clientX);
        setW(w);
        localStorage.setItem('devEditor:w', w);
      };
      const up = () => { removeEventListener('mousemove', move); removeEventListener('mouseup', up); };
      addEventListener('mousemove', move);
      addEventListener('mouseup', up);
    });
    const w = localStorage.getItem('devEditor:w');
    if (w) setW(w);
  }

  // ---------- 目录（侧边栏）编辑面板 ----------
  // 文本树格式:- [名称](/链接/) 是条目,无链接的行是分组,缩进 2 空格为一层。
  // 保存写回 src/sidebar.generated.json → dev server 因配置监视自动重启 → 页面刷新后新目录生效。
  let sb = null; // { panel, ta, status, loadedText }

  function buildSb(root) {
    sb = {
      panel: root.querySelector('.de-sb-panel'),
      ta: root.querySelector('.de-sb-ta'),
      status: root.querySelector('.de-sb-status'),
      loadedText: '',
    };
    root.querySelector('.de-btn-sb').onclick = openSb;
    root.querySelector('.de-sb-close').onclick = closeSb;
    root.querySelector('.de-sb-save').onclick = sbSave;
    bindGrip(root.querySelector('.de-sb-panel .de-grip'));

    let t;
    sb.ta.addEventListener('input', () => {
      clearTimeout(t);
      t = setTimeout(() => sbPatch({ draft: sb.ta.value }), 300);
    });
    sb.ta.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); sbSave(); return; }
      if (e.key === 'Tab') { e.preventDefault(); indentLines(sb.ta, e.shiftKey); return; }
      if (e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        e.preventDefault();
        moveLines(sb.ta, e.key === 'ArrowUp' ? -1 : 1);
      }
    });
  }

  async function openSb() {
    if (!sb) return;
    try {
      const r = await fetch(API + '/sidebar');
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || r.status);
      sb.loadedText = j.text;
    } catch (e) { alert('目录加载失败：' + e.message); return; }
    const st = sbGet();
    if (st.draft != null && st.draft !== sb.loadedText) {
      sb.ta.value = st.draft;
      sbStatus('已恢复未保存的目录草稿');
    } else {
      sb.ta.value = sb.loadedText;
      // 上次保存留下的提示（404 链接警告等）刷新后补显示一次
      if (st.notice) { sbStatus(st.notice); sbPatch({ notice: null }); }
    }
    sb.panel.classList.add('open');
    document.documentElement.setAttribute('data-de-open', '');
    sbPatch({ open: true });
    sb.ta.focus();
    locateCurrentPage();
  }

  function closeSb() {
    if (!sb) return;
    if (sb.ta.value !== sb.loadedText && !confirm('目录有未保存的修改，确定不保存关闭？')) return;
    sb.panel.classList.remove('open');
    document.documentElement.removeAttribute('data-de-open');
    sbPatch({ open: false, draft: null });
  }

  async function sbSave() {
    if (!sb) return;
    sbStatus('保存中…');
    try {
      const r = await fetch(API + '/sidebar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: sb.ta.value }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || r.status);
      sb.loadedText = sb.ta.value;
      const notes = [];
      if (j.created?.length) notes.push(`已自动新建 ${j.created.length} 个骨架文档：${j.created.join('、')}（点进页面用「编辑本页」写正文）`);
      if (j.warnings?.length) notes.push('⚠ ' + j.warnings.join('；'));
      const warn = notes.join(' ');
      // 保存会触发 dev server 重启并整页刷新;提示存起来,刷新后重开面板时补显示
      sbPatch({ open: true, draft: null, notice: warn || null });
      sbStatus(`已保存（${j.count} 个条目），预览服务重启中，页面会自动刷新，请勿手动刷新… ${warn}`);
      // 保存触发 dev server 重启,期间端口不在线,手动刷新会「拒绝访问」。
      // 这里主动探测:先等服务下线、再等恢复,恢复后立刻刷新;15 秒兜底强刷。
      (async () => {
        const ping = async () => {
          try { return (await fetch(API + '/sidebar', { cache: 'no-store' })).ok; } catch { return false; }
        };
        const t0 = Date.now();
        let wentDown = false;
        while (Date.now() - t0 < 15000) {
          await new Promise((r) => setTimeout(r, 600));
          const up = await ping();
          if (!up) wentDown = true;
          else if (wentDown) break; // 经历过下线又恢复 = 重启完成
        }
        location.reload();
      })();
    } catch (e) {
      sbPatch({ draft: sb.ta.value });
      sbStatus('保存失败：' + e.message);
    }
  }

  function sbStatus(msg) { if (sb) sb.status.textContent = msg; }

  // 打开面板时自动定位到当前页对应的目录行
  function locateCurrentPage() {
    let pn;
    try { pn = decodeURIComponent(location.pathname).toLowerCase(); } catch { return; }
    if (!pn.endsWith('/')) pn += '/';
    const lines = sb.ta.value.split('\n');
    let pos = 0;
    for (const l of lines) {
      const m = l.match(/\]\(([^)]+)\)\s*$/);
      if (m && m[1].toLowerCase() === pn) {
        sb.ta.setSelectionRange(pos + l.length - l.trimStart().length, pos + l.length);
        const lineNo = sb.ta.value.slice(0, pos).split('\n').length - 1;
        const lh = parseFloat(getComputedStyle(sb.ta).lineHeight) || 22;
        sb.ta.scrollTop = Math.max(0, lineNo * lh - sb.ta.clientHeight / 3);
        return;
      }
      pos += l.length + 1;
    }
  }

  // Tab / Shift+Tab:选中行整体缩进/反缩进(2 空格一层);经 execCommand 走原生撤销栈
  function indentLines(ta, outdent) {
    const v = ta.value;
    const s = ta.selectionStart, e = ta.selectionEnd;
    const ls = v.lastIndexOf('\n', s - 1) + 1;
    let le = v.indexOf('\n', Math.max(e, s));
    if (le < 0) le = v.length;
    const block = v.slice(ls, le);
    const changed = block.split('\n')
      .map((l) => (outdent ? l.replace(/^  /, '') : l.trim() ? '  ' + l : l))
      .join('\n');
    if (changed === block) return;
    ta.setSelectionRange(ls, le);
    document.execCommand('insertText', false, changed);
    ta.setSelectionRange(ls, ls + changed.length);
    sbPatch({ draft: ta.value });
  }

  // Alt+↑/↓:选中行(块)与相邻行交换位置;经 execCommand 走原生撤销栈
  function moveLines(ta, dir) {
    const v = ta.value;
    const s = ta.selectionStart, e = ta.selectionEnd;
    const ls = v.lastIndexOf('\n', s - 1) + 1;
    let le = v.indexOf('\n', Math.max(e, s));
    if (le < 0) le = v.length;
    const block = v.slice(ls, le);
    if (dir < 0) {
      if (ls === 0) return;
      const ps = v.lastIndexOf('\n', ls - 2) + 1;
      const prev = v.slice(ps, ls - 1);
      ta.setSelectionRange(ps, le);
      document.execCommand('insertText', false, block + '\n' + prev);
      ta.setSelectionRange(ps, ps + block.length);
    } else {
      if (le >= v.length) return;
      let ne = v.indexOf('\n', le + 1);
      if (ne < 0) ne = v.length;
      const next = v.slice(le + 1, ne);
      ta.setSelectionRange(ls, ne);
      document.execCommand('insertText', false, next + '\n' + block);
      ta.setSelectionRange(ls + next.length + 1, ls + next.length + 1 + block.length);
    }
    sbPatch({ draft: ta.value });
  }

  function openPanel() {
    if (!ui) return;
    const st = getState();
    if (st.draft != null && st.draft !== ui.disk) {
      ui.ta.value = st.draft;
      setStatus('已恢复未保存的草稿（内容与文件不同）');
    } else {
      ui.ta.value = ui.disk;
    }
    ui.panel.classList.add('open');
    document.documentElement.setAttribute('data-de-open', '');
    patchState({ open: true });
    ui.ta.focus();
    if (st.sel != null) {
      try { ui.ta.setSelectionRange(st.sel, st.sel); } catch {}
      ui.ta.scrollTop = st.scroll || 0;
    }
  }

  function closePanel() {
    if (!ui) return;
    ui.panel.classList.remove('open');
    document.documentElement.removeAttribute('data-de-open');
    patchState({ open: false, draft: null });
    // 不保存关闭 = 全部丢弃：换掉的图写回原图、本会话上传且未落盘引用的图删掉，再刷回正式内容。
    // 注意换图不改正文文字，所以脏判定必须包含 replaced，不能只比对文本。
    const dirty = (ui.previewed && ui.ta.value !== ui.disk) || ui.replaced.size > 0;
    if (dirty) {
      fetch(API + '/discard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file: ui.file }),
      }).finally(() => location.reload());
    }
  }

  // 实时预览：渲染当前编辑内容并替换正文区域，不写盘、不触发整页刷新
  let previewSeq = 0;
  async function livePreview() {
    if (!ui || !ui.panel.classList.contains('open')) return;
    const target = document.querySelector('.sl-markdown-content');
    if (!target) return;
    const seq = ++previewSeq;
    try {
      const r = await fetch(API + '/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: ui.ta.value, file: ui.file }),
      });
      if (!r.ok) return;
      const j = await r.json();
      if (seq !== previewSeq) return; // 只应用最新一次
      patchPreview(target, j.html);
      ui.previewed = true;
      if (ui.ta.value !== ui.disk) setStatus('实时预览中（未保存，Ctrl+S 落盘）');
    } catch {}
  }

  async function save() {
    if (!ui) return;
    // 保存会触发整页刷新 —— 先记住光标和滚动位置，刷新后自动恢复
    patchState({ open: true, sel: ui.ta.selectionStart, scroll: ui.ta.scrollTop, draft: null });
    setStatus('保存中…');
    try {
      const r = await fetch(API + '/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file: ui.file, content: ui.ta.value }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || r.status);
      ui.disk = ui.ta.value;
      ui.replaced.clear(); // 保存 = 提交换图
      ui.replaceStack.length = 0; // 已提交的换图不再可撤(服务端备份已清)
      const gc = j.removedImages?.length ? '，已清理 ' + j.removedImages.length + ' 张未引用图片' : '';
      setStatus('已保存 ' + new Date().toLocaleTimeString() + gc);
    } catch (e) {
      patchState({ draft: ui.ta.value });
      setStatus('保存失败：' + e.message);
    }
  }

  /** 正文中的图片 URL（./img/x 或 /Dir/img/x）→ 页面里 <img src> 使用的站内绝对路径 */
  function toSiteImgUrl(url) {
    if (!url) return url;
    if (/^(https?:|data:|\/\/)/i.test(url) || url.startsWith('/')) return url.split('?')[0];
    const pageDir = (ui.file || '').replace(/\\/g, '/').replace(/\/[^/]+$/, '');
    const joined = (pageDir ? pageDir + '/' : '') + url.replace(/^\.\//, '');
    const parts = joined.split('/');
    const out = [];
    for (const p of parts) {
      if (!p || p === '.') continue;
      if (p === '..') out.pop();
      else out.push(p);
    }
    return '/' + out.join('/');
  }

  async function uploadImages(files) {
    // 换图模式:粘贴时若选区里恰好是一条图片引用,则沿用原名原地覆盖,不产生新序号
    let replaceUrl = null;
    {
      const selText = ui.ta.value.slice(ui.ta.selectionStart, ui.ta.selectionEnd);
      const m = selText.match(/!\[[^\]]*\]\(((?:\.\/)?(?:img\/)?[^)\s]+\.(?:png|jpe?g|gif|webp)|\/[^)\s]+\.(?:png|jpe?g|gif|webp))\)/gi);
      if (m && m.length === 1 && files.length === 1) {
        replaceUrl = m[0].match(/\(([^)\s]+)\)/)[1];
      }
    }
    for (const f of files) {
      setStatus('上传图片中…');
      try {
        // 名字交给服务端定：符合文档 `数字.png` / `数字-数字.png` 规范的保留，
        // 乱名（剪贴板的 image.png、中文名、随手截图名等）自动改成本页图片目录的下一个序号
        const name = (f.name || 'clipboard.png').replace(/[^\w.-]+/g, '-');
        const data = await new Promise((resolve, reject) => {
          const fr = new FileReader();
          fr.onload = () => resolve(String(fr.result).split(',')[1]);
          fr.onerror = reject;
          fr.readAsDataURL(f);
        });
        // 连同当前编辑内容和光标位置一起传：序号按文档里已引用的图片定（光标前最后一张 +1），
        // 与目录内容无关，粘贴→撤销→再粘贴序号不变
        const r = await fetch(API + '/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            file: ui.file, name, data, replaceUrl,
            content: ui.ta.value, caret: ui.ta.selectionStart,
          }),
        });
        const j = await r.json();
        if (!r.ok) throw new Error(j.error || r.status);
        // 用 execCommand 插入以进入原生撤销栈——「撤回」/Ctrl+Z 可以退掉这次插入
        ui.ta.focus();
        document.execCommand('insertText', false, `![](${j.url})`);
        const siteUrl = j.siteUrl || toSiteImgUrl(j.url);
        if (j.replaced) {
          // 原地换图:正文 URL 可能是相对路径,预览里是绝对路径——刷缓存用 siteUrl
          bustImgCache(siteUrl);
          const rname = j.url.split('/').pop();
          ui.replaced.add(rname);
          // 入换图动作栈。必须在 insertText 之后压栈——insertText 触发的 input 事件
          // 会先更新 lastInputTime,这里的 time 要比它新,撤回才会优先还原图而不是撤文字
          ui.replaceStack.push({ name: rname, url: siteUrl, time: performance.now() });
          // 换图前后引用文字相同,Ctrl+Z 无从撤起 —— 给一个显式的「还原原图」
          setStatus('已替换图片：' + j.url + '（保存后生效）');
          const a = document.createElement('a');
          a.textContent = '还原原图';
          a.style.cssText = 'color: var(--sl-color-text-accent); margin-left: 0.5rem; cursor: pointer; text-decoration: underline;';
          a.onclick = async () => {
            const rr = await fetch(API + '/restore', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ file: ui.file, name: rname }),
            });
            if (rr.ok) {
              ui.replaced.delete(rname);
              bustImgCache(siteUrl);
              setStatus('已还原原图：' + j.url);
            } else setStatus('还原失败：' + ((await rr.json()).error || rr.status));
          };
          ui.status.appendChild(a);
        } else {
          setStatus('图片已上传并插入：' + j.url + '（保存后生效）');
        }
      } catch (e) {
        setStatus('图片上传失败：' + e.message);
      }
    }
  }

  function setStatus(msg) { if (ui) ui.status.textContent = msg; }

  // 定位到预览中的第 occ 张 src 匹配的图片,滚动并加高亮框
  let imgFlashTimer;
  function locateImage(url, occ) {
    const site = toSiteImgUrl(url);
    const imgs = [...document.querySelectorAll('.sl-markdown-content img')]
      .filter((im) => {
        const src = (im.getAttribute('src') || '').split('?')[0];
        return src === site || src === url;
      });
    const im = imgs[Math.min(occ || 0, imgs.length - 1)];
    if (!im) return;
    try { CSS.highlights.delete('de-locate'); } catch {}
    document.querySelectorAll('.de-img-flash').forEach((x) => x.classList.remove('de-img-flash'));
    const rect = im.getBoundingClientRect();
    window.scrollTo({ top: rect.top + window.scrollY - window.innerHeight / 3, behavior: 'smooth' });
    im.classList.add('de-img-flash');
    clearTimeout(imgFlashTimer);
    imgFlashTimer = setTimeout(() => im.classList.remove('de-img-flash'), 2500);
  }

  // 撤回一步：换图动作比最近文字输入更新 → 还原原图；否则原生文字撤销
  async function undoOnce() {
    if (!ui) return;
    const top = ui.replaceStack[ui.replaceStack.length - 1];
    if (top && top.time >= ui.lastInputTime) {
      ui.replaceStack.pop();
      const rr = await fetch(API + '/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file: ui.file, name: top.name }),
      });
      if (rr.ok) {
        ui.replaced.delete(top.name);
        bustImgCache(top.url);
        setStatus('已还原原图：' + top.url);
      } else {
        setStatus('原图已是还原状态：' + top.url);
      }
      return;
    }
    ui.ta.focus();
    document.execCommand('undo');
  }

  // 同 URL 换图后强制浏览器重取图片（仅预览显示用，markdown 里的 URL 保持干净）
  function bustImgCache(url) {
    document.querySelectorAll('.sl-markdown-content img').forEach((im) => {
      if (im.getAttribute('src')?.split('?')[0] === url) im.src = url + '?t=' + Date.now();
    });
  }

  // 增量更新正文：只替换真正变化的顶层块，未动的段落（含图片）原封不动，消除整块重建的闪烁。
  // 渲染是确定性的，逐块比对 outerHTML，找出公共前缀/后缀，仅替换中间差异区。
  function patchPreview(target, html) {
    const tpl = document.createElement('template');
    tpl.innerHTML = html;
    const oldC = [...target.childNodes];
    const newC = [...tpl.content.childNodes];
    const eq = (a, b) => a.nodeType === b.nodeType &&
      (a.nodeType === 1 ? a.outerHTML === b.outerHTML : a.nodeValue === b.nodeValue);
    let p = 0;
    while (p < oldC.length && p < newC.length && eq(oldC[p], newC[p])) p++;
    let so = oldC.length, sn = newC.length;
    while (so > p && sn > p && eq(oldC[so - 1], newC[sn - 1])) { so--; sn--; }
    if (p === so && p === sn) return; // 完全相同
    for (let i = p; i < so; i++) target.removeChild(oldC[i]);
    const ref = so < oldC.length ? oldC[so] : null;
    for (let i = p; i < sn; i++) target.insertBefore(newC[i], ref);
  }

  // 双击/选中编辑器文字 → 预览滚动到对应位置并高亮。
  // 做法：把选区（连同前后各 24 字符的上下文提高唯一性）洗掉 markdown 语法后，
  // 在正文文本节点里做去空白匹配，命中处用 CSS Highlight 高亮并滚动到视口上 1/3 处。
  let locateTimer;
  function mdToPlain(s) {
    return s
      .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/[`*_~#>|:-]/g, '')
      .trim();
  }
  // needleRaw 用于匹配定位；hlStart/hlLen 指定其中真正要高亮的子段（选中词本身），
  // 缺省高亮整个匹配段
  // 正文文本索引：拼接所有文本节点（去空白），并记录每个字符对应的节点位置
  function buildHay() {
    const root = document.querySelector('.sl-markdown-content');
    if (!root) return null;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let hay = '';
    const map = [];
    while (walker.nextNode()) {
      const n = walker.currentNode, v = n.nodeValue;
      for (let i = 0; i < v.length; i++) {
        if (!/\s/.test(v[i])) { hay += v[i]; map.push([n, i]); }
      }
    }
    return { hay, map };
  }

  function highlightAt(h, at, len) {
    const [n1, o1] = h.map[at], [n2, o2] = h.map[at + len - 1];
    const range = document.createRange();
    range.setStart(n1, o1);
    range.setEnd(n2, o2 + 1);
    document.querySelectorAll('.de-img-flash').forEach((x) => x.classList.remove('de-img-flash'));
    try {
      CSS.highlights.set('de-locate', new Highlight(range));
      clearTimeout(locateTimer);
      locateTimer = setTimeout(() => CSS.highlights.delete('de-locate'), 2500);
    } catch {}
    const rect = range.getBoundingClientRect();
    window.scrollTo({ top: rect.top + window.scrollY - window.innerHeight / 3, behavior: 'smooth' });
  }

  function locateInPreview(needleRaw, hlStart, hlLen) {
    const needle = mdToPlain(needleRaw).replace(/\s+/g, '');
    if (needle.length < 1) return false;
    const h = buildHay();
    if (!h) return false;
    const at = h.hay.indexOf(needle);
    if (at < 0) return false;
    let s = at, len = needle.length;
    if (hlLen > 0 && hlStart >= 0 && hlStart + hlLen <= needle.length) { s = at + hlStart; len = hlLen; }
    highlightAt(h, s, len);
    return true;
  }

  // 出现序号对齐：选中的是源文第 k 个「needle」，就定位到预览里第 k 个,而不是第一个。
  // 源文侧的计数同样先洗掉 frontmatter 和 markdown 语法,让两边的序号尽量对齐。
  function locateByOccurrence(sel, selStart) {
    const needle = mdToPlain(sel).replace(/\s+/g, '');
    if (needle.length < 1) return false;
    const prefix = ui.ta.value.slice(0, selStart).replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
    const prefixPlain = mdToPlain(prefix).replace(/\s+/g, '');
    let k = 0;
    for (let i = prefixPlain.indexOf(needle); i >= 0; i = prefixPlain.indexOf(needle, i + 1)) k++;
    const h = buildHay();
    if (!h) return false;
    let at = -1;
    for (let i = 0; i <= k; i++) {
      at = h.hay.indexOf(needle, at + 1);
      if (at < 0) return false;
    }
    highlightAt(h, at, needle.length);
    return true;
  }
  function tryLocate() {
    if (!ui) return;
    const s = ui.ta.selectionStart, e = ui.ta.selectionEnd;
    if (e - s < 1 || e - s > 200) return;
    // 选区落在图片/链接引用内时,引用里的字（alt、路径、数字、png…）不会出现在渲染文本里,
    // 文本匹配必然错位 —— 图片直接定位到预览中的那张图,链接用其显示文字定位
    const refRe = /(!?)\[([^\]]*)\]\(([^)]*)\)/g;
    const imgOcc = {};
    for (let m; (m = refRe.exec(ui.ta.value)); ) {
      const url = (m[3] || '').trim().split(/\s/)[0];
      const isImg = m[1] === '!';
      if (isImg) imgOcc[url] = (imgOcc[url] || 0);
      const start = m.index, end = m.index + m[0].length;
      if (e > start && s < end) { // 选区与这条引用相交
        if (isImg) locateImage(url, imgOcc[url]);
        else if (m[2]) locateInPreview(m[2]);
        return;
      }
      if (isImg) imgOcc[url]++;
    }
    const v = ui.ta.value;
    // frontmatter（标题/描述/slug）不渲染到页面,选中它时不定位
    const fm = v.match(/^---\r?\n[\s\S]*?\r?\n---/);
    if (fm && s < fm[0].length) return;
    const sel = v.slice(s, e);
    const selLen = mdToPlain(sel).replace(/\s+/g, '').length;
    // 1) 整行（句子级）匹配：定位精度最高，词只在行内高亮
    const lineStart = v.lastIndexOf('\n', s - 1) + 1;
    const lineEndRaw = v.indexOf('\n', e);
    const lineEnd = lineEndRaw < 0 ? v.length : lineEndRaw;
    const preInLine = mdToPlain(v.slice(lineStart, s)).replace(/\s+/g, '').length;
    if (locateInPreview(v.slice(lineStart, lineEnd), preInLine, selLen)) return;
    // 2) 短上下文（±24 字符）匹配：行内含语法残渣匹配不上时的降级
    const before = v.slice(Math.max(0, s - 24), s).split('\n').pop();
    const after = v.slice(e, e + 24).split('\n')[0];
    const preLen = mdToPlain(before).replace(/\s+/g, '').length;
    if (locateInPreview(before + sel + after, preLen, selLen)) return;
    // 3) 出现序号对齐：源文第 k 个该词 → 预览第 k 个。全部失败则不跳，绝不盲搜首个同字
    locateByOccurrence(sel, s);
  }

  // 站点用了 ClientRouter（无刷新换页会整体替换 body），每次换页后重建 UI
  document.addEventListener('astro:page-load', init);
  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
