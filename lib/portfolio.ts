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
    slug: "prositeuk",
    title: "PROSITEUK",
    type: "Web design + social media",
    image: "/images/portfolio-prositeuk-gallery-homepage.png",
    tagline:
      "From logo-only to a recognised construction recruitment brand on social, then a Next.js site with a live job board for employers and candidates.",
    year: "2025 – 2026",
    overview:
      "PROSITEUK came to us with a logo and not much else. Over the course of our partnership we built their brand presence from the ground up on social media, turning them into a recognisable name in construction recruitment. When the brand had enough weight behind it, the next step was a website that could match - a platform that not only looks the part, but works as a fully functioning job board and base for both employers and candidates.",
    challenge:
      "Construction recruitment isn't a sector known for strong brand identity. PROSITEUK needed to stand out, build trust with tier 1 contractors, and attract quality candidates - all without an established visual presence to work from. Social media came first, then the website had to reflect and elevate everything we'd built.",
    approach:
      "We started on social - building a consistent visual identity, tone of voice and content strategy that made PROSITEUK recognisable in their space. Once the brand had real recognition behind it, we moved into web. The Next.js site was built to serve two audiences clearly - employers with hiring needs and candidates looking for roles - with a live job board, a structured role taxonomy across blue and white collar, and trust signals woven throughout.",
    outcome:
      "A brand that went from a logo to a fully formed identity across social and web. PROSITEUK now has a presence that reflects the quality of the placements they make - and a site built to grow with them as the business scales.",
    services: ["Website design", "Next.js build"],
    galleryCaptions: ["Homepage — employer facing", "Role coverage — blue & white collar"],
    galleryImages: [
      "/images/portfolio-prositeuk-gallery-homepage.png",
      "/images/portfolio-prositeuk-gallery-jobs.png",
    ],
    quote: {
      text: "We decided to bring Harriet on to run our socials and improve our overall engagement. Our turnover up 150%, a coincidence? We don't think so!",
      attribution: "PROSITEUK",
    },
  },
  {
    slug: "petite-social-club",
    title: "Petite Social Club",
    type: "Branding & Website",
    image: "/images/portfolio-petite-gallery-desktop.png",
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
    image: "/images/portfolio-obeach-gallery-suite.webp",
    tagline:
      "Bold, Instagram-ready promotional graphics for the Ibiza Spray event series at one of the island's most iconic beach clubs.",
    year: "2022",
    overview:
      "O Beach Ibiza is one of the island's most iconic beach clubs, known for world-class events and a vibrant, high-energy atmosphere. Over a few months, we supported the team with promotional social media graphics for their Ibiza Spray event series.",
    challenge:
      "O Beach has a strong existing identity and a highly visual audience. The graphics needed to match the energy of the events themselves - bold, colourful, and attention-grabbing - while staying consistent with the brand and cutting through a saturated social feed.",
    approach:
      "We designed a suite of promotional graphics tailored to the Ibiza Spray event, building a visual language that captured the colour, movement, and excitement of the experience. Each asset was created with Instagram in mind, optimised to drive awareness and pull people into the world of the event.",
    outcome:
      "A run of event graphics that felt native to the brand and the platform. The visuals gave the Ibiza Spray series a cohesive social presence across its run, supporting awareness and keeping the audience engaged throughout the season.",
    services: ["Promotional graphics", "Event campaigns", "Instagram creative"],
    galleryCaptions: ["Ibiza Spray — campaign graphics", "Social suite and feed-ready assets"],
    galleryImages: [
      "/images/portfolio-obeach-gallery-suite.webp",
      "/images/portfolio-obeach-gallery-lineup.png",
    ],
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
  },
  {
    slug: "core-focus-pilates",
    title: "Core Focus Pilates",
    type: "Branding",
    image: "/images/portfolio-corefocus-gallery-guidelines.png",
    tagline:
      "Full brand identity for an Ireland-based Pilates studio—sage green, calm, and intentional from logo suite to guidelines.",
    year: "2025",
    overview:
      "Core Focus Pilates is an Ireland-based studio offering a focused, supportive environment for mindful movement. We developed a full brand identity built around beautiful sage green tones - calm, grounding, and deeply aligned with the studio's ethos of strength, balance, and clarity.",
    challenge:
      "Pilates branding can quickly feel generic - all soft neutrals and sans-serifs with nothing to distinguish one studio from the next. The brief was to create something fresh and modern that still felt considered and rooted in the practice, with a colour story that did the heavy lifting.",
    approach:
      "We built the identity around a sage green palette, developing a full logo suite, brand guidelines and on-brand imagery direction that worked together as a cohesive system. Every decision was made to reflect the studio's values - nothing decorative for the sake of it, everything intentional.",
    outcome:
      "A fresh, elegant brand that gives Core Focus Pilates a clear and confident presence from day one. The guidelines ensure every future touchpoint, from social to signage, stays true to the identity as the studio grows.",
    services: ["Brand strategy", "Visual identity", "Brand guidelines"],
    galleryCaptions: ["Brand guidelines and visual system", "Business cards and print"],
    galleryImages: [
      "/images/portfolio-corefocus-gallery-guidelines.png",
      "/images/portfolio-corefocus-gallery-cards.png",
    ],
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
    type: "Social Media Marketing",
    image: "/images/portfolio-batharms-gallery-suite.png",
    tagline:
      "Graphics for Instagram, Facebook and LinkedIn—cosy Cheddar pub charm, consistent online, from menus to feed.",
    year: "2025",
    overview:
      "The Bath Arms is a cosy countryside pub in Cheddar with a warm, welcoming atmosphere and plenty of character. Starting from almost no social media presence, we created a suite of graphics across Instagram, Facebook and LinkedIn to establish a consistent visual style and help them connect with new customers online.",
    challenge:
      "The pub had a strong personality in person but nothing to show for it online. The graphics needed to feel warm and inviting rather than polished and corporate - close enough to the real experience that new customers would walk in already feeling at home.",
    approach:
      "Over a couple of months we designed a collection of social media assets tailored to food, drinks and events, building a visual language that reflected the charm and character of the pub. Assets were adapted across all three platforms to ensure consistency without feeling copy-pasted.",
    outcome:
      "A social presence that finally matched the pub's personality. The Bath Arms moved from no visual identity online to a consistent, recognisable look across three platforms - giving them the foundations to keep building their audience with confidence.",
    services: ["Social media graphics", "Cross-platform campaigns", "Content design"],
    galleryCaptions: ["Takeaway menu — campaign graphic", "Feed and multi-platform suite"],
    galleryImages: [
      "/images/portfolio-batharms-gallery-menu.png",
      "/images/portfolio-batharms-gallery-suite.png",
    ],
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
