import { MAX_STORED_ASSET_URL_OR_PATH_LEN } from "@/lib/portal-asset-constants";

function normalizeJsonAssetPathString(s: string): string {
  return s.trim().slice(0, MAX_STORED_ASSET_URL_OR_PATH_LEN);
}

/** Parse `Project.websiteFontPaths` JSON — each entry may be an UploadThing URL or legacy key. */
export function parseWebsiteFontPaths(raw: string | null | undefined): string[] {
  try {
    const v = JSON.parse(raw ?? "[]") as unknown;
    if (!Array.isArray(v)) return [];
    return v
      .filter((x): x is string => typeof x === "string")
      .map((s) => normalizeJsonAssetPathString(s))
      .filter(Boolean);
  } catch {
    return [];
  }
}

/** Parse `Project.websitePageLabels` JSON into a string array. */
export function parseWebsitePageLabels(raw: string | null | undefined, fallbackCount: number): string[] {
  try {
    const v = JSON.parse(raw ?? "[]") as unknown;
    if (!Array.isArray(v)) return padLabels([], fallbackCount);
    const labels = v.filter((x): x is string => typeof x === "string").map((s) => s.trim());
    return padLabels(labels, fallbackCount);
  } catch {
    return padLabels([], fallbackCount);
  }
}

function padLabels(labels: string[], count: number): string[] {
  const out = labels.slice(0, count);
  while (out.length < count) {
    out.push(`Page ${out.length + 1}`);
  }
  return out;
}

export function parsePageImagePaths(raw: string | null | undefined): string[] {
  try {
    const v = JSON.parse(raw ?? "[]") as unknown;
    if (!Array.isArray(v)) return [];
    return v
      .filter((x): x is string => typeof x === "string")
      .map((s) => normalizeJsonAssetPathString(s))
      .filter(Boolean);
  } catch {
    return [];
  }
}
