import { MAX_STORED_ASSET_URL_OR_PATH_LEN } from "@/lib/portal-asset-constants";

export const LOGO_VARIATION_KIND_OPTIONS = [
  { value: "secondary", label: "Secondary logo" },
  { value: "submark", label: "Submark" },
  { value: "wordmark", label: "Wordmark" },
  { value: "icon", label: "Icon / symbol" },
  { value: "monogram", label: "Monogram" },
  { value: "other", label: "Other" },
] as const;

const ALLOWED_KINDS: Set<string> = new Set(LOGO_VARIATION_KIND_OPTIONS.map((k) => k.value));

export type WebsiteLogoVariation = {
  path: string;
  kind: string;
  customLabel?: string;
};

export function parseWebsiteLogoVariations(raw: string | null | undefined): WebsiteLogoVariation[] {
  if (!raw?.trim()) return [];
  try {
    const v = JSON.parse(raw) as unknown;
    if (!Array.isArray(v)) return [];
    const out: WebsiteLogoVariation[] = [];
    for (const row of v) {
      if (!row || typeof row !== "object") continue;
      const o = row as Record<string, unknown>;
      const path =
        typeof o.path === "string" ? o.path.trim().slice(0, MAX_STORED_ASSET_URL_OR_PATH_LEN) : "";
      if (!path) continue;
      let kind = typeof o.kind === "string" ? o.kind.trim() : "other";
      if (!ALLOWED_KINDS.has(kind)) kind = "other";
      const customLabel =
        typeof o.customLabel === "string" ? o.customLabel.trim().slice(0, 80) : undefined;
      out.push({
        path,
        kind,
        customLabel: kind === "other" && customLabel ? customLabel : undefined,
      });
    }
    return out;
  } catch {
    return [];
  }
}

export function labelForLogoVariation(v: WebsiteLogoVariation): string {
  if (v.kind === "other" && v.customLabel) return v.customLabel;
  const found = LOGO_VARIATION_KIND_OPTIONS.find((k) => k.value === v.kind);
  return found?.label ?? "Logo variation";
}

export function normalizeVariationKind(kind: string): string {
  const k = kind.trim();
  return ALLOWED_KINDS.has(k) ? k : "other";
}
