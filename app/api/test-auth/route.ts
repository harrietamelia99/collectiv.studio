import { NextResponse } from "next/server";
import { authDiagnosticSecret, authDiagnosticSecretValid } from "@/lib/auth-diagnostic-secret";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const HARRIET_EMAIL = "harriet@collectiv.local";

/**
 * Temporary DB + Harriet user check for production debugging.
 * Set AUTH_DIAGNOSTIC_SECRET in Vercel, then open:
 *   GET /api/test-auth?secret=YOUR_SECRET
 * Remove the env var (or rotate secret) when finished — never leave enabled long-term.
 */
export async function GET(req: Request) {
  if (!authDiagnosticSecret()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const url = new URL(req.url);
  if (!authDiagnosticSecretValid(url.searchParams.get("secret"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: HARRIET_EMAIL },
      select: { id: true, email: true, passwordHash: true },
    });

    return NextResponse.json({
      ok: true,
      database: "connected",
      lookupEmail: HARRIET_EMAIL,
      userFound: Boolean(user),
      email: user?.email ?? null,
      hasPasswordHash: Boolean(user?.passwordHash && user.passwordHash.length > 0),
      userId: user?.id ?? null,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      {
        ok: false,
        database: "error",
        lookupEmail: HARRIET_EMAIL,
        userFound: null,
        email: null,
        hasPasswordHash: null,
        userId: null,
        error: message,
      },
      { status: 500 },
    );
  }
}
