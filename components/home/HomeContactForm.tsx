"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { ctaButtonClasses } from "@/components/ui/Button";
import { CONTACT_EMAIL_PATTERN } from "@/lib/marketing-contact-body";

const HOME_EMAIL_KEY = "cc-home-contact-email";

type Values = {
  email: string;
  privacyConsent: boolean;
  trap: string;
};

export function HomeContactForm() {
  const [sent, setSent] = useState(false);
  const [banner, setBanner] = useState<"none" | "error">("none");
  const [buttonSuccessFlash, setButtonSuccessFlash] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<Values>({ defaultValues: { email: "", privacyConsent: false, trap: "" } });

  const onSubmit = async (data: Values) => {
    setBanner("none");
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "home",
          email: data.email.trim(),
          honeypot: data.trap,
        }),
      });
      const payload = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        fieldErrors?: Record<string, string>;
      };

      if (res.ok && payload.ok) {
        try {
          sessionStorage.setItem(HOME_EMAIL_KEY, data.email.trim());
        } catch {
          /* private mode */
        }
        reset({ email: "", privacyConsent: false, trap: "" });
        setSent(true);
        setButtonSuccessFlash(true);
        if (successTimerRef.current) clearTimeout(successTimerRef.current);
        successTimerRef.current = setTimeout(() => setButtonSuccessFlash(false), 3000);
        setIsSubmitting(false);
        return;
      }

      if (payload.fieldErrors?.privacyConsent) {
        setError("privacyConsent", {
          type: "server",
          message: payload.fieldErrors.privacyConsent,
        });
      }
      setBanner("error");
      setIsSubmitting(false);
    } catch {
      setBanner("error");
      setIsSubmitting(false);
    }
  };

  const buttonDisabled = isSubmitting || buttonSuccessFlash;
  const miniButtonLabel = isSubmitting
    ? "Sending..."
    : buttonSuccessFlash
      ? "Message sent ✓"
      : "Submit";

  return (
    <section className="relative bg-cream px-6 py-[clamp(1.35rem,3.5vw,2.25rem)] md:px-10 md:py-9">
      <div className="mx-auto max-w-xl">
        <header className="text-center">
          <p className="cc-section-label mt-0 text-burgundy/55">[ Get in touch ]</p>
          <h2 className="cc-no-heading-hover mt-2 text-cc-h2 text-burgundy md:mt-2.5">
            Let&apos;s work <em className="font-normal italic">together</em>
          </h2>
          <p className="cc-copy-muted mx-auto mt-2 max-w-md md:mt-3 md:max-w-lg">
            Leave your email and we&apos;ll come back to you - or go straight to the full discovery
            form if you&apos;re ready.
          </p>
        </header>

        {sent ? (
          <div className="mx-auto mt-5 max-w-md px-5 py-5 text-center md:mt-6 md:px-6 md:py-6">
            <p className="cc-no-heading-hover font-display text-cc-h4 font-normal italic text-burgundy md:text-cc-h3">
              Thank you
            </p>
            <p className="cc-copy-muted mt-3">
              Thanks for reaching out - we&apos;ll be in touch within 1 to 2 working days. Continue
              to the full enquiry when you&apos;re ready and we&apos;ll have your email on file for
              this session.
            </p>
            <Link
              href="/contactus"
              className={`${ctaButtonClasses({
                variant: "burgundy",
                size: "md",
                className: "mt-6 tracking-[0.2em]",
              })}`}
            >
              Full enquiry form
            </Link>
          </div>
        ) : (
          <form
            className="relative mx-auto mt-5 w-full max-w-md text-center md:mt-6"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            <div
              className="pointer-events-none absolute -left-[9999px] h-px w-px overflow-hidden opacity-0"
              aria-hidden="true"
            >
              <label htmlFor="home-trap">Title</label>
              <input id="home-trap" tabIndex={-1} autoComplete="off" {...register("trap")} />
            </div>

            <div className="mx-auto w-full max-w-[min(100%,280px)]">
              <label
                htmlFor="home-contact-email"
                className="cc-section-label mb-1.5 block w-full text-center"
              >
                Email{" "}
                <span className="font-normal normal-case tracking-normal text-burgundy/50">
                  (required)
                </span>
              </label>
              <input
                id="home-contact-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full border-0 border-b-cc border-solid border-burgundy bg-transparent py-2 text-center font-body text-sm text-burgundy placeholder:text-burgundy/50 transition-[border-color,opacity] duration-200 focus:border-burgundy focus:outline-none focus:ring-0 md:text-[15px]"
                aria-invalid={errors.email ? "true" : "false"}
                {...register("email", {
                  required: "Please add your email",
                  pattern: {
                    value: CONTACT_EMAIL_PATTERN,
                    message: "Enter a valid email address",
                  },
                })}
              />
              {errors.email ? (
                <p className="cc-copy-sm mt-2.5 text-center text-rose-800/90" role="alert">
                  {errors.email.message}
                </p>
              ) : null}
            </div>

            <div className="mx-auto mt-5 max-w-[min(100%,320px)] text-left">
              <label
                htmlFor="home-contact-privacy"
                className="flex cursor-pointer items-start gap-3 font-body text-[11px] leading-snug text-burgundy/85 sm:text-[12px] sm:leading-relaxed"
              >
                <input
                  id="home-contact-privacy"
                  type="checkbox"
                  className="cc-no-lift mt-0.5 h-3.5 w-3.5 shrink-0 rounded-sm border border-burgundy/40 text-burgundy focus:ring-burgundy/30"
                  {...register("privacyConsent", {
                    validate: (v) =>
                      v === true ||
                      "Please agree to our Privacy Policy to submit this form",
                  })}
                />
                <span>
                  I agree to my data being stored and used to respond to my enquiry in accordance with the{" "}
                  <Link
                    href="/privacy-policy"
                    className="font-medium text-burgundy underline decoration-burgundy/35 underline-offset-2 hover:decoration-burgundy"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>
              {errors.privacyConsent ? (
                <p className="cc-copy-sm mt-2 text-rose-800/90" role="alert">
                  {errors.privacyConsent.message}
                </p>
              ) : null}
            </div>

            <div className="mt-5 flex flex-col items-center gap-2 md:mt-6">
              <button
                type="submit"
                disabled={buttonDisabled}
                className={ctaButtonClasses({
                  variant: buttonSuccessFlash ? "outline" : "burgundy",
                  size: "md",
                  isSubmit: true,
                  className: `min-w-[9.5rem] tracking-[0.2em] md:min-w-[10.5rem] ${
                    buttonSuccessFlash ? "!border-burgundy !bg-cream !text-burgundy !shadow-none" : ""
                  }`,
                })}
              >
                {miniButtonLabel}
              </button>
              <Link
                href="/contactus"
                className="cc-caption text-burgundy/60 underline decoration-burgundy/25 underline-offset-4 transition-colors hover:text-burgundy hover:decoration-burgundy/50"
              >
                Skip to full form
              </Link>
            </div>

            {banner === "error" ? (
              <div className="mx-auto mt-5 max-w-sm space-y-2 text-center">
                <p className="cc-copy-sm text-rose-800/90" role="alert">
                  Something went wrong - please try again.
                </p>
                <p className="cc-caption text-rose-800/75">
                  If the problem persists please email{" "}
                  <a href="mailto:hello@collectivstudio.uk" className="underline underline-offset-2">
                    hello@collectivstudio.uk
                  </a>
                  .
                </p>
              </div>
            ) : null}
          </form>
        )}
      </div>
    </section>
  );
}

export { HOME_EMAIL_KEY };
