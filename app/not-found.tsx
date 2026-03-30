import type { Metadata } from "next";
import Link from "next/link";
import { ctaButtonClasses } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Page not found | Collectiv. Studio",
};

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-cream px-6 py-16 text-center">
      <div className="mx-auto w-full max-w-md">
        <h1 className="font-display text-3xl tracking-[-0.03em] text-burgundy sm:text-4xl">Page not found</h1>
        <p className="cc-copy mt-4 text-sm leading-relaxed text-burgundy/75 sm:text-base">
          That URL doesn&apos;t exist or may have moved.
        </p>
        <Link
          href="/"
          className={ctaButtonClasses({
            variant: "burgundy",
            size: "md",
            className: "mt-10 min-w-[12rem] no-underline",
          })}
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
