/** Emails explicitly listed as studio/agency staff (comma-separated `STUDIO_EMAIL`). Optional extra allowlist on top of DB `StudioTeamMember` rows. */
export function studioEmailSet(): Set<string> {
  const raw = process.env.STUDIO_EMAIL?.trim();
  if (!raw) return new Set();
  return new Set(
    raw
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  );
}

/** True if the address appears in `STUDIO_EMAIL` (sync; does not query the database). */
export function isEnvListedStudioEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return studioEmailSet().has(email.trim().toLowerCase());
}

/**
 * Studio-owned email for client notification routing — env list only.
 * Client alerts must not target addresses that are only agency staff via DB; use async checks where full staff resolution matters.
 */
export function isStudioEmailAddress(email: string | null | undefined): boolean {
  return isEnvListedStudioEmail(email);
}
