/**
 * Simple sliding-window limiter (in-memory). Mitigates brute force and API abuse on a **single Node instance**.
 * For horizontal scale, replace with Redis/Upstash or an edge rate-limit product.
 */
type Bucket = { count: number; resetAt: number };

const store = new Map<string, Bucket>();

function prune(now: number) {
  if (store.size < 500) return;
  for (const [k, v] of Array.from(store.entries())) {
    if (now >= v.resetAt) store.delete(k);
  }
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first.slice(0, 45);
  }
  const realIp = req.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp.slice(0, 45);
  const cf = req.headers.get("cf-connecting-ip")?.trim();
  if (cf) return cf.slice(0, 45);
  return "unknown";
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now();
  prune(now);

  const existing = store.get(key);
  if (!existing || now >= existing.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }
  if (existing.count >= limit) {
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)) };
  }
  existing.count += 1;
  return { ok: true };
}
