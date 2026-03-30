import {
  type PaymentStatus,
  normalizePaymentStatus,
  paymentStatusClientBody,
  paymentStatusClientHeading,
} from "@/lib/portal-payment-status";

type Props = {
  paymentStatus: string;
  paymentNoteForClient?: string | null;
};

export function ClientPaymentStatusCallout({ paymentStatus, paymentNoteForClient }: Props) {
  const status = normalizePaymentStatus(paymentStatus);
  const note = (paymentNoteForClient ?? "").trim();

  /** No banner when all clear and the studio hasn’t left a payment note. */
  if (status === "CURRENT" && !note) return null;

  if (status === "CURRENT") {
    return (
      <div
        className="rounded-xl border border-zinc-200/90 bg-white px-5 py-3 font-body text-sm leading-relaxed text-burgundy/80 shadow-sm"
        role="status"
      >
        <p className="m-0 text-[13px]">
          <span className="font-medium text-burgundy/90">{paymentStatusClientHeading(status)}. </span>
          {note}
        </p>
      </div>
    );
  }

  if (status === "OVERDUE") {
    return (
      <div
        className="rounded-cc-card border border-amber-800/25 bg-amber-50/90 px-5 py-4 font-body text-sm leading-relaxed text-burgundy/90"
        role="alert"
      >
        <p className="m-0 font-display text-lg tracking-[-0.02em] text-amber-950">{paymentStatusClientHeading(status)}</p>
        <p className="mt-2 m-0 text-burgundy/85">{paymentStatusClientBody(status)}</p>
        {note ? (
          <p className="mt-3 m-0 rounded-lg border border-amber-900/15 bg-white/60 px-3 py-2 text-[13px] text-burgundy/80">
            {note}
          </p>
        ) : null}
      </div>
    );
  }

  const s = status as PaymentStatus;
  return (
    <div
      className="rounded-xl border border-zinc-200/90 bg-zinc-50/80 px-5 py-4 font-body text-sm leading-relaxed text-burgundy/85 shadow-sm"
      role="status"
    >
      <p className="m-0 font-medium text-burgundy">{paymentStatusClientHeading(s)}</p>
      <p className="mt-2 m-0 text-burgundy/75">{paymentStatusClientBody(s)}</p>
      {note ? (
        <p className="mt-3 m-0 text-[13px] text-burgundy/70">
          <span className="font-medium text-burgundy/85">Note: </span>
          {note}
        </p>
      ) : null}
    </div>
  );
}
