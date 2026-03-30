import { NextResponse } from "next/server";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { isSafeWebhookUrl } from "@/lib/webhook-url";

const emailOk = (v: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) && v.length <= 254;

const SIGNUP_WINDOW_MS = 60_000;
const SIGNUP_MAX_PER_WINDOW = 12;

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

  const email =
    typeof body === "object" && body !== null && "email" in body
      ? String((body as { email: unknown }).email).trim()
      : "";

  if (!emailOk(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
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
        body: JSON.stringify({ email, source: "launch-modal" }),
      });
    } catch {
      return NextResponse.json({ error: "Could not save your signup. Try again shortly." }, { status: 502 });
    }
  }

  return NextResponse.json({ ok: true });
}
