import type { Project, ReviewAsset, WebsitePageBrief } from "@prisma/client";
import type { ClientWorkflowAccessOptions } from "@/lib/portal-brand-kit-gate";
import { parseInspirationLinksJson } from "@/lib/portal-inspiration-links";
import { hasLockedFinalDesignFiles } from "@/lib/portal-final-files";
import { parsePageImagePaths, parseWebsiteFontPaths } from "@/lib/website-kit-pages";
import { clientHasFullPortalAccess } from "@/lib/portal-client-full-access";
import { normalizePortalKind, visiblePortalSections } from "@/lib/portal-project-kind";
import { legacyBrandingQuestionnaireFilled } from "@/lib/brand-questionnaire";
import { isStepReopenedForClient, type WorkflowStream } from "@/lib/portal-workflow-reopen";

export type { WorkflowStream } from "@/lib/portal-workflow-reopen";

export type StepUiStatus =
  | "locked"
  | "in_progress"
  | "awaiting_agency"
  | "awaiting_client"
  | "complete";

export type WorkflowStepDef = {
  slug: string;
  label: string;
  href: string;
};

export type WorkflowStepRow = WorkflowStepDef & {
  status: StepUiStatus;
  complete: boolean;
  locked: boolean;
  /** Client hub tile: replaces the default status hint when set (non-locked rows). */
  hubHintOverride?: string;
};

export const WEBSITE_STEP_SLUGS = ["brand-kit", "content", "preview", "domain"] as const;
export type WebsiteStepSlug = (typeof WEBSITE_STEP_SLUGS)[number];

export const BRANDING_STEP_SLUGS = ["inspiration", "questionnaire", "proofs", "final-files"] as const;
export const SIGNAGE_STEP_SLUGS = ["brand-kit", "inspiration", "specification", "proofs", "final-files"] as const;
export const PRINT_STEP_SLUGS = ["brand-kit", "specification", "inspiration", "proofs", "final-files"] as const;

export type BrandingStepSlug = (typeof BRANDING_STEP_SLUGS)[number];
export type SignageStepSlug = (typeof SIGNAGE_STEP_SLUGS)[number];
export type PrintStepSlug = (typeof PRINT_STEP_SLUGS)[number];

export type AccountBrandKitSlice = {
  websitePrimaryHex: string | null;
  websiteFontPaths: string;
  websiteLogoPath: string | null;
} | null;

function fontsOk(project: Pick<Project, "websiteFontPaths">): boolean {
  return parseWebsiteFontPaths(project.websiteFontPaths).length > 0;
}

function websitePageContentHubProgressPercent(
  project: Pick<
    Project,
    | "portalKind"
    | "clientVerifiedAt"
    | "clientContractSignedAt"
    | "studioDepositMarkedPaidAt"
    | "websitePageCount"
    | "websiteContentSignedOff"
  >,
  pageBriefs: Pick<WebsitePageBrief, "pageIndex" | "headline" | "bodyCopy" | "imagePaths">[] = [],
): number {
  if (!clientHasFullPortalAccess(project)) return 0;
  if (project.websiteContentSignedOff) return 100;
  const n = project.websitePageCount;
  if (n <= 0) return 0;
  const byIndex = new Map(pageBriefs.map((b) => [b.pageIndex, b]));
  let pagesWithContent = 0;
  for (let i = 0; i < n; i++) {
    const b = byIndex.get(i);
    const hasText = Boolean(b?.headline?.trim() || b?.bodyCopy?.trim());
    const hasImg = b ? parsePageImagePaths(b.imagePaths).length > 0 : false;
    if (hasText || hasImg) pagesWithContent++;
  }
  return Math.round((pagesWithContent / n) * 100);
}

export function websiteBrandKitStepComplete(
  project: Pick<
    Project,
    | "portalKind"
    | "clientVerifiedAt"
    | "clientContractSignedAt"
    | "studioDepositMarkedPaidAt"
    | "websiteKitSignedOff"
    | "websitePrimaryHex"
    | "websiteFontPaths"
    | "websiteLogoPath"
  >,
  accountKit: AccountBrandKitSlice = null,
): boolean {
  if (accountKit && accountBrandKitPresent(accountKit)) return true;
  if (!clientHasFullPortalAccess(project)) return false;
  if (project.websiteKitSignedOff) return true;
  return Boolean(
    project.websitePrimaryHex?.trim() && fontsOk(project) && project.websiteLogoPath?.trim(),
  );
}

export function websiteContentStepComplete(
  project: Pick<
    Project,
    | "portalKind"
    | "clientVerifiedAt"
    | "clientContractSignedAt"
    | "studioDepositMarkedPaidAt"
    | "websitePageCount"
    | "websiteContentSignedOff"
  >,
  pageBriefs: Pick<WebsitePageBrief, "pageIndex" | "headline" | "bodyCopy" | "imagePaths">[],
): boolean {
  if (!clientHasFullPortalAccess(project)) return false;
  if (project.websiteContentSignedOff) return true;
  return websitePageContentHubProgressPercent(project, pageBriefs) >= 100;
}

/** Preview done when client signed off and is not waiting on studio for a revision round. */
export function websitePreviewStepComplete(
  project: Pick<
    Project,
    | "portalKind"
    | "clientVerifiedAt"
    | "clientContractSignedAt"
    | "studioDepositMarkedPaidAt"
    | "websitePreviewSignedOff"
  > & {
    websitePreviewClientFeedback?: string | null;
  },
): boolean {
  if (!clientHasFullPortalAccess(project)) return false;
  if (project.websitePreviewClientFeedback?.trim()) return false;
  return project.websitePreviewSignedOff === true;
}

/** Launch step: client confirmed domain / launch plan (requires domain fields in the toggle action). */
export function websiteDomainStepComplete(
  project: Pick<
    Project,
    | "portalKind"
    | "clientVerifiedAt"
    | "clientContractSignedAt"
    | "studioDepositMarkedPaidAt"
    | "websiteLaunchSignedOff"
  >,
): boolean {
  if (!clientHasFullPortalAccess(project)) return false;
  return project.websiteLaunchSignedOff === true;
}

export function brandingInspirationComplete(
  project: Pick<Project, "brandingMoodDescription" | "inspirationLinksJson">,
): boolean {
  const links = parseInspirationLinksJson(project.inspirationLinksJson || "[]");
  if (links.length > 0) return true;
  return Boolean(project.brandingMoodDescription?.trim());
}

export function brandingQuestionnaireComplete(
  project: Pick<Project, "brandingQuestionnaireJson" | "brandingQuestionnaireSubmittedAt">,
): boolean {
  if (project.brandingQuestionnaireSubmittedAt) return true;
  return legacyBrandingQuestionnaireFilled(project.brandingQuestionnaireJson);
}

export function brandingProofsStepComplete(
  project: Pick<Project, "portalKind">,
  assets: Pick<ReviewAsset, "kind" | "clientSignedOff" | "filePath">[],
): boolean {
  const list = assets.filter((a) => a.kind === "BRANDING" && a.filePath);
  if (list.length === 0) {
    if (normalizePortalKind(project.portalKind) !== "BRANDING") return false;
    return assets.some((a) => a.kind === "GENERAL" && a.filePath);
  }
  return list.every((a) => a.clientSignedOff);
}

export function brandingFinalStepComplete(
  project: Pick<Project, "brandingFinalDeliverablesAcknowledgedAt">,
  assets: Pick<ReviewAsset, "kind" | "filePath" | "clientSignedOff">[],
  mergeGeneralDeliverables = false,
): boolean {
  const brandingWithFile = assets.filter((a) => a.kind === "BRANDING" && a.filePath);
  const generalWithFile = assets.filter((a) => a.kind === "GENERAL" && a.filePath);
  const hasWork =
    brandingWithFile.length > 0 || (mergeGeneralDeliverables && generalWithFile.length > 0);
  if (!hasWork) return false;
  if (!project.brandingFinalDeliverablesAcknowledgedAt) return false;
  if (mergeGeneralDeliverables && generalWithFile.length > 0 && !generalWithFile.every((a) => a.clientSignedOff)) {
    return false;
  }
  return true;
}

function accountBrandKitPresent(kit: NonNullable<AccountBrandKitSlice>): boolean {
  return Boolean(
    kit.websitePrimaryHex?.trim() &&
      kit.websiteLogoPath?.trim() &&
      parseWebsiteFontPaths(kit.websiteFontPaths).length > 0,
  );
}

export function signageBrandKitStepComplete(
  project: Pick<Project, "websitePrimaryHex" | "websiteFontPaths" | "websiteLogoPath">,
  accountKit: AccountBrandKitSlice,
): boolean {
  if (accountKit && accountBrandKitPresent(accountKit)) return true;
  return Boolean(
    project.websitePrimaryHex?.trim() && fontsOk(project) && project.websiteLogoPath?.trim(),
  );
}

export function signageInspirationComplete(
  project: Pick<Project, "inspirationLinksJson" | "brandingMoodDescription">,
): boolean {
  const links = parseInspirationLinksJson(project.inspirationLinksJson || "[]");
  if (links.length > 0) return true;
  return Boolean(project.brandingMoodDescription?.trim());
}

export function signageSpecComplete(project: Pick<Project, "signageSpecificationSubmittedAt">): boolean {
  return Boolean(project.signageSpecificationSubmittedAt);
}

export function signageProofsComplete(assets: Pick<ReviewAsset, "kind" | "clientSignedOff" | "filePath">[]): boolean {
  const list = assets.filter((a) => a.kind === "SIGNAGE" && a.filePath);
  if (list.length === 0) return false;
  return list.every((a) => a.clientSignedOff);
}

export function signageFinalComplete(
  project: Pick<Project, "signageFinalDeliverablesAcknowledgedAt" | "clientAcknowledgedFinalPaymentAt">,
  assets: Pick<ReviewAsset, "kind" | "filePath" | "clientSignedOff">[],
): boolean {
  const signageWithFile = assets.filter((a) => a.kind === "SIGNAGE" && a.filePath);
  const generalWithFile = assets.filter((a) => a.kind === "GENERAL" && a.filePath);
  if (signageWithFile.length === 0 && generalWithFile.length === 0) return false;

  if (signageWithFile.length > 0) {
    if (!signageWithFile.every((a) => a.clientSignedOff)) return false;
    if (!project.signageFinalDeliverablesAcknowledgedAt) return false;
  }
  if (generalWithFile.length > 0 && !generalWithFile.every((a) => a.clientSignedOff)) return false;

  const forPayment = [...signageWithFile, ...generalWithFile];
  if (hasLockedFinalDesignFiles(forPayment, project, false)) return false;
  return true;
}

export function printBrandKitStepComplete(
  project: Pick<Project, "websitePrimaryHex" | "websiteFontPaths" | "websiteLogoPath">,
  accountKit: AccountBrandKitSlice,
): boolean {
  return signageBrandKitStepComplete(project, accountKit);
}

export function printSpecComplete(project: Pick<Project, "printSpecificationSubmittedAt">): boolean {
  return Boolean(project.printSpecificationSubmittedAt);
}

export function printInspirationComplete(
  project: Pick<Project, "printInspirationSkipped" | "inspirationLinksJson" | "brandingMoodDescription">,
): boolean {
  if (project.printInspirationSkipped) return true;
  const links = parseInspirationLinksJson(project.inspirationLinksJson || "[]");
  if (links.length > 0) return true;
  return Boolean(project.brandingMoodDescription?.trim());
}

/** Inspiration + mood satisfied for the project type (print includes optional skip). Used after saves and studio notify. */
export function clientInspirationStepSatisfied(
  project: Pick<
    Project,
    "portalKind" | "printInspirationSkipped" | "inspirationLinksJson" | "brandingMoodDescription"
  >,
): boolean {
  const k = normalizePortalKind(project.portalKind);
  if (k === "PRINT") return printInspirationComplete(project);
  return brandingInspirationComplete(project);
}

export function printProofsComplete(assets: Pick<ReviewAsset, "kind" | "clientSignedOff" | "filePath">[]): boolean {
  const list = assets.filter((a) => a.kind === "GENERAL" && a.filePath);
  if (list.length === 0) return false;
  return list.every((a) => a.clientSignedOff);
}

export function printFinalComplete(
  project: Pick<Project, "printFinalDeliverablesAcknowledgedAt" | "clientAcknowledgedFinalPaymentAt">,
  assets: Pick<ReviewAsset, "kind" | "filePath" | "clientSignedOff">[],
): boolean {
  const list = assets.filter((a) => a.kind === "GENERAL" && a.filePath);
  if (list.length === 0) return false;
  if (!list.every((a) => a.clientSignedOff)) return false;
  if (!project.printFinalDeliverablesAcknowledgedAt) return false;
  if (hasLockedFinalDesignFiles(list, project, false)) return false;
  return true;
}

function websiteStepComplete(
  slug: WebsiteStepSlug,
  project: Project,
  pageBriefs: Pick<WebsitePageBrief, "pageIndex" | "headline" | "bodyCopy" | "imagePaths">[],
  accountKit: AccountBrandKitSlice,
): boolean {
  switch (slug) {
    case "brand-kit":
      return websiteBrandKitStepComplete(project, accountKit);
    case "content":
      return websiteContentStepComplete(project, pageBriefs);
    case "preview":
      return websitePreviewStepComplete(project);
    case "domain":
      return websiteDomainStepComplete(project);
    default:
      return false;
  }
}

function brandingStepComplete(slug: BrandingStepSlug, project: Project, assets: ReviewAsset[]): boolean {
  switch (slug) {
    case "inspiration":
      return brandingInspirationComplete(project);
    case "questionnaire":
      return brandingQuestionnaireComplete(project);
    case "proofs":
      return brandingProofsStepComplete(project, assets);
    case "final-files":
      return brandingFinalStepComplete(
        project,
        assets,
        normalizePortalKind(project.portalKind) === "BRANDING",
      );
    default:
      return false;
  }
}

function signageStepComplete(
  slug: SignageStepSlug,
  project: Project,
  assets: ReviewAsset[],
  accountKit: AccountBrandKitSlice,
): boolean {
  switch (slug) {
    case "brand-kit":
      return signageBrandKitStepComplete(project, accountKit);
    case "inspiration":
      return signageInspirationComplete(project);
    case "specification":
      return signageSpecComplete(project);
    case "proofs":
      return signageProofsComplete(assets);
    case "final-files":
      return signageFinalComplete(project, assets);
    default:
      return false;
  }
}

function printStepComplete(
  slug: PrintStepSlug,
  project: Project,
  assets: ReviewAsset[],
  accountKit: AccountBrandKitSlice,
): boolean {
  switch (slug) {
    case "brand-kit":
      return printBrandKitStepComplete(project, accountKit);
    case "specification":
      return printSpecComplete(project);
    case "inspiration":
      return printInspirationComplete(project);
    case "proofs":
      return printProofsComplete(assets);
    case "final-files":
      return printFinalComplete(project, assets);
    default:
      return false;
  }
}

export function streamStepComplete(
  stream: WorkflowStream,
  slug: string,
  project: Project,
  pageBriefs: Pick<WebsitePageBrief, "pageIndex" | "headline" | "bodyCopy" | "imagePaths">[],
  assets: ReviewAsset[],
  accountKit: AccountBrandKitSlice,
  _accessOpts?: ClientWorkflowAccessOptions,
): boolean {
  if (stream === "website") return websiteStepComplete(slug as WebsiteStepSlug, project, pageBriefs, accountKit);
  if (stream === "branding") return brandingStepComplete(slug as BrandingStepSlug, project, assets);
  if (stream === "signage") return signageStepComplete(slug as SignageStepSlug, project, assets, accountKit);
  return printStepComplete(slug as PrintStepSlug, project, assets, accountKit);
}

export function clientMayAccessWorkflowStep(
  stream: WorkflowStream,
  slug: string,
  project: Project,
  studio: boolean,
  pageBriefs: Pick<WebsitePageBrief, "pageIndex" | "headline" | "bodyCopy" | "imagePaths">[],
  assets: ReviewAsset[],
  accountKit: AccountBrandKitSlice,
  accessOpts?: ClientWorkflowAccessOptions,
): boolean {
  if (studio) return true;
  const slugs: readonly string[] =
    stream === "website"
      ? WEBSITE_STEP_SLUGS
      : stream === "branding"
        ? BRANDING_STEP_SLUGS
        : stream === "signage"
          ? SIGNAGE_STEP_SLUGS
          : PRINT_STEP_SLUGS;
  const idx = slugs.indexOf(slug);
  if (idx < 0) return false;
  if (stream === "website" && !project.discoveryApprovedAt && slug !== "brand-kit") return false;
  for (let i = 0; i < idx; i++) {
    const prev = slugs[i]!;
    const bypassBrandKitLock =
      Boolean(accessOpts?.inProgressBrandingElsewhere) &&
      (stream === "website" || stream === "signage" || stream === "print") &&
      prev === "brand-kit" &&
      !streamStepComplete(stream, prev, project, pageBriefs, assets, accountKit, accessOpts);
    if (bypassBrandKitLock) continue;
    if (!streamStepComplete(stream, prev, project, pageBriefs, assets, accountKit, accessOpts)) return false;
  }
  return true;
}

export function clientStepEditable(
  stream: WorkflowStream,
  slug: string,
  project: Project,
  pageBriefs: Pick<WebsitePageBrief, "pageIndex" | "headline" | "bodyCopy" | "imagePaths">[],
  assets: ReviewAsset[],
  accountKit: AccountBrandKitSlice,
  studioViewer: boolean,
  accessOpts?: ClientWorkflowAccessOptions,
): boolean {
  if (studioViewer) return true;
  /** Until the client formally submits, keep the questionnaire editable (covers v2 drafts and legacy four-field saves). */
  if (stream === "branding" && slug === "questionnaire") {
    if (!project.brandingQuestionnaireSubmittedAt) return true;
    return isStepReopenedForClient(stream, slug, project.portalWorkflowReopenJson);
  }
  const complete = streamStepComplete(stream, slug, project, pageBriefs, assets, accountKit, accessOpts);
  if (!complete) return true;
  return isStepReopenedForClient(stream, slug, project.portalWorkflowReopenJson);
}

function hubPercentForStep(complete: boolean, locked: boolean): number {
  if (complete) return 100;
  if (locked) return 0;
  return 40;
}

function websiteStepStatus(
  slug: WebsiteStepSlug,
  project: Project,
  pageBriefs: Pick<WebsitePageBrief, "pageIndex" | "headline" | "bodyCopy" | "imagePaths">[],
  studio: boolean,
  locked: boolean,
  complete: boolean,
): StepUiStatus {
  if (complete) return "complete";
  if (locked && !studio) return "locked";
  if (slug === "preview" && project.websitePreviewClientFeedback?.trim()) return "awaiting_agency";
  return "in_progress";
}

const BRAND_KIT_PENDING_HINT =
  "Your brand kit will be added here once your branding project with Collectiv is complete. You can continue with the next step in the meantime.";

export function buildWebsiteStepRows(
  projectId: string,
  project: Project,
  pageBriefs: Pick<WebsitePageBrief, "pageIndex" | "headline" | "bodyCopy" | "imagePaths">[],
  studio: boolean,
  accountKit: AccountBrandKitSlice = null,
  accessOpts?: ClientWorkflowAccessOptions,
): { steps: WorkflowStepRow[]; completed: number; total: number; percent: number } {
  const base = `/portal/project/${projectId}/website`;
  const defs: WorkflowStepDef[] = [
    { slug: "brand-kit", label: "Brand Kit", href: `${base}/brand-kit` },
    { slug: "content", label: "Website Content", href: `${base}/content` },
    { slug: "preview", label: "Preview & Feedback", href: `${base}/preview` },
    { slug: "domain", label: "Domain & Go Live", href: `${base}/domain` },
  ];
  let completed = 0;
  const steps: WorkflowStepRow[] = defs.map((d) => {
    const slug = d.slug as WebsiteStepSlug;
    const complete = websiteStepComplete(slug, project, pageBriefs, accountKit);
    if (complete) completed++;
    const brandKitPendingBranding =
      !studio && slug === "brand-kit" && Boolean(accessOpts?.inProgressBrandingElsewhere) && !complete;
    const locked =
      !studio &&
      !clientMayAccessWorkflowStep("website", d.slug, project, studio, pageBriefs, [], accountKit, accessOpts);
    const status = websiteStepStatus(slug, project, pageBriefs, studio, locked, complete);
    return {
      ...d,
      complete,
      locked,
      status,
      hubHintOverride: brandKitPendingBranding ? BRAND_KIT_PENDING_HINT : undefined,
    };
  });
  const total = defs.length;
  const percent = total ? Math.round((completed / total) * 100) : 0;
  return { steps, completed, total, percent };
}

function brandingStepStatus(
  slug: BrandingStepSlug,
  project: Project,
  assets: ReviewAsset[],
  studio: boolean,
  locked: boolean,
  complete: boolean,
): StepUiStatus {
  if (complete) return "complete";
  if (locked && !studio) return "locked";
  if (slug === "proofs") {
    const list = assets.filter((a) => a.kind === "BRANDING" && a.filePath);
    if (list.length === 0) return "awaiting_agency";
    if (!list.every((a) => a.clientSignedOff)) return "awaiting_client";
    return "in_progress";
  }
  if (slug === "final-files") {
    const hasFile = assets.some((a) => a.kind === "BRANDING" && a.filePath);
    if (!hasFile) return "awaiting_agency";
    if (!project.brandingFinalDeliverablesAcknowledgedAt) return "awaiting_client";
    return "in_progress";
  }
  return "in_progress";
}

export function buildBrandingStepRows(
  projectId: string,
  project: Project,
  assets: ReviewAsset[],
  studio: boolean,
): { steps: WorkflowStepRow[]; completed: number; total: number; percent: number } {
  const base = `/portal/project/${projectId}/branding`;
  const defs: WorkflowStepDef[] = [
    { slug: "inspiration", label: "Inspiration & Moodboard", href: `${base}/inspiration` },
    { slug: "questionnaire", label: "Brand Questionnaire", href: `${base}/questionnaire` },
    { slug: "proofs", label: "Proofs & Feedback", href: `${base}/proofs` },
    { slug: "final-files", label: "Final Files", href: `${base}/final-files` },
  ];
  let completed = 0;
  const steps: WorkflowStepRow[] = defs.map((d) => {
    const slug = d.slug as BrandingStepSlug;
    const complete = brandingStepComplete(slug, project, assets);
    if (complete) completed++;
    const locked = !studio && !clientMayAccessWorkflowStep("branding", d.slug, project, studio, [], assets, null);
    const status = brandingStepStatus(slug, project, assets, studio, locked, complete);
    return { ...d, complete, locked, status };
  });
  const total = defs.length;
  return { steps, completed, total, percent: total ? Math.round((completed / total) * 100) : 0 };
}

function signageStepStatus(
  slug: SignageStepSlug,
  project: Project,
  assets: ReviewAsset[],
  studio: boolean,
  locked: boolean,
  complete: boolean,
): StepUiStatus {
  if (complete) return "complete";
  if (locked && !studio) return "locked";
  if (slug === "proofs") {
    const list = assets.filter((a) => a.kind === "SIGNAGE" && a.filePath);
    if (list.length === 0) return "awaiting_agency";
    if (!list.every((a) => a.clientSignedOff)) return "awaiting_client";
    return "in_progress";
  }
  if (slug === "final-files") {
    const signageFinal = assets.filter((a) => a.kind === "SIGNAGE" && a.filePath);
    const generalFinal = assets.filter((a) => a.kind === "GENERAL" && a.filePath);
    if (signageFinal.length === 0 && generalFinal.length === 0) return "awaiting_agency";
    if (signageFinal.some((a) => !a.clientSignedOff) || generalFinal.some((a) => !a.clientSignedOff)) {
      return "awaiting_client";
    }
    if (signageFinal.length > 0 && !project.signageFinalDeliverablesAcknowledgedAt) return "awaiting_client";
    const combined = [...signageFinal, ...generalFinal];
    if (hasLockedFinalDesignFiles(combined, project, false)) return "awaiting_client";
    return "in_progress";
  }
  return "in_progress";
}

export function buildSignageStepRows(
  projectId: string,
  project: Project,
  assets: ReviewAsset[],
  accountKit: AccountBrandKitSlice,
  studio: boolean,
  accessOpts?: ClientWorkflowAccessOptions,
): { steps: WorkflowStepRow[]; completed: number; total: number; percent: number } {
  const base = `/portal/project/${projectId}/signage`;
  const defs: WorkflowStepDef[] = [
    { slug: "brand-kit", label: "Brand Kit", href: `${base}/brand-kit` },
    { slug: "inspiration", label: "Inspiration", href: `${base}/inspiration` },
    { slug: "specification", label: "Sign Specification", href: `${base}/specification` },
    { slug: "proofs", label: "Proofs & Feedback", href: `${base}/proofs` },
    { slug: "final-files", label: "Final Files & Order", href: `${base}/final-files` },
  ];
  let completed = 0;
  const steps: WorkflowStepRow[] = defs.map((d) => {
    const slug = d.slug as SignageStepSlug;
    const complete = signageStepComplete(slug, project, assets, accountKit);
    if (complete) completed++;
    const brandKitPendingBranding =
      !studio && slug === "brand-kit" && Boolean(accessOpts?.inProgressBrandingElsewhere) && !complete;
    const locked =
      !studio && !clientMayAccessWorkflowStep("signage", d.slug, project, studio, [], assets, accountKit, accessOpts);
    const status = signageStepStatus(slug, project, assets, studio, locked, complete);
    return {
      ...d,
      complete,
      locked,
      status,
      hubHintOverride: brandKitPendingBranding ? BRAND_KIT_PENDING_HINT : undefined,
    };
  });
  const total = defs.length;
  return { steps, completed, total, percent: total ? Math.round((completed / total) * 100) : 0 };
}

function printStepStatus(
  slug: PrintStepSlug,
  project: Project,
  assets: ReviewAsset[],
  studio: boolean,
  locked: boolean,
  complete: boolean,
): StepUiStatus {
  if (complete) return "complete";
  if (locked && !studio) return "locked";
  if (slug === "proofs") {
    const list = assets.filter((a) => a.kind === "GENERAL" && a.filePath);
    if (list.length === 0) return "awaiting_agency";
    if (!list.every((a) => a.clientSignedOff)) return "awaiting_client";
    return "in_progress";
  }
  if (slug === "final-files") {
    const hasFile = assets.some((a) => a.kind === "GENERAL" && a.filePath);
    if (!hasFile) return "awaiting_agency";
    if (!project.printFinalDeliverablesAcknowledgedAt) return "awaiting_client";
    return "in_progress";
  }
  return "in_progress";
}

export function buildPrintStepRows(
  projectId: string,
  project: Project,
  assets: ReviewAsset[],
  accountKit: AccountBrandKitSlice,
  studio: boolean,
  accessOpts?: ClientWorkflowAccessOptions,
): { steps: WorkflowStepRow[]; completed: number; total: number; percent: number } {
  const base = `/portal/project/${projectId}/print`;
  const defs: WorkflowStepDef[] = [
    { slug: "brand-kit", label: "Brand Kit", href: `${base}/brand-kit` },
    { slug: "specification", label: "Print Specification", href: `${base}/specification` },
    { slug: "inspiration", label: "Inspiration (optional)", href: `${base}/inspiration` },
    { slug: "proofs", label: "Proofs & Feedback", href: `${base}/proofs` },
    { slug: "final-files", label: "Final Files & Order", href: `${base}/final-files` },
  ];
  let completed = 0;
  const steps: WorkflowStepRow[] = defs.map((d) => {
    const slug = d.slug as PrintStepSlug;
    const complete = printStepComplete(slug, project, assets, accountKit);
    if (complete) completed++;
    const brandKitPendingBranding =
      !studio && slug === "brand-kit" && Boolean(accessOpts?.inProgressBrandingElsewhere) && !complete;
    const locked =
      !studio && !clientMayAccessWorkflowStep("print", d.slug, project, studio, [], assets, accountKit, accessOpts);
    const status = printStepStatus(slug, project, assets, studio, locked, complete);
    return {
      ...d,
      complete,
      locked,
      status,
      hubHintOverride: brandKitPendingBranding ? BRAND_KIT_PENDING_HINT : undefined,
    };
  });
  const total = defs.length;
  return { steps, completed, total, percent: total ? Math.round((completed / total) * 100) : 0 };
}

export function workflowStepRowsToHubCards(rows: WorkflowStepRow[]): {
  hubKey: string;
  href: string;
  title: string;
  subtitle: string;
  percent: number;
  hint: string;
  locked: boolean;
}[] {
  const statusHint: Record<StepUiStatus, string> = {
    locked: "Complete the previous step to unlock this one.",
    in_progress: "In progress — open to continue.",
    awaiting_agency: "Waiting on the studio.",
    awaiting_client: "Waiting on you — open to review or confirm.",
    complete: "Complete — view anytime; editing only if the studio reopens this step.",
  };
  const lockedHint = "Complete the previous step to unlock this one.";
  return rows.map((r) => {
    const lockedStep = r.status === "locked";
    return {
      hubKey: `wf-${r.slug}`,
      href: r.href,
      title: r.label,
      subtitle: "",
      percent: lockedStep ? 0 : hubPercentForStep(r.complete, r.locked),
      hint: lockedStep ? lockedHint : (r.hubHintOverride ?? statusHint[r.status]),
      locked: lockedStep,
    };
  });
}

export function projectUsesWorkflow(stream: WorkflowStream, portalKind: string): boolean {
  const k = normalizePortalKind(portalKind);
  if (k === "SOCIAL") return false;
  const vis = visiblePortalSections(portalKind);
  if (stream === "website") return vis.website;
  if (stream === "branding") return vis.branding;
  if (stream === "signage") return vis.signage;
  if (stream === "print") return k === "PRINT";
  return false;
}

export type { ClientWorkflowAccessOptions } from "@/lib/portal-brand-kit-gate";
