import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { InviteRegisterForm } from "./InviteRegisterForm";

export const metadata: Metadata = {
  title: "Accept invite | Collectiv. Studio",
};

export default async function PortalInvitePage({
  searchParams,
}: {
  searchParams?: Promise<{ token?: string }> | { token?: string };
}) {
  const sp = searchParams instanceof Promise ? await searchParams : searchParams;
  const token = sp?.token?.trim() ?? "";

  if (!token) {
    return (
      <div className="max-w-lg">
        <InviteProblem
          title="Link incomplete"
          body="This invite link is missing a token. Open the link directly from your invitation email, or ask the studio to send a new one."
        />
      </div>
    );
  }

  const user = await prisma.user.findFirst({
    where: { clientInviteToken: token },
    select: {
      email: true,
      firstName: true,
      name: true,
      passwordHash: true,
      clientInviteExpiresAt: true,
    },
  });

  if (!user) {
    return (
      <div className="max-w-lg">
        <InviteProblem
          title="Link no longer valid"
          body="We couldn’t find an active invite for this link. If you’ve already set up your account, sign in instead. Otherwise, contact the studio and we’ll send a fresh invite."
        />
      </div>
    );
  }

  if (user.passwordHash) {
    return (
      <div className="max-w-lg">
        <InviteProblem
          title="You’re already set up"
          body="This account is already registered. Sign in with your email and password to open your portal."
          cta={{ href: "/portal/login", label: "Sign in" }}
        />
      </div>
    );
  }

  if (!user.clientInviteExpiresAt || user.clientInviteExpiresAt < new Date()) {
    return (
      <div className="max-w-lg">
        <InviteProblem
          title="This invite has expired"
          body="For security, invitation links work for 7 days. Please contact Collectiv. Studio and we’ll send you a new link straight away."
        />
      </div>
    );
  }

  const welcomeFirst = user.firstName?.trim() || user.name?.trim().split(/\s+/)[0] || "";
  const defaultFull = user.name?.trim() || user.firstName?.trim() || "";

  return (
    <div className="max-w-lg">
      <Link
        href="/"
        className="font-body text-[11px] uppercase tracking-[0.1em] text-burgundy/55 no-underline hover:text-burgundy"
      >
        ← Back to site
      </Link>
      <h1 className="mt-6 border-l-4 border-burgundy pl-4 font-display text-cc-h2 tracking-[-0.03em] text-burgundy sm:pl-5">
        You&apos;re invited
      </h1>
      <InviteRegisterForm
        token={token}
        email={user.email}
        defaultFullName={defaultFull}
        welcomeFirstName={welcomeFirst}
      />
    </div>
  );
}

function InviteProblem({
  title,
  body,
  cta,
}: {
  title: string;
  body: string;
  cta?: { href: string; label: string };
}) {
  return (
    <>
      <Link
        href="/"
        className="font-body text-[11px] uppercase tracking-[0.1em] text-burgundy/55 no-underline hover:text-burgundy"
      >
        ← Back to site
      </Link>
      <h1 className="mt-6 border-l-4 border-burgundy pl-4 font-display text-cc-h2 tracking-[-0.03em] text-burgundy sm:pl-5">
        {title}
      </h1>
      <p className="mt-4 max-w-md font-body text-sm font-medium leading-relaxed text-burgundy/80">{body}</p>
      {cta ? (
        <p className="mt-6">
          <Link
            href={cta.href}
            className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-burgundy px-6 font-body text-sm font-semibold text-cream no-underline hover:opacity-90"
          >
            {cta.label}
          </Link>
        </p>
      ) : null}
    </>
  );
}
