import Image from "next/image";

/** Matches `/videos/hero-background.mp4` first frame — local file for fast mobile LCP. */
export const HERO_STILL_SRC = "/images/hero-bg.jpg";

/**
 * Hero backdrop: prioritized still image on mobile (LCP); video from `lg` when motion is allowed.
 * Gradient overlay stays above media.
 */
export function HomeHeroBackground() {
  return (
    <div
      className="cc-hero-video-wrap pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      <Image
        src={HERO_STILL_SRC}
        alt=""
        width={1920}
        height={1080}
        priority
        fetchPriority="high"
        sizes="100vw"
        className="cc-hero-poster-still lg:hidden motion-reduce:lg:block"
      />
      <video
        className="cc-hero-bg-video hidden lg:block motion-reduce:lg:hidden"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster={HERO_STILL_SRC}
      >
        {/* Avoid downloading ~1MB MP4 on narrow viewports (mobile LCP). */}
        <source
          src="/videos/hero-background.mp4"
          type="video/mp4"
          media="(min-width: 1024px) and (prefers-reduced-motion: no-preference)"
        />
      </video>
      <div
        className="absolute inset-0 z-[1] bg-gradient-to-b from-burgundy/70 via-burgundy/55 to-burgundy/58"
        aria-hidden
      />
    </div>
  );
}
