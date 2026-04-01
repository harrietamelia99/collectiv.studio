import { ServicePageRelatedLinks } from "@/components/marketing/ServicePageRelatedLinks";
import {
  preLaunchSuiteBlocks,
  preLaunchSuiteParagraphs,
} from "@/lib/pre-launch-suite";
import { preLaunchSuiteWhatToExpect } from "@/lib/service-what-to-expect";
import { PreLaunchSuiteCtaSection } from "@/components/services/PreLaunchSuiteCtaSection";
import { PreLaunchSuiteFlowSection } from "@/components/services/PreLaunchSuiteFlowSection";
import { ServicePackagePageLayout } from "@/components/services/ServicePackagePageLayout";

export function PreLaunchSuitePageContent() {
  return (
    <>
      <ServicePackagePageLayout
        heroEyebrow="[ The Pre-Launch Suite ]"
        packagesSectionEyebrow="[ Pre-launch ]"
        packagesSectionTitle={<>The suite, in full</>}
        packagesSectionSubtitle="Everything in your launch foundation — expand for timelines, inclusions, and common questions."
        packagesBandClassName="!pb-14 sm:!pb-16 md:!pb-16 lg:!pb-[5.25rem]"
        packagesBandVideoBackdrop
        heroClassName="!py-12 sm:!py-14 md:!py-[clamp(3rem,7vh,4.5rem)] lg:!min-h-[min(48vh,520px)] lg:!py-[clamp(4rem,9.5vh,6rem)]"
        afterHero={<PreLaunchSuiteFlowSection />}
        bottomCta={false}
        whatToExpect={preLaunchSuiteWhatToExpect}
        heroTitle={
          <>
            We design <em className="font-normal italic">strategically built</em> launch foundations
            for brands ready to <em className="font-normal italic">flourish</em> from the very
            beginning.
          </>
        }
        packages={[
          {
            id: "pre-launch-suite",
            index: "01",
            name: "The Pre-Launch Suite",
            timeline: "4–6 weeks",
            hideImage: true,
            body: (
              <>
                {preLaunchSuiteParagraphs.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </>
            ),
            blocks: preLaunchSuiteBlocks,
          },
        ]}
      />
      <ServicePageRelatedLinks omit="prelaunch" />
      <PreLaunchSuiteCtaSection />
    </>
  );
}
