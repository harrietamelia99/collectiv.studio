/** Client-safe URL for a stored client avatar path (no Node/fs). */
export function portalClientAvatarPublicUrl(userId: string, stored: string): string {
  const s = stored.trim();
  if (!s) return "";
  if (/^https?:\/\//i.test(s)) return s;
  const base = s.split("/").filter(Boolean).pop() ?? "";
  if (!base) return "";
  return `/api/portal/client-avatar/${encodeURIComponent(userId)}/${encodeURIComponent(base)}`;
}
