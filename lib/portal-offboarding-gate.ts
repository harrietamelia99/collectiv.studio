import { redirect } from "next/navigation";
import type { Session } from "next-auth";
import { prisma } from "@/lib/prisma";
import { isStudioUser } from "@/lib/portal-access";
import { clientHasFullPortalAccess } from "@/lib/portal-client-full-access";
import { clientNeedsOffboardingForm } from "@/lib/portal-offboarding";

/**
 * Workstream sub-pages: clients may not use them until offboarding is submitted after wrap-up.
 */
export async function redirectClientIfOffboardingRequired(
  projectId: string,
  session: Session | null,
): Promise<void> {
  if (!session?.user?.id || isStudioUser(session.user.email)) return;

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: session.user.id },
    select: {
      portalKind: true,
      clientVerifiedAt: true,
      clientContractSignedAt: true,
      studioDepositMarkedPaidAt: true,
      studioMarkedCompleteAt: true,
    },
  });
  if (!project) return;

  const review = await prisma.publishedClientReview.findUnique({
    where: { projectId },
    select: { id: true },
  });

  if (
    clientNeedsOffboardingForm({
      studio: false,
      portalUnlockedForClient: clientHasFullPortalAccess(project),
      studioMarkedCompleteAt: project.studioMarkedCompleteAt,
      hasSubmittedReview: Boolean(review),
    })
  ) {
    redirect(`/portal/project/${projectId}`);
  }
}

/** Server actions: block client mutations until offboarding is submitted after wrap-up. */
export async function clientIsBlockedByPendingOffboarding(
  projectId: string,
  userId: string,
): Promise<boolean> {
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
    select: { studioMarkedCompleteAt: true },
  });
  if (!project?.studioMarkedCompleteAt) return false;
  const review = await prisma.publishedClientReview.findUnique({
    where: { projectId },
    select: { id: true },
  });
  return !review;
}
