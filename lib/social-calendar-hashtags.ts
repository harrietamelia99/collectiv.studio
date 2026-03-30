/** Unique #tags from caption, in order of first appearance (alphanumeric + underscore after #). */
export function extractHashtagsFromCaption(caption: string): string {
  const re = /#([A-Za-z0-9_]+)/g;
  const seen = new Set<string>();
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(caption)) !== null) {
    const tag = `#${m[1]}`;
    const key = tag.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      out.push(tag);
    }
  }
  return out.join(" ");
}

export function resolveHashtagsForPost(
  caption: string,
  storedHashtags: string | null | undefined,
): string {
  const stored = (storedHashtags ?? "").trim();
  if (stored.length > 0) return stored;
  return extractHashtagsFromCaption(caption);
}

/** Split pasted or typed hashtag text into unique #tokens (preserves first-seen casing). */
export function parseHashtagTokens(raw: string): string[] {
  const s = raw.trim();
  if (!s) return [];
  const parts = s.split(/[\s,]+/);
  const seen = new Set<string>();
  const out: string[] = [];
  for (let p of parts) {
    p = p.trim();
    if (!p) continue;
    if (!p.startsWith("#")) p = `#${p.replace(/^#+/, "")}`;
    const key = p.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(p);
  }
  return out;
}
