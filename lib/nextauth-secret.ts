const DEV_FALLBACK = "collectiv-dev-only-nextauth-secret-not-for-production";
/** Only for `next start` / preview on http://localhost or 127.0.0.1 — never use on a public HTTPS deploy. */
const LOCAL_HTTP_PREVIEW_FALLBACK = "collectiv-local-http-preview-nextauth-secret-do-not-use-in-production-deploy";

function isLocalHttpNextAuthUrl(): boolean {
  const url = process.env.NEXTAUTH_URL?.trim().toLowerCase() ?? "";
  return url.startsWith("http://127.0.0.1") || url.startsWith("http://localhost");
}

/**
 * NextAuth requires a secret to sign JWTs. Missing `NEXTAUTH_SECRET` breaks sign-in and
 * middleware token checks; local dev often omits it after copying an incomplete `.env`.
 * Local `next start` uses NODE_ENV=production — we allow an explicit fallback only for http://localhost preview.
 */
export function nextAuthSecret(): string | undefined {
  const fromEnv = process.env.NEXTAUTH_SECRET?.trim();
  if (fromEnv) return fromEnv;
  if (process.env.NODE_ENV !== "production") return DEV_FALLBACK;
  if (isLocalHttpNextAuthUrl()) return LOCAL_HTTP_PREVIEW_FALLBACK;
  return undefined;
}
