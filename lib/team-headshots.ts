/**
 * Canonical portrait paths — same files as the About page (`TeamCard`) and marketing home team strip.
 * Place assets in `public/images/`.
 */
export const TEAM_HEADSHOT_PUBLIC_PATH = {
  harriet: "/images/team-harriet.png",
  isabella: "/images/team-isabella.png",
  may: "/images/team-may.png",
} as const;

export type TeamHeadshotPersona = keyof typeof TEAM_HEADSHOT_PUBLIC_PATH;

export function teamHeadshotPathForPersona(personaSlug: string): string | null {
  if (personaSlug in TEAM_HEADSHOT_PUBLIC_PATH) {
    return TEAM_HEADSHOT_PUBLIC_PATH[personaSlug as TeamHeadshotPersona];
  }
  return null;
}

const LINKEDIN_CDN = /linkedin\.com|licdn\.com|media\.licdn/i;

/**
 * Portal avatars: use on-site team PNGs (About page) when there is no custom path, or when the stored
 * value is a LinkedIn-hosted image — so updating `public/images/team-*.png` applies everywhere.
 * Custom photos: set a site-relative path (e.g. `/api/portal/file/...` after upload).
 */
export function resolvePersonaProfilePhoto(
  photoUrl: string | null | undefined,
  personaSlug: string | null | undefined,
): string | null {
  const slug = personaSlug?.trim() ?? "";
  const canonical = teamHeadshotPathForPersona(slug);
  const t = photoUrl?.trim() ?? "";
  if (!t) return canonical;
  if (t.startsWith("/")) return t;
  if (canonical && /^https?:\/\//i.test(t) && LINKEDIN_CDN.test(t)) return canonical;
  return t;
}
