import type { AmenityKey, HotelTheme } from "./data";

export type IntegrationItem = {
  title: string;
  description: string;
  tag: string;
  chip: string;
};

export type HighlightBlock = {
  title: string;
  body: string;
  image: string;
  label: string;
};

export type ExperienceContent = {
  navTitle: string;
  heroEyebrow: string;
  heroHeadline: string;
  heroSub: string;
  heroImage: string;
  heroLayout: "centered" | "editorial" | "minimal";
  bookingProperty: string;
  bookingFrom: string;
  introType: "quote" | "editorial" | "statement";
  introQuote?: string;
  introEditorialText?: string;
  introEditorialImage?: string;
  introStatement?: string;
  interludeImage: string;
  roomsHeading: string;
  integrationsEyebrow: string;
  integrationsHeadline: string;
  integrations: IntegrationItem[];
  highlights: HighlightBlock[];
  partnerHeadline: string;
  partnerSub: string;
  partnerBullets: readonly string[];
  ctaHeadline: string;
  ctaSub: string;
  reviews: readonly { quote: string; source: string }[];
  amenities: readonly { key: AmenityKey; label: string }[];
};

export const EXPERIENCE_CONTENT: Record<HotelTheme, ExperienceContent> = {
  mediterranean: {
    navTitle: "Sun, Sea & Stone",
    heroEyebrow: "MYKONOS · MARBELLA · CÔTE D'AZUR",
    heroHeadline: "Where the sun sets slowly",
    heroSub: "Boutique coastal hotels — direct booking, no OTAs in the way",
    heroImage: "https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?w=1800&q=85",
    heroLayout: "centered",
    bookingProperty: "Villa Thalassa",
    bookingFrom: "From €340 / night",
    introType: "quote",
    introQuote: "Some places don't just welcome you. They change you.",
    interludeImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1800&q=80",
    roomsHeading: "Suites & terraces",
    integrationsEyebrow: "What we integrate for resort hotels",
    integrationsHeadline: "Everything guests expect — wired together beautifully",
    integrations: [
      {
        title: "Direct booking engine",
        description:
          "Cloudbeds, Mews, Little Hotelier or custom — real-time availability on your domain, not Booking.com.",
        tag: "Revenue",
        chip: "Live availability",
      },
      {
        title: "Restaurant & beach club reservations",
        description: "OpenTable, ResDiary or bespoke flows for sun-lounger, cabana and dinner holds.",
        tag: "F&B",
        chip: "Table held · 19:30",
      },
      {
        title: "Spa & hammam scheduling",
        description: "Treatment menus, therapist selection and upsells synced to your PMS.",
        tag: "Spa",
        chip: "Couples ritual · 90 min",
      },
      {
        title: "Multilingual & currency",
        description: "English, French, Greek — auto-detect markets and show the right rate.",
        tag: "Global",
        chip: "EN · FR · EL",
      },
      {
        title: "Instagram & UGC gallery",
        description: "Live guest content on the homepage — social proof that feels authentic.",
        tag: "Social",
        chip: "@guest moments",
      },
      {
        title: "WhatsApp concierge",
        description: "One tap to message reception, arrange transfers or late checkout.",
        tag: "Service",
        chip: "Reply in 4 min",
      },
    ],
    highlights: [
      {
        label: "Private dining",
        title: "Sunset on the terrace",
        body: "Seasonal tasting menus, wine pairings and chef's table — bookable without leaving the site.",
        image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&q=80",
      },
      {
        label: "Experiences",
        title: "Boat days & hidden coves",
        body: "Curated excursions with instant enquiry — we integrate your partners or build custom checkout.",
        image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=900&q=80",
      },
    ],
    partnerHeadline: "Stop paying commission on guests who already love you",
    partnerSub:
      "Collectiv. Studio builds Mediterranean hotel sites that keep discovery, booking and upsells on your URL — with the calm, editorial feel your property deserves.",
    partnerBullets: [
      "OTA-light booking flows with deposit & balance rules",
      "Seasonal campaign landing pages in days, not months",
      "Photography-led design that sells the view before the price",
      "GDPR-ready analytics so you know which suite converts",
    ],
    ctaHeadline: "Let's build your hotel's direct-booking presence.",
    ctaSub: "Resort, villa or boutique — we design and integrate the stack you already use.",
    reviews: [
      { quote: "Our direct bookings rose 34% in the first season.", source: "Boutique hotel, Cyclades" },
      { quote: "Finally a site that feels like the property, not a template.", source: "Design hotel, Marbella" },
    ],
    amenities: [
      { key: "pool", label: "Infinity Pool" },
      { key: "dining", label: "Private Dining" },
      { key: "sun", label: "Sunset Terrace" },
      { key: "spa", label: "Spa & Hammam" },
      { key: "concierge", label: "24hr Concierge" },
      { key: "transport", label: "Airport Transfer" },
    ],
  },
  cotswolds: {
    navTitle: "The Great Escape",
    heroEyebrow: "THE COTSWOLDS · LAKE DISTRICT · CORNWALL",
    heroHeadline: "Far from the noise",
    heroSub: "Country house hotels — weddings, retreats and long weekends",
    heroImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1800&q=85",
    heroLayout: "editorial",
    bookingProperty: "Hayloft Manor",
    bookingFrom: "From £195 / night",
    introType: "editorial",
    introEditorialText:
      "There are places in England where time moves differently. Where log fires replace phone signals, where the view from the window is the only entertainment you need.",
    introEditorialImage: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80",
    interludeImage: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1800&q=80",
    roomsHeading: "Rooms & cottages",
    integrationsEyebrow: "Built for country house hotels",
    integrationsHeadline: "Weddings, vouchers and loyalty — without a clunky CMS",
    integrations: [
      {
        title: "Wedding & event enquiry CRM",
        description:
          "Multi-step forms, brochure downloads and automated follow-ups to your events team.",
        tag: "Events",
        chip: "Enquiry received",
      },
      {
        title: "Gift voucher shop",
        description: "Stripe-powered vouchers for stays, afternoon tea and spa — branded PDF delivery.",
        tag: "Gifting",
        chip: "£150 · Tea for two",
      },
      {
        title: "Dog-friendly packages",
        description: "Conditional pricing, pet policies and add-ons surfaced at checkout.",
        tag: "Packages",
        chip: "+ £25/night pup",
      },
      {
        title: "Local guide & walks",
        description: "Interactive maps, PDF downloads and partner pub recommendations — great for SEO.",
        tag: "Content",
        chip: "12 curated routes",
      },
      {
        title: "Review aggregation",
        description: "Google, TripAdvisor and AA badges — refreshed automatically, styled on-brand.",
        tag: "Trust",
        chip: "4.9 · 280 reviews",
      },
      {
        title: "Email & CRM journeys",
        description: "Klaviyo, Mailchimp or Resend — pre-arrival, post-stay and re-book prompts.",
        tag: "Retention",
        chip: "Automated series",
      },
    ],
    highlights: [
      {
        label: "Weddings",
        title: "Barns, gardens & long tables",
        body: "Capacity guides, preferred supplier lists and date-check forms — your coordinator gets qualified leads only.",
        image: "https://images.unsplash.com/photo-1519225421980-715df0219aed?w=900&q=80",
      },
      {
        label: "Afternoon tea",
        title: "A ritual worth booking",
        body: "Timed sittings, dietary flags and champagne upgrades — integrated with your F&B system or standalone.",
        image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=900&q=80",
      },
    ],
    partnerHeadline: "Your hotel deserves more than a Squarespace template",
    partnerSub:
      "We craft heritage-led sites that honour the building while making packages, events and vouchers easy to buy online.",
    partnerBullets: [
      "Accessible, fast pages — Core Web Vitals matter for Google Hotels",
      "Editorial layouts that flex for seasons and festivals",
      "Staff-friendly CMS training included",
      "One partner for brand, site, integrations and launch comms",
    ],
    ctaHeadline: "Your hotel, beautifully told online.",
    ctaSub: "Country house, inn or spa — we handle the tech so your team can host.",
    reviews: [
      {
        quote: "Wedding enquiries doubled — forms finally match our brand.",
        source: "Manor house, Gloucestershire",
      },
      { quote: "Gift vouchers alone paid for the project in eight weeks.", source: "Country hotel, Cornwall" },
    ],
    amenities: [
      { key: "fire", label: "Open Fires" },
      { key: "dining", label: "Country Dining" },
      { key: "grounds", label: "Estate Grounds" },
      { key: "spa", label: "Spa & Pool" },
      { key: "dog", label: "Dog Friendly" },
      { key: "tea", label: "Afternoon Tea" },
    ],
  },
  city: {
    navTitle: "The Urban Edit",
    heroEyebrow: "LONDON · PARIS · AMSTERDAM",
    heroHeadline: "the city, refined.",
    heroSub: "Design-led city hotels for guests who book direct",
    heroImage: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1800&q=85",
    heroLayout: "minimal",
    bookingProperty: "The Mercer",
    bookingFrom: "From £280 / night",
    introType: "statement",
    introStatement: "Not a room. A position.",
    interludeImage: "https://images.unsplash.com/photo-1519449556851-5720b33024e7?w=1800&q=80",
    roomsHeading: "Rooms & suites",
    integrationsEyebrow: "Urban hotel stack",
    integrationsHeadline: "Members, meta-search and mobile-first booking",
    integrations: [
      {
        title: "Member rates & login",
        description: "Gated pricing, loyalty tiers and saved preferences — Auth0, Clerk or custom.",
        tag: "Loyalty",
        chip: "Member −15%",
      },
      {
        title: "Google Hotels & meta parity",
        description: "Structured data, rate feeds and landing pages that match your best direct price.",
        tag: "Distribution",
        chip: "Price match",
      },
      {
        title: "Rooftop & bar reservations",
        description: "SevenRooms-style holds for your restaurant and members-only lounge.",
        tag: "F&B",
        chip: "Bar · 21:00",
      },
      {
        title: "Corporate & extended stay",
        description: "Rate codes, invoicing details and apartment-style inventory in one flow.",
        tag: "B2B",
        chip: "Corp portal",
      },
      {
        title: "Live chat & AI concierge",
        description: "Intercom, custom bot or WhatsApp — trained on your FAQs and neighbourhood guide.",
        tag: "Concierge",
        chip: "Ask anything",
      },
      {
        title: "Same-day & mobile checkout",
        description: "Apple Pay, express checkout and digital key instructions pushed by SMS.",
        tag: "Mobile",
        chip: "Check-in 14:00",
      },
    ],
    highlights: [
      {
        label: "Rooftop",
        title: "The skyline is the amenity",
        body: "Waitlist, dress code and bottle service deposits — sold through your site, not a third-party app.",
        image: "https://images.unsplash.com/photo-1566417713940-1776e860c2a8?w=900&q=80",
      },
      {
        label: "Culture",
        title: "Neighbourhood, curated",
        body: "Dynamic city guides, exhibition tie-ins and partner offers — updated by your team in minutes.",
        image: "https://images.unsplash.com/photo-1480796928339-efdecaede7ae?w=900&q=80",
      },
    ],
    partnerHeadline: "A hotel website that works as hard as the city",
    partnerSub:
      "Collectiv. Studio builds dark, confident city-hotel experiences with the integrations revenue teams actually need.",
    partnerBullets: [
      "Next.js performance for global mobile traffic",
      "A/B-ready hero and rate modules",
      "PMS + channel manager connectivity scoping included",
      "Launch support: email, social assets and staff training",
    ],
    ctaHeadline: "Ready for a site that matches your lobby?",
    ctaSub: "Boutique, design or lifestyle — we build direct revenue into the design.",
    reviews: [
      { quote: "Mobile booking completion up 41% after relaunch.", source: "Design hotel, Shoreditch" },
      { quote: "Members finally have a login that feels premium.", source: "City hotel, Amsterdam" },
    ],
    amenities: [
      { key: "bar", label: "Rooftop Bar" },
      { key: "cinema", label: "Private Cinema" },
      { key: "lounge", label: "Members Lounge" },
      { key: "dining", label: "In-Room Dining" },
      { key: "valet", label: "Valet Parking" },
      { key: "shop", label: "Personal Shopper" },
    ],
  },
};

export const PORTAL_CAPABILITIES = [
  "Direct booking engines",
  "PMS integrations",
  "Event & wedding CRM",
  "Gift vouchers",
  "Restaurant reservations",
  "Member portals",
  "Email automation",
  "SEO & analytics",
] as const;
