export function parseStudioReviewedStepsJson(raw: string | null | undefined): Record<string, string> {
  try {
    const v = JSON.parse(raw || "{}") as unknown;
    if (!v || typeof v !== "object") return {};
    return { ...(v as Record<string, string>) };
  } catch {
    return {};
  }
}

export function studioHasReviewedStep(map: Record<string, string>, key: string): boolean {
  return Boolean(map[key]?.trim());
}
