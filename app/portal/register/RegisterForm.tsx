"use client";

import { useFormState } from "react-dom";
import Link from "next/link";
import { registerUser } from "@/app/portal/actions";
import { ctaButtonClasses } from "@/components/ui/Button";

const initial: { error?: string } | null = null;

export function RegisterForm() {
  const [state, formAction] = useFormState(registerUser, initial);

  return (
    <form action={formAction} className="mt-8 flex max-w-md flex-col gap-5">
      {state?.error ? (
        <p className="font-body text-[12px] text-burgundy" role="alert">
          {state.error}
        </p>
      ) : null}
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 sm:col-span-1">
          <span className="font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/55">First name *</span>
          <input
            name="firstName"
            type="text"
            required
            autoComplete="given-name"
            className="rounded-cc-card border border-burgundy/15 bg-cream px-4 py-3 font-body text-sm text-burgundy outline-none ring-burgundy/20 transition-shadow focus:ring-2"
          />
        </label>
        <label className="flex flex-col gap-1.5 sm:col-span-1">
          <span className="font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/55">Last name *</span>
          <input
            name="lastName"
            type="text"
            required
            autoComplete="family-name"
            className="rounded-cc-card border border-burgundy/15 bg-cream px-4 py-3 font-body text-sm text-burgundy outline-none ring-burgundy/20 transition-shadow focus:ring-2"
          />
        </label>
      </div>
      <label className="flex flex-col gap-1.5">
        <span className="font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/55">Email *</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="rounded-cc-card border border-burgundy/15 bg-cream px-4 py-3 font-body text-sm text-burgundy outline-none ring-burgundy/20 transition-shadow focus:ring-2"
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/55">Contact phone *</span>
        <input
          name="phone"
          type="tel"
          required
          autoComplete="tel"
          placeholder="e.g. +44 7700 900000"
          className="rounded-cc-card border border-burgundy/15 bg-cream px-4 py-3 font-body text-sm text-burgundy outline-none ring-burgundy/20 transition-shadow focus:ring-2"
        />
        <span className="font-body text-[11px] leading-relaxed text-burgundy/50">
          Include country code if you’re outside the UK. We’ll only use this to reach you about your project.
        </span>
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/55">
          Business or brand name <span className="normal-case tracking-normal text-burgundy/45">(optional)</span>
        </span>
        <input
          name="businessName"
          type="text"
          autoComplete="organization"
          maxLength={120}
          placeholder="e.g. Acme Studio Ltd"
          className="rounded-cc-card border border-burgundy/15 bg-cream px-4 py-3 font-body text-sm text-burgundy outline-none ring-burgundy/20 transition-shadow focus:ring-2"
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/55">
          Password (min. 8 characters) *
        </span>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="rounded-cc-card border border-burgundy/15 bg-cream px-4 py-3 font-body text-sm text-burgundy outline-none ring-burgundy/20 transition-shadow focus:ring-2"
        />
        <span className="font-body text-[11px] text-burgundy/50">At least 8 characters, including at least one number.</span>
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
        Create account
      </button>
      <p className="font-body text-[11px] text-burgundy/55">
        Already registered?{" "}
        <Link href="/portal/login" className="text-burgundy underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </form>
  );
}
