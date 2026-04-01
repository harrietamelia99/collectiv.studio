import { MARKETING_SITE_URL } from "@/lib/marketing-seo";

const schema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Collectiv. Studio",
  description:
    "Boutique creative agency offering brand strategy, website design and social media management",
  url: MARKETING_SITE_URL,
  email: "hello@collectivstudio.uk",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Bristol",
    addressCountry: "GB",
  },
  areaServed: "GB",
  serviceType: ["Brand Identity Design", "Website Design", "Social Media Management"],
};

export function LocalBusinessJsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
