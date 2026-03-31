import type { Project, ReviewAsset, WebsitePageBrief } from "@prisma/client";
import { parseInspirationLinksJson } from "@/lib/portal-inspiration-links";
import { websitePageContentHubProgressPercent } from "@/lib/portal-progress";
import type { WorkflowStepRow } from "@/lib/portal-workflow";
import {
  brandingInspirationComplete,
  brandingQuestionnaireComplete,
  websiteBrandKitStepComplete,
} from "@/lib/portal-workflow";
import type { AccountBrandKitSlice } from "@/lib/portal-workflow";
import { parsePageImagePaths, parseWebsiteFontPaths } from "@/lib/website-kit-pages";

function websiteClientTouchedBrandKit(project: Project, accountKit: AccountBrandKitSlice): boolean {
  if (websiteBrandKitStepComplete(project, accountKit)) return true;
  if (accountKit?.websitePrimaryHex?.trim() || accountKit?.websiteLogoPath?.trim()) return true;
  if (accountKit && parseWebsiteFontPaths(accountKit.websiteFontPaths).length > 0) return true;
  if (project.websitePrimaryHex?.trim() || project.websiteLogoPath?.trim()) return true;
  return parseWebsiteFontPaths(project.websiteFontPaths).length > 0;
}

function websiteClientTouchedContent(
  project: Project,
  pageBriefs: Pick<WebsitePageBrief, "pageIndex" | "headline" | "bodyCopy" | "imagePaths">[],
): boolean {
  if (websitePageContentHubProgressPercent(project, pageBriefs) > 0) return true;
  const byIndex = new Map(pageBriefs.map((b) => [b.pageIndex, b]));
  const n = project.websitePageCount;
  for (let i = 0; i < n; i++) {
    const b = byIndex.get(i);
    if (b?.headline?.trim() || b?.bodyCopy?.trim()) return true;
    if (b && parsePageImagePaths(b.imagePaths).length > 0) return true;
  }
  return false;
}

function brandingClientTouchedInspiration(project: Pick<Project, "brandingMoodDescription" | "inspirationLinksJson">): boolean {
  if (brandingInspirationComplete(project)) return true;
  return parseInspirationLinksJson(project.inspirationLinksJson || "[]").length > 0 || Boolean(project.brandingMoodDescription?.trim());
}

function brandingProofsClientRound(assets: Pick<ReviewAsset, "kind" | "filePath">[]): boolean {
  return assets.some((a) => a.kind === "BRANDING" && a.filePath);
}

function signageProofsClientRound(assets: Pick<ReviewAsset, "kind" | "filePath">[]): boolean {
  return assets.some((a) => a.kind === "SIGNAGE" && a.filePath);
}

function printProofsClientRound(assets: Pick<ReviewAsset, "kind" | "filePath">[]): boolean {
  return assets.some((a) => a.kind === "GENERAL" && a.filePath);
}

export function agencyStepClientActivityLine(args: {
  stream: "website" | "branding" | "signage" | "print";
  slug: string;
  row: WorkflowStepRow;
  project: Project;
  portalUnlocked: boolean;
  assets: ReviewAsset[];
  pageBriefs: Pick<WebsitePageBrief, "pageIndex" | "headline" | "bodyCopy" | "imagePaths">[];
  accountKit: AccountBrandKitSlice;
}): string {
  const { stream, slug, row, project, portalUnlocked, assets, pageBriefs, accountKit } = args;

  if (!portalUnlocked) {
    return "The client can’t work on steps until their hub is open.";
  }
  if (row.locked) {
    return "The client hasn’t reached this step yet.";
  }
  if (row.complete) {
    return "The client has completed this step.";
  }

  if (row.status === "awaiting_agency") {
    if (stream === "branding" && slug === "proofs" && !brandingProofsClientRound(assets)) {
      return "Upload a proof round so the client can review.";
    }
    if (stream === "signage" && slug === "proofs" && !signageProofsClientRound(assets)) {
      return "Upload signage proofs so the client can review.";
    }
    if (stream === "print" && slug === "proofs" && !printProofsClientRound(assets)) {
      return "Upload print proofs so the client can review.";
    }
    if (stream === "signage" && slug === "final-files") {
      const hasSignage = assets.some((a) => a.kind === "SIGNAGE" && a.filePath);
      const hasGeneral = assets.some((a) => a.kind === "GENERAL" && a.filePath);
      if (!hasSignage && !hasGeneral) return "Add final files so the client can acknowledge.";
    }
    if (stream === "branding" && slug === "final-files" && !assets.some((a) => a.kind === "BRANDING" && a.filePath)) {
      return "Add final deliverables so the client can acknowledge.";
    }
    if (stream === "print" && slug === "final-files" && !assets.some((a) => a.kind === "GENERAL" && a.filePath)) {
      return "Add final files so the client can acknowledge.";
    }
    if (stream === "website" && slug === "preview" && project.websitePreviewClientFeedback?.trim()) {
      return "The client left feedback — follow up on this step.";
    }
    return "The client has submitted something — ready for your review.";
  }

  if (row.status === "awaiting_client") {
    return "Waiting on the client to approve or respond.";
  }

  const key = `${stream}:${slug}`;
  let touched = false;
  if (key === "website:brand-kit") touched = websiteClientTouchedBrandKit(project, accountKit);
  else if (key === "website:content") touched = websiteClientTouchedContent(project, pageBriefs);
  else if (key === "website:preview") touched = Boolean(project.websiteLiveUrl?.trim());
  else if (key === "website:domain") {
    touched = Boolean(
      project.websiteClientDomain?.trim() ||
        project.websiteDomainProvider?.trim() ||
        project.websiteDomainRegistrarVaultStored,
    );
  } else if (key === "branding:inspiration") touched = brandingClientTouchedInspiration(project);
  else if (key === "branding:questionnaire") {
    touched = brandingQuestionnaireComplete(project) || Boolean(project.brandingQuestionnaireJson?.trim() && project.brandingQuestionnaireJson !== "{}");
  } else if (key === "branding:proofs") touched = brandingProofsClientRound(assets);
  else if (key === "branding:final-files") touched = Boolean(project.brandingFinalDeliverablesAcknowledgedAt) || assets.some((a) => a.kind === "BRANDING" && a.filePath);
  else if (key === "signage:brand-kit") touched = websiteClientTouchedBrandKit(project, accountKit);
  else if (key === "signage:inspiration") touched = brandingClientTouchedInspiration(project);
  else if (key === "signage:specification") touched = Boolean(project.signageSpecificationSubmittedAt);
  else if (key === "signage:proofs") touched = signageProofsClientRound(assets);
  else if (key === "signage:final-files") {
    touched =
      Boolean(project.signageFinalDeliverablesAcknowledgedAt) ||
      assets.some((a) => (a.kind === "SIGNAGE" || a.kind === "GENERAL") && a.filePath);
  } else if (key === "print:brand-kit") touched = websiteClientTouchedBrandKit(project, accountKit);
  else if (key === "print:specification") touched = Boolean(project.printSpecificationSubmittedAt);
  else if (key === "print:inspiration") {
    touched = project.printInspirationSkipped || brandingClientTouchedInspiration(project);
  } else if (key === "print:proofs") touched = printProofsClientRound(assets);
  else if (key === "print:final-files") {
    touched =
      Boolean(project.printFinalDeliverablesAcknowledgedAt) || assets.some((a) => a.kind === "GENERAL" && a.filePath);
  }

  if (!touched) {
    return "The client has not started this step yet.";
  }
  return "The client is working on this step.";
}
