/** Baseline FAQs (merged with `SiteFaq` from the database on the about page). */
export const siteFaqsStatic = [
  {
    q: "Who do you work with?",
    a: "Businesses across beauty, wellness, fashion, lifestyle and service-based industries - and founders who value strategic design, cohesive branding and showing up properly online.",
  },
  {
    q: "How do I get started?",
    a: "Enquire via the contact form. Discovery call. Proposal and contract. 50% deposit. Project begins.",
  },
  {
    q: "Do you offer payment plans?",
    a: "Yes. 50% upfront, 50% before launch. Larger builds can discuss extended plans.",
  },
  {
    q: "How much does it cost?",
    a: "Scoped individually. Tailored proposal after discovery call.",
  },
  {
    q: "Why should you work with us?",
    a: "We combine branding, web and social strategy for cohesive digital foundations. Not a template - a strategic build for long-term growth.",
  },
] as const;

export function faqMatchScore(question: string, faqQ: string): number {
  const words = question
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2);
  const fq = faqQ.toLowerCase();
  if (words.length === 0) return 0;
  return words.filter((w) => fq.includes(w)).length;
}
