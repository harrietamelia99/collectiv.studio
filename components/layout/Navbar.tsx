"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { ctaButtonClasses } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { AccountIcon, InstagramIcon } from "@/components/ui/SocialIcons";
import { serviceLinks } from "@/lib/nav-links";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

function NavLink({
  href,
  children,
  active,
}: {
  href: string;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center font-body text-xs font-normal uppercase leading-none tracking-[0.06em] text-burgundy transition-[transform,opacity] duration-200 ease-smooth hover:translate-y-[-2px] hover:opacity-85 ${
        active ? "underline underline-offset-4" : ""
      }`}
    >
      {children}
    </Link>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const { status } = useSession();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLElement>(null);

  /** Logged-out (and while session is loading): send users straight to login. */
  const portalAccountHref = status === "authenticated" ? "/portal" : "/portal/login";

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => {
      panelRef.current?.querySelector<HTMLElement>("a,button")?.focus();
    }, 100);
    return () => window.clearTimeout(t);
  }, [open]);

  const portfolioActive = pathname === "/portfolio" || pathname.startsWith("/portfolio/");
  const aboutActive = pathname === "/about";
  const portalActive = pathname.startsWith("/portal");

  return (
    <>
      {/* z above overlay only when closed so burger works; hidden while drawer open so the pill doesn’t span dimmed page + drawer */}
      <header
        data-lenis-prevent
        className={`cc-site-header pointer-events-none fixed left-0 right-0 top-[14px] z-[10030] lg:top-6 ${
          open ? "cc-header-hidden-when-menu-open max-lg:hidden" : ""
        }`}
      >
        <div className="cc-nav-inner-wrap mx-auto w-[calc(100%-32px)] max-w-3xl lg:w-[85%] lg:max-w-[52rem]">
          <div className="cc-nav-pill pointer-events-auto relative grid min-h-[76px] w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 rounded-[var(--cc-pill-radius)] border border-solid border-burgundy bg-cream/95 px-[18px] py-2 shadow-nav backdrop-blur-md supports-[backdrop-filter]:bg-cream/88 lg:min-h-0 lg:h-[70px] lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-x-6 lg:px-8 lg:py-0 lg:shadow-[var(--cc-pill-shadow)] xl:px-10">
            <div className="min-w-0 justify-self-start pr-1 lg:pr-0">
              <Logo variant="nav" />
            </div>

            {/* Grid center column on lg+ avoids overlap with logo / actions */}
            <nav
              className="cc-desktop-nav hidden items-center gap-[clamp(1rem,2.2vw,1.75rem)] whitespace-nowrap lg:col-start-2 lg:flex lg:justify-self-center lg:gap-[clamp(1.125rem,2.5vw,2rem)]"
              aria-label="Primary"
            >
              <div className="cc-nav-services group relative inline-flex items-center">
                <button
                  type="button"
                  className="inline-flex cursor-pointer items-center border-0 bg-transparent p-0 font-body text-xs font-normal uppercase leading-none tracking-[0.06em] text-burgundy transition-[transform,opacity] duration-200 ease-smooth hover:translate-y-[-2px] hover:opacity-85"
                  aria-haspopup="true"
                >
                  Services
                </button>
                {/* top-full + pt-2 bridges the gap so hover isn’t lost between trigger and panel */}
                <div
                  className="cc-services-dropdown pointer-events-none absolute left-1/2 top-full z-[10050] w-max min-w-[220px] max-w-[280px] -translate-x-1/2 pt-2 opacity-0 transition-opacity duration-200 ease-out group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100"
                  role="presentation"
                >
                  <div
                    className="cc-services-panel rounded-[var(--cc-dd-radius)] border border-burgundy/10 bg-cream/98 px-[22px] py-[18px] shadow-nav backdrop-blur-md"
                    role="menu"
                  >
                    <ul className="flex flex-col gap-3">
                      {serviceLinks.map((s) => (
                        <li key={s.href}>
                          <Link
                            href={s.href}
                            className="block font-body text-xs font-normal uppercase tracking-[0.04em] text-burgundy transition-[transform,opacity] duration-[0.18s] ease-in-out hover:translate-x-2 hover:opacity-85"
                            role="menuitem"
                          >
                            {s.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              <NavLink href="/portfolio" active={portfolioActive}>
                Portfolio
              </NavLink>
              <NavLink href="/about" active={aboutActive}>
                About
              </NavLink>
            </nav>

            <div className="cc-nav-actions flex min-w-0 items-center justify-end gap-4 justify-self-end lg:col-start-3 lg:gap-6 xl:gap-8">
              <a
                href="https://instagram.com/collectiv.studio/"
                target="_blank"
                rel="noopener noreferrer"
                className="cc-desktop-flex hidden text-burgundy transition-[transform,opacity] duration-[0.18s] hover:translate-y-[-3px] hover:opacity-85 lg:flex"
                aria-label="Instagram"
              >
                <InstagramIcon className="h-5 w-5" />
              </a>
              <Link
                href={portalAccountHref}
                prefetch={status !== "loading"}
                className={`cc-desktop-flex hidden text-burgundy transition-[transform,opacity] duration-[0.18s] hover:translate-y-[-3px] hover:opacity-85 lg:flex ${
                  portalActive ? "underline underline-offset-4" : ""
                }`}
                aria-label={status === "authenticated" ? "Client portal" : "Sign in to client portal"}
              >
                <AccountIcon className="h-5 w-5" />
              </Link>
              <Link
                href="/contactus"
                className={`${ctaButtonClasses({
                  variant: "burgundy",
                  size: "sm",
                  className: "cc-desktop-inline-flex hidden px-4 py-2 text-xs tracking-[0.04em] lg:inline-flex",
                })}`}
              >
                Contact us
              </Link>
              <button
                type="button"
                className="cc-no-lift cc-mobile-only flex h-11 w-11 shrink-0 items-center justify-center lg:hidden"
                aria-label={open ? "Close menu" : "Open menu"}
                aria-expanded={open}
                aria-controls="mobile-nav-panel"
                onClick={() => setOpen((v) => !v)}
              >
                <span className="relative block h-[18px] w-5">
                  <span
                    className={`absolute left-0 h-[1.4px] w-5 rounded-full bg-burgundy transition-all duration-[0.18s] ease-in-out ${
                      open ? "top-[9px] rotate-45" : "top-[5px] rotate-0"
                    }`}
                  />
                  <span
                    className={`absolute left-0 top-[13px] h-[1.4px] w-5 rounded-full bg-burgundy transition-all duration-[0.18s] ease-in-out ${
                      open ? "opacity-0" : "opacity-100"
                    }`}
                  />
                  <span
                    className={`absolute left-0 h-[1.4px] w-5 rounded-full bg-burgundy transition-all duration-[0.18s] ease-in-out ${
                      open ? "top-[9px] -rotate-45 opacity-100" : "top-[13px] opacity-100"
                    }`}
                  />
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div
        data-lenis-prevent
        className={`cc-mobile-nav-overlay fixed inset-0 z-[10020] lg:hidden ${
          open ? "pointer-events-auto" : "pointer-events-none"
        }`}
        aria-hidden={!open}
      >
        {/* Dimmed backdrop - tap to close */}
        <button
          type="button"
          aria-label="Close menu"
          tabIndex={open ? 0 : -1}
          className={`cc-drawer-backdrop absolute inset-0 bg-burgundy/25 backdrop-blur-[3px] transition-opacity duration-200 ease-out ${
            open ? "cc-drawer-backdrop--visible opacity-100" : "opacity-0"
          }`}
          onClick={() => setOpen(false)}
        />

        {/* Slide-in panel */}
        <aside
          ref={panelRef}
          id="mobile-nav-panel"
          className={`cc-drawer-panel absolute right-0 top-0 z-10 flex h-[100dvh] w-[min(100%,22rem)] flex-col border-l-cc border-solid border-divider bg-cream shadow-[var(--cc-nav)] transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] sm:w-[min(100%,24rem)] ${
            open ? "cc-drawer-panel--open translate-x-0" : "translate-x-full"
          }`}
          aria-label="Mobile menu"
        >
          <div className="cc-drawer-head flex min-h-[76px] items-center justify-between gap-3 border-b-cc border-solid border-[var(--cc-hairline)] px-5 py-3 pt-[max(0.875rem,env(safe-area-inset-top))]">
            <Logo variant="mobile" onNavigate={() => setOpen(false)} />
            <button
              type="button"
              className="cc-no-lift flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-burgundy/15 text-burgundy transition-colors hover:bg-burgundy/5"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
            >
              <span className="relative block h-4 w-4" aria-hidden>
                <span className="absolute left-1/2 top-1/2 h-[1.5px] w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-full bg-burgundy" />
                <span className="absolute left-1/2 top-1/2 h-[1.5px] w-4 -translate-x-1/2 -translate-y-1/2 -rotate-45 rounded-full bg-burgundy" />
              </span>
            </button>
          </div>

          <nav
            className="cc-drawer-nav flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-5 pb-8 pt-5"
            aria-label="Mobile"
          >
            <p className="cc-m-label font-body text-[10px] font-normal uppercase tracking-[0.18em] text-burgundy/50">
              Services
            </p>
            <ul className="cc-m-list mt-3 flex flex-col gap-0 border-y-cc border-solid border-[var(--cc-hairline)]">
              {serviceLinks.map((s) => (
                <li key={s.href} className="border-b-cc border-solid border-[var(--cc-hairline)] last:border-b-0">
                  <Link
                    href={s.href}
                    onClick={() => setOpen(false)}
                    className="block py-3.5 font-body text-[13px] font-normal uppercase tracking-[0.06em] text-burgundy transition-colors hover:text-burgundy/75"
                  >
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>

            <p className="cc-m-label mt-8 font-body text-[10px] font-normal uppercase tracking-[0.18em] text-burgundy/50">
              Studio
            </p>
            <ul className="cc-m-list mt-3 flex flex-col gap-0 border-y-cc border-solid border-[var(--cc-hairline)]">
              <li className="border-b-cc border-solid border-[var(--cc-hairline)]">
                <Link
                  href="/portfolio"
                  onClick={() => setOpen(false)}
                  className={`block py-3.5 font-body text-[13px] font-normal uppercase tracking-[0.06em] transition-colors hover:text-burgundy/75 ${
                    portfolioActive ? "text-burgundy underline decoration-burgundy underline-offset-[6px]" : "text-burgundy"
                  }`}
                >
                  Portfolio
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  onClick={() => setOpen(false)}
                  className={`block py-3.5 font-body text-[13px] font-normal uppercase tracking-[0.06em] transition-colors hover:text-burgundy/75 ${
                    aboutActive ? "text-burgundy underline decoration-burgundy underline-offset-[6px]" : "text-burgundy"
                  }`}
                >
                  About
                </Link>
              </li>
            </ul>

            <div className="cc-drawer-foot mt-auto flex flex-col gap-4 pt-10">
              <a
                href="https://instagram.com/collectiv.studio/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 font-body text-[12px] font-normal text-burgundy/80 transition-colors hover:text-burgundy"
              >
                <InstagramIcon className="h-[18px] w-[18px]" />
                <span className="uppercase tracking-[0.08em]">Instagram</span>
              </a>
              <Link
                href={portalAccountHref}
                prefetch={status !== "loading"}
                onClick={() => setOpen(false)}
                className={`inline-flex items-center gap-2.5 font-body text-[12px] font-normal transition-colors hover:text-burgundy ${
                  portalActive ? "text-burgundy" : "text-burgundy/80"
                }`}
                aria-label={status === "authenticated" ? "Client portal" : "Sign in to client portal"}
              >
                <AccountIcon className="h-[18px] w-[18px]" />
                <span className="uppercase tracking-[0.08em]">Client portal</span>
              </Link>
              <Link
                href="/contactus"
                onClick={() => setOpen(false)}
                className={`${ctaButtonClasses({ variant: "burgundy", size: "md", className: "w-max tracking-[0.18em]" })}`}
              >
                Contact us
              </Link>
            </div>
          </nav>
        </aside>
      </div>
    </>
  );
}
