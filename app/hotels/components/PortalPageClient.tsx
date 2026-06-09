"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { PORTAL_CAPABILITIES } from "../selling-content";
import { PortalCard } from "./PortalCard";

const DESTINATIONS = [
  {
    number: "01",
    title: "Sun, Sea & Stone",
    tagline: "Resort · Direct booking · Coastal",
    backgroundImage:
      "https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?w=1200&q=80",
    href: "/hotels/mediterranean",
  },
  {
    number: "02",
    title: "The Great Escape",
    tagline: "Country house · Weddings · Vouchers",
    backgroundImage:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
    href: "/hotels/cotswolds",
  },
  {
    number: "03",
    title: "The Urban Edit",
    tagline: "City · Members · Mobile-first",
    backgroundImage:
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1200&q=80",
    href: "/hotels/city",
  },
] as const;

export function PortalPageClient() {
  const router = useRouter();
  const [fade, setFade] = useState(false);

  const navigate = useCallback(
    (href: string) => {
      if (fade) return;
      setFade(true);
      window.setTimeout(() => router.push(href), 500);
    },
    [fade, router],
  );

  return (
    <div className="hotel-portal">
      <header className="hotel-portal__header">
        <span className="hotel-portal__brand">COLLECTIV. STUDIO</span>
        <span className="hotel-portal__tagline">Three distinct hotel websites — one studio</span>
        <p className="hotel-portal__intro">
          Explore how we design, integrate and launch hospitality sites that convert. Each demo
          showcases a different property type and the features hotels actually need.
        </p>
      </header>

      {DESTINATIONS.map((d) => (
        <PortalCard key={d.href} {...d} onNavigate={() => navigate(d.href)} />
      ))}

      <footer className="hotel-portal__footer">
        <ul className="hotel-portal__capabilities">
          {PORTAL_CAPABILITIES.map((cap) => (
            <li key={cap}>{cap}</li>
          ))}
        </ul>
        <Link href="/contactus" className="hotel-portal__contact">
          Partner with us
        </Link>
      </footer>

      <div className={`hotel-portal__fade ${fade ? "hotel-portal__fade--active" : ""}`} aria-hidden />
    </div>
  );
}
