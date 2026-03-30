import type { ContentCalendarItem, Project, ReviewAsset, WebsitePageBrief } from "@prisma/client";
import type { SocialOnboardingData } from "@/lib/social-onboarding";
import type { ClientWorkflowAccessOptions } from "@/lib/portal-brand-kit-gate";
import type { AccountBrandKitSlice } from "@/lib/portal-workflow";
import {
  buildBrandingStepRows,
  buildPrintStepRows,
  buildSignageStepRows,
  buildWebsiteStepRows,
} from "@/lib/portal-workflow";
import {
  socialAccountSetupProgressPercent,
  socialMonthlyCalendarProgressPercent,
} from "@/lib/portal-progress";
import { normalizePortalKind, visiblePortalSections } from "@/lib/portal-project-kind";

export type CombinedJourneyProgressArgs = {
  project: Project;
  pageBriefs: Pick<WebsitePageBrief, "pageIndex" | "headline" | "bodyCopy" | "imagePaths">[];
  assets: ReviewAsset[];
  calendarItems: ContentCalendarItem[];
  socialOnboardingData: SocialOnboardingData;
  inspirationLinkCount: number;
  accountKit: AccountBrandKitSlice;
  accessOpts?: ClientWorkflowAccessOptions;
  now?: Date;
};

/**
 * Average progress across active workstreams.
 * @param studioAsViewer — `true` when the agency is viewing (steps treated as studio); `false` for the client journey.
 */
export function combinedJourneyProgressPercent(
  args: CombinedJourneyProgressArgs & { studioAsViewer: boolean },
): number {
  const {
    project,
    pageBriefs,
    assets,
    calendarItems,
    socialOnboardingData,
    inspirationLinkCount,
    accountKit,
    accessOpts,
    now = new Date(),
    studioAsViewer,
  } = args;
  const vis = visiblePortalSections(project.portalKind);
  const parts: number[] = [];
  if (vis.branding) {
    parts.push(buildBrandingStepRows(project.id, project, assets, studioAsViewer).percent);
  }
  if (vis.website) {
    parts.push(buildWebsiteStepRows(project.id, project, pageBriefs, studioAsViewer, accountKit, accessOpts).percent);
  }
  const k = normalizePortalKind(project.portalKind);
  if (vis.signage) {
    parts.push(buildSignageStepRows(project.id, project, assets, accountKit, studioAsViewer, accessOpts).percent);
  }
  if (k === "PRINT") {
    parts.push(buildPrintStepRows(project.id, project, assets, accountKit, studioAsViewer, accessOpts).percent);
  }
  if (vis.social) {
    const cal = socialMonthlyCalendarProgressPercent(calendarItems, now);
    const setup = socialAccountSetupProgressPercent(project, socialOnboardingData, inspirationLinkCount);
    parts.push(Math.round((cal + setup) / 2));
  }
  if (!parts.length) return 0;
  return Math.round(parts.reduce((a, b) => a + b, 0) / parts.length);
}

/** Agency project page — same math as the client, but with studio step visibility rules. */
export function agencyCombinedProgressPercent(args: CombinedJourneyProgressArgs): number {
  return combinedJourneyProgressPercent({ ...args, studioAsViewer: true });
}

/** Client home / dashboard cards — locked steps and gates apply as the client sees them. */
export function clientJourneyCombinedProgressPercent(args: CombinedJourneyProgressArgs): number {
  return combinedJourneyProgressPercent({ ...args, studioAsViewer: false });
}
