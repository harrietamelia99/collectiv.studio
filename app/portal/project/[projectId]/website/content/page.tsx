import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirectClientIfOffboardingRequired } from "@/lib/portal-offboarding-gate";
import { websitePageContentHubProgressPercent } from "@/lib/portal-progress";
import {
  PortalSectionCard,
  PORTAL_CLIENT_INPUT_CLASS,
} from "@/components/portal/PortalSectionCard";
import { PhaseProgressBar } from "@/components/portal/PhaseProgressBar";
import { WebsitePageBriefsTabs } from "@/components/portal/WebsitePageBriefsTabs";
import { setWebsiteSitemap } from "@/app/portal/actions";
import { PortalWebsiteSignOffForm } from "@/components/portal/portal-flash-action-forms";
import { ctaButtonClasses } from "@/components/ui/Button";
import {
  briefsForTabs,
  loadWebsiteWorkspace,
} from "@/app/portal/project/[projectId]/website/_lib/load-website-workspace";
import { loadAccountBrandKitSlice } from "@/lib/portal-account-brand-kit";
import { loadClientWorkflowAccessOpts } from "@/lib/portal-brand-kit-gate";
import { assertClientWorkflowStepAccess } from "@/lib/portal-workflow-guard";
import { clientStepEditable } from "@/lib/portal-workflow";

type Props = { params: { projectId: string } };

export default async function WebsiteContentPage({ params }: Props) {
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
    canStudioEditSitemap,
    showWebsitePackageSection,
    pageBriefs,
    pageLabels,
    sectionVariant,
    formWellClass,
  } = w;

  const [accountKit, clientWorkflowAccessOpts] = await Promise.all([
    loadAccountBrandKitSlice(project.userId),
    loadClientWorkflowAccessOpts(project.userId, project.id),
  ]);

  assertClientWorkflowStepAccess(
    "website",
    "content",
    project,
    studio,
    pageBriefs,
    [],
    accountKit,
    clientWorkflowAccessOpts,
  );

  const clientCanEdit =
    baseClientCanEdit &&
    clientStepEditable("website", "content", project, pageBriefs, [], accountKit, studio, clientWorkflowAccessOpts);

  const contentPct = websitePageContentHubProgressPercent(project, pageBriefs);
  const contentReadyForSignOff =
    websitePageContentHubProgressPercent({ ...project, websiteContentSignedOff: false }, pageBriefs) >= 100;

  return (
    <div>
      <Link
        href={`/portal/project/${project.id}/website`}
        className="font-body text-[11px] uppercase tracking-[0.1em] text-burgundy/55 no-underline hover:text-burgundy"
      >
        ← Website overview
      </Link>
      <h1 className="mt-6 font-display text-cc-h2 tracking-[-0.03em] text-burgundy">Website content</h1>
      <p className="mt-3 max-w-xl lg:max-w-3xl font-body text-sm leading-relaxed text-burgundy/70">
        {studio ? (
          <>
            Page count comes from the client&apos;s package; they name each tab and add copy and reference images per
            page.
          </>
        ) : (
          <>
            Name your page tabs to match your site structure, then add headline, body, and reference visuals for every
            page. Sign off when you&apos;re ready for the studio to build from this content.
          </>
        )}
      </p>

      <div className="mt-10 max-w-xl lg:max-w-3xl">
        <PhaseProgressBar
          label="Page content"
          percent={contentPct}
          hint={
            unlocked
              ? project.websiteContentSignedOff
                ? "Signed off — review the preview when the studio shares a link."
                : "Every page needs headline or body copy, or at least one reference image."
              : "Unlocks once your contract is signed and, if applicable, your deposit is confirmed by the studio."
          }
        />
      </div>

      {!studio && !clientVerified ? (
        <div className="cc-portal-client-shell mt-8 font-body text-sm text-burgundy/80">
          The studio is still verifying your account. You&apos;ll be able to edit content once that&apos;s complete.
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
          {showWebsitePackageSection ? (
            <PortalSectionCard
              headingId="website-package-heading"
              title="Website package (pages)"
              description={
                <p className="m-0">
                  {canStudioEditSitemap ? (
                    <>
                      Set the page count for this build from the client&apos;s package, and name each tab. They use
                      those tabs to add copy and imagery for each page.
                    </>
                  ) : (
                    <>
                      Your build includes {project.websitePageCount} page
                      {project.websitePageCount === 1 ? "" : "s"} (set by the studio). Name each line below to match the
                      tabs — you can adjust wording, not the total count.
                    </>
                  )}
                </p>
              }
              variant={sectionVariant}
            >
              <div className={formWellClass}>
                <form action={setWebsiteSitemap.bind(null, project.id)} className="flex max-w-full flex-col gap-4 lg:max-w-3xl">
                  {canStudioEditSitemap ? (
                    <label className="flex flex-col gap-1.5">
                      <span className="font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-burgundy">
                        Number of pages
                      </span>
                      <select
                        name="pageCount"
                        defaultValue={String(project.websitePageCount)}
                        className={PORTAL_CLIENT_INPUT_CLASS}
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                          <option key={n} value={String(n)}>
                            {n} page{n === 1 ? "" : "s"}
                          </option>
                        ))}
                      </select>
                    </label>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      <span className="font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-burgundy">
                        Number of pages
                      </span>
                      <div
                        className="rounded-lg border border-zinc-200/80 bg-zinc-100/50 px-3 py-2.5 font-body text-sm text-burgundy/80"
                        aria-readonly="true"
                      >
                        {project.websitePageCount} page{project.websitePageCount === 1 ? "" : "s"} (from your package)
                      </div>
                    </div>
                  )}
                  <label className="flex flex-col gap-1.5">
                    <span className="font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-burgundy">
                      Page names (one per line)
                    </span>
                    <textarea
                      name="labels"
                      rows={5}
                      defaultValue={pageLabels.slice(0, project.websitePageCount).join("\n")}
                      placeholder={"Home\nAbout\nServices\nContact"}
                      className={PORTAL_CLIENT_INPUT_CLASS}
                    />
                  </label>
                  <button type="submit" className={ctaButtonClasses({ variant: "outline", size: "sm", className: "w-fit" })}>
                    {canStudioEditSitemap ? "Update site structure" : "Save page names"}
                  </button>
                </form>
              </div>
            </PortalSectionCard>
          ) : null}

          <PortalSectionCard
            headingId="website-page-content-heading"
            title="Page-by-page content"
            description={
              <p className="m-0">
                Choose a page, then add headline, body copy, and reference images — we use this in build and design. Save
                each page before switching tabs if you have unsaved changes.
              </p>
            }
            variant={sectionVariant}
          >
            <WebsitePageBriefsTabs
              projectId={project.id}
              labels={pageLabels}
              briefs={briefsForTabs(pageBriefs)}
              clientCanEdit={clientCanEdit}
            />
            {studio ? (
              <p className="mb-0 mt-4 font-body text-[11px] text-burgundy/50">
                Read-only for studio — the client supplies page copy and reference images.
              </p>
            ) : null}
          </PortalSectionCard>

          <PortalSectionCard
            headingId="website-content-signoff-heading"
            title="Content sign-off"
            description={
              <p className="m-0">
                When every page has copy or reference imagery and you&apos;re happy for us to build from this, confirm
                here.
              </p>
            }
            variant={sectionVariant}
          >
            {clientCanEdit ? (
              <div className={formWellClass}>
                {!contentReadyForSignOff && !project.websiteContentSignedOff ? (
                  <p className="m-0 font-body text-sm text-burgundy/70">
                    Complete all pages first (each needs text or at least one image) before you can sign off.
                  </p>
                ) : null}
                <div className="mt-4 flex flex-wrap gap-4">
                  {!project.websiteContentSignedOff ? (
                    <PortalWebsiteSignOffForm projectId={project.id} step="content" next>
                      <button
                        type="submit"
                        disabled={!contentReadyForSignOff}
                        className={ctaButtonClasses({
                          variant: "ink",
                          size: "md",
                          className: "px-8 disabled:pointer-events-none disabled:opacity-45",
                        })}
                      >
                        Sign off website content
                      </button>
                    </PortalWebsiteSignOffForm>
                  ) : (
                    <PortalWebsiteSignOffForm projectId={project.id} step="content" next={false}>
                      <button
                        type="submit"
                        className={ctaButtonClasses({ variant: "outline", size: "sm", className: "px-6" })}
                      >
                        Undo content sign-off
                      </button>
                    </PortalWebsiteSignOffForm>
                  )}
                </div>
              </div>
            ) : null}
            {project.websiteContentSignedOff ? (
              <p className="mb-0 mt-4 font-body text-[12px] text-burgundy/70">Website content signed off.</p>
            ) : null}
            <p className="mb-0 mt-6 font-body text-sm text-burgundy/65">
              Next:{" "}
              <Link href={`/portal/project/${project.id}/website/preview`} className="font-semibold text-burgundy underline-offset-2 hover:underline">
                First draft &amp; preview
              </Link>
            </p>
          </PortalSectionCard>
        </div>
      )}
    </div>
  );
}
