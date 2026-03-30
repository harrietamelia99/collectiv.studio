import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { normalizePortalKind } from "@/lib/portal-project-kind";
import { getPortalPublicOrigin } from "@/lib/portal-client-email";
import { studioEmailSet } from "@/lib/portal-studio-users";
import { sendResendEmail } from "@/lib/resend-email";

const PREVIEW = 240;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

type TeamRow = { userId: string; personaSlug: string };

async function loadStudioTeamForNotify(): Promise<TeamRow[]> {
  return prisma.studioTeamMember.findMany({
    select: { userId: true, personaSlug: true },
  });
}

/** Who should get a client thread notification for this project. */
export function recipientUserIdsForClientMessage(
  project: { portalKind: string; assignedStudioUserId: string | null },
  team: TeamRow[],
): string[] {
  const kind = normalizePortalKind(project.portalKind);
  const assigneeId = project.assignedStudioUserId;
  const ids = new Set<string>();

  if (assigneeId) {
    return [assigneeId];
  }

  if (kind === "SOCIAL") {
    for (const m of team) {
      if (m.personaSlug === "may" || m.personaSlug === "harriet") ids.add(m.userId);
    }
    return Array.from(ids);
  }

  for (const m of team) {
    if (m.personaSlug === "isabella" || m.personaSlug === "harriet") ids.add(m.userId);
  }
  return Array.from(ids);
}

/** Brand questionnaire submitted: assigned lead first; otherwise Harriet (creative), then Issy + Harriet fallback. */
export function recipientUserIdsForBrandingQuestionnaireSubmitted(
  project: { assignedStudioUserId: string | null },
  team: TeamRow[],
): string[] {
  if (project.assignedStudioUserId) {
    return [project.assignedStudioUserId];
  }
  const harriet = team.find((m) => m.personaSlug === "harriet");
  if (harriet) return [harriet.userId];
  return recipientUserIdsForClientMessage({ portalKind: "BRANDING", assignedStudioUserId: null }, team);
}

/** Calendar feedback: assigned lead only; if unassigned, May + Harriet can pick up. */
export function recipientUserIdsForCalendarFeedback(
  project: { assignedStudioUserId: string | null },
  team: TeamRow[],
): string[] {
  const assigneeId = project.assignedStudioUserId;
  if (assigneeId) {
    return [assigneeId];
  }
  const ids = new Set<string>();
  for (const m of team) {
    if (m.personaSlug === "may" || m.personaSlug === "harriet") ids.add(m.userId);
  }
  return Array.from(ids);
}

/** Notify the right studio people when a client posts on the project thread. */
export async function notifyStudioTeamClientMessage(
  projectId: string,
  projectName: string,
  preview: string,
): Promise<void> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { portalKind: true, assignedStudioUserId: true },
  });
  if (!project) return;

  const team = await loadStudioTeamForNotify();
  const userIds = recipientUserIdsForClientMessage(project, team);
  if (userIds.length === 0) return;

  const title = `Client message · ${projectName}`.slice(0, 200);
  const body = preview.slice(0, PREVIEW);
  const href = `/portal/project/${projectId}#project-messages`;

  await prisma.$transaction(
    userIds.map((userId) =>
      prisma.studioNotification.create({
        data: { userId, kind: "CLIENT_MESSAGE", title, body, href },
      }),
    ),
  );
}

/** Notify when a client leaves calendar feedback (social / multi projects). */
export async function notifyStudioTeamCalendarFeedback(
  projectId: string,
  projectName: string,
  calendarItemId: string,
  postLabel: string,
  notesPreview: string,
): Promise<void> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { assignedStudioUserId: true },
  });
  if (!project) return;

  const team = await loadStudioTeamForNotify();
  const userIds = recipientUserIdsForCalendarFeedback(project, team);
  if (userIds.length === 0) return;

  const title = `Changes requested · ${projectName}`.slice(0, 200);
  const body =
    `${postLabel.slice(0, 72)} — “${notesPreview.slice(0, Math.max(40, PREVIEW - 100))}”`.slice(0, PREVIEW);
  const href = `/portal/project/${projectId}/social/calendar?post=${encodeURIComponent(calendarItemId)}`;

  await prisma.$transaction(
    userIds.map((userId) =>
      prisma.studioNotification.create({
        data: { userId, kind: "CALENDAR_REVISION_REQUEST", title, body, href },
      }),
    ),
  );
}

/** Client left a comment on a post without changing status. */
export async function notifyStudioTeamCalendarClientComment(
  projectId: string,
  projectName: string,
  calendarItemId: string,
  postLabel: string,
  commentPreview: string,
): Promise<void> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { assignedStudioUserId: true },
  });
  if (!project) return;

  const team = await loadStudioTeamForNotify();
  const userIds = recipientUserIdsForCalendarFeedback(project, team);
  if (userIds.length === 0) return;

  const title = `Calendar comment · ${projectName}`.slice(0, 200);
  const body = `${postLabel.slice(0, 72)} — ${commentPreview.slice(0, PREVIEW - 80)}`.slice(0, PREVIEW);
  const href = `/portal/project/${projectId}/social/calendar?post=${encodeURIComponent(calendarItemId)}`;

  await prisma.$transaction(
    userIds.map((userId) =>
      prisma.studioNotification.create({
        data: { userId, kind: "CALENDAR_CLIENT_COMMENT", title, body, href },
      }),
    ),
  );
}

/** Client approved a single calendar post (in-app bell). */
export async function notifyStudioTeamCalendarPostApproved(
  projectId: string,
  projectName: string,
  calendarItemId: string,
  postLabel: string,
): Promise<void> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { assignedStudioUserId: true },
  });
  if (!project) return;

  const team = await loadStudioTeamForNotify();
  const userIds = recipientUserIdsForCalendarFeedback(project, team);
  if (userIds.length === 0) return;

  const title = `Post approved · ${projectName}`.slice(0, 200);
  const body = `${postLabel.slice(0, 120)} is approved for scheduling.`.slice(0, PREVIEW);
  const href = `/portal/project/${projectId}/social/calendar?post=${encodeURIComponent(calendarItemId)}`;

  await prisma.$transaction(
    userIds.map((userId) =>
      prisma.studioNotification.create({
        data: { userId, kind: "CALENDAR_POST_APPROVED", title, body, href },
      }),
    ),
  );
}

/** Client used Approve all for a month. */
export async function notifyStudioTeamCalendarMonthFullyApproved(
  projectId: string,
  projectName: string,
  monthLabel: string,
  count: number,
): Promise<void> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { assignedStudioUserId: true },
  });
  if (!project) return;

  const team = await loadStudioTeamForNotify();
  const userIds = recipientUserIdsForCalendarFeedback(project, team);
  if (userIds.length === 0) return;

  const title = `Month approved · ${projectName}`.slice(0, 200);
  const body = `${monthLabel}: ${count} post${count === 1 ? "" : "s"} approved in one go.`.slice(0, PREVIEW);
  const href = `/portal/project/${projectId}/social/calendar`;

  await prisma.$transaction(
    userIds.map((userId) =>
      prisma.studioNotification.create({
        data: { userId, kind: "CALENDAR_MONTH_APPROVED", title, body, href },
      }),
    ),
  );
}

const TEAM_MENTION_IN_APP_BODY_MAX = 8000;

function teamChatMentionEmailHtml(opts: {
  authorDisplay: string;
  sentAtLabel: string;
  messageBody: string;
  openChatUrl: string;
}): string {
  const msg = escapeHtml(opts.messageBody);
  return `<!DOCTYPE html><html><body style="font-family:Georgia,serif;background:#f7f4f2;color:#250d18;padding:24px;">
<p style="margin:0 0 12px;font-size:15px;line-height:1.55;">You were mentioned in <strong>internal team chat</strong> (not a client thread).</p>
<p style="margin:0;font-size:15px;line-height:1.55;"><strong>${escapeHtml(opts.authorDisplay)}</strong> mentioned you.</p>
<p style="margin:8px 0 0;font-size:14px;color:#5c4a4e;">Sent: ${escapeHtml(opts.sentAtLabel)}</p>
<div style="margin:20px 0;padding:16px;background:#fff;border:1px solid #e8e0dc;border-radius:8px;">
<p style="margin:0;font-size:14px;line-height:1.6;white-space:pre-wrap;color:#250d18;">${msg}</p>
</div>
<p style="margin:24px 0 0;"><a href="${escapeHtml(opts.openChatUrl)}" style="display:inline-block;padding:12px 20px;background:#250d18;color:#f7f4f2;text-decoration:none;font-size:14px;border-radius:4px;font-weight:600;">Open team chat</a></p>
<p style="margin:20px 0 0;font-size:12px;color:#8a787c;">— Collectiv. Studio · Agency portal</p>
</body></html>`;
}

/**
 * Internal team chat @mentions only — in-app notification + one email per tagged teammate (not the author).
 */
export async function notifyStudioTeamMention(
  mentionedUserIds: string[],
  authorDisplay: string,
  messageBody: string,
  authorUserId: string,
): Promise<void> {
  const unique = Array.from(new Set(mentionedUserIds)).filter((id) => id && id !== authorUserId);
  if (unique.length === 0) return;

  const title = `${authorDisplay} mentioned you in team chat`.slice(0, 200);
  const inAppBody = messageBody.slice(0, TEAM_MENTION_IN_APP_BODY_MAX);
  const href = "/portal#studio-team-chat";
  const sentAt = new Date();
  const sentAtLabel = sentAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
  const openChatUrl = `${getPortalPublicOrigin()}/portal#studio-team-chat`;

  await prisma.$transaction(
    unique.map((userId) =>
      prisma.studioNotification.create({
        data: { userId, kind: "TEAM_MENTION", title, body: inAppBody, href },
      }),
    ),
  );
  revalidatePath("/portal");

  const recipients = await prisma.user.findMany({
    where: { id: { in: unique } },
    select: { id: true, email: true },
  });

  const subject = `${authorDisplay} mentioned you in team chat`.slice(0, 200);
  const html = teamChatMentionEmailHtml({
    authorDisplay,
    sentAtLabel,
    messageBody,
    openChatUrl,
  });

  for (const r of recipients) {
    const to = r.email?.trim().toLowerCase();
    if (!to) continue;
    await sendResendEmail({ to, subject, html });
  }

  if (!process.env.RESEND_API_KEY?.trim() && process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.log(
      "[portal] Team chat @mention emails skipped (set RESEND_API_KEY). In-app notifications created for:",
      unique,
    );
  }
}

/** May (or fallback) — remind to finish upcoming month’s placeholders before the month starts. */
export async function notifyStudioTeamSocialMonthFillReminder(
  projectId: string,
  projectName: string,
  targetMonthYm: string,
  awaitingCount: number,
): Promise<void> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { assignedStudioUserId: true },
  });
  if (!project) return;

  const team = await loadStudioTeamForNotify();
  const userIds = recipientUserIdsForCalendarFeedback(project, team);
  if (userIds.length === 0) return;

  const title = `Finish ${targetMonthYm} social content · ${projectName}`.slice(0, 200);
  const body = `${awaitingCount} post${awaitingCount === 1 ? "" : "s"} still in draft or awaiting content — submit the month to the client before the month starts.`.slice(
    0,
    PREVIEW,
  );
  const href = `/portal/project/${projectId}/social/calendar`;

  await prisma.$transaction(
    userIds.map((userId) =>
      prisma.studioNotification.create({
        data: { userId, kind: "SOCIAL_MONTH_FILL_REMINDER", title, body, href },
      }),
    ),
  );
}

/** Issy: in-portal contract signed — in-app notification + email (if Resend configured). */
export async function notifyIssyClientSignedContractInPortal(opts: {
  projectId: string;
  projectName: string;
  signedName: string;
  signedAt: Date;
  signedIp: string;
}): Promise<void> {
  const { projectId, projectName, signedName, signedAt, signedIp } = opts;
  const issyMembers = await prisma.studioTeamMember.findMany({
    where: { personaSlug: "isabella" },
    select: { userId: true },
  });
  if (issyMembers.length === 0) return;

  const title = `Contract signed · ${projectName}`.slice(0, 200);
  const when = signedAt.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  const body = `${signedName} · ${when} · IP ${signedIp}`.slice(0, PREVIEW);
  const href = `/portal/project/${projectId}#agency-onboarding`;

  await prisma.$transaction(
    issyMembers.map((m) =>
      prisma.studioNotification.create({
        data: { userId: m.userId, kind: "CLIENT_CONTRACT_SIGNED_PORTAL", title, body, href },
      }),
    ),
  );
  revalidatePath("/portal");

  const issyUsers = await prisma.user.findMany({
    where: { id: { in: issyMembers.map((m) => m.userId) } },
    select: { email: true },
  });
  const explicitTo = process.env.STUDIO_NOTIFICATION_EMAIL?.trim();
  const fallbackTo = Array.from(studioEmailSet())[0];
  const extraTo = explicitTo || fallbackTo;
  const toSet = new Set<string>();
  for (const u of issyUsers) {
    if (u.email?.trim()) toSet.add(u.email.trim().toLowerCase());
  }
  if (extraTo) toSet.add(extraTo.toLowerCase());
  const recipients = Array.from(toSet);
  if (recipients.length === 0) return;

  const openUrl = `${getPortalPublicOrigin()}/portal/project/${projectId}#agency-onboarding`;
  const html = `<!DOCTYPE html><html><body style="font-family:Georgia,serif;background:#f7f4f2;color:#250d18;padding:24px;">
<p style="margin:0 0 12px;font-size:15px;">A client signed their contract in the portal.</p>
<p style="margin:0;font-size:15px;line-height:1.55;"><strong>Project:</strong> ${escapeHtml(projectName)}</p>
<p style="margin:8px 0 0;font-size:15px;line-height:1.55;"><strong>Signed as:</strong> ${escapeHtml(signedName)}</p>
<p style="margin:8px 0 0;font-size:15px;line-height:1.55;"><strong>When:</strong> ${escapeHtml(when)}</p>
<p style="margin:8px 0 0;font-size:15px;line-height:1.55;"><strong>IP:</strong> ${escapeHtml(signedIp)}</p>
<p style="margin:24px 0 0;"><a href="${escapeHtml(openUrl)}" style="display:inline-block;padding:12px 20px;background:#250d18;color:#f7f4f2;text-decoration:none;font-size:14px;border-radius:4px;">Open project</a></p>
</body></html>`;

  await sendResendEmail({
    to: recipients,
    subject: `Contract signed: ${projectName}`,
    html,
  });
}

/** Parse project id from notification deep link (`/portal/project/:id/...`). */
export function projectIdFromStudioNotificationHref(href: string | null | undefined): string | null {
  const m = href?.match(/\/portal\/project\/([^/#?]+)/);
  return m?.[1] ?? null;
}
