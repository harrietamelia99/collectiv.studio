import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReviewAsset } from "@prisma/client";
import type { ComponentType, SVGProps } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { getProjectForSession, isStudioUser } from "@/lib/portal-access";
import {
  buildBrandingClientHubCards,
  buildDeliverablesClientHubCards,
  buildSignageClientHubCards,
  buildSocialClientHubCards,
  buildWebsiteClientHubCards,
  reviewProgressPercent,
  socialAccountSetupProgressPercent,
  socialMonthlyCalendarProgressPercent,
  socialMonthlyPostCounts,
  websiteProgressPercent,
} from "@/lib/portal-progress";
import { normalizePortalKind, portalKindLabel, visiblePortalSections } from "@/lib/portal-project-kind";
import { buildBrandingStepRows } from "@/lib/portal-workflow";
import { ProjectFeedbackSection } from "@/components/portal/ProjectFeedbackSection";
import {
  mapProjectMessagesForFeedbackThread,
  projectMessageAuthorInclude,
} from "@/lib/project-message-display";
import { AgencyProjectStudioView } from "@/components/portal/AgencyProjectStudioView";
import { ClientPaymentStatusCallout } from "@/components/portal/ClientPaymentStatusCallout";
import { ClientProjectGuide } from "@/components/portal/ClientProjectGuide";
import { ProjectPointOfContact } from "@/components/portal/ProjectPointOfContact";
import { ClientOffboardingForm } from "@/components/portal/ClientOffboardingForm";
import { clientNeedsOffboardingForm } from "@/lib/portal-offboarding";
import { buildClientConversationStripData } from "@/lib/portal-conversation-strip";
import { ClientWorkflowHubTile } from "@/components/portal/ClientWorkflowHubTile";
import { ClientContractSignOff } from "@/components/portal/ClientContractSignOff";
import { ClientQuoteView } from "@/components/portal/ClientQuoteView";
import { ctaButtonClasses } from "@/components/ui/Button";
import { PORTAL_CLIENT_INPUT_CLASS } from "@/components/portal/PortalSectionCard";
import { ProjectHubQuickNav, type HubNavItem } from "@/components/portal/ProjectHubQuickNav";
import {
  HubIconArrowLeft,
  HubIconBranding,
  HubIconChecklist,
  HubIconFolder,
  HubIconGrid,
  HubIconMessages,
  HubIconPayment,
  HubIconRocket,
  HubIconSignage,
  HubIconSocial,
  HubIconUser,
  HubIconWebsite,
} from "@/components/portal/ProjectHubIcons";
import { clientHasFullPortalAccess } from "@/lib/portal-client-full-access";
import { parseInspirationLinksJson } from "@/lib/portal-inspiration-links";
import { parseSocialOnboardingJson } from "@/lib/social-onboarding";
import { parseQuoteLineItemsJson } from "@/lib/portal-quote-lines";
import { loadAccountBrandKitSlice } from "@/lib/portal-account-brand-kit";
import { loadClientWorkflowAccessOpts } from "@/lib/portal-brand-kit-gate";
import { buildSignageStepRows } from "@/lib/portal-workflow";
import type { PersonaSlug } from "@/lib/studio-team-config";

type Props = { params: { projectId: string } };

type SectionKey = "social" | "website" | "branding" | "signage" | "deliverables";

export default async function ProjectOverviewPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  const project = await getProjectForSession(params.projectId, session);
  if (!project) notFound();

  const studio = isStudioUser(session?.user?.email);
  const vis = visiblePortalSections(project.portalKind);
  const viewerStudioMember =
    studio && session?.user?.id
      ? await prisma.studioTeamMember.findUnique({
          where: { userId: session.user.id },
          select: { personaSlug: true },
        })
      : null;
  const canAssignProjectLead = viewerStudioMember?.personaSlug === "isabella";
  const [items, assets, messagesRaw, websitePageBriefs, projectQuote, offboardingReview, accountBrandKit, clientWorkflowAccessOpts] =
    await Promise.all([
    prisma.contentCalendarItem.findMany({
      where: { projectId: project.id },
      orderBy: [{ scheduledFor: "asc" }, { createdAt: "asc" }],
    }),
    prisma.reviewAsset.findMany({ where: { projectId: project.id } }),
    prisma.projectMessage.findMany({
      where: { projectId: project.id },
      orderBy: { createdAt: "asc" },
      take: 200,
      include: projectMessageAuthorInclude,
    }),
    prisma.websitePageBrief.findMany({
      where: { projectId: project.id },
      select: { pageIndex: true, headline: true, bodyCopy: true, imagePaths: true },
    }),
    prisma.projectQuote.findUnique({ where: { projectId: project.id } }),
    prisma.publishedClientReview.findUnique({ where: { projectId: project.id } }),
    loadAccountBrandKitSlice(project.userId),
    loadClientWorkflowAccessOpts(project.userId, project.id),
  ]);

  const messages = mapProjectMessagesForFeedbackThread(messagesRaw);

  const quoteLines = projectQuote ? parseQuoteLineItemsJson(projectQuote.lineItemsJson) : [];

  const portalUnlockedForClient = clientHasFullPortalAccess(project);

  const inspirationLinks = parseInspirationLinksJson(project.inspirationLinksJson || "[]");
  const socialOnboardingData = parseSocialOnboardingJson(project.socialOnboardingJson);

  const nowProgress = new Date();
  const monthLabelProgress = nowProgress.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  const monthCountsProgress = socialMonthlyPostCounts(items, nowProgress);
  const socialPct = vis.social
    ? Math.round(
        (socialMonthlyCalendarProgressPercent(items, nowProgress) +
          socialAccountSetupProgressPercent(project, socialOnboardingData, inspirationLinks.length)) /
          2,
      )
    : 0;
  const webPct = websiteProgressPercent(project, websitePageBriefs, accountBrandKit, clientWorkflowAccessOpts);
  const brandingWorkflowProgress = vis.branding
    ? buildBrandingStepRows(project.id, project, assets as ReviewAsset[], studio)
    : null;
  const brandPct = brandingWorkflowProgress?.percent ?? reviewProgressPercent(assets, "BRANDING");
  const signPct = reviewProgressPercent(assets, "SIGNAGE");
  const generalPct = reviewProgressPercent(assets, "GENERAL");
  const generalList = assets.filter((a) => a.kind === "GENERAL");
  const signageWorkflow = vis.signage
    ? buildSignageStepRows(project.id, project, assets, accountBrandKit, studio, clientWorkflowAccessOpts)
    : null;

  const allSections: {
    key: SectionKey;
    href: string;
    title: string;
    subtitle: string;
    percent: number;
    hint: string;
  }[] = [
    {
      key: "social",
      href: `/portal/project/${project.id}/social`,
      title: "Social media",
      subtitle: "Briefing, calendar & sign-off",
      percent: socialPct,
      hint: items.length
        ? monthCountsProgress.inMonth > 0
          ? `${monthCountsProgress.signedOff} of ${monthCountsProgress.inMonth} posts signed off for ${monthLabelProgress}; setup and planning on the social hub.`
          : `${items.filter((i) => i.clientSignedOff).length} of ${items.length} posts signed off overall. Nothing dated in ${monthLabelProgress} yet.`
        : "Complete your briefing first (social projects), then we add posts for you to approve.",
    },
    {
      key: "website",
      href: `/portal/project/${project.id}/website`,
      title: "Website",
      subtitle: "Package pages, kit, live link & preview",
      percent: webPct,
      hint: portalUnlockedForClient
        ? "Add each page’s content, track progress, and open the site link when the studio shares it."
        : "Unlocks when your contract is signed and, if applicable, your deposit is confirmed by the studio.",
    },
    {
      key: "branding",
      href: `/portal/project/${project.id}/branding`,
      title: "Branding",
      subtitle: "Review deliverables & sign off",
      percent: brandPct,
      hint:
        normalizePortalKind(project.portalKind) === "BRANDING" && brandingWorkflowProgress
          ? `${brandingWorkflowProgress.completed} of ${brandingWorkflowProgress.total} steps complete — inspiration through final files.`
          : assets.filter((a) => a.kind === "BRANDING").length
        ? `${assets.filter((a) => a.kind === "BRANDING" && a.clientSignedOff).length} of ${assets.filter((a) => a.kind === "BRANDING").length} signed off`
        : "Branding proofs will appear here for your approval.",
    },
    {
      key: "signage",
      href: `/portal/project/${project.id}/signage`,
      title: "Signage & print",
      subtitle: "Review artwork & sign off",
      percent: signageWorkflow?.percent ?? signPct,
      hint: signageWorkflow
        ? `${signageWorkflow.completed} of ${signageWorkflow.total} steps complete — brand kit through final files & order (shared downloads are on the last step).`
        : assets.filter((a) => a.kind === "SIGNAGE").length
        ? `${assets.filter((a) => a.kind === "SIGNAGE" && a.clientSignedOff).length} of ${assets.filter((a) => a.kind === "SIGNAGE").length} signed off`
        : "Signage and print files will appear here when ready.",
    },
    {
      key: "deliverables",
      href: `/portal/project/${project.id}/deliverables`,
      title: "Shared files",
      subtitle: "Downloads (PDF, SVG, exports)",
      percent: generalPct,
      hint: generalList.length
        ? `${generalList.filter((a) => a.clientSignedOff).length} of ${generalList.length} shared files signed off`
        : "The studio attaches files here for you to download and sign off.",
    },
  ];

  const sections = allSections.filter((s) => vis[s.key]);

  const sectionIcons: Record<SectionKey, ComponentType<SVGProps<SVGSVGElement>>> = {
    social: HubIconSocial,
    website: HubIconWebsite,
    branding: HubIconBranding,
    signage: HubIconSignage,
    deliverables: HubIconFolder,
  };

  type HubGridRow = {
    hubKey: string;
    href: string;
    title: string;
    subtitle: string;
    percent: number;
    hint: string;
    /** 1-based step within this workstream (resets per website / social / branding / signage / deliverables). */
    stepNumber?: number;
    locked?: boolean;
  };

  const hubGridRows: HubGridRow[] = (() => {
        const rows: HubGridRow[] = [];
        for (const s of sections) {
          if (s.key === "website") {
        let step = 0;
        for (const c of buildWebsiteClientHubCards(
          project.id,
          project,
          websitePageBriefs,
          false,
          accountBrandKit,
          clientWorkflowAccessOpts,
        )) {
          step++;
          rows.push({ ...c, stepNumber: step });
            }
            continue;
          }
          if (s.key === "social") {
        let step = 0;
            for (const c of buildSocialClientHubCards(
              project.id,
              project,
              items,
              socialOnboardingData,
              inspirationLinks.length,
            )) {
          step++;
          rows.push({ ...c, stepNumber: step });
            }
            continue;
          }
          if (s.key === "branding") {
        let step = 0;
            for (const c of buildBrandingClientHubCards(
              project.id,
              project,
              assets,
              inspirationLinks.length,
          false,
            )) {
          step++;
          rows.push({ ...c, stepNumber: step });
            }
            continue;
          }
          if (s.key === "signage") {
        let step = 0;
        for (const c of buildSignageClientHubCards(
          project.id,
          project,
          assets,
          accountBrandKit,
          false,
          clientWorkflowAccessOpts,
        )) {
          step++;
          rows.push({ ...c, stepNumber: step });
            }
            continue;
          }
          if (s.key === "deliverables") {
        let step = 0;
        for (const c of buildDeliverablesClientHubCards(project.id, project, assets, accountBrandKit, false)) {
          step++;
          rows.push({ ...c, stepNumber: step });
            }
            continue;
          }
        }
        return rows;
      })();

  const workstreamNavItems: HubNavItem[] = sections.map((s) => ({
    href: s.href,
    label: s.title,
    Icon: sectionIcons[s.key],
  }));

  const agreementNav: HubNavItem = { href: "#client-contract", label: "Agreement", Icon: HubIconChecklist };
  const clientQuickNavItems: HubNavItem[] = portalUnlockedForClient
    ? [{ href: "#project-messages", label: "Messages", Icon: HubIconMessages }, agreementNav, ...workstreamNavItems]
    : projectQuote?.sentAt
      ? [
          { href: "#project-quote-client", label: "Quote", Icon: HubIconPayment },
          agreementNav,
        ]
      : [{ href: "#client-onboarding-gate", label: "Next steps", Icon: HubIconChecklist }, agreementNav];

  const clientOffboardingBlocking = clientNeedsOffboardingForm({
    studio,
    portalUnlockedForClient,
    studioMarkedCompleteAt: project.studioMarkedCompleteAt,
    hasSubmittedReview: Boolean(offboardingReview),
  });

  const clientConversationStrip = !studio ? buildClientConversationStripData(project) : null;

  if (clientOffboardingBlocking) {
    return (
      <div>
        <Link
          href="/portal"
          className="-mx-2 inline-flex min-h-[44px] items-center gap-2 rounded-xl px-2 py-1 font-body text-sm font-medium text-burgundy touch-manipulation no-underline transition-colors hover:text-burgundy/85 active:bg-zinc-100/80"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-zinc-200/90 bg-white text-burgundy shadow-sm">
            <HubIconArrowLeft className="h-4 w-4" />
          </span>
          Your projects
        </Link>

        <div className="mt-6 flex gap-4 rounded-xl border border-zinc-200/90 bg-white p-5 shadow-sm sm:gap-5 sm:p-6">
          <div className="w-1 shrink-0 self-stretch rounded-full bg-burgundy" aria-hidden />
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-cc-h2 tracking-[-0.03em] text-burgundy">{project.name}</h1>
            <p className="mt-3 max-w-xl font-body text-sm leading-relaxed text-burgundy/80">
              This project is complete. Please submit the short feedback form below — then you can use messages,
              downloads, and the rest of this workspace as usual.
            </p>
          </div>
        </div>

        <ClientOffboardingForm
          projectId={project.id}
          defaultName={
            [project.user?.name, project.user?.businessName].filter(Boolean).join(" · ") || ""
          }
        />
      </div>
    );
  }

  if (studio) {
    const internalNotes = await prisma.projectInternalNote.findMany({
      where: { projectId: project.id },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { author: { select: { name: true, email: true } } },
    });
    const slug = viewerStudioMember!.personaSlug;
    const agencyNav: HubNavItem[] = [
      { href: "#agency-project-header", label: "Overview", Icon: HubIconGrid },
      ...(slug === "isabella"
        ? ([
            { href: "#agency-onboarding", label: "Onboarding", Icon: HubIconChecklist },
          ] as HubNavItem[])
        : []),
      { href: "#agency-project-steps", label: slug === "may" ? "Social & steps" : "Project steps", Icon: HubIconWebsite },
      ...(slug === "isabella"
        ? ([
            { href: "#agency-subscription-payment", label: "Subscription", Icon: HubIconPayment },
            { href: "#agency-wrap-up", label: "Wrap-up", Icon: HubIconRocket },
          ] as HubNavItem[])
        : []),
      { href: "#agency-messages", label: "Messages", Icon: HubIconMessages },
      { href: "#agency-internal-notes", label: "Internal notes", Icon: HubIconUser },
    ];
    return (
      <div>
        <Link
          href="/portal"
          className="-mx-2 inline-flex min-h-[44px] items-center gap-2 rounded-xl px-2 py-1 font-body text-sm font-medium text-burgundy touch-manipulation no-underline transition-colors hover:text-burgundy/85 active:bg-zinc-100/80"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-zinc-200/90 bg-white text-burgundy shadow-sm">
            <HubIconArrowLeft className="h-4 w-4" />
          </span>
          All projects
        </Link>
        <div className="mt-5 max-w-3xl">
          <ProjectHubQuickNav items={agencyNav} ariaLabel="Jump to project sections" compact />
        </div>
        <div className="mt-6">
          <AgencyProjectStudioView
            project={project}
            items={items}
            assets={assets}
            websitePageBriefs={websitePageBriefs}
            messages={messages}
            socialOnboardingData={socialOnboardingData}
            inspirationLinksCount={inspirationLinks.length}
            accountBrandKit={accountBrandKit}
            clientWorkflowAccessOpts={clientWorkflowAccessOpts}
            canAssignProjectLead={canAssignProjectLead}
            internalNotes={internalNotes}
            viewerPersonaSlug={viewerStudioMember!.personaSlug as PersonaSlug}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/portal"
        className="-mx-2 inline-flex min-h-[44px] items-center gap-2 rounded-xl px-2 py-1 font-body text-sm font-medium text-burgundy touch-manipulation no-underline transition-colors hover:text-burgundy/85 active:bg-zinc-100/80"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-zinc-200/90 bg-white text-burgundy shadow-sm">
          <HubIconArrowLeft className="h-4 w-4" />
        </span>
        Your projects
      </Link>

        <div
          id="client-onboarding-gate"
          className="mt-6 flex gap-4 rounded-xl border border-zinc-200/90 bg-white p-5 shadow-sm sm:gap-5 sm:p-6"
        >
          <div className="w-1 shrink-0 self-stretch rounded-full bg-burgundy" aria-hidden />
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-cc-h2 tracking-[-0.03em] text-burgundy">{project.name}</h1>
            <p className="mt-2 inline-flex items-center rounded-full border border-burgundy/20 bg-burgundy/[0.06] px-3 py-1 font-body text-xs font-medium text-burgundy">
              {portalKindLabel(project.portalKind)}
            </p>
            <p className="cc-portal-client-description mt-3 max-w-xl">
              {portalUnlockedForClient
                ? "Use the shortcuts below to open each area—everything for this project is a tap away."
                : normalizePortalKind(project.portalKind) === "SOCIAL"
                  ? "Your quote and agreement live below. Once you sign the contract, your full social workspace opens — no deposit step on this subscription."
                  : "Your quote and agreement live below. The rest of this project unlocks once your contract is signed and your deposit is confirmed by the studio."}
            </p>
            {project.assignedStudioUser ? (
              <ProjectPointOfContact
                assignee={project.assignedStudioUser}
                variant="embedded"
                className="mt-5 border-t border-zinc-200/90 pt-5"
                messagesHref={portalUnlockedForClient ? "#project-messages" : undefined}
              />
            ) : null}
          </div>
        </div>

        <ProjectHubQuickNav items={clientQuickNavItems} ariaLabel="Jump to project sections" compact />

        <ClientProjectGuide
          portalKind={project.portalKind}
        portalUnlockedForClient={portalUnlockedForClient}
          quoteSentAt={projectQuote?.sentAt ?? null}
          sections={sections.map((s) => ({ href: s.href, title: s.title }))}
        />

      {portalUnlockedForClient ? (
        <div className="mt-6">
          <ClientPaymentStatusCallout
            paymentStatus={project.paymentStatus}
            paymentNoteForClient={project.paymentNoteForClient}
          />
        </div>
      ) : null}

      {projectQuote?.sentAt ? (
        <div id="project-quote-client" className="scroll-mt-28 mt-6">
          <ClientQuoteView intro={projectQuote.intro} lines={quoteLines} sentAt={projectQuote.sentAt} />
        </div>
      ) : null}

      <ClientContractSignOff
        projectId={project.id}
        contractTermsText={project.contractTermsText ?? ""}
        alreadySigned={Boolean(project.clientContractSignedAt)}
        signedAt={project.clientContractSignedAt}
        signedTypedName={project.contractSignedTypedName ?? null}
        signedSnapshotText={project.contractSignedSnapshotText ?? null}
      />

      {portalUnlockedForClient ? (
        <section
          id="project-workstreams"
          className="cc-portal-client-shell scroll-mt-28 mt-12"
          aria-labelledby="workstreams-heading"
        >
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-burgundy text-cream shadow-sm">
              <HubIconGrid className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <h2
                id="workstreams-heading"
                className="cc-portal-client-shell-title text-xl md:text-2xl"
              >
                Where you’ll work
              </h2>
              <p className="cc-portal-client-description mt-2 font-medium">
                Each area is split into a few steps (like website kit, content, and preview). Open a card to jump
                straight to that part of the portal.
              </p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {hubGridRows.map((row) => (
              <ClientWorkflowHubTile
                key={row.hubKey}
                hubKey={row.hubKey}
                href={row.href}
                title={row.title}
                subtitle={row.subtitle}
                percent={row.percent}
                hint={row.hint}
                stepNumber={row.stepNumber}
                locked={row.locked}
              />
            ))}
          </div>
        </section>
      ) : null}

      {portalUnlockedForClient ? (
        <ProjectFeedbackSection
          projectId={project.id}
          messages={messages}
          canPost
          className="mt-12 scroll-mt-28 sm:mt-14"
          sectionId="project-messages"
          clientVisualEmphasis
          conversationParticipants={clientConversationStrip}
          studioCanDeleteMessages={false}
        />
      ) : null}

      {offboardingReview ? (
        <div className="mt-8 rounded-cc-card border border-burgundy/12 bg-cream px-5 py-6 font-body text-sm leading-relaxed text-burgundy/80">
          Thank you — your rating and answers are saved. If you gave us five stars, we may feature your public quote on
          the site. You can use the rest of this project as usual.
        </div>
      ) : null}
    </div>
  );
}
