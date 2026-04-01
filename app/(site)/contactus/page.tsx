"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useForm, type UseFormRegister } from "react-hook-form";
import { HOME_EMAIL_KEY } from "@/components/home/HomeContactForm";
import { ctaButtonClasses } from "@/components/ui/Button";
import { MotionSection } from "@/components/ui/SectionReveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { CONTACT_EMAIL_PATTERN } from "@/lib/marketing-contact-body";

type FormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  businessName: string;
  businessWebsite: string;
  socialHandle: string;
  basedIn: string;
  industry: string;
  aboutBusiness: string;
  servicesInterested: string;
  budget: string;
  timeline: string;
  howHeard: string;
  wordOfMouthThanks: string;
  additionalQuestions: string;
  privacyConsent: boolean;
  trap: string;
};

const BUDGET_OPTIONS = [
  "Less than £500",
  "£700–£1,200",
  "£1,200–£2,000",
  "£2,500–£3,000+",
] as const;

const TIMELINE_OPTIONS = [
  "Less than 1 month",
  "Within 1–2 months",
  "Within 3–4 months",
  "Just gathering info right now",
] as const;

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 font-body text-[12px] text-rose-800/90 md:text-[13px]" role="alert">
      {message}
    </p>
  );
}

function UnderlineField({
  id,
  label,
  requiredMark,
  error,
  children,
}: {
  id: string;
  label: string;
  requiredMark?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="pt-2">
      <label htmlFor={id} className="cc-form-label mb-2 block">
        {label}
        {requiredMark ? (
          <span className="text-burgundy/70"> (required)</span>
        ) : null}
      </label>
      {children}
      <FieldError message={error} />
    </div>
  );
}

function ChoiceGroup({
  legend,
  name,
  options,
  register,
  required,
  error,
}: {
  legend: string;
  name: keyof FormValues;
  options: readonly string[];
  register: UseFormRegister<FormValues>;
  required?: boolean;
  error?: string;
}) {
  return (
    <fieldset className="border-0 p-0 pt-2">
      <legend className="cc-form-label mb-3 block w-full">
        {legend}
        {required ? <span className="text-burgundy/70"> (required)</span> : null}
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <label key={opt} className="inline-flex cursor-pointer items-center">
            <input
              type="radio"
              value={opt}
              className="peer sr-only"
              {...register(name, { required: required ? "Please choose an option" : false })}
            />
            <span className="cc-caption rounded-md border border-burgundy/20 bg-transparent px-3 py-2.5 text-burgundy transition-colors peer-checked:border-burgundy peer-checked:bg-burgundy peer-checked:text-cream hover:border-burgundy/40">
              {opt}
            </span>
          </label>
        ))}
      </div>
      <FieldError message={error} />
    </fieldset>
  );
}

const lineInput =
  "cc-copy w-full border-0 border-b-cc border-solid border-burgundy bg-transparent py-2.5 placeholder:text-burgundy/40 focus:border-burgundy focus:outline-none focus:ring-0";

const lineTextarea =
  "cc-copy w-full min-h-[100px] resize-y border-0 border-b-cc border-solid border-burgundy bg-transparent py-2.5 placeholder:text-burgundy/40 focus:border-burgundy focus:outline-none focus:ring-0";

export default function ContactPage() {
  const [banner, setBanner] = useState<"none" | "success" | "error">("none");
  const [buttonSuccessFlash, setButtonSuccessFlash] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { register, handleSubmit, reset, setValue, setError, formState: { errors } } =
    useForm<FormValues>({
      defaultValues: {
        trap: "",
        phone: "",
        firstName: "",
        lastName: "",
        email: "",
        businessName: "",
        businessWebsite: "",
        socialHandle: "",
        basedIn: "",
        industry: "",
        aboutBusiness: "",
        servicesInterested: "",
        budget: "",
        timeline: "",
        howHeard: "",
        wordOfMouthThanks: "",
        additionalQuestions: "",
        privacyConsent: false,
      },
    });

  useEffect(() => {
    try {
      const fromHome = sessionStorage.getItem(HOME_EMAIL_KEY);
      if (fromHome) {
        setValue("email", fromHome);
        sessionStorage.removeItem(HOME_EMAIL_KEY);
      }
    } catch {
      /* ignore */
    }
  }, [setValue]);

  useEffect(() => {
    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, []);

  const onSubmit = async (data: FormValues) => {
    setBanner("none");
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "contact",
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          email: data.email.trim(),
          phone: data.phone.trim() || undefined,
          businessName: data.businessName.trim() || undefined,
          businessWebsite: data.businessWebsite.trim() || undefined,
          socialHandle: data.socialHandle.trim() || undefined,
          basedIn: data.basedIn.trim() || undefined,
          industry: data.industry.trim() || undefined,
          aboutBusiness: data.aboutBusiness.trim() || undefined,
          servicesInterested: data.servicesInterested.trim(),
          budget: data.budget,
          timeline: data.timeline,
          howHeard: data.howHeard.trim() || undefined,
          wordOfMouthThanks: data.wordOfMouthThanks.trim() || undefined,
          additionalQuestions: data.additionalQuestions.trim() || undefined,
          privacyConsent: data.privacyConsent === true,
          honeypot: data.trap,
        }),
      });

      const payload = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        fieldErrors?: Record<string, string>;
        error?: string;
      };

      if (res.ok && payload.ok) {
        // eslint-disable-next-line no-console
        console.log("[contact-form] client: submission OK");
        reset({
          trap: "",
          phone: "",
          firstName: "",
          lastName: "",
          email: "",
          businessName: "",
          businessWebsite: "",
          socialHandle: "",
          basedIn: "",
          industry: "",
          aboutBusiness: "",
          servicesInterested: "",
          budget: "",
          timeline: "",
          howHeard: "",
          wordOfMouthThanks: "",
          additionalQuestions: "",
          privacyConsent: false,
        });
        setBanner("success");
        setButtonSuccessFlash(true);
        if (successTimerRef.current) clearTimeout(successTimerRef.current);
        successTimerRef.current = setTimeout(() => setButtonSuccessFlash(false), 3000);
        setIsSubmitting(false);
        return;
      }

      if (payload.fieldErrors && typeof payload.fieldErrors === "object") {
        for (const [key, msg] of Object.entries(payload.fieldErrors)) {
          if (msg && key in data) {
            setError(key as keyof FormValues, { type: "server", message: msg });
          }
        }
      }

      setBanner("error");
      setIsSubmitting(false);
    } catch {
      setBanner("error");
      setIsSubmitting(false);
    }
  };

  const buttonDisabled = isSubmitting || buttonSuccessFlash;
  const buttonLabel = isSubmitting ? "Sending..." : buttonSuccessFlash ? "Message sent ✓" : "Send";

  return (
    <MotionSection className="cc-rule-t-burgundy mt-6 bg-cream px-6 py-16 md:mt-8 md:py-24">
      <div className="cc-outline-hairline mx-auto max-w-3xl px-6 py-10 md:px-10 md:py-12">
        <SectionLabel className="mb-4 text-center">[ Discovery enquiry ]</SectionLabel>
        <h1 className="cc-no-heading-hover mb-4 text-center text-burgundy">
          Ready to give your brand the purposeful and pretty makeover it deserves?
        </h1>
        <p className="cc-copy-muted mx-auto mb-12 max-w-xl text-center">
          Share a bit about you and your business - the more detail, the better we can prepare
          for your enquiry.
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="relative mt-10 border-0 bg-transparent p-0 md:mt-12"
          noValidate
        >
          <div
            className="pointer-events-none absolute -left-[9999px] h-px w-px overflow-hidden opacity-0"
            aria-hidden="true"
          >
            <label htmlFor="contact-trap">Company website</label>
            <input id="contact-trap" tabIndex={-1} autoComplete="off" {...register("trap")} />
          </div>

          <div className="space-y-10 md:space-y-12">
            <div>
              <h2 className="cc-section-label mb-6 text-burgundy/55">Contact</h2>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-10">
                <UnderlineField
                  id="firstName"
                  label="First name"
                  requiredMark
                  error={errors.firstName?.message}
                >
                  <input
                    id="firstName"
                    autoComplete="given-name"
                    className={lineInput}
                    {...register("firstName", { required: "This field is required" })}
                  />
                </UnderlineField>
                <UnderlineField
                  id="lastName"
                  label="Last name"
                  requiredMark
                  error={errors.lastName?.message}
                >
                  <input
                    id="lastName"
                    autoComplete="family-name"
                    className={lineInput}
                    {...register("lastName", { required: "This field is required" })}
                  />
                </UnderlineField>
              </div>
              <div className="mt-8 space-y-8">
                <UnderlineField id="email" label="Email" requiredMark error={errors.email?.message}>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    className={lineInput}
                    {...register("email", {
                      required: "This field is required",
                      pattern: {
                        value: CONTACT_EMAIL_PATTERN,
                        message: "Enter a valid email address",
                      },
                    })}
                  />
                </UnderlineField>
                <UnderlineField id="phone" label="Phone (optional)" error={errors.phone?.message}>
                  <input
                    id="phone"
                    type="tel"
                    autoComplete="tel"
                    className={lineInput}
                    {...register("phone")}
                  />
                </UnderlineField>
              </div>
            </div>

            <div>
              <h2 className="cc-section-label mb-6 text-burgundy/55">Your business</h2>
              <div className="space-y-8">
                <UnderlineField id="businessName" label="Business name">
                  <input id="businessName" className={lineInput} {...register("businessName")} />
                </UnderlineField>
                <UnderlineField
                  id="businessWebsite"
                  label="Business website (if you have one already)"
                >
                  <input
                    id="businessWebsite"
                    type="url"
                    placeholder="https://"
                    className={lineInput}
                    {...register("businessWebsite")}
                  />
                </UnderlineField>
                <UnderlineField
                  id="socialHandle"
                  label="Business social media handle (if you have social media)"
                >
                  <input id="socialHandle" className={lineInput} {...register("socialHandle")} />
                </UnderlineField>
                <UnderlineField id="basedIn" label="Where are you based?">
                  <input id="basedIn" className={lineInput} {...register("basedIn")} />
                </UnderlineField>
                <UnderlineField id="industry" label="What industry is your business in?">
                  <input id="industry" className={lineInput} {...register("industry")} />
                </UnderlineField>
              </div>
            </div>

            <div>
              <h2 className="cc-section-label mb-6 text-burgundy/55">Tell us more</h2>
              <div className="space-y-8">
                <UnderlineField
                  id="aboutBusiness"
                  label="Tell us about your business - what do you do / sell?"
                >
                  <input id="aboutBusiness" className={lineInput} {...register("aboutBusiness")} />
                </UnderlineField>
                <UnderlineField
                  id="servicesInterested"
                  label="Describe which service(s) you're interested in"
                  requiredMark
                  error={errors.servicesInterested?.message}
                >
                  <textarea
                    id="servicesInterested"
                    className={lineTextarea}
                    rows={4}
                    {...register("servicesInterested", { required: "This field is required" })}
                  />
                </UnderlineField>
              </div>
            </div>

            <ChoiceGroup
              legend="Where does your budget roughly fall?"
              name="budget"
              options={BUDGET_OPTIONS}
              register={register}
              required
              error={errors.budget?.message}
            />

            <ChoiceGroup
              legend="What's your timeline?"
              name="timeline"
              options={TIMELINE_OPTIONS}
              register={register}
              required
              error={errors.timeline?.message}
            />

            <div className="space-y-8">
              <UnderlineField id="howHeard" label="How did you hear about us?">
                <input id="howHeard" className={lineInput} {...register("howHeard")} />
              </UnderlineField>
              <UnderlineField
                id="wordOfMouthThanks"
                label="If you found us via word of mouth, who can we thank? 🫶"
              >
                <input id="wordOfMouthThanks" className={lineInput} {...register("wordOfMouthThanks")} />
              </UnderlineField>
              <UnderlineField
                id="additionalQuestions"
                label="Do you have questions or information you would like us to know?"
              >
                <textarea
                  id="additionalQuestions"
                  className={lineTextarea}
                  rows={4}
                  {...register("additionalQuestions")}
                />
              </UnderlineField>
            </div>
          </div>

          <div className="mx-auto max-w-xl pt-2">
            <label className="flex cursor-pointer items-start gap-3 font-body text-[11px] leading-snug text-burgundy/90 sm:text-[12px] sm:leading-relaxed">
              <input
                type="checkbox"
                className="cc-no-lift mt-0.5 h-3.5 w-3.5 shrink-0 rounded-sm border border-burgundy/40 text-burgundy focus:ring-burgundy/30"
                {...register("privacyConsent", {
                  validate: (v) =>
                    v === true || "Please agree to our Privacy Policy to submit this form",
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
            <FieldError message={errors.privacyConsent?.message} />
          </div>

          <div className="mt-12 flex flex-col gap-4 border-t-cc border-solid border-[var(--cc-border)] pt-10">
            <button
              type="submit"
              disabled={buttonDisabled}
              className={ctaButtonClasses({
                variant: buttonSuccessFlash ? "outline" : "burgundy",
                size: "md",
                isSubmit: true,
                className: `px-10 py-3.5 text-xs tracking-[0.08em] self-start ${
                  buttonSuccessFlash ? "!border-burgundy !bg-cream !text-burgundy !shadow-none" : ""
                }`,
              })}
            >
              {buttonLabel}
            </button>

            {banner === "success" ? (
              <p className="cc-copy max-w-xl text-burgundy" role="status">
                Thanks for reaching out - we&apos;ll be in touch within 1 to 2 working days.
              </p>
            ) : null}
            {banner === "error" ? (
              <div className="max-w-xl space-y-2">
                <p className="cc-copy text-rose-800/90" role="alert">
                  Something went wrong - please try again.
                </p>
                <p className="cc-copy-sm text-rose-800/75">
                  If the problem persists please email us directly at{" "}
                  <a href="mailto:hello@collectivstudio.uk" className="underline underline-offset-2">
                    hello@collectivstudio.uk
                  </a>
                  .
                </p>
              </div>
            ) : null}
          </div>
        </form>
      </div>
    </MotionSection>
  );
}
