import { NextResponse } from "next/server";
import { contactRateLimitAllow } from "@/lib/contact-rate-limit";
import { sendMarketingContactEmails } from "@/lib/email-notifications";
import { fullContactToStudioRows, parseContactApiJson } from "@/lib/marketing-contact-body";

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

  if (parsed.data.honeypot?.trim()) {
    // eslint-disable-next-line no-console
    console.warn("[contact-form] honeypot filled — silent accept", { ip });
    return NextResponse.json({ ok: true });
  }

  if (!contactRateLimitAllow(ip)) {
    // eslint-disable-next-line no-console
    console.warn("[contact-form] rate limited", { ip });
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  try {
    if (parsed.data.source === "home") {
      const { studioSent, autoReplySent } = await sendMarketingContactEmails({
        source: "home",
        submitterEmail: parsed.data.email,
        studioRows: [{ label: "Email", value: parsed.data.email }],
      });
      if (!studioSent || !autoReplySent) {
        // eslint-disable-next-line no-console
        console.error("[contact-form] send failed (home)", { studioSent, autoReplySent, ip });
        return NextResponse.json({ ok: false, error: "send_failed" }, { status: 502 });
      }
      // eslint-disable-next-line no-console
      console.log("[contact-form] success (home)", { ip, email: parsed.data.email });
      return NextResponse.json({ ok: true });
    }

    const rows = fullContactToStudioRows(parsed.data);
    const { studioSent, autoReplySent } = await sendMarketingContactEmails({
      source: "contact",
      submitterEmail: parsed.data.email,
      submitterFirstName: parsed.data.firstName,
      studioRows: rows,
    });
    if (!studioSent || !autoReplySent) {
      // eslint-disable-next-line no-console
      console.error("[contact-form] send failed (contact)", { studioSent, autoReplySent, ip });
      return NextResponse.json({ ok: false, error: "send_failed" }, { status: 502 });
    }
    // eslint-disable-next-line no-console
    console.log("[contact-form] success (contact)", { ip, email: parsed.data.email });
    return NextResponse.json({ ok: true });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("[contact-form] unexpected error", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
