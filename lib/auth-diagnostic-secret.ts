import { timingSafeEqual } from "crypto";

/** Shared gate for temporary `/api/test-*` diagnostics (set on Vercel only while debugging). */
export function authDiagnosticSecret(): string | undefined {
  return process.env.AUTH_DIAGNOSTIC_SECRET?.trim() || undefined;
}

export function authDiagnosticSecretValid(provided: string | null): boolean {
  const expected = authDiagnosticSecret();
  if (!expected || provided === null) return false;
  const ba = Buffer.from(provided, "utf8");
  const bb = Buffer.from(expected, "utf8");
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}
