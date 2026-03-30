"use client";

import { useCallback, useEffect, useId, useRef, useState, type RefObject } from "react";
import { Smile } from "lucide-react";
import { EMOJI_GROUPS } from "@/lib/emoji-picker-data";
import { insertAtCaret } from "@/lib/text-field-insert-emoji";

type Controlled = { value: string; setValue: (next: string) => void };

type Props = {
  /** Field to insert into (textarea or single-line input). */
  inputRef: RefObject<HTMLTextAreaElement | HTMLInputElement | null>;
  /** When the parent uses `value` + `onChange`, pass these so the caret and value stay in sync. */
  controlled?: Controlled;
  /** Extra classes for the toggle button (e.g. positioning). */
  className?: string;
  /** Visual size of the icon button. */
  size?: "sm" | "md";
};

export function EmojiPickerButton({ inputRef, controlled, className = "", size = "sm" }: Props) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState(0);
  const panelId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  const pick = useCallback(
    (emoji: string) => {
      insertAtCaret(inputRef, emoji, controlled);
      close();
    },
    [inputRef, controlled, close],
  );

  const iconClass = size === "md" ? "h-5 w-5" : "h-4 w-4";
  const btnPad = size === "md" ? "p-2" : "p-1.5";

  return (
    <div ref={wrapRef} className={`relative inline-flex ${className}`}>
      <button
        type="button"
        className={`rounded-lg border border-burgundy/15 bg-white text-burgundy/70 shadow-sm transition-colors hover:border-burgundy/25 hover:bg-burgundy/[0.04] hover:text-burgundy ${btnPad}`}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-haspopup="dialog"
        aria-label="Insert emoji"
        onClick={() => setOpen((o) => !o)}
      >
        <Smile className={iconClass} strokeWidth={1.75} aria-hidden />
      </button>
      {open ? (
        <div
          id={panelId}
          role="dialog"
          aria-label="Emoji picker"
          className="absolute right-0 top-full z-[80] mt-1 w-[min(100vw-1.5rem,18rem)] rounded-xl border border-burgundy/15 bg-white p-2 shadow-lg"
        >
          <div className="flex gap-1 overflow-x-auto border-b border-burgundy/10 pb-2">
            {EMOJI_GROUPS.map((g, i) => (
              <button
                key={g.id}
                type="button"
                className={`shrink-0 rounded-md px-2 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.06em] ${
                  i === tab ? "bg-burgundy text-cream" : "text-burgundy/55 hover:bg-burgundy/[0.06]"
                }`}
                onClick={() => setTab(i)}
              >
                {g.label}
              </button>
            ))}
          </div>
          <div className="max-h-48 overflow-y-auto pt-2">
            <div className="grid grid-cols-8 gap-1">
              {EMOJI_GROUPS[tab]?.emojis.map((emoji, idx) => (
                <button
                  key={`${EMOJI_GROUPS[tab]!.id}-${idx}`}
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-lg leading-none hover:bg-burgundy/[0.08]"
                  onClick={() => pick(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
