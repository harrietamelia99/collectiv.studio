import { normalizePortalKind } from "@/lib/portal-project-kind";

/**
 * Best-effort deep link for studio task rows (auto-phase + notification todos).
 */
export function agencyTodoDeepHref(projectId: string, kind: string, portalKind?: string | null): string {
  const base = `/portal/project/${projectId}`;
  if (kind.startsWith("AUTO:")) {
    const slug = kind.split(":").slice(3).join(":") || "";
    switch (slug) {
      case "ops_verify_client":
        return `${base}#agency-onboarding`;
      case "ops_approve_discovery":
        return `${base}#agency-project-steps`;
      case "social_add_calendar":
      case "social_signoffs":
        return `${base}/social/calendar`;
      case "creative_social_brief":
        return `${base}/social`;
      case "creative_brand_kit_web":
        return `${base}/website/brand-kit`;
      case "creative_post_kit":
        return `${base}/website#website-steps-heading`;
      case "creative_branding_done":
        return `${base}/branding/proofs`;
      case "creative_signage_done":
        return `${base}/signage/proofs`;
      default:
        return base;
    }
  }
  if (kind === "CLIENT_MESSAGE") return base;
  if (kind.startsWith("WEBSITE_KIT_SIGNED")) return `${base}/website/brand-kit`;
  if (kind.startsWith("CLIENT_CAL_SIGNOFF")) return `${base}/social/calendar`;
  if (kind.startsWith("REVIEW_SIGNOFF_BRANDING")) return `${base}/branding/proofs`;
  if (kind.startsWith("REVIEW_SIGNOFF_SIGNAGE")) return `${base}/signage/proofs`;
  if (kind.startsWith("REVIEW_SIGNOFF_GENERAL")) {
    return normalizePortalKind(portalKind ?? "MULTI") === "SIGNAGE"
      ? `${base}/signage/final-files#signage-shared-files`
      : `${base}/deliverables#deliverables-hub-section`;
  }
  if (kind.startsWith("SOCIAL_ONBOARDING")) return `${base}/social`;
  if (kind.startsWith("INSPIRATION_LINKS")) return `${base}#agency-project-steps`;
  return base;
}

/** Titles often end with " — project name" or " · label"; strip for display when we show client separately. (ASCII ` - ` is handled by `splitLeadingClientLabel` for "Client - task" titles.) */
export function splitTrailingTaskTitle(title: string): { summary: string; trailing: string | null } {
  const seps = [" — ", " – ", " · "] as const;
  for (const sep of seps) {
    const i = title.lastIndexOf(sep);
    if (i === -1) continue;
    const summary = title.slice(0, i).trim();
    const trailing = title.slice(i + sep.length).trim();
    if (summary && trailing) return { summary, trailing };
  }
  return { summary: title.trim(), trailing: null };
}
