import Link from "next/link";
import type { ComponentType, SVGProps } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-options";
import type { ContentCalendarItem, ReviewAsset } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getPortalDatabaseAvailable } from "@/lib/portal-db-status";
import { isStudioUser } from "@/lib/portal-access";
import { clientHasFullPortalAccess } from "@/lib/portal-client-full-access";
import { normalizePortalKind, portalKindLabel } from "@/lib/portal-project-kind";
import { normalizePaymentStatus } from "@/lib/portal-payment-status";
import { StudioAgencyDashboard } from "@/components/portal/StudioAgencyDashboard";
import { StudioAgencyDashboardOffline } from "@/components/portal/StudioAgencyDashboardOffline";
import { clientJourneyCombinedProgressPercent } from "@/lib/agency-combined-progress";
import { loadAccountBrandKitSlice } from "@/lib/portal-account-brand-kit";
import { loadClientWorkflowAccessOpts } from "@/lib/portal-brand-kit-gate";
import { parseInspirationLinksJson } from "@/lib/portal-inspiration-links";
import { parseSocialOnboardingJson } from "@/lib/social-onboarding";
import { syncStudioTeamFromEnv } from "@/lib/studio-team-sync";
import { StudioHomeHeavySyncTrigger } from "@/components/portal/StudioHomeHeavySyncTrigger";
import { studioAdminDisplayLabel, studioAdminRoleHint } from "@/lib/studio-admin-options";
import {
  HubIconBranding,
  HubIconFolder,
  HubIconGrid,
  HubIconSignage,
  HubIconSocial,
  HubIconWebsite,
} from "@/components/portal/ProjectHubIcons";
import { ClientProjectLogoAvatar } from "@/components/portal/ClientProjectLogoAvatar";
import { ClientPortalHomeOffline } from "@/components/portal/ClientPortalHomeOffline";
import { PortalDatabaseOfflineBanner } from "@/components/portal/PortalDatabaseOfflineBanner";
import { PortalEmptyState } from "@/components/portal/PortalEmptyState";
import { PhaseProgressBar } from "@/components/portal/PhaseProgressBar";
import { AlertCircle, ChevronRight, FolderKanban } from "lucide-react";

type Search = { created?: string; projectDeleted?: string; accountDeleted?: string };

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

const clientHomeProjectInclude = {
  assignedStudioUser: {
    select: {
      id: true,
      email: true,
      name: true,
      studioTeamProfile: { select: { welcomeName: true, personaSlug: true, jobTitle: true } },
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

async function ClientProjectList({ userId }: { userId: string }) {
  const [projects, accountKit] = await Promise.all([
    prisma.project.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      include: clientHomeProjectInclude,
    }),
    loadAccountBrandKitSlice(userId),
  ]);

  const accessOptsList = await Promise.all(
    projects.map((p) => loadClientWorkflowAccessOpts(userId, p.id)),
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
        projects.map((p, i) => {
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
            accessOpts: accessOptsList[i],
          });

          const assignee = p.assignedStudioUser;
          const assigneeLine = assignee
            ? `${studioAdminDisplayLabel(assignee)}${
                studioAdminRoleHint(assignee.studioTeamProfile?.personaSlug)
                  ? ` · ${studioAdminRoleHint(assignee.studioTeamProfile?.personaSlug)}`
                  : assignee.studioTeamProfile?.jobTitle
                    ? ` · ${assignee.studioTeamProfile.jobTitle}`
                    : ""
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

export default async function PortalHomePage({ searchParams }: { searchParams?: Search }) {
  const [session, dbAvailable] = await Promise.all([
    getServerSession(authOptions),
    getPortalDatabaseAvailable(),
  ]);
  if (!session?.user?.id) redirect("/portal/login");

  const studio = isStudioUser(session.user.email);
  const created = searchParams?.created === "1";
  const createdPair = searchParams?.created === "pair";
  const deletedBanner =
    searchParams?.projectDeleted === "1" ? ("project" as const) : searchParams?.accountDeleted === "1" ? ("account" as const) : null;

  /** Studio logins use the dashboard with every project; everyone else is treated as a client only. */
  if (studio) {
    let studioTeamProfile: { personaSlug: string | null } | null = null;
    if (dbAvailable && session.user.id) {
      await syncStudioTeamFromEnv();
      studioTeamProfile = await prisma.studioTeamMember.findUnique({
        where: { userId: session.user.id },
        select: { personaSlug: true },
      });
    }
    return (
      <div className="space-y-12 pb-8">
        {!dbAvailable ? <PortalDatabaseOfflineBanner /> : null}
        <header className={studioTeamProfile ? "max-w-4xl" : "max-w-2xl"}>
          <h1 className="font-display text-cc-h2 tracking-[-0.03em] text-burgundy">
            {studioTeamProfile ? "Your studio home" : "Studio dashboard"}
          </h1>
          <p className="mt-3 font-body text-base leading-relaxed text-burgundy/70 md:text-[15px]">
            {studioTeamProfile
              ? "Take it one step at a time — your list, inbox, calendar, and clients are all here when you need them."
              : "Create projects, assign clients, and choose what they see. After you verify a customer, they can use their full portal."}
          </p>
        </header>

        {session.user.id ? (
          dbAvailable ? (
            <>
              <StudioHomeHeavySyncTrigger />
              <StudioAgencyDashboard
                userId={session.user.id}
                createdBanner={createdPair ? "pair" : created ? "single" : null}
                deletedBanner={deletedBanner}
              />
            </>
          ) : (
            <StudioAgencyDashboardOffline
              createdBanner={createdPair ? "pair" : created ? "single" : null}
              deletedBanner={deletedBanner}
            />
          )
        ) : null}

        {!studioTeamProfile && dbAvailable ? (
          <section className="cc-portal-client-shell" aria-labelledby="studio-profile-missing-heading">
            <h2 id="studio-profile-missing-heading" className="cc-portal-client-shell-title">
              Studio profile
            </h2>
            <p className="cc-portal-client-description mt-3 max-w-xl font-medium">
              Your login is on the studio allowlist, but no team persona is linked yet. Add your email to{" "}
              <span className="font-mono text-[11px]">STUDIO_PERSONA_ISABELLA_EMAIL</span>,{" "}
              <span className="font-mono text-[11px]">STUDIO_PERSONA_HARRIET_EMAIL</span>, or{" "}
              <span className="font-mono text-[11px]">STUDIO_PERSONA_MAY_EMAIL</span> in the environment (matching this
              account), then refresh — Issy, Harriet, and May each get the correct dashboard and permissions.
            </p>
          </section>
        ) : null}
      </div>
    );
  }

  const clientUserId = session.user.id;
  if (!clientUserId) redirect("/portal/login");

  if (!dbAvailable) {
    return (
      <div className="space-y-6">
        <PortalDatabaseOfflineBanner />
        <ClientPortalHomeOffline session={session} />
      </div>
    );
  }

  const [portalClient, projectsForLogo] = await Promise.all([
    prisma.user.findUnique({
      where: { id: clientUserId },
      select: { businessName: true, name: true },
    }),
    prisma.project.findMany({
      where: { userId: clientUserId },
      orderBy: { updatedAt: "desc" },
      select: { websiteLogoPath: true },
    }),
  ]);
  const brandWelcomeName =
    portalClient?.businessName?.trim() || portalClient?.name?.trim() || null;
  const headerLogoPath =
    projectsForLogo.find((p) => p.websiteLogoPath?.trim())?.websiteLogoPath?.trim() ?? null;
  const headerLogoLabel = brandWelcomeName || "Your brand";

  return (
    <div className="space-y-8 pb-8">
      <header className="max-w-2xl min-w-0 border-l-2 border-burgundy pl-3 sm:border-l-4 sm:pl-5">
        <p className="font-body text-[0.65rem] font-bold uppercase tracking-[0.1em] text-burgundy sm:text-xs sm:tracking-[0.12em]">
          Client portal
        </p>
        <div className="mt-3 sm:mt-4">
          <ClientProjectLogoAvatar
            logoPath={headerLogoPath}
            name={headerLogoLabel}
            size="lg"
            className="!h-[3.25rem] !w-[3.25rem] sm:!h-16 sm:!w-16"
          />
        </div>
        <h1 className="mt-3 break-words font-display text-cc-h2 tracking-[-0.03em] text-burgundy max-sm:text-balance sm:mt-4">
          {brandWelcomeName ? (
            <>
              Welcome <span className="italic">{brandWelcomeName}</span>
            </>
          ) : (
            <>Welcome</>
          )}
        </h1>
        <p className="mt-3 font-body text-sm leading-snug text-burgundy/80 sm:mt-4 sm:text-base sm:leading-relaxed md:text-[15px]">
          Below you&apos;ll find each <strong className="font-semibold text-burgundy">project or subscription</strong>{" "}
          we&apos;re working on with you. Open one to see what&apos;s next—messages, creative work, and sign-offs live here
          instead of getting lost in email.
        </p>
        <p className="mt-2.5 font-body text-sm leading-snug text-burgundy/70 sm:mt-3 sm:leading-relaxed md:text-[15px]">
          When you need us, use <strong className="font-semibold text-burgundy">Messages</strong> inside that project so
          the right context stays with the work.
        </p>
      </header>

      <section aria-labelledby="client-projects-heading" className="cc-portal-client-shell">
        <h2
          id="client-projects-heading"
          className="cc-portal-client-shell-title"
        >
          Your projects &amp; subscriptions
        </h2>
        <p className="mt-3 max-w-xl cc-portal-client-description font-medium">
          Tap a name to open it—everything for that engagement is on the next page.
        </p>
        <ClientProjectList userId={clientUserId} />
      </section>

      <details
        className="group cc-portal-client-shell max-w-xl font-body text-sm leading-relaxed text-burgundy/80 open:shadow-md"
        aria-label="More about the client portal"
      >
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-0 py-0 marker:content-none [&::-webkit-details-marker]:hidden">
          <span className="font-body text-xs font-bold uppercase tracking-[0.1em] text-burgundy">
            Quick tips
          </span>
          <span
            className="shrink-0 text-burgundy/40 transition-transform duration-200 group-open:rotate-180"
            aria-hidden
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </summary>
        <ul className="m-0 list-disc space-y-1.5 border-t border-zinc-200 py-3 pl-5 text-[13px] text-burgundy/70">
          <li>
            Use the <strong className="font-medium text-burgundy">shortcuts</strong> at the top of a project to jump to
            Messages, social, website, or files.
          </li>
          <li>
            <strong className="font-medium text-burgundy">My projects</strong> in the header always brings you back to
            this list.
          </li>
          <li>
            Add a <strong className="font-medium text-burgundy">message profile photo</strong> anytime on{" "}
            <strong className="font-medium text-burgundy">Brand kit</strong> in the bottom navigation.
          </li>
        </ul>
      </details>
    </div>
  );
}
