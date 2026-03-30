export type WorkflowStream = "website" | "branding" | "signage" | "print";

export function parseWorkflowReopenJson(raw: string | null | undefined): Record<string, string[]> {
  if (!raw?.trim()) return {};
  try {
    const v = JSON.parse(raw) as unknown;
    if (!v || typeof v !== "object") return {};
    const out: Record<string, string[]> = {};
    for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
      if (Array.isArray(val)) {
        out[k] = val.filter((x): x is string => typeof x === "string");
      }
    }
    return out;
  } catch {
    return {};
  }
}

export function stringifyWorkflowReopenJson(map: Record<string, string[]>): string {
  return JSON.stringify(map);
}

export function isStepReopenedForClient(stream: WorkflowStream, stepSlug: string, json: string | null | undefined): boolean {
  const m = parseWorkflowReopenJson(json);
  return (m[stream] ?? []).includes(stepSlug);
}
