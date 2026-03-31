import { Resend } from "resend";

let cached: Resend | null | undefined;

/**
 * Resend client when `RESEND_API_KEY` is set; otherwise `null`.
 * Do not throw — callers should handle missing configuration.
 */
export function getResend(): Resend | null {
  if (cached !== undefined) return cached;
  const key = process.env.RESEND_API_KEY?.trim();
  cached = key ? new Resend(key) : null;
  return cached;
}

/** Shown as the From name + address when `RESEND_FROM_EMAIL` is unset. */
export const DEFAULT_RESEND_FROM = "Collectiv. Studio <no-reply@collectivstudio.uk>";

export function getResendFromEmail(): string {
  return process.env.RESEND_FROM_EMAIL?.trim() || DEFAULT_RESEND_FROM;
}
