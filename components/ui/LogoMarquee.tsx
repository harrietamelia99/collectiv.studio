import Image from "next/image";
import { IMAGE_BLUR_DATA_URL } from "@/lib/blur-placeholder";

const MARQUEE_LOGOS = [
  { src: "/images/logos/marquee/malow-london.png", alt: "Malow London" },
  { src: "/images/logos/marquee/core-focus.png", alt: "Core Focus Pilates" },
  { src: "/images/logos/marquee/gasworld.png", alt: "GasWorld" },
  { src: "/images/logos/marquee/prosite-uk.png", alt: "Prosite UK" },
  { src: "/images/logos/marquee/twinn.png", alt: "Twinn" },
  { src: "/images/logos/marquee/choc-nibbles.png", alt: "Choc Nibbles" },
  { src: "/images/logos/marquee/petite-social-club.png", alt: "Petite Social Club" },
  { src: "/images/logos/marquee/peaches-nutrition.png", alt: "Peaches Nutrition" },
  { src: "/images/logos/marquee/powerhouse.png", alt: "Powerhouse" },
  { src: "/images/logos/marquee/love-my-tan.png", alt: "Love My Tan" },
  { src: "/images/logos/marquee/ropergate-dental.png", alt: "Ropergate Dental Care & Implant Studio" },
  { src: "/images/logos/marquee/carter.png", alt: "Carter" },
  { src: "/images/logos/marquee/o-beach-ibiza.png", alt: "O Beach Ibiza" },
  { src: "/images/logos/marquee/byh.png", alt: "BYH" },
  { src: "/images/logos/marquee/isimi.png", alt: "Isimi" },
] as const;

function LogoSet() {
  return (
    <div className="logo-marquee__set">
      {MARQUEE_LOGOS.map(({ src, alt }) => (
        <div
          key={src}
          className="logo-marquee__logo relative h-[clamp(52px,6.25vw,92px)] w-[clamp(72px,14vw,160px)] shrink-0"
        >
          <Image
            src={src}
            alt={alt}
            fill
            sizes="160px"
            className="object-contain object-center"
            loading="lazy"
            placeholder="blur"
            blurDataURL={IMAGE_BLUR_DATA_URL}
          />
        </div>
      ))}
    </div>
  );
}

export function LogoMarquee() {
  return (
    <div className="logo-marquee" role="region" aria-label="Client logos">
      <div className="logo-marquee__track">
        <LogoSet />
        <LogoSet />
      </div>
    </div>
  );
}
