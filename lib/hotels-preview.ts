/** When `1`, `/hotels` is public (no preview cookie). Until launch, leave unset. */
export function hotelsExperiencePublic(): boolean {
  return process.env.HOTELS_PUBLIC === "1";
}

export function hotelsPreviewSecret(): string | undefined {
  const s = process.env.HOTELS_PREVIEW_SECRET?.trim();
  return s || undefined;
}

export const HOTELS_PREVIEW_COOKIE = "cc_hotels_preview";
