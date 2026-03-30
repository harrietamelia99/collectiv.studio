import Link from "next/link";
import { ctaButtonClasses } from "@/components/ui/Button";

/** Shown above step nav on inspiration pages so clients know how to unlock Next step. */
export function InspirationStepContinueHint({
  stepComplete,
  printOptional,
}: {
  stepComplete: boolean;
  /** Print inspiration can be skipped entirely. */
  printOptional?: boolean;
}) {
  if (stepComplete) {
    return (
      <p className="mt-12 rounded-xl border border-emerald-200/90 bg-emerald-50 px-4 py-3 font-body text-sm leading-relaxed text-emerald-950">
        This step is complete — use <span className="font-semibold">Next step</span> when you&apos;re ready to continue.
      </p>
    );
  }
  if (printOptional) {
    return (
      <p className="mt-12 rounded-xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 font-body text-sm leading-relaxed text-amber-950">
        To continue: save at least one inspiration link or written notes, or use{" "}
        <span className="font-semibold">Skip inspiration</span>. This step is optional for print projects.
      </p>
    );
  }
  return (
    <p className="mt-12 rounded-xl border border-zinc-200/80 bg-zinc-50 px-4 py-3 font-body text-sm leading-relaxed text-burgundy/85">
      To unlock <span className="font-semibold">Next step</span>, save at least one inspiration link or written notes
      (either is enough).
    </p>
  );
}

type Props = {
  hubHref: string;
  prevHref: string | null;
  nextHref: string | null;
  nextDisabled: boolean;
};

export function WorkflowStepNavRow({ hubHref, prevHref, nextHref, nextDisabled }: Props) {
  return (
    <nav
      className="mt-12 flex flex-wrap items-center gap-3 border-t border-zinc-200/90 pt-8"
      aria-label="Step navigation"
    >
      <Link href={hubHref} className={ctaButtonClasses({ variant: "outline", size: "sm" })}>
        ← Project hub
      </Link>
      {prevHref ? (
        <Link href={prevHref} className={ctaButtonClasses({ variant: "outline", size: "sm" })}>
          ← Previous
        </Link>
      ) : null}
      {nextHref ? (
        nextDisabled ? (
          <span
            className={`${ctaButtonClasses({ variant: "burgundy", size: "sm" })} pointer-events-none cursor-not-allowed opacity-45`}
            title="Complete this step first"
          >
            Next step →
          </span>
        ) : (
          <Link href={nextHref} className={ctaButtonClasses({ variant: "burgundy", size: "sm" })}>
            Next step →
          </Link>
        )
      ) : null}
    </nav>
  );
}
