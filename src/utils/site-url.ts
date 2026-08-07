/** 为站内根路径添加 Astro 部署 base；外链、data URL 和相对路径保持不变。 */
export function withSiteBase(url?: string): string | undefined {
  if (!url || !url.startsWith('/') || url.startsWith('//')) return url;
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  if (!base || base === '/' || url === base || url.startsWith(base + '/')) return url;
  return base + url;
}
