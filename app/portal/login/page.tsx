import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign in | Client portal",
};

export default function PortalLoginPage() {
  return (
    <div>
      <Link
        href="/"
        className="font-body text-[11px] uppercase tracking-[0.1em] text-burgundy/55 no-underline hover:text-burgundy"
      >
        ← Back to site
      </Link>
      <h1 className="mt-6 border-l-4 border-burgundy pl-4 font-display text-cc-h2 tracking-[-0.03em] text-burgundy sm:pl-5">
        Sign in
      </h1>
      <p className="mt-4 max-w-md font-body text-sm font-medium leading-relaxed text-burgundy/80">
        Access your project hub: social calendar sign-off, website kit uploads, and branding &amp; print reviews.
      </p>
      <Suspense fallback={<div className="mt-8 h-40 animate-pulse rounded-cc-card bg-burgundy/5" />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
