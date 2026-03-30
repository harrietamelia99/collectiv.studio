"use client";

import { useFormState } from "react-dom";
import { useEffect, useRef, type ReactNode } from "react";
import type { PortalFormFlash } from "@/lib/portal-form-flash";

type Props = {
  action: (prev: PortalFormFlash | null, formData: FormData) => Promise<PortalFormFlash>;
  children: ReactNode;
  className?: string;
  /** For `button form="…"` when the submit control sits outside this form. */
  id?: string;
  /** Shown when the server returns `{ ok: true }` without a `message`. */
  defaultSuccessMessage?: string;
};

export function PortalFormWithFlash({
  action,
  children,
  className,
  id,
  defaultSuccessMessage = "Saved.",
}: Props) {
  const [state, formAction] = useFormState(action, null);
  const liveRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state?.ok || (state && !state.ok)) {
      liveRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [state]);

  return (
    <form id={id} action={formAction} className={className}>
      <div ref={liveRef} aria-live="polite" className="contents">
        {state?.ok ? (
          <p className="mb-4 rounded-xl border border-emerald-200/90 bg-emerald-50 px-4 py-3 font-body text-sm leading-relaxed text-emerald-950">
            {state.message ?? defaultSuccessMessage}
          </p>
        ) : null}
        {state && !state.ok ? (
          <p className="mb-4 rounded-xl border border-rose-200/90 bg-rose-50 px-4 py-3 font-body text-sm leading-relaxed text-rose-950">
            {state.error}
          </p>
        ) : null}
      </div>
      {children}
    </form>
  );
}
