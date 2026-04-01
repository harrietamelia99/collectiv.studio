import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";
import type { PortfolioProject } from "@/lib/portfolio";
import { portfolioServiceLinks } from "@/lib/marketing-seo";
import { ImagePlaceholderFill } from "@/components/ui/ImagePlaceholder";
import { IMAGE_BLUR_DATA_URL } from "@/lib/blur-placeholder";
import { SectionLabel } from "@/components/ui/SectionLabel";

type Props = {
  project: PortfolioProject;
  prev: PortfolioProject;
  next: PortfolioProject;
};

const sectionLabelClass = "cc-section-label";

export function PortfolioCaseStudy({ project, prev, next }: Props) {
  const serviceLinks = portfolioServiceLinks(project);

  return (
    <>
      <section className="bg-cream px-6 pb-10 pt-4 md:pb-14 md:pt-5">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/portfolio"
            className="cc-caption mb-8 inline-flex text-burgundy/70 transition-opacity hover:opacity-100 md:mb-10"
          >
            ← Back to portfolio
          </Link>
          <SectionLabel className="mb-3 md:mb-4">[ case study ]</SectionLabel>
          <h1 className="cc-no-heading-hover max-w-[22rem] text-balance text-burgundy sm:max-w-2xl md:max-w-4xl">
            {project.title}
            <span className="sr-only">
              {" "}
              — {project.type} portfolio case study by Collectiv. Studio, Bristol
            </span>
          </h1>
          <p className="cc-copy-muted mt-5 max-w-2xl md:mt-6">{project.tagline}</p>
          <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-3 border-t-cc border-solid border-burgundy pt-8 md:mt-10 md:gap-x-6 md:pt-10">
            <span className="cc-caption text-burgundy/55">{project.year}</span>
            <span className="hidden text-burgundy/25 md:inline" aria-hidden>
              ·
            </span>
            <span className="cc-caption-strong">{project.type}</span>
            <div className="flex w-full flex-wrap gap-2 md:ml-auto md:w-auto md:justify-end">
              {project.services.map((s) => (
                <span
                  key={s}
                  className="cc-caption inline-flex rounded-[var(--cc-pill-radius)] border-cc border-solid border-burgundy/15 bg-burgundy/[0.03] px-3 py-1 text-burgundy/80"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-cream px-6 py-10 md:py-14">
        <div className="mx-auto max-w-6xl">
          <h2 className={`${sectionLabelClass} mb-6 md:mb-8`}>[ project gallery ]</h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-6 md:gap-8">
            {project.galleryCaptions.slice(0, 2).map((caption, i) => (
              <figure key={i} className="m-0 flex flex-col">
                <div className="relative aspect-[4/3] w-full min-w-0 overflow-hidden bg-burgundy/[0.06]">
                  {project.galleryImages?.[i] ? (
                    <Image
                      src={project.galleryImages[i]}
                      alt={`${project.title} project — ${caption}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, 50vw"
                      loading="lazy"
                      placeholder="blur"
                      blurDataURL={IMAGE_BLUR_DATA_URL}
                    />
                  ) : (
                    <ImagePlaceholderFill />
                  )}
                </div>
                <figcaption className="cc-caption mt-4 uppercase tracking-[0.12em] text-burgundy/70">
                  {caption}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-cream px-6 py-14 md:py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className={`${sectionLabelClass} mb-4`}>[ overview ]</h2>
          <p className="cc-copy">{project.overview}</p>
        </div>
      </section>

      <section className="bg-cream px-6 py-14 md:py-20">
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-2 md:gap-16 lg:gap-20">
          <div>
            <h2 className={`${sectionLabelClass} mb-4`}>[ challenge ]</h2>
            <p className="cc-copy">{project.challenge}</p>
          </div>
          <div className="border-t-cc border-solid border-burgundy pt-10 md:border-t-0 md:border-l-cc md:pl-16 md:pt-0 lg:pl-20">
            <h2 className={`${sectionLabelClass} mb-4`}>[ approach ]</h2>
            <p className="cc-copy">{project.approach}</p>
          </div>
        </div>
      </section>

      <section className="bg-cream px-6 py-14 md:py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className={`${sectionLabelClass} mb-4`}>[ outcome ]</h2>
          <p className="cc-copy">{project.outcome}</p>
        </div>
      </section>

      <section className="bg-cream px-6 py-14 md:py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className={`${sectionLabelClass} mb-4`}>[ related services ]</h2>
          <p className="cc-copy">
            Looking for similar work? Explore our{" "}
            {serviceLinks.map((l, i) => (
              <Fragment key={l.href}>
                {i > 0 && (i === serviceLinks.length - 1 ? " and " : ", ")}
                <Link
                  href={l.href}
                  className="font-medium text-burgundy underline decoration-burgundy/35 underline-offset-2 transition-colors hover:decoration-burgundy"
                >
                  {l.label}
                </Link>
              </Fragment>
            ))}
            , browse the full{" "}
            <Link
              href="/portfolio"
              className="font-medium text-burgundy underline decoration-burgundy/35 underline-offset-2 transition-colors hover:decoration-burgundy"
            >
              portfolio
            </Link>
            , or{" "}
            <Link
              href="/contactus"
              className="font-medium text-burgundy underline decoration-burgundy/35 underline-offset-2 transition-colors hover:decoration-burgundy"
            >
              contact us
            </Link>{" "}
            to start a project.
          </p>
        </div>
      </section>

      {project.quote ? (
        <section className="bg-burgundy px-6 py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <p className="cc-no-heading-hover font-display text-cc-h3 font-normal italic text-cream md:text-cc-h2">
              “{project.quote.text}”
            </p>
            <p className="cc-caption-light mt-6 text-cream/65">{project.quote.attribution}</p>
          </div>
        </section>
      ) : null}

      <section className="bg-cream px-6 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className={`${sectionLabelClass} mb-8 md:mb-10`}>[ more work ]</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
            <Link
              href={`/portfolio/${prev.slug}`}
              className="group flex flex-col border-cc border-solid border-burgundy bg-cream p-6 transition-[box-shadow,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:shadow-nav md:p-8"
            >
              <span className="cc-caption text-burgundy/45">Previous</span>
              <span className="mt-3 font-display text-cc-h3 font-normal text-burgundy transition-colors group-hover:text-burgundy">
                {prev.title}
              </span>
              <span className="cc-caption mt-2 text-burgundy/60">{prev.type}</span>
            </Link>
            <Link
              href={`/portfolio/${next.slug}`}
              className="group flex flex-col border-cc border-solid border-burgundy bg-cream p-6 transition-[box-shadow,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:shadow-nav md:items-end md:p-8"
            >
              <span className="cc-caption text-burgundy/45">Next</span>
              <span className="mt-3 text-left font-display text-cc-h3 font-normal text-burgundy transition-colors group-hover:text-burgundy md:text-right">
                {next.title}
              </span>
              <span className="cc-caption mt-2 text-left text-burgundy/60 md:text-right">{next.type}</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
