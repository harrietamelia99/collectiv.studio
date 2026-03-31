import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  emailNotifyAssigneesCalendarClientComment,
  emailNotifyAssigneesClientMessage,
  emailNotifyIssyClientSignedContract,
  emailNotifyMayClientApprovedAllPostsForMonth,
  emailNotifyMayClientApprovedSocialPost,
  emailNotifyMayClientRequestedSocialChanges,
  emailNotifyTeamMemberTaggedInChat,
  emailsForUserIds,
  resolveIssyContractNotificationEmails,
} from "@/lib/email-notifications";
import { normalizePortalKind } from "@/lib/portal-project-kind";

const PREVIEW = 240;

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

  const to = await emailsForUserIds(userIds);
  if (to.length > 0) {
    await emailNotifyAssigneesClientMessage({
      recipientEmails: to,
      projectName,
      projectId,
      messagePreview: preview,
    });
  }
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

  await emailNotifyMayClientRequestedSocialChanges({
    projectName,
    projectId,
    calendarItemId,
    postLabel,
    feedbackText: notesPreview,
  });
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

  const to = await emailsForUserIds(userIds);
  if (to.length > 0) {
    await emailNotifyAssigneesCalendarClientComment({
      recipientEmails: to,
      projectName,
      projectId,
      calendarItemId,
      postLabel,
      commentText: commentPreview,
    });
  }
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

  await emailNotifyMayClientApprovedSocialPost({
    projectName,
    projectId,
    calendarItemId,
    postLabel,
  });
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

  await emailNotifyMayClientApprovedAllPostsForMonth({
    projectName,
    projectId,
    monthLabel,
    count,
  });
}

const TEAM_MENTION_IN_APP_BODY_MAX = 8000;

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

  for (const r of recipients) {
    const to = r.email?.trim().toLowerCase();
    if (!to) continue;
    await emailNotifyTeamMemberTaggedInChat({
      to,
      authorDisplay,
      messageBody,
    });
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

  const recipients = await resolveIssyContractNotificationEmails();
  if (recipients.length === 0) return;

  await emailNotifyIssyClientSignedContract({
    projectName,
    projectId,
    signedName,
    signedAtLabel: when,
    signedIp,
    recipientEmails: recipients,
  });
}

export { projectIdFromStudioNotificationHref } from "@/lib/studio-notification-href";
