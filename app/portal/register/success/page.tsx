import type { Metadata } from "next";
import Link from "next/link";
import { ctaButtonClasses } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "You're all set | Client portal",
};

export default function PortalRegisterSuccessPage() {
  return (
    <div className="max-w-lg">
      <Link
        href="/"
        className="font-body text-[11px] uppercase tracking-[0.1em] text-burgundy/55 no-underline hover:text-burgundy"
      >
        ← Back to site
      </Link>
      <h1 className="mt-6 border-l-4 border-burgundy pl-4 font-display text-cc-h2 tracking-[-0.03em] text-burgundy sm:pl-5">
        You&apos;re all set
      </h1>
      <p className="mt-5 font-body text-sm font-medium leading-relaxed text-burgundy/85">
        Thanks for creating your account. We&apos;ll be in touch shortly with next steps — keep an eye on your inbox.
      </p>
      <p className="mt-6 rounded-cc-card border border-burgundy/12 bg-burgundy/[0.03] px-4 py-3.5 font-body text-[12px] leading-relaxed text-burgundy/70">
        In the meantime, you can sign in to your portal using the email and password you just created.
      </p>
      <div className="mt-8">
        <Link
          href="/portal/login"
          className={ctaButtonClasses({
            variant: "burgundy",
            size: "md",
            className: "inline-flex justify-center",
          })}
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
