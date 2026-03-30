import { ButtonLink } from "@/components/ui/Button";
import {
  MotionSection,
  StaggerItem,
  StaggerList,
} from "@/components/ui/SectionReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SectionLabel } from "@/components/ui/SectionLabel";

const features = [
  {
    index: "01",
    title: "Social calendar",
    body: "Review planned posts, request tweaks, and sign off when you’re happy — all in one place.",
  },
  {
    index: "02",
    title: "Website workspace",
    body: "Share page copy and imagery and track your website kit with the studio.",
  },
  {
    index: "03",
    title: "Branding & files",
    body: "Approve branding, signage and shared deliverables, with clear sign-off on each round.",
  },
  {
    index: "04",
    title: "Studio messages",
    body: "Keep feedback and questions in a single thread tied to your project — no lost emails.",
  },
] as const;

export function HomePortalSection() {
  return (
    <MotionSection
      className="relative overflow-hidden border-t border-solid border-[var(--cc-hairline-package-seam)] bg-cream px-6 py-20 md:py-28"
      aria-labelledby="home-portal-heading"
    >
      {/* Soft dot grid — depth without competing with copy */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.45]"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(37, 13, 24, 0.055) 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />
      <div
        className="pointer-events-none absolute -right-[20%] top-1/2 h-[min(90vw,520px)] w-[min(90vw,520px)] -translate-y-1/2 rounded-full bg-burgundy/[0.04] blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl">
        <SectionLabel className="mb-4 text-burgundy/75 md:mb-5">[ Client portal ]</SectionLabel>

        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16 lg:items-start">
          <div className="lg:col-span-5">
            <SectionHeading
              id="home-portal-heading"
              align="left"
              className="max-w-[20ch] text-balance"
            >
              Your project hub, <em>in one place</em>
            </SectionHeading>
            <p className="cc-copy-muted mt-6 max-w-md text-pretty leading-relaxed">
              When we&apos;re working together, you get a private portal to track progress, approve work, and share
              what we need from you — designed to be simple on phone, tablet, or desktop.
            </p>
            <p className="cc-copy-muted mt-4 max-w-md text-pretty text-burgundy/60">
              We&apos;ll set up your project and let you know when to sign in. Already onboard? Jump in below.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-nowrap sm:items-center sm:gap-4">
              <ButtonLink href="/portal/login" variant="burgundy" size="md" className="w-full justify-center sm:w-auto sm:shrink-0">
                Sign in to portal
              </ButtonLink>
              <ButtonLink
                href="/portal/register"
                variant="outline"
                size="md"
                className="w-full justify-center sm:w-auto sm:shrink-0"
              >
                Create portal account
              </ButtonLink>
            </div>
          </div>

          <div className="lg:col-span-7">
            <StaggerList className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
              {features.map((f) => (
                <StaggerItem key={f.index} className="h-full min-h-0">
                  <article className="group flex h-full min-h-[9.5rem] flex-col rounded-none border border-burgundy/10 bg-cream/90 p-6 shadow-soft backdrop-blur-[2px] transition-[border-color,box-shadow,transform] duration-300 ease-smooth md:p-7 md:hover:border-burgundy/18 md:hover:shadow-nav">
                    <span className="font-body text-[10px] font-normal tabular-nums tracking-[0.2em] text-burgundy/40 transition-colors duration-300 group-hover:text-burgundy/55">
                      {f.index}
                    </span>
                    <h3 className="font-display mt-3 text-[clamp(1.05rem,2.2vw,1.2rem)] font-medium leading-snug tracking-[-0.02em] text-burgundy">
                      {f.title}
                    </h3>
                    <p className="cc-copy-muted mt-2.5 flex-1 text-[12px] leading-relaxed md:text-[13px]">{f.body}</p>
                  </article>
                </StaggerItem>
              ))}
            </StaggerList>
          </div>
        </div>
      </div>
    </MotionSection>
  );
}
