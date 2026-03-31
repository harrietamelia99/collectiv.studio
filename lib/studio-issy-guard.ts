import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { isAgencyPortalSession } from "@/lib/portal-access";

/** Issy (ops) — contract, deposit, payment flags, portal type, verify hub, wrap-up. */
export async function sessionStudioPersonaIsIssy(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  return Boolean(session?.user?.id && isAgencyPortalSession(session) && session.user.agencyRole === "ISSY");
}
