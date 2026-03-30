import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { buildClientConversationStripData } from "@/lib/portal-conversation-strip";
import { loadAccountBrandKitSlice } from "@/lib/portal-account-brand-kit";
import { loadClientWorkflowAccessOpts } from "@/lib/portal-brand-kit-gate";
import { websiteProgressPercent } from "@/lib/portal-progress";
import { redirectClientIfOffboardingRequired } from "@/lib/portal-offboarding-gate";
import { PhaseProgressBar } from "@/components/portal/PhaseProgressBar";
import { ProjectFeedbackSection } from "@/components/portal/ProjectFeedbackSection";
import { WebsiteWorkstreamStepCards } from "@/components/portal/WebsiteWorkstreamStepCards";
import { loadWebsiteWorkspace } from "@/app/portal/project/[projectId]/website/_lib/load-website-workspace";

type Props = { params: { projectId: string } };

export default async function ProjectWebsiteHubPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  const w = await loadWebsiteWorkspace(params.projectId, session);
  if (!w.ok) {
    if ("notFound" in w) notFound();
    redirect(w.redirectTo);
  }

  await redirectClientIfOffboardingRequired(params.projectId, session);

  const {
    project,
    studio,
    unlocked,
    clientVerified,
    pageBriefs,
    messages,
    inspirationLinks,
  } = w;

  const [accountKit, clientWorkflowAccessOpts] = await Promise.all([
    loadAccountBrandKitSlice(project.userId),
    loadClientWorkflowAccessOpts(project.userId, project.id),
  ]);

  const pct = websiteProgressPercent(project, pageBriefs, accountKit, clientWorkflowAccessOpts);
  const clientConversationStrip = !studio ? buildClientConversationStripData(project) : null;

  return (
    <div>
      <Link
        href={`/portal/project/${project.id}`}
        className="font-body text-[11px] uppercase tracking-[0.1em] text-burgundy/55 no-underline hover:text-burgundy"
      >
        ← Project overview
      </Link>
      <h1 className="mt-6 font-display text-cc-h2 tracking-[-0.03em] text-burgundy">Website</h1>
      <p className="mt-3 max-w-xl lg:max-w-3xl font-body text-sm leading-relaxed text-burgundy/70">
        {studio ? (
          <>
            Work is split into four steps — brand kit, page content, preview link, then domain &amp; go live. Open each
            card to work or review what the client has saved.
          </>
        ) : (
          <>
            Complete each step in order: brand kit, then copy and images for every page, then review the preview link,
            then domain and launch details. Use Messages anytime if you’re unsure.
          </>
        )}
      </p>

      <div className="mt-10 max-w-xl lg:max-w-3xl">
        <PhaseProgressBar
          label="Website progress"
          percent={pct}
          hint={
            unlocked
              ? clientVerified || studio
                ? "Four steps: brand kit, page content, preview sign-off, then domain & launch confirmation."
                : "Your account must be verified by the studio before you can edit."
              : "This workstream unlocks once your contract is signed and, if applicable, your deposit is confirmed by the studio."
          }
        />
      </div>

      {!studio && !clientVerified ? (
        <div className="cc-portal-client-shell mt-8 font-body text-sm text-burgundy/80">
          The studio is still verifying your account. You&apos;ll be able to edit your website steps once that&apos;s
          complete.
        </div>
      ) : null}

      {!unlocked ? (
        <div className="cc-portal-client-shell mt-10 font-body text-sm leading-relaxed text-burgundy/75">
          {studio
            ? "Confirm contract and deposit (if applicable) on the project overview — the website hub unlocks for your client automatically."
            : "These steps unlock once your contract is signed and, if applicable, your deposit is confirmed by the studio."}
        </div>
      ) : (
        <section
          className="cc-portal-client-shell scroll-mt-28 mt-10"
          aria-labelledby="website-steps-heading"
        >
          <div className="mb-5 flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <h2 id="website-steps-heading" className="cc-portal-client-shell-title text-xl md:text-2xl">
                {studio ? "Website steps" : "Your steps"}
              </h2>
              <p className="cc-portal-client-description mt-2 font-medium">
                Open a step to fill it in or sign it off — progress updates on this overview and on the project dashboard.
              </p>
            </div>
          </div>
          <WebsiteWorkstreamStepCards
            projectId={project.id}
            project={project}
            pageBriefs={pageBriefs}
            accountKit={accountKit}
            clientWorkflowAccessOpts={clientWorkflowAccessOpts}
          />
        </section>
      )}

      {unlocked && clientVerified && !studio ? (
        <p className="mt-8 max-w-xl font-body text-sm text-burgundy/65">
          Pinterest or mood boards? Add them on the{" "}
          <Link
            href={`/portal/project/${project.id}/website/brand-kit#website-project-inspiration`}
            className="font-semibold text-burgundy underline-offset-2 hover:underline"
          >
            brand kit
          </Link>{" "}
          step
          {inspirationLinks.length > 0
            ? ` — you have ${inspirationLinks.length} link${inspirationLinks.length === 1 ? "" : "s"} saved.`
            : "."}
        </p>
      ) : null}

      <ProjectFeedbackSection
        projectId={project.id}
        messages={messages}
        canPost={studio || clientVerified}
        className="mt-10 scroll-mt-28"
        sectionId="project-messages"
        clientVisualEmphasis={!studio}
        conversationParticipants={clientConversationStrip}
        studioCanDeleteMessages={studio}
      />
    </div>
  );
}
