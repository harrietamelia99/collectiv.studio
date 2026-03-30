export type InspirationLinkKind = "pinterest" | "instagram" | "other";

export type InspirationLink = {
  url: string;
  label: string;
  kind: InspirationLinkKind;
};

const MAX_LINKS = 24;
const MAX_URL_LEN = 2048;
const MAX_LABEL_LEN = 120;

export function detectInspirationKind(url: string): InspirationLinkKind {
  try {
    const h = new URL(url).hostname.replace(/^www\./i, "").toLowerCase();
    if (h === "pin.it" || h.endsWith("pinterest.com") || h.endsWith("pinterest.co.uk")) {
      return "pinterest";
    }
    if (h.endsWith("instagram.com") || h === "instagr.am") {
      return "instagram";
    }
    return "other";
  } catch {
    return "other";
  }
}

function isAllowedUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

export function parseInspirationLinksJson(raw: string): InspirationLink[] {
  try {
    const v = JSON.parse(raw) as unknown;
    if (!Array.isArray(v)) return [];
    const out: InspirationLink[] = [];
    for (const row of v) {
      if (!row || typeof row !== "object") continue;
      const o = row as Record<string, unknown>;
      const url = typeof o.url === "string" ? o.url.trim() : "";
      if (!url || url.length > MAX_URL_LEN || !isAllowedUrl(url)) continue;
      const label = typeof o.label === "string" ? o.label.trim().slice(0, MAX_LABEL_LEN) : "";
      const kindRaw = typeof o.kind === "string" ? o.kind : "";
      const kind: InspirationLinkKind =
        kindRaw === "pinterest" || kindRaw === "instagram" || kindRaw === "other"
          ? kindRaw
          : detectInspirationKind(url);
      out.push({ url, label, kind });
      if (out.length >= MAX_LINKS) break;
    }
    return out;
  } catch {
    return [];
  }
}

export function inspirationKindLabel(kind: InspirationLinkKind): string {
  switch (kind) {
    case "pinterest":
      return "Pinterest";
    case "instagram":
      return "Instagram";
    default:
      return "Link";
  }
}
