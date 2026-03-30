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
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}
