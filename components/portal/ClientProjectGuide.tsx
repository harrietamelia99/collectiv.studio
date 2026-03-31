import Link from "next/link";
import type { ReactNode } from "react";
import { normalizePortalKind } from "@/lib/portal-project-kind";

function StepRow({ n, children }: { n: number; children: ReactNode }) {
  return (
    <li className="flex gap-2.5">
      <span
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-burgundy font-body text-[11px] font-bold text-cream"
        aria-hidden
      >
        {n}
      </span>
      <div className="min-w-0 pt-0.5 font-body text-[13px] leading-relaxed text-burgundy/80">{children}</div>
    </li>
  );
}

type Section = { href: string; title: string };

export function ClientProjectGuide({
  portalKind,
  portalUnlockedForClient,
  quoteSentAt,
  sections,
}: {
  portalKind: string;
  /** Full hub (contract + deposit rules, or legacy studio verify). */
  portalUnlockedForClient: boolean;
  /** When set, client can read the quote before full hub access. */
  quoteSentAt?: Date | null;
  sections: Section[];
}) {
  const k = normalizePortalKind(portalKind);
  const verified = portalUnlockedForClient;
  const quoteSent = !!quoteSentAt;
  const first = sections[0];
  const websiteHref = sections.find((s) => s.title === "Website")?.href ?? first?.href ?? "#project-workstreams";
  const socialHref = sections.find((s) => s.title === "Social media")?.href ?? first?.href ?? "#project-workstreams";
  const brandingSection = sections.find((s) => s.title === "Branding");
  const brandingHref = brandingSection?.href ?? "";
  const signageHref = sections.find((s) => s.title === "Signage & print")?.href ?? first?.href ?? "#project-workstreams";
  const deliverablesHref =
    sections.find((s) => s.title === "Shared files")?.href ?? first?.href ?? "#project-workstreams";
  const messagesHref = "#project-messages";

  if (!verified) {
    return (
      <div
        className="mt-4 rounded-xl border border-zinc-200/90 bg-white p-4 shadow-sm sm:p-5"
        aria-labelledby="client-steps-heading"
      >
        <h2 id="client-steps-heading" className="font-display text-base font-medium tracking-[-0.02em] text-burgundy">
          {quoteSent ? "Quote first, then full hub" : "One moment"}
        </h2>
        <p className="mt-2 font-body text-sm leading-relaxed text-burgundy/80">
          {quoteSent ? (
            <>
              Your quote is on this page below. Once your agreement is signed and any project deposit is paid, we&apos;ll
              open your full workspace here — the studio will unlock it and notify you when your contract and deposit are
              complete.
              (Social media subscriptions are rolling — we&apos;ll open your hub when your retainer is live.)
            </>
          ) : (
            <>
              The studio is still setting up your project. Once your agreement is signed and any deposit is received,
              they&apos;ll verify your account and your full workspace will open here — then you can message the team
              anytime.
            </>
          )}
        </p>
      </div>
    );
  }

  let steps: ReactNode;

  if (k === "SOCIAL") {
    steps = (
      <>
        <StepRow n={1}>
          <>
            <Link href={`${socialHref}#social-step-1`} className="font-semibold text-burgundy underline-offset-2 hover:underline">
              Brief &amp; brand assets
            </Link>
            — business context, kit uploads, mood links.
          </>
        </StepRow>
        <StepRow n={2}>
          <>
            <Link href={`${socialHref}/planning`} className="font-semibold text-burgundy underline-offset-2 hover:underline">
              Content planning
            </Link>
            — ideas, promos, and key dates (we can help if you&apos;re unsure).
          </>
        </StepRow>
        <StepRow n={3}>
          <>
            <Link href={`${socialHref}/calendar`} className="font-semibold text-burgundy underline-offset-2 hover:underline">
              Calendar
            </Link>
            — review and sign off each post.
          </>
        </StepRow>
        <StepRow n={4}>
          <>
            <Link href={messagesHref} className="font-semibold text-burgundy underline-offset-2 hover:underline">
              Messages
            </Link>{" "}
            for questions and feedback.
          </>
        </StepRow>
      </>
    );
  } else if (k === "WEBSITE") {
    steps = (
      <>
        <StepRow n={1}>
          <>
            <Link href={`${websiteHref}/brand-kit`} className="font-semibold text-burgundy underline-offset-2 hover:underline">
              Brand kit
            </Link>
            — colours, fonts, logo, inspiration; sign off when it&apos;s right for build.
          </>
        </StepRow>
        <StepRow n={2}>
          <>
            <Link href={`${websiteHref}/content`} className="font-semibold text-burgundy underline-offset-2 hover:underline">
              Website content
            </Link>
            — copy and images page by page.
          </>
        </StepRow>
        <StepRow n={3}>
          <>
            <Link href={`${websiteHref}/preview`} className="font-semibold text-burgundy underline-offset-2 hover:underline">
              Drafts &amp; preview
            </Link>
            — review staging or live link, request amends, sign off when happy.
          </>
        </StepRow>
        <StepRow n={4}>
          <>
            <Link href={`${websiteHref}/domain`} className="font-semibold text-burgundy underline-offset-2 hover:underline">
              Domain &amp; go live
            </Link>
            — DNS and launch.
          </>
        </StepRow>
        <StepRow n={5}>
          <>
            <Link href={messagesHref} className="font-semibold text-burgundy underline-offset-2 hover:underline">
              Messages
            </Link>{" "}
            for anything in between.
          </>
        </StepRow>
      </>
    );
  } else if (k === "BRANDING") {
    steps = (
      <>
        <StepRow n={1}>
          <>
            {brandingHref ? (
              <Link
                href={`${brandingHref}/inspiration`}
                className="font-semibold text-burgundy underline-offset-2 hover:underline"
              >
                Inspiration &amp; moodboard
              </Link>
            ) : (
              <span className="font-semibold text-burgundy">Inspiration &amp; moodboard</span>
            )}
            — Pinterest and reference links.
          </>
        </StepRow>
        <StepRow n={2}>
          <>
            {brandingHref ? (
              <Link
                href={`${brandingHref}/questionnaire`}
                className="font-semibold text-burgundy underline-offset-2 hover:underline"
              >
                Brand questionnaire
              </Link>
            ) : (
              <span className="font-semibold text-burgundy">Brand questionnaire</span>
            )}
            — structured answers for the studio.
          </>
        </StepRow>
        <StepRow n={3}>
          <>
            {brandingHref ? (
              <Link
                href={`${brandingHref}/proofs`}
                className="font-semibold text-burgundy underline-offset-2 hover:underline"
              >
                Proofs &amp; feedback
              </Link>
            ) : (
              <span className="font-semibold text-burgundy">Proofs &amp; feedback</span>
            )}
            — sign off each round or leave feedback in Messages.
          </>
        </StepRow>
        <StepRow n={4}>
          <>
            {brandingHref ? (
              <Link
                href={`${brandingHref}/final-files`}
                className="font-semibold text-burgundy underline-offset-2 hover:underline"
              >
                Final files
              </Link>
            ) : (
              <span className="font-semibold text-burgundy">Final files</span>
            )}
            — signed-off branding downloads, any shared exports, final payment where needed, then confirm receipt.
          </>
        </StepRow>
        <StepRow n={5}>
          <>
            <Link href={messagesHref} className="font-semibold text-burgundy underline-offset-2 hover:underline">
              Messages
            </Link>{" "}
            for feedback and questions.
          </>
        </StepRow>
      </>
    );
  } else if (k === "SIGNAGE") {
    const sk = `${signageHref}/`;
    steps = (
      <>
        <StepRow n={1}>
          <>
            <Link href={`${sk}brand-kit`} className="font-semibold text-burgundy underline-offset-2 hover:underline">
              Brand kit
            </Link>{" "}
            — colours, fonts, and logo (or assets already on file from past Collectiv work).
          </>
        </StepRow>
        <StepRow n={2}>
          <>
            <Link href={`${sk}inspiration`} className="font-semibold text-burgundy underline-offset-2 hover:underline">
              Inspiration
              </Link>{" "}
            — mood links and written notes.
          </>
        </StepRow>
        <StepRow n={3}>
          <>
            <Link href={`${sk}specification`} className="font-semibold text-burgundy underline-offset-2 hover:underline">
              Sign specification
            </Link>{" "}
            — sizes, materials, and install notes.
          </>
        </StepRow>
        <StepRow n={4}>
          <>
            <Link href={`${sk}proofs`} className="font-semibold text-burgundy underline-offset-2 hover:underline">
              Proofs &amp; feedback
            </Link>{" "}
            — sign off each round; use Messages for questions.
          </>
        </StepRow>
        <StepRow n={5}>
          <>
            <Link href={`${sk}final-files`} className="font-semibold text-burgundy underline-offset-2 hover:underline">
              Final files &amp; order
            </Link>{" "}
            — print-ready signage, any shared files, payment confirmation for locked downloads, then confirm order with
            the studio.
          </>
        </StepRow>
      </>
    );
  } else if (k === "PRINT") {
    steps = (
      <>
        <StepRow n={1}>
          Brand kit on the project (HEX, logos) — returning clients may already have assets on file from earlier work.
        </StepRow>
        <StepRow n={2}>
          Optional mood references via Messages or a linked branding area if your project includes it.
        </StepRow>
        <StepRow n={3}>
          <>
            <Link href={`${deliverablesHref}#deliverables-hub-section`} className="font-semibold text-burgundy underline-offset-2 hover:underline">
              Print deliverables
            </Link>
            — review, sign off, then downloads unlock after final payment where applicable.
          </>
        </StepRow>
        <StepRow n={4}>
          Printing and delivery are coordinated with the team in{" "}
          <Link href={messagesHref} className="font-semibold text-burgundy underline-offset-2 hover:underline">
            Messages
          </Link>
          .
        </StepRow>
      </>
    );
  } else if (k === "ONE_OFF") {
    steps = (
      <>
        <StepRow n={1}>
          {first ? (
            <>
              Open{" "}
              <Link href={first.href} className="font-semibold text-burgundy underline-offset-2 hover:underline">
                {first.title}
              </Link>{" "}
              when we&apos;ve added files — branding, signage, and shared deliverables may all apply.
            </>
          ) : (
            <>Your work areas will appear below when they&apos;re ready.</>
          )}
        </StepRow>
        <StepRow n={2}>
          <>
            <Link href={messagesHref} className="font-semibold text-burgundy underline-offset-2 hover:underline">
              Messages
            </Link>{" "}
            for feedback.
          </>
        </StepRow>
      </>
    );
  } else {
    steps = (
      <>
        <StepRow n={1}>
          {first ? (
            <>
              This pre-launch suite combines website, branding, signage, social, and shared files — start in{" "}
              <Link href={first.href} className="font-semibold text-burgundy underline-offset-2 hover:underline">
                {first.title}
              </Link>{" "}
              or any card below; each area has its own steps and progress.
            </>
          ) : (
            <>Workspaces will appear below when they&apos;re ready.</>
          )}
        </StepRow>
        <StepRow n={2}>
          <>
            <Link href={messagesHref} className="font-semibold text-burgundy underline-offset-2 hover:underline">
              Messages
            </Link>{" "}
            keep questions next to the work.
          </>
        </StepRow>
      </>
    );
  }

  return (
    <details
      className="group cc-portal-client-shell mt-4 font-body text-sm text-burgundy/85 open:shadow-md"
      aria-label="How this project page works"
    >
      <summary className="flex min-h-[3.25rem] cursor-pointer list-none items-center justify-between gap-4 px-0 py-3 marker:content-none sm:min-h-[3.5rem] sm:py-4 [&::-webkit-details-marker]:hidden">
        <span className="font-display text-lg font-normal tracking-[-0.02em] text-burgundy sm:text-xl">
          Quick guide
        </span>
        <span
          className="shrink-0 text-burgundy/45 transition-transform duration-200 group-open:rotate-180"
          aria-hidden
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </summary>
      <div className="border-t border-zinc-200/90 pb-0 pt-4">
        <ol className="m-0 list-none space-y-3 p-0">{steps}</ol>
      </div>
    </details>
  );
}
