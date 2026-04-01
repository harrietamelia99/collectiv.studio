"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { signProjectContractInPortal } from "@/app/portal/actions";
import { ctaButtonClasses } from "@/components/ui/Button";
import { PORTAL_CLIENT_INPUT_CLASS } from "@/components/portal/PortalSectionCard";
import { formatUkLongDateShortTime } from "@/lib/uk-datetime";

const SCROLL_END_PX = 8;

type Props = {
  projectId: string;
  contractTermsText: string;
  alreadySigned: boolean;
  signedAt: Date | null;
  signedTypedName: string | null;
  signedSnapshotText: string | null;
  /** Quote accepted in portal but contract text not published yet — friendlier copy than “preparing agreement”. */
  quoteAcceptedAwaitingTerms?: boolean;
};

function contractTextToParagraphs(text: string): string[] {
  const t = text.trim();
  if (!t) return [];
  const blocks = t.split(/\n\s*\n+/).map((p) => p.trim()).filter(Boolean);
  if (blocks.length > 0) return blocks;
  return [t];
}

export function ClientContractSignOff({
  projectId,
  contractTermsText,
  alreadySigned,
  signedAt,
  signedTypedName,
  signedSnapshotText,
  quoteAcceptedAwaitingTerms = false,
}: Props) {
  const router = useRouter();
  const termsTrimmed = contractTermsText.trim();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [reachedEnd, setReachedEnd] = useState(false);
  const [typedName, setTypedName] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const unsignedParagraphs = useMemo(() => contractTextToParagraphs(termsTrimmed), [termsTrimmed]);
  const signedParagraphs = useMemo(
    () => contractTextToParagraphs((signedSnapshotText ?? contractTermsText).trim()),
    [signedSnapshotText, contractTermsText],
  );

  const checkScrollEnd = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    if (scrollHeight <= clientHeight + SCROLL_END_PX || scrollTop + clientHeight >= scrollHeight - SCROLL_END_PX) {
      setReachedEnd(true);
    }
  }, []);

  const onScroll = useCallback(() => {
    checkScrollEnd();
  }, [checkScrollEnd]);

  useEffect(() => {
    setReachedEnd(false);
    const id = requestAnimationFrame(() => checkScrollEnd());
    return () => cancelAnimationFrame(id);
  }, [contractTermsText, checkScrollEnd]);

  const canSign = reachedEnd && typedName.trim().length >= 2 && agreed && !pending;

  if (alreadySigned) {
    const when = signedAt ? formatUkLongDateShortTime(signedAt) : "";
    const name = signedTypedName?.trim() || "Client";

    return (
      <section
        id="client-contract"
        className="cc-portal-client-shell scroll-mt-28 mt-8"
        aria-labelledby="client-contract-heading"
      >
        <h2 id="client-contract-heading" className="cc-portal-client-shell-title text-xl md:text-2xl">
          Your agreement
        </h2>
        <div
          className="mt-4 rounded-xl border border-emerald-200/90 bg-emerald-50/50 px-4 py-4 font-body text-sm text-emerald-950/90"
          role="status"
        >
          {when ? (
            <p className="m-0 text-base font-medium leading-snug">
              Signed by <span className="text-emerald-950">{name}</span> on {when}.
            </p>
          ) : (
            <p className="m-0 font-medium">Your contract is on file with the studio. Thank you.</p>
          )}
          <p className="m-0 mt-2 text-sm text-emerald-900/85">Thank you — we&apos;ll move your project forward from here.</p>
        </div>
        {signedParagraphs.length ? (
          <div
            className="mt-6 max-h-[min(28rem,55vh)] overflow-y-auto rounded-xl border border-zinc-200/90 bg-white p-5 shadow-inner sm:p-6"
            tabIndex={0}
            aria-label="Contract text you agreed to"
          >
            <div className="space-y-4 font-body text-sm leading-relaxed text-burgundy/90">
              {signedParagraphs.map((p, i) => (
                <p key={i} className="m-0">
                  {p}
                </p>
              ))}
            </div>
          </div>
        ) : null}
      </section>
    );
  }

  if (!termsTrimmed) {
    return (
      <section
        id="client-contract"
        className="cc-portal-client-shell scroll-mt-28 mt-8"
        aria-labelledby="client-contract-heading"
      >
        <h2 id="client-contract-heading" className="cc-portal-client-shell-title text-xl md:text-2xl">
          Service agreement
        </h2>
        <p className="mt-3 max-w-xl font-body text-sm leading-relaxed text-burgundy/75">
          {quoteAcceptedAwaitingTerms ? (
            <>
              Your quote has been accepted. Your service agreement will appear here shortly — then you can read it in
              full and sign digitally before your project workspace opens.
            </>
          ) : (
            <>
              The studio is preparing your written agreement. It will appear here when ready — then you can read it in
              full and sign digitally before your project workspace opens.
            </>
          )}
        </p>
      </section>
    );
  }

  return (
    <section
      id="client-contract"
      className="cc-portal-client-shell scroll-mt-28 mt-8"
      aria-labelledby="client-contract-heading"
    >
      <h2 id="client-contract-heading" className="cc-portal-client-shell-title text-xl md:text-2xl">
        Service agreement
      </h2>
      <p className="mt-2 max-w-xl font-body text-sm leading-relaxed text-burgundy/70">
        Read each section below. When you reach the bottom, the signing area will appear.
      </p>

      <div className="relative mt-5">
        <div
          ref={scrollRef}
          onScroll={onScroll}
          className="max-h-[min(28rem,55vh)] overflow-y-auto rounded-xl border border-zinc-200/90 bg-white p-5 shadow-inner sm:p-6"
          tabIndex={0}
          role="region"
          aria-label="Contract text"
        >
          <div className="space-y-4 pb-2 font-body text-sm leading-relaxed text-burgundy/90">
            {unsignedParagraphs.map((p, i) => (
              <p key={i} className="m-0">
                {p}
              </p>
            ))}
          </div>
        </div>
        {!reachedEnd ? (
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center justify-end rounded-b-xl bg-gradient-to-t from-white via-white/95 to-transparent pb-3 pt-16"
            aria-hidden
          >
            <span className="pointer-events-none rounded-full border border-burgundy/20 bg-cream/95 px-3 py-1.5 font-body text-xs font-medium text-burgundy shadow-sm">
              Scroll down to read the full agreement
            </span>
          </div>
        ) : null}
      </div>

      {!reachedEnd ? (
        <p className="mt-3 font-body text-xs text-burgundy/60">
          Keep scrolling inside the box until you reach the end — then you can sign.
        </p>
      ) : null}

      {reachedEnd ? (
        <div className="mt-8 space-y-5 border-t border-zinc-200/90 pt-8">
          <p className="m-0 font-body text-sm font-medium text-burgundy/85">Sign here</p>
          <label className="block font-body text-sm font-medium text-burgundy/85">
            Type your full name to sign
            <input
              type="text"
              name="typedName"
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              autoComplete="name"
              disabled={pending}
              className={`${PORTAL_CLIENT_INPUT_CLASS} mt-2`}
              placeholder="Your full legal name"
              maxLength={200}
            />
          </label>

          <label className="flex cursor-pointer items-start gap-3 font-body text-sm leading-snug text-burgundy/85">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              disabled={pending}
              className="mt-1 h-[18px] w-[18px] shrink-0 rounded border-burgundy/30 text-burgundy focus:ring-burgundy/30"
            />
            <span>I have read and agree to the terms of this contract.</span>
          </label>

          {error ? (
            <p className="font-body text-sm text-rose-700" role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="button"
            disabled={!canSign}
            className={ctaButtonClasses({
              variant: "burgundy",
              size: "md",
              className: "min-h-[44px] w-full justify-center sm:w-auto",
            })}
            onClick={() => {
              setError(null);
              startTransition(async () => {
                const res = await signProjectContractInPortal(projectId, typedName, agreed);
                if (!res.ok) setError(res.error);
                else router.refresh();
              });
            }}
          >
            {pending ? "Signing…" : "Sign contract"}
          </button>
        </div>
      ) : null}
    </section>
  );
}
