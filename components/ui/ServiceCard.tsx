import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ctaButtonClasses } from "@/components/ui/Button";

type Props = {
  title: ReactNode;
  description: string;
  imageSrc: string;
  href: string;
};

export function ServiceCard({ title, description, imageSrc, href }: Props) {
  const titleLabel = typeof title === "string" ? title : "Service";
  return (
    <Link
      href={href}
      aria-label={`View ${titleLabel} — ${description}`}
      className="group mx-auto flex h-full min-h-0 w-full max-w-[min(100%,22rem)] flex-col overflow-hidden rounded-none border-cc border-solid border-burgundy/10 bg-cream shadow-soft outline-none ring-0 ring-burgundy/0 transition-[transform,box-shadow,border-color,ring] duration-300 ease-smooth hover:-translate-y-1.5 hover:border-burgundy/28 hover:shadow-lift hover:ring-2 hover:ring-burgundy/[0.12] focus-visible:ring-2 focus-visible:ring-burgundy/35 sm:max-w-none"
    >
      <div className="relative block aspect-[16/10] shrink-0 overflow-hidden rounded-none bg-burgundy/[0.06] sm:aspect-[3/2] lg:aspect-[4/3]">
        <Image
          src={imageSrc}
          alt=""
          fill
          className="object-cover transition-[transform,filter] duration-500 ease-smooth group-hover:scale-[1.07] group-hover:brightness-[1.04]"
          sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
        />
      </div>
      <div className="flex min-h-0 flex-1 flex-col items-center px-5 py-5 text-center sm:px-6 sm:py-6 lg:py-7">
        <h3 className="cc-no-heading-hover mb-2 font-medium text-burgundy transition-colors duration-300 group-hover:text-burgundy sm:mb-2.5 md:mb-3">
          {title}
        </h3>
        <p className="cc-copy-muted max-w-sm flex-1 leading-snug transition-colors duration-300 group-hover:text-burgundy/88 sm:leading-normal">
          {description}
        </p>
        <span
          className={`${ctaButtonClasses({ variant: "burgundy", size: "sm" })} mt-4 shrink-0 transition-transform duration-300 ease-smooth group-hover:scale-[1.03] active:scale-[0.99] sm:mt-5`}
        >
          Learn more
        </span>
      </div>
    </Link>
  );
}
