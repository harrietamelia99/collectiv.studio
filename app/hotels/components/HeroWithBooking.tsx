"use client";

import type { ReactNode } from "react";
import type { HotelTheme } from "../data";
import { useParallax } from "../hooks/useParallax";
import { MockBookingPanel } from "./MockBookingPanel";

type Props = {
  theme: HotelTheme;
  imageSrc: string;
  layout: "centered" | "editorial" | "minimal";
  bookingProperty: string;
  bookingFrom: string;
  children: ReactNode;
};

export function HeroWithBooking({
  theme,
  imageSrc,
  layout,
  bookingProperty,
  bookingFrom,
  children,
}: Props) {
  const offset = useParallax(0.4);

  return (
    <section className={`hw-hero hw-hero--${layout}`}>
      {layout === "minimal" ? <div className="hw-hero__grid" aria-hidden /> : null}
      <div
        className="hw-hero__bg"
        style={{
          backgroundImage: `url(${imageSrc})`,
          transform: `translate3d(0, ${offset}px, 0)`,
        }}
      />
      <div className="hw-hero__overlay" />
      <div className="hw-hero__inner">
        <div className="hw-hero__content">{children}</div>
        <MockBookingPanel theme={theme} property={bookingProperty} fromPrice={bookingFrom} />
      </div>
      <div className="hw-hero__scroll" aria-hidden />
    </section>
  );
}
