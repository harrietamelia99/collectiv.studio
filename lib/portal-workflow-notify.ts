import { prisma } from "@/lib/prisma";
import { createClientInAppNotificationForProject } from "@/lib/client-in-app-notify";
import {
  recipientUserIdsForBrandingQuestionnaireSubmitted,
  recipientUserIdsForClientMessage,
} from "@/lib/studio-inbox-notify";

const PREVIEW = 220;

export async function notifyStudioWorkflowStepCompletedByClient(input: {
  projectId: string;
  projectName: string;
  portalKind: string;
  streamLabel: string;
  stepLabel: string;
  stepHref: string;
}): Promise<void> {
  const project = await prisma.project.findUnique({
    where: { id: input.projectId },
    select: { portalKind: true, assignedStudioUserId: true },
  });
  if (!project) return;
  const team = await prisma.studioTeamMember.findMany({
    select: { userId: true, personaSlug: true },
  });
  const userIds = recipientUserIdsForClientMessage(project, team);
  if (userIds.length === 0) return;
  const title = `${input.streamLabel}: ${input.stepLabel} · ${input.projectName}`.slice(0, 200);
  const body = "The client completed this step — open the project to continue.".slice(0, PREVIEW);
  await prisma.$transaction(
    userIds.map((userId) =>
      prisma.studioNotification.create({
        data: {
          userId,
          kind: "WORKFLOW_STEP_CLIENT",
          title,
          body,
          href: input.stepHref,
        },
      }),
    ),
  );
}

/** Brand questionnaire: notify project assignee, or Harriet when unassigned. */
export async function notifyStudioBrandingQuestionnaireSubmitted(input: {
  projectId: string;
  projectName: string;
  stepHref: string;
}): Promise<void> {
  const project = await prisma.project.findUnique({
    where: { id: input.projectId },
    select: { assignedStudioUserId: true },
  });
  if (!project) return;
  const team = await prisma.studioTeamMember.findMany({
    select: { userId: true, personaSlug: true },
  });
  const userIds = recipientUserIdsForBrandingQuestionnaireSubmitted(project, team);
  if (userIds.length === 0) return;
  const title = `Branding: Brand questionnaire · ${input.projectName}`.slice(0, 200);
  const body =
    "Your client has submitted their brand questionnaire — open it when you’re ready for next steps.".slice(0, PREVIEW);
  await prisma.$transaction(
    userIds.map((userId) =>
      prisma.studioNotification.create({
        data: {
          userId,
          kind: "WORKFLOW_STEP_CLIENT",
          title,
          body,
          href: input.stepHref,
        },
      }),
    ),
  );
}

export async function notifyClientWorkflowStepReady(input: {
  projectId: string;
  title: string;
  body?: string;
  href: string;
}): Promise<void> {
  await createClientInAppNotificationForProject(input.projectId, {
    kind: "WORKFLOW_STEP_STUDIO",
    title: input.title.slice(0, 200),
    body: input.body ?? "",
    href: input.href,
  });
}
