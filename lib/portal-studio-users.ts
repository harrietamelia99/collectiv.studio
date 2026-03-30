/** Emails that count as studio/agency staff (comma-separated in STUDIO_EMAIL). */
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

export function isStudioEmailAddress(email: string | null | undefined): boolean {
  if (!email) return false;
  return studioEmailSet().has(email.trim().toLowerCase());
}
