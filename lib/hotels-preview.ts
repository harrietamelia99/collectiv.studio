/** When `1`, `/hotels` is public (no preview cookie). Until launch, leave unset. */
export function hotelsExperiencePublic(): boolean {
  return process.env.HOTELS_PUBLIC === "1";
}

export function hotelsPreviewSecret(): string | undefined {
  const s = process.env.HOTELS_PREVIEW_SECRET?.trim().replace(/^["']|["']$/g, "");
  return s || undefined;
}

/** Query strings turn `+` into space — common when secrets are base64. */
export function hotelsAccessMatchesSecret(
  access: string | null | undefined,
  secret: string,
): boolean {
  if (!access) return false;
  const trimmed = access.trim();
  if (trimmed === secret) return true;
  if (trimmed.replace(/ /g, "+") === secret) return true;
  try {
    if (decodeURIComponent(trimmed) === secret) return true;
  } catch {
    /* ignore malformed encoding */
  }
  return false;
}

export const HOTELS_PREVIEW_COOKIE = "cc_hotels_preview";
