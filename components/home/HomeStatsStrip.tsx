"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type HomeStat = {
  value: string;
  label: string;
};

function parseStatDisplay(value: string) {
  const normalized = value.replace(/,/g, "").trim();
  const m = normalized.match(/^(\d+)(\+)?$/);
  if (!m) {
    return { target: -1, format: () => value };
  }
  const target = Number(m[1]);
  const plus = m[2] ?? "";
  return {
    target,
    format: (n: number) => {
      const clamped = Math.min(Math.max(0, n), target);
      const grouped = target >= 1000;
      const s = grouped ? clamped.toLocaleString("en-GB") : String(clamped);
      return `${s}${plus}`;
    },
  };
}

function CountUpValue({
  value,
  delayMs,
}: {
  value: string;
  delayMs: number;
}) {
  const { target, format } = useMemo(() => parseStatDisplay(value), [value]);
  const [n, setN] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (target < 0) return;

    const start = () => {
      if (target === 0) {
        setN(0);
        return;
      }
      const duration = 1050;
      const t0 = performance.now();
      const tick = (now: number) => {
        const u = Math.min(1, (now - t0) / duration);
        const eased = 1 - (1 - u) ** 2.85;
        setN(Math.round(eased * target));
        if (u < 1) {
          rafRef.current = requestAnimationFrame(tick);
        }
      };
      rafRef.current = requestAnimationFrame(tick);
    };

    const tid = window.setTimeout(start, delayMs);
    return () => {
      clearTimeout(tid);
      cancelAnimationFrame(rafRef.current);
    };
  }, [target, delayMs]);

  const text = target < 0 ? value : format(n);

  return (
    <span className="font-display text-cc-h3 font-normal leading-none tracking-[-0.03em] text-burgundy tabular-nums md:text-cc-h2 lg:text-cc-h1">
      {text}
    </span>
  );
}

type Props = {
  items: readonly HomeStat[];
};

function StatDivider() {
  return (
    <div
      className="mt-1.5 w-full max-w-[6.25rem] md:mt-2 md:max-w-[7rem] lg:max-w-[7.5rem]"
      aria-hidden
    >
      <span className="block h-[var(--cc-stroke)] w-full bg-gradient-to-r from-transparent via-burgundy/38 to-transparent" />
    </div>
  );
}

export function HomeStatsStrip({ items }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      setInView(true);
      return;
    }
    const el = rootRef.current;
    if (!el) return;
    const ob = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) setInView(true);
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );
    ob.observe(el);
    return () => ob.disconnect();
  }, [reduceMotion]);

  const revealed = reduceMotion || inView;

  return (
    <div ref={rootRef} className="cc-container relative mx-auto max-w-6xl">
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[min(100%,280px)] w-[min(92vw,52rem)] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse_55%_70%_at_50%_45%,rgba(37,13,24,0.055),transparent_72%)] md:h-[min(100%,320px)]"
        aria-hidden
      />
      <div className="cc-home-stats-grid relative z-[1] grid grid-cols-1 md:grid-cols-3">
        {items.map((s, i) => (
          <div
            key={s.label}
            className={`flex justify-center transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] md:px-4 md:py-0.5 lg:px-6 ${
              revealed ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
            }`}
            style={reduceMotion ? undefined : { transitionDelay: `${80 + i * 110}ms` }}
          >
            <div className="cc-stat-item relative flex max-w-[14rem] flex-col items-center py-2 text-center md:max-w-none md:py-3 lg:py-4">
              <span className="font-body text-[9px] font-normal tabular-nums tracking-[0.24em] text-burgundy/38 md:text-[9.5px] md:tracking-[0.24em] lg:text-[10px] lg:tracking-[0.26em]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="mt-1 md:mt-1.5">
                <CountUpValue value={s.value} delayMs={i * 90 + 160} />
              </div>
              <StatDivider />
              <span className="cc-caption mt-1.5 max-w-[12rem] leading-snug text-burgundy/65 md:mt-2 md:max-w-[13rem] md:leading-snug lg:mt-2.5 lg:leading-relaxed md:tracking-[0.2em]">
                [ {s.label} ]
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
