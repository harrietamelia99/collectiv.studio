import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { getProjectForSession, isAgencyPortalSession } from "@/lib/portal-access";
import { clientHasFullPortalAccess } from "@/lib/portal-client-full-access";
import { redirectClientIfProjectWorkspaceLocked } from "@/lib/portal-client-workspace-gate";
import { redirectClientIfOffboardingRequired } from "@/lib/portal-offboarding-gate";
import { parseInspirationLinksJson } from "@/lib/portal-inspiration-links";
import { visiblePortalSections } from "@/lib/portal-project-kind";
import { parseSocialOnboardingJson } from "@/lib/social-onboarding";
import { decryptSocialAccountAccessPayload } from "@/lib/social-account-access-crypto";
import { PortalSectionCard } from "@/components/portal/PortalSectionCard";
import { SocialOnboardingForm } from "@/components/portal/SocialOnboardingForm";
import { ProjectFeedbackSection } from "@/components/portal/ProjectFeedbackSection";
import { buildClientConversationStripData } from "@/lib/portal-conversation-strip";
import {
  mapProjectMessagesForFeedbackThread,
  projectMessageAuthorInclude,
} from "@/lib/project-message-display";
import { SocialPortalHashScroll } from "@/components/portal/SocialPortalHashScroll";

type Props = { params: { projectId: string } };

const shortcutPill =
  "inline-flex items-center rounded-full border border-burgundy/15 bg-cream px-4 py-2 font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/80 no-underline transition-colors hover:border-burgundy/35 hover:bg-burgundy/[0.04]";

const calendarHref = (projectId: string) => `/portal/project/${projectId}/social/calendar`;
const planningHref = (projectId: string) => `/portal/project/${projectId}/social/planning`;

export default async function ProjectSocialPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  const project = await getProjectForSession(params.projectId, session);
  if (!project) notFound();

  await redirectClientIfOffboardingRequired(params.projectId, session);

  const studio = isAgencyPortalSession(session);
  const vis = visiblePortalSections(project.portalKind);
  if (!vis.social && !studio) {
    redirect(`/portal/project/${project.id}`);
  }

  redirectClientIfProjectWorkspaceLocked(project, studio);

  const isSocialOnly = project.portalKind === "SOCIAL";

  const messagesRaw = await prisma.projectMessage.findMany({
    where: { projectId: project.id },
    orderBy: { createdAt: "asc" },
    take: 200,
    include: projectMessageAuthorInclude,
  });
  const messages = mapProjectMessagesForFeedbackThread(messagesRaw);

  const onboardingData = parseSocialOnboardingJson(project.socialOnboardingJson);
  const clientVerified = clientHasFullPortalAccess(project);
  const onboardingDone = !!project.socialOnboardingSubmittedAt;
  const clientNeedsOnboarding = !studio && isSocialOnly && clientVerified && !onboardingDone;
  const clientBlocked = !studio && !clientVerified;
  const showCalendarShortcut = studio || !isSocialOnly || onboardingDone;
  const inspirationLinks = parseInspirationLinksJson(project.inspirationLinksJson || "[]");

  const socialVaultPlainForStudio =
    studio && project.socialAccountAccessEncrypted?.trim()
      ? decryptSocialAccountAccessPayload(project.socialAccountAccessEncrypted)
      : null;

  const clientConversationStrip = !studio ? buildClientConversationStripData(project) : null;

  return (
    <div>
      <SocialPortalHashScroll />
      <Link
        href={`/portal/project/${project.id}`}
        className="font-body text-[11px] uppercase tracking-[0.1em] text-burgundy/55 no-underline hover:text-burgundy"
      >
        ← Project overview
      </Link>
      <h1 className="mt-6 font-display text-cc-h2 tracking-[-0.03em] text-burgundy">Social subscription</h1>
      <p className="mt-3 max-w-2xl font-body text-sm leading-relaxed text-burgundy/70">
        Complete your brief and brand kit on this page, add ideas and optional account access on{" "}
        <Link
          href={planningHref(project.id)}
          scroll={false}
          className="font-medium text-burgundy underline decoration-burgundy/25 underline-offset-4 hover:decoration-burgundy/50"
        >
          content planning
        </Link>
        , then open your{" "}
        <Link
          href={calendarHref(project.id)}
          scroll={false}
          className="font-medium text-burgundy underline decoration-burgundy/25 underline-offset-4 hover:decoration-burgundy/50"
        >
          content calendar
        </Link>{" "}
        to review each post — approve or leave feedback so we know what&apos;s ready to schedule.
      </p>

      {!clientBlocked ? (
        <nav
          className="mt-8 flex flex-wrap gap-2 border-b border-burgundy/10 pb-6"
          aria-label="On this page"
        >
          {!isSocialOnly ? null : (
            <>
              <a href="#social-step-1" className={shortcutPill}>
                Step 1 — Brief &amp; assets
              </a>
              <Link href={planningHref(project.id)} scroll={false} className={shortcutPill}>
                Step 2 — Planning
              </Link>
            </>
          )}
          {showCalendarShortcut ? (
            <Link href={calendarHref(project.id)} scroll={false} className={shortcutPill}>
              Content calendar &amp; approve
            </Link>
          ) : null}
        </nav>
      ) : null}

      {clientBlocked ? (
        <div className="cc-portal-client-shell mt-10 font-body text-sm leading-relaxed text-burgundy/80">
          The studio is still verifying your account. Once that&apos;s done, you&apos;ll complete your social briefing
          here, then your content calendar will be available on its own page for review.
        </div>
      ) : null}

      {!clientBlocked && isSocialOnly ? (
        <div className="mt-10">
          <SocialOnboardingForm
            projectId={project.id}
            initial={onboardingData}
            clientCanEdit={!studio && clientVerified && isSocialOnly}
            showBrandKit={isSocialOnly && clientVerified}
            inspirationLinks={inspirationLinks}
            inspirationListKey={project.inspirationLinksJson}
            inspirationCanEdit={!studio && clientVerified}
            inspirationPendingVerification={!studio && !clientVerified}
            projectBrand={{
              websitePrimaryHex: project.websitePrimaryHex,
              websiteSecondaryHex: project.websiteSecondaryHex,
              websiteAccentHex: project.websiteAccentHex,
              websiteQuaternaryHex: project.websiteQuaternaryHex,
              websiteFontPaths: project.websiteFontPaths,
              websiteLogoPath: project.websiteLogoPath,
              websiteLogoVariationsJson: project.websiteLogoVariationsJson,
            }}
          />
          {clientNeedsOnboarding ? (
            <p className="mt-8 max-w-xl font-body text-sm text-burgundy/65">
              Save Step 1 here, then use{" "}
              <Link href={planningHref(project.id)} className="font-medium text-burgundy underline">
                content planning
              </Link>{" "}
              for Step 2. We&apos;ll build your calendar from there — open the content calendar page to see new posts as
              the studio adds them.
            </p>
          ) : null}
        </div>
      ) : null}

      {studio && project.socialAccountAccessEncrypted?.trim() ? (
        <PortalSectionCard
          headingId="social-studio-vault-heading"
          title="Client — social account access"
          description={
            <p className="m-0 font-body text-sm text-burgundy/75">
              Decrypted for studio only. Do not paste into email or chat; use your password manager or a secure channel
              if you need to share internally.
            </p>
          }
          variant="client"
          className="mt-10 max-w-none lg:max-w-4xl"
        >
          <pre className="whitespace-pre-wrap break-words font-mono text-[13px] leading-relaxed text-burgundy/90">
            {socialVaultPlainForStudio ??
              "Could not decrypt — SOCIAL_ACCOUNT_ACCESS_SECRET may have changed, or the stored data is damaged."}
          </pre>
        </PortalSectionCard>
      ) : null}

      <ProjectFeedbackSection
        projectId={project.id}
        messages={messages}
        canPost={studio || clientVerified}
        className="mt-8 scroll-mt-28"
        sectionId="social-feedback"
        clientVisualEmphasis={!studio}
        conversationParticipants={clientConversationStrip}
        studioCanDeleteMessages={studio}
      />
    </div>
  );
}
