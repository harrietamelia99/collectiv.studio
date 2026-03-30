export type PackageAccordionList = {
  kind: "list";
  title: string;
  items: string[];
};

export type PackageAccordionFaq = {
  kind: "faq";
  title: string;
  pairs: { q: string; a: string }[];
};

export type PackageAccordionBlock = PackageAccordionList | PackageAccordionFaq;

export type WebsiteDesignPackage = {
  index: string;
  name: string;
  timeline: string;
  description: string;
  blocks: PackageAccordionBlock[];
};

export const websiteDesignPackages: WebsiteDesignPackage[] = [
  {
    index: "01",
    name: "The Launch Page",
    timeline: "1–2 weeks",
    description:
      "A strategically built single-page website designed for clarity and impact. Ideal for launches, new businesses or service providers who need a high-converting online presence without the complexity of a full site.",
    blocks: [
      {
        kind: "list",
        title: "Included",
        items: [
          "Custom one-page design",
          "Responsive mobile layout",
          "Clear call-to-action structure",
          "Enquiry form integration",
          "Basic SEO setup",
          "Domain connection support",
          "Two refinement rounds",
          "Launch support",
        ],
      },
      {
        kind: "list",
        title: "Not included",
        items: [
          "Multiple service pages",
          "Advanced integrations",
          "E-commerce functionality",
          "Copywriting (unless added)",
          "Booking systems",
          "Monthly Hosting Fee",
        ],
      },
      {
        kind: "list",
        title: "Add-ons",
        items: [
          "Fast track (one-day turnaround, subject to availability)",
          "Copywriting",
          "Additional sections",
          "Blog setup",
          "Email marketing integration",
          "Basic branding add-on",
        ],
      },
      {
        kind: "faq",
        title: "FAQs",
        pairs: [
          {
            q: "Is one page enough?",
            a: "Yes - if your offer is focused and clear. Simplicity often converts better.",
          },
          {
            q: "Can I upgrade later?",
            a: "Absolutely. Your site can be expanded as your business grows.",
          },
        ],
      },
    ],
  },
  {
    index: "02",
    name: "The Essential Build",
    timeline: "2–3 weeks",
    description:
      "A clean, professional website for service-based businesses ready to establish a strong online presence. Perfect for brands needing a clear structure without overcomplication.",
    blocks: [
      {
        kind: "list",
        title: "Included",
        items: [
          "Up to 4 pages (Home, About, Services, Contact)",
          "Custom layout design",
          "Mobile optimisation",
          "Basic on-page SEO",
          "Enquiry form setup",
          "Domain connection",
          "Two refinement rounds",
          "Launch support",
        ],
      },
      {
        kind: "list",
        title: "Not included",
        items: [
          "Advanced booking systems",
          "E-commerce functionality",
          "Complex integrations",
          "Copywriting (unless added)",
          "Membership areas",
          "Monthly Hosting Fee",
        ],
      },
      {
        kind: "list",
        title: "Add-ons",
        items: [
          "Fast track (one-week turnaround, subject to availability)",
          "Additional pages",
          "Blog setup",
          "Basic SEO upgrade",
          "Brand identity add-on",
          "Email marketing integration",
        ],
      },
      {
        kind: "faq",
        title: "FAQs",
        pairs: [
          {
            q: "Is this suitable for new businesses?",
            a: "Yes - it’s ideal for service-led startups and growing brands.",
          },
          {
            q: "Do I need to provide copy?",
            a: "Yes - unless you add copywriting support.",
          },
        ],
      },
    ],
  },
  {
    index: "03",
    name: "The Elevate Build",
    timeline: "3–4 weeks",
    description:
      "A more flexible site build for brands needing additional space to showcase services, testimonials or galleries. Designed for businesses growing beyond a simple 3–4 page structure.",
    blocks: [
      {
        kind: "list",
        title: "Included",
        items: [
          "Up to 5 pages",
          "Custom design & layout",
          "Mobile optimisation",
          "Basic SEO setup",
          "Gallery or testimonial section",
          "Contact form integration",
          "Two refinement rounds",
          "Launch support",
        ],
      },
      {
        kind: "list",
        title: "Not included",
        items: [
          "Advanced automation systems",
          "Membership builds",
          "E-commerce beyond light setup",
          "Copywriting (unless added)",
          "Monthly Hosting Fee",
        ],
      },
      {
        kind: "list",
        title: "Add-ons",
        items: [
          "Additional service pages",
          "E-commerce functionality",
          "Advanced SEO",
          "Blog integration",
          "Booking systems",
          "Brand refresh",
          "Extended brand guidelines (20–30 page document)",
        ],
      },
      {
        kind: "faq",
        title: "FAQs",
        pairs: [
          {
            q: "Who is this best for?",
            a: "Growing brands that need more flexibility and depth.",
          },
          {
            q: "Can I expand further later?",
            a: "Yes - the structure allows for future scalability.",
          },
        ],
      },
    ],
  },
  {
    index: "04",
    name: "The Signature Site",
    timeline: "4–6 weeks",
    description:
      "A comprehensive website build for established or scaling brands ready for a more detailed digital presence. Built strategically with room for expansion, storytelling and conversion.",
    blocks: [
      {
        kind: "list",
        title: "Included",
        items: [
          "5–7 custom-designed pages",
          "Advanced layout structure",
          "Mobile optimisation",
          "SEO foundation",
          "Gallery, testimonials or portfolio integration",
          "Enquiry or booking forms",
          "Two refinement rounds",
          "Launch support",
        ],
      },
      {
        kind: "list",
        title: "Not included",
        items: [
          "Complex third-party integrations",
          "Custom-coded functionality",
          "Full e-commerce catalogue builds",
          "Advanced marketing automation",
          "Monthly Hosting Fee",
        ],
      },
      {
        kind: "list",
        title: "Add-ons",
        items: [
          "E-commerce integration",
          "Booking systems",
          "Email marketing flows",
          "Advanced SEO strategy",
          "Copywriting",
          "Ongoing maintenance",
        ],
      },
      {
        kind: "faq",
        title: "FAQs",
        pairs: [
          {
            q: "Is this suitable for product brands?",
            a: "Yes - especially those wanting a strong brand-led structure.",
          },
          {
            q: "How involved do I need to be?",
            a: "You’ll provide content and feedback at key stages.",
          },
        ],
      },
    ],
  },
  {
    index: "05",
    name: "The Expansion Build",
    timeline: "6+ weeks",
    description:
      "For larger builds, advanced functionality or brands requiring booking systems, integrations or technical infrastructure. This is where strategy meets structure.",
    blocks: [
      {
        kind: "list",
        title: "Included",
        items: [
          "7+ pages",
          "Custom design & layout",
          "Mobile optimisation",
          "Booking systems or advanced forms",
          "Third-party integrations",
          "SEO foundation",
          "Launch support",
          "Structured project management",
        ],
      },
      {
        kind: "list",
        title: "Not included",
        items: [
          "Ongoing marketing retainers",
          "Paid ads management",
          "Large-scale custom development beyond agreed scope",
          "Monthly Hosting Fee",
        ],
      },
      {
        kind: "list",
        title: "Add-ons",
        items: [
          "E-commerce catalogue build",
          "Membership areas",
          "CRM integrations",
          "Advanced automation systems",
          "Ongoing optimisation retainer",
        ],
      },
      {
        kind: "faq",
        title: "FAQs",
        pairs: [
          {
            q: "Is this suitable for larger teams?",
            a: "Yes - this package is built for scale.",
          },
          {
            q: "Do you handle complex integrations?",
            a: "Yes - subject to platform capability and agreed scope.",
          },
        ],
      },
    ],
  },
];
