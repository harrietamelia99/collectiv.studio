import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirectClientIfOffboardingRequired } from "@/lib/portal-offboarding-gate";
import { websitePreviewHubProgressPercent } from "@/lib/portal-progress";
import {
  PortalSectionCard,
  PORTAL_CLIENT_FORM_WELL_CLASS,
  PORTAL_CLIENT_INPUT_CLASS,
} from "@/components/portal/PortalSectionCard";
import { PhaseProgressBar } from "@/components/portal/PhaseProgressBar";
import { setWebsiteLiveUrl } from "@/app/portal/actions";
import { PortalWebsiteSignOffForm } from "@/components/portal/portal-flash-action-forms";
import { ctaButtonClasses } from "@/components/ui/Button";
import { loadWebsiteWorkspace } from "@/app/portal/project/[projectId]/website/_lib/load-website-workspace";
import { loadAccountBrandKitSlice } from "@/lib/portal-account-brand-kit";
import { loadClientWorkflowAccessOpts } from "@/lib/portal-brand-kit-gate";
import { assertClientWorkflowStepAccess } from "@/lib/portal-workflow-guard";
import { clientStepEditable } from "@/lib/portal-workflow";

type Props = { params: { projectId: string } };

export default async function WebsitePreviewPage({ params }: Props) {
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
    clientCanEdit: baseClientCanEdit,
    pageBriefs,
    sectionVariant,
  } = w;

  const [accountKit, clientWorkflowAccessOpts] = await Promise.all([
    loadAccountBrandKitSlice(project.userId),
    loadClientWorkflowAccessOpts(project.userId, project.id),
  ]);

  assertClientWorkflowStepAccess(
    "website",
    "preview",
    w.project,
    w.studio,
    w.pageBriefs,
    [],
    accountKit,
    clientWorkflowAccessOpts,
  );

  const clientCanEdit =
    baseClientCanEdit &&
    clientStepEditable("website", "preview", project, pageBriefs, [], accountKit, studio, clientWorkflowAccessOpts);

  const previewPct = websitePreviewHubProgressPercent(project, pageBriefs);
  const hasLink = Boolean(project.websiteLiveUrl?.trim());

  return (
    <div>
      <Link
        href={`/portal/project/${project.id}/website`}
        className="font-body text-[11px] uppercase tracking-[0.1em] text-burgundy/55 no-underline hover:text-burgundy"
      >
        ← Website overview
      </Link>
      <h1 className="mt-6 font-display text-cc-h2 tracking-[-0.03em] text-burgundy">Preview &amp; Feedback</h1>
      <p className="mt-3 max-w-xl lg:max-w-3xl font-body text-sm leading-relaxed text-burgundy/70">
        {studio ? (
          <>
            Paste the staging or live URL when the build is ready for the client to open in the browser. They can sign
            off once they&apos;ve reviewed it.
          </>
        ) : (
          <>
            When the studio adds your link, open it here and check the site in the browser. Sign off when you&apos;re
            happy with this first look (or leave notes in Messages).
          </>
        )}
      </p>

      <div className="mt-10 max-w-xl lg:max-w-3xl">
        <PhaseProgressBar
          label="Preview"
          percent={previewPct}
          hint={
            unlocked
              ? hasLink || project.websitePreviewSignedOff
                ? project.websitePreviewSignedOff
                  ? "Signed off — continue to domain & go live when you’re ready."
                  : "Open the link, then sign off below when you’ve reviewed it."
                : "Waiting on the studio to share a staging or live URL."
              : "Unlocks once your contract is signed and, if applicable, your deposit is confirmed by the studio."
          }
        />
      </div>

      {!studio && !clientVerified ? (
        <div className="cc-portal-client-shell mt-8 font-body text-sm text-burgundy/80">
          The studio is still verifying your account.
        </div>
      ) : null}

      {!unlocked ? (
        <div className="cc-portal-client-shell mt-10 font-body text-sm leading-relaxed text-burgundy/75">
          {studio
            ? "Confirm contract and deposit (if applicable) on the project overview — the website hub unlocks for your client automatically."
            : "This unlocks once your contract is signed and, if applicable, your deposit is confirmed by the studio."}
        </div>
      ) : (
        <div className="mt-12 flex flex-col gap-8">
          <div id="website-client-preview" className="scroll-mt-28">
            {hasLink ? (
              <PortalSectionCard
                headingId="website-preview-link-heading"
                title="Your site link"
                description={<p className="m-0">Open in a new tab to review the draft in the browser.</p>}
                variant={sectionVariant}
                className="max-w-none lg:max-w-4xl"
              >
                <a
                  href={project.websiteLiveUrl!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block font-body text-sm font-semibold text-burgundy underline underline-offset-4"
                >
                  {project.websiteLiveUrl}
                </a>
              </PortalSectionCard>
            ) : (
              <div className="cc-portal-client-shell font-body text-sm text-burgundy/70">
                {studio ? (
                  <p className="m-0">Add the URL in the form below when you have a staging or live link to share.</p>
                ) : (
                  <p className="m-0">
                    The studio will add a link here when there&apos;s a preview or live URL to share.
                  </p>
                )}
              </div>
            )}
          </div>

          {studio ? (
            <PortalSectionCard
              headingId="website-site-link-heading"
              title="Site link for client"
              description={
                <p className="m-0">Paste staging or live URL (https only). The client sees it on this step.</p>
              }
              variant="client"
              className="max-w-none lg:max-w-4xl"
            >
              <div className={PORTAL_CLIENT_FORM_WELL_CLASS}>
                <form action={setWebsiteLiveUrl.bind(null, project.id)} className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <label className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <span className="mb-0.5 block font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-burgundy">
                      URL
                    </span>
                    <input
                      name="websiteLiveUrl"
                      type="url"
                      placeholder="https://"
                      defaultValue={project.websiteLiveUrl ?? ""}
                      className={PORTAL_CLIENT_INPUT_CLASS}
                    />
                  </label>
                  <button type="submit" className={ctaButtonClasses({ variant: "outline", size: "sm", className: "shrink-0" })}>
                    Save link
                  </button>
                </form>
              </div>
            </PortalSectionCard>
          ) : null}

          <PortalSectionCard
            headingId="website-preview-signoff-heading"
            title="Preview sign-off"
            description={
              <p className="m-0">
                Confirm you&apos;ve opened the link and you&apos;re happy for us to treat this preview as reviewed (you
                can still message us with tweaks).
              </p>
            }
            variant={sectionVariant}
            className="max-w-none lg:max-w-4xl"
          >
            {clientCanEdit ? (
              <div className={PORTAL_CLIENT_FORM_WELL_CLASS}>
                {!hasLink && !project.websitePreviewSignedOff ? (
                  <p className="m-0 font-body text-sm text-burgundy/70">
                    The studio hasn&apos;t shared a link yet — you&apos;ll be able to sign off once it appears above.
                  </p>
                ) : null}
                <div className="mt-4 flex flex-wrap gap-4">
                  {!project.websitePreviewSignedOff ? (
                    <PortalWebsiteSignOffForm projectId={project.id} step="preview" next>
                      <button
                        type="submit"
                        disabled={!hasLink}
                        className={ctaButtonClasses({
                          variant: "ink",
                          size: "md",
                          className: "px-8 disabled:pointer-events-none disabled:opacity-45",
                        })}
                      >
                        Sign off preview
                      </button>
                    </PortalWebsiteSignOffForm>
                  ) : (
                    <PortalWebsiteSignOffForm projectId={project.id} step="preview" next={false}>
                      <button
                        type="submit"
                        className={ctaButtonClasses({ variant: "outline", size: "sm", className: "px-6" })}
                      >
                        Undo preview sign-off
                      </button>
                    </PortalWebsiteSignOffForm>
                  )}
                </div>
              </div>
            ) : null}
            {project.websitePreviewSignedOff ? (
              <p className="mb-0 mt-4 font-body text-[12px] text-burgundy/70">Preview signed off.</p>
            ) : null}
            <p className="mb-0 mt-6 font-body text-sm text-burgundy/65">
              Next:{" "}
              <Link href={`/portal/project/${project.id}/website/domain`} className="font-semibold text-burgundy underline-offset-2 hover:underline">
                Domain &amp; go live
              </Link>
            </p>
          </PortalSectionCard>
        </div>
      )}
    </div>
  );
}
