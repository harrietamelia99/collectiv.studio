import { MotionSection } from "@/components/ui/SectionReveal";

export default function PrivacyPolicyPage() {
  return (
    <MotionSection className="cc-rule-t-burgundy bg-cream px-6 py-16 md:py-24">
      <div className="cc-outline-hairline mx-auto max-w-2xl px-8 py-10 md:px-10 md:py-12">
        <h1 className="cc-no-heading-hover mb-8 text-burgundy">Privacy policy</h1>
        <p className="font-body text-burgundy">
          This policy will be updated to reflect how Collectiv. Studio collects,
          uses and stores personal data submitted through this website. For
          enquiries, please contact us via the contact page.
        </p>
      </div>
    </MotionSection>
  );
}
