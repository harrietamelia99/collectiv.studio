import {
  clearWebsiteLogo,
  removeWebsiteFont,
  uploadWebsiteFont,
  uploadWebsiteLogo,
} from "@/app/portal/actions";
import { PortalSaveWebsiteColoursForm } from "@/components/portal/portal-flash-action-forms";
import { parseWebsiteFontPaths } from "@/lib/portal-progress";
import { parseWebsiteLogoVariations } from "@/lib/website-logo-variations";
import { portalFilePublicUrl } from "@/lib/portal-file-url";
import { WebsiteBrandColourFields } from "@/components/portal/WebsiteBrandColourFields";
import { WebsiteLogoVariationsPanel } from "@/components/portal/WebsiteLogoVariationsPanel";
import { ctaButtonClasses } from "@/components/ui/Button";

function stripHash(hex: string | null | undefined) {
  if (!hex) return "";
  return hex.replace(/^#/, "");
}

type Props = {
  projectId: string;
  clientCanEdit: boolean;
  primaryHex: string | null | undefined;
  secondaryHex: string | null | undefined;
  accentHex: string | null | undefined;
  quaternaryHex: string | null | undefined;
  websiteFontPaths: string;
  websiteLogoPath: string | null | undefined;
  websiteLogoVariationsJson: string;
};

/** Compact brand kit (colours, fonts, logo) for social onboarding or embedded contexts. */
export function BrandKitSnippet({
  projectId,
  clientCanEdit,
  primaryHex,
  secondaryHex,
  accentHex,
  quaternaryHex,
  websiteFontPaths,
  websiteLogoPath,
  websiteLogoVariationsJson,
}: Props) {
  const fonts = parseWebsiteFontPaths(websiteFontPaths);
  const logoVariations = parseWebsiteLogoVariations(websiteLogoVariationsJson);

  return (
    <div className="mt-10 flex flex-col gap-10 border-t border-solid border-zinc-200 pt-10">
      <div>
        <h3 className="font-display text-cc-h4 text-burgundy">Brand colours (HEX)</h3>
        <p className="mt-2 max-w-xl font-body text-sm text-burgundy/60">
          If you don&apos;t have these yet, book a mini brand or full branding package with us first — then return here
          to upload.
        </p>
        <PortalSaveWebsiteColoursForm
          projectId={projectId}
          className="mt-5 grid max-w-lg gap-4 sm:grid-cols-2 lg:max-w-5xl lg:grid-cols-4"
        >
          <WebsiteBrandColourFields
            key={`${projectId}-${primaryHex ?? ""}-${secondaryHex ?? ""}-${accentHex ?? ""}-${quaternaryHex ?? ""}`}
            initialPrimary={stripHash(primaryHex)}
            initialSecondary={stripHash(secondaryHex)}
            initialAccent={stripHash(accentHex)}
            initialQuaternary={stripHash(quaternaryHex)}
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

      <div>
        <h3 className="font-display text-cc-h4 text-burgundy">Brand fonts</h3>
        <p className="mt-2 max-w-xl font-body text-sm text-burgundy/60">.woff, .woff2, .ttf, or .otf</p>
        {fonts.length > 0 ? (
          <ul className="mt-4 flex flex-col gap-3">
            {fonts.map((rel, i) => (
              <li
                key={`${rel}-${i}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200/90 bg-white px-4 py-3"
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
                  <form action={removeWebsiteFont.bind(null, projectId, i)}>
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
          <p className="mt-3 font-body text-[12px] text-burgundy/50">No fonts uploaded yet.</p>
        )}
        {clientCanEdit ? (
          <form
            action={uploadWebsiteFont.bind(null, projectId)}
            encType="multipart/form-data"
            className="mt-4 flex max-w-lg flex-col gap-3"
          >
            <input
              name="font"
              type="file"
              accept=".woff,.woff2,.ttf,.otf,font/woff,font/woff2"
              required
              className="font-body text-[12px] text-burgundy file:mr-3 file:rounded-full file:border file:border-burgundy/20 file:bg-cream file:px-4 file:py-2 file:font-body file:text-[10px] file:uppercase file:tracking-[0.1em]"
            />
            <button type="submit" className={ctaButtonClasses({ variant: "outline", size: "sm", className: "w-fit" })}>
              Upload font
            </button>
          </form>
        ) : null}
      </div>

      <div>
        <h3 className="font-display text-cc-h4 text-burgundy">Primary logo</h3>
        <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="sm:w-48">
            {websiteLogoPath ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={portalFilePublicUrl(websiteLogoPath)}
                alt="Uploaded logo"
                className="max-h-40 w-full rounded-cc-card border border-burgundy/10 object-contain p-3"
              />
            ) : (
              <div className="cc-portal-client-empty flex h-40 items-center justify-center border-solid text-center font-body text-[11px]">
                No logo yet
              </div>
            )}
          </div>
          <div className="flex flex-col gap-3">
            {clientCanEdit ? (
              <>
                <form action={uploadWebsiteLogo.bind(null, projectId)} encType="multipart/form-data">
                  <input
                    name="logo"
                    type="file"
                    accept="image/svg+xml,image/png,image/jpeg,image/webp,application/pdf,.pdf,.eps,.ai,application/postscript"
                    required
                    className="font-body text-[12px] text-burgundy file:mr-3 file:rounded-full file:border file:border-burgundy/20 file:bg-cream file:px-4 file:py-2 file:font-body file:text-[10px] file:uppercase file:tracking-[0.1em]"
                  />
                  <button
                    type="submit"
                    className={ctaButtonClasses({
                      variant: "outline",
                      size: "sm",
                      className: "mt-3 w-fit",
                    })}
                  >
                    Upload / replace logo
                  </button>
                </form>
                {websiteLogoPath ? (
                  <form action={clearWebsiteLogo.bind(null, projectId)}>
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

      <div>
        <h3 className="font-display text-cc-h4 text-burgundy">Logo variations</h3>
        <p className="mt-2 max-w-xl font-body text-sm text-burgundy/60">
          Optional submarks, secondary logos, wordmarks, or icons — in addition to your primary logo above.
        </p>
        <div className="mt-4">
          <WebsiteLogoVariationsPanel
            projectId={projectId}
            variations={logoVariations}
            clientCanEdit={clientCanEdit}
          />
        </div>
      </div>
    </div>
  );
}
