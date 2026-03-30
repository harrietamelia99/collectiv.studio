import { agencyTodoDueInCalendarDays } from "@/lib/agency-todo-deadlines";
import { clientHasFullPortalAccess } from "@/lib/portal-client-full-access";
import { prisma } from "@/lib/prisma";
import { visiblePortalSections } from "@/lib/portal-project-kind";
import { parseWebsiteFontPaths } from "@/lib/portal-progress";
import type { PersonaSlug } from "@/lib/studio-team-config";
import { syncStudioTeamFromEnv } from "@/lib/studio-team-sync";

function autoKind(projectId: string, persona: PersonaSlug, slug: string): string {
  return `AUTO:${projectId}:${persona}:${slug}`;
}

async function syncPhaseTodo(
  persona: PersonaSlug,
  projectId: string,
  slug: string,
  title: string,
  body: string,
  shouldExist: boolean,
  dueInCalendarDays = 5,
): Promise<void> {
  const member = await prisma.studioTeamMember.findUnique({
    where: { personaSlug: persona },
    select: { userId: true },
  });
  if (!member) return;

  const kind = autoKind(projectId, persona, slug);
  const now = new Date();

  const open = await prisma.agencyTodo.findFirst({
    where: { assigneeUserId: member.userId, kind, completedAt: null },
    select: { id: true, dueDate: true },
  });

  const snoozeActive = await prisma.agencyTodo.findFirst({
    where: {
      assigneeUserId: member.userId,
      kind,
      autoSnoozedUntil: { gt: now },
    },
    select: { id: true },
  });

  if (shouldExist && !open) {
    if (snoozeActive) return;
    const latest = await prisma.agencyTodo.findFirst({
      where: { assigneeUserId: member.userId, kind },
      orderBy: { updatedAt: "desc" },
      select: { id: true, completedAt: true },
    });
    if (latest?.completedAt) {
      await prisma.agencyTodo.update({
        where: { id: latest.id },
        data: {
          completedAt: null,
          autoSnoozedUntil: null,
          dueDate: agencyTodoDueInCalendarDays(dueInCalendarDays),
          title: title.slice(0, 200),
          body: body.slice(0, 8000),
        },
      });
    } else if (!latest) {
      await prisma.agencyTodo.create({
        data: {
          assigneeUserId: member.userId,
          projectId,
          title: title.slice(0, 200),
          body: body.slice(0, 8000),
          kind,
          dueDate: agencyTodoDueInCalendarDays(dueInCalendarDays),
        },
      });
    }
  } else if (shouldExist && open && !open.dueDate) {
    await prisma.agencyTodo.update({
      where: { id: open.id },
      data: { dueDate: agencyTodoDueInCalendarDays(dueInCalendarDays) },
    });
  } else if (!shouldExist && open) {
    await prisma.agencyTodo.update({
      where: { id: open.id },
      data: { completedAt: new Date(), autoSnoozedUntil: null },
    });
  }
}

export type SyncAutoPhaseTodosOptions = { skipTeamSync?: boolean };

/**
 * Creates or auto-completes phase todos from live project state (idempotent).
 * Kinds are `AUTO:{projectId}:{persona}:{slug}` — safe to re-run on every /portal load.
 */
export async function syncAutoPhaseTodosForProject(
  projectId: string,
  options?: SyncAutoPhaseTodosOptions,
): Promise<void> {
  if (!options?.skipTeamSync) await syncStudioTeamFromEnv();

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      calendarItems: { select: { id: true, clientSignedOff: true } },
      reviewAssets: { select: { kind: true, clientSignedOff: true } },
      websitePageBriefs: {
        select: { pageIndex: true, headline: true, bodyCopy: true, imagePaths: true },
      },
    },
  });
  if (!project) return;

  const kindPrefix = `AUTO:${projectId}:`;

  if (project.studioMarkedCompleteAt) {
    await prisma.agencyTodo.updateMany({
      where: { projectId, kind: { startsWith: kindPrefix }, completedAt: null },
      data: { completedAt: new Date(), autoSnoozedUntil: null },
    });
    return;
  }

  const vis = visiblePortalSections(project.portalKind);
  const hasClient = Boolean(project.userId);
  const verified = clientHasFullPortalAccess(project);
  const calendarCount = project.calendarItems.length;
  const pendingCalendarSignoff = project.calendarItems.some((i) => !i.clientSignedOff);

  const fonts = parseWebsiteFontPaths(project.websiteFontPaths);
  const hasBrandKitVisual =
    Boolean(project.websitePrimaryHex?.trim()) && fonts.length > 0 && Boolean(project.websiteLogoPath?.trim());

  const brandingAssets = project.reviewAssets.filter((a) => a.kind === "BRANDING");
  const signageAssets = project.reviewAssets.filter((a) => a.kind === "SIGNAGE");
  const allBrandingSigned =
    brandingAssets.length > 0 && brandingAssets.every((a) => a.clientSignedOff);
  const allSignageSigned = signageAssets.length > 0 && signageAssets.every((a) => a.clientSignedOff);

  const onboardingDone = Boolean(project.socialOnboardingSubmittedAt);

  // --- Issy (isabella) — operations, flow, calendar org, assigning, client comms
  await syncPhaseTodo(
    "isabella",
    projectId,
    "ops_verify_client",
    `Verify client — ${project.name}`,
    "They’ve registered — confirm the account so they can use briefs, uploads, and messages.",
    hasClient && !verified,
    2,
  );

  // --- May — social clients, processes, calendar sign-off (Issy oversees flow)
  await syncPhaseTodo(
    "may",
    projectId,
    "social_add_calendar",
    `Add social posts — ${project.name}`,
    "Client submitted the onboarding form. Add the next month’s content for them to review.",
    vis.social && verified && onboardingDone && calendarCount === 0,
    5,
  );

  await syncPhaseTodo(
    "may",
    projectId,
    "social_signoffs",
    `Calendar awaiting sign-off — ${project.name}`,
    "There are posts the client hasn’t signed off yet — nudge or revise as needed.",
    vis.social && verified && calendarCount > 0 && pendingCalendarSignoff,
    3,
  );

  // --- Harriet — designer & business owner, creative direction
  await syncPhaseTodo(
    "harriet",
    projectId,
    "creative_social_brief",
    `Review social briefing — ${project.name}`,
    "Client finished the onboarding form. Review goals and creative direction before the calendar fills up.",
    vis.social && verified && onboardingDone && calendarCount === 0,
    5,
  );

  await syncPhaseTodo(
    "harriet",
    projectId,
    "creative_brand_kit_web",
    `Review brand kit & site content — ${project.name}`,
    "Client has submitted brand basics (logo, colours, fonts) and is filling the website kit — this is the next creative phase. Review before they sign the kit off.",
    vis.website && verified && hasBrandKitVisual && !project.websiteKitSignedOff,
    7,
  );

  await syncPhaseTodo(
    "harriet",
    projectId,
    "creative_post_kit",
    `Website kit signed — next creative steps — ${project.name}`,
    "Client signed off the kit. Line up build visuals, launch support, or portfolio updates.",
    vis.website && verified && project.websiteKitSignedOff,
    7,
  );

  await syncPhaseTodo(
    "harriet",
    projectId,
    "creative_branding_done",
    `Branding signed off — final files — ${project.name}`,
    "All branding proofs are approved. Prepare final exports and guideline handoff.",
    vis.branding && verified && allBrandingSigned,
    7,
  );

  await syncPhaseTodo(
    "harriet",
    projectId,
    "creative_signage_done",
    `Signage signed off — production — ${project.name}`,
    "Signage artwork is fully signed off. Finalise production files or supplier pass-off.",
    vis.signage && verified && allSignageSigned,
    7,
  );
}

export async function syncAutoPhaseTodosForAllProjects(): Promise<void> {
  await syncStudioTeamFromEnv();
  const rows = await prisma.project.findMany({ select: { id: true } });
  for (const { id } of rows) {
    await syncAutoPhaseTodosForProject(id, { skipTeamSync: true });
  }
}
