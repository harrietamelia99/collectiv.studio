import type { PackageAccordionBlock } from "@/lib/website-design-packages";

export type BrandingPackage = {
  index: string;
  name: string;
  timeline: string;
  intro: string;
  more?: string[];
  note?: string;
  blocks: PackageAccordionBlock[];
};

export const brandingPackages: BrandingPackage[] = [
  {
    index: "01",
    name: "Full Branding Package",
    timeline: "2–3 weeks",
    intro:
      "A complete visual identity for businesses ready to show up professionally and consistently.",
    more: [
      "This is for founders who don’t just want a logo - they want a brand that feels intentional, recognisable and elevated across every touchpoint.",
      "A strong brand builds trust before you’ve even spoken.",
    ],
    blocks: [
      {
        kind: "list",
        title: "Included",
        items: [
          "Core primary logo (vector format)",
          "3 sub-mark variations (stacked, icon, simplified marks)",
          "Curated brand font system",
          "Defined colour palette (primary + secondary tones)",
          "Mini brand application guide (PDF)",
          "Imagery direction (moodboard or curated Google Drive folder)",
          "Pattern or graphic element (if aligned with brand direction)",
          "Social profile logo formatting",
          "File suite for web & print (PNG, SVG, PDF, JPEG)",
        ],
      },
      {
        kind: "list",
        title: "Not included",
        items: [
          "Full website design",
          "Copywriting / brand messaging",
          "Social media management",
          "Ongoing design retainers",
          "Trademark registration",
        ],
      },
      {
        kind: "list",
        title: "Add-ons",
        items: [
          "Full website build",
          "Launch graphics (Instagram launch kit)",
          "Packaging design",
          "Print collateral (business cards, flyers, menus, etc.)",
          "Brand strategy workshop",
          "Extended brand guidelines (20–30 page document)",
        ],
      },
      {
        kind: "faq",
        title: "FAQs",
        pairs: [
          {
            q: "How many revisions are included?",
            a: "Two refinement rounds after initial concepts are presented.",
          },
          {
            q: "Will I own the logo?",
            a: "Yes - once final payment is complete, all final assets are yours.",
          },
          {
            q: "What if I don’t like the first concept?",
            a: "We work collaboratively through direction and feedback. The process is structured to avoid surprises.",
          },
          {
            q: "Can this be done faster?",
            a: "A rush fee may apply depending on availability.",
          },
        ],
      },
    ],
  },
  {
    index: "02",
    name: "Logo Design",
    timeline: "1–2 weeks",
    intro: "For businesses who need a strong, professional logo without the full brand suite.",
    note: "Simple. Clean. Strategic.",
    blocks: [
      {
        kind: "list",
        title: "Included",
        items: [
          "Core vector logo",
          "Black, white and colour variations",
          "Basic font pairing guidance",
          "File formats for web & print",
        ],
      },
      {
        kind: "list",
        title: "Not included",
        items: [
          "Sub-marks",
          "Full brand identity system",
          "Application guide",
          "Imagery direction",
          "Website or print design",
        ],
      },
      {
        kind: "list",
        title: "Add-ons",
        items: [
          "Sub-mark suite",
          "Brand colour palette",
          "Mini brand guide",
          "Social media launch graphics",
          "Print collateral",
        ],
      },
      {
        kind: "faq",
        title: "FAQs",
        pairs: [
          {
            q: "Is this enough for a new business?",
            a: "Yes - if you’re starting small and want to build gradually.",
          },
          {
            q: "Can I upgrade to full branding later?",
            a: "Absolutely. The logo investment can be partially credited toward a full branding package within 3 months.",
          },
          {
            q: "Do you provide fonts?",
            a: "Yes - with guidance on licensing if required.",
          },
        ],
      },
    ],
  },
  {
    index: "03",
    name: "Print Services",
    timeline: "Project dependent",
    intro: "Designed print that aligns seamlessly with your brand identity.",
    more: ["From business cards to large-scale collateral - consistency matters."],
    blocks: [
      {
        kind: "list",
        title: "Included",
        items: [
          "Print-ready artwork setup",
          "File preparation to printer specifications",
          "Brand-aligned layout design",
          "Two refinement rounds",
        ],
      },
      {
        kind: "list",
        title: "Not included",
        items: [
          "Printing costs (quoted separately)",
          "Brand development (unless added)",
          "Copywriting",
          "Extensive illustration work",
        ],
      },
      {
        kind: "list",
        title: "Add-ons",
        items: [
          "Printer sourcing & liaison",
          "Premium finishes (foil, embossing, textured stock guidance)",
          "Full stationery suite",
          "Packaging design",
        ],
      },
      {
        kind: "faq",
        title: "FAQs",
        pairs: [
          {
            q: "Do you handle printing?",
            a: "I can manage print sourcing and liaison as an add-on.",
          },
          {
            q: "Can you match my existing brand?",
            a: "Yes - provided brand assets are supplied.",
          },
        ],
      },
    ],
  },
  {
    index: "04",
    name: "Signage Services",
    timeline: "Project dependent",
    intro: "Impactful signage that translates your brand into physical space.",
    more: [
      "From window vinyls to exterior shopfront signage - this is where brand presence becomes real.",
    ],
    blocks: [
      {
        kind: "list",
        title: "Included",
        items: [
          "Scaled artwork setup",
          "Mockups for approval",
          "Material guidance",
          "Supplier-ready print files",
          "Two refinement rounds",
        ],
      },
      {
        kind: "list",
        title: "Not included",
        items: [
          "Fabrication or installation costs",
          "Structural assessments",
          "Planning permission applications",
          "Brand creation (unless added)",
        ],
      },
      {
        kind: "list",
        title: "Add-ons",
        items: [
          "Supplier sourcing & coordination",
          "Installation management",
          "Wayfinding systems",
          "Full environmental branding",
        ],
      },
      {
        kind: "faq",
        title: "FAQs",
        pairs: [
          {
            q: "Do you install signage?",
            a: "I design and prepare files. Installation can be coordinated via trusted suppliers.",
          },
          {
            q: "Can you design signage without doing my branding?",
            a: "Yes - but brand assets must be provided.",
          },
        ],
      },
    ],
  },
];
