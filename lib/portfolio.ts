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
  /** Optional live client site — case study shows a CTA link. */
  liveSiteUrl?: string;
  /** Button label when `liveSiteUrl` is set (default: “View website here”). */
  liveSiteButtonLabel?: string;
  /** When true, shows a “coming soon” label instead of a live site CTA. */
  comingSoon?: boolean;
  quote?: { text: string; attribution: string };
};

export const portfolioProjects: PortfolioProject[] = [
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
    liveSiteUrl: "https://www.petitesocialclub.co.uk/",
    liveSiteButtonLabel: "View here",
  },
  {
    slug: "malow-london",
    title: "Malow London",
    type: "Branding & Shopify website",
    image: "/images/portfolio-malows.png",
    tagline:
      "Full brand identity and a Shopify store for comfort-led heels—feminine, pink, and grounded in quiet luxury.",
    year: "2026",
    overview:
      "Malow London is an e-commerce brand creating heels designed for comfort without compromising on style. We developed a full brand identity—feminine and pink, yet grounded in a quiet luxury, neutral aesthetic—then built a Shopify store that carries that vision through to checkout.",
    challenge:
      "The brief sat in a tricky space: pink and feminine, but not loud or trend-led. The identity needed to feel elevated enough to sit alongside premium footwear brands, while still being warm and accessible. The shop had to do the same—selling occasion heels for weddings, proms and race days without feeling generic or sacrificing the comfort story at the heart of the brand.",
    approach:
      "We worked closely with the team to refine the visual direction, building a palette and identity system that balanced softness with sophistication. From the logo suite and submarks through to the Shopify build, every touchpoint was designed to work together—editorial product presentation, clear size and shipping information, and a calm, premium shopping experience on mobile and desktop.",
    outcome:
      "A brand and Shopify store the founders are genuinely proud of. Malow London is live at malowlondon.com—identity, product storytelling and ecommerce working as one cohesive experience.",
    services: ["Visual identity", "Logo suite & submarks", "Shopify build", "Web design"],
    galleryCaptions: ["Brand identity and logo suite", "Submarks and brand application"],
    galleryImages: [
      "/images/portfolio-malow-gallery-brand.png",
      "/images/portfolio-malow-gallery-application.png",
    ],
    liveSiteUrl: "https://malowlondon.com/",
    liveSiteButtonLabel: "View here",
  },
  {
    slug: "reset-pilates",
    title: "Reset.",
    type: "Branding & Website",
    image: "/images/portfolio-reset-gallery-desktop.png",
    tagline:
      "Mini brand kit, Momence-integrated website and launch email campaigns for a reformer and mat Pilates studio—calm, premium, and ready for opening day.",
    year: "2026",
    overview:
      "Reset. was created to be more than just a workout—a space to step away, slow down, and reconnect with your body. Inspired by the effortless energy of Australian Pilates studios, the brand blends dynamic movement with a modern, considered approach where strength, flow, and feeling good all come together. We built a mini brand kit, a website fully integrated with their Momence account, and on-brand email campaigns to support their launch in Nailsea, North Somerset.",
    challenge:
      "Pilates studios can look interchangeable online. Reset. needed to capture that calm, premium feeling—dynamic classes with heat-infused reformer and mat work—without losing the warmth of a founder-led space. Everything had to feel considered from day one: brand, site, booking flow, and launch comms working as one system before the studio opened.",
    approach:
      "We developed a minimalist brand kit and website around Reset.'s voice and visual direction—clean, monochrome, and confident. The site connects directly to Momence for class booking, intro bundles and founding memberships, with clear pathways for classes, pricing and pre-launch announcements. Launch email campaigns were designed in the same system so every touchpoint stayed on-brand from first announcement through to opening.",
    outcome:
      "Reset. launched with a cohesive brand and a digital presence built for growth—integrated booking, intro offers, and campaign-ready email templates that carry the studio's energy consistently. The site is ready for members to book, explore classes, and feel the brand before they walk through the door.",
    services: ["Mini brand kit", "Website design", "Momence integration", "Launch email campaigns"],
    galleryCaptions: ["Site — desktop pre-launch homepage", "Site — mobile intro offer"],
    galleryImages: [
      "/images/portfolio-reset-gallery-desktop.png",
      "/images/portfolio-reset-gallery-mobile.png",
    ],
    liveSiteUrl: "https://www.resetpilatesstudio.co.uk/",
    liveSiteButtonLabel: "View here",
  },
  {
    slug: "sante-studio",
    title: "Santé Studio",
    type: "Branding & Website",
    image: "/images/portfolio-sante-studio-gallery-desktop.png",
    imageObjectPosition: "center 52%",
    tagline:
      "Boutique reformer Pilates in Hitchin—warm neutrals, community energy, and a full website built for launch (coming soon).",
    year: "2026",
    overview:
      "Santé Studio is an instructor-owned boutique Pilates studio in Hitchin offering Reformer, Mat, Barre and Infrared classes—plus Midwife-led Pre & Postnatal sessions led by founder Leyla. We built a calm, premium digital home that reflects the studio in the room: serif-led typography, cream and taupe tones, clear class pathways, intro offers and booking integration ready for opening day.",
    challenge:
      "Boutique Pilates brands often blur together online—same soft palettes, same stock reformer shots, same generic class lists. Santé needed to feel distinctly theirs: confident without being cold, community-led without losing polish, and credible enough to support specialist pre and postnatal programming alongside everyday class bookings.",
    approach:
      "We shaped the site around how members actually discover a studio: a strong hero with the studio's voice (\"Strength, Community, You\"), clear class categories with book and learn-more paths, the 3-for-£45 intro offer, midwife-led specialist support, social proof and Instagram integration. The design mirrors the Hitchin space—warm light, backlit signage, cream reformers—and keeps navigation simple across classes, membership, pre and postnatal, and contact.",
    outcome:
      "Santé Studio's website is complete and ready to go live—the brand, class structure, booking flow and launch comms working as one system. The site launches publicly soon; until then it remains in pre-launch staging while the studio prepares for opening.",
    services: ["Web design", "Website build", "Class & booking UX", "Launch-ready site"],
    galleryCaptions: ["Site — desktop homepage mockup", "Site — the studio section"],
    galleryImages: [
      "/images/portfolio-sante-studio-gallery-desktop.png",
      "/images/portfolio-sante-studio-gallery-studio.png",
    ],
    comingSoon: true,
  },
  {
    slug: "outlier-coaching",
    title: "Outlier Coaching",
    type: "WordPress website",
    image: "/images/portfolio-outlier.png",
    tagline:
      "A straight-talking one-page WordPress site for a coaching practice built on real connection—not corporate fluff.",
    year: "2026",
    overview:
      "Outlier Coaching offers one-to-one coaching, team workshops, talks, outdoor experiences in North Devon and leadership adventures in Ghana. Joe wanted a site that felt as direct as the work itself: no jargon, no performative coaching language—just a clear path to start a conversation. We built a simple one-page WordPress site that lets the offer and the testimonials do the talking.",
    challenge:
      "Executive coaching sites often default to stock photography, vague promises and the same tired phrases. Joe's practice is the opposite—confidential, human and unapologetically different. The site needed to reflect that without over-designing it or turning into another template-led brochure.",
    approach:
      "We kept the structure intentionally simple: a bold hero question, clear sections for coaching, workshops, talks, experiences and adventures, social proof from clients, and friction-free CTAs to book a discovery call or send an email. The design leans on strong typography, Outlier's orange accent and real photography—room to breathe, nothing extra. WordPress gives Joe a site he can maintain without a complex CMS.",
    outcome:
      "A live one-page site that matches how Joe shows up in the room—direct, warm and credible. Visitors can understand what Outlier offers in seconds, explore upcoming adventures like the Ghana leadership trip, and connect without wading through corporate copy.",
    services: ["WordPress build", "Web design", "One-page site"],
    galleryCaptions: ["Site — desktop hero", "Site — mobile views"],
    galleryImages: [
      "/images/portfolio-outlier-gallery-desktop.png",
      "/images/portfolio-outlier-gallery-mobile.png",
    ],
    liveSiteUrl: "https://outliercoaching.co.uk/",
    liveSiteButtonLabel: "View here",
  },
  {
    slug: "tenerife-weather-forum",
    title: "Tenerife Weather Forum",
    type: "Website",
    image: "/images/portfolio-tenerife-weather.png",
    tagline:
      "A daily weather and travel hub for Tenerife—forecasts, guides and live info supporting a growing Facebook and TikTok community.",
    year: "2026",
    overview:
      "Tenerife Weather Forum is an independent weather and travel resource for visitors and residents—daily forecasts, microclimate explainers, travel guides, airport updates, live webcams and excursion ideas. The site sits alongside a Facebook community of 6,000+ Tenerife enthusiasts and a growing TikTok presence, giving the group a professional home on the web.",
    challenge:
      "Weather and tourism sites can feel cluttered, outdated or stuffed with ads. The forum needed to be genuinely useful at a glance—live conditions across the island, credible travel advice and clear paths to the community—while staying fast, readable and easy to update as the audience grows.",
    approach:
      "We built a clean, user-friendly site around how people actually plan a Tenerife trip: a live conditions bar, today's forecast front and centre, essential travel guides, hand-picked excursions, embedded webcams and a free daily weather digest. Social links and a Facebook group CTA connect the website to the community channels already driving engagement.",
    outcome:
      "A professional, approachable platform that works for holidaymakers and locals alike—updated daily, easy to navigate, and built to grow with the forum's Facebook and TikTok following.",
    services: ["Web design", "Website build", "Community integration"],
    galleryCaptions: ["Site — homepage hero", "Site — mobile views"],
    galleryImages: [
      "/images/portfolio-tenerife-weather-gallery-desktop.png",
      "/images/portfolio-tenerife-weather-gallery-mobile.png",
    ],
    liveSiteUrl: "https://www.tenerifeweatherforum.com/",
    liveSiteButtonLabel: "View here",
    quote: {
      text: "Really pleased with everything Harriet has done so far. She's been patient with all my ideas and changes plus communication has been excellent throughout and the site is very professional and user friendly. Would definitely recommend.",
      attribution: "Tenerife Weather Forum",
    },
  },
  {
    slug: "beautigel-nails",
    title: "Beautigel Nails",
    type: "Ecommerce website",
    image: "/images/portfolio-beautigel-gallery-desktop.png",
    tagline:
      "Salon-effect gel nail wraps by a mother & daughter team—an ecommerce site built to explain the science, sell the starter kit, and grow subscriptions.",
    year: "2026",
    overview:
      "Beautigel Nails is a London gel nail wrap brand founded by a mother and daughter who wanted salon-quality nails at home—without the cost, time or damage of regular salon visits. We built their ecommerce site to do more than list products: it educates customers on why UV-cured gel works, guides them through a starter kit, and supports repeat purchase through subscription.",
    challenge:
      "Gel nail wraps sit in a crowded DTC beauty market, and many competitors skip UV curing entirely. Beautigel’s difference is deliberate—UV-cured wraps that last up to four weeks, protect natural nails (especially post-acrylic), and deliver a salon-grade finish. The site had to make that logic clear fast, without overwhelming first-time buyers or underselling the premium positioning.",
    approach:
      "We structured the site around how customers actually decide: a bold hero and bestsellers for quick purchase, a step-by-step routine (choose, apply & cure, wear, remove), and a build-your-own starter kit flow combining wraps, UV lamp and cuticle oil. Comparison tables and science-led sections explain why curing matters versus non-UV wraps and salon gel—wear time, protection, removal and at-home convenience. Subscription, membership savings and the founders’ story sit alongside social proof and Instagram integration to build trust and repeat orders.",
    outcome:
      "Beautigel Nails is live at beautigelnails.uk—a scalable shop that sells the product and the reasoning behind it. Visitors can buy individual wrap kits, configure a starter bundle, subscribe for regular deliveries, and understand exactly why UV-cured gel is worth it before they checkout.",
    services: ["Ecommerce website", "Web design", "Product storytelling", "Subscription setup"],
    galleryCaptions: ["Site — desktop homepage", "Site — mobile mission & values"],
    galleryImages: [
      "/images/portfolio-beautigel-gallery-desktop.png",
      "/images/portfolio-beautigel-gallery-mobile.png",
    ],
    liveSiteUrl: "https://www.beautigelnails.uk/",
    liveSiteButtonLabel: "View here",
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
  {
    slug: "prositeuk",
    title: "PROSITEUK",
    type: "Website & social media",
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
    slug: "gasworld-ltd",
    title: "GasWorld LTD",
    type: "Brand identity",
    image: "/images/portfolio-gasworld-gallery-system.png",
    tagline:
      "Full visual system for one of Bristol's most established gas engineering firms—built from their logo into a credible, trust-first identity ready for web.",
    year: "2026",
    overview:
      "GasWorld LTD has been one of Bristol's most established gas engineering firms for over 45 years. The reputation was already there - the brand identity wasn't. They came to us with a logo and nothing else, and needed a visual identity that finally matched the scale and credibility of the business they'd built.",
    challenge:
      "A 45-year-old firm carries real weight, but an outdated or inconsistent brand can quietly work against that. GasWorld needed a refresh that respected their history without looking stuck in it - credible and professional for commercial clients, but modern enough to compete in 2026. Starting from a single logo with no supporting system made this a build from scratch.",
    approach:
      "We used the existing logo as a foundation and built a full brand identity system around it - colour palette, typography, visual language and brand guidelines that give the business consistency across every touchpoint. The focus throughout was on trust and authority - this is a firm that's been doing serious work for decades, and the brand needed to communicate that from first glance.",
    outcome:
      "GasWorld now has a brand identity that reflects where they are as a business - established, credible and ready for the next chapter. A website is currently in development and will carry the new identity into their digital presence for the first time.",
    services: ["Website coming soon"],
    galleryCaptions: ["Brand identity — full system", "Logo refresh in application"],
    galleryImages: [
      "/images/portfolio-gasworld-gallery-system.png",
      "/images/portfolio-gasworld-gallery-application.png",
    ],
  },
  {
    slug: "flowfirst-plumbing",
    title: "FlowFirst Plumbing",
    type: "Next.js website",
    image: "/images/portfolio-flowfirst-gallery-desktop.png",
    tagline:
      "Custom Next.js site for a new Bristol plumbing business—from zero brand to a premium, trust-led presence built to scale.",
    year: "2026",
    overview:
      "FlowFirst Plumbing is a new business founded by an experienced plumber ready to go out on their own. They came to us with no brand at all - no identity, no web presence, nothing to hand a customer. The brief was simple: build something that reflects the quality of work they deliver and gives them a foundation to grow from.",
    challenge:
      "Starting from zero is both a clean slate and a pressure. There was no existing brand to build from or refine - everything needed to be created. The goal was to position FlowFirst as a premium, trustworthy choice for domestic customers without coming across as generic. In a crowded trade market, it needed to feel considered and credible from day one.",
    approach:
      "We built the site from scratch using Next.js, giving FlowFirst a custom-coded presence that performs and scales properly as the business grows. The design direction was premium and clean - the kind of site that reassures a homeowner before they've even read a word. Every decision, from layout to typography to copy hierarchy, was made with trust and conversion in mind.",
    outcome:
      "FlowFirst launched with a website that punches well above where most new trade businesses start. They have a professional digital presence built to grow with them - ready for more pages, more services, and more customers as the business develops.",
    services: ["Next.js", "Custom full build"],
    galleryCaptions: ["Site — mobile hero", "Site — desktop homepage"],
    galleryImages: [
      "/images/portfolio-flowfirst-gallery-mobile.png",
      "/images/portfolio-flowfirst-gallery-desktop.png",
    ],
    quote: {
      text: "Harriet did a brilliant job of bringing our website to life. I didn't know much about marketing or how I wanted it to look, so she really didn't have much to go off - but somehow she captured my vision perfectly. We're so pleased with the results, and glad we now have a website that can grow with us as a business.",
      attribution: "FlowFirst Plumbing",
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
