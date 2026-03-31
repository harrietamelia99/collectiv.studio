import { prisma } from "@/lib/prisma";
import { isPersonaSlug, PERSONA_ASSIGNEE_OPTION_HINT } from "@/lib/studio-team-config";
import { STUDIO_TEAM_ROLE } from "@/lib/studio-team-roles";

export type StudioAdminSelectUser = {
  id: string;
  email: string;
  name: string | null;
  studioTeamProfile: { welcomeName: string | null; personaSlug: string; studioRole: string } | null;
};

/** Registered users with a studio team profile — assignee pickers (not env-list-only). */
export async function loadStudioAdminUserOptions(): Promise<StudioAdminSelectUser[]> {
  return prisma.user.findMany({
    where: { studioTeamProfile: { isNot: null } },
    orderBy: { email: "asc" },
    select: {
      id: true,
      email: true,
      name: true,
      studioTeamProfile: { select: { welcomeName: true, personaSlug: true, studioRole: true } },
    },
  });
}

export function studioAdminDisplayLabel(u: StudioAdminSelectUser): string {
  const w = u.studioTeamProfile?.welcomeName?.trim();
  if (w) return w;
  const first = u.name?.trim().split(/\s+/)[0];
  if (first) return first;
  return u.email.split("@")[0] ?? u.email;
}

/** One-line role hint for assignee &lt;select&gt; options. */
export function studioAdminRoleHint(
  personaSlug: string | null | undefined,
  studioRole?: string | null,
): string | null {
  if (studioRole === STUDIO_TEAM_ROLE.SOCIAL_MANAGER) return PERSONA_ASSIGNEE_OPTION_HINT.may;
  if (studioRole === STUDIO_TEAM_ROLE.ISSY) return PERSONA_ASSIGNEE_OPTION_HINT.isabella;
  if (studioRole === STUDIO_TEAM_ROLE.HARRIET) return PERSONA_ASSIGNEE_OPTION_HINT.harriet;
  if (!personaSlug || !isPersonaSlug(personaSlug)) return null;
  return PERSONA_ASSIGNEE_OPTION_HINT[personaSlug];
}
