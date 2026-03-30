import type { PackageAccordionBlock } from "@/lib/website-design-packages";

export type SocialMediaPackage = {
  index: string;
  name: string;
  timeline: string;
  /** Short line under the title (e.g. positioning line). */
  tagline?: string;
  description: string;
  /** Optional parenthetical note below the main copy. */
  note?: string;
  blocks: PackageAccordionBlock[];
};

export const socialMediaPackages: SocialMediaPackage[] = [
  {
    index: "01",
    name: "The Foundation Edit",
    timeline: "Ongoing (monthly retainer)",
    tagline: "For brands who want consistency and clarity.",
    description:
      "We create strategic, on-brand social content for businesses ready to show up consistently and professionally.",
    note: "Perfect for smaller brands or those building momentum.",
    blocks: [
      {
        kind: "list",
        title: "Included",
        items: [
          "Content strategy direction (monthly focus)",
          "8 feed posts per month (static or carousel)",
          "Caption writing (strategic & on-brand)",
          "Hashtag research",
          "Content scheduling",
          "Basic community management (replying to comments)",
          "Monthly performance summary",
          "One monthly check-in call",
        ],
      },
      {
        kind: "list",
        title: "Not included",
        items: [
          "Reels editing",
          "Video filming",
          "Paid ads management",
          "Influencer outreach",
          "Daily engagement strategy",
          "Full rebrand or content overhaul",
        ],
      },
      {
        kind: "list",
        title: "Add-ons",
        items: [
          "Reels creation (per video)",
          "Extra posts",
          "Story sets",
          "Content shoot planning",
          "Audit & strategy deep-dive",
          "Engagement support",
        ],
      },
      {
        kind: "faq",
        title: "FAQs",
        pairs: [
          {
            q: "Do you film content?",
            a: "Not within this package. You provide imagery or video unless a shoot add-on is booked.",
          },
          {
            q: "Is this enough to grow?",
            a: "Yes - if you’re focused on building consistency and brand clarity first.",
          },
          {
            q: "Can I upgrade later?",
            a: "Absolutely. Packages are designed to scale with you.",
          },
        ],
      },
    ],
  },
  {
    index: "02",
    name: "The Growth Suite",
    timeline: "Ongoing (monthly retainer)",
    tagline: "For brands ready to scale visibility and engagement.",
    description:
      "We manage and elevate social platforms for brands ready to grow with intention and impact.",
    note: "This feels mid-tier - more strategy, more momentum.",
    blocks: [
      {
        kind: "list",
        title: "Included",
        items: [
          "Full monthly content strategy",
          "12 feed posts per month",
          "2–4 Reels (edited & optimised)",
          "Caption writing",
          "Hashtag & keyword research",
          "Content scheduling",
          "Community management (comments + light DMs)",
          "Story direction (3–5 story sets per week guidance)",
          "Monthly analytics report",
          "Monthly strategy call",
        ],
      },
      {
        kind: "list",
        title: "Not included",
        items: [
          "Paid ads management",
          "Influencer negotiations",
          "Full brand redesign",
          "Daily on-camera filming",
          "Email marketing",
        ],
      },
      {
        kind: "list",
        title: "Add-ons",
        items: [
          "Additional Reels",
          "Content shoot day",
          "Paid ads management",
          "Influencer outreach",
          "Giveaway campaign strategy",
          "Launch support",
        ],
      },
      {
        kind: "faq",
        title: "FAQs",
        pairs: [
          {
            q: "Will this grow my following?",
            a: "Growth is never guaranteed - but strategy, consistency and strong positioning significantly improve visibility and engagement.",
          },
          {
            q: "Do you create all the content?",
            a: "We collaborate. You’ll provide raw footage where needed, or we plan a shoot.",
          },
        ],
      },
    ],
  },
  {
    index: "03",
    name: "The Signature Presence",
    timeline: "Ongoing (monthly retainer)",
    tagline: "For brands ready to own their space online.",
    description:
      "We build and manage high-impact social ecosystems for brands ready to lead, not follow.",
    note: "This is your premium tier. Strategy-led. Authority-building.",
    blocks: [
      {
        kind: "list",
        title: "Included",
        items: [
          "High-level social strategy & positioning",
          "16+ feed posts per month",
          "4–6 Reels (concept, edit, optimise)",
          "Advanced caption strategy (conversion-focused)",
          "Platform optimisation (bio, highlights, pinned content)",
          "Content shoot planning & direction",
          "Full community management (comments + DMs)",
          "Engagement strategy implementation",
          "Monthly in-depth analytics report",
          "Fortnightly strategy calls",
        ],
      },
      {
        kind: "list",
        title: "Not included",
        items: [
          "Paid ad spend",
          "Large-scale influencer contract negotiation",
          "Full website redesign",
          "Email automation builds",
        ],
      },
      {
        kind: "list",
        title: "Add-ons",
        items: [
          "Paid ads management",
          "Influencer campaign management",
          "Launch campaign build-out",
          "Quarterly strategy intensives",
          "On-site filming days",
        ],
      },
      {
        kind: "faq",
        title: "FAQs",
        pairs: [
          {
            q: "Is this done-for-you?",
            a: "Yes - this is the closest to fully managed social presence.",
          },
          {
            q: "How involved do I need to be?",
            a: "You’ll still approve content and provide insight - but execution is handled.",
          },
          {
            q: "Is this suitable for product brands?",
            a: "Yes - especially if you want growth, visibility and authority positioning.",
          },
        ],
      },
    ],
  },
  {
    index: "04",
    name: "Content Days",
    timeline: "1 day on-site + 1–2 weeks delivery",
    description:
      "A dedicated filming and content creation day designed to build a bank of strategic, on-brand visuals. This is for brands who want elevated content without the stress of constantly filming week to week. We plan, capture and create intentionally - so you leave with clarity and content that actually works.",
    blocks: [
      {
        kind: "list",
        title: "Included",
        items: [
          "Pre-shoot strategy call",
          "Shot list & content planning",
          "4–6 hours on-site filming",
          "Direction for posing / styling / framing",
          "B-roll capture",
          "10–20 short-form video clips",
          "20–40 edited images (if photography included)",
          "3–6 edited Reels (if selected)",
          "Raw content folder delivered",
          "Guidance on how to maximise the content",
        ],
      },
      {
        kind: "list",
        title: "Not included",
        items: [
          "Professional studio hire (unless booked)",
          "Models or additional talent",
          "Full-day photography team",
          "Hair & makeup",
          "Paid ads management",
          "Travel outside agreed radius",
        ],
      },
      {
        kind: "list",
        title: "Add-ons",
        items: [
          "Professional photographer",
          "Studio hire coordination",
          "Hair & makeup artist",
          "Additional editing",
          "Extra Reels",
          "Same-week turnaround",
          "Ongoing content repurposing",
        ],
      },
      {
        kind: "faq",
        title: "FAQs",
        pairs: [
          {
            q: "Do I need to know what to film?",
            a: "No - we plan everything beforehand.",
          },
          {
            q: "Can this work without a big team?",
            a: "Yes. Many shoots are just you, your space and strategic direction.",
          },
          {
            q: "Is this only for clients on retainers?",
            a: "No - Content Days can be booked as standalone sessions.",
          },
          {
            q: "How much content will I get?",
            a: "Enough to support several weeks of posting when used strategically.",
          },
        ],
      },
    ],
  },
];
