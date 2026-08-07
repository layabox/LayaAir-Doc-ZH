document.addEventListener("click",t=>{const a=t.target?.closest?.("starlight-toc a");if(!a)return;const l=a.closest("starlight-toc");l&&(l.querySelectorAll('a[aria-current="true"]').forEach(o=>o.removeAttribute("aria-current")),a.setAttribute("aria-current","true"))});document.addEventListener("astro:after-swap",()=>{d()});const r=[.875,1,1.125,1.25],s={get:t=>{try{return localStorage.getItem(t)}catch{return null}},set:(t,e)=>{try{localStorage.setItem(t,e)}catch{}}};function d(){const t=document.documentElement;t.classList.toggle("laya-sb-collapsed",s.get("laya-sb-collapsed")==="1");const e=s.get("laya-font-scale");e&&t.style.setProperty("--laya-font-scale",e),t.classList.toggle("laya-serif",s.get("laya-font-family")==="serif");const a=s.get("laya-reader-theme");t.classList.toggle("laya-sepia",a==="sepia"),a==="night"?t.dataset.theme="dark":(a==="white"||a==="sepia")&&(t.dataset.theme="light")}function y(){return document.documentElement.classList.contains("laya-sepia")?"sepia":document.documentElement.dataset.theme==="dark"?"night":"white"}function f(t){const e=document.documentElement;s.set("laya-reader-theme",t),t==="night"?(e.classList.remove("laya-sepia"),e.dataset.theme="dark",s.set("starlight-theme","dark")):(e.dataset.theme="light",s.set("starlight-theme","light"),e.classList.toggle("laya-sepia",t==="sepia"))}function m(t){s.set("laya-font-family",t),document.documentElement.classList.toggle("laya-serif",t==="serif")}function c(t){const e=parseFloat(s.get("laya-font-scale")||"1");let a=r.findIndex(o=>Math.abs(o-e)<.001);a<0&&(a=1),a=Math.min(r.length-1,Math.max(0,a+t));const l=String(r[a]);s.set("laya-font-scale",l),document.documentElement.style.setProperty("--laya-font-scale",l)}function i(t){const e=s.get("laya-font-family")==="serif"?"serif":"sans",a=y();t.querySelectorAll("[data-font-family]").forEach(l=>l.setAttribute("aria-pressed",String(l.dataset.fontFamily===e))),t.querySelectorAll("[data-reader-theme]").forEach(l=>l.setAttribute("aria-pressed",String(l.dataset.readerTheme===a)))}function h(){if(document.querySelector(".laya-reader-tools"))return;const t=document.querySelector("site-search")?.parentElement||document.querySelector(".header .title-wrapper")||document.querySelector(".title-wrapper");if(!t)return;const e=document.createElement("div");e.className="laya-reader-tools",e.innerHTML=`
      <button class="laya-tool-btn" data-sidebar-toggle type="button" aria-label="折叠/展开侧栏" title="折叠/展开侧栏">☰</button>
      <div class="laya-fontsettings">
        <button class="laya-tool-btn" data-font-toggle type="button" aria-label="阅读设置" title="阅读设置（字号/字体/背景）" aria-expanded="false">A</button>
        <div class="laya-font-panel" role="menu" hidden>
          <div class="laya-row">
            <span class="laya-row-label">字号</span>
            <div class="laya-row-btns laya-sizes">
              <button type="button" data-font-dec aria-label="缩小字号" title="缩小字号">A−</button>
              <button type="button" data-font-inc aria-label="放大字号" title="放大字号">A+</button>
            </div>
          </div>
          <div class="laya-row">
            <span class="laya-row-label">字体</span>
            <div class="laya-row-btns laya-families">
              <button type="button" class="laya-serif-btn" data-font-family="serif">Serif</button>
              <button type="button" data-font-family="sans">Sans</button>
            </div>
          </div>
          <div class="laya-row">
            <span class="laya-row-label">背景</span>
            <div class="laya-row-btns laya-themes">
              <button type="button" data-reader-theme="white">White</button>
              <button type="button" data-reader-theme="sepia">Sepia</button>
              <button type="button" data-reader-theme="night">Night</button>
            </div>
          </div>
        </div>
      </div>`,t.appendChild(e);const a=e.querySelector(".laya-font-panel"),l=e.querySelector("[data-font-toggle]");e.querySelector("[data-sidebar-toggle]").addEventListener("click",()=>{const n=document.documentElement.classList.toggle("laya-sb-collapsed");s.set("laya-sb-collapsed",n?"1":"0")});const o=n=>{a.hidden=!n,l.setAttribute("aria-expanded",String(n)),n&&i(a)};l.addEventListener("click",n=>{n.stopPropagation(),o(a.hidden)}),a.addEventListener("click",n=>n.stopPropagation()),e.querySelector("[data-font-dec]").addEventListener("click",()=>c(-1)),e.querySelector("[data-font-inc]").addEventListener("click",()=>c(1)),a.querySelectorAll("[data-font-family]").forEach(n=>n.addEventListener("click",()=>{m(n.dataset.fontFamily),i(a)})),a.querySelectorAll("[data-reader-theme]").forEach(n=>n.addEventListener("click",()=>{f(n.dataset.readerTheme),i(a)}))}document.addEventListener("click",()=>{document.querySelectorAll(".laya-font-panel").forEach(t=>{t.hidden||(t.hidden=!0,t.previousElementSibling?.setAttribute("aria-expanded","false"))})});document.addEventListener("keydown",t=>{t.key==="Escape"&&document.querySelectorAll(".laya-font-panel").forEach(e=>e.hidden=!0)});function u(){d(),h()}u();document.addEventListener("astro:page-load",u);
