"use client";

import { signIn } from "next-auth/react";
import { useState, type FormEvent } from "react";
import { completeClientInviteRegistration } from "@/app/portal/actions";
import { ctaButtonClasses } from "@/components/ui/Button";

export function InviteRegisterForm({
  token,
  email,
  defaultFullName,
  welcomeFirstName,
}: {
  token: string;
  email: string;
  defaultFullName: string;
  welcomeFirstName: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    setPending(true);
    const res = await completeClientInviteRegistration(null, fd);
    setPending(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    if (res.ok && res.email) {
      const password = String(fd.get("password") ?? "");
      const sign = await signIn("credentials", {
        email: res.email,
        password,
        redirect: false,
        callbackUrl: "/portal",
      });
      window.location.href = sign?.ok ? "/portal" : "/portal/login?registered=1";
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 flex max-w-md flex-col gap-5">
      <input type="hidden" name="token" value={token} />
      {error ? (
        <p className="font-body text-[13px] leading-relaxed text-burgundy" role="alert">
          {error}
        </p>
      ) : null}
      <p className="m-0 font-body text-[15px] leading-relaxed text-burgundy/85">
        Welcome{welcomeFirstName ? `, ${welcomeFirstName}` : ""}. You&apos;re almost in — set your name and password to
        open your project hub.
      </p>
      <label className="flex flex-col gap-1.5">
        <span className="font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/55">Email</span>
        <input
          type="email"
          readOnly
          value={email}
          className="cursor-not-allowed rounded-cc-card border border-burgundy/15 bg-zinc-100/80 px-4 py-3 font-body text-sm text-burgundy/80 outline-none"
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/55">Full name *</span>
        <input
          name="fullName"
          type="text"
          required
          autoComplete="name"
          defaultValue={defaultFullName}
          maxLength={200}
          className="rounded-cc-card border border-burgundy/15 bg-cream px-4 py-3 font-body text-sm text-burgundy outline-none ring-burgundy/20 transition-shadow focus:ring-2"
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/55">Password *</span>
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
      <label className="flex flex-col gap-1.5">
        <span className="font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/55">Confirm password *</span>
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
        disabled={pending}
        className={ctaButtonClasses({
          variant: "burgundy",
          size: "md",
          isSubmit: true,
          className: "w-full justify-center disabled:cursor-wait disabled:opacity-80",
        })}
      >
        {pending ? "Creating your account…" : "Complete registration"}
      </button>
    </form>
  );
}
