"use client";

import { useFormState } from "react-dom";
import Link from "next/link";
import { resetPasswordWithToken } from "@/app/portal/actions";
import { ctaButtonClasses } from "@/components/ui/Button";

const initial: { error?: string } | null = null;

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction] = useFormState(resetPasswordWithToken, initial);

  return (
    <form action={formAction} className="mt-8 flex max-w-md flex-col gap-5">
      <input type="hidden" name="token" value={token} />
      {state?.error ? (
        <p className="font-body text-[12px] text-burgundy" role="alert">
          {state.error}
        </p>
      ) : null}
      <label className="flex flex-col gap-1.5">
        <span className="font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/55">New password (min. 8)</span>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="rounded-cc-card border border-burgundy/15 bg-cream px-4 py-3 font-body text-sm text-burgundy outline-none ring-burgundy/20 transition-shadow focus:ring-2"
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/55">Confirm password</span>
        <input
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
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
        Save new password
      </button>
      <p className="font-body text-[11px] text-burgundy/55">
        <Link href="/portal/forgot-password" className="text-burgundy underline underline-offset-4">
          Request a new link
        </Link>
        {" · "}
        <Link href="/portal/login" className="text-burgundy underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </form>
  );
}
