"use client";

import { acceptProjectQuote, declineProjectQuote } from "@/app/portal/actions";
import { PORTAL_CLIENT_INPUT_CLASS } from "@/components/portal/PortalSectionCard";
import { ctaButtonClasses } from "@/components/ui/Button";
import type { QuoteClientStatus } from "@/lib/portal-quote-status";
import {
  QUOTE_STATUS_ACCEPTED,
  QUOTE_STATUS_DECLINED,
  QUOTE_STATUS_PENDING,
} from "@/lib/portal-quote-status";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

const MSG_ACCEPT_FULL =
  "Quote accepted - the studio has been notified and will prepare your agreement shortly.";
const MSG_DECLINE_FULL = "Quote declined - the studio has been notified.";

type Props = {
  projectId: string;
  initialStatus: QuoteClientStatus;
  initialDeclineReason: string;
};

export function ClientQuoteResponseControls({ projectId, initialStatus, initialDeclineReason }: Props) {
  const router = useRouter();
  const acceptRef = useRef<HTMLDialogElement>(null);
  const declineRef = useRef<HTMLDialogElement>(null);

  const [status, setStatus] = useState<QuoteClientStatus>(initialStatus);
  const [storedReason, setStoredReason] = useState(initialDeclineReason.trim());

  const [acceptFlash, setAcceptFlash] = useState(false);
  const [declineFlash, setDeclineFlash] = useState(false);

  const [acceptErr, setAcceptErr] = useState<string | null>(null);
  const [declineErr, setDeclineErr] = useState<string | null>(null);
  const [declineNote, setDeclineNote] = useState("");

  const [confirmAcceptPending, startConfirmAccept] = useTransition();
  const [confirmDeclinePending, startConfirmDecline] = useTransition();

  useEffect(() => {
    setStatus(initialStatus);
    setStoredReason(initialDeclineReason.trim());
  }, [initialStatus, initialDeclineReason]);

  useEffect(() => {
    if (!acceptFlash) return;
    const t = window.setTimeout(() => setAcceptFlash(false), 3000);
    return () => clearTimeout(t);
  }, [acceptFlash]);

  useEffect(() => {
    if (!declineFlash) return;
    const t = window.setTimeout(() => setDeclineFlash(false), 3000);
    return () => clearTimeout(t);
  }, [declineFlash]);

  if (status === QUOTE_STATUS_ACCEPTED) {
    return (
      <div className="space-y-4">
        {acceptFlash ? (
          <p
            className="m-0 rounded-xl border border-burgundy/90 bg-cream px-4 py-3 font-body text-sm font-medium leading-relaxed text-burgundy"
            role="status"
          >
            Quote accepted ✓
          </p>
        ) : (
          <span className="inline-flex items-center rounded-full border border-emerald-300/90 bg-emerald-50/95 px-4 py-2 font-body text-sm font-semibold text-emerald-950">
            Quote accepted
          </span>
        )}
        <p className="m-0 max-w-xl font-body text-sm leading-relaxed text-burgundy/85">{MSG_ACCEPT_FULL}</p>
      </div>
    );
  }

  if (status === QUOTE_STATUS_DECLINED) {
    return (
      <div className="space-y-4">
        {declineFlash ? (
          <p
            className="m-0 rounded-xl border border-burgundy/90 bg-cream px-4 py-3 font-body text-sm font-medium leading-relaxed text-burgundy"
            role="status"
          >
            Quote declined
          </p>
        ) : (
          <span className="inline-flex items-center rounded-full border border-rose-300/90 bg-rose-50/95 px-4 py-2 font-body text-sm font-semibold text-rose-950">
            Quote declined
          </span>
        )}
        <p className="m-0 max-w-xl font-body text-sm leading-relaxed text-burgundy/85">{MSG_DECLINE_FULL}</p>
        {storedReason ? (
          <div className="rounded-xl border border-burgundy/10 bg-burgundy/[0.03] px-4 py-3">
            <p className="m-0 font-body text-[10px] font-semibold uppercase tracking-[0.1em] text-burgundy/55">
              Your note to the studio
            </p>
            <p className="mt-2 m-0 whitespace-pre-wrap font-body text-sm leading-relaxed text-burgundy/90">
              {storedReason}
            </p>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <button
          type="button"
          disabled={confirmAcceptPending || confirmDeclinePending}
          className={ctaButtonClasses({
            variant: "burgundy",
            size: "md",
            className: "min-h-[48px] w-full justify-center sm:w-auto sm:min-w-[10rem]",
          })}
          onClick={() => {
            setAcceptErr(null);
            acceptRef.current?.showModal();
          }}
        >
          Accept Quote
        </button>
        <button
          type="button"
          disabled={confirmAcceptPending || confirmDeclinePending}
          className={ctaButtonClasses({
            variant: "outline",
            size: "md",
            className: "min-h-[48px] w-full justify-center border-rose-200/90 text-rose-950/90 hover:bg-rose-50/80 sm:w-auto sm:min-w-[10rem]",
          })}
          onClick={() => {
            setDeclineErr(null);
            declineRef.current?.showModal();
          }}
        >
          Decline Quote
        </button>
      </div>

      <dialog
        ref={acceptRef}
        className="max-w-md rounded-xl border border-zinc-200/90 bg-white p-6 shadow-xl backdrop:bg-black/40"
        onClose={() => setAcceptErr(null)}
      >
        <h3 className="m-0 font-display text-lg tracking-[-0.02em] text-burgundy">Accept this quote</h3>
        <p className="mt-3 m-0 font-body text-sm leading-relaxed text-burgundy/85">
          By accepting this quote you are confirming you are happy with the scope and price and would like to proceed.
          The studio will then prepare your contract.
        </p>
        {acceptErr ? (
          <p className="mt-4 m-0 rounded-lg border border-rose-200/90 bg-rose-50/95 px-3 py-2 font-body text-sm text-rose-800/90">
            {acceptErr}
          </p>
        ) : null}
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            disabled={confirmAcceptPending}
            onClick={() => acceptRef.current?.close()}
            className={ctaButtonClasses({ variant: "outline", size: "sm" })}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={confirmAcceptPending}
            className={ctaButtonClasses({ variant: "burgundy", size: "sm" })}
            onClick={() => {
              setAcceptErr(null);
              startConfirmAccept(async () => {
                const r = await acceptProjectQuote(projectId);
                if (!r.ok) {
                  setAcceptErr(r.error);
                  return;
                }
                acceptRef.current?.close();
                setStatus(QUOTE_STATUS_ACCEPTED);
                setAcceptFlash(true);
                router.refresh();
              });
            }}
          >
            {confirmAcceptPending ? "Confirming…" : "Confirm & Accept"}
          </button>
        </div>
      </dialog>

      <dialog
        ref={declineRef}
        className="max-w-md rounded-xl border border-zinc-200/90 bg-white p-6 shadow-xl backdrop:bg-black/40"
        onClose={() => {
          setDeclineErr(null);
          setDeclineNote("");
        }}
      >
        <h3 className="m-0 font-display text-lg tracking-[-0.02em] text-burgundy">Decline quote</h3>
        <p className="mt-3 m-0 font-body text-sm leading-relaxed text-burgundy/85">
          Is there anything you&apos;d like to change? Leave a note for the studio (optional).
        </p>
        <label className="mt-4 block font-body text-xs font-medium text-burgundy/70">
          Message (optional)
          <textarea
            value={declineNote}
            onChange={(e) => setDeclineNote(e.target.value)}
            disabled={confirmDeclinePending}
            maxLength={4000}
            rows={4}
            className={`${PORTAL_CLIENT_INPUT_CLASS} mt-1.5 resize-y`}
            placeholder="e.g. Can we adjust the timeline or split the scope?"
          />
        </label>
        {declineErr ? (
          <p className="mt-4 m-0 rounded-lg border border-rose-200/90 bg-rose-50/95 px-3 py-2 font-body text-sm text-rose-800/90">
            {declineErr}
          </p>
        ) : null}
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            disabled={confirmDeclinePending}
            onClick={() => declineRef.current?.close()}
            className={ctaButtonClasses({ variant: "outline", size: "sm" })}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={confirmDeclinePending}
            className={ctaButtonClasses({
              variant: "outline",
              size: "sm",
              className: "border-rose-200/90 text-rose-950/90 hover:bg-rose-50/80",
            })}
            onClick={() => {
              setDeclineErr(null);
              startConfirmDecline(async () => {
                const r = await declineProjectQuote(projectId, declineNote);
                if (!r.ok) {
                  setDeclineErr(r.error);
                  return;
                }
                declineRef.current?.close();
                setStoredReason(declineNote.trim());
                setStatus(QUOTE_STATUS_DECLINED);
                setDeclineFlash(true);
                setDeclineNote("");
                router.refresh();
              });
            }}
          >
            {confirmDeclinePending ? "Declining…" : "Decline Quote"}
          </button>
        </div>
      </dialog>
    </>
  );
}
