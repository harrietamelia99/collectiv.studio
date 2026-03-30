import {
  removeWebsiteLogoVariation,
  uploadWebsiteLogoVariation,
} from "@/app/portal/actions";
import { portalFilePublicUrl } from "@/lib/portal-file-url";
import {
  LOGO_VARIATION_KIND_OPTIONS,
  labelForLogoVariation,
  type WebsiteLogoVariation,
} from "@/lib/website-logo-variations";
import { PORTAL_FORM_WELL_CLASS } from "@/components/portal/PortalSectionCard";
import { ctaButtonClasses } from "@/components/ui/Button";

const MAX_VARIATIONS = 10;

type Props = {
  projectId: string;
  variations: WebsiteLogoVariation[];
  clientCanEdit: boolean;
};

export function WebsiteLogoVariationsPanel({ projectId, variations, clientCanEdit }: Props) {
  const atLimit = variations.length >= MAX_VARIATIONS;

  return (
    <div className="flex flex-col gap-4">
      {variations.length > 0 ? (
        <ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {variations.map((v, i) => (
            <li
              key={`${v.path}-${i}`}
              className="flex flex-col gap-2 rounded-lg border border-burgundy/12 bg-white p-3"
            >
              <span className="font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-burgundy/55">
                {labelForLogoVariation(v)}
              </span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={portalFilePublicUrl(v.path)}
                alt=""
                className="mx-auto max-h-32 w-full object-contain"
              />
              {clientCanEdit ? (
                <form action={removeWebsiteLogoVariation.bind(null, projectId, i)}>
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
        <p className="m-0 font-body text-[12px] text-burgundy/50">No logo variations uploaded yet.</p>
      )}

      {clientCanEdit && !atLimit ? (
        <div className={PORTAL_FORM_WELL_CLASS}>
          <form
            action={uploadWebsiteLogoVariation.bind(null, projectId)}
            encType="multipart/form-data"
            className="flex max-w-full flex-col gap-3 lg:max-w-xl"
          >
            <label className="flex flex-col gap-1.5">
              <span className="font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-burgundy">
                Variation type
              </span>
              <select
                name="variationKind"
                defaultValue="secondary"
                className="rounded-lg border border-burgundy/15 bg-white px-3 py-2.5 font-body text-sm text-burgundy outline-none ring-burgundy/20 focus:ring-2"
              >
                {LOGO_VARIATION_KIND_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-burgundy">
                Custom label (optional — if type is &quot;Other&quot;)
              </span>
              <input
                name="customLabel"
                type="text"
                maxLength={80}
                placeholder="e.g. Stacked lockup"
                className="rounded-lg border border-burgundy/15 bg-white px-3 py-2.5 font-body text-sm text-burgundy outline-none ring-burgundy/20 focus:ring-2"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-burgundy">
                File
              </span>
              <input
                name="logo"
                type="file"
                accept="image/svg+xml,image/png,image/jpeg,image/webp,application/pdf,.pdf,.eps,.ai,application/postscript"
                required
                className="font-body text-[12px] text-burgundy file:mr-3 file:rounded-full file:border file:border-burgundy/20 file:bg-white file:px-4 file:py-2 file:font-body file:text-[10px] file:uppercase file:tracking-[0.1em]"
              />
            </label>
            <button type="submit" className={ctaButtonClasses({ variant: "outline", size: "sm", className: "w-fit" })}>
              Add logo variation
            </button>
          </form>
        </div>
      ) : null}
      {clientCanEdit && atLimit ? (
        <p className="m-0 font-body text-[11px] text-burgundy/50">Maximum {MAX_VARIATIONS} variations. Remove one to add another.</p>
      ) : null}
    </div>
  );
}
