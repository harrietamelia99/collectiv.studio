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
  /** Captions for secondary visual blocks (placeholders until assets ship). */
  galleryCaptions: readonly string[];
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
    year: "2024",
    overview:
      "Petite Social Club needed a brand that felt premium without feeling precious - somewhere parents would be proud to book and children would feel at home. We shaped a full visual system, tone of voice and a calm, editorial site that carries the story from first glance to membership enquiry.",
    challenge:
      "The category skews either overly corporate or cartoonish. The founder wanted a refined middle ground: credible for parents, inviting for families, and flexible enough to work across events, merchandise and digital comms.",
    approach:
      "We started with positioning and naming touchpoints, then moved into a restrained palette, custom wordmark direction and photography rules that favour natural light and real moments. The website mirrors that restraint - generous whitespace, clear membership pathways and modular blocks for seasonal programming.",
    outcome:
      "A cohesive launch that reads boutique rather than bulk: membership enquiries picked up early traction and the team can swap campaign modules without breaking layout. The system is documented so future collateral stays on-brand.",
    services: ["Brand strategy", "Visual identity", "Web design", "UI build support"],
    galleryCaptions: ["Identity in use across club spaces", "Site - membership and events"],
    quote: {
      text: "Collectiv understood the emotional side of our brand, not just the visuals. Parents tell us it finally feels like us.",
      attribution: "Founder, Petite Social Club",
    },
  },
  {
    slug: "ateau",
    title: "Ateau",
    type: "Social Media",
    image: "/images/portfolio-ateau.png",
    tagline: "Editorial social content for a slow-living kitchen and tableware label.",
    year: "2023",
    overview:
      "Ateau sells thoughtful, small-batch pieces for everyday rituals. We translated that philosophy into a social rhythm that feels like a quiet Sunday - recipe-led, tactile and never shouty.",
    challenge:
      "Product shots alone weren’t enough to differentiate in a crowded homeware feed. The brand needed a narrative thread that could carry launches, behind-the-scenes and UGC without looking disjointed.",
    approach:
      "We defined three recurring content pillars - process, place and plate - each with layout templates, caption cadence and hashtag sets. Stories became the home for slower, longer-form moments; the grid stayed clean and catalogue-sharp.",
    outcome:
      "Stronger save rates on tutorial-style carousels and a clearer uptick in profile visits during collection drops. The founder’s small team can now batch content with a shared shot list and caption prompts.",
    services: ["Social strategy", "Content templates", "Campaign art direction"],
    galleryCaptions: ["Carousel templates for seasonal drops", "Story frames for process reels"],
  },
  {
    slug: "peaches-nutrition",
    title: "Peaches Nutrition",
    type: "Website",
    image: "/images/portfolio-peaches.png",
    tagline: "A clarity-first site for one-to-one nutrition coaching.",
    year: "2024",
    overview:
      "Peaches Nutrition helps clients rebuild their relationship with food through evidence-led coaching. The new site had to feel approachable for anxious first-time visitors while signalling professionalism to referrers and partners.",
    challenge:
      "The previous site buried services and pricing. Prospects weren’t sure who the offer was for, or what the first step looked like - so enquiries were inconsistent and often misqualified.",
    approach:
      "We restructured the journey around three questions: Is this for me? What do I get? How do I start? Service tiers, FAQs and a warm but direct about section sit alongside a streamlined contact flow. Typography and spacing prioritise readability over decoration.",
    outcome:
      "Fewer ‘just browsing’ emails and more bookings that match the practitioner’s ideal client profile. Analytics show a shorter path from services page to contact, with mobile accounting for the majority of conversions.",
    services: ["UX structure", "Web design", "Copy alignment"],
    galleryCaptions: ["Services and pricing clarity", "Mobile-first enquiry flow"],
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
    tagline: "Strength-forward branding for a reformer studio with a loyal local following.",
    year: "2023",
    overview:
      "Powerhouse wanted to graduate from a logo they’d outgrown into a full studio identity - then carry it through a site that could handle timetables, intro offers and instructor profiles without feeling like a generic gym template.",
    challenge:
      "Pilates studios often look interchangeable. The owner needed a mark and language that communicated athletic rigour while staying inclusive for beginners walking in off the street.",
    approach:
      "Custom logotype exploration led to a bold, slightly condensed wordmark paired with a secondary monogram for social avatars and kit. The site maps the in-studio experience online: class types, first-visit FAQs and a prominent trial path.",
    outcome:
      "Intro-class bookings became easier to track and staff spend less time answering the same questions on DMs. Merch and studio signage finally match the digital experience.",
    services: ["Branding", "Web design", "Launch assets"],
    galleryCaptions: ["Brand mark and studio signage", "Timetable and intro-offer UX"],
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
    tagline: "Soft minimalism for an independent London label.",
    year: "2023",
    overview:
      "Malow makes small-run pieces with an emphasis on fabric and cut. They needed a mark, packaging language and digital-first assets that could scale as stockists came on board.",
    challenge:
      "Fast fashion noise on social makes quiet craft hard to read at thumbnail size. The identity had to survive Instagram, Not On The High Street and in-boutique swing tags.",
    approach:
      "A single refined wordmark with optional sub-mark for woven labels. Packaging uses one ink and deboss texture rather than loud colour. Digital templates keep crops consistent so textile detail stays legible.",
    outcome:
      "Wholesale one-sheets and packaging finally match the product price point. The founder reports fewer requests for ‘just the logo’ in random formats.",
    services: ["Logo & wordmark", "Packaging design", "Digital brand kit"],
    galleryCaptions: ["Packaging and swing tags", "Social product crops"],
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
