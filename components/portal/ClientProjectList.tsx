import Link from "next/link";
import type { ComponentType, SVGProps } from "react";
import type { ContentCalendarItem, ReviewAsset } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { clientHasFullPortalAccess } from "@/lib/portal-client-full-access";
import { normalizePortalKind, portalKindLabel } from "@/lib/portal-project-kind";
import { normalizePaymentStatus } from "@/lib/portal-payment-status";
import { clientJourneyCombinedProgressPercent } from "@/lib/agency-combined-progress";
import { loadAccountBrandKitSlice } from "@/lib/portal-account-brand-kit";
import { loadClientWorkflowAccessOptsByProjectId } from "@/lib/portal-brand-kit-gate";
import { parseInspirationLinksJson } from "@/lib/portal-inspiration-links";
import { parseSocialOnboardingJson } from "@/lib/social-onboarding";
import { studioAdminDisplayLabel, studioAdminRoleHint } from "@/lib/studio-admin-options";
import {
  HubIconBranding,
  HubIconFolder,
  HubIconGrid,
  HubIconSignage,
  HubIconSocial,
  HubIconWebsite,
} from "@/components/portal/ProjectHubIcons";
import { PortalEmptyState } from "@/components/portal/PortalEmptyState";
import { PhaseProgressBar } from "@/components/portal/PhaseProgressBar";
import { AlertCircle, ChevronRight, FolderKanban } from "lucide-react";

const clientHomeProjectInclude = {
  assignedStudioUser: {
    select: {
      id: true,
      email: true,
      name: true,
      studioTeamProfile: { select: { welcomeName: true, personaSlug: true, studioRole: true, jobTitle: true } },
    },
  },
  calendarItems: {
    select: { scheduledFor: true, clientSignedOff: true, postWorkflowStatus: true },
  },
  reviewAssets: { select: { kind: true, clientSignedOff: true } },
  websitePageBriefs: {
    select: { pageIndex: true, headline: true, bodyCopy: true, imagePaths: true },
  },
} as const;

function portalKindIcon(portalKind: string): ComponentType<SVGProps<SVGSVGElement>> {
  switch (normalizePortalKind(portalKind)) {
    case "SOCIAL":
      return HubIconSocial;
    case "WEBSITE":
      return HubIconWebsite;
    case "ONE_OFF":
    case "BRANDING":
      return HubIconBranding;
    case "SIGNAGE":
      return HubIconSignage;
    case "PRINT":
      return HubIconFolder;
    default:
      return HubIconGrid;
  }
}

function PortalProjectKindIcon({ portalKind }: { portalKind: string }) {
  const Icon = portalKindIcon(portalKind);
  const label = portalKindLabel(portalKind);
  return (
    <span
      role="img"
      aria-label={label}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-200/90 bg-white text-burgundy shadow-sm sm:h-9 sm:w-9 sm:rounded-xl"
    >
      <Icon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden />
    </span>
  );
}

export async function ClientProjectList({ userId }: { userId: string }) {
  const [projects, accountKit] = await Promise.all([
    prisma.project.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      include: clientHomeProjectInclude,
    }),
    loadAccountBrandKitSlice(userId),
  ]);

  const accessById = await loadClientWorkflowAccessOptsByProjectId(
    userId,
    projects.map((p) => p.id),
  );

  return (
    <ul className="mt-4 flex flex-col gap-2.5 sm:gap-4">
      {projects.length === 0 ? (
        <li className="list-none">
          <PortalEmptyState
            icon={FolderKanban}
            title="No projects yet"
            description="If we’ve invited you, register or sign in with the same email we used on the invite. Your subscriptions will show up here automatically."
          />
        </li>
      ) : (
        projects.map((p) => {
          const accessOpts = accessById.get(p.id) ?? {};
          const pay =
            clientHasFullPortalAccess(p) && normalizePaymentStatus(p.paymentStatus) !== "CURRENT"
              ? normalizePaymentStatus(p.paymentStatus)
              : null;
          const payLabel =
            pay === "OVERDUE" ? "Payment overdue" : pay === "PENDING" ? "Payment pending" : null;
          const payClass =
            pay === "OVERDUE"
              ? "border border-rose-200/90 bg-rose-50 text-rose-950/90"
              : pay === "PENDING"
                ? "border border-amber-200/90 bg-amber-50 text-amber-950/90"
                : "";

          const unlocked = clientHasFullPortalAccess(p);
          const isSocialOnly = normalizePortalKind(p.portalKind) === "SOCIAL";
          const inspirationLinks = parseInspirationLinksJson(p.inspirationLinksJson || "[]");
          const socialOnboardingData = parseSocialOnboardingJson(p.socialOnboardingJson);
          const progressPct = clientJourneyCombinedProgressPercent({
            project: p,
            pageBriefs: p.websitePageBriefs,
            assets: p.reviewAssets as ReviewAsset[],
            calendarItems: p.calendarItems as ContentCalendarItem[],
            socialOnboardingData,
            inspirationLinkCount: inspirationLinks.length,
            accountKit,
            accessOpts,
          });

          const assignee = p.assignedStudioUser;
          const roleHint = studioAdminRoleHint(
            assignee?.studioTeamProfile?.personaSlug,
            assignee?.studioTeamProfile?.studioRole,
          );
          const assigneeLine = assignee
            ? `${studioAdminDisplayLabel(assignee)}${
                roleHint ? ` · ${roleHint}` : assignee.studioTeamProfile?.jobTitle ? ` · ${assignee.studioTeamProfile.jobTitle}` : ""
              }`
            : null;

          return (
            <li key={p.id}>
              <Link
                href={`/portal/project/${p.id}`}
                className="group flex flex-col gap-3 rounded-xl border border-zinc-200/90 bg-white px-4 py-3.5 shadow-sm transition-[border-color,box-shadow,transform] active:scale-[0.99] sm:gap-4 sm:px-5 sm:py-4 md:hover:border-zinc-300 md:hover:shadow-md"
              >
                <div className="flex flex-row items-start gap-3 sm:gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-2 sm:gap-2.5">
                      <PortalProjectKindIcon portalKind={p.portalKind} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                          <span className="font-display text-base leading-snug tracking-[-0.02em] text-burgundy group-hover:opacity-90 sm:text-lg">
                            {p.name}
                          </span>
                          {!unlocked ? (
                            <span className="inline-flex shrink-0 rounded-full border border-amber-200/90 bg-amber-50 px-2 py-0.5 font-body text-[8px] font-semibold uppercase tracking-[0.1em] text-amber-950/85 sm:text-[9px]">
                              Onboarding
                            </span>
                          ) : null}
                          {payLabel ? (
                            <span
                              className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 font-body text-[8px] font-semibold uppercase tracking-[0.1em] sm:px-2.5 sm:text-[9px] ${payClass}`}
                            >
                              <AlertCircle className="h-3 w-3 shrink-0 opacity-90" aria-hidden />
                              {payLabel}
                            </span>
                          ) : null}
                        </div>
                        <span className="mt-0.5 block font-body text-[9px] font-semibold uppercase tracking-[0.09em] text-burgundy/65 sm:mt-1 sm:text-[10px] sm:tracking-[0.1em]">
                          {portalKindLabel(p.portalKind)}
                        </span>
                        {assigneeLine ? (
                          <span className="mt-1 block font-body text-[11px] text-burgundy/60 sm:text-[12px]">
                            Your contact · {assigneeLine}
                          </span>
                        ) : (
                          <span className="mt-1 block font-body text-[11px] text-burgundy/50 sm:text-[12px]">
                            We&apos;ll assign a lead on our side shortly.
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="sr-only">Open project</span>
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center self-center rounded-xl border border-burgundy/15 bg-cream text-burgundy transition-colors group-hover:border-burgundy/35 group-hover:bg-burgundy/[0.06] md:h-10 md:w-10"
                    aria-hidden
                  >
                    <ChevronRight className="h-5 w-5 stroke-[2]" />
                  </span>
                </div>
                <div className="border-t border-zinc-100 pt-3">
                  <PhaseProgressBar
                    label={unlocked ? "Overall progress" : "Progress (unlocks after onboarding)"}
                    percent={unlocked ? progressPct : 0}
                    lockedVisual={!unlocked}
                    variant="panel"
                    hint={
                      unlocked
                        ? "Across every active area on this project — same as inside the project hub."
                        : isSocialOnly
                          ? "Sign your contract on the project page — then your full social workspace opens."
                          : "Sign your contract on the project page. Once the studio confirms your deposit too, your full workspace opens."
                    }
                  />
                </div>
              </Link>
            </li>
          );
        })
      )}
    </ul>
  );
}
