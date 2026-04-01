"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { useEffect, useState, useTransition } from "react";
import { useFormState } from "react-dom";
import {
  changeClientPortalEmail,
  changeClientPortalPassword,
  requestPortalPasswordResetForSelf,
} from "@/app/portal/actions";
import { ClientPortalProfilePhotoSection } from "@/components/portal/ClientPortalProfilePhotoSection";
import { PendingSubmitButton, PortalFormSubmitButton } from "@/components/portal/PortalFormSubmitButton";
import { PortalFormWithFlash } from "@/components/portal/PortalFormWithFlash";
import { ctaButtonClasses } from "@/components/ui/Button";

const field =
  "rounded-cc-card border border-burgundy/15 bg-white px-4 py-3 font-body text-sm text-burgundy outline-none ring-burgundy/20 focus:ring-2";

type Props = {
  userId: string;
  email: string;
  hasPassword: boolean;
  profilePhotoPath: string | null;
};

export function ClientAccountPageContent({ userId, email, hasPassword, profilePhotoPath }: Props) {
  const [emailState, emailFormAction] = useFormState(changeClientPortalEmail, null);
  const [resetFlash, setResetFlash] = useState<{ ok: boolean; text: string } | null>(null);
  const [resetPending, startResetTransition] = useTransition();

  useEffect(() => {
    if (emailState?.ok === true && emailState.relogin) {
      void signOut({ callbackUrl: "/portal/login?emailChanged=1" });
    }
  }, [emailState]);

  const emailError = emailState && !emailState.ok ? emailState.error : null;

  return (
    <div className="mt-8 max-w-xl space-y-10">
      {!hasPassword ? (
        <div
          className="rounded-xl border border-amber-200/90 bg-amber-50/60 px-4 py-3 font-body text-sm leading-relaxed text-amber-950/90"
          role="status"
        >
          Finish setting up your account from the link in your invite email before you can change your email or password
          here. You can still add a profile photo below.
        </div>
      ) : null}

      <section className="cc-portal-client-shell rounded-xl border border-zinc-200/90 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="cc-portal-client-shell-title text-lg">Sign-in email</h2>
        <p className="mt-2 font-body text-sm leading-relaxed text-burgundy/70">
          You currently sign in as <span className="font-medium text-burgundy">{email}</span>.
        </p>
        {hasPassword ? (
          <form action={emailFormAction} className="mt-5 space-y-4">
            <label className="flex flex-col gap-1.5">
              <span className="font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/55">New email</span>
              <input
                name="newEmail"
                type="email"
                required
                autoComplete="email"
                className={`${field} w-full`}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/55">
                Current password (to confirm)
              </span>
              <input
                name="currentPassword"
                type="password"
                required
                autoComplete="current-password"
                className={`${field} w-full`}
              />
            </label>
            {emailError ? (
              <p className="font-body text-sm text-rose-700" role="alert">
                {emailError}
              </p>
            ) : null}
            <PendingSubmitButton
              idleLabel="Update email"
              pendingLabel="Saving…"
              variant="burgundy"
              size="sm"
              className="min-h-[44px]"
            />
            <p className="font-body text-[11px] leading-relaxed text-burgundy/55">
              After a successful change you&apos;ll be signed out — sign back in with the new address.
            </p>
          </form>
        ) : null}
      </section>

      {hasPassword ? (
        <>
          <section className="cc-portal-client-shell rounded-xl border border-zinc-200/90 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="cc-portal-client-shell-title text-lg">Password</h2>
            <p className="mt-2 font-body text-sm leading-relaxed text-burgundy/70">
              Change your password while signed in, or use a reset link if you prefer.
            </p>
            <PortalFormWithFlash
              action={changeClientPortalPassword}
              className="mt-5 space-y-4"
              defaultSuccessMessage="Password updated."
            >
              <label className="flex flex-col gap-1.5">
                <span className="font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/55">
                  Current password
                </span>
                <input
                  name="currentPassword"
                  type="password"
                  required
                  autoComplete="current-password"
                  className={`${field} w-full`}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/55">New password</span>
                <input
                  name="newPassword"
                  type="password"
                  required
                  autoComplete="new-password"
                  className={`${field} w-full`}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/55">
                  Confirm new password
                </span>
                <input
                  name="confirmPassword"
                  type="password"
                  required
                  autoComplete="new-password"
                  className={`${field} w-full`}
                />
              </label>
              <p className="font-body text-[11px] text-burgundy/50">
                At least 8 characters, including at least one number.
              </p>
              <PortalFormSubmitButton
                idleLabel="Update password"
                pendingLabel="Saving…"
                successLabel="Password updated ✓"
                errorFallback="Couldn’t update password. Try again."
                variant="burgundy"
                size="sm"
                className="min-h-[44px]"
              />
            </PortalFormWithFlash>
          </section>

          <section className="cc-portal-client-shell rounded-xl border border-zinc-200/90 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="cc-portal-client-shell-title text-lg">Password reset link</h2>
            <p className="mt-2 font-body text-sm leading-relaxed text-burgundy/70">
              We&apos;ll email you a secure link (valid about an hour) to choose a new password — same as the
              &quot;Forgot password&quot; flow on the sign-in page.
            </p>
            {resetFlash ? (
              <p
                className={`mt-4 rounded-xl border px-4 py-3 font-body text-sm leading-relaxed ${
                  resetFlash.ok
                    ? "border-burgundy/90 bg-cream text-burgundy"
                    : "border-rose-200/90 bg-rose-50/95 text-rose-800/90"
                }`}
                role="status"
              >
                {resetFlash.text}
              </p>
            ) : null}
            <button
              type="button"
              disabled={resetPending}
              onClick={() => {
                setResetFlash(null);
                startResetTransition(async () => {
                  const r = await requestPortalPasswordResetForSelf();
                  if (r.ok) {
                    setResetFlash({ ok: true, text: r.message ?? "Check your email." });
                  } else {
                    setResetFlash({ ok: false, text: r.error });
                  }
                });
              }}
              className={ctaButtonClasses({
                variant: "outline",
                size: "sm",
                className: "mt-5 min-h-[44px]",
              })}
            >
              {resetPending ? "Sending…" : "Email me a reset link"}
            </button>
          </section>
        </>
      ) : null}

      <ClientPortalProfilePhotoSection userId={userId} profilePhotoPath={profilePhotoPath} className="mt-0" />

      <p className="font-body text-sm text-burgundy/60">
        <Link
          href="/portal/brand-kit"
          className="font-medium text-burgundy underline decoration-burgundy/30 underline-offset-4 hover:decoration-burgundy/55"
        >
          Brand kit
        </Link>{" "}
        — colours, fonts, and logos for new projects — lives on a separate page.
      </p>
    </div>
  );
}
