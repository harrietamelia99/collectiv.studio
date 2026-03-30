import { ServicePackagePageLayout } from "@/components/services/ServicePackagePageLayout";
import { brandingPackages } from "@/lib/branding-packages";
import { brandingWhatToExpect } from "@/lib/service-what-to-expect";

/** Stock lifestyle imagery — primary tier matches the home “Logo + Branding” desk scene; other tiers stay distinct on-page. */
const PACKAGE_IMAGES: Record<
  string,
  { imageSrc: string; imageAlt: string; imageObjectPosition?: string }
> = {
  "01": {
    imageSrc: "/images/home-service-branding.png",
    imageAlt:
      "Creative at a curved wood desk in a bouclé chair, writing in a notebook beside an open laptop — bright, neutral studio.",
    imageObjectPosition: "50% 42%",
  },
  "02": {
    imageSrc: "/images/website-the-essential-build.png",
    imageAlt:
      "iMac on a light wood desk with brass lamp, candle, and notebook — polished creative studio.",
    imageObjectPosition: "50% 40%",
  },
  "03": {
    imageSrc: "/images/website-the-expansion-build.png",
    imageAlt:
      "Velvet armchair corner with laptop and coffee, strong window light — sophisticated workspace mood.",
    imageObjectPosition: "48% 45%",
  },
  "04": {
    imageSrc: "/images/service-signage.png",
    imageAlt:
      "Laptop and mug on a light desk with warm diagonal sunlight — print-ready, detail-focused setup.",
    imageObjectPosition: "50% 44%",
  },
};

export function BrandingPageContent() {
  return (
    <ServicePackagePageLayout
      heroEyebrow="[ Branding Packages ]"
      packagesSectionEyebrow="[ Branding packages ]"
      packagesSectionTitle={<>Identity packages, tiered to match your ambition</>}
      packagesSectionSubtitle="Browse with the arrows to compare deliverables and timelines, then expand each card for detail."
      bottomCta={{
        title: (
          <>
            Want a brand identity that feels{" "}
            <em className="font-normal italic">yours</em>, not generic?
          </>
        ),
      }}
      heroTitle={
        <>
          We create <em className="font-normal italic">thoughtfully built</em> brand identities for
          businesses ready to <em className="font-normal italic">own</em> their space.
        </>
      }
      whatToExpect={brandingWhatToExpect}
      packages={brandingPackages.map((pkg) => {
        const img = PACKAGE_IMAGES[pkg.index];
        return {
          id: `branding-${pkg.index}`,
          index: pkg.index,
          name: pkg.name,
          timeline: pkg.timeline,
          body: (
            <>
              <p>{pkg.intro}</p>
              {pkg.more?.map((p) => <p key={p}>{p}</p>)}
              {pkg.note ? <p className="italic text-cream/85">{pkg.note}</p> : null}
            </>
          ),
          blocks: pkg.blocks,
          ...(img ?? {}),
        };
      })}
    />
  );
}
