import Link from "next/link";
import { portalFilePublicUrl } from "@/lib/portal-file-url";
import { PortalSectionCard } from "@/components/portal/PortalSectionCard";
import { WebsiteBrandColourFields } from "@/components/portal/WebsiteBrandColourFields";
import {
  clearWebsiteLogo,
  removeWebsiteFont,
  uploadWebsiteFont,
  uploadWebsiteLogo,
} from "@/app/portal/actions";
import {
  PortalSaveWebsiteColoursForm,
  PortalWebsiteSignOffForm,
} from "@/components/portal/portal-flash-action-forms";
import { ctaButtonClasses } from "@/components/ui/Button";
import type { WebsiteWorkspaceLoaded } from "@/app/portal/project/[projectId]/website/_lib/load-website-workspace";

type W = Extract<WebsiteWorkspaceLoaded, { ok: true }>;

function stripHash(hex: string | null | undefined) {
  if (!hex) return "";
  return hex.replace(/^#/, "");
}

/** Brand kit fields for signage-only projects (no website workstream). */
export function SignageBrandKitSlim({
  w,
  clientCanEdit,
}: {
  w: W;
  clientCanEdit: boolean;
}) {
  const { project, studio, unlocked, clientVerified, fonts, sectionVariant, formWellClass } = w;

  if (!unlocked) {
    return (
      <div className="cc-portal-client-shell mt-10 font-body text-sm leading-relaxed text-burgundy/75">
        {studio
          ? "The client must be verified before they can edit this kit."
          : "The studio is still completing setup — you’ll be able to add your brand basics here once your account is fully open."}
      </div>
    );
  }

  return (
    <div className="mt-12 flex flex-col gap-8">
      <PortalSectionCard
        headingId="signage-brand-colours-heading"
        title="Brand colours (HEX)"
        description={
          <p className="m-0">
            Enter six-digit hex values (with or without #). Primary is required at minimum; add secondary, accent, and an
            optional fourth if needed.
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
      </PortalSectionCard>

      <PortalSectionCard
        headingId="signage-brand-fonts-heading"
        title="Brand fonts"
        description={<p className="m-0">Upload .woff, .woff2, .ttf, or .otf files.</p>}
        variant={sectionVariant}
      >
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
              <input
                name="font"
                type="file"
                accept=".woff,.woff2,.ttf,.otf,font/woff,font/woff2"
                required
                className="font-body text-[12px] text-burgundy file:mr-3 file:rounded-full file:border file:border-burgundy/20 file:bg-white file:px-4 file:py-2"
              />
              <button type="submit" className={ctaButtonClasses({ variant: "outline", size: "sm", className: "w-fit" })}>
                Upload font
              </button>
            </form>
          </div>
        ) : null}
      </PortalSectionCard>

      <PortalSectionCard headingId="signage-primary-logo-heading" title="Primary logo" variant={sectionVariant}>
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
                      className="font-body text-[12px] text-burgundy file:mr-3 file:rounded-full file:border file:border-burgundy/20 file:bg-white file:px-4 file:py-2"
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
        headingId="signage-kit-signoff-heading"
        title="Kit sign-off"
        description={<p className="m-0">Confirm your brand basics are ready for signage artwork.</p>}
        variant={sectionVariant}
      >
        {clientCanEdit ? (
          <div className={formWellClass}>
            {!project.websiteKitSignedOff ? (
              <PortalWebsiteSignOffForm projectId={project.id} step="kit" next>
                <button type="submit" className={ctaButtonClasses({ variant: "ink", size: "md", className: "px-8" })}>
                  Sign off brand kit
                </button>
              </PortalWebsiteSignOffForm>
            ) : (
              <PortalWebsiteSignOffForm projectId={project.id} step="kit" next={false}>
                <button type="submit" className={ctaButtonClasses({ variant: "outline", size: "sm", className: "px-6" })}>
                  Undo sign-off
                </button>
              </PortalWebsiteSignOffForm>
            )}
          </div>
        ) : null}
      </PortalSectionCard>

      {!studio && clientVerified ? (
        <p className="font-body text-sm text-burgundy/65">
          Tip: you can also save this kit to your account from any{" "}
          <Link href="/portal/brand-kit" className="font-medium text-burgundy underline underline-offset-4">
            website project&apos;s kit page
          </Link>
          .
        </p>
      ) : null}
    </div>
  );
}
