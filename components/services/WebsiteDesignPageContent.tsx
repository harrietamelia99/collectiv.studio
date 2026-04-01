import { ServicePackagePageLayout } from "@/components/services/ServicePackagePageLayout";
import { websiteDesignPackages } from "@/lib/website-design-packages";
import { websiteDesignWhatToExpect } from "@/lib/service-what-to-expect";

/** Stock imagery aligned with the home services grid (armchair scene, terrazzo launch flat lay, desk details, social-style lifestyle). */
const PACKAGE_IMAGES: Record<
  string,
  { imageSrc: string; imageAlt: string; imageObjectPosition?: string }
> = {
  "01": {
    imageSrc: "/images/website-the-launch-page.png",
    imageAlt:
      "Minimal desk with open laptop, glass of water, notebooks, and pen — bright, focused workspace.",
    imageObjectPosition: "50% 42%",
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
      "Open ring binder and stationery on a round table with calla lily and soft daylight — strategic planning mood.",
    imageObjectPosition: "50% 45%",
  },
  "04": {
    imageSrc: "/images/website-the-signature-site.png",
    imageAlt:
      "Flat lay with phone, notebook, and soft natural light on textured cream — tactile, premium detail.",
    imageObjectPosition: "50% 48%",
  },
  "05": {
    imageSrc: "/images/service-launch.png",
    imageAlt:
      "Top-down terrazzo surface with headphones, tablet, and latte — polished launch-day flat lay.",
    imageObjectPosition: "50% 45%",
  },
};

export function WebsiteDesignPageContent() {
  return (
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
  );
}
