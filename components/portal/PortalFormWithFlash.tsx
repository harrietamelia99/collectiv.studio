"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { PortalFormFlash } from "@/lib/portal-form-flash";
import { PortalFormFlashContext } from "@/components/portal/PortalFormSubmitButton";

type Props = {
  action: (prev: PortalFormFlash | null, formData: FormData) => Promise<PortalFormFlash>;
  children: ReactNode;
  className?: string;
  encType?: string;
  /** For `button form="…"` when the submit control sits outside this form. */
  id?: string;
  /** Shown when the server returns `{ ok: true }` without a `message`. */
  defaultSuccessMessage?: string;
  /** Called after each completed submission when the server returns a flash. */
  onFlash?: (flash: PortalFormFlash) => void;
};

function PortalFormFlashBanner({
  flash,
  defaultSuccessMessage,
}: {
  flash: PortalFormFlash | null;
  defaultSuccessMessage: string;
}) {
  const { pending } = useFormStatus();
  const [showOk, setShowOk] = useState(false);
  const [okMessage, setOkMessage] = useState("");

  useEffect(() => {
    if (flash?.ok) {
      setOkMessage(flash.message ?? defaultSuccessMessage);
      setShowOk(true);
      const t = setTimeout(() => setShowOk(false), 3000);
      return () => clearTimeout(t);
    }
    setShowOk(false);
  }, [flash, defaultSuccessMessage]);

  const err = flash && !flash.ok && !pending ? flash.error : null;

  return (
    <div aria-live="polite" className="contents">
      {showOk ? (
        <p className="mb-4 rounded-xl border border-burgundy/90 bg-cream px-4 py-3 font-body text-sm leading-relaxed text-burgundy">
          {okMessage}
        </p>
      ) : null}
      {err ? (
        <p className="mb-4 rounded-xl border border-rose-200/90 bg-rose-50/95 px-4 py-3 font-body text-sm leading-relaxed text-rose-800/90">
          {err}
        </p>
      ) : null}
    </div>
  );
}

export function PortalFormWithFlash({
  action,
  children,
  className,
  encType,
  id,
  defaultSuccessMessage = "Saved.",
  onFlash,
}: Props) {
  const [state, formAction] = useFormState(action, null);
  const liveRef = useRef<HTMLDivElement>(null);
  const prevFlashRef = useRef<PortalFormFlash | null>(null);

  useEffect(() => {
    if (state && state !== prevFlashRef.current) {
      prevFlashRef.current = state;
      onFlash?.(state);
    }
  }, [state, onFlash]);

  useEffect(() => {
    if (state?.ok || (state && !state.ok)) {
      liveRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [state]);

  return (
    <PortalFormFlashContext.Provider value={state}>
      <form id={id} action={formAction} className={className} encType={encType}>
        <div ref={liveRef} className="contents">
          <PortalFormFlashBanner flash={state} defaultSuccessMessage={defaultSuccessMessage} />
        </div>
        {children}
      </form>
    </PortalFormFlashContext.Provider>
  );
}
