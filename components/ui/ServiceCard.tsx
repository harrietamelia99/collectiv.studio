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
    <article className="group mx-auto flex h-full min-h-0 w-full max-w-[min(100%,22rem)] flex-col overflow-hidden rounded-none border-cc border-solid border-burgundy/10 bg-cream shadow-soft transition-[transform,box-shadow,border-color] duration-300 ease-smooth hover:-translate-y-1 hover:border-burgundy/25 hover:shadow-lift sm:max-w-none">
      <Link
        href={href}
        className="relative block aspect-[16/10] shrink-0 overflow-hidden rounded-none bg-burgundy/[0.06] sm:aspect-[3/2] lg:aspect-[4/3]"
        aria-label={`${titleLabel} - view service`}
      >
        <Image
          src={imageSrc}
          alt=""
          fill
          className="object-cover transition-transform duration-500 ease-smooth group-hover:scale-[1.06]"
          sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
        />
      </Link>
      <div className="flex min-h-0 flex-1 flex-col items-center px-5 py-5 text-center sm:px-6 sm:py-6 lg:py-7">
        <h3 className="cc-no-heading-hover mb-2 font-medium text-burgundy sm:mb-2.5 md:mb-3">{title}</h3>
        <p className="cc-copy-muted max-w-sm flex-1 leading-snug transition-colors duration-300 group-hover:text-burgundy/85 sm:leading-normal">
          {description}
        </p>
        <Link
          href={href}
          className={`${ctaButtonClasses({ variant: "burgundy", size: "sm" })} mt-4 shrink-0 transition-transform duration-300 ease-smooth group-hover:scale-[1.02] active:scale-[0.99] sm:mt-5`}
        >
          Learn more
        </Link>
      </div>
    </article>
  );
}
