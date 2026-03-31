"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import type { PortalFormFlash } from "@/lib/portal-form-flash";
import { ctaButtonClasses, type CtaSize, type CtaVariant } from "@/components/ui/Button";

/** Set by `PortalFormWithFlash` for submit controls that need the latest server flash. */
export const PortalFormFlashContext = createContext<PortalFormFlash | null>(null);

const invertedSuccessShell =
  "cc-no-lift btn-submit inline-flex items-center justify-center rounded-[var(--cc-pill-radius)] font-body font-normal uppercase transition-[transform,box-shadow,opacity,background-color,border-color] duration-200 ease-smooth border border-burgundy bg-cream text-burgundy shadow-none hover:opacity-95 disabled:pointer-events-none disabled:opacity-45";

const sizeClass: Record<CtaSize, string> = {
  sm: "px-5 py-2.5 text-[11px] tracking-[0.07em] md:text-xs md:tracking-[0.06em]",
  md: "px-8 py-3 text-[10px] tracking-[0.14em] md:text-[11px]",
  lg: "px-9 py-3.5 text-[10px] tracking-[0.08em] md:text-xs",
  hero:
    "min-h-[3rem] min-w-[11.5rem] px-9 py-3.5 text-[10px] font-medium tracking-[0.14em] md:min-h-[3.25rem] md:min-w-[12.5rem] md:px-10 md:py-4 md:text-[11px] md:tracking-[0.15em]",
};

type SubmitButtonProps = {
  idleLabel: string;
  pendingLabel: string;
  successLabel: string;
  /** Shown under the button when the server returns `{ ok: false }`. */
  errorFallback?: string;
  variant?: CtaVariant;
  size?: CtaSize;
  className?: string;
  disabled?: boolean;
  children?: ReactNode;
  /** Fires on click (e.g. close a dialog); does not replace form submit. */
  onClick?: () => void;
};

/**
 * Submit button for forms wrapped in `PortalFormWithFlash`: pending text, brief inverted
 * success styling, and muted error line from the server flash.
 */
export function PortalFormSubmitButton({
  idleLabel,
  pendingLabel,
  successLabel,
  errorFallback = "Something went wrong. Try again.",
  variant = "burgundy",
  size = "sm",
  className = "",
  disabled = false,
  children,
  onClick,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();
  const flash = useContext(PortalFormFlashContext);
  const [showSuccess, setShowSuccess] = useState(false);

  const flashKey = useMemo(() => (flash ? JSON.stringify(flash) : ""), [flash]);

  useEffect(() => {
    if (!flash) return;
    if (flash.ok) {
      setShowSuccess(true);
      const t = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(t);
    }
    setShowSuccess(false);
  }, [flashKey, flash]);

  const err = flash && !flash.ok ? flash.error : null;
  const label = pending ? pendingLabel : showSuccess && flash?.ok ? successLabel : idleLabel;

  const baseClass = ctaButtonClasses({
    variant,
    size,
    isSubmit: true,
    className,
  });

  const successClass = `${invertedSuccessShell} ${sizeClass[size]} ${className}`.trim();

  return (
    <div>
      {children}
      <button
        type="submit"
        disabled={disabled || pending}
        onClick={onClick}
        className={showSuccess && flash?.ok ? successClass : baseClass}
      >
        {label}
      </button>
      {err && !pending ? (
        <p className="mt-2 font-body text-sm leading-relaxed text-rose-800/85">{err}</p>
      ) : null}
    </div>
  );
}

type PendingOnlyProps = {
  idleLabel: string;
  pendingLabel: string;
  variant?: CtaVariant;
  size?: CtaSize;
  className?: string;
  disabled?: boolean;
};

/** For forms that redirect on success (no server flash): only shows a disabled + label swap while pending. */
export function PendingSubmitButton({
  idleLabel,
  pendingLabel,
  variant = "burgundy",
  size = "sm",
  className = "",
  disabled = false,
}: PendingOnlyProps) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className={ctaButtonClasses({
        variant,
        size,
        isSubmit: true,
        className,
      })}
    >
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}
