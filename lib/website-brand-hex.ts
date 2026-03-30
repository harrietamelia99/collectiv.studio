/**
 * Normalise portal HEX inputs for storage (#RRGGBB) and CSS preview.
 * Strips invisible characters and whitespace; accepts 3- or 6-digit hex with or without #.
 */
export function normalizeWebsiteHexInput(raw: string): string | null {
  const s = raw
    .replace(/[\u200b-\u200d\uFEFF]/g, "")
    .replace(/\s/g, "")
    .replace(/^#/, "");
  if (!s) return null;
  if (/^[0-9a-fA-F]{3}$/.test(s)) {
    return `#${s[0]}${s[0]}${s[1]}${s[1]}${s[2]}${s[2]}`.toLowerCase();
  }
  if (/^[0-9a-fA-F]{6}$/.test(s)) {
    return `#${s.toLowerCase()}`;
  }
  return null;
}
