import { NextResponse } from "next/server";
import { contactEmailRateLimitAllow } from "@/lib/contact-email-rate-limit";
import { contactRateLimitAllow } from "@/lib/contact-rate-limit";
import { checkContactSpam } from "@/lib/contact-spam";
import { notifyIssyOfMarketingContact } from "@/lib/contact-form-studio-notification";
import { sendMarketingContactEmails } from "@/lib/email-notifications";
import { fullContactToStudioRows, parseContactApiJson } from "@/lib/marketing-contact-body";
import { turnstileConfigured, verifyTurnstileToken } from "@/lib/turnstile";

export const runtime = "nodejs";

function clientIp(request: Request): string {
  const xf = request.headers.get("x-forwarded-for");
  if (xf) {
    const first = xf.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = request.headers.get("x-real-ip")?.trim();
  if (real) return real;
  return "unknown";
}

function silentOk() {
  return NextResponse.json({ ok: true });
}

export async function POST(request: Request) {
  const ip = clientIp(request);

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    // eslint-disable-next-line no-console
    console.error("[contact-form] invalid JSON body");
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = parseContactApiJson(json);
  if (!parsed.ok) {
    // eslint-disable-next-line no-console
    console.warn("[contact-form] validation failed", {
      ip,
      message: parsed.error,
      fieldErrors: parsed.fieldErrors,
    });
    return NextResponse.json(
      { ok: false, error: "validation", fieldErrors: parsed.fieldErrors ?? {} },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const spam = checkContactSpam({
    honeypot: data.honeypot,
    websiteTrap: data.websiteTrap,
    confirmEmailTrap: data.confirmEmailTrap,
    formStartedAt: data.formStartedAt,
    userAgent: request.headers.get("user-agent"),
    email: data.email,
    firstName: data.source === "contact" ? data.firstName : undefined,
    lastName: data.source === "contact" ? data.lastName : undefined,
    textFields:
      data.source === "contact"
        ? [
            data.aboutBusiness,
            data.additionalQuestions,
            data.businessName,
            data.businessWebsite,
            data.industry,
          ].filter((v): v is string => Boolean(v))
        : undefined,
  });

  if (spam.spam) {
    // eslint-disable-next-line no-console
    console.warn("[contact-form] spam dropped", { ip, reason: spam.reason });
    return silentOk();
  }

  const turnstile = await verifyTurnstileToken(data.turnstileToken, ip);
  if (!turnstile.ok) {
    if (turnstileConfigured()) {
      // eslint-disable-next-line no-console
      console.warn("[contact-form] turnstile failed", { ip, reason: turnstile.reason });
      return NextResponse.json({ ok: false, error: "captcha_failed" }, { status: 400 });
    }
  }

  if (!contactRateLimitAllow(ip)) {
    // eslint-disable-next-line no-console
    console.warn("[contact-form] rate limited", { ip });
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  if (!contactEmailRateLimitAllow(data.email)) {
    // eslint-disable-next-line no-console
    console.warn("[contact-form] email rate limited", { ip, email: data.email });
    return silentOk();
  }

  try {
    if (data.source === "home") {
      const { studioSent, autoReplySent } = await sendMarketingContactEmails({
        source: "home",
        submitterEmail: data.email,
        studioRows: [
          { label: "Email", value: data.email },
          { label: "Privacy policy consent", value: "Yes — home contact form" },
        ],
      });
      if (!studioSent || !autoReplySent) {
        // eslint-disable-next-line no-console
        console.error("[contact-form] send failed (home)", { studioSent, autoReplySent, ip });
        return NextResponse.json({ ok: false, error: "send_failed" }, { status: 502 });
      }
      try {
        await notifyIssyOfMarketingContact(data);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("[contact-form] studio notification failed (home)", e);
      }
      // eslint-disable-next-line no-console
      console.log("[contact-form] success (home)", { ip, email: data.email });
      return NextResponse.json({ ok: true });
    }

    const rows = [
      ...fullContactToStudioRows(data),
      { label: "Privacy policy consent", value: "Yes — discovery enquiry form" },
    ];
    const { studioSent, autoReplySent } = await sendMarketingContactEmails({
      source: "contact",
      submitterEmail: data.email,
      submitterFirstName: data.firstName,
      studioRows: rows,
    });
    if (!studioSent || !autoReplySent) {
      // eslint-disable-next-line no-console
      console.error("[contact-form] send failed (contact)", { studioSent, autoReplySent, ip });
      return NextResponse.json({ ok: false, error: "send_failed" }, { status: 502 });
    }
    try {
      await notifyIssyOfMarketingContact(data);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("[contact-form] studio notification failed (contact)", e);
    }
    // eslint-disable-next-line no-console
    console.log("[contact-form] success (contact)", { ip, email: data.email });
    return NextResponse.json({ ok: true });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("[contact-form] unexpected error", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
