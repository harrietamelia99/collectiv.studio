import { agencyTodoDueInCalendarDays } from "@/lib/agency-todo-deadlines";
import { prisma } from "@/lib/prisma";
import type { PersonaSlug } from "@/lib/studio-team-config";
import { syncStudioTeamFromEnv } from "@/lib/studio-team-sync";

async function assigneeForPersona(persona: PersonaSlug): Promise<string | null> {
  await syncStudioTeamFromEnv();
  const row = await prisma.studioTeamMember.findUnique({
    where: { personaSlug: persona },
    select: { userId: true },
  });
  return row?.userId ?? null;
}

export async function createAgencyTodoForPersona(
  persona: PersonaSlug,
  input: {
    projectId?: string | null;
    title: string;
    body?: string;
    kind?: string;
    /** Set explicitly; `null` means no due date. If omitted, `dueInCalendarDays` is used. */
    dueDate?: Date | null;
    /** Default 5 when `dueDate` is omitted. */
    dueInCalendarDays?: number;
  },
): Promise<void> {
  const assigneeUserId = await assigneeForPersona(persona);
  if (!assigneeUserId) return;

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

/** Client portal messages default to Issy (ops / client comms). */
export async function appendClientMessageTodo(projectId: string, projectName: string, preview: string): Promise<void> {
  const assigneeUserId = await assigneeForPersona("isabella");
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
  await createAgencyTodoForPersona("may", {
    projectId,
    kind: "CLIENT_CAL_SIGNOFF",
    title: `Calendar post signed off · ${label}`,
    body: "Client approved a calendar item — schedule or adjust the next deliverable. Issy oversees overall flow if you need alignment.",
    dueInCalendarDays: 3,
  });
  await createAgencyTodoForPersona("isabella", {
    projectId,
    kind: "CLIENT_CAL_SIGNOFF_OPS",
    title: `Calendar sign-off (handoff) · ${label}`,
    body: "Client signed off a calendar post. May owns social production & sign-off; keep flow visible and nudge if needed (Issy oversees).",
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
    await createAgencyTodoForPersona("harriet", {
      projectId,
      kind: `REVIEW_SIGNOFF_${k}`,
      title: `${k === "BRANDING" ? "Branding" : "Signage"} signed off · ${label}`,
      body: "Client approved a review asset. Plan next creative steps or final files.",
      dueInCalendarDays: 5,
    });
    await createAgencyTodoForPersona("isabella", {
      projectId,
      kind: `REVIEW_SIGNOFF_${k}_OPS`,
      title: `Review sign-off · ${label} (${k})`,
      body: "Client signed off a review round. Coordinate files, invoicing, or delivery with the client.",
      dueInCalendarDays: 5,
    });
    return;
  }

  await createAgencyTodoForPersona("isabella", {
    projectId,
    kind: "REVIEW_SIGNOFF_GENERAL",
    title: `Review asset signed off · ${label}`,
    body: "Client approved a shared review file. Follow up on next steps.",
    dueInCalendarDays: 5,
  });
}

export async function notifyWebsiteKitSignedOff(projectId: string, projectName: string): Promise<void> {
  const label = projectLabel(projectName, projectId);
  await createAgencyTodoForPersona("harriet", {
    projectId,
    kind: "WEBSITE_KIT_SIGNED",
    title: `Website kit signed off · ${label}`,
    body: "Client signed off the website kit. Align on build, launch checklist, or amends.",
    dueInCalendarDays: 7,
  });
  await createAgencyTodoForPersona("isabella", {
    projectId,
    kind: "WEBSITE_KIT_SIGNED_OPS",
    title: `Website kit complete · ${label}`,
    body: "Client signed off the website kit. Confirm hosting, DNS, and client comms.",
    dueInCalendarDays: 7,
  });
}

export async function notifySocialOnboardingSubmitted(projectId: string, projectName: string): Promise<void> {
  const label = projectLabel(projectName, projectId);
  await createAgencyTodoForPersona("may", {
    projectId,
    kind: "SOCIAL_ONBOARDING",
    title: `Social brief submitted · ${label}`,
    body: "Client completed the social onboarding questionnaire. Review and plan content or discovery.",
    dueInCalendarDays: 5,
  });
  await createAgencyTodoForPersona("isabella", {
    projectId,
    kind: "SOCIAL_ONBOARDING_OPS",
    title: `Social onboarding in · ${label}`,
    body: "Client submitted social onboarding. You run project flow & client comms — loop May in for calendar/production; she reports into this flow.",
    dueInCalendarDays: 5,
  });
}

export async function notifyInspirationLinksUpdated(projectId: string, projectName: string): Promise<void> {
  const label = projectLabel(projectName, projectId);
  await createAgencyTodoForPersona("harriet", {
    projectId,
    kind: "INSPIRATION_LINKS",
    title: `Inspiration links updated · ${label}`,
    body: "Client added or changed inspiration links. Review for creative direction.",
    dueInCalendarDays: 5,
  });
  await createAgencyTodoForPersona("isabella", {
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
  await createAgencyTodoForPersona("isabella", {
    projectId,
    kind: "OFFBOARDING_REVIEW",
    title: `Testimonial submitted · ${label}`,
    body: "Client left an offboarding review. Thank them and update CRM or case study pipeline.",
    dueInCalendarDays: 7,
  });
  await createAgencyTodoForPersona("harriet", {
    projectId,
    kind: "OFFBOARDING_REVIEW_CREATIVE",
    title: `New testimonial · ${label}`,
    body: "Client submitted a review. Consider featuring it on the site or portfolio.",
    dueInCalendarDays: 7,
  });
}
