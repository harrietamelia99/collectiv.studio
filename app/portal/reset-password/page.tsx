import type { Metadata } from "next";
import Link from "next/link";
import { ResetPasswordForm } from "./ResetPasswordForm";

export const metadata: Metadata = {
  title: "Set new password | Client portal",
};

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const token = typeof searchParams.token === "string" ? searchParams.token.trim() : "";

  return (
    <div>
      <Link
        href="/portal/login"
        className="font-body text-[11px] uppercase tracking-[0.1em] text-burgundy/55 no-underline hover:text-burgundy"
      >
        ← Sign in
      </Link>
      <h1 className="mt-6 border-l-4 border-burgundy pl-4 font-display text-cc-h2 tracking-[-0.03em] text-burgundy sm:pl-5">
        Choose a new password
      </h1>
      {!token ? (
        <p className="mt-4 max-w-md font-body text-sm leading-relaxed text-burgundy/80">
          This link is missing a token. Open the reset link from your email, or{" "}
          <Link href="/portal/forgot-password" className="text-burgundy underline underline-offset-4">
            request a new one
          </Link>
          .
        </p>
      ) : (
        <>
          <p className="mt-4 max-w-md font-body text-sm font-medium leading-relaxed text-burgundy/80">
            Enter a new password below. After saving, sign in with your email and this password.
          </p>
          <ResetPasswordForm token={token} />
        </>
      )}
    </div>
  );
}
