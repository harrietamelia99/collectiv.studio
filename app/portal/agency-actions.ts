"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { agencyTodoDueInCalendarDays } from "@/lib/agency-todo-deadlines";
import { prisma } from "@/lib/prisma";
import { isStudioUser } from "@/lib/portal-access";
import { emailNotifyClientContractReadyToSign } from "@/lib/email-notifications";
import { getPortalPublicOrigin, sendClientPortalInviteEmail } from "@/lib/portal-client-email";
import { sessionStudioPersonaIsIssy } from "@/lib/studio-issy-guard";
import {
  parseWorkflowReopenJson,
  stringifyWorkflowReopenJson,
  type WorkflowStream,
} from "@/lib/portal-workflow-reopen";
import { notifyStudioTeamMention } from "@/lib/studio-inbox-notify";
import {
  AGENCY_INBOX_DISMISS_CALENDAR,
  AGENCY_INBOX_DISMISS_THREAD,
  AGENCY_INBOX_THREAD_CALENDAR_KEY,
  canDismissAgencyInboxCalendarItem,
  canDismissAgencyInboxThreadItem,
  studioInboxCalendarDismissReadOk,
  studioInboxThreadDismissReadOk,
} from "@/lib/studio-agency-inbox-dismiss";
import { parseMentionHandles, resolveMentionHandlesToUserIds, type MentionMember } from "@/lib/studio-team-mentions";

function parseYmd(s: string): Date | null {
  const t = s.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(t)) return null;
  const d = new Date(`${t}T12:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function autoTodoSnoozeUntil(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d;
}

export async function completeAgencyTodo(formData: FormData): Promise<void> {
  const todoId = String(formData.get("todoId") ?? "").trim();
  if (!todoId) return;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !isStudioUser(session.user.email)) return;

  const todo = await prisma.agencyTodo.findUnique({ where: { id: todoId } });
  if (!todo || todo.assigneeUserId !== session.user.id) return;

  const isAuto = todo.kind.startsWith("AUTO:");
  await prisma.agencyTodo.update({
    where: { id: todoId },
    data: {
      completedAt: new Date(),
      ...(isAuto ? { autoSnoozedUntil: autoTodoSnoozeUntil() } : { autoSnoozedUntil: null }),
    },
  });
  revalidatePath("/portal");
}

export async function reopenAgencyTodo(formData: FormData): Promise<void> {
  const todoId = String(formData.get("todoId") ?? "").trim();
  if (!todoId) return;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !isStudioUser(session.user.email)) return;

  const todo = await prisma.agencyTodo.findUnique({ where: { id: todoId } });
  if (!todo || todo.assigneeUserId !== session.user.id) return;

  await prisma.agencyTodo.update({
    where: { id: todoId },
    data: { completedAt: null, autoSnoozedUntil: null },
  });
  revalidatePath("/portal");
}

export async function deleteAgencyTodo(formData: FormData): Promise<void> {
  const todoId = String(formData.get("todoId") ?? "").trim();
  if (!todoId) return;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !isStudioUser(session.user.email)) return;

  const todo = await prisma.agencyTodo.findUnique({ where: { id: todoId } });
  if (!todo || todo.assigneeUserId !== session.user.id) return;

  if (todo.kind.startsWith("AUTO:")) {
    await prisma.agencyTodo.update({
      where: { id: todoId },
      data: { completedAt: new Date(), autoSnoozedUntil: autoTodoSnoozeUntil() },
    });
  } else {
    await prisma.agencyTodo.delete({ where: { id: todoId } });
  }
  revalidatePath("/portal");
}

/** Remove a completed task forever (Nice work today — X after confirm). AUTO and manual rows both deleted. */
export async function permanentlyDeleteCompletedAgencyTodo(formData: FormData): Promise<void> {
  const todoId = String(formData.get("todoId") ?? "").trim();
  if (!todoId) return;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !isStudioUser(session.user.email)) return;

  const todo = await prisma.agencyTodo.findUnique({ where: { id: todoId } });
  if (!todo || todo.assigneeUserId !== session.user.id) return;
  if (!todo.completedAt) return;

  await prisma.agencyTodo.delete({ where: { id: todoId } });
  revalidatePath("/portal");
}

export async function addManualAgencyTodo(formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !isStudioUser(session.user.email)) return;

  const title = String(formData.get("title") ?? "").trim();
  if (!title || title.length > 200) return;

  const body = String(formData.get("body") ?? "").trim().slice(0, 8000);
  const dueRaw = String(formData.get("dueDate") ?? "").trim();
  const dueDate = dueRaw ? parseYmd(dueRaw) : agencyTodoDueInCalendarDays(5);

  await prisma.agencyTodo.create({
    data: {
      assigneeUserId: session.user.id,
      title,
      body,
      kind: "manual",
      dueDate,
    },
  });
  revalidatePath("/portal");
}

export async function saveStudioTeamProfile(formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !isStudioUser(session.user.email)) return;

  const member = await prisma.studioTeamMember.findUnique({ where: { userId: session.user.id } });
  if (!member) return;

  const jobTitle = String(formData.get("jobTitle") ?? "").trim().slice(0, 120);
  const welcomeName = String(formData.get("welcomeName") ?? "").trim().slice(0, 80) || null;

  const photoRaw = String(formData.get("photoUrl") ?? "").trim().slice(0, 2048);
  let photoUrl: string | null = null;
  if (photoRaw) {
    try {
      const u = new URL(photoRaw);
      if (u.protocol === "https:") photoUrl = photoRaw;
    } catch {
      /* allow same-site paths e.g. /images/team-harriet.png (About page headshots) */
      if (
        photoRaw.startsWith("/") &&
        !photoRaw.includes("..") &&
        /^\/[\w./-]+$/.test(photoRaw)
      ) {
        photoUrl = photoRaw;
      }
    }
  }

  await prisma.studioTeamMember.update({
    where: { id: member.id },
    data: {
      ...(jobTitle ? { jobTitle } : {}),
      welcomeName,
      photoUrl,
    },
  });
  revalidatePath("/portal");
}

export async function addStudioTimeOff(formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !isStudioUser(session.user.email)) return;

  const start = parseYmd(String(formData.get("startDate") ?? ""));
  const end = parseYmd(String(formData.get("endDate") ?? ""));
  if (!start || !end || end.getTime() < start.getTime()) return;

  const note = String(formData.get("note") ?? "").trim().slice(0, 500);

  await prisma.studioTimeOff.create({
    data: {
      userId: session.user.id,
      startDate: start,
      endDate: end,
      note,
    },
  });
  revalidatePath("/portal");
}

export async function deleteStudioTimeOff(timeOffId: string): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !isStudioUser(session.user.email)) return;

  const row = await prisma.studioTimeOff.findUnique({ where: { id: timeOffId } });
  if (!row || row.userId !== session.user.id) return;

  await prisma.studioTimeOff.delete({ where: { id: timeOffId } });
  revalidatePath("/portal");
}

export async function postStudioTeamChatMessage(formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !isStudioUser(session.user.email)) return;

  const author = await prisma.studioTeamMember.findUnique({
    where: { userId: session.user.id },
    include: { user: { select: { name: true, email: true } } },
  });
  if (!author) return;

  const body = String(formData.get("body") ?? "").trim();
  if (!body || body.length > 4000) return;

  const membersRaw = await prisma.studioTeamMember.findMany({
    include: { user: { select: { name: true, email: true } } },
  });
  const members: MentionMember[] = membersRaw.map((m) => ({
    userId: m.userId,
    personaSlug: m.personaSlug,
    welcomeName: m.welcomeName,
    user: m.user,
  }));

  const handles = parseMentionHandles(body);
  const mentionedUserIds = resolveMentionHandlesToUserIds(handles, members, session.user.id);

  await prisma.studioTeamChatMessage.create({
    data: {
      authorUserId: session.user.id,
      body,
      mentionedUserIds: JSON.stringify(mentionedUserIds),
    },
  });

  const authorDisplay =
    author.welcomeName?.trim() ||
    author.user.name?.trim().split(/\s+/)[0] ||
    author.user.email.split("@")[0] ||
    "Teammate";

  if (mentionedUserIds.length > 0) {
    await notifyStudioTeamMention(mentionedUserIds, authorDisplay, body, session.user.id);
  }

  revalidatePath("/portal");
}

export async function markStudioNotificationRead(notificationId: string): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !isStudioUser(session.user.email)) return;

  const row = await prisma.studioNotification.findUnique({ where: { id: notificationId } });
  if (!row || row.userId !== session.user.id) return;

  await prisma.studioNotification.update({
    where: { id: notificationId },
    data: { readAt: new Date() },
  });
  revalidatePath("/portal");
}

export async function markAllStudioNotificationsRead(): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !isStudioUser(session.user.email)) return;

  await prisma.studioNotification.updateMany({
    where: { userId: session.user.id, readAt: null },
    data: { readAt: new Date() },
  });
  revalidatePath("/portal");
}

export async function deleteStudioNotification(notificationId: string): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !isStudioUser(session.user.email)) return;

  const row = await prisma.studioNotification.findUnique({ where: { id: notificationId } });
  if (!row || row.userId !== session.user.id) return;

  await prisma.studioNotification.delete({ where: { id: notificationId } });
  revalidatePath("/portal");
}

/** Issy: new 7-day invite link + email for a client who has not finished registration yet. */
export async function resendClientPortalInvite(projectId: string): Promise<{ ok: boolean; error?: string }> {
  if (!(await sessionStudioPersonaIsIssy())) {
    return { ok: false, error: "Only Issy can resend client invites." };
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          passwordHash: true,
          firstName: true,
          name: true,
        },
      },
    },
  });
  if (!project?.user?.email) {
    return { ok: false, error: "No client account is linked to this project." };
  }
  if (project.user.passwordHash) {
    return { ok: false, error: "This client has already registered." };
  }

  const token = randomBytes(32).toString("hex");
  const inviteExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const inviteSentAt = new Date();

  await prisma.user.update({
    where: { id: project.user.id },
    data: {
      clientInviteToken: token,
      clientInviteExpiresAt: inviteExpires,
      clientInviteSentAt: inviteSentAt,
    },
  });

  const first = project.user.firstName?.trim() || project.user.name?.trim() || "there";
  const registerUrl = `${getPortalPublicOrigin()}/portal/invite?token=${encodeURIComponent(token)}`;
  await sendClientPortalInviteEmail({
    to: project.user.email,
    firstName: first,
    registerUrl,
  });

  revalidatePath("/portal");
  revalidatePath(`/portal/project/${projectId}`);
  return { ok: true };
}

/** Hide a dashboard inbox row without deleting the underlying thread message or calendar feedback. */
export async function dismissStudioAgencyInboxItem(formData: FormData): Promise<{ ok: boolean }> {
  const kind = String(formData.get("kind") ?? "").trim();
  const projectId = String(formData.get("projectId") ?? "").trim();
  const calendarItemId = String(formData.get("calendarItemId") ?? "").trim();
  const anchorProjectMessageId = String(formData.get("anchorProjectMessageId") ?? "").trim();
  const anchorCalendarUpdatedAtIso = String(formData.get("anchorCalendarUpdatedAt") ?? "").trim();

  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !isStudioUser(session.user.email)) return { ok: false };

  const member = await prisma.studioTeamMember.findUnique({
    where: { userId: session.user.id },
    select: { personaSlug: true },
  });
  const personaSlug = member?.personaSlug ?? "isabella";

  const notifications = await prisma.studioNotification.findMany({
    where: { userId: session.user.id },
    select: { kind: true, href: true, readAt: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 120,
  });

  if (kind === AGENCY_INBOX_DISMISS_THREAD) {
    if (!projectId || !anchorProjectMessageId) return { ok: false };

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { assignedStudioUserId: true, portalKind: true },
    });
    if (!project) return { ok: false };
    if (!canDismissAgencyInboxThreadItem(personaSlug, session.user.id, project)) return { ok: false };
    if (!studioInboxThreadDismissReadOk(projectId, notifications)) return { ok: false };

    const lastClient = await prisma.projectMessage.findFirst({
      where: { projectId, authorRole: "CLIENT" },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });
    if (!lastClient || lastClient.id !== anchorProjectMessageId) return { ok: false };

    await prisma.studioAgencyInboxDismissal.upsert({
      where: {
        userId_kind_projectId_calendarItemId: {
          userId: session.user.id,
          kind: AGENCY_INBOX_DISMISS_THREAD,
          projectId,
          calendarItemId: AGENCY_INBOX_THREAD_CALENDAR_KEY,
        },
      },
      create: {
        userId: session.user.id,
        kind: AGENCY_INBOX_DISMISS_THREAD,
        projectId,
        calendarItemId: AGENCY_INBOX_THREAD_CALENDAR_KEY,
        anchorProjectMessageId: lastClient.id,
      },
      update: {
        anchorProjectMessageId: lastClient.id,
        dismissedAt: new Date(),
      },
    });
    revalidatePath("/portal");
    return { ok: true };
  }

  if (kind === AGENCY_INBOX_DISMISS_CALENDAR) {
    if (!projectId || !calendarItemId || !anchorCalendarUpdatedAtIso) return { ok: false };

    const item = await prisma.contentCalendarItem.findFirst({
      where: { id: calendarItemId, projectId },
      select: {
        id: true,
        updatedAt: true,
        clientFeedback: true,
        project: { select: { assignedStudioUserId: true, portalKind: true } },
      },
    });
    if (!item?.clientFeedback?.trim()) return { ok: false };

    const anchorMs = new Date(anchorCalendarUpdatedAtIso).getTime();
    if (Number.isNaN(anchorMs) || item.updatedAt.getTime() !== anchorMs) return { ok: false };
    if (!canDismissAgencyInboxCalendarItem(personaSlug, session.user.id, item.project)) return { ok: false };
    if (!studioInboxCalendarDismissReadOk(calendarItemId, notifications)) return { ok: false };

    await prisma.studioAgencyInboxDismissal.upsert({
      where: {
        userId_kind_projectId_calendarItemId: {
          userId: session.user.id,
          kind: AGENCY_INBOX_DISMISS_CALENDAR,
          projectId,
          calendarItemId,
        },
      },
      create: {
        userId: session.user.id,
        kind: AGENCY_INBOX_DISMISS_CALENDAR,
        projectId,
        calendarItemId,
        anchorCalendarUpdatedAt: item.updatedAt,
      },
      update: {
        anchorCalendarUpdatedAt: item.updatedAt,
        dismissedAt: new Date(),
      },
    });
    revalidatePath("/portal");
    return { ok: true };
  }

  return { ok: false };
}

export async function updateProjectAssignedStudioAdmin(projectId: string, formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !isStudioUser(session.user.email)) return;

  const viewerMember = session.user.id
    ? await prisma.studioTeamMember.findUnique({
        where: { userId: session.user.id },
        select: { personaSlug: true },
      })
    : null;
  /** Ops lead (Issy) assigns Harriet / May; other studio personas cannot change assignee. */
  if (viewerMember?.personaSlug !== "isabella") return;

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return;

  const raw = String(formData.get("assignedStudioUserId") ?? "").trim();
  let assignedStudioUserId: string | null = null;
  if (raw) {
    const u = await prisma.user.findUnique({ where: { id: raw }, select: { id: true, email: true } });
    if (!u || !isStudioUser(u.email)) return;
    assignedStudioUserId = u.id;
  }

  await prisma.project.update({
    where: { id: projectId },
    data: { assignedStudioUserId },
  });
  revalidatePath("/portal");
  revalidatePath(`/portal/project/${projectId}`);
}

/** Issy: full contract text shown to the client before they sign (per project). */
export async function saveProjectContractTerms(projectId: string, formData: FormData): Promise<void> {
  if (!(await sessionStudioPersonaIsIssy())) return;
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return;
  const text = String(formData.get("contractTermsText") ?? "");
  if (text.length > 500_000) return;
  const prevTrim = (project.contractTermsText ?? "").trim();
  const nextTrim = text.trim();
  await prisma.project.update({
    where: { id: projectId },
    data: { contractTermsText: text },
  });
  revalidatePath(`/portal/project/${projectId}`);

  if (nextTrim && prevTrim.length === 0) {
    const full = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        user: { select: { email: true, name: true, businessName: true, passwordHash: true } },
      },
    });
    const to = full?.user?.email?.trim().toLowerCase();
    if (to && full?.user?.passwordHash) {
      const plain =
        full.user.name?.trim().split(/\s+/)[0] ||
        full.user.businessName?.trim() ||
        "there";
      await emailNotifyClientContractReadyToSign({
        to,
        greeting: plain,
        projectName: full.name,
        projectId,
      });
    }
  }
}

const REOPEN_STREAMS = new Set<string>(["website", "branding", "signage", "print"]);

/** Lets the client edit a completed workflow step again (e.g. brand questionnaire after submit). */
export async function reopenClientWorkflowStep(formData: FormData): Promise<void> {
  const projectId = String(formData.get("projectId") ?? "").trim();
  const stream = String(formData.get("stream") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  if (!projectId || !stream || !slug || !REOPEN_STREAMS.has(stream)) return;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !isStudioUser(session.user.email)) return;

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return;

  const map = parseWorkflowReopenJson(project.portalWorkflowReopenJson);
  const key = stream as WorkflowStream;
  const next = new Set(map[key] ?? []);
  next.add(slug);
  map[key] = Array.from(next);
  await prisma.project.update({
    where: { id: projectId },
    data: { portalWorkflowReopenJson: stringifyWorkflowReopenJson(map) },
  });
  revalidatePath("/portal");
  revalidatePath(`/portal/project/${projectId}`);
  revalidatePath(`/portal/project/${projectId}/${stream}/${slug}`);
}

export async function addProjectInternalNote(projectId: string, formData: FormData): Promise<void> {
  const body = String(formData.get("body") ?? "").trim().slice(0, 8000);
  if (!body) return;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !isStudioUser(session.user.email)) return;
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return;
  await prisma.projectInternalNote.create({
    data: { projectId, authorId: session.user.id, body },
  });
  revalidatePath(`/portal/project/${projectId}`);
}

export async function toggleStudioWorkflowStepReviewed(formData: FormData): Promise<void> {
  const projectId = String(formData.get("projectId") ?? "").trim();
  const stepKey = String(formData.get("stepKey") ?? "").trim();
  if (!projectId || !stepKey) return;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !isStudioUser(session.user.email)) return;
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return;
  let map: Record<string, string> = {};
  try {
    const v = JSON.parse(project.studioReviewedStepsJson || "{}") as unknown;
    if (v && typeof v === "object" && v !== null) map = { ...(v as Record<string, string>) };
  } catch {
    map = {};
  }
  if (map[stepKey]) delete map[stepKey];
  else map[stepKey] = new Date().toISOString();
  await prisma.project.update({
    where: { id: projectId },
    data: { studioReviewedStepsJson: JSON.stringify(map) },
  });
  revalidatePath(`/portal/project/${projectId}`);
}

export async function toggleStudioWebsiteLiveConfirmed(formData: FormData): Promise<void> {
  const projectId = String(formData.get("projectId") ?? "").trim();
  if (!projectId) return;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !isStudioUser(session.user.email)) return;
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return;
  await prisma.project.update({
    where: { id: projectId },
    data: {
      studioWebsiteLiveConfirmedAt: project.studioWebsiteLiveConfirmedAt ? null : new Date(),
    },
  });
  revalidatePath(`/portal/project/${projectId}`);
}
