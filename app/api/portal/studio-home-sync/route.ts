import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { backfillOpenAgencyTodosMissingDueDate } from "@/lib/agency-todos";
import { isAgencyPortalSession } from "@/lib/portal-access";
import { runSocialUpcomingMonthFillReminders } from "@/lib/social-may-month-reminder";
import { syncAutoPhaseTodosForAllProjects } from "@/lib/studio-auto-phase-todos";

export const dynamic = "force-dynamic";

/**
 * Heavy idempotent studio maintenance (auto phase todos + due-date backfill).
 * Runs after the portal home shell renders so navigation feels responsive.
 */
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isAgencyPortalSession(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await Promise.all([
      syncAutoPhaseTodosForAllProjects(),
      backfillOpenAgencyTodosMissingDueDate(),
      runSocialUpcomingMonthFillReminders(),
    ]);
  } catch (e) {
    const message = e instanceof Error ? e.message : "sync_failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
