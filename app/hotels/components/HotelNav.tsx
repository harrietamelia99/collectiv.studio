"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useScrollY } from "../hooks/useScrollY";

type Props = {
  title: string;
  portalHref?: string;
};

export function HotelNav({ title, portalHref = "/hotels" }: Props) {
  const scrollY = useScrollY();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const threshold = Math.min(window.innerHeight * 0.8, 640);
    setVisible(scrollY > threshold);
  }, [scrollY]);

  return (
    <nav className={`hw-nav ${visible ? "hw-nav--visible" : ""}`} aria-label="Experience navigation">
      <span className="hw-nav__title">{title}</span>
      <Link href={portalHref} className="hw-nav__back">
        ← All Experiences
      </Link>
    </nav>
  );
}
