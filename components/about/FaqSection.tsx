"use client";

import { useMemo, useState } from "react";
import { AccordionItem } from "@/components/ui/AccordionItem";
import { siteFaqsStatic } from "@/lib/site-faqs-static";

export type FaqSectionDynamicItem = { id: string; question: string; answer: string };

type Props = {
  /** Approved FAQs from the database (e.g. chat insight queue). */
  dynamicFaqs?: FaqSectionDynamicItem[];
};

export function FaqSection({ dynamicFaqs = [] }: Props) {
  const faqs = useMemo(() => {
    const base = siteFaqsStatic.map((f) => ({ key: `s-${f.q}`, q: f.q, a: f.a }));
    const extra = dynamicFaqs.map((f) => ({ key: f.id, q: f.question, a: f.answer }));
    return [...base, ...extra];
  }, [dynamicFaqs]);

  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="accordion-root mx-auto max-w-3xl">
      {faqs.map((item, i) => (
        <AccordionItem
          key={item.key}
          title={item.q}
          open={openIndex === i}
          onToggle={() => setOpenIndex((prev) => (prev === i ? -1 : i))}
        >
          {item.a}
        </AccordionItem>
      ))}
    </div>
  );
}
