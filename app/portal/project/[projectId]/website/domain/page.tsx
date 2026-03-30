import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { getProjectForSession, isStudioUser } from "@/lib/portal-access";
import { clientHasFullPortalAccess } from "@/lib/portal-client-full-access";
import { redirectClientIfProjectWorkspaceLocked } from "@/lib/portal-client-workspace-gate";
import { redirectClientIfOffboardingRequired } from "@/lib/portal-offboarding-gate";
import { clientMayUseWebsiteWorkstream, visiblePortalSections } from "@/lib/portal-project-kind";
import { websiteGoLiveHubProgressPercent } from "@/lib/portal-progress";
import {
  PortalSectionCard,
  PORTAL_CLIENT_FORM_WELL_CLASS,
  PORTAL_CLIENT_INPUT_CLASS,
} from "@/components/portal/PortalSectionCard";
import { PhaseProgressBar } from "@/components/portal/PhaseProgressBar";
import { saveWebsiteDomainLaunchDetails } from "@/app/portal/actions";
import { PortalWebsiteSignOffForm } from "@/components/portal/portal-flash-action-forms";
import { ctaButtonClasses } from "@/components/ui/Button";
import {
  decryptWebsiteDomainVaultPayload,
  type WebsiteDomainVaultPayload,
} from "@/lib/website-domain-access-crypto";
import { loadAccountBrandKitSlice } from "@/lib/portal-account-brand-kit";
import { loadClientWorkflowAccessOpts } from "@/lib/portal-brand-kit-gate";
import { assertClientWorkflowStepAccess } from "@/lib/portal-workflow-guard";
import { clientStepEditable } from "@/lib/portal-workflow";

type Props = { params: { projectId: string } };

export default async function WebsiteDomainGoLivePage({ params }: Props) {
  const session = await getServerSession(authOptions);
  const project = await getProjectForSession(params.projectId, session);
  if (!project) notFound();

  await redirectClientIfOffboardingRequired(params.projectId, session);

  const studio = isStudioUser(session?.user?.email);
  const vis = visiblePortalSections(project.portalKind);
  if (!vis.website && !studio) {
    redirect(`/portal/project/${project.id}`);
  }

  redirectClientIfProjectWorkspaceLocked(project, studio);

  const [accountKit, clientWorkflowAccessOpts] = await Promise.all([
    loadAccountBrandKitSlice(project.userId),
    loadClientWorkflowAccessOpts(project.userId, project.id),
  ]);

  assertClientWorkflowStepAccess(
    "website",
    "domain",
    project,
    studio,
    [],
    [],
    accountKit,
    clientWorkflowAccessOpts,
  );

  const clientVerified = clientHasFullPortalAccess(project);
  const unlocked = studio || clientVerified;
  const canUseWebsite = clientMayUseWebsiteWorkstream(project.portalKind);

  let vaultPlain: WebsiteDomainVaultPayload | null = null;
  if (studio) {
    const fullRow = await prisma.project.findUnique({
      where: { id: project.id },
      select: { websiteDomainAccessEncrypted: true },
    });
    if (fullRow?.websiteDomainAccessEncrypted) {
      vaultPlain = decryptWebsiteDomainVaultPayload(fullRow.websiteDomainAccessEncrypted);
    }
  }

  const clientCanEdit =
    !studio &&
    clientVerified &&
    unlocked &&
    canUseWebsite &&
    clientStepEditable("website", "domain", project, [], [], accountKit, studio, clientWorkflowAccessOpts);
  const domainBasicsReady =
    Boolean(project.websiteClientDomain?.trim()) && Boolean(project.websiteDomainProvider?.trim());
  const goLivePct = websiteGoLiveHubProgressPercent(project);

  return (
    <div>
      <Link
        href={`/portal/project/${project.id}/website`}
        className="font-body text-[11px] uppercase tracking-[0.1em] text-burgundy/55 no-underline hover:text-burgundy"
      >
        ← Website overview
      </Link>

      <h1 className="mt-6 font-display text-cc-h2 tracking-[-0.03em] text-burgundy">Domain &amp; go live</h1>
      <p className="mt-3 max-w-2xl font-body text-sm leading-relaxed text-burgundy/70">
        {studio ? (
          <>
            The client adds their domain and registrar details here so you can plan DNS together. Encrypted fields are
            visible only to the studio in this portal — treat like any credential vault.
          </>
        ) : (
          <>
            When the studio shares your site link on the website kit page, that&apos;s where your site lives in the
            browser. To use your own domain, we&apos;ll align on DNS together so everything resolves correctly for
            launch.
          </>
        )}
      </p>

      <div className="mt-8 max-w-xl">
        <PhaseProgressBar
          label="Launch readiness"
          percent={goLivePct}
          hint={
            project.websiteLiveUrl?.trim()
              ? "Site link is set — finish DNS when you’re ready."
              : clientCanEdit || studio
                ? "Save your domain details so the studio can help with go-live."
                : undefined
          }
        />
      </div>

      {project.websiteLiveUrl?.trim() ? (
        <div className="cc-portal-client-shell mt-8 max-w-2xl py-5">
          <p className="font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/55">Your site</p>
          <a
            href={project.websiteLiveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block font-body text-sm text-burgundy underline underline-offset-4"
          >
            {project.websiteLiveUrl}
          </a>
          {!studio ? (
            <p className="mt-4 font-body text-sm leading-relaxed text-burgundy/70">
              If this URL is staging, your production domain will replace or match it once DNS is finished — the studio
              will confirm when you&apos;re fully live.
            </p>
          ) : null}
        </div>
      ) : !studio && unlocked && clientVerified ? (
        <p className="mt-8 max-w-2xl font-body text-sm text-burgundy/55">
          The studio will add a link to your site on the website kit page when there&apos;s a preview or live URL to
          share.
        </p>
      ) : null}

      <PortalSectionCard
        headingId="website-domain-details-heading"
        title={studio ? "Client domain & registrar" : "Your domain & registrar"}
        description={
          <p className="m-0">
            {studio
              ? "Below is what the client saved (non-encrypted fields). Decrypted registrar access is shown only on this page for studio logins."
              : "Add the domain you want to use, where it’s registered, and optional login details if you’d like the studio to help in the registrar or DNS dashboard."}
          </p>
        }
        variant="client"
        className="mt-10 max-w-none lg:max-w-4xl"
      >
        {studio ? (
          <div className="flex flex-col gap-6">
            <dl className="m-0 grid gap-4 font-body text-sm text-burgundy/90 sm:grid-cols-2">
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-burgundy/55">Domain</dt>
                <dd className="mt-1 m-0">{project.websiteClientDomain?.trim() || "—"}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-burgundy/55">Provider</dt>
                <dd className="mt-1 m-0">{project.websiteDomainProvider?.trim() || "—"}</dd>
              </div>
            </dl>
            {project.websiteDomainRegistrarVaultStored ? (
              <div className="rounded-xl border border-burgundy/20 bg-burgundy/[0.03] p-4">
                <p className="m-0 font-body text-[11px] font-semibold uppercase tracking-[0.1em] text-burgundy/70">
                  Registrar access (decrypted — studio only)
                </p>
                <p className="mt-2 font-body text-xs leading-relaxed text-burgundy/65">
                  Do not paste into email or chat. Use a password manager or a secure channel if you need to share
                  internally.
                </p>
                {vaultPlain ? (
                  <pre className="mt-3 whitespace-pre-wrap break-words font-mono text-[13px] leading-relaxed text-burgundy/90">
                    {`Login / username:\n${vaultPlain.login || "—"}\n\nPassword:\n${vaultPlain.password || "—"}`}
                  </pre>
                ) : (
                  <p className="mt-3 font-body text-sm text-burgundy/70">
                    Could not decrypt — WEBSITE_DOMAIN_ACCESS_SECRET / SOCIAL_ACCOUNT_ACCESS_SECRET may have changed, or
                    the stored data is damaged.
                  </p>
                )}
              </div>
            ) : (
              <p className="m-0 font-body text-sm text-burgundy/60">The client has not saved registrar logins yet.</p>
            )}
          </div>
        ) : !unlocked ? (
          <p className="m-0 max-w-xl font-body text-sm text-burgundy/75">
            You&apos;ll be able to add domain details here once your contract is signed and, if applicable, your deposit
            is confirmed by the studio.
          </p>
        ) : !clientVerified ? (
          <p className="m-0 max-w-xl font-body text-sm text-burgundy/75">
            The studio is still verifying your account. After that, you can save your domain and registrar information
            here.
          </p>
        ) : !canUseWebsite ? (
          <p className="m-0 max-w-xl font-body text-sm text-burgundy/75">
            This project doesn&apos;t include the website workstream.
          </p>
        ) : (
          <form action={saveWebsiteDomainLaunchDetails.bind(null, project.id)} className="max-w-xl">
            <div className={PORTAL_CLIENT_FORM_WELL_CLASS}>
              <div className="flex flex-col gap-5">
                <label className="flex flex-col gap-1.5">
                  <span className="font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-burgundy">
                    Domain
                  </span>
                  <input
                    name="websiteClientDomain"
                    type="text"
                    autoComplete="url"
                    placeholder="yourwebsite.com"
                    defaultValue={project.websiteClientDomain ?? ""}
                    className={PORTAL_CLIENT_INPUT_CLASS}
                  />
                  <span className="font-body text-[12px] leading-snug text-burgundy/55">
                    No need for https:// — we&apos;ll normalise it.
                  </span>
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-burgundy">
                    Domain provider
                  </span>
                  <input
                    name="websiteDomainProvider"
                    type="text"
                    placeholder="e.g. GoDaddy, Namecheap, Cloudflare, IONOS"
                    defaultValue={project.websiteDomainProvider ?? ""}
                    className={PORTAL_CLIENT_INPUT_CLASS}
                  />
                </label>
                <div className="border-t border-zinc-200/80 pt-4">
                  <p className="m-0 font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-burgundy/55">
                    Registrar login (optional)
                  </p>
                  <p className="mt-2 font-body text-[13px] leading-relaxed text-burgundy/65">
                    Stored encrypted for the studio only. Leave password blank to keep a previously saved password.
                  </p>
                  <label className="mt-4 flex flex-col gap-1.5">
                    <span className="font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-burgundy">
                      Username or email
                    </span>
                    <input
                      name="websiteDomainRegistrarLogin"
                      type="text"
                      autoComplete="username"
                      className={PORTAL_CLIENT_INPUT_CLASS}
                      placeholder={project.websiteDomainRegistrarVaultStored ? "Leave blank to keep saved" : ""}
                    />
                  </label>
                  <label className="mt-4 flex flex-col gap-1.5">
                    <span className="font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-burgundy">
                      Password
                    </span>
                    <input
                      name="websiteDomainRegistrarPassword"
                      type="password"
                      autoComplete="new-password"
                      className={PORTAL_CLIENT_INPUT_CLASS}
                      placeholder={project.websiteDomainRegistrarVaultStored ? "Leave blank to keep saved" : ""}
                    />
                  </label>
                  {project.websiteDomainRegistrarVaultStored ? (
                    <label className="mt-4 flex cursor-pointer items-start gap-2 font-body text-sm text-burgundy/80">
                      <input
                        type="checkbox"
                        name="clearDomainRegistrarVault"
                        value="1"
                        className="mt-1 h-4 w-4 shrink-0 rounded border-burgundy/30"
                      />
                      <span>Remove saved registrar login from the portal</span>
                    </label>
                  ) : null}
                </div>
              </div>
              <button
                type="submit"
                className={ctaButtonClasses({
                  variant: "ink",
                  size: "md",
                  className: "mt-6 tracking-[0.12em]",
                })}
              >
                Save domain details
              </button>
            </div>
          </form>
        )}
      </PortalSectionCard>

      <PortalSectionCard
        headingId="website-launch-signoff-heading"
        title="Launch sign-off"
        description={
          <p className="m-0">
            When your domain and provider are saved and you&apos;re aligned with the studio on go-live, confirm this
            step. You can still message us if DNS or launch details change.
          </p>
        }
        variant="client"
        className="mt-10 max-w-none lg:max-w-4xl"
      >
        {clientCanEdit ? (
          <div className={PORTAL_CLIENT_FORM_WELL_CLASS}>
            {!domainBasicsReady && !project.websiteLaunchSignedOff ? (
              <p className="m-0 font-body text-sm text-burgundy/70">
                Save a domain and domain provider above before you can sign off this step.
              </p>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-4">
              {!project.websiteLaunchSignedOff ? (
                <PortalWebsiteSignOffForm projectId={project.id} step="launch" next>
                  <button
                    type="submit"
                    disabled={!domainBasicsReady}
                    className={ctaButtonClasses({
                      variant: "ink",
                      size: "md",
                      className: "px-8 disabled:pointer-events-none disabled:opacity-45",
                    })}
                  >
                    Sign off domain &amp; launch
                  </button>
                </PortalWebsiteSignOffForm>
              ) : (
                <PortalWebsiteSignOffForm projectId={project.id} step="launch" next={false}>
                  <button
                    type="submit"
                    className={ctaButtonClasses({ variant: "outline", size: "sm", className: "px-6" })}
                  >
                    Undo launch sign-off
                  </button>
                </PortalWebsiteSignOffForm>
              )}
            </div>
          </div>
        ) : null}
        {project.websiteLaunchSignedOff ? (
          <p className="mb-0 mt-4 font-body text-[12px] text-burgundy/70">Domain &amp; launch step signed off.</p>
        ) : null}
      </PortalSectionCard>
    </div>
  );
}
