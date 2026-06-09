"use client";

import { useRef } from "react";
import { useElementParallax } from "../hooks/useElementParallax";

type Props = {
  imageSrc: string;
  parallaxFactor?: number;
};

export function ParallaxInterlude({ imageSrc, parallaxFactor = 0.5 }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const offset = useElementParallax(sectionRef, parallaxFactor, 64);

  return (
    <section ref={sectionRef} className="hw-interlude" aria-hidden>
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
