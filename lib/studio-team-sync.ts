import { prisma } from "@/lib/prisma";
import { type PersonaSlug, PERSONA_DEFAULT_JOB_TITLE } from "@/lib/studio-team-config";

/**
 * Ensures `StudioTeamMember` rows exist for env-mapped logins (STUDIO_PERSONA_*_EMAIL).
 * Idempotent; safe to call on studio portal load.
 */
export async function syncStudioTeamFromEnv(): Promise<void> {
  const pairs: { slug: PersonaSlug; envKey: string }[] = [
    { slug: "isabella", envKey: "STUDIO_PERSONA_ISABELLA_EMAIL" },
    { slug: "harriet", envKey: "STUDIO_PERSONA_HARRIET_EMAIL" },
    { slug: "may", envKey: "STUDIO_PERSONA_MAY_EMAIL" },
  ];

  for (const { slug, envKey } of pairs) {
    const raw = process.env[envKey]?.trim().toLowerCase();
    if (!raw) continue;

    const user = await prisma.user.findUnique({ where: { email: raw } });
    if (!user) continue;

    await prisma.studioTeamMember.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        personaSlug: slug,
        jobTitle: PERSONA_DEFAULT_JOB_TITLE[slug],
        availabilityNote: "",
      },
      update: { personaSlug: slug },
    });
  }
}
