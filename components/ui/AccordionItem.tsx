"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useId } from "react";

type Props = {
  title: string;
  children: React.ReactNode;
  open: boolean;
  onToggle: () => void;
};

export function AccordionItem({ title, children, open, onToggle }: Props) {
  const id = useId();
  return (
    <div className="border-b-cc border-solid border-[var(--cc-border)]">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={id}
        className="cc-no-lift accordion-root flex w-full items-center justify-between gap-4 rounded-none py-5 text-left transition-colors duration-200 hover:bg-burgundy/[0.03]"
      >
        <span className="cc-no-heading-hover font-display text-xl font-medium tracking-tight text-burgundy">
          {title}
        </span>
        <span className="font-body text-xl font-normal text-burgundy" aria-hidden>
          {open ? "−" : "+"}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            id={id}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="accordion-root pb-5 font-body font-normal leading-[1.7] text-burgundy">
              {children}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
