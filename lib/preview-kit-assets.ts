/** Public URL for website-kit preview viewers (token authorises access). */
export function previewKitFileUrl(token: string, relativePath: string): string {
  const parts = relativePath.split("/").filter(Boolean);
  return `/api/preview/website-kit/${encodeURIComponent(token)}/file/${parts.map(encodeURIComponent).join("/")}`;
}
