import { ServicePageRelatedLinks } from "@/components/marketing/ServicePageRelatedLinks";
import { ServicePackagePageLayout } from "@/components/services/ServicePackagePageLayout";
import { websiteDesignPackages } from "@/lib/website-design-packages";
import { websiteDesignWhatToExpect } from "@/lib/service-what-to-expect";

/** Stock imagery aligned with the home services grid (armchair scene, terrazzo launch flat lay, desk details, social-style lifestyle). */
const PACKAGE_IMAGES: Record<
  string,
  {
    imageSrc: string;
    imageAlt: string;
    imageObjectPosition?: string;
    imageObjectFit?: "cover" | "contain";
  }
> = {
  "01": {
    imageSrc: "/images/website-the-launch-page.png",
    imageAlt:
      "Close-up of hands typing on a silver laptop, cream loungewear, gold watch and rings, soft bright background — calm professional mood.",
    /* Portrait in a 4:3 card: cover fills the frame; bias lower-right so laptop + hands stay in view */
    imageObjectPosition: "56% 68%",
  },
  "02": {
    imageSrc: "/images/service-website.png",
    imageAlt:
      "Velvet armchair and side table with laptop and coffee, strong diagonal window light — calm, high-contrast interior.",
    imageObjectPosition: "78% 72%",
  },
  "03": {
    imageSrc: "/images/website-the-elevate-build.png",
    imageAlt:
      "Top-down view of a silver MacBook Air on an off-white desk, light wood tray with candle and ceramic vase, open interior-design magazine — calm, minimal workspace.",
    imageObjectPosition: "48% 46%",
  },
  "04": {
    imageSrc: "/images/website-the-signature-site.png",
    imageAlt:
      "Laptop on a bright desk with workspace details — premium web build mood.",
    /* Subject sits low in frame (wall above); anchor crop toward bottom so the laptop isn’t clipped */
    imageObjectPosition: "50% 78%",
  },
  "05": {
    imageSrc: "/images/website-the-expansion-build.png",
    imageAlt:
      "High-angle workspace with laptop on stone counter, white shirt and hands typing, croissant and coffee on a tray — bright café-style morning.",
    /* Portrait in 4:3: cover fills width; centre slightly low for laptop + breakfast tray */
    imageObjectPosition: "50% 54%",
  },
};

export function WebsiteDesignPageContent() {
  return (
    <>
    <ServicePackagePageLayout
      heroEyebrow="[ Website Design Packages ]"
      packagesSectionEyebrow="[ Website design packages ]"
      packagesSectionTitle={<>Packages for every stage of your site</>}
      packagesSectionSubtitle="Use the arrows to compare tiers, then open a card for the full write-up, inclusions, and FAQs."
      bottomCta={{
        title: (
          <>
            Ready for a site that works as hard as your{" "}
            <em className="font-normal italic">brand</em>?
          </>
        ),
      }}
      heroTitle={
        <>
          We create thoughtfully built websites, for brands who are ready to{" "}
          <em className="font-normal italic">flourish</em>.
        </>
      }
      whatToExpect={websiteDesignWhatToExpect}
      packages={websiteDesignPackages.map((pkg) => {
        const img = PACKAGE_IMAGES[pkg.index];
        return {
          id: `package-${pkg.index}`,
          index: pkg.index,
          name: pkg.name,
          timeline: pkg.timeline,
          body: <p>{pkg.description}</p>,
          blocks: pkg.blocks,
          ...(img ?? {}),
        };
      })}
    />
    <ServicePageRelatedLinks omit="website" />
    </>
  );
}
