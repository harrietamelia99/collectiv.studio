import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot password | Client portal",
};

export default function ForgotPasswordPage() {
  return (
    <div>
      <Link
        href="/portal/login"
        className="font-body text-[11px] uppercase tracking-[0.1em] text-burgundy/55 no-underline hover:text-burgundy"
      >
        ← Sign in
      </Link>
      <h1 className="mt-6 border-l-4 border-burgundy pl-4 font-display text-cc-h2 tracking-[-0.03em] text-burgundy sm:pl-5">
        Reset your password
      </h1>
      <p className="mt-4 max-w-md font-body text-sm font-medium leading-relaxed text-burgundy/80">
        Enter the email you use for the portal. We&apos;ll send you a one-time link to choose a new password.
      </p>
      <ForgotPasswordForm />
    </div>
  );
}
