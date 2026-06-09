"use client";

import type { ReactNode } from "react";
import { useParallax } from "../hooks/useParallax";

type Props = {
  imageSrc: string;
  overlayColor?: string;
  children: ReactNode;
  parallaxFactor?: number;
};

export function ParallaxHero({
  imageSrc,
  overlayColor,
  children,
  parallaxFactor = 0.4,
}: Props) {
  const offset = useParallax(parallaxFactor);

  return (
    <section className="hw-hero">
      <div
        className="hw-hero__bg"
        style={{
          backgroundImage: `url(${imageSrc})`,
          transform: `translate3d(0, ${offset}px, 0)`,
        }}
      />
      <div
        className="hw-hero__overlay"
        style={overlayColor ? { background: overlayColor } : undefined}
      />
      <div className="hw-hero__content">{children}</div>
      <div className="hw-hero__scroll" aria-hidden />
    </section>
  );
}
