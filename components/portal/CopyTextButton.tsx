"use client";

import { useState } from "react";
import { ctaButtonClasses } from "@/components/ui/Button";

export function CopyTextButton({ text, label = "Copy link" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);

  return (
    <button
      type="button"
      className={ctaButtonClasses({ variant: "outline", size: "sm", className: "w-fit" })}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          window.setTimeout(() => setDone(false), 2000);
        } catch {
          setDone(false);
        }
      }}
    >
      {done ? "Copied" : label}
    </button>
  );
}
