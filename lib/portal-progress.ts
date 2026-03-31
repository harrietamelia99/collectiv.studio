import type { ContentCalendarItem, Project, ReviewAsset, WebsitePageBrief } from "@prisma/client";
import type { SocialOnboardingData } from "@/lib/social-onboarding";
import { clientHasFullPortalAccess } from "@/lib/portal-client-full-access";
import { parsePageImagePaths, parseWebsiteFontPaths } from "@/lib/website-kit-pages";
import type { ClientWorkflowAccessOptions } from "@/lib/portal-brand-kit-gate";
import type { AccountBrandKitSlice } from "@/lib/portal-workflow";
import {
  buildBrandingStepRows,
  buildPrintStepRows,
  buildSignageStepRows,
  buildWebsiteStepRows,
  workflowStepRowsToHubCards,
} from "@/lib/portal-workflow";

export { parseWebsiteFontPaths };

export function socialProgressPercent(items: Pick<ContentCalendarItem, "clientSignedOff">[]): number {
  if (!items.length) return 0;
  const done = items.filter((i) => i.clientSignedOff).length;
  return Math.round((done / items.length) * 100);
}

function isSocialPostSignedOff(
  i: Pick<ContentCalendarItem, "clientSignedOff" | "postWorkflowStatus">,
): boolean {
  return Boolean(i.clientSignedOff || i.postWorkflowStatus === "APPROVED");
}

/** Posts with a `scheduledFor` in the same UTC calendar month as `now`. */
export function socialMonthlyPostCounts(
  items: Pick<ContentCalendarItem, "scheduledFor" | "clientSignedOff" | "postWorkflowStatus">[],
  now = new Date(),
): { inMonth: number; signedOff: number } {
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();
  const inMonth = items.filter((i) => {
    if (!i.scheduledFor) return false;
    const d = new Date(i.scheduledFor);
    return d.getUTCFullYear() === y && d.getUTCMonth() === m;
  });
  const signedOff = inMonth.filter((i) => isSocialPostSignedOff(i)).length;
  return { inMonth: inMonth.length, signedOff };
}

/**
 * Share of **this month’s** scheduled posts that are client-approved (signed off or batch APPROVED).
 * If none are scheduled this month, returns 100% (nothing due in-window).
 */
export function socialMonthlyCalendarProgressPercent(
  items: Pick<ContentCalendarItem, "scheduledFor" | "clientSignedOff" | "postWorkflowStatus">[],
  now = new Date(),
): number {
  const { inMonth, signedOff } = socialMonthlyPostCounts(items, now);
  if (inMonth === 0) return 100;
  return Math.round((signedOff / inMonth) * 100);
}

/** Website workstream: four ordered steps (brand kit → content → preview → domain & go live). */
export function websiteProgressPercent(
  project: Project,
  pageBriefs: Pick<WebsitePageBrief, "pageIndex" | "headline" | "bodyCopy" | "imagePaths">[] = [],
  accountKit: AccountBrandKitSlice = null,
  accessOpts?: ClientWorkflowAccessOptions,
): number {
  return buildWebsiteStepRows(project.id, project, pageBriefs, false, accountKit, accessOpts).percent;
}

/** Client hub — “Website kit” card: colours, fonts, logo, kit sign-off (4 steps). */
export function websiteKitHubProgressPercent(project: Project): number {
  if (!clientHasFullPortalAccess(project)) return 0;
  let done = 0;
  if (project.websitePrimaryHex?.trim()) done++;
  if (parseWebsiteFontPaths(project.websiteFontPaths).length > 0) done++;
  if (project.websiteLogoPath?.trim()) done++;
  if (project.websiteKitSignedOff) done++;
  return Math.round((done / 4) * 100);
}

/** Client hub — “Website content” card: every page has some copy or reference imagery. */
export function websitePageContentHubProgressPercent(
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

/** Client hub — “First draft & preview”: kit + page readiness; 100% once a preview/live URL exists. */
export function websitePreviewHubProgressPercent(
  project: Pick<
    Project,
    | "portalKind"
    | "clientVerifiedAt"
    | "clientContractSignedAt"
    | "studioDepositMarkedPaidAt"
    | "websiteLiveUrl"
    | "websiteKitSignedOff"
    | "websitePreviewSignedOff"
    | "websitePageCount"
    | "websiteContentSignedOff"
  >,
  pageBriefs: Pick<WebsitePageBrief, "pageIndex" | "headline" | "bodyCopy" | "imagePaths">[] = [],
): number {
  if (!clientHasFullPortalAccess(project)) return 0;
  if (project.websitePreviewSignedOff || project.websiteLiveUrl?.trim()) return 100;
  const contentPct = websitePageContentHubProgressPercent(project, pageBriefs);
  if (project.websiteKitSignedOff) {
    return Math.min(100, Math.round(35 + contentPct * 0.65));
  }
  return Math.round(contentPct * 0.3);
}

/** Client hub — “Domain & go live”: live URL from studio, or client domain/DNS details on the domain page. */
export function websiteGoLiveHubProgressPercent(
  project: Pick<
    Project,
    | "portalKind"
    | "clientVerifiedAt"
    | "clientContractSignedAt"
    | "studioDepositMarkedPaidAt"
    | "websiteLiveUrl"
    | "websiteClientDomain"
    | "websiteDomainProvider"
    | "websiteDomainRegistrarVaultStored"
    | "websiteLaunchSignedOff"
  >,
): number {
  if (!clientHasFullPortalAccess(project)) return 0;
  if (project.websiteLaunchSignedOff || project.websiteLiveUrl?.trim()) return 100;
  const hasDomain = Boolean(project.websiteClientDomain?.trim());
  const hasProvider = Boolean(project.websiteDomainProvider?.trim());
  const hasVault = project.websiteDomainRegistrarVaultStored === true;
  if (hasDomain && hasProvider && hasVault) return 85;
  if (hasDomain && hasProvider) return 55;
  if (hasDomain || hasProvider) return 28;
  return 0;
}

export type WebsiteClientHubCard = {
  hubKey: string;
  href: string;
  title: string;
  subtitle: string;
  percent: number;
  hint: string;
  /** True when this workflow step is not yet reachable (client hub). */
  locked?: boolean;
  /** Copy for the locked-state dialog; set when `locked` is true. */
  unlockMessage?: string;
};

function textFilled(s: string | undefined): boolean {
  return Boolean(s?.trim());
}

/** Social hub — step 1: brief, brand assets on the project, and mood links. */
export function socialBriefHubProgressPercent(
  project: Pick<
    Project,
    | "portalKind"
    | "clientVerifiedAt"
    | "clientContractSignedAt"
    | "studioDepositMarkedPaidAt"
    | "websitePrimaryHex"
    | "websiteFontPaths"
    | "websiteLogoPath"
  >,
  data: SocialOnboardingData,
  inspirationLinkCount: number,
): number {
  if (!clientHasFullPortalAccess(project)) return 0;
  const slots = 9;
  let done = 0;
  if (textFilled(data.businessOverview)) done++;
  if (textFilled(data.targetAudience)) done++;
  if (textFilled(data.visualStyle)) done++;
  if (textFilled(data.inspiringAccounts)) done++;
  if (["yes", "partial", "no"].includes(String(data.existingBrandKit).trim())) done++;
  if (project.websitePrimaryHex?.trim()) done++;
  if (parseWebsiteFontPaths(project.websiteFontPaths).length > 0) done++;
  if (project.websiteLogoPath?.trim()) done++;
  if (inspirationLinkCount > 0) done++;
  return Math.round((done / slots) * 100);
}

/** Brief, kit fields, and mood links — “account setup” for social retainers (alias for the brief hub). */
export function socialAccountSetupProgressPercent(
  project: Pick<
    Project,
    | "portalKind"
    | "clientVerifiedAt"
    | "clientContractSignedAt"
    | "studioDepositMarkedPaidAt"
    | "websitePrimaryHex"
    | "websiteFontPaths"
    | "websiteLogoPath"
  >,
  onboardingData: SocialOnboardingData,
  inspirationLinkCount: number,
): number {
  return socialBriefHubProgressPercent(project, onboardingData, inspirationLinkCount);
}

/** Social hub — step 2: optional planning (after first save). */
export function socialPlanningHubProgressPercent(
  project: Pick<
    Project,
    | "portalKind"
    | "clientVerifiedAt"
    | "clientContractSignedAt"
    | "studioDepositMarkedPaidAt"
    | "socialOnboardingSubmittedAt"
  >,
  data: SocialOnboardingData,
): number {
  if (!clientHasFullPortalAccess(project) || !project.socialOnboardingSubmittedAt) return 0;
  if (data.needPlanningHelp) return 100;
  const filled = [textFilled(data.postIdeas), textFilled(data.dealsPromos), textFilled(data.keyDates)].filter(
    Boolean,
  ).length;
  if (filled === 0) return 40;
  return Math.round((filled / 3) * 100);
}

function reviewAssetsOfKind(
  assets: { kind: string; clientSignedOff: boolean; filePath?: string | null }[],
  kind: "BRANDING" | "SIGNAGE" | "GENERAL",
) {
  return assets.filter((a) => a.kind === kind);
}

function reviewSignedHint(
  assets: Pick<ReviewAsset, "kind" | "clientSignedOff">[],
  kind: "BRANDING" | "SIGNAGE" | "GENERAL",
  emptyCopy: string,
): string {
  const list = reviewAssetsOfKind(assets, kind);
  if (!list.length) return emptyCopy;
  const n = list.filter((a) => a.clientSignedOff).length;
  return `${n} of ${list.length} items signed off`;
}

/** Client hub — downloads after final payment when signed-off files are gated. */
export function reviewFinalDownloadHubPercent(
  project: Pick<Project, "clientAcknowledgedFinalPaymentAt">,
  assets: { clientSignedOff: boolean; filePath?: string | null }[],
): number {
  const locked = assets.filter(
    (a) => a.filePath && a.clientSignedOff && !project.clientAcknowledgedFinalPaymentAt,
  );
  if (!locked.length) return 100;
  return 0;
}

export function reviewFinalDownloadHubHint(
  project: Pick<Project, "clientAcknowledgedFinalPaymentAt">,
  assets: { clientSignedOff: boolean; filePath?: string | null }[],
): string {
  const locked = assets.filter(
    (a) => a.filePath && a.clientSignedOff && !project.clientAcknowledgedFinalPaymentAt,
  );
  if (!locked.length) {
    return "Nothing is waiting on payment, or the studio hasn’t shared downloadable files yet.";
  }
  return "Confirm final payment in the popup to unlock downloads for signed-off items.";
}

export function inspirationLinksHubPercent(linkCount: number): number {
  if (linkCount <= 0) return 0;
  return Math.min(100, Math.round((Math.min(linkCount, 3) / 3) * 100));
}

/** Social-only: brief on `/social`, planning on `/social/planning`, calendar on `/social/calendar`, messages on `/social`. */
export function buildSocialClientHubCards(
  projectId: string,
  project: Pick<
    Project,
    | "portalKind"
    | "clientVerifiedAt"
    | "clientContractSignedAt"
    | "studioDepositMarkedPaidAt"
    | "websitePrimaryHex"
    | "websiteFontPaths"
    | "websiteLogoPath"
    | "socialOnboardingSubmittedAt"
  >,
  items: Pick<ContentCalendarItem, "clientSignedOff" | "scheduledFor" | "postWorkflowStatus">[],
  onboardingData: SocialOnboardingData,
  inspirationLinkCount: number,
): WebsiteClientHubCard[] {
  const base = `/portal/project/${projectId}/social`;
  const now = new Date();
  const monthLabel = now.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  const { inMonth, signedOff } = socialMonthlyPostCounts(items, now);
  const signed = items.filter((i) => i.clientSignedOff).length;
  const calHint =
    inMonth > 0
      ? `${signedOff} of ${inMonth} posts scheduled for ${monthLabel} are signed off.`
      : items.length > 0
        ? `Nothing dated in ${monthLabel} yet. ${signed} of ${items.length} posts signed off overall.`
    : "Posts appear here when the studio adds them to your calendar.";

  if (project.portalKind !== "SOCIAL") {
    return [
      {
        hubKey: "social-calendar",
        href: `${base}/calendar`,
        title: "Content calendar",
        subtitle: "Review and sign off each scheduled post",
        percent: socialMonthlyCalendarProgressPercent(items, now),
        hint: calHint,
      },
      {
        hubKey: "social-feedback",
        href: `${base}#social-feedback`,
        title: "Notes to the studio",
        subtitle: "Message thread on the social page",
        percent: 0,
        hint: "Use the thread on your social subscription page for questions or extra context on your plan.",
      },
    ];
  }

  return [
    {
      hubKey: "social-brief",
      href: `${base}#social-step-1`,
      title: "Brief & brand assets",
      subtitle: "Business context, kit uploads, and mood links",
      percent: socialBriefHubProgressPercent(project, onboardingData, inspirationLinkCount),
      hint: clientHasFullPortalAccess(project)
        ? "Tell us about the brand, add colours and logo if you have them, and drop Pinterest or mood links."
        : "Unlocks once your contract (and deposit, if applicable) is confirmed by the studio.",
    },
    {
      hubKey: "social-planning",
      href: `${base}/planning`,
      title: "Content planning",
      subtitle: "Ideas, promos, and key dates (optional)",
      percent: socialPlanningHubProgressPercent(project, onboardingData),
      hint: "Share what you want to talk about — or ask us to shape it with you.",
    },
    {
      hubKey: "social-calendar",
      href: `${base}/calendar`,
      title: "Calendar & sign-off",
      subtitle: "Approve posts or leave feedback",
      percent: socialMonthlyCalendarProgressPercent(items, now),
      hint: calHint,
    },
  ];
}

export function buildBrandingClientHubCards(
  projectId: string,
  project: Project,
  assets: Pick<ReviewAsset, "kind" | "clientSignedOff" | "filePath">[],
  _inspirationLinkCount: number,
  viewerIsStudio = false,
): WebsiteClientHubCard[] {
  void _inspirationLinkCount;
  const { steps } = buildBrandingStepRows(projectId, project, assets as ReviewAsset[], viewerIsStudio);
  return workflowStepRowsToHubCards(steps);
}

export function buildSignageClientHubCards(
  projectId: string,
  project: Project,
  assets: Pick<ReviewAsset, "kind" | "clientSignedOff" | "filePath">[],
  accountKit: AccountBrandKitSlice,
  viewerIsStudio = false,
  accessOpts?: ClientWorkflowAccessOptions,
): WebsiteClientHubCard[] {
  const { steps } = buildSignageStepRows(
    projectId,
    project,
    assets as ReviewAsset[],
    accountKit,
    viewerIsStudio,
    accessOpts,
  );
  return workflowStepRowsToHubCards(steps);
}

export function buildDeliverablesClientHubCards(
  projectId: string,
  project: Project,
  assets: Pick<ReviewAsset, "kind" | "clientSignedOff" | "filePath">[],
  accountKit: AccountBrandKitSlice | null = null,
  viewerIsStudio = false,
): WebsiteClientHubCard[] {
  const base = `/portal/project/${projectId}/deliverables`;
  const list = reviewAssetsOfKind(assets, "GENERAL");
  return [
    {
      hubKey: "deliverables-review",
      href: `${base}#deliverables-hub-section`,
      title: "Files to review",
      subtitle: "Sign off shared exports and documents",
      percent: reviewProgressPercent(assets, "GENERAL"),
      hint: reviewSignedHint(
        assets,
        "GENERAL",
        "The studio will attach files here for you to download and approve.",
      ),
    },
    {
      hubKey: "deliverables-final",
      href: `${base}#deliverables-final-note`,
      title: "Shared file downloads & payment",
      subtitle: "Unlock signed-off shared files when ready",
      percent: reviewFinalDownloadHubPercent(project, list),
      hint: reviewFinalDownloadHubHint(project, list),
    },
  ];
}

/** Client hub: one card per website workflow step (ordered routes under `/website/...`). */
export function buildWebsiteClientHubCards(
  projectId: string,
  project: Project,
  pageBriefs: Pick<WebsitePageBrief, "pageIndex" | "headline" | "bodyCopy" | "imagePaths">[],
  viewerIsStudio = false,
  accountKit: AccountBrandKitSlice = null,
  accessOpts?: ClientWorkflowAccessOptions,
): WebsiteClientHubCard[] {
  const { steps } = buildWebsiteStepRows(projectId, project, pageBriefs, viewerIsStudio, accountKit, accessOpts);
  return workflowStepRowsToHubCards(steps);
}

export function reviewProgressPercent(
  assets: Pick<ReviewAsset, "kind" | "clientSignedOff">[],
  kind: "BRANDING" | "SIGNAGE" | "GENERAL",
): number {
  const list = assets.filter((a) => a.kind === kind);
  if (!list.length) return 0;
  const signed = list.filter((a) => a.clientSignedOff).length;
  return Math.round((signed / list.length) * 100);
}
