"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ctaButtonClasses } from "@/components/ui/Button";

export default function PortalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Portal error:", error);
  }, [error]);

  const dbHint =
    /prisma|database|connect|ECONNREFUSED|P1001/i.test(error.message) ||
    /prisma|database|connect|ECONNREFUSED|P1001/i.test(String(error.cause ?? ""));

  return (
    <div className="mx-auto max-w-lg rounded-xl border border-rose-200/90 bg-rose-50/80 px-5 py-8 text-center">
      <h1 className="font-display text-xl tracking-[-0.02em] text-burgundy">Something didn&apos;t load</h1>
      <p className="mt-3 font-body text-sm leading-relaxed text-burgundy/80">
        {dbHint
          ? "The portal usually needs a working database connection. Check DATABASE_URL (e.g. Supabase) and try again."
          : "An unexpected error occurred. You can retry or go back to your projects."}
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <button type="button" onClick={() => reset()} className={ctaButtonClasses({ variant: "ink", size: "sm" })}>
          Try again
        </button>
        <Link href="/portal" className={ctaButtonClasses({ variant: "outline", size: "sm" })}>
          My projects
        </Link>
      </div>
    </div>
  );
}
