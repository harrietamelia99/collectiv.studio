import { SectionLabel } from "@/components/ui/SectionLabel";

const STEPS = [
  {
    title: "Branding",
    description: "Identity, guidelines, imagery direction & social-ready visuals.",
  },
  {
    title: "Website",
    description: "Launch-ready site, mobile polish, SEO basics & domain setup.",
  },
  {
    title: "Social media",
    description: "Profiles, grid plan, launch graphics & caption guidance.",
  },
  {
    title: "Launch",
    description: "Strategy call, coordinated go-live & full file handover.",
  },
] as const;

function StepCard({ step, index }: { step: (typeof STEPS)[number]; index: number }) {
  return (
    <div className="group flex h-full min-h-0 w-full max-w-[20rem] flex-col items-center border-cc border-solid border-burgundy/12 bg-cream px-5 py-6 text-center shadow-soft transition-[transform,box-shadow,border-color] duration-300 ease-smooth motion-safe:hover:-translate-y-1 hover:border-burgundy/25 hover:shadow-lift md:max-w-none md:px-4 md:py-6 lg:px-5">
      <span className="mb-2 shrink-0 font-body text-[10px] font-normal tabular-nums tracking-[0.2em] text-burgundy/45 transition-colors duration-300 group-hover:text-burgundy/60">
        {String(index + 1).padStart(2, "0")}
      </span>
      <span className="shrink-0 font-display text-[clamp(1.05rem,2.2vw,1.28rem)] font-medium leading-snug tracking-[-0.02em] text-burgundy">
        {step.title}
      </span>
      <p className="cc-copy-muted mt-3 max-w-[22ch] flex-1 text-[11px] leading-relaxed text-burgundy/72 transition-colors duration-300 group-hover:text-burgundy/80 md:text-[12px]">
        {step.description}
      </p>
    </div>
  );
}

export function PreLaunchSuiteFlowSection() {
  return (
    <section
      className="relative overflow-hidden bg-burgundy px-6 py-14 md:px-10 md:py-20"
      aria-labelledby="prelaunch-flow-heading"
    >
      <div
        className="cc-hero-video-wrap pointer-events-none absolute inset-0 z-0 overflow-hidden"
        aria-hidden
      >
        <video
          className="cc-hero-bg-video"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        >
          <source src="/videos/hero-background.mp4" type="video/mp4" />
        </video>
        <div
          className="absolute inset-0 bg-gradient-to-b from-burgundy/70 via-burgundy/55 to-burgundy/58"
          aria-hidden
        />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        <SectionLabel light className="mb-4 text-center text-cream/75">
          [ How the suite fits together ]
        </SectionLabel>
        <h2
          id="prelaunch-flow-heading"
          className="cc-no-heading-hover mx-auto mb-12 max-w-2xl text-center text-cream md:mb-14"
        >
          From brand to web to social - <em className="font-normal italic">one</em>{" "}
          cohesive build.
        </h2>

        {/* Mobile: stacked */}
        <ol className="m-0 flex list-none flex-col items-center gap-3 p-0 md:hidden">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex w-full flex-col items-center gap-3">
              <StepCard step={step} index={i} />
              {i < STEPS.length - 1 ? (
                <span
                  className="font-body text-base font-light leading-none text-cream/40"
                  aria-hidden
                >
                  ↓
                </span>
              ) : null}
            </li>
          ))}
        </ol>

        {/* Desktop: equal columns with narrow arrow gutters */}
        <ol className="m-0 hidden list-none grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)] items-stretch gap-y-0 p-0 md:grid lg:mx-auto lg:max-w-[58rem]">
          {STEPS.flatMap((step, i) => {
            const card = (
              <li key={step.title} className="flex h-full min-h-0 min-w-0">
                <StepCard step={step} index={i} />
              </li>
            );
            if (i >= STEPS.length - 1) return [card];
            return [
              card,
              <li
                key={`${step.title}-arrow`}
                className="flex w-6 items-center justify-center lg:w-8"
                aria-hidden
              >
                <span className="select-none font-body text-lg font-light text-cream/40 lg:text-xl">
                  →
                </span>
              </li>,
            ];
          })}
        </ol>
      </div>
    </section>
  );
}

