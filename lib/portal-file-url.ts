/**
 * Browser-safe URL builder for portal uploads (no Node `fs`).
 * Server-only disk paths live in `portal-uploads.ts`.
 */
export function portalFilePublicUrl(relative: string): string {
  const parts = relative.split("/").filter(Boolean);
  return `/api/portal/file/${parts.map(encodeURIComponent).join("/")}`;
}
