"use client";

import { useMemo, useState } from "react";
import { submitOffboardingReview } from "@/app/portal/actions";
import { PortalFormSubmitButton } from "@/components/portal/PortalFormSubmitButton";
import { PortalFormWithFlash } from "@/components/portal/PortalFormWithFlash";
import {
  formFieldNameForOffboardingQuestion,
  OFFBOARDING_QUESTIONS,
} from "@/lib/portal-offboarding";
import type { PortalFormFlash } from "@/lib/portal-form-flash";

type Props = {
  projectId: string;
  defaultName: string;
};

export function ClientOffboardingForm({ projectId, defaultName }: Props) {
  const [rating, setRating] = useState<number | null>(null);

  const action = useMemo(
    () => async (_prev: PortalFormFlash | null, fd: FormData) => submitOffboardingReview(projectId, fd),
    [projectId],
  );

  return (
    <section
      className="cc-portal-client-shell mt-8"
      aria-labelledby="offboarding-heading"
    >
      <h2 id="offboarding-heading" className="cc-portal-client-shell-title text-lg md:text-xl">
        Project complete — quick wrap-up
      </h2>
      <p className="mt-4 max-w-xl cc-portal-client-description">
        The studio has marked this project as complete. Before you continue in the portal, please leave a rating and
        answer a few short questions. Five-star feedback may be used on our site (we&apos;ll use your &quot;what others
        should know&quot; answer as the public quote if you&apos;re happy with that).
      </p>

      <PortalFormWithFlash action={action} className="mt-8 space-y-6">
        <label className="block max-w-md">
          <span className="mb-1.5 block font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/55">
            Your name
          </span>
          <input
            type="text"
            name="reviewerName"
            defaultValue={defaultName}
            maxLength={200}
            required
            className="cc-portal-client-input px-4 py-2.5"
          />
        </label>

        <fieldset className="min-w-0">
          <legend className="mb-2 font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/55">
            Overall rating <span className="text-burgundy">*</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <label
                key={n}
                className={`cursor-pointer rounded-full border px-3 py-1.5 font-body text-sm transition-colors ${
                  rating === n
                    ? "border-burgundy bg-burgundy text-cream"
                    : "border-burgundy/20 bg-white text-burgundy hover:border-burgundy/40"
                }`}
              >
                <input
                  type="radio"
                  name="rating"
                  value={n}
                  checked={rating === n}
                  onChange={() => setRating(n)}
                  className="sr-only"
                />
                {n}★
              </label>
            ))}
          </div>
        </fieldset>

        {OFFBOARDING_QUESTIONS.map((q) => (
          <label key={q.key} className="block max-w-2xl">
            <span className="mb-1.5 block font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/55">
              {q.prompt}
              {q.required ? <span className="text-burgundy"> *</span> : null}
            </span>
            <textarea
              name={formFieldNameForOffboardingQuestion(q.key)}
              rows={q.multiline ? 5 : 2}
              required={q.required}
              maxLength={q.maxLength}
              className="cc-portal-client-input min-h-[5rem] px-4 py-3"
            />
          </label>
        ))}

        <PortalFormSubmitButton
          idleLabel="Submit and continue"
          pendingLabel="Submitting…"
          successLabel="Thank you — feedback submitted ✓"
          errorFallback="Couldn’t submit feedback. Try again."
          variant="ink"
          size="sm"
          className="px-6"
          disabled={rating === null}
        />
        {rating === null ? (
          <p className="font-body text-xs text-burgundy/55">Choose a star rating to enable submit.</p>
        ) : null}
      </PortalFormWithFlash>
    </section>
  );
}
