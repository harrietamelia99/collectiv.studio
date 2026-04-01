export type PortfolioProject = {
  slug: string;
  title: string;
  type: string;
  image: string;
  /** Optional `object-position` for portfolio card crops (e.g. `center 58%`). */
  imageObjectPosition?: string;
  tagline: string;
  year: string;
  overview: string;
  challenge: string;
  approach: string;
  outcome: string;
  services: readonly string[];
  /** Captions under gallery images (uppercase in UI). */
  galleryCaptions: readonly string[];
  /** When set (same length as captions used), gallery shows these instead of placeholders. */
  galleryImages?: readonly string[];
  quote?: { text: string; attribution: string };
};

export const portfolioProjects: PortfolioProject[] = [
  {
    slug: "petite-social-club",
    title: "Petite Social Club",
    type: "Branding & Website",
    image: "/images/portfolio-petite.png",
    imageObjectPosition: "center 56%",
    tagline: "A warm, confident identity for a members’ club designed around little ones and their grown-ups.",
    year: "2026",
    overview:
      "Petite Social Club needed a brand that felt premium without feeling precious - somewhere parents would be proud to book and children would feel at home. We shaped a full visual system, tone of voice and a Squarespace site that carries the story from first glance to enquiry.",
    challenge:
      "The category skews either overly corporate or cartoonish. The founder wanted a refined middle ground: credible for parents, inviting for families, and flexible enough to work across events, merchandise and digital comms.",
    approach:
      "We started with brand positioning, then moved into a restrained palette, custom wordmark direction and photography rules that favour natural light and real moments. The Squarespace build mirrors that restraint - generous whitespace, clear membership pathways and modular blocks for seasonal programming.",
    outcome:
      "A cohesive launch that reads boutique rather than bulk. The team can swap campaign modules without breaking layout, and the system is documented so every future touchpoint stays on-brand.",
    services: ["Brand strategy", "Visual identity", "Web design", "Squarespace build"],
    galleryCaptions: ["Identity in use across club spaces", "Site - membership and events"],
    galleryImages: [
      "/images/portfolio-petite-gallery-desktop.png",
      "/images/portfolio-petite-gallery-mobile.png",
    ],
    quote: {
      text: "Collectiv understood the emotional side of our brand, not just the visuals. Parents tell us it finally feels like us.",
      attribution: "Founder, Petite Social Club",
    },
  },
  {
    slug: "ateau",
    title: "Âteau",
    type: "Social Media",
    image: "/images/portfolio-ateau.png",
    tagline:
      "A year of end-to-end Instagram for a boutique wine glass brand—luxury craft, editorial grid, scroll-stopping product photography.",
    year: "2023",
    overview:
      "Âteau is a boutique wine glass company with a strong focus on elegance and craftsmanship. Over the course of a year, we managed their Instagram presence end to end - creating content that matched the refined, luxury aesthetic the brand was built on.",
    challenge:
      "Glassware is a tactile, sensory product that can easily fall flat on a screen. The challenge was to create an Instagram presence that made people stop scrolling - something that communicated quality and set the brand apart from generic product photography.",
    approach:
      "We worked closely with the founder to plan and shoot product photography that placed the glasses in considered, beautiful settings. Every post was treated as part of a wider visual story, building a cohesive grid that felt editorial and intentional rather than promotional.",
    outcome:
      "A year of consistent, considered content that gave Âteau a social presence as refined as the product itself. The brand's Instagram became a genuine brand asset - a portfolio of imagery that communicated luxury from the first visit to the page.",
    services: ["Instagram management", "Product photography", "Content strategy"],
    galleryCaptions: ["Editorial grid and feed", "Product photography in setting"],
    galleryImages: [
      "/images/portfolio-ateau-gallery-grid.png",
      "/images/portfolio-ateau-gallery-product.png",
    ],
  },
  {
    slug: "peaches-nutrition",
    title: "Peaches Nutrition",
    type: "Website",
    image: "/images/portfolio-peaches.png",
    tagline:
      "A full Squarespace site that feels pink, feminine, and welcoming—without sacrificing clarity or navigation.",
    year: "2026",
    overview:
      "Peaches Nutrition is a coaching platform helping women build healthier relationships with food, fitness, and their bodies. Working from an existing logo, we developed a full Squarespace site that feels pink, feminine, and welcoming without sacrificing clarity or ease of navigation.",
    challenge:
      "The brief called for something that felt genuinely warm and community-led, not clinical or generic. The site needed to balance a playful, girly aesthetic with structured content, so women could land on the page, feel at home, and find exactly what they needed.",
    approach:
      "We built on the existing brand identity, developing a colour-led design system that carried the personality through every page. Layout decisions prioritised clear content hierarchy and intuitive user journeys, making it easy to move from discovery to booking without friction.",
    outcome:
      "A site the founder describes as her \"website of dreams.\" The design holds the brand's warmth while giving the business a credible, structured platform to grow its community and convert visitors into coaching clients.",
    services: ["Squarespace build", "Web design", "UX structure", "Copy alignment"],
    galleryCaptions: ["Site - coaching and community", "Site - programme and booking"],
    galleryImages: [
      "/images/portfolio-peaches-gallery-tablet.png",
      "/images/portfolio-peaches-gallery-mobile.png",
    ],
    quote: {
      text: "Finally a website that sounds like me - and actually converts.",
      attribution: "Peaches Nutrition",
    },
  },
  {
    slug: "o-beach-ibiza",
    title: "O Beach Ibiza",
    type: "Social Media",
    image: "/images/portfolio-obeach.png",
    tagline: "High-summer energy and premium poolside storytelling for an iconic Ibiza venue.",
    year: "2022",
    overview:
      "O Beach blends day-to-night hospitality with headline events. Our remit was to keep feeds feeling luxe and legible in a market that moves fast - new DJs, sponsors and table packages every week.",
    challenge:
      "Volume and speed. The in-house team needed guardrails that still allowed on-the-day capture - without every post looking like a different brand.",
    approach:
      "We built a flexible grid system: hero tiles for headliners, repeating patterns for table sales and typographic locks for time-critical announcements. Colour pulls from seasonal art direction so takeovers stay cohesive.",
    outcome:
      "Smoother handover between agency and internal team during peak season, with fewer last-minute design bottlenecks. Sponsored content sat naturally next to organic moments.",
    services: ["Social systems", "Campaign templates", "Event creative support"],
    galleryCaptions: ["Event announcement system", "Sponsored partner layouts"],
  },
  {
    slug: "powerhouse-pilates",
    title: "Powerhouse Pilates",
    type: "Branding & Website",
    image: "/images/portfolio-powerhouse.png",
    tagline:
      "Visual identity and Squarespace site for a calm Berkshire studio—quiet strength, considered design, online and in the room.",
    year: "2025",
    overview:
      "Powerhouse Pilates is a Berkshire-based studio offering a calm, welcoming space for movement and exercise. Starting from a clean slate, we built a full visual identity and Squarespace site that reflects the studio's ethos - quiet strength, considered design, and a space that feels as good online as it does in person.",
    challenge:
      "The founder had a clear vision but needed someone to translate it into a brand system. The design had to feel calming without feeling flat - neutral and refined, but with enough structure to communicate credibility and attract a loyal, local client base.",
    approach:
      "We developed a clean, neutral palette rooted in the studio's environment, pairing it with considered typography to balance softness with strength. Once the brand identity landed, the founder chose to extend the project into a full Squarespace build, bringing the visual system to life across every page.",
    outcome:
      "A cohesive brand and website that works as hard in the studio as it does online. The identity is flexible enough to carry across signage, social and print, giving Powerhouse Pilates a foundation built for long-term growth.",
    services: ["Visual identity", "Squarespace build", "Web design"],
    galleryCaptions: ["Brand identity and visual system", "Site - studio and booking"],
    galleryImages: [
      "/images/portfolio-powerhouse-gallery-identity.png",
      "/images/portfolio-powerhouse-gallery-site.png",
    ],
    quote: {
      text: "Members say the studio finally looks as strong as it feels.",
      attribution: "Owner, Powerhouse Pilates",
    },
  },
  {
    slug: "core-focus-pilates",
    title: "Core Focus Pilates",
    type: "Branding",
    image: "/images/portfolio-corefocus.png",
    tagline: "Precision-led visual identity for a clinical-meets-boutique reformer practice.",
    year: "2024",
    overview:
      "Core Focus sits between physio-adjacent precision and boutique studio warmth. The branding had to signal expertise first - without feeling cold or medical in a way that would put hobbyists off.",
    challenge:
      "The founder’s audience spans injury rehab clients and fitness enthusiasts. Any visual direction that leaned too far either way would alienate part of the room.",
    approach:
      "We anchored on a deep, grounding palette, crisp typographic hierarchy and abstract line motifs inspired by alignment and breath. Photography direction favours honest studio light and real bodies over stock smiles.",
    outcome:
      "A guidelines PDF the team uses for everything from studio vinyl to instructor press kits. Partnership enquiries now land with a clearer sense of positioning.",
    services: ["Brand strategy", "Visual identity", "Brand guidelines"],
    galleryCaptions: ["Guidelines - colour and type", "Pattern and merchandise applications"],
  },
  {
    slug: "malow-london",
    title: "Malow London",
    type: "Branding",
    image: "/images/portfolio-malows.png",
    tagline:
      "Full brand identity for comfort-led heels—feminine and pink, grounded in quiet luxury.",
    year: "2026",
    overview:
      "Malow London is an e-commerce brand creating heels designed for comfort without compromising on style. We developed a full brand identity that captures their vision exactly - feminine and pink, yet grounded in a quiet luxury, neutral aesthetic.",
    challenge:
      "The brief sat in a tricky space: pink and feminine, but not loud or trend-led. The identity needed to feel elevated enough to sit alongside premium footwear brands, while still being warm and accessible to their customer.",
    approach:
      "We worked closely with the team to refine the visual direction, building a palette and identity system that balanced softness with sophistication. Every element, from the primary logo to the submarks, was designed to work across packaging, digital and social as the brand scales.",
    outcome:
      "A brand the founders are genuinely proud of. The submarks in particular landed exactly where they wanted, and with a website currently in the works, the identity is already doing its job before the full platform is even live.",
    services: ["Visual identity", "Logo suite & submarks", "Packaging & digital"],
    galleryCaptions: ["Brand identity and logo suite", "Submarks and brand application"],
    galleryImages: [
      "/images/portfolio-malow-gallery-brand.png",
      "/images/portfolio-malow-gallery-application.png",
    ],
  },
  {
    slug: "bath-arms",
    title: "Bath Arms",
    type: "Social Media",
    image: "/images/portfolio-batharms.png",
    tagline: "Country pub charm with room for roasts, rooms and live weekends.",
    year: "2023",
    overview:
      "The Bath Arms is a destination pub with rooms, a busy kitchen and a calendar of events. Social needed to sell the whole offer - not just plates - while staying true to a relaxed Wiltshire tone of voice.",
    challenge:
      "Multiple audiences: locals, weekenders and wedding parties. Posts that worked for one group sometimes felt off for another; the feed risked becoming a patchwork.",
    approach:
      "We split content into recurring ‘chapters’ - kitchen, bar, stays, gatherings - each with its own cover style but shared type and colour hooks. User-generated moments get a light branded frame so reposts still feel on-brand.",
    outcome:
      "More balanced engagement across food, rooms and events. The team can plan a month ahead with a simple content calendar tied to the chapter system.",
    services: ["Social strategy", "Content design", "Community repost styling"],
    galleryCaptions: ["Chapter covers - stays & kitchen", "Event weekend takeovers"],
    quote: {
      text: "Our feed finally feels like walking through the front door.",
      attribution: "General Manager, Bath Arms",
    },
  },
];

export function getProjectBySlug(slug: string) {
  return portfolioProjects.find((p) => p.slug === slug);
}

export function getProjectIndex(slug: string) {
  return portfolioProjects.findIndex((p) => p.slug === slug);
}

export function getAdjacentProjects(slug: string): {
  prev: PortfolioProject;
  next: PortfolioProject;
} | null {
  const i = getProjectIndex(slug);
  if (i < 0) return null;
  const n = portfolioProjects.length;
  return {
    prev: portfolioProjects[(i - 1 + n) % n],
    next: portfolioProjects[(i + 1) % n],
  };
}
