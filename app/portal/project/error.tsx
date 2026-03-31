"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ctaButtonClasses } from "@/components/ui/Button";

export default function PortalProjectError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Project portal error:", error);
  }, [error]);

  const msg = error.message?.trim() ?? "";
  const causeStr = String(error.cause ?? "");
  const dbHint =
    /prisma|database|connect|ECONNREFUSED|P1001/i.test(msg) || /prisma|database|connect|ECONNREFUSED|P1001/i.test(causeStr);
  const isDev = process.env.NODE_ENV === "development";
  const showMessage =
    isDev ||
    dbHint ||
    /uploadthing|UPLOADTHING|ufsUrl|presigned|file storage|upload succeeded but/i.test(msg) ||
    /uploadthing|UPLOADTHING/i.test(causeStr) ||
    /P20\d{2}/.test(msg) ||
    /UploadThing|saveProjectUpload|Could not save the file/i.test(msg);

  const detail =
    dbHint
      ? "If the database isn&apos;t connected yet, project pages can&apos;t load saved data. Set DATABASE_URL and refresh."
      : showMessage && msg
        ? msg
        : "Something went wrong loading this project. Try again or return to your project list.";

  return (
    <div className="mx-auto max-w-lg rounded-xl border border-rose-200/90 bg-rose-50/80 px-5 py-8 text-center">
      <h1 className="font-display text-xl tracking-[-0.02em] text-burgundy">This project couldn&apos;t be opened</h1>
      <p className="mt-3 font-body text-sm leading-relaxed text-burgundy/80">{detail}</p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <button type="button" onClick={() => reset()} className={ctaButtonClasses({ variant: "ink", size: "sm" })}>
          Try again
        </button>
        <Link href="/portal" className={ctaButtonClasses({ variant: "outline", size: "sm" })}>
          All projects
        </Link>
      </div>
    </div>
  );
}
