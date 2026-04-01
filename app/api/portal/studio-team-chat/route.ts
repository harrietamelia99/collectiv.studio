import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { isAgencyPortalSession } from "@/lib/portal-access";
import {
  loadStudioTeamChatMentionCandidates,
  loadStudioTeamChatMessagesForApi,
  postStudioTeamChatMessageCore,
} from "@/lib/studio-team-chat-server";
import type { AgencyPortalRole } from "@/lib/studio-team-roles";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !isAgencyPortalSession(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const agencyRole = session.user.agencyRole as AgencyPortalRole | null | undefined;
  if (!agencyRole) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const [messages, mentionCandidates] = await Promise.all([
    loadStudioTeamChatMessagesForApi(session.user.id, agencyRole),
    loadStudioTeamChatMentionCandidates(session.user.id),
  ]);
  return NextResponse.json({ messages, currentUserId: session.user.id, mentionCandidates });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !isAgencyPortalSession(session)) {
    return NextResponse.json({ ok: false, error: "Couldn’t send message. Try again." }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const body =
    typeof json === "object" && json !== null && "body" in json
      ? String((json as { body?: unknown }).body ?? "")
      : "";

  const flash = await postStudioTeamChatMessageCore(session.user.id, body);
  if (flash.ok) {
    return NextResponse.json({ ok: true as const, message: flash.message });
  }
  return NextResponse.json({ ok: false as const, error: flash.error }, { status: 400 });
}
