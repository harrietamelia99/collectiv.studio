import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { isStudioUser } from "@/lib/portal-access";

/** Spec: `/admin` for agency; this app uses `/portal` — keep URL as a stable entry for bookmarks. */
export default async function AdminEntryPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/portal/login");
  redirect(isStudioUser(session.user.email) ? "/portal" : "/portal");
}
