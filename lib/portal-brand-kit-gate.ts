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

/** One query for all projects on the client home list (avoids N per-project counts). */
export async function loadClientWorkflowAccessOptsByProjectId(
  userId: string | null | undefined,
  projectIds: string[],
): Promise<Map<string, ClientWorkflowAccessOptions>> {
  const map = new Map<string, ClientWorkflowAccessOptions>();
  if (!userId || projectIds.length === 0) return map;

  const inProgressBranding = await prisma.project.findMany({
    where: {
      userId,
      portalKind: "BRANDING",
      brandingFinalDeliverablesAcknowledgedAt: null,
    },
    select: { id: true },
  });
  const brandingIds = new Set(inProgressBranding.map((p) => p.id));

  for (const pid of projectIds) {
    const elsewhere = Array.from(brandingIds).some((id) => id !== pid);
    map.set(pid, elsewhere ? { inProgressBrandingElsewhere: true } : {});
  }
  return map;
}
