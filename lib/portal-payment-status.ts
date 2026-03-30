export const PAYMENT_STATUSES = ["CURRENT", "OVERDUE", "PENDING"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export function normalizePaymentStatus(raw: string): PaymentStatus {
  const u = raw.trim().toUpperCase();
  return (PAYMENT_STATUSES as readonly string[]).includes(u) ? (u as PaymentStatus) : "CURRENT";
}

export function paymentStatusStudioLabel(status: PaymentStatus): string {
  switch (status) {
    case "CURRENT":
      return "Up to date";
    case "OVERDUE":
      return "Overdue";
    case "PENDING":
      return "Awaiting payment / in progress";
    default:
      return status;
  }
}

export function paymentStatusClientHeading(status: PaymentStatus): string {
  switch (status) {
    case "CURRENT":
      return "Payments up to date";
    case "OVERDUE":
      return "Payment overdue";
    case "PENDING":
      return "Payment pending";
    default:
      return "Payment status";
  }
}

export function paymentStatusClientBody(status: PaymentStatus): string {
  switch (status) {
    case "CURRENT":
      return "Your account with Collectiv. Studio is in good standing. If you have a question about an invoice, message us below.";
    case "OVERDUE":
      return "There is an outstanding balance on this project. Please settle any overdue invoices as soon as you can so we can keep work moving. If you’ve already paid, reply in the project thread and we’ll update our records.";
    case "PENDING":
      return "We’re waiting on a payment or invoice step for this project. Check your email for the latest invoice or agreement, or ask us in messages if you’re unsure what’s due.";
    default:
      return "";
  }
}
