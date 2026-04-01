import type { Metadata } from "next";
import Link from "next/link";
import { MotionSection } from "@/components/ui/SectionReveal";
import { marketingMetadata } from "@/lib/marketing-seo";

export const metadata: Metadata = {
  ...marketingMetadata({
    title: "Privacy Policy - Collectiv. Studio",
    description:
      "How Collectiv. Studio collects, uses and stores personal data for website enquiries and the client portal, in line with UK GDPR.",
    path: "/privacy-policy",
  }),
  robots: { index: false, follow: true },
};

const prose =
  "space-y-6 font-body text-[13px] leading-relaxed text-burgundy/95 sm:text-[14px] sm:leading-[1.65]";
const h2 = "cc-no-heading-hover mt-12 scroll-mt-28 text-xl text-burgundy first:mt-0 sm:text-2xl";
const ul = "list-disc space-y-2 pl-5 marker:text-burgundy/50";
const a =
  "font-medium text-burgundy underline decoration-burgundy/30 underline-offset-2 transition-colors hover:decoration-burgundy";

export default function PrivacyPolicyPage() {
  return (
    <MotionSection className="cc-rule-t-burgundy mt-6 bg-cream px-6 py-16 md:mt-8 md:py-24">
      <div className="cc-outline-hairline mx-auto max-w-2xl px-6 py-10 md:px-10 md:py-12">
        <p className="font-body text-[10px] uppercase tracking-[0.14em] text-burgundy/50">
          Last updated: April 2026
        </p>
        <h1 className="cc-no-heading-hover mt-3 text-burgundy">Privacy policy</h1>
        <p className={`${prose} mt-6 text-burgundy/85`}>
          This policy explains how <strong className="font-medium text-burgundy">Collectiv. Studio</strong>{" "}
          (&quot;we&quot;, &quot;us&quot;) collects and uses personal information when you use{" "}
          <strong className="font-medium text-burgundy">collectivstudio.uk</strong> and our client portal. We
          process data in the United Kingdom in line with the UK GDPR and the Data Protection Act 2018.
        </p>

        <div className={`${prose} mt-10 md:mt-14`}>
          <h2 className={h2}>Who we are</h2>
          <p>
            <strong className="font-medium text-burgundy">Business name:</strong> Collectiv. Studio
            <br />
            <strong className="font-medium text-burgundy">Trading name:</strong> Collectiv. Studio
            <br />
            <strong className="font-medium text-burgundy">Location:</strong> Bristol, UK
            <br />
            <strong className="font-medium text-burgundy">Website:</strong>{" "}
            <a className={a} href="https://www.collectivstudio.uk">
              collectivstudio.uk
            </a>
            <br />
            <strong className="font-medium text-burgundy">Contact:</strong>{" "}
            <a className={a} href="mailto:isabella@collectivstudio.uk">
              isabella@collectivstudio.uk
            </a>
            <br />
            <strong className="font-medium text-burgundy">Data controller:</strong> Harriet Pearce
          </p>
          <p>
            For data protection questions, contact us at{" "}
            <a className={a} href="mailto:isabella@collectivstudio.uk">
              isabella@collectivstudio.uk
            </a>
            .
          </p>

          <h2 className={h2}>What data we collect</h2>
          <ul className={ul}>
            <li>
              <strong className="font-medium text-burgundy">Contact forms:</strong> name, email address, phone
              number (if you provide it), company or business name (if you provide it), and the content of your
              message.
            </li>
            <li>
              <strong className="font-medium text-burgundy">Client portal:</strong> account details including name,
              email address, and a secure password hash (we never store your password in plain text).
            </li>
            <li>
              <strong className="font-medium text-burgundy">Project work:</strong> files and content you upload for
              your project (for example brand assets, copy, images, and other documents).
            </li>
            <li>
              <strong className="font-medium text-burgundy">Payments:</strong> we do not store card details on our
              systems. Payments are handled manually today; we may use Stripe or similar in future and will update
              this policy if that changes.
            </li>
            <li>
              <strong className="font-medium text-burgundy">Technical data:</strong> IP addresses when you submit
              website contact forms, used for spam prevention and rate limiting. See our{" "}
              <Link className={a} href="/cookies-policy">
                Cookies policy
              </Link>{" "}
              for information on cookies and similar technologies.
            </li>
          </ul>

          <h2 className={h2}>How we use your data</h2>
          <ul className={ul}>
            <li>To respond to enquiries sent through our website.</li>
            <li>To provide and manage the client portal and deliver our services under contract.</li>
            <li>To send project-related notifications and updates (for example comments, approvals, or file activity).</li>
            <li>
              To send service emails that relate to your work with us (for example contracts, quotes, deposit
              confirmations, and similar operational messages).
            </li>
          </ul>
          <p>
            We <strong className="font-medium text-burgundy">do not</strong> sell your personal data. We{" "}
            <strong className="font-medium text-burgundy">do not</strong> use your data for general marketing
            communications unless you have clearly agreed (for example by signing up to a specific mailing list).
          </p>

          <h2 className={h2}>Legal basis for processing (UK GDPR Article 6)</h2>
          <ul className={ul}>
            <li>
              <strong className="font-medium text-burgundy">Contract</strong> — where processing is needed to deliver
              services to clients, run the portal, and send emails that are part of that relationship.
            </li>
            <li>
              <strong className="font-medium text-burgundy">Legitimate interests</strong> — for example spam
              prevention, security, improving our services, and responding to enquiries where this is balanced
              against your rights.
            </li>
            <li>
              <strong className="font-medium text-burgundy">Consent</strong> — where we rely on consent (for example
              optional marketing), you can withdraw it at any time by contacting us.
            </li>
          </ul>

          <h2 className={h2}>How long we keep data</h2>
          <ul className={ul}>
            <li>
              <strong className="font-medium text-burgundy">Website enquiries:</strong> up to{" "}
              <strong className="font-medium text-burgundy">2 years</strong> from submission, unless we need to keep
              them longer for an ongoing discussion or legal reason.
            </li>
            <li>
              <strong className="font-medium text-burgundy">Client accounts and project context:</strong> for the{" "}
              <strong className="font-medium text-burgundy">length of the contract plus 2 years</strong>, unless a
              longer period is required by law or dispute.
            </li>
            <li>
              <strong className="font-medium text-burgundy">Project files:</strong> for the{" "}
              <strong className="font-medium text-burgundy">length of the contract plus 1 year</strong>, unless we
              agree otherwise or law requires longer retention.
            </li>
            <li>
              <strong className="font-medium text-burgundy">Financial records:</strong> up to{" "}
              <strong className="font-medium text-burgundy">7 years</strong> where required for UK tax and accounting
              (HMRC).
            </li>
          </ul>
          <p>After these periods we delete or anonymise data where we no longer have a lawful reason to keep it.</p>

          <h2 className={h2}>Who we share data with (processors)</h2>
          <p>We use carefully chosen providers to run our website and portal. They process data only on our instructions.</p>
          <ul className={ul}>
            <li>
              <strong className="font-medium text-burgundy">Vercel</strong> — website and application hosting. Data
              may be processed in the EU and the US with appropriate safeguards.
            </li>
            <li>
              <strong className="font-medium text-burgundy">Supabase</strong> — database hosting. Servers are in the
              EU.
            </li>
            <li>
              <strong className="font-medium text-burgundy">UploadThing</strong> — file storage for uploads (for example
              portal assets). Data may be processed in the US under standard contractual clauses or equivalent
              mechanisms.
            </li>
            <li>
              <strong className="font-medium text-burgundy">Resend</strong> — transactional email. Data may be
              processed in the US under standard contractual clauses or equivalent mechanisms.
            </li>
            <li>
              <strong className="font-medium text-burgundy">GitHub</strong> — source code repository. We do not store
              client personal data or project content in the repository as part of normal operation.
            </li>
          </ul>
          <p>
            We do not allow these providers to use your data for their own marketing. Their privacy notices describe
            their processing in more detail.
          </p>

          <h2 className={h2}>International transfers</h2>
          <p>
            Some providers above may process data outside the UK. Where that happens, we rely on appropriate
            safeguards recognised under UK law (such as the UK extension to the EU-US Data Privacy Framework where
            applicable, standard contractual clauses, or other approved mechanisms).
          </p>

          <h2 className={h2}>Your rights</h2>
          <p>Under UK GDPR you have the right to:</p>
          <ul className={ul}>
            <li>
              <strong className="font-medium text-burgundy">Access</strong> — ask what personal data we hold about you.
            </li>
            <li>
              <strong className="font-medium text-burgundy">Rectification</strong> — ask us to correct inaccurate data.
            </li>
            <li>
              <strong className="font-medium text-burgundy">Erasure</strong> — ask us to delete your data in certain
              circumstances.
            </li>
            <li>
              <strong className="font-medium text-burgundy">Restriction</strong> — ask us to limit processing in
              certain circumstances.
            </li>
            <li>
              <strong className="font-medium text-burgundy">Data portability</strong> — receive some data in a
              structured, machine-readable format where applicable.
            </li>
            <li>
              <strong className="font-medium text-burgundy">Object</strong> — object to processing based on legitimate
              interests, including profiling in some cases.
            </li>
          </ul>
          <p>
            To exercise any of these rights, email{" "}
            <a className={a} href="mailto:isabella@collectivstudio.uk">
              isabella@collectivstudio.uk
            </a>
            . We will respond within one month in most cases (we may extend in complex cases as the law allows).
          </p>
          <p>
            You also have the right to complain to the{" "}
            <a className={a} href="https://ico.org.uk" target="_blank" rel="noopener noreferrer">
              Information Commissioner&apos;s Office (ICO)
            </a>{" "}
            — the UK supervisory authority for data protection (
            <a className={a} href="https://ico.org.uk" target="_blank" rel="noopener noreferrer">
              ico.org.uk
            </a>
            ).
          </p>

          <h2 className={h2}>Security</h2>
          <p>
            We use technical and organisational measures appropriate to the nature of the data we hold, including
            secure hosting, access controls, and encrypted connections. No method of transmission over the internet is
            completely secure; we work to reduce risk in line with industry practice.
          </p>

          <h2 className={h2}>Changes to this policy</h2>
          <p>
            We may update this policy from time to time. The &quot;Last updated&quot; date at the top will change when
            we do. For significant changes we will take reasonable steps to inform you where appropriate.
          </p>

          <p className="pt-4 text-burgundy/75">
            Questions?{" "}
            <a className={a} href="mailto:isabella@collectivstudio.uk">
              isabella@collectivstudio.uk
            </a>
          </p>
        </div>
      </div>
    </MotionSection>
  );
}
