"use client";

import { useEffect } from "react";
import { ctaButtonClasses } from "@/components/ui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-6 py-20 text-center">
      <p className="cc-copy text-center">
        Something went wrong while loading this page.
      </p>
      {process.env.NODE_ENV === "development" && error?.message ? (
        <pre className="mt-4 max-h-40 w-full max-w-xl overflow-auto rounded-lg border border-burgundy/15 bg-burgundy/[0.04] p-3 text-left font-mono text-[11px] leading-relaxed text-burgundy/90">
          {error.message}
        </pre>
      ) : null}
      <button
        type="button"
        onClick={() => reset()}
        className={ctaButtonClasses({ variant: "burgundy", size: "md", className: "mt-6" })}
      >
        Try again
      </button>
      <p className="cc-copy-sm mt-8 text-center text-burgundy/60">
        {process.env.NODE_ENV === "development" ? (
          <>
            If this keeps happening, stop all running dev servers, run{" "}
            <code className="rounded bg-burgundy/10 px-1 py-0.5">npm run dev:clean</code> in{" "}
            <code className="rounded bg-burgundy/10 px-1 py-0.5">collectiv-studio</code>, then open{" "}
            <code className="rounded bg-burgundy/10 px-1 py-0.5">http://localhost:3333</code>
          </>
        ) : (
          <>
            Check{" "}
            <strong className="font-medium text-burgundy/80">Vercel → your deployment → Logs</strong> for the
            real error. Common fixes: set Supabase{" "}
            <code className="rounded bg-burgundy/10 px-1 py-0.5">DATABASE_URL</code> (transaction pooler{" "}
            <code className="rounded bg-burgundy/10 px-1 py-0.5">:6543</code> with{" "}
            <code className="rounded bg-burgundy/10 px-1 py-0.5">pgbouncer=true</code> &amp;{" "}
            <code className="rounded bg-burgundy/10 px-1 py-0.5">sslmode=require</code>) and matching{" "}
            <code className="rounded bg-burgundy/10 px-1 py-0.5">DIRECT_URL</code>, plus{" "}
            <code className="rounded bg-burgundy/10 px-1 py-0.5">NEXTAUTH_URL</code> (exact live{" "}
            <code className="rounded bg-burgundy/10 px-1 py-0.5">https://…</code> URL) and{" "}
            <code className="rounded bg-burgundy/10 px-1 py-0.5">NEXTAUTH_SECRET</code>, then redeploy.
          </>
        )}
      </p>
    </div>
  );
}
