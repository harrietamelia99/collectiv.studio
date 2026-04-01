import Link from "next/link";

const SERVICE_LINKS: { href: string; label: string; id: string }[] = [
  { href: "/packages/websitedesign", label: "Website design", id: "website" },
  { href: "/branding", label: "Branding", id: "branding" },
  { href: "/signage-print", label: "Signage & print", id: "signage" },
  { href: "/social-media-management", label: "Social media management", id: "social" },
  { href: "/the-pre-launch-suite", label: "The Pre-Launch Suite", id: "prelaunch" },
];

type Props = { /** Service page id to omit from the list */ omit?: string };

export function ServicePageRelatedLinks({ omit }: Props) {
  const links = SERVICE_LINKS.filter((l) => l.id !== omit);
  return (
    <section
      className="border-t border-solid border-burgundy/10 bg-cream px-6 py-14 md:py-16"
      aria-labelledby="related-services-heading"
    >
      <div className="mx-auto max-w-3xl">
        <h2 id="related-services-heading" className="cc-no-heading-hover text-xl text-burgundy md:text-2xl">
          More from the studio
        </h2>
        <p className="cc-copy-muted mt-3 text-burgundy/80">
          Explore related services, see{" "}
          <Link href="/portfolio" className="font-medium text-burgundy underline decoration-burgundy/35 underline-offset-2">
            our portfolio
          </Link>
          , or{" "}
          <Link href="/contactus" className="font-medium text-burgundy underline decoration-burgundy/35 underline-offset-2">
            start a conversation
          </Link>
          .
        </p>
        <ul className="mt-6 flex list-none flex-col gap-2.5 font-body text-sm text-burgundy md:flex-row md:flex-wrap md:gap-x-6 md:gap-y-2">
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="underline decoration-burgundy/30 underline-offset-2 hover:decoration-burgundy">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
