import { prisma } from "@/lib/prisma";
import { isEnvListedStudioEmail } from "@/lib/portal-studio-users";
import { isPersonaSlug, type PersonaSlug } from "@/lib/studio-team-config";
import { agencyPortalRoleFromStudioRole, type AgencyPortalRole } from "@/lib/studio-team-roles";

export type StudioMemberRolePick = { studioRole: string; personaSlug: string } | null;

function agencyRoleFromPersonaSlug(slug: string | null | undefined): AgencyPortalRole | null {
  if (!slug || !isPersonaSlug(slug)) return null;
  const p = slug as PersonaSlug;
  if (p === "isabella") return "ISSY";
  if (p === "harriet") return "HARRIET";
  if (p === "may") return "SOCIAL_MANAGER";
  return null;
}

/**
 * Map a `StudioTeamMember` row (+ env allowlist) to JWT `agencyRole`.
 * Sync so JWT callback avoids duplicate Prisma round-trips.
 */
export function resolveAgencyRoleFromMember(
  m: StudioMemberRolePick,
  inEnvAllowlist: boolean,
): AgencyPortalRole | null {
  const fromDb = agencyPortalRoleFromStudioRole(m?.studioRole ?? null);
  if (fromDb) return fromDb;
  if (inEnvAllowlist) return "ISSY";
  return agencyRoleFromPersonaSlug(m?.personaSlug ?? null);
}

/**
 * Load member row and resolve agency lane (for `getProjectForSession` when session.agencyRole is stale/null).
 */
export async function resolveAgencyRoleForUserId(
  userId: string,
  email: string | null | undefined,
): Promise<AgencyPortalRole | null> {
  const inEnv = Boolean(email?.trim() && isEnvListedStudioEmail(email));
  const m = await prisma.studioTeamMember.findUnique({
    where: { userId },
    select: { studioRole: true, personaSlug: true },
  });
  return resolveAgencyRoleFromMember(m, inEnv);
}
