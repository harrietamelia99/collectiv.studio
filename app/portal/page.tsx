import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { getPortalDatabaseAvailable } from "@/lib/portal-db-status";
import { isAgencyPortalSession } from "@/lib/portal-access";
import { StudioAgencyDashboard } from "@/components/portal/StudioAgencyDashboard";
import { StudioAgencyDashboardOffline } from "@/components/portal/StudioAgencyDashboardOffline";
import { syncStudioTeamFromEnv } from "@/lib/studio-team-sync";
import { StudioHomeHeavySyncTrigger } from "@/components/portal/StudioHomeHeavySyncTrigger";
import { ClientProjectList } from "@/components/portal/ClientProjectList";
import { ClientProjectLogoAvatar } from "@/components/portal/ClientProjectLogoAvatar";
import { ClientPortalHomeOffline } from "@/components/portal/ClientPortalHomeOffline";
import { PortalDatabaseOfflineBanner } from "@/components/portal/PortalDatabaseOfflineBanner";
import {
  ClientProjectListSkeleton,
  StudioAgencyDashboardSkeleton,
} from "@/components/portal/PortalHomeSkeletons";

type Search = { created?: string; projectDeleted?: string; accountDeleted?: string };

export default async function PortalHomePage({ searchParams }: { searchParams?: Search }) {
  const [session, dbAvailable] = await Promise.all([
    getServerSession(authOptions),
    getPortalDatabaseAvailable(),
  ]);
  if (!session?.user?.id) redirect("/portal/login");

  const studio = isAgencyPortalSession(session);
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
              <Suspense fallback={<StudioAgencyDashboardSkeleton />}>
                <StudioAgencyDashboard
                  userId={session.user.id}
                  createdBanner={createdPair ? "pair" : created ? "single" : null}
                  deletedBanner={deletedBanner}
                />
              </Suspense>
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
              Your login is on the studio allowlist, but there is no <code className="font-mono text-[11px]">StudioTeamMember</code> row yet. Either add your email to{" "}
              <span className="font-mono text-[11px]">STUDIO_PERSONA_*_EMAIL</span> (then refresh), or insert your user with the correct{" "}
              <span className="font-mono text-[11px]">studioRole</span> using the SQL template under{" "}
              <span className="font-mono text-[11px]">prisma/sql-templates/</span>.
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
        <Suspense fallback={<ClientProjectListSkeleton />}>
          <ClientProjectList userId={clientUserId} />
        </Suspense>
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
            Update your <strong className="font-medium text-burgundy">email, password, or profile photo</strong> under{" "}
            <strong className="font-medium text-burgundy">Account</strong> in the header or bottom navigation.
          </li>
        </ul>
      </details>
    </div>
  );
}
