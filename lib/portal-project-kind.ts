export const PORTAL_KINDS = ["MULTI", "SOCIAL", "WEBSITE", "ONE_OFF", "BRANDING", "SIGNAGE", "PRINT"] as const;
export type PortalKind = (typeof PORTAL_KINDS)[number];

/** Studio may assign these when creating or editing a project (`ONE_OFF` is read-only legacy). */
export const PORTAL_KINDS_STUDIO_ASSIGNABLE = PORTAL_KINDS.filter((k) => k !== "ONE_OFF");

/** `portalKind` values that include the social calendar workstream (Prisma filter). */
export const PORTAL_KINDS_WITH_SOCIAL = ["MULTI", "SOCIAL"] as const;

/** Website / multi-area / one-off — Issy’s oversight scope (excludes social-only retainers). */
export const PORTAL_KINDS_ISSY_PROJECT_SCOPE = [
  "WEBSITE",
  "MULTI",
  "ONE_OFF",
  "BRANDING",
  "SIGNAGE",
  "PRINT",
] as const;

/**
 * Studio “new project” form value only — creates two Project rows (website + social). Never stored as `portalKind`.
 */
export const STUDIO_FORM_WEBSITE_SOCIAL_PAIR = "WEBSITE_SOCIAL_PAIR" as const;

/** Display names for a website + social pair (each becomes its own project / subscription). */
export function websiteSocialPairProjectNames(clientFacingBaseName: string): { website: string; social: string } {
  const base = clientFacingBaseName.trim().slice(0, 168);
  return {
    website: `${base} — Website`.slice(0, 200),
    social: `${base} — Social`.slice(0, 200),
  };
}

export function isPortalKind(value: string): value is PortalKind {
  return (PORTAL_KINDS as readonly string[]).includes(value);
}

export function normalizePortalKind(value: string): PortalKind {
  return isPortalKind(value) ? value : "MULTI";
}

export type PortalSectionKey = "social" | "website" | "branding" | "signage" | "deliverables";

/** Which hub cards / routes are relevant for this project type. */
export function visiblePortalSections(kind: string) {
  const k = normalizePortalKind(kind);
  switch (k) {
    case "SOCIAL":
      return { social: true, website: false, branding: false, signage: false, deliverables: false };
    case "WEBSITE":
      return { social: false, website: true, branding: false, signage: false, deliverables: false };
    case "ONE_OFF":
      return { social: false, website: false, branding: true, signage: true, deliverables: false };
    case "BRANDING":
      // Shared / GENERAL files and payment acknowledgement live on branding final-files, not a separate hub section.
      return { social: false, website: false, branding: true, signage: false, deliverables: false };
    case "SIGNAGE":
      return { social: false, website: false, branding: false, signage: true, deliverables: false };
    case "PRINT":
      return { social: false, website: false, branding: false, signage: false, deliverables: false };
    case "MULTI":
      return { social: true, website: true, branding: true, signage: true, deliverables: false };
    default:
      return { social: true, website: true, branding: true, signage: true, deliverables: false };
  }
}

/** Hub section is part of this project’s portal layout. */
export function projectHasPortalSection(kind: string, section: PortalSectionKey): boolean {
  return visiblePortalSections(kind)[section];
}

/** Server guard: client mutations for social calendar / onboarding. */
export function clientMayUseSocialPortal(kind: string): boolean {
  return projectHasPortalSection(kind, "social");
}

/** Server guard: website pages, sitemap, preview token, kit sign-off. */
export function clientMayUseWebsiteWorkstream(kind: string): boolean {
  return projectHasPortalSection(kind, "website");
}

/**
 * HEX / fonts / logo on the project record: allowed for SOCIAL (brand inputs for content) and whenever the website
 * workstream exists (MULTI / WEBSITE).
 */
export function clientMayEditWebsiteBrandKitFields(kind: string): boolean {
  const k = normalizePortalKind(kind);
  if (k === "SOCIAL" || k === "BRANDING" || k === "SIGNAGE") return true;
  return projectHasPortalSection(kind, "website");
}

/** Server guard: client signing off a review asset. */
export function clientMaySignOffReviewAssetKind(
  portalKind: string,
  assetKind: "BRANDING" | "SIGNAGE" | "GENERAL",
): boolean {
  const vis = visiblePortalSections(portalKind);
  switch (assetKind) {
    case "BRANDING":
      return vis.branding;
    case "SIGNAGE":
      return vis.signage;
    case "GENERAL": {
      const k = normalizePortalKind(portalKind);
      if (k === "SIGNAGE") return vis.signage;
      if (k === "BRANDING" || k === "PRINT") return true;
      if (k === "MULTI" || k === "ONE_OFF") return true;
      return vis.deliverables;
    }
  }
}

/** Client-facing / studio picker label for `portalKind`. */
export function portalKindLabel(kind: string): string {
  switch (normalizePortalKind(kind)) {
    case "WEBSITE":
      return "Website Design Project";
    case "MULTI":
      return "The Pre-Launch Suite Project (Branding, Website Design & Social Media Subscription)";
    case "SIGNAGE":
      return "Signage Project";
    case "PRINT":
      return "Print Project";
    case "SOCIAL":
      return "Social Media Management (subscription)";
    case "BRANDING":
      return "Branding project";
    case "ONE_OFF":
      return "Branding, signage & shared files (legacy combined)";
    default:
      return "Project";
  }
}

/** Short list of client hub work areas (studio copy under “Project type”). */
export function clientVisibleAreasSummary(kind: string): string {
  const k = normalizePortalKind(kind);
  const vis = visiblePortalSections(kind);
  const bits: string[] = [];
  if (vis.social) bits.push("social calendar");
  if (vis.website) bits.push("website kit & launch");
  if (vis.branding) bits.push(k === "BRANDING" ? "branding (four steps through final files)" : "branding review");
  if (vis.signage) bits.push(k === "SIGNAGE" ? "signage workflow (incl. shared files at the end)" : "signage review");
  if (vis.deliverables) bits.push(k === "PRINT" ? "print deliverables" : "shared deliverables");
  return bits.length > 0 ? bits.join(" · ") : "no work areas";
}
