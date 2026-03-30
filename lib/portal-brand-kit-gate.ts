import { prisma } from "@/lib/prisma";

/** Options that relax sequential locks when the client has an active branding project (brand kit pending elsewhere). */
export type ClientWorkflowAccessOptions = {
  inProgressBrandingElsewhere?: boolean;
};

/** True when the client has another branding project that has not yet completed final files / receipt. */
export async function loadClientWorkflowAccessOpts(
  userId: string | null | undefined,
  currentProjectId: string,
): Promise<ClientWorkflowAccessOptions> {
  if (!userId) return {};
  const n = await prisma.project.count({
    where: {
      userId,
      id: { not: currentProjectId },
      portalKind: "BRANDING",
      brandingFinalDeliverablesAcknowledgedAt: null,
    },
  });
  return n > 0 ? { inProgressBrandingElsewhere: true } : {};
}
