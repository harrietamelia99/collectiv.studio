"use client";

import { useRef, type ComponentProps } from "react";
import { EmojiPickerButton } from "@/components/ui/EmojiPickerButton";

/** Server-action–friendly textarea with an emoji control (uncontrolled). */
export function TextareaWithEmojiField({
  className = "",
  ...props
}: Omit<ComponentProps<"textarea">, "ref">) {
  const ref = useRef<HTMLTextAreaElement>(null);
  return (
    <div className="relative">
      <div className="absolute right-2 top-2 z-10">
        <EmojiPickerButton inputRef={ref} size="md" />
      </div>
      <textarea ref={ref} {...props} className={`${className} pr-11`} />
    </div>
  );
}
