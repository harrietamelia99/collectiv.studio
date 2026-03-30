import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { isStudioUser } from "@/lib/portal-access";

/** Issy (ops) — contract, deposit, payment flags, portal type, verify hub, wrap-up. */
export async function sessionStudioPersonaIsIssy(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !isStudioUser(session.user.email)) return false;
  const m = await prisma.studioTeamMember.findUnique({
    where: { userId: session.user.id },
    select: { personaSlug: true },
  });
  return m?.personaSlug === "isabella";
}
