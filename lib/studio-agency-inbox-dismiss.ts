import { normalizePortalKind } from "@/lib/portal-project-kind";
import { projectIdFromStudioNotificationHref } from "@/lib/studio-notification-href";

export const AGENCY_INBOX_DISMISS_THREAD = "THREAD_REPLY" as const;
export const AGENCY_INBOX_DISMISS_CALENDAR = "CALENDAR_FEEDBACK" as const;
/** Prisma unique: calendarItemId must be "" for thread rows (not SQL NULL). */
export const AGENCY_INBOX_THREAD_CALENDAR_KEY = "";

type ProjectAssignee = { assignedStudioUserId: string | null };
type ProjectForCalendarPerm = ProjectAssignee & { portalKind: string };

/** Issy: any thread row. Harriet: assigned projects only. May: never. */
export function canDismissAgencyInboxThreadItem(
  personaSlug: string,
  viewerUserId: string,
  project: ProjectAssignee,
): boolean {
  if (personaSlug === "isabella") return true;
  if (personaSlug === "may") return false;
  if (personaSlug === "harriet") return project.assignedStudioUserId === viewerUserId;
  return project.assignedStudioUserId === viewerUserId;
}

/** Issy: any. May: her SOCIAL assignee rows only. Harriet: assigned projects only. */
export function canDismissAgencyInboxCalendarItem(
  personaSlug: string,
  viewerUserId: string,
  project: ProjectForCalendarPerm,
): boolean {
  if (personaSlug === "isabella") return true;
  const k = normalizePortalKind(project.portalKind);
  if (personaSlug === "may") {
    return k === "SOCIAL" && project.assignedStudioUserId === viewerUserId;
  }
  if (personaSlug === "harriet") return project.assignedStudioUserId === viewerUserId;
  return project.assignedStudioUserId === viewerUserId;
}

function notificationHrefHasCalendarPost(href: string | null | undefined, calendarItemId: string): boolean {
  if (!href) return false;
  try {
    const base = href.startsWith("/") ? `https://local.invalid${href}` : href;
    const u = new URL(base);
    return u.searchParams.get("post") === calendarItemId;
  } catch {
    return href.includes(`post=${calendarItemId}`);
  }
}

type NotifRow = { kind: string; href: string | null; readAt: Date | null; createdAt: Date };

/** Dismiss control enabled only after related bell notifications are read (or none exist). */
export function studioInboxThreadDismissReadOk(projectId: string, notifications: NotifRow[]): boolean {
  const relevant = notifications.filter(
    (n) => n.kind === "CLIENT_MESSAGE" && projectIdFromStudioNotificationHref(n.href) === projectId,
  );
  if (relevant.length === 0) return true;
  const newest = relevant.reduce((a, b) => (a.createdAt.getTime() >= b.createdAt.getTime() ? a : b));
  return newest.readAt != null;
}

/** Bell rows tied to a calendar post (href includes `?post=`). Not all DB rows use the legacy `CALENDAR_FEEDBACK` label. */
const CALENDAR_INBOX_NOTIF_KINDS = new Set([
  "CALENDAR_FEEDBACK",
  "CALENDAR_REVISION_REQUEST",
  "CALENDAR_CLIENT_COMMENT",
]);

export function studioInboxCalendarDismissReadOk(calendarItemId: string, notifications: NotifRow[]): boolean {
  const relevant = notifications.filter(
    (n) => CALENDAR_INBOX_NOTIF_KINDS.has(n.kind) && notificationHrefHasCalendarPost(n.href, calendarItemId),
  );
  if (relevant.length === 0) return true;
  const newest = relevant.reduce((a, b) => (a.createdAt.getTime() >= b.createdAt.getTime() ? a : b));
  return newest.readAt != null;
}

export function filterAwaitingReplyWithDismissals<
  T extends {
    id: string;
    messages: Array<{ id: string; authorRole: string }>;
  },
>(rows: T[], dismissals: Array<{ kind: string; projectId: string; calendarItemId: string; anchorProjectMessageId: string | null }>): T[] {
  const anchors = new Map<string, string>();
  for (const d of dismissals) {
    if (d.kind !== AGENCY_INBOX_DISMISS_THREAD) continue;
    if ((d.calendarItemId ?? AGENCY_INBOX_THREAD_CALENDAR_KEY) !== AGENCY_INBOX_THREAD_CALENDAR_KEY) continue;
    if (d.anchorProjectMessageId) anchors.set(d.projectId, d.anchorProjectMessageId);
  }
  return rows.filter((p) => {
    const last = p.messages[0];
    if (!last || last.authorRole !== "CLIENT") return false;
    const anchor = anchors.get(p.id);
    if (anchor && last.id === anchor) return false;
    return true;
  });
}

export function filterCalendarFeedbackWithDismissals<
  T extends { id: string; updatedAt: Date },
>(
  rows: T[],
  dismissals: Array<{ kind: string; calendarItemId: string; anchorCalendarUpdatedAt: Date | null }>,
): T[] {
  const anchorTimes = new Map<string, number>();
  for (const d of dismissals) {
    if (d.kind !== AGENCY_INBOX_DISMISS_CALENDAR) continue;
    const cid = d.calendarItemId?.trim();
    if (!cid) continue;
    if (d.anchorCalendarUpdatedAt) anchorTimes.set(cid, d.anchorCalendarUpdatedAt.getTime());
  }
  return rows.filter((c) => {
    const t = anchorTimes.get(c.id);
    if (t == null) return true;
    return c.updatedAt.getTime() !== t;
  });
}
