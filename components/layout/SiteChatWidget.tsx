"use client";

import { useCallback, useId, useRef, useState } from "react";
import { EmojiPickerButton } from "@/components/ui/EmojiPickerButton";
import Link from "next/link";

export function SiteChatWidget() {
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([
    {
      role: "assistant",
      text: "Hi — ask a quick question about how we work, timelines, or the client portal. For quotes and contracts, the contact form is best.",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  const scrollToEnd = useCallback(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  async function send() {
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text: trimmed }]);
    setLoading(true);
    try {
      const res = await fetch("/api/site-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });
      const data = (await res.json()) as { reply?: string; error?: string };
      const reply =
        data.reply ||
        (data.error ? "Something went wrong — try again or use the contact form." : "No reply yet.");
      setMessages((m) => [...m, { role: "assistant", text: reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: "Couldn’t reach the assistant. Please use the contact form." },
      ]);
    } finally {
      setLoading(false);
      setTimeout(scrollToEnd, 50);
    }
  }

  return (
    <div className="pointer-events-none fixed bottom-6 right-5 z-[100] flex max-w-[calc(100vw-1.25rem)] flex-col items-end md:bottom-8 md:right-8">
      <div
        className={`pointer-events-auto flex max-h-[min(70dvh,28rem)] w-[min(100vw-2rem,22rem)] flex-col overflow-hidden rounded-cc-card border border-burgundy/18 bg-cream shadow-nav transition-all duration-200 ${
          open ? "opacity-100 translate-y-0" : "pointer-events-none h-0 opacity-0 translate-y-3"
        }`}
        id={panelId}
        role="dialog"
        aria-modal={open ? true : undefined}
        aria-labelledby="site-chat-dialog-title"
        hidden={!open}
      >
        <div className="border-b border-burgundy/10 bg-burgundy/[0.06] px-4 py-4">
          <p
            id="site-chat-dialog-title"
            className="font-display text-lg leading-tight tracking-[-0.03em] text-burgundy sm:text-xl"
          >
            Quick questions
          </p>
          <p className="mt-1.5 font-body text-[10px] uppercase tracking-[0.08em] text-burgundy/50 sm:text-[11px]">
            AI + FAQs · not for formal quotes
          </p>
        </div>
        <div className="max-h-[min(52dvh,20rem)] space-y-3 overflow-y-auto px-3 py-3">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`rounded-cc-card px-3 py-2 font-body text-[13px] leading-relaxed ${
                m.role === "user"
                  ? "ml-4 bg-burgundy text-cream"
                  : "mr-2 border border-burgundy/10 bg-white text-burgundy/90"
              }`}
            >
              {m.text}
            </div>
          ))}
          {loading ? (
            <div className="mr-2 rounded-cc-card border border-burgundy/10 bg-white px-3 py-2 font-body text-[13px] text-burgundy/55">
              …
            </div>
          ) : null}
          <div ref={endRef} />
        </div>
        <div className="border-t border-burgundy/10 p-3">
          <div className="flex gap-2">
            <div className="relative min-w-0 flex-1">
              <div className="absolute right-1.5 top-1/2 z-10 -translate-y-1/2">
                <EmojiPickerButton
                  inputRef={chatInputRef}
                  openAbove
                  controlled={{ value: input, setValue: setInput }}
                  size="md"
                />
              </div>
              <input
                ref={chatInputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void send();
                }}
                placeholder="Type a question…"
                className="w-full rounded-cc-card border border-burgundy/15 bg-white py-2 pl-3 pr-11 font-body text-sm text-burgundy outline-none ring-burgundy/20 focus:ring-2"
                maxLength={2000}
                disabled={loading}
                aria-label="Your question"
              />
            </div>
            <button
              type="button"
              onClick={() => void send()}
              disabled={loading || !input.trim()}
              className="shrink-0 rounded-cc-card bg-burgundy px-3 py-2 font-body text-[11px] uppercase tracking-[0.1em] text-cream transition-opacity disabled:opacity-40"
            >
              Send
            </button>
          </div>
          <p className="mt-2 font-body text-[10px] leading-snug text-burgundy/45">
            Need the team?{" "}
            <Link href="/contactus" className="text-burgundy underline-offset-2 hover:underline">
              Contact form
            </Link>
          </p>
        </div>
      </div>

      <button
        type="button"
        className="pointer-events-auto mt-3 flex h-11 w-11 items-center justify-center rounded-full border border-solid border-burgundy bg-cream text-burgundy shadow-[0_6px_20px_rgba(37,13,24,0.12)] transition-[transform,box-shadow] duration-200 ease-smooth hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(37,13,24,0.14)] active:scale-[0.98] md:h-12 md:w-12"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Close quick questions" : "Open quick questions chat"}
      >
        {open ? (
          <svg viewBox="0 0 24 24" className="h-5 w-5 md:h-[1.35rem] md:w-[1.35rem]" fill="none" aria-hidden>
            <path
              d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
              fill="currentColor"
            />
          </svg>
        ) : (
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5 md:h-[1.35rem] md:w-[1.35rem]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
          >
            <path
              d="M12 18l-4 2v-2.5H7a3 3 0 01-3-3V8a3 3 0 013-3h10a3 3 0 013 3v6.5a3 3 0 01-3 3h-2v2.5z"
              stroke="currentColor"
              strokeWidth="1.35"
              strokeLinejoin="round"
            />
            <path
              d="M8.5 10h7M8.5 13h4"
              stroke="currentColor"
              strokeWidth="1.35"
              strokeLinecap="round"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
