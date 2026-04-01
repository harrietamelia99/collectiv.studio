import type { ContentCalendarItem, Project, ReviewAsset, WebsitePageBrief } from "@prisma/client";
import { parseInspirationLinksJson } from "@/lib/portal-inspiration-links";
import { clientHasFullPortalAccess } from "@/lib/portal-client-full-access";
import { normalizePortalKind, visiblePortalSections } from "@/lib/portal-project-kind";
import { buildSignageStepRows } from "@/lib/portal-workflow";
import {
  reviewProgressPercent,
  socialAccountSetupProgressPercent,
  socialMonthlyCalendarProgressPercent,
  socialMonthlyPostCounts,
  websiteProgressPercent,
} from "@/lib/portal-progress";
import { parseSocialOnboardingJson } from "@/lib/social-onboarding";
import { formatUkMonthYearFromDate } from "@/lib/uk-datetime";

export type ProjectProgressTrack = {
  key: string;
  label: string;
  percent: number;
};

export type ProjectCardModel = {
  id: string;
  name: string;
  portalKind: string;
  /** Registered client account linked to this project — Issy-only delete account control. */
  clientUserId: string | null;
  clientAccountEmail: string | null;
  clientLabel: string;
  /** Studio-only: assigned admin display name */
  assignedLeadLabel: string | null;
  statusText: string;
  statusTone: "ok" | "pending" | "invite";
  isComplete: boolean;
  overallPercent: number;
  tracks: ProjectProgressTrack[];
  /** Human-readable next step for this scope */
  nextFocus: string;
  sections: ReturnType<typeof visiblePortalSections>;
};

type AssigneeForCard = {
  email: string;
  name: string | null;
  studioTeamProfile: { welcomeName: string | null } | null;
} | null;

function assignedLeadLabelFromUser(u: AssigneeForCard): string | null {
  if (!u) return null;
  const w = u.studioTeamProfile?.welcomeName?.trim();
  if (w) return w;
  const first = u.name?.trim().split(/\s+/)[0];
  if (first) return first;
  return u.email.split("@")[0] ?? null;
}

function clientLabelFromProject(
  project: Project & {
    user: { name: string | null; businessName: string | null; email: string } | null;
  },
): string {
  if (project.userId && project.user) {
    return [project.user.name, project.user.businessName, project.user.email].filter(Boolean).join(" · ");
  }
  if (project.invitedClientEmail) return `Awaiting signup · ${project.invitedClientEmail}`;
  return "Unassigned";
}

function statusForProject(project: Project): { text: string; tone: "ok" | "pending" | "invite" } {
  if (project.userId && clientHasFullPortalAccess(project)) return { text: "Verified", tone: "ok" };
  if (project.userId) return { text: "Pending verification", tone: "pending" };
  return { text: "Invite sent", tone: "invite" };
}

export function buildStudioProjectCard(
  project: Project & {
    user: { name: string | null; businessName: string | null; email: string } | null;
    assignedStudioUser?: AssigneeForCard;
  },
  calendarItems: Pick<
    ContentCalendarItem,
    "clientSignedOff" | "scheduledFor" | "postWorkflowStatus"
  >[],
  reviewAssets: Pick<ReviewAsset, "kind" | "clientSignedOff" | "filePath">[],
  pageBriefs: Pick<WebsitePageBrief, "pageIndex" | "headline" | "bodyCopy" | "imagePaths">[],
  now = new Date(),
): ProjectCardModel {
  const sections = visiblePortalSections(project.portalKind);
  const tracks: ProjectProgressTrack[] = [];
  const onboardingData = parseSocialOnboardingJson(project.socialOnboardingJson);
  const inspirationLinkCount = parseInspirationLinksJson(project.inspirationLinksJson || "[]").length;

  if (sections.social) {
    tracks.push({
      key: "social-month",
      label: "Posts this month",
      percent: socialMonthlyCalendarProgressPercent(calendarItems, now),
    });
    tracks.push({
      key: "social-setup",
      label: "Account setup",
      percent: socialAccountSetupProgressPercent(project, onboardingData, inspirationLinkCount),
    });
  }

  if (sections.website) {
    tracks.push({
      key: "website",
      label: "Website kit",
      percent: websiteProgressPercent(project, pageBriefs),
    });
  }

  if (sections.signage && normalizePortalKind(project.portalKind) === "SIGNAGE") {
    tracks.push({
      key: "signage-workflow",
      label: "Signage workflow",
      percent: buildSignageStepRows(project.id, project, reviewAssets as ReviewAsset[], null, true, undefined).percent,
    });
  } else if (sections.signage) {
    const list = reviewAssets.filter((a) => a.kind === "SIGNAGE");
    tracks.push({
      key: "signage",
      label: "Signage",
      percent: list.length > 0 ? reviewProgressPercent(reviewAssets, "SIGNAGE") : 0,
    });
  }

  for (const kind of ["BRANDING", "GENERAL"] as const) {
    if (kind === "BRANDING" && !sections.branding) continue;
    if (kind === "GENERAL" && !sections.deliverables) continue;
    const list = reviewAssets.filter((a) => a.kind === kind);
    const label = kind === "BRANDING" ? "Branding" : "Shared deliverables";
    tracks.push({
      key: kind.toLowerCase(),
      label,
      percent: list.length > 0 ? reviewProgressPercent(reviewAssets, kind) : 0,
    });
  }

  const overallPercent =
    tracks.length > 0 ? Math.round(tracks.reduce((s, t) => s + t.percent, 0) / tracks.length) : 0;

  const nextFocus = deriveNextFocus(
    project,
    sections,
    calendarItems,
    reviewAssets,
    onboardingData,
    inspirationLinkCount,
    now,
  );

  const st = statusForProject(project);

  return {
    id: project.id,
    name: project.name,
    portalKind: project.portalKind,
    clientUserId: project.userId ?? null,
    clientAccountEmail: project.user?.email?.trim() ?? null,
    clientLabel: clientLabelFromProject(project),
    assignedLeadLabel: assignedLeadLabelFromUser(project.assignedStudioUser ?? null),
    statusText: st.text,
    statusTone: st.tone,
    isComplete: Boolean(project.studioMarkedCompleteAt),
    overallPercent,
    tracks,
    nextFocus,
    sections,
  };
}

function deriveNextFocus(
  project: Project,
  sections: ReturnType<typeof visiblePortalSections>,
  calendarItems: Pick<
    ContentCalendarItem,
    "clientSignedOff" | "scheduledFor" | "postWorkflowStatus"
  >[],
  reviewAssets: Pick<ReviewAsset, "kind" | "clientSignedOff" | "filePath">[],
  onboardingData: ReturnType<typeof parseSocialOnboardingJson>,
  inspirationLinkCount: number,
  now: Date,
): string {
  if (project.studioMarkedCompleteAt) return "Project marked complete — offboarding if needed.";
  if (!project.userId) return "Client hasn’t registered yet — follow up on the invite.";
  if (!clientHasFullPortalAccess(project)) {
    return "When contract (and deposit, if required) are done, use Unlock workspace & notify client on the project page.";
  }
  if (sections.website && !project.websiteKitSignedOff) {
    return "Website kit in progress — colours, fonts, copy, then sign-off.";
  }
  if (sections.social) {
    const monthLabel = formatUkMonthYearFromDate(now);
    const { inMonth, signedOff } = socialMonthlyPostCounts(calendarItems, now);
    const setupPct = socialAccountSetupProgressPercent(project, onboardingData, inspirationLinkCount);
    if (setupPct < 100) {
      return "Account setup — brief, brand assets, and mood links on the social hub still need attention.";
    }
    if (calendarItems.length === 0) {
      return "Social workstream — add calendar posts when you’re ready.";
    }
    if (inMonth > 0 && signedOff < inMonth) {
      return `${inMonth - signedOff} post(s) in ${monthLabel} still need client sign-off.`;
    }
    if (inMonth === 0) {
      return `Nothing scheduled for ${monthLabel} yet — add dates or plan the next month.`;
    }
    return "This month’s posts are signed off — add or prep the next batch when ready.";
  }
  const unsigned = reviewAssets.filter((a) => !a.clientSignedOff).length;
  if (unsigned > 0) return `${unsigned} review file(s) waiting on client feedback.`;
  if (sections.website && project.websiteKitSignedOff && !project.websiteLiveUrl?.trim()) {
    return "Add the live site URL when the build is published.";
  }
  return "Check messages and open tasks for the next move.";
}
