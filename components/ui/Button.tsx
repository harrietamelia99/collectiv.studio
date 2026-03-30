import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Site CTAs: use `cream` on burgundy / dark surfaces, `burgundy` on cream / light.
 * `ink` is an alias for `burgundy` (legacy client-portal name).
 * `outline` is a secondary style (burgundy border, transparent fill) for cream backgrounds only.
 */
export type CtaVariant = "cream" | "burgundy" | "outline" | "ink" | "destructive";
export type CtaSize = "sm" | "md" | "lg" | "hero";

function shell(isSubmit: boolean, lift: boolean) {
  const motion =
    isSubmit ? "cc-no-lift btn-submit" : lift ? "cc-btn-lift" : "cc-no-lift";
  return `${motion} inline-flex items-center justify-center rounded-[var(--cc-pill-radius)] font-body font-normal uppercase transition-[transform,box-shadow,opacity,background-color,border-color] duration-200 ease-smooth`;
}

const sizeClasses: Record<CtaSize, string> = {
  sm: "px-5 py-2.5 text-[11px] tracking-[0.07em] md:text-xs md:tracking-[0.06em]",
  md: "px-8 py-3 text-[10px] tracking-[0.14em] md:text-[11px]",
  lg: "px-9 py-3.5 text-[10px] tracking-[0.08em] md:text-xs",
  hero:
    "min-h-[3rem] min-w-[11.5rem] px-9 py-3.5 text-[10px] font-medium tracking-[0.14em] md:min-h-[3.25rem] md:min-w-[12.5rem] md:px-10 md:py-4 md:text-[11px] md:tracking-[0.15em]",
};

function variantClasses(variant: CtaVariant, size: CtaSize): string {
  if (variant === "destructive") {
    return "border border-rose-200 bg-rose-50 text-rose-900 shadow-none hover:bg-rose-100/90 hover:border-rose-300";
  }
  if (variant === "outline") {
    return "border border-burgundy bg-cream text-burgundy shadow-none hover:bg-burgundy/[0.06] hover:opacity-95";
  }
  /** Alias for burgundy primary (legacy name `ink` — was near-black; now brand burgundy). */
  if (variant === "ink") {
    return "border border-burgundy bg-burgundy text-cream shadow-lift hover:opacity-[0.96]";
  }
  if (variant === "burgundy") {
    return "border border-burgundy bg-burgundy text-cream shadow-lift hover:opacity-[0.96]";
  }
  if (size === "hero") {
    return "border border-cream bg-cream text-burgundy shadow-[0_14px_40px_rgba(0,0,0,0.28)] hover:opacity-[0.96]";
  }
  return "border border-cream bg-cream text-burgundy shadow-[0_10px_28px_rgba(0,0,0,0.2)] hover:opacity-[0.96]";
}

export function ctaButtonClasses({
  variant,
  size = "md",
  isSubmit = false,
  lift = true,
  className = "",
}: {
  variant: CtaVariant;
  size?: CtaSize;
  isSubmit?: boolean;
  /** `false` disables pill lift hover (links that should stay flat). */
  lift?: boolean;
  className?: string;
}): string {
  /** Outline uses the same padding scale as filled CTAs so pairs (e.g. team cards) align. */
  const outlineSize = variant === "outline" ? sizeClasses[size] : null;

  return [
    shell(isSubmit, lift),
    variantClasses(variant, size),
    outlineSize ?? sizeClasses[size],
    "disabled:pointer-events-none disabled:opacity-45 disabled:shadow-none",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

type LinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
  variant?: CtaVariant;
  size?: CtaSize;
  lift?: boolean;
};

export function ButtonLink({
  href,
  children,
  className = "",
  variant = "burgundy",
  size = "md",
  lift = true,
}: LinkProps) {
  return (
    <Link
      href={href}
      className={`${ctaButtonClasses({ variant, size, isSubmit: false, lift })} ${className}`.trim()}
    >
      {children}
    </Link>
  );
}

type SubmitProps = {
  children: ReactNode;
  className?: string;
  size?: CtaSize;
};

/** Burgundy filled submit for forms on cream backgrounds (no lift hover). */
export function FormSubmitButton({ children, className = "", size = "md" }: SubmitProps) {
  return (
    <button
      type="submit"
      className={ctaButtonClasses({ variant: "burgundy", size, isSubmit: true, className })}
    >
      {children}
    </button>
  );
}
