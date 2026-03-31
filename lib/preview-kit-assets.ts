/** Public URL for website-kit preview viewers (token authorises legacy proxy paths only). */
export function previewKitFileUrl(token: string, stored: string): string {
  const s = stored.trim();
  if (!s) return "";
  if (/^https?:\/\//i.test(s)) return s;
  const parts = s.split("/").filter(Boolean);
  if (parts.length === 0) return "";
  return `/api/preview/website-kit/${encodeURIComponent(token)}/file/${parts.map(encodeURIComponent).join("/")}`;
}
