import {
  BRANDING_STEP_SLUGS,
  PRINT_STEP_SLUGS,
  SIGNAGE_STEP_SLUGS,
  WEBSITE_STEP_SLUGS,
  type WorkflowStream,
} from "@/lib/portal-workflow";

const STREAM_BASE: Record<WorkflowStream, string> = {
  website: "website",
  branding: "branding",
  signage: "signage",
  print: "print",
};

function slugList(stream: WorkflowStream): readonly string[] {
  if (stream === "website") return WEBSITE_STEP_SLUGS;
  if (stream === "branding") return BRANDING_STEP_SLUGS;
  if (stream === "signage") return SIGNAGE_STEP_SLUGS;
  return PRINT_STEP_SLUGS;
}

export function workflowStepNeighbors(
  stream: WorkflowStream,
  projectId: string,
  currentSlug: string,
): { prevHref: string | null; nextHref: string | null } {
  const slugs = slugList(stream);
  const i = slugs.indexOf(currentSlug);
  const base = `/portal/project/${projectId}/${STREAM_BASE[stream]}`;
  if (i < 0) return { prevHref: null, nextHref: null };
  const prevHref = i > 0 ? `${base}/${slugs[i - 1]}` : null;
  const nextHref = i < slugs.length - 1 ? `${base}/${slugs[i + 1]}` : null;
  return { prevHref, nextHref };
}
