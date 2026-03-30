import { prisma } from "@/lib/prisma";
import { studioEmailSet } from "@/lib/portal-studio-users";
import { isPersonaSlug, PERSONA_ASSIGNEE_OPTION_HINT } from "@/lib/studio-team-config";

export type StudioAdminSelectUser = {
  id: string;
  email: string;
  name: string | null;
  studioTeamProfile: { welcomeName: string | null; personaSlug: string } | null;
};

/** Every registered user whose email is in `STUDIO_EMAIL` — used for project assignee pickers. */
export async function loadStudioAdminUserOptions(): Promise<StudioAdminSelectUser[]> {
  const emails = Array.from(studioEmailSet());
  if (emails.length === 0) return [];
  return prisma.user.findMany({
    where: { email: { in: emails } },
    orderBy: { email: "asc" },
    select: {
      id: true,
      email: true,
      name: true,
      studioTeamProfile: { select: { welcomeName: true, personaSlug: true } },
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
export function studioAdminRoleHint(personaSlug: string | null | undefined): string | null {
  if (!personaSlug || !isPersonaSlug(personaSlug)) return null;
  return PERSONA_ASSIGNEE_OPTION_HINT[personaSlug];
}
