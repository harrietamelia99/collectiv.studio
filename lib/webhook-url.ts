/**
 * Reduces SSRF risk when `fetch(webhook)` is driven by env — only http(s) to public hosts.
 * Internal Zapier/Make URLs are normally https; block obvious file/data schemes.
 */
export function isSafeWebhookUrl(raw: string): boolean {
  const s = raw.trim();
  if (!s) return false;
  try {
    const u = new URL(s);
    if (u.protocol !== "https:" && u.protocol !== "http:") return false;
    if (u.username || u.password) return false;
    const host = u.hostname.toLowerCase();
    if (host === "localhost" || host === "127.0.0.1" || host === "0.0.0.0") {
      return process.env.NODE_ENV !== "production";
    }
    if (host.endsWith(".local")) return process.env.NODE_ENV !== "production";
    return true;
  } catch {
    return false;
  }
}
