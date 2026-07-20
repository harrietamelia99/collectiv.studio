/** Limit repeat submissions from the same email address (best-effort, in-memory). */
const WINDOW_MS = 24 * 60 * 60 * 1000;
const MAX_PER_WINDOW = 2;

const buckets = new Map<string, number[]>();

export function contactEmailRateLimitAllow(email: string): boolean {
  const key = email.trim().toLowerCase();
  if (!key) return true;
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
