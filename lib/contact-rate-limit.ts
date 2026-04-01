/** In-memory sliding window (best-effort on serverless; resets per instance). */
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 3;

const buckets = new Map<string, number[]>();

export function contactRateLimitAllow(ip: string): boolean {
  const key = ip.trim() || "unknown";
  const now = Date.now();
  const prev = buckets.get(key) ?? [];
  const fresh = prev.filter((t) => now - t < WINDOW_MS);
  if (fresh.length >= MAX_PER_WINDOW) {
    buckets.set(key, fresh);
    return false;
  }
  fresh.push(now);
  buckets.set(key, fresh);
  return true;
}
