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
  const combined = `${msg} ${causeStr}`;
  const dbHint =
    /prisma|database|connect|ECONNREFUSED|P1001/i.test(msg) || /prisma|database|connect|ECONNREFUSED|P1001/i.test(causeStr);
  const uploadHint =
    /uploadthing|UPLOADTHING|ufsUrl|presigned|file storage|upload succeeded|portal upload|Could not save the file|storage credentials/i.test(
      combined,
    );
  const permissionHint =
    /forbidden|unauthorized|not allowed|access denied|permission denied|\b403\b|\b401\b|NEXT_AUTH/i.test(combined);
  const notFoundHint = /not found|NEXT_NOT_FOUND|could not find|no longer exists/i.test(combined);
  const isDev = process.env.NODE_ENV === "development";
  const showMessage =
    isDev ||
    dbHint ||
    uploadHint ||
    permissionHint ||
    notFoundHint ||
    /P20\d{2}/.test(msg) ||
    /UploadThing|saveProjectUpload|saveClientProfilePhoto|assertValidStoredPortalUploadRef/i.test(combined);

  const detail =
    dbHint
      ? "If the database isn&apos;t connected yet, project pages can&apos;t load saved data. Set DATABASE_URL and refresh."
      : showMessage && msg
        ? msg
        : permissionHint
          ? "You don&apos;t have access to this project, or your session expired. Sign in again or open a project from your list."
          : notFoundHint
            ? "This project may have been removed or the link is wrong. Go back to your project list."
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
