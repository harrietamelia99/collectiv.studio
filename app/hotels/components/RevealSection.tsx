"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { globalLenisRef } from "@/lib/global-lenis-ref";

type Props = {
  children: ReactNode;
  className?: string;
};

function isInViewport(el: HTMLElement): boolean {
  const rect = el.getBoundingClientRect();
  const vh = window.innerHeight || document.documentElement.clientHeight;
  return rect.top < vh * 0.92 && rect.bottom > vh * 0.06;
}

export function RevealSection({ children, className = "" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [armed, setArmed] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      setVisible(true);
      return;
    }

    const alreadyVisible = isInViewport(el);
    if (!alreadyVisible) {
      setVisible(false);
    }
    setArmed(true);

    const reveal = () => setVisible(true);

    if (alreadyVisible) return;

    const onScroll = () => {
      if (isInViewport(el)) {
        reveal();
        detach();
      }
    };

    const detach = () => {
      window.removeEventListener("scroll", onScroll);
      globalLenisRef.current?.off("scroll", onScroll);
      observer.disconnect();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    globalLenisRef.current?.on("scroll", onScroll);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          reveal();
          detach();
        }
      },
      { threshold: [0, 0.05, 0.1], rootMargin: "0px 0px 5% 0px" },
    );

    observer.observe(el);

    const fallback = window.setTimeout(() => {
      reveal();
      detach();
    }, 1200);

    return () => {
      window.clearTimeout(fallback);
      detach();
    };
  }, []);

  const classes = [
    "reveal",
    armed ? "reveal--armed" : "",
    visible ? "reveal--visible" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={ref} className={classes}>
      {children}
    </div>
  );
}
