/** Best-effort spam signals for marketing contact + launch signup forms. */

import { turnstileConfigured } from "@/lib/turnstile";

export type SpamVerdict = { spam: true; reason: string } | { spam: false };

const SPAM_KEYWORD =
  /\b(viagra|cialis|crypto|bitcoin|forex|casino|porn|xxx|seo services|link building|guest post|web traffic|rank your site|loan approval|digital marketing agency|marketing agency|increase traffic|google ranking|website audit|dear sir|dear madam|dear owner|click here|whatsapp|telegram|\+91|\+234|search engine optimization|backlinks|link insertion|guest posting|web design services|website design services|improve your seo|first page of google|cold email|unsolicited)\b/i;

const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com",
  "guerrillamail.com",
  "guerrillamail.net",
  "tempmail.com",
  "temp-mail.org",
  "10minutemail.com",
  "yopmail.com",
  "throwaway.email",
  "getnada.com",
  "sharklasers.com",
  "dispostable.com",
  "trashmail.com",
  "maildrop.cc",
  "fakeinbox.com",
  "mintemail.com",
  "emailondeck.com",
  "spambox.us",
  "mailnesia.com",
  "mytemp.email",
  "tempail.com",
  "inboxkitten.com",
  "mohmal.com",
  "dropmail.me",
  "harakirimail.com",
]);

/** TLDs heavily abused by form spam bots. */
const SUSPICIOUS_TLD =
  /\.(xyz|top|icu|click|bond|cfd|sbs|rest|online|site|space|fun|buzz|monster|quest|lat|cam|uno|link|tk|ml|ga|cf|gq|ru|su|pw|zip|mov|email|live)$/i;

const BOT_USER_AGENT =
  /bot|crawl|spider|scrapy|curl\/|wget|python-requests|go-http-client|java\/|libwww|httpclient|axios\/|postman|insomnia|headless|phantomjs|selenium|puppeteer|playwright|zgrab|masscan|sqlmap/i;

const NON_LATIN_NAME = /[^\u0000-\u024F\u1E00-\u1EFF\s.'-]/;

const MAX_SUBMIT_MS = 24 * 60 * 60 * 1000;

function minSubmitMs(): number {
  return isSpamStrictMode() ? 5000 : 3500;
}

/** Stricter checks when Turnstile is not configured in production. */
export function isSpamStrictMode(): boolean {
  return process.env.NODE_ENV === "production" && !turnstileConfigured();
}

function urlCount(text: string): number {
  return (text.match(/https?:\/\/|www\.\S+/gi) ?? []).length;
}

function hasMarkup(text: string): boolean {
  return /<[a-z][\s\S]*>/i.test(text) || /\[(url|link|img)=/i.test(text);
}

function looksLikeGibberishName(name: string): boolean {
  const t = name.trim();
  if (t.length < 3) return false;
  if (t.length > 55) return true;
  if (/(.)\1{4,}/.test(t)) return true;
  if (/^[a-z0-9._-]+@[a-z0-9.-]+$/i.test(t)) return true;

  const words = t.split(/\s+/).filter(Boolean);
  for (const word of words) {
    if (word.length < 9) continue;
    const letters = word.replace(/[^a-z]/gi, "");
    if (letters.length < 9) continue;
    const vowels = letters.replace(/[^aeiouAEIOU]/g, "").length;
    if (vowels === 0) return true;
    if (vowels / letters.length < 0.12) return true;
  }
  return false;
}

export function isDisposableEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return false;
  return DISPOSABLE_DOMAINS.has(domain);
}

export function isSuspiciousEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  const [local, domain] = normalized.split("@");
  if (!local || !domain) return true;
  if (isDisposableEmail(normalized)) return true;
  if (SUSPICIOUS_TLD.test(domain)) return true;
  if (local.length > 48) return true;
  if (/\d{7,}/.test(local)) return true;
  if (/^[a-f0-9]{16,}$/.test(local)) return true;
  return false;
}

export function checkFormTiming(formStartedAt: unknown): SpamVerdict | null {
  if (typeof formStartedAt !== "number" || !Number.isFinite(formStartedAt)) {
    return { spam: true, reason: "missing_timing" };
  }
  const elapsed = Date.now() - formStartedAt;
  if (elapsed < minSubmitMs()) return { spam: true, reason: "too_fast" };
  if (elapsed > MAX_SUBMIT_MS) return { spam: true, reason: "stale_form" };
  return null;
}

export function checkHoneypots(...fields: (string | undefined)[]): SpamVerdict | null {
  for (const field of fields) {
    if (field?.trim()) return { spam: true, reason: "honeypot" };
  }
  return null;
}

export function checkBotUserAgent(userAgent: string | null | undefined): SpamVerdict | null {
  const ua = userAgent?.trim() ?? "";
  if (!ua) return { spam: true, reason: "missing_user_agent" };
  if (BOT_USER_AGENT.test(ua)) return { spam: true, reason: "bot_user_agent" };
  return null;
}

export function checkNameFields(...names: (string | undefined)[]): SpamVerdict | null {
  for (const name of names) {
    const t = name?.trim();
    if (!t) continue;
    if (/https?:\/\/|www\./i.test(t)) return { spam: true, reason: "url_in_name" };
    if (t.includes("@")) return { spam: true, reason: "email_in_name" };
    if (NON_LATIN_NAME.test(t)) return { spam: true, reason: "non_latin_name" };
    if (looksLikeGibberishName(t)) return { spam: true, reason: "gibberish_name" };
  }
  return null;
}

export function checkTextSpam(...parts: (string | undefined)[]): SpamVerdict | null {
  const combined = parts.filter(Boolean).join(" ");
  if (!combined.trim()) return null;
  const urls = urlCount(combined);
  if (urls >= (isSpamStrictMode() ? 1 : 2)) return { spam: true, reason: "url_spam" };
  if (hasMarkup(combined)) return { spam: true, reason: "markup_spam" };
  if (SPAM_KEYWORD.test(combined)) return { spam: true, reason: "keyword_spam" };
  return null;
}

export function checkContactSpam(input: {
  honeypot?: string;
  websiteTrap?: string;
  confirmEmailTrap?: string;
  formStartedAt?: unknown;
  userAgent?: string | null;
  email: string;
  firstName?: string;
  lastName?: string;
  textFields?: string[];
}): SpamVerdict {
  const bot = checkBotUserAgent(input.userAgent);
  if (bot) return bot;

  const honeypot = checkHoneypots(input.honeypot, input.websiteTrap, input.confirmEmailTrap);
  if (honeypot) return honeypot;

  const timing = checkFormTiming(input.formStartedAt);
  if (timing) return timing;

  if (isSuspiciousEmail(input.email)) return { spam: true, reason: "suspicious_email" };

  const names = checkNameFields(input.firstName, input.lastName);
  if (names) return names;

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
  confirmEmailTrap?: string;
  formStartedAt?: unknown;
  userAgent?: string | null;
  name: string;
  email: string;
}): SpamVerdict {
  const bot = checkBotUserAgent(input.userAgent);
  if (bot) return bot;

  const honeypot = checkHoneypots(input.honeypot, input.websiteTrap, input.confirmEmailTrap);
  if (honeypot) return honeypot;

  const timing = checkFormTiming(input.formStartedAt);
  if (timing) return timing;

  if (isSuspiciousEmail(input.email)) return { spam: true, reason: "suspicious_email" };

  const names = checkNameFields(input.name);
  if (names) return names;

  const text = checkTextSpam(input.name, input.email);
  if (text) return text;

  if (/https?:\/\//i.test(input.name)) return { spam: true, reason: "url_in_name" };

  return { spam: false };
}
