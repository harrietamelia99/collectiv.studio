import { NextResponse } from "next/server";
import { checkLaunchSignupSpam } from "@/lib/contact-spam";
import { contactEmailRateLimitAllow } from "@/lib/contact-email-rate-limit";
import { notifyIssyOfLaunchListSignup } from "@/lib/contact-form-studio-notification";
import { sendLaunchListSignupStudioEmail } from "@/lib/email-notifications";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { turnstileConfigured, verifyTurnstileToken } from "@/lib/turnstile";
import { isSafeWebhookUrl } from "@/lib/webhook-url";

const emailOk = (v: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) && v.length <= 254;

const nameOk = (v: string) => {
  const t = v.trim();
  return t.length >= 1 && t.length <= 120 && !/[\r\n\0]/.test(t);
};

const SIGNUP_WINDOW_MS = 60_000;
const SIGNUP_MAX_PER_WINDOW = 6;

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function num(v: unknown): number | undefined {
  return typeof v === "number" && Number.isFinite(v) ? v : undefined;
}

export function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const limited = rateLimit(`launch-signup:${ip}`, SIGNUP_MAX_PER_WINDOW, SIGNUP_WINDOW_MS);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again shortly." },
      {
        status: 429,
        headers: { "Retry-After": String(limited.retryAfterSec) },
      },
    );
  }

  const len = Number(req.headers.get("content-length") ?? 0);
  if (len > 4096) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const o = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const email = str(o.email).trim();
  const name = str(o.name).trim();
  const honeypot = str(o.honeypot);
  const websiteTrap = str(o.websiteTrap);
  const confirmEmailTrap = str(o.confirmEmailTrap);
  const formStartedAt = num(o.formStartedAt);
  const turnstileToken = str(o.turnstileToken) || undefined;

  const spam = checkLaunchSignupSpam({
    honeypot,
    websiteTrap,
    confirmEmailTrap,
    formStartedAt,
    userAgent: req.headers.get("user-agent"),
    name,
    email,
  });
  if (spam.spam) {
    // eslint-disable-next-line no-console
    console.warn("[launch-signup] spam dropped", { ip, reason: spam.reason });
    return NextResponse.json({ ok: true });
  }

  const turnstile = await verifyTurnstileToken(turnstileToken, ip);
  if (!turnstile.ok && turnstileConfigured()) {
    return NextResponse.json({ error: "Please complete the security check." }, { status: 400 });
  }

  if (!nameOk(name)) {
    return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  }

  if (!emailOk(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  if (!contactEmailRateLimitAllow(email)) {
    // eslint-disable-next-line no-console
    console.warn("[launch-signup] email rate limited", { ip, email });
    return NextResponse.json({ ok: true });
  }

  const webhook = process.env.LAUNCH_SIGNUP_WEBHOOK?.trim();
  if (webhook) {
    if (!isSafeWebhookUrl(webhook)) {
      return NextResponse.json({ error: "Service misconfigured." }, { status: 500 });
    }
    try {
      await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, source: "launch-modal" }),
      });
    } catch {
      return NextResponse.json({ error: "Could not save your signup. Try again shortly." }, { status: 502 });
    }
  }

  try {
    await notifyIssyOfLaunchListSignup({ name, email });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("[launch-signup] portal notification failed", e);
  }

  try {
    const emailed = await sendLaunchListSignupStudioEmail({ name, email });
    if (!emailed) {
      // eslint-disable-next-line no-console
      console.warn("[launch-signup] studio email not sent (check RESEND_API_KEY / Resend)", { name, email });
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("[launch-signup] studio email failed", e);
  }

  return NextResponse.json({ ok: true });
}
