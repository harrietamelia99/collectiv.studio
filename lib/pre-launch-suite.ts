import type { PackageAccordionBlock } from "@/lib/website-design-packages";

export const preLaunchSuiteParagraphs = [
  "A complete brand and digital presence built before you step into the spotlight.",
  "This is for businesses preparing to launch properly - not rushed, not half-ready, not pieced together.",
  "We build the foundation, the visuals, the website and the social presence - so when you launch, you launch with clarity, cohesion and confidence.",
] as const;

export const preLaunchSuiteBlocks: PackageAccordionBlock[] = [
  {
    kind: "list",
    title: "Included",
    items: [
      "Full brand identity (primary logo, sub-marks, fonts, colour palette)",
      "Brand application guide",
      "Imagery direction & visual moodboarding",
      "Pattern or graphic elements",
      "Social media branding (profile imagery, highlight covers, templates)",
      "Launch-ready Shopify or Squarespace website (up to 5 pages)",
      "Mobile optimisation",
      "Basic on-page SEO setup",
      "Domain connection & launch support",
      "Instagram grid direction (first 9–12 posts mapped)",
      "6–9 branded launch graphics",
      "Caption guidance for launch week",
      "Launch strategy call",
      "File suite for web & print",
    ],
  },
  {
    kind: "list",
    title: "Not included",
    items: [
      "Ongoing social media management",
      "Paid ads management",
      "Advanced SEO strategy",
      "Product photography",
      "E-commerce inventory uploads beyond agreed scope",
      "Email marketing automation builds (unless added)",
    ],
  },
  {
    kind: "list",
    title: "Add-ons",
    items: [
      "Ongoing social media management",
      "Full e-commerce setup & product upload",
      "Email marketing flows (Klaviyo / Mailchimp)",
      "Copywriting for website & launch",
      "Packaging design",
      "Print collateral",
      "Influencer launch strategy",
      "Launch event creative direction",
      "Content shoot planning",
    ],
  },
  {
    kind: "faq",
    title: "FAQs",
    pairs: [
      {
        q: "Can I launch without all of this?",
        a: "Yes - but cohesion builds trust. This package ensures every touchpoint aligns.",
      },
      {
        q: "Do I need content ready before we start?",
        a: "Yes - product details, service descriptions and core messaging are required. Copywriting can be added.",
      },
      {
        q: "Is this done all at once?",
        a: "Yes. We build in phases - brand first, then website and socials - so everything aligns.",
      },
      {
        q: "Do you offer payment plans?",
        a: "Yes - 50% upfront, 50% before launch. Extended plans available on request.",
      },
      {
        q: "What happens after launch?",
        a: "You can move into ongoing support or management, or run independently with full asset access.",
      },
    ],
  },
];
