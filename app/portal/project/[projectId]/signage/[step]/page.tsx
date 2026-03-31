import type { ReactNode } from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { getProjectForSession, isAgencyPortalSession } from "@/lib/portal-access";
import { clientHasFullPortalAccess } from "@/lib/portal-client-full-access";
import { redirectClientIfProjectWorkspaceLocked } from "@/lib/portal-client-workspace-gate";
import { redirectClientIfOffboardingRequired } from "@/lib/portal-offboarding-gate";
import { visiblePortalSections } from "@/lib/portal-project-kind";
import { parseInspirationLinksJson } from "@/lib/portal-inspiration-links";
import { loadAccountBrandKitSlice } from "@/lib/portal-account-brand-kit";
import { loadClientWorkflowAccessOpts } from "@/lib/portal-brand-kit-gate";
import {
  clientStepEditable,
  SIGNAGE_STEP_SLUGS,
  streamStepComplete,
  type SignageStepSlug,
} from "@/lib/portal-workflow";
import { assertClientWorkflowStepAccess } from "@/lib/portal-workflow-guard";
import { workflowStepNeighbors } from "@/lib/portal-workflow-nav";
import { InspirationLinksPanel } from "@/components/portal/InspirationLinksPanel";
import { PhaseProgressBar } from "@/components/portal/PhaseProgressBar";
import { InspirationStepContinueHint, WorkflowStepNavRow } from "@/components/portal/WorkflowStepNavRow";
import { SignageBrandKitSlim } from "@/components/portal/SignageBrandKitSlim";
import { FinalPaymentDialog, FinalDesignDownloadLink } from "@/components/portal/FinalDesignPaymentGate";
import { hasLockedFinalDesignFiles, isFinalDesignFileDownloadLocked } from "@/lib/portal-final-files";
import { portalFilePublicUrl } from "@/lib/portal-file-url";
import { reviewProgressPercent } from "@/lib/portal-progress";
import { acknowledgeSignageFinalDeliverables } from "@/app/portal/actions";
import { ClientReviewAssetSignOffForm } from "@/components/portal/ClientReviewAssetSignOffForm";
import { StudioAddReviewAssetForm } from "@/components/portal/StudioAddReviewAssetForm";
import { PortalBrandingMoodForm, PortalSaveSignageSpecificationForm } from "@/components/portal/portal-flash-action-forms";
import { PortalFormSubmitButton } from "@/components/portal/PortalFormSubmitButton";
import { ctaButtonClasses } from "@/components/ui/Button";
import { PORTAL_CLIENT_INPUT_CLASS, PortalStepSavedBadge } from "@/components/portal/PortalSectionCard";
import { loadWebsiteWorkspace } from "@/app/portal/project/[projectId]/website/_lib/load-website-workspace";

type Props = { params: { projectId: string; step: string } };

function isSignageStep(s: string): s is SignageStepSlug {
  return (SIGNAGE_STEP_SLUGS as readonly string[]).includes(s);
}

export default async function SignageWorkflowStepPage({ params }: Props) {
  const { projectId, step: stepRaw } = params;
  if (!isSignageStep(stepRaw)) notFound();

  const session = await getServerSession(authOptions);
  const project = await getProjectForSession(projectId, session);
  if (!project) notFound();

  await redirectClientIfOffboardingRequired(projectId, session);

  const studio = isAgencyPortalSession(session);
  const vis = visiblePortalSections(project.portalKind);
  if (!vis.signage && !studio) {
    redirect(`/portal/project/${project.id}`);
  }

  redirectClientIfProjectWorkspaceLocked(project, studio);

  const [assets, accountKit, clientWorkflowAccessOpts] = await Promise.all([
    prisma.reviewAsset.findMany({
      where: { projectId: project.id, kind: { in: ["SIGNAGE", "GENERAL"] } },
      orderBy: { createdAt: "asc" },
    }),
    loadAccountBrandKitSlice(project.userId),
    loadClientWorkflowAccessOpts(project.userId, project.id),
  ]);
  const signageAssets = assets.filter((a) => a.kind === "SIGNAGE");
  const generalAssets = assets.filter((a) => a.kind === "GENERAL");

  assertClientWorkflowStepAccess("signage", stepRaw, project, studio, [], assets, accountKit, clientWorkflowAccessOpts);

  const stepEditable = clientStepEditable(
    "signage",
    stepRaw,
    project,
    [],
    assets,
    accountKit,
    studio,
    clientWorkflowAccessOpts,
  );
  const stepComplete = streamStepComplete("signage", stepRaw, project, [], assets, accountKit, clientWorkflowAccessOpts);
  const proofsAssets = stepRaw === "proofs" ? signageAssets : assets;
  const clientVerified = clientHasFullPortalAccess(project);
  const canEdit = !studio && clientVerified && stepEditable;
  const notesSaved = Boolean(project.brandingMoodDescription?.trim());

  const hubHref = `/portal/project/${project.id}`;
  const { prevHref, nextHref } = workflowStepNeighbors("signage", project.id, stepRaw);

  const titles: Record<SignageStepSlug, string> = {
    "brand-kit": "Brand Kit",
    inspiration: "Inspiration",
    specification: "Sign Specification",
    proofs: "Proofs & Feedback",
    "final-files": "Final Files & Order",
  };

  let specJson: Record<string, string> = {};
  try {
    specJson = JSON.parse(project.signageSpecificationJson || "{}") as Record<string, string>;
  } catch {
    specJson = {};
  }

  let brandKitSection: ReactNode = null;
  if (stepRaw === "brand-kit") {
    if (vis.website) {
      brandKitSection = (
        <div className="mt-6 max-w-xl rounded-xl border border-burgundy/15 bg-burgundy/[0.04] p-5 font-body text-sm text-burgundy/80">
          <p className="m-0">
            This project shares brand colours, fonts, and logo with your website package. Manage them on the website
            brand kit — this step completes when those details are saved or signed off.
          </p>
          <Link
            href={`/portal/project/${project.id}/website/brand-kit`}
            className={ctaButtonClasses({ variant: "burgundy", size: "sm", className: "mt-4 inline-flex" })}
          >
            Open website brand kit
          </Link>
        </div>
      );
    } else {
      const w = await loadWebsiteWorkspace(projectId, session, { forSignageBrandKit: true });
      if (!w.ok) {
        if ("notFound" in w) notFound();
        redirect(w.redirectTo);
      }
      const clientCanEdit =
        w.clientCanEdit &&
          clientStepEditable("signage", "brand-kit", w.project, [], signageAssets, accountKit, studio, clientWorkflowAccessOpts);
      brandKitSection = <SignageBrandKitSlim w={w} clientCanEdit={clientCanEdit} />;
    }
  }

  return (
    <div>
      <Link
        href={hubHref}
        className="font-body text-[11px] uppercase tracking-[0.1em] text-burgundy/55 no-underline hover:text-burgundy"
      >
        ← Project hub
      </Link>
      <h1 className="mt-6 font-display text-cc-h2 tracking-[-0.03em] text-burgundy">{titles[stepRaw]}</h1>

      {stepRaw === "inspiration" ? (
        <p className="mt-3 max-w-xl font-body text-sm leading-relaxed text-burgundy/70">
          Share boards, accounts, or any links that show the direction you want for signage. Add written notes below if
          that helps the studio.
        </p>
      ) : null}

      {stepRaw === "brand-kit" ? brandKitSection : null}

      {stepRaw === "inspiration" ? (
        <div className="mt-10 max-w-none space-y-10 lg:max-w-4xl">
          <InspirationLinksPanel
            key={project.inspirationLinksJson}
            projectId={project.id}
            initialLinks={parseInspirationLinksJson(project.inspirationLinksJson || "[]")}
            canEdit={canEdit}
            pendingVerification={!studio && !clientVerified}
            clientEmphasis={!studio}
            sectionId={null}
            omitDescription
          />
          <div
            className={`rounded-xl border p-6 shadow-sm ${
              notesSaved ? "border-emerald-200/80 bg-emerald-50/35" : "border-zinc-200/90 bg-white"
            }`}
          >
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-display text-lg text-burgundy">Written notes</h2>
              {notesSaved ? <PortalStepSavedBadge /> : null}
            </div>
            {canEdit ? (
              <PortalBrandingMoodForm projectId={project.id} className="mt-4 flex flex-col gap-3">
                <textarea
                  name="moodDescription"
                  rows={4}
                  defaultValue={project.brandingMoodDescription || ""}
                  className={PORTAL_CLIENT_INPUT_CLASS}
                  maxLength={12000}
                />
                <button type="submit" className={ctaButtonClasses({ variant: "outline", size: "sm", className: "w-fit" })}>
                  Save notes
                </button>
              </PortalBrandingMoodForm>
            ) : (
              <p className="mt-4 whitespace-pre-wrap font-body text-sm text-burgundy/75">
                {project.brandingMoodDescription?.trim() || "—"}
              </p>
            )}
          </div>
        </div>
      ) : null}

      {stepRaw === "specification" ? (
        <PortalSaveSignageSpecificationForm projectId={project.id} className="mt-10 max-w-xl space-y-4">
          <label className="flex flex-col gap-1.5">
            <span className="font-body text-sm font-medium text-burgundy/80">Job summary *</span>
            <textarea
              name="summary"
              required
              rows={5}
              defaultValue={specJson.summary ?? ""}
              className={PORTAL_CLIENT_INPUT_CLASS}
              minLength={8}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="font-body text-sm font-medium text-burgundy/80">Dimensions / sizes</span>
            <input name="dimensions" defaultValue={specJson.dimensions ?? ""} className={PORTAL_CLIENT_INPUT_CLASS} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="font-body text-sm font-medium text-burgundy/80">Material / substrate</span>
            <input name="material" defaultValue={specJson.material ?? ""} className={PORTAL_CLIENT_INPUT_CLASS} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="font-body text-sm font-medium text-burgundy/80">Install / site notes</span>
            <textarea
              name="installNotes"
              rows={3}
              defaultValue={specJson.installNotes ?? ""}
              className={PORTAL_CLIENT_INPUT_CLASS}
            />
          </label>
          {canEdit ? (
            <PortalFormSubmitButton
              idleLabel="Submit specification"
              pendingLabel="Submitting…"
              successLabel="Specification saved ✓"
              errorFallback="Couldn’t save specification. Try again."
              variant="burgundy"
              size="sm"
            />
          ) : null}
        </PortalSaveSignageSpecificationForm>
      ) : null}

      {stepRaw === "proofs" ? (
        <SignageProofsBody project={project} studio={studio} assets={proofsAssets} canSignOff={canEdit} />
      ) : null}

      {stepRaw === "final-files" ? (
        <SignageFinalBody
          project={project}
          studio={studio}
          signageAssets={signageAssets}
          generalAssets={generalAssets}
          clientVerified={clientVerified}
          canEdit={canEdit}
        />
      ) : null}

      {stepRaw === "inspiration" && !studio && clientVerified ? (
        <InspirationStepContinueHint stepComplete={stepComplete} />
      ) : null}
      <WorkflowStepNavRow hubHref={hubHref} prevHref={prevHref} nextHref={nextHref} nextDisabled={!stepComplete} />
    </div>
  );
}

function SignageProofsBody({
  project,
  studio,
  assets,
  canSignOff,
}: {
  project: NonNullable<Awaited<ReturnType<typeof getProjectForSession>>>;
  studio: boolean;
  assets: Awaited<ReturnType<typeof prisma.reviewAsset.findMany>>;
  canSignOff: boolean;
}) {
  const pct = reviewProgressPercent(assets, "SIGNAGE");
  return (
    <>
      <div className="mt-10 max-w-xl">
        <PhaseProgressBar
          label="Signage proofs"
          percent={pct}
          hint={
            assets.length
              ? `${assets.filter((a) => a.clientSignedOff).length} of ${assets.length} signed off`
              : "Files will appear when the studio uploads them."
          }
        />
      </div>
      <ul className="mt-12 flex max-w-3xl flex-col gap-8">
        {assets.map((asset) => (
          <li key={asset.id} className="rounded-xl border border-zinc-200/90 bg-white p-5 shadow-sm md:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:justify-between">
              <div className="min-w-0">
                <h2 className="font-display text-cc-h4 text-burgundy">{asset.title}</h2>
                {asset.notes ? (
                  <p className="mt-3 whitespace-pre-wrap font-body text-sm text-burgundy/75">{asset.notes}</p>
                ) : null}
                {asset.filePath ? (
                  <FinalDesignDownloadLink
                    href={portalFilePublicUrl(asset.filePath)}
                    locked={isFinalDesignFileDownloadLocked(asset, project, studio)}
                    projectId={project.id}
                  />
                ) : (
                  <p className="mt-4 font-body text-[12px] text-burgundy/50">File coming soon.</p>
                )}
              </div>
              {canSignOff && !asset.clientSignedOff ? (
                <ClientReviewAssetSignOffForm projectId={project.id} assetId={asset.id} className="md:shrink-0" />
              ) : null}
            </div>
          </li>
        ))}
      </ul>
      {studio ? (
        <section className="mt-16 max-w-lg border-t border-burgundy/15 pt-12">
          <h2 className="font-display text-lg text-burgundy">Add signage item</h2>
          <StudioAddReviewAssetForm className="mt-6 flex flex-col gap-4" idleLabel="Upload" variant="outline">
            <input type="hidden" name="projectId" value={project.id} />
            <input type="hidden" name="reviewAssetKind" value="SIGNAGE" />
            <input name="title" required className={PORTAL_CLIENT_INPUT_CLASS} placeholder="Title" />
            <textarea name="notes" rows={2} className={PORTAL_CLIENT_INPUT_CLASS} placeholder="Notes" />
            <input name="file" type="file" className="font-body text-xs text-burgundy" />
          </StudioAddReviewAssetForm>
        </section>
      ) : null}
    </>
  );
}

function SignageFinalBody({
  project,
  studio,
  signageAssets,
  generalAssets,
  clientVerified,
  canEdit,
}: {
  project: NonNullable<Awaited<ReturnType<typeof getProjectForSession>>>;
  studio: boolean;
  signageAssets: Awaited<ReturnType<typeof prisma.reviewAsset.findMany>>;
  generalAssets: Awaited<ReturnType<typeof prisma.reviewAsset.findMany>>;
  clientVerified: boolean;
  canEdit: boolean;
}) {
  const paymentScope = [...signageAssets, ...generalAssets];
  const showFinalPaymentModal =
    !studio && clientVerified && hasLockedFinalDesignFiles(paymentScope, project, studio);
  const proofsHref = `/portal/project/${project.id}/signage/proofs`;
  const generalPct = reviewProgressPercent(generalAssets, "GENERAL");
  const hasSignageFiles = signageAssets.some((a) => a.filePath);
  const hasGeneralFiles = generalAssets.some((a) => a.filePath);

  return (
    <>
      {showFinalPaymentModal ? <FinalPaymentDialog projectId={project.id} autoOpen /> : null}

      {!studio && clientVerified ? (
        <p
          id="signage-final-payment-note"
          className="scroll-mt-28 mt-6 max-w-xl font-body text-[13px] leading-relaxed text-burgundy/60"
        >
          <strong className="font-medium text-burgundy/80">Final files &amp; payment:</strong> signed-off downloads stay
          locked until you confirm final payment in the popup — then everything opens as usual.
        </p>
      ) : null}

      {signageAssets.length > 0 ? (
        <div id="signage-final-order" className="scroll-mt-28 mt-10">
          <h2 className="font-display text-lg text-burgundy">Signage print-ready files</h2>
          <p className="mt-2 max-w-xl font-body text-sm text-burgundy/65">
            Production files from your approved proofs. Sign off on proofs first if anything is still open.
          </p>
          <ul className="mt-6 flex max-w-3xl flex-col gap-6">
            {signageAssets.map((asset) => (
              <li key={asset.id} className="rounded-xl border border-zinc-200/90 bg-white p-5">
                <h3 className="font-display text-cc-h4 text-burgundy">{asset.title}</h3>
                {asset.clientSignedOff && asset.filePath ? (
                  <FinalDesignDownloadLink
                    href={portalFilePublicUrl(asset.filePath)}
                    locked={isFinalDesignFileDownloadLocked(asset, project, studio)}
                    projectId={project.id}
                  />
                ) : (
                  <p className="mt-2 font-body text-sm text-burgundy/65">
                    <Link href={proofsHref} className="underline">
                      Sign off on proofs
                    </Link>{" "}
                    first.
                  </p>
                )}
              </li>
            ))}
          </ul>
          {!studio && clientVerified && hasSignageFiles && canEdit ? (
            <form action={acknowledgeSignageFinalDeliverables.bind(null, project.id)} className="mt-8">
              <button type="submit" className={ctaButtonClasses({ variant: "burgundy", size: "sm" })}>
                Confirm print-ready files &amp; order
              </button>
            </form>
          ) : null}
        </div>
      ) : null}

      {generalAssets.length > 0 || studio ? (
        <div id="signage-shared-files" className="scroll-mt-28 mt-14 max-w-xl border-t border-burgundy/10 pt-12">
          <h2 className="font-display text-lg text-burgundy">Shared files</h2>
          <p className="mt-2 font-body text-sm text-burgundy/65">
            Briefs, exports, PDFs, SVGs, and anything else the studio shares for you to sign off and download — same
            payment rules as above when files are locked.
          </p>
          <div className="mt-8">
            <PhaseProgressBar
              label="Shared files"
              percent={generalAssets.length ? generalPct : 0}
              hint={
                generalAssets.length
                  ? `${generalAssets.filter((a) => a.clientSignedOff).length} of ${generalAssets.length} signed off`
                  : "Files will appear when the studio adds them."
              }
            />
          </div>
          <ul className="mt-10 flex max-w-3xl flex-col gap-8">
            {generalAssets.map((asset) => (
              <li key={asset.id} className="rounded-xl border border-zinc-200/90 bg-white p-5 shadow-sm md:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-cc-h4 text-burgundy">{asset.title}</h3>
                      {asset.clientSignedOff ? (
                        <span className="rounded-full border border-burgundy/15 bg-burgundy/[0.06] px-2.5 py-0.5 font-body text-[9px] uppercase tracking-[0.1em] text-burgundy/75">
                          Signed off
                        </span>
                      ) : null}
                    </div>
                    {asset.notes ? (
                      <p className="mt-3 whitespace-pre-wrap font-body text-sm text-burgundy/75">{asset.notes}</p>
                    ) : null}
                    {asset.filePath ? (
                      <FinalDesignDownloadLink
                        href={portalFilePublicUrl(asset.filePath)}
                        locked={isFinalDesignFileDownloadLocked(asset, project, studio)}
                        projectId={project.id}
                      />
                    ) : (
                      <p className="mt-4 font-body text-[12px] text-burgundy/50">File coming soon.</p>
                    )}
                  </div>
                  {!studio && !asset.clientSignedOff && canEdit ? (
                    <ClientReviewAssetSignOffForm projectId={project.id} assetId={asset.id} className="md:shrink-0" />
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
          {studio ? (
            <section className="mt-12 border-t border-burgundy/15 pt-10">
              <h3 className="font-display text-cc-h4 text-burgundy">Upload shared file for review</h3>
              <p className="mt-2 max-w-xl font-body text-sm text-burgundy/65">
                Add a title, optional notes, and attach a file. Your client is notified when they next open the portal.
              </p>
              <StudioAddReviewAssetForm
                className="mt-6 flex max-w-lg flex-col gap-4"
                idleLabel="Add file"
                variant="outline"
              >
                <input type="hidden" name="projectId" value={project.id} />
                <input type="hidden" name="reviewAssetKind" value="GENERAL" />
                <label className="flex flex-col gap-1.5">
                  <span className="font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/55">Title *</span>
                  <input name="title" required className={PORTAL_CLIENT_INPUT_CLASS} />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/55">Notes</span>
                  <textarea name="notes" rows={3} className={PORTAL_CLIENT_INPUT_CLASS} />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/55">File</span>
                  <input name="file" type="file" className="font-body text-xs text-burgundy" />
                </label>
              </StudioAddReviewAssetForm>
            </section>
          ) : null}
        </div>
      ) : null}

      {!hasSignageFiles && !hasGeneralFiles ? (
        <p className="mt-10 max-w-xl font-body text-sm text-burgundy/60">
          Nothing here yet — the studio will add print-ready signage and any shared files when they&apos;re ready.
        </p>
      ) : null}
    </>
  );
}
