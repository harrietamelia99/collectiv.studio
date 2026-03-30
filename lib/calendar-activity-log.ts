export type CalendarActivityKind =
  | "client_revision_request"
  | "client_comment"
  | "client_approved"
  | "studio_resubmit"
  | "studio_edit"
  | "post_removed";

export type CalendarActivityEntry = {
  at: string;
  kind: CalendarActivityKind;
  summary: string;
  /** Optional snapshot of content at this point (paths only — not file bytes). */
  snapshot?: {
    caption?: string;
    hashtags?: string;
    imagePath?: string | null;
    channelsJson?: string;
  };
};

export function parseCalendarActivityLogJson(raw: string | null | undefined): CalendarActivityEntry[] {
  if (!raw?.trim()) return [];
  try {
    const v = JSON.parse(raw) as unknown;
    if (!Array.isArray(v)) return [];
    return v.filter((row): row is CalendarActivityEntry => {
      if (!row || typeof row !== "object") return false;
      const o = row as Record<string, unknown>;
      return typeof o.at === "string" && typeof o.kind === "string" && typeof o.summary === "string";
    });
  } catch {
    return [];
  }
}

export function appendCalendarActivityLog(
  raw: string | null | undefined,
  entry: Omit<CalendarActivityEntry, "at"> & { at?: string },
): string {
  const prev = parseCalendarActivityLogJson(raw);
  const full: CalendarActivityEntry = {
    at: entry.at ?? new Date().toISOString(),
    kind: entry.kind,
    summary: entry.summary.slice(0, 4000),
    snapshot: entry.snapshot,
  };
  const next = [...prev, full].slice(-80);
  return JSON.stringify(next);
}
