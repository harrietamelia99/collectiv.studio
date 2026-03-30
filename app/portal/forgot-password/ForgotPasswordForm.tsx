"use client";

import { useFormState } from "react-dom";
import Link from "next/link";
import { requestPasswordReset } from "@/app/portal/actions";
import { ctaButtonClasses } from "@/components/ui/Button";

const initial: { error?: string; ok?: boolean } | null = null;

export function ForgotPasswordForm() {
  const [state, formAction] = useFormState(requestPasswordReset, initial);

  if (state?.ok) {
    return (
      <div className="mt-8 max-w-md">
        <p className="rounded-cc-card border border-burgundy/15 bg-burgundy/[0.04] px-4 py-3 font-body text-sm leading-relaxed text-burgundy/85">
          If an account exists for that email, we&apos;ve sent a link to reset your password. Check your inbox (and spam)
          — it expires in one hour.
        </p>
        <p className="mt-6 font-body text-[11px] text-burgundy/55">
          <Link href="/portal/login" className="text-burgundy underline underline-offset-4">
            Back to sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-8 flex max-w-md flex-col gap-5">
      {state?.error ? (
        <p className="font-body text-[12px] text-burgundy" role="alert">
          {state.error}
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
      <button
        type="submit"
        className={ctaButtonClasses({
          variant: "burgundy",
          size: "md",
          isSubmit: true,
          className: "w-full justify-center sm:w-auto",
        })}
      >
        Send reset link
      </button>
      <p className="font-body text-[11px] text-burgundy/55">
        <Link href="/portal/login" className="text-burgundy underline underline-offset-4">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
