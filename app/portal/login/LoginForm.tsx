"use client";

import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import { ctaButtonClasses } from "@/components/ui/Button";

export function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/portal";
  const registered = searchParams.get("registered");
  const reset = searchParams.get("reset");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <form
      className="mt-8 flex flex-col gap-5"
      onSubmit={async (e) => {
        e.preventDefault();
        setError(null);
        setPending(true);
        const fd = new FormData(e.currentTarget);
        const email = String(fd.get("email") ?? "").trim();
        const password = String(fd.get("password") ?? "");
        const res = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });
        if (res?.error) {
          setPending(false);
          setError("Email or password is incorrect.");
          return;
        }
        /** Full navigation: avoids a race where soft navigation runs before the session cookie applies (double-click / no-op). */
        const safe = callbackUrl.startsWith("/") ? callbackUrl : "/portal";
        window.location.assign(safe);
      }}
    >
      {registered ? (
        <p className="rounded-cc-card border border-burgundy/15 bg-burgundy/[0.04] px-4 py-3 font-body text-[12px] leading-relaxed text-burgundy/80">
          Account created. Sign in with your new password.
        </p>
      ) : null}
      {reset ? (
        <p className="rounded-cc-card border border-burgundy/15 bg-burgundy/[0.04] px-4 py-3 font-body text-[12px] leading-relaxed text-burgundy/80">
          Your password was updated. Sign in with your new password.
        </p>
      ) : null}
      {error ? (
        <p className="font-body text-[12px] text-burgundy" role="alert">
          {error}
        </p>
      ) : null}
      <label className="flex flex-col gap-1.5">
        <span className="font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/55">Email</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="rounded-cc-card border border-burgundy/15 bg-cream px-4 py-3 font-body text-sm text-burgundy outline-none ring-burgundy/20 transition-shadow focus:ring-2"
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/55">
          Password
        </span>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="rounded-cc-card border border-burgundy/15 bg-cream px-4 py-3 font-body text-sm text-burgundy outline-none ring-burgundy/20 transition-shadow focus:ring-2"
        />
        <Link
          href="/portal/forgot-password"
          className="mt-1 inline-block font-body text-[11px] text-burgundy/60 underline underline-offset-4 hover:text-burgundy"
        >
          Forgot password?
        </Link>
      </label>
      <button
        type="submit"
        disabled={pending}
        className={ctaButtonClasses({
          variant: "burgundy",
          size: "md",
          isSubmit: true,
          className: "w-full justify-center sm:w-auto",
        })}
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
      <p className="font-body text-[11px] text-burgundy/55">
        No account?{" "}
        <Link href="/portal/register" className="text-burgundy underline underline-offset-4">
          Create one
        </Link>
      </p>
    </form>
  );
}
