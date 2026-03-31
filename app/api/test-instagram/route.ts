import { NextResponse } from "next/server";
import { authDiagnosticSecret, authDiagnosticSecretValid } from "@/lib/auth-diagnostic-secret";
import { diagnoseInstagramFeed } from "@/lib/instagram-feed";

export const dynamic = "force-dynamic";

// Bump commit when Vercel must pick up fresh serverless output for this route (build cache / routing fixes).

/**
 * Temporary Instagram / env probe (no token or hash in response).
 * Set AUTH_DIAGNOSTIC_SECRET on Vercel, redeploy, then:
 *   GET /api/test-instagram?secret=YOUR_SECRET
 * Remove AUTH_DIAGNOSTIC_SECRET when finished.
 *
 * When the secret env var is unset we return 503 (not 404) so a live hit still proves this route
 * is deployed — 404 was mistaken for a missing file.
 */
export async function GET(req: Request) {
  if (!authDiagnosticSecret()) {
    return NextResponse.json(
      {
        error: "diagnostic_disabled",
        route: "/api/test-instagram",
        message:
          "AUTH_DIAGNOSTIC_SECRET is not set for this deployment. Add it in Vercel → Settings → Environment Variables (Production), redeploy, then retry with ?secret=…",
      },
      { status: 503 },
    );
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
