import { agencyTodoDueInCalendarDays } from "@/lib/agency-todo-deadlines";
import { prisma } from "@/lib/prisma";
import { syncStudioTeamFromEnv } from "@/lib/studio-team-sync";
import { STUDIO_TEAM_ROLE, type StudioTeamRole } from "@/lib/studio-team-roles";

export async function resolveAssigneeUserIdForStudioRole(role: StudioTeamRole): Promise<string | null> {
  await syncStudioTeamFromEnv();
  const row = await prisma.studioTeamMember.findFirst({
    where: { studioRole: role },
    orderBy: { createdAt: "asc" },
    select: { userId: true },
  });
  return row?.userId ?? null;
}

/** Social-lane todos: project’s assigned lead if they are a social manager, else earliest SOCIAL_MANAGER member. */
export async function resolveAssigneeUserIdForSocialManagerLane(projectId: string): Promise<string | null> {
  await syncStudioTeamFromEnv();
  if (projectId) {
    const p = await prisma.project.findUnique({
      where: { id: projectId },
      select: { assignedStudioUserId: true },
    });
    if (p?.assignedStudioUserId) {
      const m = await prisma.studioTeamMember.findUnique({
        where: { userId: p.assignedStudioUserId },
        select: { studioRole: true },
      });
      if (m?.studioRole === STUDIO_TEAM_ROLE.SOCIAL_MANAGER) return p.assignedStudioUserId;
    }
  }
  return resolveAssigneeUserIdForStudioRole(STUDIO_TEAM_ROLE.SOCIAL_MANAGER);
}

async function createAgencyTodoForAssignee(
  assigneeUserId: string,
  input: {
    projectId?: string | null;
    title: string;
    body?: string;
    kind?: string;
    dueDate?: Date | null;
    dueInCalendarDays?: number;
  },
): Promise<void> {
  let resolvedDue: Date | undefined;
  if (input.dueDate === null) resolvedDue = undefined;
  else if (input.dueDate !== undefined) resolvedDue = input.dueDate;
  else resolvedDue = agencyTodoDueInCalendarDays(input.dueInCalendarDays ?? 5);

  await prisma.agencyTodo.create({
    data: {
      assigneeUserId,
      projectId: input.projectId ?? undefined,
      title: input.title.slice(0, 200),
      body: (input.body ?? "").slice(0, 8000),
      kind: (input.kind ?? "auto").slice(0, 64),
      dueDate: resolvedDue,
    },
  });
}

export async function createAgencyTodoForStudioTeamRole(
  role: StudioTeamRole,
  input: {
    projectId?: string | null;
    title: string;
    body?: string;
    kind?: string;
    dueDate?: Date | null;
    dueInCalendarDays?: number;
  },
): Promise<void> {
  const assigneeUserId = await resolveAssigneeUserIdForStudioRole(role);
  if (!assigneeUserId) return;
  await createAgencyTodoForAssignee(assigneeUserId, input);
}

export async function createAgencyTodoForSocialManagerLane(
  projectId: string,
  input: Omit<Parameters<typeof createAgencyTodoForAssignee>[1], "projectId">,
): Promise<void> {
  const assigneeUserId = await resolveAssigneeUserIdForSocialManagerLane(projectId);
  if (!assigneeUserId) return;
  await createAgencyTodoForAssignee(assigneeUserId, { ...input, projectId });
}

/** Client portal messages default to Issy (ops / client comms). */
export async function appendClientMessageTodo(projectId: string, projectName: string, preview: string): Promise<void> {
  const assigneeUserId = await resolveAssigneeUserIdForStudioRole(STUDIO_TEAM_ROLE.ISSY);
  if (!assigneeUserId) return;

  const kind = "CLIENT_MESSAGE";
  const open = await prisma.agencyTodo.findFirst({
    where: { assigneeUserId, projectId, kind, completedAt: null },
    orderBy: { createdAt: "desc" },
  });

  const stamp = new Date().toISOString().slice(0, 16).replace("T", " ");
  const line = `[${stamp}] ${preview.slice(0, 280)}`;
  const messageDue = agencyTodoDueInCalendarDays(2);
  if (open) {
    const nextBody = [open.body, line].filter(Boolean).join("\n").slice(0, 8000);
    await prisma.agencyTodo.update({
      where: { id: open.id },
      data: {
        body: nextBody,
        title: `Client messages · ${projectName}`.slice(0, 200),
        dueDate: messageDue,
      },
    });
    return;
  }

  await prisma.agencyTodo.create({
    data: {
      assigneeUserId,
      projectId,
      title: `New client message · ${projectName}`.slice(0, 200),
      body: line,
      kind,
      dueDate: messageDue,
    },
  });
}

function projectLabel(name: string, projectId: string): string {
  return name || projectId.slice(0, 8);
}

export async function notifyCalendarPostSignedOff(projectId: string, projectName: string): Promise<void> {
  const label = projectLabel(projectName, projectId);
  await createAgencyTodoForSocialManagerLane(projectId, {
    kind: "CLIENT_CAL_SIGNOFF",
    title: `Calendar post signed off · ${label}`,
    body: "Client approved a calendar item — schedule or adjust the next deliverable. Issy oversees overall flow if you need alignment.",
    dueInCalendarDays: 3,
  });
  await createAgencyTodoForStudioTeamRole(STUDIO_TEAM_ROLE.ISSY, {
    projectId,
    kind: "CLIENT_CAL_SIGNOFF_OPS",
    title: `Calendar sign-off (handoff) · ${label}`,
    body: "Client signed off a calendar post. The social lead owns production & sign-off; keep flow visible and nudge if needed (Issy oversees).",
    dueInCalendarDays: 3,
  });
}

export async function notifyReviewAssetSignedOff(
  projectId: string,
  projectName: string,
  assetKind: string,
): Promise<void> {
  const label = projectLabel(projectName, projectId);
  const k = assetKind.toUpperCase();

  if (k === "BRANDING" || k === "SIGNAGE") {
    await createAgencyTodoForStudioTeamRole(STUDIO_TEAM_ROLE.HARRIET, {
      projectId,
      kind: `REVIEW_SIGNOFF_${k}`,
      title: `${k === "BRANDING" ? "Branding" : "Signage"} signed off · ${label}`,
      body: "Client approved a review asset. Plan next creative steps or final files.",
      dueInCalendarDays: 5,
    });
    await createAgencyTodoForStudioTeamRole(STUDIO_TEAM_ROLE.ISSY, {
      projectId,
      kind: `REVIEW_SIGNOFF_${k}_OPS`,
      title: `Review sign-off · ${label} (${k})`,
      body: "Client signed off a review round. Coordinate files, invoicing, or delivery with the client.",
      dueInCalendarDays: 5,
    });
    return;
  }

  await createAgencyTodoForStudioTeamRole(STUDIO_TEAM_ROLE.ISSY, {
    projectId,
    kind: "REVIEW_SIGNOFF_GENERAL",
    title: `Review asset signed off · ${label}`,
    body: "Client approved a shared review file. Follow up on next steps.",
    dueInCalendarDays: 5,
  });
}

export async function notifyWebsiteKitSignedOff(projectId: string, projectName: string): Promise<void> {
  const label = projectLabel(projectName, projectId);
  await createAgencyTodoForStudioTeamRole(STUDIO_TEAM_ROLE.HARRIET, {
    projectId,
    kind: "WEBSITE_KIT_SIGNED",
    title: `Website kit signed off · ${label}`,
    body: "Client signed off the website kit. Align on build, launch checklist, or amends.",
    dueInCalendarDays: 7,
  });
  await createAgencyTodoForStudioTeamRole(STUDIO_TEAM_ROLE.ISSY, {
    projectId,
    kind: "WEBSITE_KIT_SIGNED_OPS",
    title: `Website kit complete · ${label}`,
    body: "Client signed off the website kit. Confirm hosting, DNS, and client comms.",
    dueInCalendarDays: 7,
  });
}

export async function notifySocialOnboardingSubmitted(projectId: string, projectName: string): Promise<void> {
  const label = projectLabel(projectName, projectId);
  await createAgencyTodoForSocialManagerLane(projectId, {
    kind: "SOCIAL_ONBOARDING",
    title: `Social brief submitted · ${label}`,
    body: "Client completed the social onboarding questionnaire. Review and plan content or discovery.",
    dueInCalendarDays: 5,
  });
  await createAgencyTodoForStudioTeamRole(STUDIO_TEAM_ROLE.ISSY, {
    projectId,
    kind: "SOCIAL_ONBOARDING_OPS",
    title: `Social onboarding in · ${label}`,
    body: "Client submitted social onboarding. You run project flow & client comms — loop the social lead in for calendar/production; they report into this flow.",
    dueInCalendarDays: 5,
  });
}

export async function notifyInspirationLinksUpdated(projectId: string, projectName: string): Promise<void> {
  const label = projectLabel(projectName, projectId);
  await createAgencyTodoForStudioTeamRole(STUDIO_TEAM_ROLE.HARRIET, {
    projectId,
    kind: "INSPIRATION_LINKS",
    title: `Inspiration links updated · ${label}`,
    body: "Client added or changed inspiration links. Review for creative direction.",
    dueInCalendarDays: 5,
  });
  await createAgencyTodoForStudioTeamRole(STUDIO_TEAM_ROLE.ISSY, {
    projectId,
    kind: "INSPIRATION_LINKS_OPS",
    title: `Inspiration links · ${label}`,
    body: "Client updated inspiration references. Acknowledge and loop in creative if needed.",
    dueInCalendarDays: 5,
  });
}

/** One-time style repair: open rows without a due date get a deadline from `createdAt` (runs cheaply when no rows need updates). */
export async function backfillOpenAgencyTodosMissingDueDate(): Promise<void> {
  const rows = await prisma.agencyTodo.findMany({
    where: { completedAt: null, dueDate: null },
    select: { id: true, createdAt: true, kind: true },
  });
  for (const r of rows) {
    const days = r.kind === "CLIENT_MESSAGE" ? 2 : 5;
    await prisma.agencyTodo.update({
      where: { id: r.id },
      data: { dueDate: agencyTodoDueInCalendarDays(days, r.createdAt) },
    });
  }
}

export async function notifyOffboardingReviewSubmitted(projectId: string, projectName: string): Promise<void> {
  const label = projectLabel(projectName, projectId);
  await createAgencyTodoForStudioTeamRole(STUDIO_TEAM_ROLE.ISSY, {
    projectId,
    kind: "OFFBOARDING_REVIEW",
    title: `Testimonial submitted · ${label}`,
    body: "Client left an offboarding review. Thank them and update CRM or case study pipeline.",
    dueInCalendarDays: 7,
  });
  await createAgencyTodoForStudioTeamRole(STUDIO_TEAM_ROLE.HARRIET, {
    projectId,
    kind: "OFFBOARDING_REVIEW_CREATIVE",
    title: `New testimonial · ${label}`,
    body: "Client submitted a review. Consider featuring it on the site or portfolio.",
    dueInCalendarDays: 7,
  });
}
