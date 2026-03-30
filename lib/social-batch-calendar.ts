import { prisma } from "@/lib/prisma";
import { CALENDAR_CHANNEL_OPTIONS } from "@/lib/calendar-channels";

export const SOCIAL_POST_FORMATS = ["REEL", "GRAPHIC", "CAROUSEL", "STORY", "VIDEO"] as const;
export type SocialPostFormat = (typeof SOCIAL_POST_FORMATS)[number];

export const CALENDAR_WORKFLOW_STATUSES = [
  "AWAITING_CONTENT",
  "DRAFT",
  "PENDING_APPROVAL",
  "APPROVED",
  "REVISION_NEEDED",
] as const;
export type CalendarWorkflowStatus = (typeof CALENDAR_WORKFLOW_STATUSES)[number];

export type SocialWeeklySlot = {
  postType: SocialPostFormat;
  channels: string[];
  /** 0 = Sunday … 6 = Saturday (Date.getDay()) */
  weekdays: number[];
};

const CHANNEL_IDS = new Set(CALENDAR_CHANNEL_OPTIONS.map((c) => c.id));

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export function formatYm(y: number, m0: number): string {
  return `${y}-${pad2(m0 + 1)}`;
}

export function currentYmLocal(d = new Date()): string {
  return formatYm(d.getFullYear(), d.getMonth());
}

export function parseYm(ym: string): { y: number; m0: number } | null {
  const m = /^(\d{4})-(\d{2})$/.exec(ym.trim());
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  if (mo < 0 || mo > 11) return null;
  return { y, m0: mo };
}

export function ymNext(ym: string): string {
  const p = parseYm(ym);
  if (!p) return ym;
  if (p.m0 === 11) return formatYm(p.y + 1, 0);
  return formatYm(p.y, p.m0 + 1);
}

/** <=0 if a <= b chronologically */
export function ymCompare(a: string, b: string): number {
  const pa = parseYm(a);
  const pb = parseYm(b);
  if (!pa || !pb) return 0;
  if (pa.y !== pb.y) return pa.y - pb.y;
  return pa.m0 - pb.m0;
}

export function labelForPostFormat(f: string): string {
  switch (f) {
    case "REEL":
      return "Reel";
    case "GRAPHIC":
      return "Graphic";
    case "CAROUSEL":
      return "Carousel";
    case "STORY":
      return "Story";
    case "VIDEO":
      return "Video";
    default:
      return f;
  }
}

/** Human-readable count + format for weekly deliverables copy, e.g. "2 Graphics", "1 Reel". */
export function formatWeeklySlotCountLabel(count: number, postType: string): string {
  if (count <= 0) return "";
  const base = labelForPostFormat(postType);
  if (count === 1) return `1 ${base}`;
  if (postType === "GRAPHIC") return `${count} Graphics`;
  if (postType === "REEL") return `${count} Reels`;
  return `${count} ${base}s`;
}

/**
 * One-line summary for the agency calendar banner from `socialWeeklyScheduleJson`.
 * Returns null when no schedule is configured.
 */
export function weeklyDeliverablesSummaryLine(scheduleJson: string | null | undefined): string | null {
  const slots = parseSocialWeeklyScheduleJson(scheduleJson);
  if (slots.length === 0) return null;
  const total = slots.reduce((acc, s) => acc + s.weekdays.length, 0);
  if (total <= 0) return null;
  const byType = new Map<SocialPostFormat, number>();
  for (const s of slots) {
    const n = s.weekdays.length;
    if (n <= 0) continue;
    byType.set(s.postType, (byType.get(s.postType) ?? 0) + n);
  }
  const parts = SOCIAL_POST_FORMATS.map((f) => {
    const c = byType.get(f);
    if (!c) return null;
    return formatWeeklySlotCountLabel(c, f);
  }).filter(Boolean) as string[];
  const breakdown = parts.join(", ");
  const postWord = total === 1 ? "post" : "posts";
  return `Weekly deliverables for this account: ${total} ${postWord} per week — ${breakdown}`;
}

export function workflowStatusLabel(s: CalendarWorkflowStatus | string): string {
  switch (s) {
    case "AWAITING_CONTENT":
      return "Awaiting Content";
    case "DRAFT":
      return "Draft";
    case "PENDING_APPROVAL":
      return "Pending Approval";
    case "APPROVED":
      return "Approved";
    case "REVISION_NEEDED":
      return "Revision Needed";
    case "COMPLETE":
      return "Complete";
    case "LOCKED":
      return "Locked";
    default:
      return s;
  }
}

/** Soft boutique badges (pair with `WorkflowStatusBadge` when using icons). */
export function workflowStatusBadgeClass(s: CalendarWorkflowStatus | string): string {
  switch (s) {
    case "AWAITING_CONTENT":
      return "bg-zinc-100 text-zinc-800 ring-1 ring-zinc-200/80";
    case "DRAFT":
      return "bg-sky-50 text-sky-900 ring-1 ring-sky-200/90";
    case "PENDING_APPROVAL":
      return "bg-amber-50 text-amber-950 ring-1 ring-amber-200/90";
    case "APPROVED":
      return "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200/90";
    case "REVISION_NEEDED":
      return "bg-rose-50 text-rose-900 ring-1 ring-rose-200/90";
    case "COMPLETE":
      return "bg-burgundy text-cream ring-1 ring-burgundy/25";
    case "LOCKED":
      return "bg-zinc-100 text-zinc-700 ring-1 ring-zinc-200/80";
    default:
      return "bg-burgundy/90 text-cream ring-1 ring-burgundy/25";
  }
}

export function parseSocialWeeklyScheduleJson(raw: string | null | undefined): SocialWeeklySlot[] {
  if (!raw?.trim()) return [];
  try {
    const v = JSON.parse(raw) as unknown;
    if (!Array.isArray(v)) return [];
    const out: SocialWeeklySlot[] = [];
    for (const row of v) {
      if (!row || typeof row !== "object") continue;
      const postType = (row as { postType?: string }).postType;
      if (!postType || !SOCIAL_POST_FORMATS.includes(postType as SocialPostFormat)) continue;
      const weekdaysRaw = (row as { weekdays?: unknown }).weekdays;
      const channelsRaw = (row as { channels?: unknown }).channels;
      const weekdays = Array.isArray(weekdaysRaw)
        ? weekdaysRaw.filter((x): x is number => typeof x === "number" && x >= 0 && x <= 6)
        : [];
      const channels = Array.isArray(channelsRaw)
        ? channelsRaw.filter(
            (x): x is string => typeof x === "string" && (CHANNEL_IDS as ReadonlySet<string>).has(x),
          )
        : [];
      if (weekdays.length === 0 || channels.length === 0) continue;
      out.push({
        postType: postType as SocialPostFormat,
        weekdays: Array.from(new Set(weekdays)).sort((a, b) => a - b),
        channels: Array.from(new Set(channels)),
      });
    }
    return out;
  } catch {
    return [];
  }
}

export function projectUsesBatchSocialCalendar(scheduleJson: string | null | undefined): boolean {
  return parseSocialWeeklyScheduleJson(scheduleJson).length > 0;
}

function dateAtNoonLocal(y: number, m0: number, day: number): Date {
  return new Date(y, m0, day, 12, 0, 0, 0);
}

type FlatSlot = { at: Date; slot: SocialWeeklySlot; idx: number };

function flattenMonthSlots(ym: string, slots: SocialWeeklySlot[]): FlatSlot[] {
  const p = parseYm(ym);
  if (!p) return [];
  const { y, m0 } = p;
  const lastDay = new Date(y, m0 + 1, 0).getDate();
  const flat: FlatSlot[] = [];
  let idx = 0;
  for (let day = 1; day <= lastDay; day++) {
    const at = dateAtNoonLocal(y, m0, day);
    const dow = at.getDay();
    for (const slot of slots) {
      if (slot.weekdays.includes(dow)) {
        flat.push({ at, slot, idx: idx++ });
      }
    }
  }
  return flat;
}

export function stableKeyForPlaceholder(projectId: string, ym: string, ordinal: number): string {
  return `${projectId}:${ym}:${ordinal}`;
}

/**
 * Insert missing placeholder rows for one calendar month. Idempotent via planStableKey.
 */
export async function generateSocialMonthPlaceholders(
  projectId: string,
  ym: string,
  schedule: SocialWeeklySlot[],
): Promise<number> {
  if (schedule.length === 0) return 0;
  const flat = flattenMonthSlots(ym, schedule);
  if (flat.length === 0) return 0;

  let created = 0;
  for (const { at, slot, idx } of flat) {
    const planStableKey = stableKeyForPlaceholder(projectId, ym, idx);
    const existing = await prisma.contentCalendarItem.findFirst({
      where: { projectId, planStableKey },
      select: { id: true },
    });
    if (existing) continue;

    const channelsJson = JSON.stringify(slot.channels.length ? slot.channels : ["instagram"]);
    await prisma.contentCalendarItem.create({
      data: {
        projectId,
        scheduledFor: at,
        title: null,
        caption: "",
        hashtags: "",
        channelsJson,
        postFormat: slot.postType,
        planMonthKey: ym,
        planStableKey,
        isPlanPlaceholder: true,
        postWorkflowStatus: "AWAITING_CONTENT",
        clientSignedOff: false,
        clientFeedback: null,
        signedOffAt: null,
      },
    });
    created += 1;
  }
  return created;
}

/** Months to generate from last-through cursor up to and including currentYm (never future months). */
export function monthsToGeneratePlaceholders(throughYm: string, currentYm: string): string[] {
  const out: string[] = [];
  const t = throughYm.trim();
  if (!t) {
    out.push(currentYm);
    return out;
  }
  let cursor = ymNext(t);
  while (ymCompare(cursor, currentYm) <= 0) {
    out.push(cursor);
    cursor = ymNext(cursor);
  }
  return out;
}

/**
 * Ensure placeholders exist through the current calendar month (local), update project cursor.
 */
export async function ensureSocialPlaceholdersForProject(projectId: string): Promise<void> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      socialWeeklyScheduleJson: true,
      socialPlaceholdersGeneratedThroughYm: true,
    },
  });
  if (!project) return;
  const schedule = parseSocialWeeklyScheduleJson(project.socialWeeklyScheduleJson);
  if (schedule.length === 0) return;

  const nowYm = currentYmLocal();
  const months = monthsToGeneratePlaceholders(project.socialPlaceholdersGeneratedThroughYm ?? "", nowYm);
  if (months.length === 0) return;

  for (const ym of months) {
    if (ymCompare(ym, nowYm) > 0) break;
    await generateSocialMonthPlaceholders(projectId, ym, schedule);
  }

  await prisma.project.update({
    where: { id: projectId },
    data: { socialPlaceholdersGeneratedThroughYm: nowYm },
  });
}

/** Align workflow flags with legacy sign-off columns (run on calendar load; cheap after first pass). */
export async function syncCalendarWorkflowFromLegacyFlags(projectId: string): Promise<void> {
  await prisma.contentCalendarItem.updateMany({
    where: { projectId, clientSignedOff: true, NOT: { postWorkflowStatus: "APPROVED" } },
    data: { postWorkflowStatus: "APPROVED" },
  });
  await prisma.contentCalendarItem.updateMany({
    where: {
      projectId,
      clientSignedOff: false,
      clientFeedback: { not: null },
      AND: [{ NOT: { clientFeedback: "" } }, { NOT: { postWorkflowStatus: "REVISION_NEEDED" } }],
    },
    data: { postWorkflowStatus: "REVISION_NEEDED" },
  });
}

export function postHasCreativeOrCaption(imagePath: string | null | undefined, caption: string | null | undefined): boolean {
  return Boolean(imagePath?.trim()) || Boolean(caption?.trim());
}
