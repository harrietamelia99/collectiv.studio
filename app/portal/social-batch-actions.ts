"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import {
  getProjectForSession,
  isStudioUser,
  studioMayAccessProjectSocialCalendar,
  studioMemberMayAccessProject,
} from "@/lib/portal-access";
import { clientHasFullPortalAccess } from "@/lib/portal-client-full-access";
import { clientMayUseSocialPortal, visiblePortalSections } from "@/lib/portal-project-kind";
import { appendCalendarActivityLog } from "@/lib/calendar-activity-log";
import { triggerProjectCalendarRefresh } from "@/lib/calendar-realtime";
import { notifyClientCalendarPostReadyForReview } from "@/lib/portal-client-email";
import {
  parseSocialWeeklyScheduleJson,
  postHasCreativeOrCaption,
  projectUsesBatchSocialCalendar,
} from "@/lib/social-batch-calendar";
import {
  notifyStudioTeamCalendarMonthFullyApproved,
} from "@/lib/studio-inbox-notify";
import { saveProjectUpload, validateUploadExtension } from "@/lib/portal-uploads";
import { normalizeCalendarChannelsFromForm } from "@/lib/calendar-channels";

function revProject(projectId: string) {
  revalidatePath("/portal");
  revalidatePath("/portal/studio-social-calendar");
  revalidatePath(`/portal/project/${projectId}`);
  revalidatePath(`/portal/project/${projectId}/social`);
  revalidatePath(`/portal/project/${projectId}/social/calendar`);
  revalidatePath(`/portal/project/${projectId}/social/planning`);
  void triggerProjectCalendarRefresh(projectId);
}

function canConfigureWeeklySchedule(personaSlug: string | null): boolean {
  return personaSlug === "isabella" || personaSlug === "harriet";
}

function prettyMonthLabel(ym: string): string {
  const m = /^(\d{4})-(\d{2})$/.exec(ym.trim());
  if (!m) return ym;
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  return new Date(y, mo, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

export async function saveSocialWeeklySchedule(projectId: string, formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !isStudioUser(session.user.email) || !session.user.id) return;
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return;
  const sm = await prisma.studioTeamMember.findUnique({
    where: { userId: session.user.id },
    select: { personaSlug: true },
  });
  const slug = sm?.personaSlug ?? null;
  if (!canConfigureWeeklySchedule(slug)) return;
  if (!studioMemberMayAccessProject(project, session.user.id, slug ?? "")) return;
  const vis = visiblePortalSections(project.portalKind);
  if (!vis.social) return;

  const raw = String(formData.get("scheduleJson") ?? "").trim();
  const slots = parseSocialWeeklyScheduleJson(raw);
  await prisma.project.update({
    where: { id: projectId },
    data: {
      socialWeeklyScheduleJson: JSON.stringify(slots),
      socialPlaceholdersGeneratedThroughYm: "",
    },
  });
  revProject(projectId);
}

/**
 * Studio-only: update calendar post copy, hashtags, and creative (legacy + batch workflows).
 * Clients use `saveCalendarItemFeedback` / approve actions only.
 */
export async function saveStudioCalendarPost(projectId: string, itemId: string, formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !isStudioUser(session.user.email) || !session.user.id) return;
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return;
  const sm = await prisma.studioTeamMember.findUnique({
    where: { userId: session.user.id },
    select: { personaSlug: true },
  });
  if (!studioMayAccessProjectSocialCalendar(project, session.user.id, sm?.personaSlug ?? null)) return;

  const vis = visiblePortalSections(project.portalKind);
  if (!vis.social) return;

  const item = await prisma.contentCalendarItem.findFirst({
    where: { id: itemId, projectId },
  });
  if (!item) return;

  const caption = String(formData.get("caption") ?? "").trim().slice(0, 8000);
  const hashtags = String(formData.get("hashtags") ?? "").trim().slice(0, 2000);
  const titleRaw = String(formData.get("title") ?? "").trim();
  const title = titleRaw ? titleRaw.slice(0, 200) : null;

  let imagePath = item.imagePath;
  const file = formData.get("image");
  if (file instanceof File && file.size > 0) {
    const lower = file.name.toLowerCase();
    const asVideo = [".mp4", ".mov", ".webm", ".m4v"].some((x) => lower.endsWith(x));
    const bad = validateUploadExtension(file.name, asVideo ? "video" : "raster");
    if (bad) return;
    const buf = Buffer.from(await file.arrayBuffer());
    if (buf.length > 8 * 1024 * 1024) return;
    imagePath = await saveProjectUpload(projectId, file.name, buf, "socialCalendarCreative");
  }

  const clearImage = String(formData.get("clearImage") ?? "") === "1";
  if (clearImage) imagePath = null;

  const filled = postHasCreativeOrCaption(imagePath, caption);
  const batch = projectUsesBatchSocialCalendar(project.socialWeeklyScheduleJson);

  if (!batch) {
    const channelsJson = JSON.stringify(normalizeCalendarChannelsFromForm(formData));
    const scheduledRaw = String(formData.get("scheduledFor") ?? "").trim();
    let scheduledFor = item.scheduledFor;
    if (scheduledRaw) {
      const d = new Date(scheduledRaw);
      if (!Number.isNaN(d.getTime())) scheduledFor = d;
    }

    await prisma.contentCalendarItem.update({
      where: { id: itemId },
      data: {
        caption,
        hashtags,
        title,
        imagePath,
        channelsJson,
        scheduledFor,
        ...(item.clientSignedOff ? { clientSignedOff: false, signedOffAt: null } : {}),
      },
    });
    revProject(projectId);
    return;
  }

  const st = item.postWorkflowStatus;

  if (["AWAITING_CONTENT", "DRAFT", "REVISION_NEEDED"].includes(st)) {
    const nextStatus = filled ? "DRAFT" : "AWAITING_CONTENT";
    await prisma.contentCalendarItem.update({
      where: { id: itemId },
      data: {
        caption,
        hashtags,
        title,
        imagePath,
        postWorkflowStatus: nextStatus,
        isPlanPlaceholder: !filled,
        ...(nextStatus === "DRAFT" && item.postWorkflowStatus === "REVISION_NEEDED"
          ? { clientFeedback: null, clientSignedOff: false, signedOffAt: null }
          : {}),
      },
    });
    revProject(projectId);
    return;
  }

  if (st === "PENDING_APPROVAL") {
    const changed =
      caption !== item.caption ||
      hashtags !== (item.hashtags ?? "") ||
      title !== item.title ||
      imagePath !== item.imagePath;
    const calendarActivityLogJson = changed
      ? appendCalendarActivityLog(item.calendarActivityLogJson, {
          kind: "studio_edit",
          summary: "Studio updated copy or creative while the post was awaiting client approval",
        })
      : item.calendarActivityLogJson;
    await prisma.contentCalendarItem.update({
      where: { id: itemId },
      data: {
        caption,
        hashtags,
        title,
        imagePath,
        isPlanPlaceholder: !filled,
        calendarActivityLogJson,
      },
    });
    revProject(projectId);
    return;
  }

  if (st === "APPROVED") {
    const nextStatus = filled ? "DRAFT" : "AWAITING_CONTENT";
    await prisma.contentCalendarItem.update({
      where: { id: itemId },
      data: {
        caption,
        hashtags,
        title,
        imagePath,
        postWorkflowStatus: nextStatus,
        isPlanPlaceholder: !filled,
        clientSignedOff: false,
        signedOffAt: null,
        clientFeedback: null,
      },
    });
    revProject(projectId);
  }
}

/** @deprecated Prefer `saveStudioCalendarPost` — kept for call-site compatibility. */
export async function saveBatchCalendarPostDraft(projectId: string, itemId: string, formData: FormData): Promise<void> {
  return saveStudioCalendarPost(projectId, itemId, formData);
}

export async function submitSocialMonthBatchForReview(projectId: string, monthYm: string): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !isStudioUser(session.user.email) || !session.user.id) return;
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project || !projectUsesBatchSocialCalendar(project.socialWeeklyScheduleJson)) return;
  const sm = await prisma.studioTeamMember.findUnique({
    where: { userId: session.user.id },
    select: { personaSlug: true },
  });
  if (!studioMayAccessProjectSocialCalendar(project, session.user.id, sm?.personaSlug ?? null)) return;

  const ym = monthYm.trim();
  if (!/^\d{4}-\d{2}$/.test(ym)) return;

  const rows = await prisma.contentCalendarItem.findMany({
    where: { projectId, planMonthKey: ym, postWorkflowStatus: "DRAFT" },
  });
  if (rows.length === 0) return;

  for (const r of rows) {
    if (!postHasCreativeOrCaption(r.imagePath, r.caption)) return;
  }

  await prisma.contentCalendarItem.updateMany({
    where: {
      projectId,
      planMonthKey: ym,
      postWorkflowStatus: "DRAFT",
    },
    data: { postWorkflowStatus: "PENDING_APPROVAL" },
  });

  await notifyClientCalendarPostReadyForReview(projectId, {
    postLabel: prettyMonthLabel(ym),
    scheduledIso: null,
    channelsJson: "[]",
    variant: "batch_month",
  });

  revProject(projectId);
}

export async function approveAllSocialMonthPosts(projectId: string, monthYm: string): Promise<void> {
  const session = await getServerSession(authOptions);
  const project = await getProjectForSession(projectId, session);
  if (!project || isStudioUser(session?.user?.email) || !clientHasFullPortalAccess(project)) return;
  if (!clientMayUseSocialPortal(project.portalKind)) return;
  if (!projectUsesBatchSocialCalendar(project.socialWeeklyScheduleJson)) return;

  const ym = monthYm.trim();
  if (!/^\d{4}-\d{2}$/.test(ym)) return;

  const result = await prisma.contentCalendarItem.updateMany({
    where: { projectId, planMonthKey: ym, postWorkflowStatus: "PENDING_APPROVAL" },
    data: {
      postWorkflowStatus: "APPROVED",
      clientSignedOff: true,
      signedOffAt: new Date(),
      clientFeedback: null,
    },
  });
  if (result.count > 0) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { name: true },
    });
    if (project) {
      await notifyStudioTeamCalendarMonthFullyApproved(projectId, project.name, prettyMonthLabel(ym), result.count);
    }
  }
  revProject(projectId);
}

/** Studio: send one filled draft (or post-revision draft) to the client for review. */
export async function submitCalendarPostForClientReview(projectId: string, itemId: string): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !isStudioUser(session.user.email) || !session.user.id) return;
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return;
  const sm = await prisma.studioTeamMember.findUnique({
    where: { userId: session.user.id },
    select: { personaSlug: true },
  });
  if (!studioMayAccessProjectSocialCalendar(project, session.user.id, sm?.personaSlug ?? null)) return;

  const item = await prisma.contentCalendarItem.findFirst({
    where: { id: itemId, projectId },
  });
  if (!item) return;
  if (!postHasCreativeOrCaption(item.imagePath, item.caption)) return;
  if (!["DRAFT", "REVISION_NEEDED", "AWAITING_CONTENT"].includes(item.postWorkflowStatus)) return;

  const wasRevision = item.postWorkflowStatus === "REVISION_NEEDED";
  const log = appendCalendarActivityLog(item.calendarActivityLogJson, {
    kind: "studio_resubmit",
    summary: wasRevision ? "Studio resubmitted for client review after revision" : "Studio submitted post for client review",
    snapshot: {
      caption: item.caption,
      hashtags: item.hashtags,
      imagePath: item.imagePath,
      channelsJson: item.channelsJson,
    },
  });

  await prisma.contentCalendarItem.update({
    where: { id: itemId },
    data: {
      postWorkflowStatus: "PENDING_APPROVAL",
      isPlanPlaceholder: false,
      clientSignedOff: false,
      signedOffAt: null,
      calendarActivityLogJson: log,
    },
  });

  const label = (item.title?.trim() || item.caption?.trim() || "Post").slice(0, 160);
  await notifyClientCalendarPostReadyForReview(projectId, {
    postLabel: label,
    scheduledIso: item.scheduledFor?.toISOString() ?? null,
    channelsJson: item.channelsJson,
    variant: wasRevision ? "revised" : "new",
  });

  revProject(projectId);
}
