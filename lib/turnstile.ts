/** Cloudflare Turnstile — optional; skipped when TURNSTILE_SECRET_KEY is unset. */

export function turnstileConfigured(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY?.trim());
}

export async function verifyTurnstileToken(
  token: string | undefined,
  ip: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  if (!secret) return { ok: true };

  if (!token?.trim()) {
    return { ok: false, reason: "missing_token" };
  }

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret,
        response: token,
        remoteip: ip,
      }),
    });

    const data = (await res.json()) as { success?: boolean };
    if (data.success) return { ok: true };
    return { ok: false, reason: "verify_failed" };
  } catch {
    return { ok: false, reason: "verify_error" };
  }
}

export function turnstileSiteKey(): string | undefined {
  const key = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();
  return key || undefined;
}
