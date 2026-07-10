import fs from 'node:fs';
import path from 'node:path';
const DIST = '_book';
function walk(d, o=[]){for(const n of fs.readdirSync(d)){const f=path.join(d,n);const s=fs.statSync(f);s.isDirectory()?walk(f,o):n.endsWith('.html')&&o.push(f);}return o;}
const pages = walk(DIST);
const exists = (urlPath) => {
  let p = urlPath.split('#')[0].split('?')[0];
  if(!p.startsWith('/')) return true; // 相对/外链略过
  p = decodeURIComponent(p);
  const base = path.join(DIST, p);
  return fs.existsSync(base) || fs.existsSync(base+'.html') ||
         fs.existsSync(path.join(base,'index.html'));
};
const broken = {};
let total=0;
for(const pg of pages){
  const html = fs.readFileSync(pg,'utf8');
  const hrefs = [...html.matchAll(/href="(\/[^"#][^"]*)"/g)].map(m=>m[1]);
  for(const h of hrefs){
    if(/\.(css|js|xml|ico|png|jpg|svg|webmanifest)$/i.test(h)) continue;
    if(h.startsWith('/pagefind')||h.startsWith('/_astro')) continue;
    total++;
    if(!exists(h)){ (broken[h] ||= []).push(path.relative(DIST,pg)); }
  }
}
const keys = Object.keys(broken);
console.log(`内部链接总数(去重前): ${total}`);
console.log(`断链目标(去重): ${keys.length}`);
console.log('--- 断链 TOP 20（目标 ← 出现页数）---');
keys.sort((a,b)=>broken[b].length-broken[a].length).slice(0,20)
  .forEach(k=>console.log(`  ${broken[k].length}×  ${k}`));
