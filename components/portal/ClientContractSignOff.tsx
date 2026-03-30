"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { signProjectContractInPortal } from "@/app/portal/actions";
import { ctaButtonClasses } from "@/components/ui/Button";
import { PORTAL_CLIENT_INPUT_CLASS } from "@/components/portal/PortalSectionCard";

const SCROLL_END_PX = 8;

type Props = {
  projectId: string;
  contractTermsText: string;
  alreadySigned: boolean;
  signedAt: Date | null;
  signedTypedName: string | null;
  signedSnapshotText: string | null;
};

export function ClientContractSignOff({
  projectId,
  contractTermsText,
  alreadySigned,
  signedAt,
  signedTypedName,
  signedSnapshotText,
}: Props) {
  const router = useRouter();
  const termsTrimmed = contractTermsText.trim();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [reachedEnd, setReachedEnd] = useState(false);
  const [typedName, setTypedName] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

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

  const displaySignedBody = (signedSnapshotText ?? contractTermsText).trim();

  if (alreadySigned) {
    const when = signedAt
      ? signedAt.toLocaleString(undefined, { dateStyle: "long", timeStyle: "short" })
      : "";
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
          className="mt-4 rounded-xl border border-emerald-200/90 bg-emerald-50/50 px-4 py-3 font-body text-sm text-emerald-950/90"
          role="status"
        >
          {signedTypedName && when ? (
            <p className="m-0 font-medium">
              Contract signed on {when} by {signedTypedName}. Thank you.
            </p>
          ) : (
            <p className="m-0 font-medium">Your contract is on file with the studio. Thank you.</p>
          )}
        </div>
        {displaySignedBody ? (
          <div
            className="mt-6 max-h-[min(28rem,55vh)] overflow-y-auto rounded-xl border border-zinc-200/90 bg-white p-4 shadow-inner sm:p-5"
            tabIndex={0}
            aria-label="Contract text you agreed to"
          >
            <pre className="m-0 whitespace-pre-wrap font-body text-sm leading-relaxed text-burgundy/90">{displaySignedBody}</pre>
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
          The studio is preparing your written agreement. It will appear here when ready — then you can read it in full
          and sign digitally before your project workspace opens.
        </p>
      </section>
    );
  }

  const canSign = reachedEnd && typedName.trim().length >= 2 && agreed && !pending;

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
        Please read the full agreement below. Scroll to the bottom to enable signing.
      </p>

      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="mt-5 max-h-[min(28rem,55vh)] overflow-y-auto rounded-xl border border-zinc-200/90 bg-white p-4 shadow-inner sm:p-5"
        tabIndex={0}
        role="region"
        aria-label="Contract text"
      >
        <pre className="m-0 whitespace-pre-wrap font-body text-sm leading-relaxed text-burgundy/90">{termsTrimmed}</pre>
      </div>

      {!reachedEnd ? (
        <p className="mt-3 font-body text-xs text-burgundy/55">Scroll to the end of the agreement to continue.</p>
      ) : null}

      <div className="mt-8 space-y-5 border-t border-zinc-200/90 pt-8">
        <label className="block font-body text-sm font-medium text-burgundy/85">
          Type your full name to sign
          <input
            type="text"
            name="typedName"
            value={typedName}
            onChange={(e) => setTypedName(e.target.value)}
            autoComplete="name"
            disabled={!reachedEnd || pending}
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
            disabled={!reachedEnd || pending}
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
    </section>
  );
}
