/**
 * Browser-safe URL for portal media stored in Prisma (`filePath`, `imagePath`, logo paths, etc.).
 * New rows hold UploadThing `https://…` URLs; legacy rows use `projectId/...` served via `/api/portal/file/…`.
 * Persisted values are capped at `MAX_STORED_ASSET_URL_OR_PATH_LEN` when read from JSON (see `lib/portal-asset-constants.ts`).
 */
export function portalFilePublicUrl(stored: string): string {
  const s = stored?.trim() ?? "";
  if (!s) return "";
  if (/^https?:\/\//i.test(s)) return s;
  const parts = s.split("/").filter(Boolean);
  if (parts.length === 0) return "";
  return `/api/portal/file/${parts.map(encodeURIComponent).join("/")}`;
}

export function isRemotePortalAssetUrl(stored: string | null | undefined): boolean {
  const s = stored?.trim();
  return Boolean(s && /^https?:\/\//i.test(s));
}
