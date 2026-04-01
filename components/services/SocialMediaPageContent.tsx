import { ServicePackagePageLayout } from "@/components/services/ServicePackagePageLayout";
import { socialMediaPackages } from "@/lib/social-media-packages";
import { socialMediaWhatToExpect } from "@/lib/service-what-to-expect";

/** Stock set matching the home social / content-day lifestyle grid (marble tech flat lay, collaboration, warm desk scenes). */
const PACKAGE_IMAGES: Record<
  string,
  { imageSrc: string; imageAlt: string; imageObjectPosition?: string }
> = {
  "01": {
    imageSrc: "/images/website-the-signature-site.png",
    imageAlt:
      "Phone and earbuds on cool marble — minimal, on-the-go social and content vibe.",
    imageObjectPosition: "50% 22%",
  },
  "02": {
    imageSrc: "/images/service-social.png",
    imageAlt:
      "Warm desk scene with laptop and coffee — everyday social management mood.",
    imageObjectPosition: "50% 50%",
  },
  "03": {
    imageSrc: "/images/social-the-signature-presence.png",
    imageAlt:
      "Bouclé chair in soft light with a palm-leaf shadow on the wall — refined, editorial interior mood.",
    imageObjectPosition: "50% 50%",
  },
  "04": {
    imageSrc: "/images/service-content-days.png",
    imageAlt:
      "Two people collaborating over a laptop at a table — content day and campaign energy.",
    imageObjectPosition: "50% 50%",
  },
};

export function SocialMediaPageContent() {
  return (
    <ServicePackagePageLayout
      heroEyebrow="[ Social Media Management Packages ]"
      packagesSectionEyebrow="[ Social packages ]"
      packagesSectionTitle={<>Management and content tiers side by side</>}
      packagesSectionSubtitle="Step through options with the arrows, then open a card for scope, add-ons, and FAQs."
      bottomCta={{
        title: (
          <>
            Ready to show up on social with{" "}
            <em className="font-normal italic">clarity and consistency</em>?
          </>
        ),
      }}
      heroTitle={
        <>
          We create cohesive, <em className="font-normal italic">strategically led</em> social
          ecosystems for brands ready to grow with intention.
        </>
      }
      whatToExpect={socialMediaWhatToExpect}
      packages={socialMediaPackages.map((pkg) => {
        const img = PACKAGE_IMAGES[pkg.index];
        return {
          id: `social-package-${pkg.index}`,
          index: pkg.index,
          name: pkg.name,
          timeline: pkg.timeline,
          body: (
            <>
              {pkg.tagline ? <p className="text-cream/90">{pkg.tagline}</p> : null}
              <p>{pkg.description}</p>
              {pkg.note ? <p className="italic text-cream/80">({pkg.note})</p> : null}
            </>
          ),
          blocks: pkg.blocks,
          ...(img ?? {}),
        };
      })}
    />
  );
}
