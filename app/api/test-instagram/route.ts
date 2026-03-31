import { NextResponse } from "next/server";
import { authDiagnosticSecret, authDiagnosticSecretValid } from "@/lib/auth-diagnostic-secret";
import { diagnoseInstagramFeed } from "@/lib/instagram-feed";

export const dynamic = "force-dynamic";

/**
 * Temporary Instagram / env probe (no token or hash in response).
 * Set AUTH_DIAGNOSTIC_SECRET on Vercel, redeploy, then:
 *   GET /api/test-instagram?secret=YOUR_SECRET
 * Remove AUTH_DIAGNOSTIC_SECRET when finished.
 */
export async function GET(req: Request) {
  if (!authDiagnosticSecret()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const url = new URL(req.url);
  if (!authDiagnosticSecretValid(url.searchParams.get("secret"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await diagnoseInstagramFeed(4);
  return NextResponse.json({
    ok: true,
    hint: "result.lastError mirrors what is logged as [instagram-feed] in Vercel Runtime Logs.",
    ...body,
  });
}
