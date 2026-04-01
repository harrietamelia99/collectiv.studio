import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { isAgencyPortalSession } from "@/lib/portal-access";
import { ClientAccountPageContent } from "@/components/portal/ClientAccountPageContent";

export const dynamic = "force-dynamic";

export default async function ClientAccountPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/portal/login");
  if (isAgencyPortalSession(session)) redirect("/portal");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, passwordHash: true, profilePhotoPath: true },
  });
  if (!user?.email) redirect("/portal/login");

  return (
    <div>
      <Link
        href="/portal"
        className="font-body text-[11px] uppercase tracking-[0.1em] text-burgundy/55 no-underline hover:text-burgundy"
      >
        ← My projects
      </Link>
      <h1 className="mt-6 font-display text-cc-h2 tracking-[-0.03em] text-burgundy">Account</h1>
      <p className="mt-3 max-w-xl font-body text-sm leading-relaxed text-burgundy/70">
        Sign-in email, password, and your message profile photo. Password reset uses a one-time link we email you (about
        an hour to use it).
      </p>

      <ClientAccountPageContent
        userId={session.user.id}
        email={user.email}
        hasPassword={Boolean(user.passwordHash)}
        profilePhotoPath={user.profilePhotoPath}
      />
    </div>
  );
}
