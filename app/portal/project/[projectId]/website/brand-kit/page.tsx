import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { redirectClientIfOffboardingRequired } from "@/lib/portal-offboarding-gate";
import { websiteKitHubProgressPercent } from "@/lib/portal-progress";
import { portalFilePublicUrl } from "@/lib/portal-file-url";
import { InspirationLinksPanel } from "@/components/portal/InspirationLinksPanel";
import { PhaseProgressBar } from "@/components/portal/PhaseProgressBar";
import { PortalSectionCard } from "@/components/portal/PortalSectionCard";
import { WebsiteBrandColourFields } from "@/components/portal/WebsiteBrandColourFields";
import { WebsiteLogoVariationsPanel } from "@/components/portal/WebsiteLogoVariationsPanel";
import { clearWebsiteLogo, removeWebsiteFont, uploadWebsiteFont, uploadWebsiteLogo } from "@/app/portal/actions";
import {
  PortalApplyUserBrandKitForm,
  PortalSaveUserBrandKitForm,
  PortalSaveWebsiteColoursForm,
  PortalWebsiteSignOffForm,
} from "@/components/portal/portal-flash-action-forms";
import { PortalFormSubmitButton } from "@/components/portal/PortalFormSubmitButton";
import { ctaButtonClasses } from "@/components/ui/Button";
import { loadWebsiteWorkspace } from "@/app/portal/project/[projectId]/website/_lib/load-website-workspace";
import { loadAccountBrandKitSlice } from "@/lib/portal-account-brand-kit";
import { loadClientWorkflowAccessOpts } from "@/lib/portal-brand-kit-gate";
import { assertClientWorkflowStepAccess } from "@/lib/portal-workflow-guard";
import { clientStepEditable } from "@/lib/portal-workflow";

type Props = { params: { projectId: string } };

function stripHash(hex: string | null | undefined) {
  if (!hex) return "";
  return hex.replace(/^#/, "");
}

export default async function WebsiteKitPage({ params }: Props) {
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
    fonts,
    logoVariations,
    inspirationLinks,
    sectionVariant,
    formWellClass,
  } = w;

  const [accountKit, clientWorkflowAccessOpts] = await Promise.all([
    loadAccountBrandKitSlice(project.userId),
    loadClientWorkflowAccessOpts(project.userId, project.id),
  ]);

  assertClientWorkflowStepAccess(
    "website",
    "brand-kit",
    w.project,
    w.studio,
    [],
    [],
    accountKit,
    clientWorkflowAccessOpts,
  );

  const clientCanEdit =
    baseClientCanEdit &&
    clientStepEditable("website", "brand-kit", project, [], [], accountKit, studio, clientWorkflowAccessOpts);

  const kitPct = websiteKitHubProgressPercent(project);
  const accountBrandKit =
    !studio && project.userId
      ? await prisma.userBrandKit.findUnique({ where: { userId: project.userId } })
      : null;

  return (
    <div>
      <Link
        href={`/portal/project/${project.id}/website`}
        className="font-body text-[11px] uppercase tracking-[0.1em] text-burgundy/55 no-underline hover:text-burgundy"
      >
        ← Website overview
      </Link>
      <h1 className="mt-6 font-display text-cc-h2 tracking-[-0.03em] text-burgundy">Brand Kit</h1>
      <p className="mt-3 max-w-xl lg:max-w-3xl font-body text-sm leading-relaxed text-burgundy/70">
        {studio ? (
          <>
            Brand colours, fonts, logo, and mood links. The client signs off here before you rely on the kit for build.
          </>
        ) : (
          <>
            Add HEX colours, fonts, and logo, plus any logo variations and inspiration links. When it reflects your
            brand, sign off so the studio can build.
          </>
        )}
      </p>

      {!studio && clientVerified ? (
        <div className="mt-6 flex max-w-xl flex-col gap-3 rounded-xl border border-burgundy/15 bg-burgundy/[0.03] p-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
          <p className="m-0 flex-1 font-body text-sm text-burgundy/75">
            Reuse this brand kit on future projects: save what you&apos;ve entered here to your account, or pull in a
            kit you saved before (only fills empty fields).
          </p>
          <div className="flex flex-wrap gap-2">
            <PortalSaveUserBrandKitForm>
              <input type="hidden" name="projectId" value={project.id} />
              <PortalFormSubmitButton
                idleLabel="Save to my account"
                pendingLabel="Saving…"
                successLabel="Brand kit saved to your account ✓"
                errorFallback="Couldn’t save brand kit. Try again."
                variant="outline"
                size="sm"
              />
            </PortalSaveUserBrandKitForm>
            {accountBrandKit ? (
              <PortalApplyUserBrandKitForm>
                <input type="hidden" name="projectId" value={project.id} />
                <PortalFormSubmitButton
                  idleLabel="Apply account kit"
                  pendingLabel="Applying…"
                  successLabel="Account brand kit applied ✓"
                  errorFallback="Couldn’t apply brand kit. Try again."
                  variant="burgundy"
                  size="sm"
                />
              </PortalApplyUserBrandKitForm>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="mt-10 max-w-xl lg:max-w-3xl">
        <PhaseProgressBar
          label="Kit progress"
          percent={kitPct}
          hint={
            unlocked
              ? clientVerified || studio
                ? "Primary colour, fonts, logo, then sign off when the kit is ready."
                : "Your account must be verified by the studio before you can edit this kit."
              : "Unlocks once your contract is signed and, if applicable, your deposit is confirmed by the studio."
          }
        />
      </div>

      <InspirationLinksPanel
        key={`insp-website-${project.inspirationLinksJson}`}
        projectId={project.id}
        initialLinks={inspirationLinks}
        canEdit={!studio && clientVerified}
        pendingVerification={!studio && !clientVerified}
        clientEmphasis={!studio}
        sectionId="website-project-inspiration"
        className="scroll-mt-28 mt-8 max-w-none lg:max-w-4xl"
      />

      {!studio && !clientVerified ? (
        <div className="cc-portal-client-shell mt-8 font-body text-sm text-burgundy/80">
          The studio is still verifying your account. You&apos;ll be able to edit your website kit once that&apos;s
          complete.
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
          <PortalSectionCard
            headingId="website-brand-colours-heading"
            title="Brand colours (HEX)"
            description={
              <p className="m-0">
                Enter six-digit hex values (with or without #). Primary is required at minimum; add secondary, accent,
                and an optional fourth if your brand uses them.
              </p>
            }
            variant={sectionVariant}
          >
            <div className={formWellClass}>
              <PortalSaveWebsiteColoursForm
                projectId={project.id}
                className="grid max-w-full gap-4 sm:grid-cols-2 lg:max-w-5xl lg:grid-cols-4"
              >
                <WebsiteBrandColourFields
                  key={`${project.id}-${project.websitePrimaryHex ?? ""}-${project.websiteSecondaryHex ?? ""}-${project.websiteAccentHex ?? ""}-${project.websiteQuaternaryHex ?? ""}`}
                  initialPrimary={stripHash(project.websitePrimaryHex)}
                  initialSecondary={stripHash(project.websiteSecondaryHex)}
                  initialAccent={stripHash(project.websiteAccentHex)}
                  initialQuaternary={stripHash(project.websiteQuaternaryHex)}
                  clientCanEdit={clientCanEdit}
                />
                {clientCanEdit ? (
                  <button
                    type="submit"
                    className={ctaButtonClasses({
                      variant: "outline",
                      size: "sm",
                      className: "sm:col-span-2 lg:col-span-4 sm:w-fit",
                    })}
                  >
                    Save colours
                  </button>
                ) : null}
              </PortalSaveWebsiteColoursForm>
            </div>
            {studio ? (
              <p className="mb-0 mt-4 font-body text-[11px] text-burgundy/50">
                Read-only for studio - values shown as saved by the client.
              </p>
            ) : null}
          </PortalSectionCard>

          <PortalSectionCard
            headingId="website-brand-fonts-heading"
            title="Brand fonts"
            description={<p className="m-0">Upload .woff, .woff2, .ttf, or .otf files. Add each font file separately.</p>}
            variant={sectionVariant}
          >
            <div className={`${formWellClass} max-w-full font-body text-[12px] leading-relaxed text-burgundy/80 lg:max-w-4xl`} role="note">
              <p className="m-0 font-medium text-burgundy">Web-friendly fonts & licensing</p>
              <p className="mb-0 mt-2">
                For use on your live website, fonts should be suitable for the web (e.g.{" "}
                <strong className="font-medium">.woff2</strong> is ideal) and you must have the{" "}
                <strong className="font-medium">right to embed them online</strong> — many desktop-only or trial
                licences do not allow @font-face or public site use. If you are unsure, check your font licence or
                supplier, or ask the studio before purchase. By uploading files here you confirm you are allowed to use
                them for your project website; the studio may suggest alternatives if a font cannot be used legally or
                technically on the web.
              </p>
            </div>
            {fonts.length > 0 ? (
              <ul className="mt-4 flex flex-col gap-3">
                {fonts.map((rel, i) => (
                  <li
                    key={`${rel}-${i}`}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-200/90 bg-white px-4 py-3"
                  >
                    <a
                      href={portalFilePublicUrl(rel)}
                      className="font-body text-[12px] text-burgundy underline underline-offset-4"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {rel.split("/").pop()}
                    </a>
                    {clientCanEdit ? (
                      <form action={removeWebsiteFont.bind(null, project.id, i)}>
                        <button
                          type="submit"
                          className="font-body text-[10px] uppercase tracking-[0.1em] text-burgundy/55 underline"
                        >
                          Remove
                        </button>
                      </form>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 font-body text-[12px] text-burgundy/50">No fonts uploaded yet.</p>
            )}
            {clientCanEdit ? (
              <div className={`${formWellClass} mt-4 max-w-full lg:max-w-2xl`}>
                <form action={uploadWebsiteFont.bind(null, project.id)} encType="multipart/form-data" className="flex flex-col gap-3">
                  <span className="font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-burgundy">
                    Font file
                  </span>
                  <input
                    name="font"
                    type="file"
                    accept=".woff,.woff2,.ttf,.otf,font/woff,font/woff2"
                    required
                    className="font-body text-[12px] text-burgundy file:mr-3 file:rounded-full file:border file:border-burgundy/20 file:bg-white file:px-4 file:py-2 file:font-body file:text-[10px] file:uppercase file:tracking-[0.1em]"
                  />
                  <button type="submit" className={ctaButtonClasses({ variant: "outline", size: "sm", className: "w-fit" })}>
                    Upload font
                  </button>
                </form>
              </div>
            ) : null}
          </PortalSectionCard>

          <PortalSectionCard headingId="website-primary-logo-heading" title="Primary logo" variant={sectionVariant}>
            <div className={formWellClass}>
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                <div className="sm:w-48">
                  {project.websiteLogoPath ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={portalFilePublicUrl(project.websiteLogoPath)}
                      alt="Uploaded logo"
                      className="max-h-40 w-full rounded-lg border border-burgundy/10 bg-white object-contain p-3"
                    />
                  ) : (
                    <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-burgundy/20 bg-white font-body text-[11px] text-burgundy/45">
                      No logo yet
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-3">
                  {clientCanEdit ? (
                    <>
                      <form action={uploadWebsiteLogo.bind(null, project.id)} encType="multipart/form-data">
                        <input
                          name="logo"
                          type="file"
                          accept="image/svg+xml,image/png,image/jpeg,image/webp,application/pdf,.pdf,.eps,.ai,application/postscript"
                          required
                          className="font-body text-[12px] text-burgundy file:mr-3 file:rounded-full file:border file:border-burgundy/20 file:bg-white file:px-4 file:py-2 file:font-body file:text-[10px] file:uppercase file:tracking-[0.1em]"
                        />
                        <button
                          type="submit"
                          className={ctaButtonClasses({ variant: "outline", size: "sm", className: "mt-3 w-fit" })}
                        >
                          Upload / replace logo
                        </button>
                      </form>
                      {project.websiteLogoPath ? (
                        <form action={clearWebsiteLogo.bind(null, project.id)}>
                          <button
                            type="submit"
                            className="font-body text-[10px] uppercase tracking-[0.1em] text-burgundy/55 underline"
                          >
                            Clear logo
                          </button>
                        </form>
                      ) : null}
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          </PortalSectionCard>

          <PortalSectionCard
            headingId="website-logo-variations-heading"
            title="Logo variations"
            description={
              <p className="m-0">
                Add secondary marks the studio can use on the site or in templates — e.g. submark, wordmark-only, icon,
                or alternate lockups. Your <span className="font-medium">primary logo</span> stays in the section above.
              </p>
            }
            variant={sectionVariant}
          >
            <WebsiteLogoVariationsPanel
              projectId={project.id}
              variations={logoVariations}
              clientCanEdit={clientCanEdit}
            />
          </PortalSectionCard>

          <PortalSectionCard
            headingId="website-final-signoff-heading"
            title="Kit sign-off"
            description={
              <p className="m-0">
                When colours, fonts, and logo reflect what you want us to use, confirm here so we can treat the kit as
                approved for build.
              </p>
            }
            variant={sectionVariant}
          >
            {clientCanEdit ? (
              <div className={formWellClass}>
                <div className="flex flex-wrap gap-4">
                  {!project.websiteKitSignedOff ? (
                    <PortalWebsiteSignOffForm projectId={project.id} step="kit" next>
                      <button type="submit" className={ctaButtonClasses({ variant: "ink", size: "md", className: "px-8" })}>
                        Sign off website kit
                      </button>
                    </PortalWebsiteSignOffForm>
                  ) : (
                    <PortalWebsiteSignOffForm projectId={project.id} step="kit" next={false}>
                      <button
                        type="submit"
                        className={ctaButtonClasses({ variant: "outline", size: "sm", className: "px-6" })}
                      >
                        Undo sign-off
                      </button>
                    </PortalWebsiteSignOffForm>
                  )}
                </div>
              </div>
            ) : null}
            {project.websiteKitSignedOff ? (
              <p className="mb-0 mt-4 font-body text-[12px] text-burgundy/70">
                Website kit signed off on{" "}
                {project.updatedAt.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}.
              </p>
            ) : null}
            <p className="mb-0 mt-6 font-body text-sm text-burgundy/65">
              Next:{" "}
              <Link href={`/portal/project/${project.id}/website/content`} className="font-semibold text-burgundy underline-offset-2 hover:underline">
                Website content
              </Link>{" "}
              — add copy and images for each page.
            </p>
          </PortalSectionCard>
        </div>
      )}
    </div>
  );
}
