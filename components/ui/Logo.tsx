import Image from "next/image";
import Link from "next/link";

type Props = {
  variant?: "nav" | "footer" | "mobile";
  className?: string;
  /** e.g. close mobile drawer when the home link is used */
  onNavigate?: () => void;
  /** Invert wordmark for dark backgrounds (floating nav over hero). */
  light?: boolean;
};

const sizes = {
  nav: "h-8 w-auto max-h-9 md:h-9",
  mobile: "h-9 w-auto max-h-10",
  footer: "h-[clamp(1.75rem,4.5vw,2.5rem)] w-auto md:h-10",
};

const maxWidths: Record<NonNullable<Props["variant"]>, string> = {
  nav: "max-w-[min(100%,220px)] md:max-w-[260px]",
  mobile: "max-w-[min(100vw-4rem,280px)]",
  footer: "max-w-full sm:max-w-[min(100%,320px)]",
};

/** Intrinsic size hints - keep modest so layout stays sane if utility CSS fails to load. */
const imgDims: Record<NonNullable<Props["variant"]>, { w: number; h: number }> = {
  nav: { w: 220, h: 44 },
  mobile: { w: 260, h: 52 },
  footer: { w: 300, h: 60 },
};

/** Brand wordmark (`public/images/logo-wordmark.svg`, ~5:1 viewBox). */
export function Logo({ variant = "nav", className = "", onNavigate, light }: Props) {
  const sizeClass = sizes[variant];
  const maxW = maxWidths[variant];
  const { w: imgW, h: imgH } = imgDims[variant];

  return (
    <Link
      href="/"
      onClick={onNavigate}
      className={`inline-flex shrink-0 items-center ${variant === "nav" ? "translate-y-[3px]" : ""} ${className}`.trim()}
    >
      <Image
        src="/images/logo-wordmark.svg"
        alt="Collectiv. Studio"
        width={imgW}
        height={imgH}
        priority={variant === "nav"}
        className={`${sizeClass} ${maxW} object-contain object-left ${light ? "brightness-0 invert" : ""}`}
      />
    </Link>
  );
}
