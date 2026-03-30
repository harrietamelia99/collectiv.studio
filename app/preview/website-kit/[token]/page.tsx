import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { clientHasFullPortalAccess } from "@/lib/portal-client-full-access";
import { parseWebsiteFontPaths } from "@/lib/portal-progress";
import { parsePageImagePaths, parseWebsitePageLabels } from "@/lib/website-kit-pages";
import { labelForLogoVariation, parseWebsiteLogoVariations } from "@/lib/website-logo-variations";
import { previewKitFileUrl } from "@/lib/preview-kit-assets";

export const metadata: Metadata = {
  title: "Website kit preview",
  robots: { index: false, follow: false },
};

/** Token in URL must always match DB — never cache a stale 404 after rotate/regenerate. */
export const dynamic = "force-dynamic";

function stripHash(hex: string | null | undefined) {
  if (!hex) return "";
  return hex.replace(/^#/, "");
}

type Props = { params: { token: string } };

export default async function WebsiteKitPreviewPage({ params }: Props) {
  const token = decodeURIComponent(params.token);
  const project = await prisma.project.findUnique({
    where: { websiteKitPreviewToken: token },
    include: { websitePageBriefs: { orderBy: { pageIndex: "asc" } } },
  });
  if (!project) notFound();

  if (!clientHasFullPortalAccess(project)) {
    return (
      <div className="min-h-svh bg-cream px-6 py-16">
        <p className="max-w-md font-body text-sm text-burgundy/70">
          This preview is not available yet. It opens once the client&apos;s contract and deposit milestones are complete
          (or the hub is unlocked).
        </p>
      </div>
    );
  }

  const fonts = parseWebsiteFontPaths(project.websiteFontPaths);
  const logoVariations = parseWebsiteLogoVariations(project.websiteLogoVariationsJson);
  const labels = parseWebsitePageLabels(project.websitePageLabels, project.websitePageCount);
  const briefByIndex = new Map(project.websitePageBriefs.map((b) => [b.pageIndex, b]));

  return (
    <div className="min-h-svh bg-cream px-5 py-10 text-burgundy md:px-10 md:py-14">
      <p className="font-body text-[10px] uppercase tracking-[0.14em] text-burgundy/45">Website kit preview</p>
      <h1 className="mt-2 font-display text-cc-h2 tracking-[-0.03em]">{project.name}</h1>
      <p className="mt-3 max-w-2xl font-body text-sm leading-relaxed text-burgundy/65">
        Read-only snapshot of colours, logo, fonts, and the page-by-page copy and imagery the client is supplying for
        build. Share this link with stakeholders who do not need portal access.
      </p>

      {project.websiteLiveUrl?.trim() ? (
        <p className="mt-6 font-body text-sm text-burgundy/80">
          <span className="text-burgundy/50">Live / staging site: </span>
          <a href={project.websiteLiveUrl} className="text-burgundy underline underline-offset-4" target="_blank" rel="noopener noreferrer">
            {project.websiteLiveUrl}
          </a>
        </p>
      ) : null}

      <section className="mt-12 border-t border-solid border-burgundy/12 pt-10">
        <h2 className="font-display text-cc-h3 text-burgundy">Brand colours</h2>
        <ul className="mt-4 flex flex-wrap gap-4 font-body text-sm">
          <li>
            <span className="text-burgundy/50">Primary</span>{" "}
            <span className="tabular-nums text-burgundy">#{stripHash(project.websitePrimaryHex) || "—"}</span>
          </li>
          <li>
            <span className="text-burgundy/50">Secondary</span>{" "}
            <span className="tabular-nums text-burgundy">#{stripHash(project.websiteSecondaryHex) || "—"}</span>
          </li>
          <li>
            <span className="text-burgundy/50">Accent</span>{" "}
            <span className="tabular-nums text-burgundy">#{stripHash(project.websiteAccentHex) || "—"}</span>
          </li>
          <li>
            <span className="text-burgundy/50">Additional</span>{" "}
            <span className="tabular-nums text-burgundy">#{stripHash(project.websiteQuaternaryHex) || "—"}</span>
          </li>
        </ul>
      </section>

      <section className="mt-10 border-t border-solid border-burgundy/12 pt-10">
        <h2 className="font-display text-cc-h3 text-burgundy">Primary logo</h2>
        <div className="mt-4 max-w-xs">
          {project.websiteLogoPath ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewKitFileUrl(token, project.websiteLogoPath)}
              alt=""
              className="max-h-40 w-full rounded-cc-card border border-burgundy/10 object-contain p-3"
            />
          ) : (
            <p className="font-body text-sm text-burgundy/50">No logo uploaded yet.</p>
          )}
        </div>
      </section>

      {logoVariations.length > 0 ? (
        <section className="mt-10 border-t border-solid border-burgundy/12 pt-10">
          <h2 className="font-display text-cc-h3 text-burgundy">Logo variations</h2>
          <ul className="mt-4 grid list-none grid-cols-2 gap-4 p-0 sm:grid-cols-3 md:max-w-3xl">
            {logoVariations.map((v, i) => (
              <li key={`${v.path}-${i}`} className="rounded-cc-card border border-burgundy/10 p-3">
                <p className="m-0 font-body text-[10px] uppercase tracking-[0.1em] text-burgundy/50">
                  {labelForLogoVariation(v)}
                </p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewKitFileUrl(token, v.path)}
                  alt=""
                  className="mt-2 max-h-32 w-full object-contain"
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-10 border-t border-solid border-burgundy/12 pt-10">
        <h2 className="font-display text-cc-h3 text-burgundy">Fonts</h2>
        {fonts.length ? (
          <ul className="mt-4 list-inside list-disc font-body text-sm text-burgundy/80">
            {fonts.map((rel, i) => (
              <li key={`${rel}-${i}`}>{rel.split("/").pop()}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 font-body text-sm text-burgundy/50">No font files yet.</p>
        )}
      </section>

      <section className="mt-10 border-t border-solid border-burgundy/12 pt-10">
        <h2 className="font-display text-cc-h3 text-burgundy">Site pages</h2>
        <p className="mt-2 max-w-2xl font-body text-sm text-burgundy/65">
          Planned pages and the content supplied for each. Imagery is indicative for layout and storytelling — final art
          direction happens in design.
        </p>
        <ol className="mt-8 flex flex-col gap-12">
          {Array.from({ length: project.websitePageCount }, (_, pageIndex) => {
            const brief = briefByIndex.get(pageIndex);
            const imgs = parsePageImagePaths(brief?.imagePaths ?? "[]");
            return (
              <li
                key={pageIndex}
                className="rounded-cc-card border border-burgundy/10 bg-burgundy/[0.02] p-5 md:p-7"
              >
                <h3 className="font-display text-cc-h4 text-burgundy">
                  <span className="font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/45">
                    Page {pageIndex + 1}
                  </span>
                  <br />
                  {labels[pageIndex] ?? `Page ${pageIndex + 1}`}
                </h3>
                {brief?.headline?.trim() ? (
                  <p className="mt-3 font-display text-[17px] leading-snug tracking-[-0.02em] text-burgundy/90">
                    {brief.headline}
                  </p>
                ) : (
                  <p className="mt-3 font-body text-sm italic text-burgundy/45">No headline yet</p>
                )}
                {brief?.bodyCopy?.trim() ? (
                  <p className="mt-4 whitespace-pre-wrap font-body text-sm leading-relaxed text-burgundy/80">
                    {brief.bodyCopy}
                  </p>
                ) : (
                  <p className="mt-4 font-body text-sm italic text-burgundy/45">No body copy yet</p>
                )}
                {imgs.length > 0 ? (
                  <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:max-w-3xl">
                    {imgs.map((rel, i) => (
                      <li key={`${rel}-${i}`} className="min-w-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={previewKitFileUrl(token, rel)}
                          alt=""
                          className="aspect-square w-full rounded-cc-card border border-burgundy/10 object-cover"
                        />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-6 font-body text-[12px] text-burgundy/45">No reference images for this page yet.</p>
                )}
              </li>
            );
          })}
        </ol>
      </section>

      <p className="mt-14 font-body text-[11px] text-burgundy/40">
        Private preview — do not share publicly if the kit contains confidential material.
      </p>
    </div>
  );
}
