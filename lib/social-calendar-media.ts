/** True when the public URL points at a video we can play inline in the calendar. */
export function isSocialCalendarMediaVideoUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  const u = url.split("?")[0]?.toLowerCase() ?? "";
  return /\.(mp4|webm|mov|m4v)$/.test(u);
}
