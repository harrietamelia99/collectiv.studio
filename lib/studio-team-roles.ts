import { isPersonaSlug, type PersonaSlug } from "@/lib/studio-team-config";

/**
 * Stored on `StudioTeamMember.studioRole`. Drives portal permissions (not `personaSlug`).
 * `personaSlug` remains for display, headshots, and @-mention handles where set.
 */
export const STUDIO_TEAM_ROLE = {
  ISSY: "ISSY",
  HARRIET: "HARRIET",
  SOCIAL_MANAGER: "SOCIAL_MANAGER",
} as const;

export type StudioTeamRole = (typeof STUDIO_TEAM_ROLE)[keyof typeof STUDIO_TEAM_ROLE];

/** JWT / NextAuth session — mirrors DB roles (MAY replaced by SOCIAL_MANAGER). */
export type AgencyPortalRole = "ISSY" | "HARRIET" | "SOCIAL_MANAGER";

const VALID_STUDIO_ROLES = new Set<string>(Object.values(STUDIO_TEAM_ROLE));

export function isStudioTeamRole(v: string | null | undefined): v is StudioTeamRole {
  return v != null && VALID_STUDIO_ROLES.has(v);
}

export function agencyPortalRoleFromStudioRole(studioRole: string | null | undefined): AgencyPortalRole | null {
  if (!studioRole) return null;
  if (studioRole === STUDIO_TEAM_ROLE.ISSY) return "ISSY";
  if (studioRole === STUDIO_TEAM_ROLE.HARRIET) return "HARRIET";
  if (studioRole === STUDIO_TEAM_ROLE.SOCIAL_MANAGER) return "SOCIAL_MANAGER";
  return null;
}

export function isSocialManagerAgencyRole(role: AgencyPortalRole | null | undefined): boolean {
  return role === "SOCIAL_MANAGER";
}

export function isIssyAgencyRole(role: AgencyPortalRole | null | undefined): boolean {
  return role === "ISSY";
}

/** Map DB role (+ optional slug) to legacy persona keys used for welcome copy / headshot fallbacks. */
export function dashboardPersonaSlugForStudioMember(
  studioRole: string | null | undefined,
  personaSlug: string | null | undefined,
): PersonaSlug {
  if (studioRole === STUDIO_TEAM_ROLE.ISSY) return "isabella";
  if (studioRole === STUDIO_TEAM_ROLE.HARRIET) return "harriet";
  if (studioRole === STUDIO_TEAM_ROLE.SOCIAL_MANAGER) return "may";
  if (personaSlug && isPersonaSlug(personaSlug)) return personaSlug;
  return "isabella";
}
