import type { Metadata } from "next";
import Link from "next/link";
import { MotionSection } from "@/components/ui/SectionReveal";

export const metadata: Metadata = {
  title: "Cookies Policy - Collectiv. Studio",
  description:
    "How Collectiv. Studio uses cookies on collectivstudio.uk and the client portal, in line with UK PECR and UK GDPR.",
  robots: { index: false, follow: true },
};

const prose =
  "space-y-6 font-body text-[13px] leading-relaxed text-burgundy/95 sm:text-[14px] sm:leading-[1.65]";
const h2 = "cc-no-heading-hover mt-10 scroll-mt-28 text-xl text-burgundy first:mt-0 sm:text-2xl";
const ul = "list-disc space-y-2 pl-5 marker:text-burgundy/50";
const a =
  "font-medium text-burgundy underline decoration-burgundy/30 underline-offset-2 transition-colors hover:decoration-burgundy";

export default function CookiesPolicyPage() {
  return (
    <MotionSection className="cc-rule-t-burgundy mt-6 bg-cream px-6 py-16 md:mt-8 md:py-24">
      <div className="cc-outline-hairline mx-auto max-w-2xl px-6 py-10 md:px-10 md:py-12">
        <p className="font-body text-[10px] uppercase tracking-[0.14em] text-burgundy/50">
          Last updated: April 2026
        </p>
        <h1 className="cc-no-heading-hover mt-3 text-burgundy">Cookies policy</h1>
        <p className={`${prose} mt-6 text-burgundy/85`}>
          This policy explains how <strong className="font-medium text-burgundy">Collectiv. Studio</strong> uses
          cookies and similar technologies on <strong className="font-medium text-burgundy">collectivstudio.uk</strong>{" "}
          and our client portal. It is written to help you understand our use of cookies under the Privacy and
          Electronic Communications Regulations (PECR) and UK GDPR transparency requirements.
        </p>

        <div className={`${prose} mt-10 md:mt-14`}>
          <h2 className={h2}>What are cookies?</h2>
          <p>
            Cookies are small text files stored on your device when you visit a website. They are widely used to keep
            sites working, to keep you signed in, and sometimes to measure how a site is used. Similar technologies can
            include local storage used for the same kinds of purpose.
          </p>

          <h2 className={h2}>What we use</h2>
          <p>
            <strong className="font-medium text-burgundy">Strictly necessary cookies</strong>
          </p>
          <ul className={ul}>
            <li>
              We use a session cookie as part of <strong className="font-medium text-burgundy">NextAuth</strong> when
              you log in to the <strong className="font-medium text-burgundy">client portal</strong>. This cookie is
              essential for keeping you logged in securely. Under PECR, strictly necessary cookies do not require
              consent before they are set.
            </li>
          </ul>
          <p>
            <strong className="font-medium text-burgundy">Analytics cookies</strong>
          </p>
          <p>We do <strong className="font-medium text-burgundy">not</strong> currently use analytics cookies.</p>
          <p>
            <strong className="font-medium text-burgundy">Marketing cookies</strong>
          </p>
          <p>We do <strong className="font-medium text-burgundy">not</strong> currently use marketing or advertising cookies.</p>

          <h2 className={h2}>Cookie consent banner</h2>
          <p>
            Because we only use strictly necessary cookies (and no optional analytics or marketing cookies), we do{" "}
            <strong className="font-medium text-burgundy">not</strong> show a full cookie consent banner on the
            marketing site. If we add non-essential cookies in future, we will update this policy and provide a way
            for you to give or refuse consent as required by law.
          </p>

          <h2 className={h2}>Managing cookies in your browser</h2>
          <p>
            You can block or delete cookies through your browser settings. If you block strictly necessary cookies, the
            client portal may not sign you in or may not work correctly.
          </p>

          <h2 className={h2}>More information</h2>
          <p>
            For how we process personal data more broadly, see our{" "}
            <Link className={a} href="/privacy-policy">
              Privacy policy
            </Link>
            . To contact us:{" "}
            <a className={a} href="mailto:isabella@collectivstudio.uk">
              isabella@collectivstudio.uk
            </a>
            .
          </p>
        </div>
      </div>
    </MotionSection>
  );
}
