/** Platforms available when scheduling posts in the portal calendar. */
export const CALENDAR_CHANNEL_OPTIONS = [
  { id: "instagram", label: "Instagram" },
  { id: "facebook", label: "Facebook" },
  { id: "tiktok", label: "TikTok" },
  { id: "linkedin", label: "LinkedIn" },
] as const;

const ALLOWED: Set<string> = new Set(CALENDAR_CHANNEL_OPTIONS.map((c) => c.id));

export function parseCalendarChannelsJson(raw: string | null | undefined): string[] {
  if (!raw?.trim()) return ["instagram"];
  try {
    const v = JSON.parse(raw) as unknown;
    if (!Array.isArray(v)) return ["instagram"];
    const out = v.filter((x): x is string => typeof x === "string" && ALLOWED.has(x));
    return out.length ? out : ["instagram"];
  } catch {
    return ["instagram"];
  }
}

export function normalizeCalendarChannelsFromForm(formData: FormData): string[] {
  const picked = formData.getAll("channels").map((x) => String(x).trim());
  const out = picked.filter((id) => ALLOWED.has(id));
  return out.length ? out : ["instagram"];
}

export function labelForChannel(id: string): string {
  const f = CALENDAR_CHANNEL_OPTIONS.find((c) => c.id === id);
  return f?.label ?? id;
}
