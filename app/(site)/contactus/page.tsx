"use client";

import { useEffect } from "react";
import { useForm, type UseFormRegister } from "react-hook-form";
import { HOME_EMAIL_KEY } from "@/components/home/HomeContactForm";
import { FormSubmitButton } from "@/components/ui/Button";
import { MotionSection } from "@/components/ui/SectionReveal";
import { SectionLabel } from "@/components/ui/SectionLabel";

type FormValues = {
  firstName: string;
  lastName: string;
  email: string;
  businessName: string;
  businessWebsite: string;
  socialHandle: string;
  basedIn: string;
  industry: string;
  aboutBusiness: string;
  excitedAbout: string;
  servicesInterested: string;
  budget: string;
  timeline: string;
  howHeard: string;
  wordOfMouthThanks: string;
  additionalQuestions: string;
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

function UnderlineField({
  id,
  label,
  requiredMark,
  children,
}: {
  id: string;
  label: string;
  requiredMark?: boolean;
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
    </div>
  );
}

function ChoiceGroup({
  legend,
  name,
  options,
  register,
  required,
}: {
  legend: string;
  name: keyof FormValues;
  options: readonly string[];
  register: UseFormRegister<FormValues>;
  required?: boolean;
}) {
  return (
    <fieldset className="border-0 p-0 pt-2">
      <legend className="cc-form-label mb-3 block w-full">
        {legend}
        {required ? <span className="text-burgundy/70"> (required)</span> : null}
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <label
            key={opt}
            className="inline-flex cursor-pointer items-center"
          >
            <input
              type="radio"
              value={opt}
              className="peer sr-only"
              {...register(name, { required })}
            />
            <span className="cc-caption rounded-md border border-burgundy/20 bg-transparent px-3 py-2.5 text-burgundy transition-colors peer-checked:border-burgundy peer-checked:bg-burgundy peer-checked:text-cream hover:border-burgundy/40">
              {opt}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

const lineInput =
  "cc-copy w-full border-0 border-b-cc border-solid border-burgundy bg-transparent py-2.5 placeholder:text-burgundy/40 focus:border-burgundy focus:outline-none focus:ring-0";

const lineTextarea =
  "cc-copy w-full min-h-[100px] resize-y border-0 border-b-cc border-solid border-burgundy bg-transparent py-2.5 placeholder:text-burgundy/40 focus:border-burgundy focus:outline-none focus:ring-0";

export default function ContactPage() {
  const { register, handleSubmit, reset, setValue } = useForm<FormValues>();

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

  return (
    <MotionSection className="cc-rule-t-burgundy bg-cream px-6 py-16 md:py-24">
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
          onSubmit={handleSubmit(() => {
            reset();
          })}
          className="mt-10 border-0 bg-transparent p-0 md:mt-12"
        >
          <div className="space-y-10 md:space-y-12">
            <div>
              <h2 className="cc-section-label mb-6 text-burgundy/55">Contact</h2>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-10">
                <UnderlineField id="firstName" label="First name" requiredMark>
                  <input
                    id="firstName"
                    autoComplete="given-name"
                    className={lineInput}
                    {...register("firstName", { required: true })}
                  />
                </UnderlineField>
                <UnderlineField id="lastName" label="Last name" requiredMark>
                  <input
                    id="lastName"
                    autoComplete="family-name"
                    className={lineInput}
                    {...register("lastName", { required: true })}
                  />
                </UnderlineField>
              </div>
              <div className="mt-8">
                <UnderlineField id="email" label="Email" requiredMark>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    className={lineInput}
                    {...register("email", { required: true })}
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
                  id="excitedAbout"
                  label="What makes you excited to work with Collectiv.?"
                >
                  <input id="excitedAbout" className={lineInput} {...register("excitedAbout")} />
                </UnderlineField>
                <UnderlineField
                  id="servicesInterested"
                  label="Describe which service(s) you're interested in"
                  requiredMark
                >
                  <textarea
                    id="servicesInterested"
                    className={lineTextarea}
                    rows={4}
                    {...register("servicesInterested", { required: true })}
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
            />

            <ChoiceGroup
              legend="What's your timeline?"
              name="timeline"
              options={TIMELINE_OPTIONS}
              register={register}
              required
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

          <div className="mt-12 flex justify-start border-t-cc border-solid border-[var(--cc-border)] pt-10">
            <FormSubmitButton className="px-10 py-3.5 text-xs tracking-[0.08em]">
              Send
            </FormSubmitButton>
          </div>
        </form>
      </div>
    </MotionSection>
  );
}
