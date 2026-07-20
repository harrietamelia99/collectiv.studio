/** Best-effort spam signals for marketing contact + launch signup forms. */

export type SpamVerdict = { spam: true; reason: string } | { spam: false };

const SPAM_KEYWORD =
  /\b(viagra|cialis|crypto|bitcoin|forex|casino|porn|xxx|seo services|link building|guest post|web traffic|rank your site|loan approval)\b/i;

const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com",
  "guerrillamail.com",
  "tempmail.com",
  "10minutemail.com",
  "yopmail.com",
  "throwaway.email",
  "getnada.com",
  "sharklasers.com",
  "dispostable.com",
  "trashmail.com",
]);

const MIN_SUBMIT_MS = 2500;
const MAX_SUBMIT_MS = 24 * 60 * 60 * 1000;

function urlCount(text: string): number {
  return (text.match(/https?:\/\/|www\.\S+/gi) ?? []).length;
}

export function isDisposableEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return false;
  return DISPOSABLE_DOMAINS.has(domain);
}

export function checkFormTiming(formStartedAt: unknown): SpamVerdict | null {
  if (typeof formStartedAt !== "number" || !Number.isFinite(formStartedAt)) {
    return { spam: true, reason: "missing_timing" };
  }
  const elapsed = Date.now() - formStartedAt;
  if (elapsed < MIN_SUBMIT_MS) return { spam: true, reason: "too_fast" };
  if (elapsed > MAX_SUBMIT_MS) return { spam: true, reason: "stale_form" };
  return null;
}

export function checkHoneypots(...fields: (string | undefined)[]): SpamVerdict | null {
  for (const field of fields) {
    if (field?.trim()) return { spam: true, reason: "honeypot" };
  }
  return null;
}

export function checkTextSpam(...parts: (string | undefined)[]): SpamVerdict | null {
  const combined = parts.filter(Boolean).join(" ");
  if (!combined.trim()) return null;
  if (urlCount(combined) >= 2) return { spam: true, reason: "url_spam" };
  if (SPAM_KEYWORD.test(combined)) return { spam: true, reason: "keyword_spam" };
  return null;
}

export function checkContactSpam(input: {
  honeypot?: string;
  websiteTrap?: string;
  formStartedAt?: unknown;
  email: string;
  firstName?: string;
  lastName?: string;
  textFields?: string[];
}): SpamVerdict {
  const honeypot = checkHoneypots(input.honeypot, input.websiteTrap);
  if (honeypot) return honeypot;

  const timing = checkFormTiming(input.formStartedAt);
  if (timing) return timing;

  if (isDisposableEmail(input.email)) return { spam: true, reason: "disposable_email" };

  const text = checkTextSpam(
    input.firstName,
    input.lastName,
    input.email,
    ...(input.textFields ?? []),
  );
  if (text) return text;

  return { spam: false };
}

export function checkLaunchSignupSpam(input: {
  honeypot?: string;
  websiteTrap?: string;
  formStartedAt?: unknown;
  name: string;
  email: string;
}): SpamVerdict {
  const honeypot = checkHoneypots(input.honeypot, input.websiteTrap);
  if (honeypot) return honeypot;

  const timing = checkFormTiming(input.formStartedAt);
  if (timing) return timing;

  if (isDisposableEmail(input.email)) return { spam: true, reason: "disposable_email" };

  const text = checkTextSpam(input.name, input.email);
  if (text) return text;

  if (/https?:\/\//i.test(input.name)) return { spam: true, reason: "url_in_name" };

  return { spam: false };
}
