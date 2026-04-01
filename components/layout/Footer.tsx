import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/ui/Logo";
import { InstagramIcon, LinkedInIcon } from "@/components/ui/SocialIcons";
import { siteInstagramHref } from "@/lib/site";

const LINKEDIN_URL = "https://www.linkedin.com/company/collectivstudio";

const linkClass =
  "font-display text-[15px] font-normal tracking-[-0.01em] text-cream no-underline transition-opacity hover:opacity-80";

function Column({
  title,
  children,
  className = "",
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex min-w-[9.5rem] flex-col gap-3.5 ${className}`.trim()}>
      <p className="font-body text-[10px] font-normal uppercase tracking-[0.14em] text-cream/45">
        {title}
      </p>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}

function FooterLink({
  href,
  children,
  external,
}: {
  href: string;
  children: ReactNode;
  external?: boolean;
}) {
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={linkClass}>
      {children}
    </Link>
  );
}

function FooterSocialInline({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center gap-2.5 font-display text-[15px] tracking-[-0.01em] text-cream no-underline transition-opacity hover:opacity-85"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-cream/25 bg-cream/[0.06] text-cream transition-[border-color,background-color] group-hover:border-cream/40 group-hover:bg-cream/[0.12]">
        {icon}
      </span>
      <span className="underline-offset-[5px] group-hover:underline">{label}</span>
    </a>
  );
}

export function Footer() {
  const instagramUrl = siteInstagramHref();
  return (
    <footer className="border-t border-solid border-[var(--cc-hairline-on-burgundy)] bg-burgundy text-cream">
      <div className="mx-auto max-w-[min(100%,1440px)] px-6 py-16 md:px-10 md:py-20 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,24rem)_1fr] lg:items-start lg:gap-x-0 xl:gap-x-8">
          <div className="max-w-md">
            <Logo variant="footer" light />
            <p className="mt-6 max-w-sm font-display text-base font-normal leading-[1.7] tracking-[-0.02em] text-cream/90">
              Bristol-based marketing specialists creating timeless, thoughtful design that enhances
              your online presence.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
              <FooterSocialInline
                href={instagramUrl}
                label="Instagram"
                icon={<InstagramIcon className="h-[18px] w-[18px]" />}
              />
              <FooterSocialInline
                href={LINKEDIN_URL}
                label="LinkedIn"
                icon={<LinkedInIcon className="h-[17px] w-[17px]" />}
              />
            </div>
          </div>

          <div className="border-t border-solid border-[var(--cc-hairline-on-burgundy)] pt-10 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0 xl:pl-14">
            <div className="flex flex-col gap-10 sm:flex-row sm:flex-wrap sm:items-start sm:gap-x-0 sm:gap-y-10 lg:justify-end">
              <Column title="Explore" className="sm:pr-8 md:pr-10 lg:pr-12">
                <FooterLink href="/">Home</FooterLink>
                <FooterLink href="/portfolio">Portfolio</FooterLink>
                <FooterLink href="/about">About</FooterLink>
                <FooterLink href="/contactus">Contact</FooterLink>
              </Column>
              <Column
                title="Services"
                className="border-t border-solid border-[var(--cc-hairline-on-burgundy)] pt-10 sm:border-l sm:border-t-0 sm:pl-8 sm:pt-0 md:pl-10 lg:pl-12"
              >
                <FooterLink href="/packages/websitedesign">Website design</FooterLink>
                <FooterLink href="/branding">Branding</FooterLink>
                <FooterLink href="/social-media-management">Social media</FooterLink>
                <FooterLink href="/signage-print">Signage &amp; print</FooterLink>
                <FooterLink href="/the-pre-launch-suite">Pre-launch suite</FooterLink>
              </Column>
              <Column
                title="Connect"
                className="border-t border-solid border-[var(--cc-hairline-on-burgundy)] pt-10 sm:border-l sm:border-t-0 sm:pl-8 sm:pt-0 md:pl-10 lg:pl-12"
              >
                <FooterLink href="mailto:hello@collectivstudio.uk">hello@collectivstudio.uk</FooterLink>
                <p className="font-display text-[15px] font-normal tracking-[-0.01em] text-cream/80">
                  Bristol, UK
                </p>
                <FooterLink href="/portal/login">Client portal</FooterLink>
              </Column>
              <Column
                title="Policies"
                className="border-t border-solid border-[var(--cc-hairline-on-burgundy)] pt-10 sm:border-l sm:border-t-0 sm:pl-8 sm:pt-0 md:pl-10 lg:pl-12"
              >
                <FooterLink href="/privacy-policy">Privacy policy</FooterLink>
                <FooterLink href="/cookies-policy">Cookies policy</FooterLink>
              </Column>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-solid border-[var(--cc-hairline-on-burgundy)] px-6 py-6 md:px-10 md:py-7">
        <p className="mx-auto max-w-[min(100%,42rem)] text-center font-body text-[10px] font-normal leading-relaxed tracking-[0.04em] text-cream/45 md:text-[11px] md:leading-relaxed">
          This site uses essential cookies only to keep you logged in to your portal. No tracking or marketing
          cookies are used.
        </p>
        <p className="mx-auto mt-4 max-w-[min(100%,1440px)] text-center font-body text-[10px] font-normal tracking-[0.06em] text-cream/50 md:mt-5 md:text-[11px]">
          © {new Date().getFullYear()} Collectiv. Studio. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
