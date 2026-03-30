"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { ctaButtonClasses, FormSubmitButton } from "@/components/ui/Button";

const HOME_EMAIL_KEY = "cc-home-contact-email";

type Values = {
  email: string;
};

export function HomeContactForm() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Values>();

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
              Your email is saved for this session. Continue to the full enquiry and we&apos;ll
              have you mostly set up.
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
            className="mx-auto mt-5 w-full max-w-[min(100%,360px)] text-center md:mt-6"
            onSubmit={handleSubmit((data) => {
              try {
                sessionStorage.setItem(HOME_EMAIL_KEY, data.email.trim());
              } catch {
                /* private mode */
              }
              setSent(true);
              reset();
            })}
            noValidate
          >
            <div className="mx-auto w-full max-w-[min(100%,280px)]">
              <label
                htmlFor="home-contact-email"
                className="cc-section-label mb-1.5 block w-full text-center"
              >
                Email <span className="font-normal normal-case tracking-normal text-burgundy/50">(required)</span>
              </label>
              <input
                id="home-contact-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full border-0 border-b-cc border-solid border-burgundy bg-transparent py-2 text-center font-body text-sm text-burgundy placeholder:text-burgundy/35 transition-[border-color,opacity] duration-200 focus:border-burgundy focus:outline-none focus:ring-0 md:text-[15px]"
                aria-invalid={errors.email ? "true" : "false"}
                {...register("email", {
                  required: "Please add your email",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Enter a valid email",
                  },
                })}
              />
              {errors.email ? (
                <p className="cc-copy-sm mt-2.5 text-center text-burgundy/75" role="alert">
                  {errors.email.message}
                </p>
              ) : null}
            </div>

            <div className="mt-4 flex flex-col items-center gap-2 md:mt-5">
              <FormSubmitButton className="min-w-[9.5rem] tracking-[0.2em] md:min-w-[10.5rem]">
                Submit
              </FormSubmitButton>
              <Link
                href="/contactus"
                className="cc-caption text-burgundy/60 underline decoration-burgundy/25 underline-offset-4 transition-colors hover:text-burgundy hover:decoration-burgundy/50"
              >
                Skip to full form
              </Link>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}

export { HOME_EMAIL_KEY };
