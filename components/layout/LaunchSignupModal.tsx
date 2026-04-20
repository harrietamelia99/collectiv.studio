"use client";

import Image from "next/image";
import { useReducedMotion } from "framer-motion";
import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ctaButtonClasses } from "@/components/ui/Button";

const STORAGE_KEY = "cc-launch-signup-dismissed";
const MODAL_IMAGE = "/images/portfolio-petite.png";

export function LaunchSignupModal() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const reduceMotion = useReducedMotion();
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [thanks, setThanks] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    if (pathname !== "/") return;

    /** Preview / QA: `/?launchModal=1` or `/?showLaunch=1` bypasses “already dismissed”. */
    const forceShow =
      searchParams.get("launchModal") === "1" ||
      searchParams.get("showLaunch") === "1";

    if (!forceShow) {
      try {
        if (typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY)) {
          return;
        }
      } catch {
        return;
      }
    }

    const delay = forceShow ? 200 : reduceMotion ? 0 : 700;
    const t = window.setTimeout(() => {
      if (!cancelled) setOpen(true);
    }, delay);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [pathname, reduceMotion, searchParams]);

  const dismiss = useCallback(() => {
    setOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, dismiss]);

  useEffect(() => {
    if (!open || thanks) return;
    const el = panelRef.current?.querySelector<HTMLElement>(
      "#launch-signup-name, input[type=\"email\"], button[type=\"submit\"]",
    );
    window.setTimeout(() => el?.focus(), reduceMotion ? 0 : 100);
  }, [open, thanks, reduceMotion]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/launch-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Something went wrong.");
        setBusy(false);
        return;
      }
      setThanks(true);
      setBusy(false);
      try {
        localStorage.setItem(STORAGE_KEY, "1");
      } catch {
        /* ignore */
      }
      window.setTimeout(() => setOpen(false), 2400);
    } catch {
      setError("Network error. Please try again.");
      setBusy(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[10100] flex items-end justify-center p-0 sm:items-center sm:p-5 md:p-8"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-burgundy/50 backdrop-blur-[3px] transition-opacity duration-300 ease-smooth"
        aria-label="Close announcement"
        onClick={dismiss}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex max-h-[96dvh] w-full max-w-[920px] flex-col overflow-hidden rounded-none border border-burgundy/12 bg-cream shadow-[0_24px_80px_rgba(37,13,24,0.35)] md:min-h-[min(72dvh,680px)] md:flex-row"
      >
        <button
          type="button"
          onClick={dismiss}
          className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-none border border-burgundy/25 bg-cream/95 text-burgundy shadow-sm transition-colors hover:border-burgundy/40 hover:bg-cream md:right-4 md:top-4"
          aria-label="Close"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path
              d="M1 1l12 12M13 1L1 13"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <div className="relative aspect-[16/10] w-full max-h-[min(50vw,260px)] shrink-0 overflow-hidden bg-burgundy sm:aspect-[2/1] sm:max-h-[300px] md:aspect-auto md:h-auto md:max-h-none md:min-h-[min(58vh,520px)] md:w-[46%]">
          <Image
            src={MODAL_IMAGE}
            alt="Collectiv. Studio brand and web design work — featured project imagery beside the studio mailing list signup"
            fill
            className="object-cover object-[center_42%] md:object-center"
            sizes="(max-width: 768px) 100vw, 420px"
            priority
          />
        </div>

        <div className="flex min-h-0 flex-1 flex-col justify-center px-6 pb-8 pt-6 text-left sm:px-8 sm:pb-10 sm:pt-7 md:px-10 md:py-10 lg:px-12 lg:py-12">
          {thanks ? (
            <p className="font-display text-center text-[clamp(1.35rem,3.5vw,1.85rem)] font-normal leading-snug tracking-[-0.03em] text-burgundy">
              You&apos;re on the list. We&apos;ll be in touch.
            </p>
          ) : (
            <>
              <h2
                id={titleId}
                className="cc-no-heading-hover pr-10 font-display text-[clamp(1.45rem,3.8vw,2.05rem)] font-normal tracking-[-0.035em] text-burgundy md:pr-6"
              >
                <span className="block leading-snug md:hidden">Taking bookings for May 2026</span>
                <span className="hidden md:block">
                  <span className="block leading-[1.28]">Taking bookings for</span>
                  <span className="mt-2 block leading-[1.15]">May 2026</span>
                </span>
              </h2>
              <p className="mt-5 max-w-md font-body text-[15px] font-normal leading-relaxed tracking-[0.01em] text-burgundy/72 sm:text-[16px] md:mt-6">
                Add your name and email to reserve your place before spaces fill, and take the first
                step towards creating the brand of your dreams.
              </p>

              <form
                className="mt-6 flex w-full max-w-md flex-col gap-4 sm:mt-7"
                onSubmit={onSubmit}
                noValidate
              >
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="launch-signup-name"
                    className="font-body text-[10px] font-medium uppercase tracking-[0.14em] text-burgundy/55"
                  >
                    Name
                  </label>
                  <input
                    id="launch-signup-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    maxLength={120}
                    className="min-h-[2.75rem] w-full rounded-[var(--cc-pill-radius)] border border-burgundy/20 bg-white px-4 font-body text-sm text-burgundy placeholder:text-burgundy/38 outline-none transition-[border-color,box-shadow] duration-200 focus:border-burgundy/45 focus:ring-2 focus:ring-burgundy/15 sm:min-h-[3rem] sm:px-5 sm:text-[15px]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="launch-signup-email"
                    className="font-body text-[10px] font-medium uppercase tracking-[0.14em] text-burgundy/55"
                  >
                    Email
                  </label>
                  <input
                    id="launch-signup-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="min-h-[2.75rem] w-full rounded-[var(--cc-pill-radius)] border border-burgundy/20 bg-white px-4 font-body text-sm text-burgundy placeholder:text-burgundy/38 outline-none transition-[border-color,box-shadow] duration-200 focus:border-burgundy/45 focus:ring-2 focus:ring-burgundy/15 sm:min-h-[3rem] sm:px-5 sm:text-[15px]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={busy}
                  className={ctaButtonClasses({
                    variant: "burgundy",
                    size: "md",
                    isSubmit: true,
                    className: "min-h-[2.75rem] w-full shrink-0 sm:min-h-[3rem] sm:w-fit sm:min-w-[9.5rem] sm:px-8",
                  })}
                >
                  {busy ? "…" : "Sign up"}
                </button>
              </form>
              {error ? (
                <p className="mt-2 font-body text-[10px] text-burgundy/80" role="alert">
                  {error}
                </p>
              ) : null}
              <p className="mt-4 font-display text-[11px] tracking-[0.03em] text-burgundy/50 sm:mt-5">
                We respect your privacy.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
