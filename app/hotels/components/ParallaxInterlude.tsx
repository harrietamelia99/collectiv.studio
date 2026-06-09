"use client";

import { useParallax } from "../hooks/useParallax";

type Props = {
  imageSrc: string;
  parallaxFactor?: number;
};

export function ParallaxInterlude({ imageSrc, parallaxFactor = 0.5 }: Props) {
  const offset = useParallax(parallaxFactor);

  return (
    <section className="hw-interlude" aria-hidden>
      <div
        className="hw-interlude__bg"
        style={{
          backgroundImage: `url(${imageSrc})`,
          transform: `translate3d(0, ${offset}px, 0)`,
        }}
      />
    </section>
  );
}
