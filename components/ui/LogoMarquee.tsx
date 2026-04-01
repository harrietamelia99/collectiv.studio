/**
 * Client logos strip — uses native <img> so JPEGs are not mis-served as PNG (files were .png extension with JPEG data,
 * which broke decoding and showed grey boxes). Paths use .jpg; animation stays on the track (GPU transform only).
 */
const MARQUEE_LOGOS = [
  { src: "/images/logos/marquee/malow-london.jpg", alt: "Malow London" },
  { src: "/images/logos/marquee/core-focus.jpg", alt: "Core Focus Pilates" },
  { src: "/images/logos/marquee/gasworld.jpg", alt: "GasWorld" },
  { src: "/images/logos/marquee/prosite-uk.jpg", alt: "Prosite UK" },
  { src: "/images/logos/marquee/twinn.jpg", alt: "Twinn" },
  { src: "/images/logos/marquee/choc-nibbles.jpg", alt: "Choc Nibbles" },
  { src: "/images/logos/marquee/petite-social-club.jpg", alt: "Petite Social Club" },
  { src: "/images/logos/marquee/peaches-nutrition.jpg", alt: "Peaches Nutrition" },
  { src: "/images/logos/marquee/powerhouse.jpg", alt: "Powerhouse" },
  { src: "/images/logos/marquee/love-my-tan.jpg", alt: "Love My Tan" },
  { src: "/images/logos/marquee/ropergate-dental.jpg", alt: "Ropergate Dental Care & Implant Studio" },
  { src: "/images/logos/marquee/carter.jpg", alt: "Carter" },
  { src: "/images/logos/marquee/o-beach-ibiza.jpg", alt: "O Beach Ibiza" },
  { src: "/images/logos/marquee/byh.jpg", alt: "BYH" },
  { src: "/images/logos/marquee/isimi.jpg", alt: "Isimi" },
] as const;

function LogoSet() {
  return (
    <div className="logo-marquee__set">
      {MARQUEE_LOGOS.map(({ src, alt }) => (
        <img
          key={src}
          src={src}
          alt={alt}
          width={320}
          height={180}
          loading="lazy"
          decoding="async"
        />
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
