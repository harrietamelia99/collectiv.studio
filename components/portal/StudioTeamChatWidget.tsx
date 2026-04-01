"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { EmojiPickerButton } from "@/components/ui/EmojiPickerButton";
import { formatUkTeamChatTimestamp } from "@/lib/uk-datetime";

type MentionCandidateDto = {
  handle: string;
  label: string;
};

/** Caret is immediately after an @ token (no spaces inside the token). */
function activeMentionAtCaret(text: string, caret: number): { atIndex: number; query: string } | null {
  if (caret < 1) return null;
  const before = text.slice(0, caret);
  const at = before.lastIndexOf("@");
  if (at === -1) return null;
  const afterAt = before.slice(at + 1);
  if (!/^[\w.-]*$/.test(afterAt)) return null;
  if (at > 0) {
    const prev = before[at - 1];
    if (prev && !/\s/.test(prev)) return null;
  }
  return { atIndex: at, query: afterAt };
}

function filterMentionCandidates(candidates: MentionCandidateDto[], query: string): MentionCandidateDto[] {
  const q = query.toLowerCase();
  if (!q) return candidates;
  return candidates.filter(
    (c) => c.handle.toLowerCase().startsWith(q) || c.label.toLowerCase().includes(q),
  );
}

type ChatMessageDto = {
  id: string;
  body: string;
  createdAt: string;
  authorUserId: string;
  authorName: string;
  authorPhotoUrl: string | null;
  authorInitials: string;
};

function formatChatBody(body: string, bubble: "self" | "other"): ReactNode {
  const mentionClass =
    bubble === "self"
      ? "rounded bg-cream/25 px-1 font-body text-[12px] font-semibold text-cream"
      : "rounded bg-burgundy/15 px-1 font-body text-[12px] font-semibold text-burgundy";
  const parts = body.split(/(@[\w.-]+)/gi);
  return parts.map((part, i) =>
    /^@[\w.-]+$/i.test(part) ? (
      <span key={i} className={mentionClass}>
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

export function StudioTeamChatWidget() {
  const panelId = useId();
  const listboxId = useId();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessageDto[]>([]);
  const [mentionCandidates, setMentionCandidates] = useState<MentionCandidateDto[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [mentionActive, setMentionActive] = useState<{ atIndex: number; query: string } | null>(null);
  const [mentionMenuDismissed, setMentionMenuDismissed] = useState(false);
  const [mentionHighlight, setMentionHighlight] = useState(0);
  const endRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const mentionListRef = useRef<HTMLUListElement>(null);

  const scrollToEnd = useCallback(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const syncMentionFromField = useCallback((value: string, caret: number) => {
    setMentionActive(activeMentionAtCaret(value, caret));
  }, []);

  const refreshMessages = useCallback(async () => {
    const res = await fetch("/api/portal/studio-team-chat", { method: "GET", cache: "no-store" });
    if (!res.ok) return;
    const data = (await res.json()) as {
      messages?: ChatMessageDto[];
      currentUserId?: string;
      mentionCandidates?: MentionCandidateDto[];
    };
    if (Array.isArray(data.messages)) {
      setMessages(data.messages);
    }
    if (typeof data.currentUserId === "string") {
      setCurrentUserId(data.currentUserId);
    }
    if (Array.isArray(data.mentionCandidates)) {
      setMentionCandidates(data.mentionCandidates);
    }
    setTimeout(scrollToEnd, 50);
  }, [scrollToEnd]);

  const mentionKey = mentionActive ? `${mentionActive.atIndex}:${mentionActive.query}` : "";

  useEffect(() => {
    setMentionHighlight(0);
    setMentionMenuDismissed(false);
  }, [mentionKey]);

  const filteredMentions = useMemo(() => {
    if (!mentionActive || mentionMenuDismissed || mentionCandidates.length === 0) {
      return [];
    }
    return filterMentionCandidates(mentionCandidates, mentionActive.query);
  }, [mentionActive, mentionMenuDismissed, mentionCandidates]);

  const showMentionMenu =
    Boolean(mentionActive) && !mentionMenuDismissed && mentionCandidates.length > 0;

  useEffect(() => {
    if (filteredMentions.length === 0) return;
    setMentionHighlight((h) => Math.min(h, filteredMentions.length - 1));
  }, [filteredMentions.length]);

  const insertMention = useCallback(
    (handle: string) => {
      if (!mentionActive) return;
      const { atIndex, query } = mentionActive;
      const end = atIndex + 1 + query.length;
      const next = `${input.slice(0, atIndex)}@${handle} ${input.slice(end)}`;
      setInput(next);
      setMentionActive(null);
      setMentionMenuDismissed(false);
      const pos = atIndex + handle.length + 2;
      requestAnimationFrame(() => {
        const el = bodyRef.current;
        if (!el) return;
        el.focus();
        el.setSelectionRange(pos, pos);
      });
    },
    [mentionActive, input],
  );

  useEffect(() => {
    if (!showMentionMenu || !mentionActive) return;
    const onDoc = (ev: MouseEvent) => {
      const t = ev.target as Node;
      if (bodyRef.current?.contains(t)) return;
      if (mentionListRef.current?.contains(t)) return;
      setMentionMenuDismissed(true);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [showMentionMenu, mentionActive]);

  useEffect(() => {
    const fromHash = () => {
      if (typeof window === "undefined") return;
      if (window.location.hash === "#studio-team-chat") {
        setOpen(true);
      }
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  useEffect(() => {
    if (!open) return;
    void refreshMessages();
  }, [open, refreshMessages]);

  async function send() {
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    setSendError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/portal/studio-team-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: trimmed }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setSendError(data.error ?? "Couldn’t send message. Try again.");
        return;
      }
      setInput("");
      await refreshMessages();
    } catch {
      setSendError("Couldn’t send message. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pointer-events-none fixed bottom-6 left-5 z-[100] flex max-w-[calc(100vw-1.25rem)] flex-col items-start md:bottom-8 md:left-8">
      <div
        className={`pointer-events-auto flex max-h-[min(70dvh,28rem)] w-[min(100vw-2rem,22rem)] flex-col overflow-hidden rounded-cc-card border border-burgundy/18 bg-cream shadow-nav transition-all duration-200 ${
          open ? "opacity-100 translate-y-0" : "pointer-events-none h-0 opacity-0 translate-y-3"
        }`}
        id={panelId}
        role="dialog"
        aria-modal={open ? true : undefined}
        aria-labelledby="studio-team-chat-widget-title"
        hidden={!open}
      >
        <div className="border-b border-burgundy/10 bg-burgundy/[0.06] px-4 py-4">
          <p
            id="studio-team-chat-widget-title"
            className="font-display text-lg leading-tight tracking-[-0.03em] text-burgundy sm:text-xl"
          >
            Team chat
          </p>
          <p className="mt-1.5 font-body text-[10px] uppercase tracking-[0.08em] text-burgundy/50 sm:text-[11px]">
            Studio-only · @mention tags an email
          </p>
        </div>
        <div className="max-h-[min(52dvh,20rem)] space-y-3 overflow-y-auto px-3 py-3" role="log" aria-label="Team chat messages">
          {messages.length === 0 ? (
            <p className="px-1 font-body text-[13px] leading-relaxed text-burgundy/55">
              Say hi — first message starts the thread.
            </p>
          ) : (
            messages.map((msg) => {
              const isSelf = currentUserId != null && msg.authorUserId === currentUserId;
              const time = formatUkTeamChatTimestamp(msg.createdAt);
              return (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${isSelf ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div className="shrink-0 pt-0.5">
                    {msg.authorPhotoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element -- user-supplied or site headshot path
                      <img
                        src={msg.authorPhotoUrl}
                        alt=""
                        width={36}
                        height={36}
                        className="h-9 w-9 rounded-full object-cover object-top ring-1 ring-burgundy/15"
                      />
                    ) : (
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 font-display text-[11px] font-semibold tracking-[-0.02em] text-burgundy ring-1 ring-burgundy/15"
                        aria-hidden
                      >
                        {msg.authorInitials}
                      </div>
                    )}
                  </div>
                  <div className={`flex min-w-0 flex-1 flex-col gap-1 ${isSelf ? "items-end" : "items-start"}`}>
                    <span className="font-body text-[10px] uppercase tracking-[0.08em] text-burgundy/45">
                      {isSelf ? "You" : msg.authorName} · {time}
                    </span>
                    <div
                      className={`max-w-[min(100%,16rem)] rounded-cc-card px-3 py-2 font-body text-[13px] leading-relaxed sm:max-w-[min(100%,18rem)] ${
                        isSelf
                          ? "bg-burgundy text-cream"
                          : "border border-burgundy/10 bg-white text-burgundy/90"
                      }`}
                    >
                      <span className="whitespace-pre-wrap break-words">
                        {formatChatBody(msg.body, isSelf ? "self" : "other")}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={endRef} />
        </div>
        <div className="border-t border-burgundy/10 p-3">
          {sendError ? (
            <p className="mb-2 font-body text-[11px] text-red-700" role="alert">
              {sendError}
            </p>
          ) : null}
          <div className="flex gap-2">
            <div className="relative min-w-0 flex-1">
              {showMentionMenu ? (
                <ul
                  ref={mentionListRef}
                  id={listboxId}
                  role="listbox"
                  aria-label="Mention teammate"
                  className="absolute bottom-full left-0 z-[60] mb-1 max-h-40 w-full overflow-y-auto rounded-xl border border-burgundy/15 bg-white py-1 shadow-lg"
                >
                  {filteredMentions.length === 0 ? (
                    <li className="px-3 py-2 font-body text-[12px] text-burgundy/50" role="presentation">
                      No teammate matches
                    </li>
                  ) : (
                    filteredMentions.map((c, i) => (
                      <li key={`${c.handle}-${c.label}`} role="presentation">
                        <button
                          type="button"
                          role="option"
                          aria-selected={i === mentionHighlight}
                          id={`${listboxId}-opt-${i}`}
                          className={`flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left font-body text-sm transition-colors ${
                            i === mentionHighlight ? "bg-burgundy/[0.08] text-burgundy" : "text-burgundy/90"
                          }`}
                          onMouseDown={(ev) => {
                            ev.preventDefault();
                            insertMention(c.handle);
                          }}
                          onMouseEnter={() => setMentionHighlight(i)}
                        >
                          <span className="font-semibold">@{c.handle}</span>
                          <span className="text-[11px] text-burgundy/55">{c.label}</span>
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              ) : null}
              <div className="absolute right-1.5 top-2 z-10">
                <EmojiPickerButton
                  inputRef={bodyRef}
                  openAbove
                  controlled={{
                    value: input,
                    setValue: (next) => {
                      setInput(next);
                      queueMicrotask(() => {
                        const el = bodyRef.current;
                        if (el) syncMentionFromField(next, el.selectionStart ?? next.length);
                      });
                    },
                  }}
                  size="md"
                />
              </div>
              <label htmlFor="studio-team-chat-widget-body" className="sr-only">
                Team chat message
              </label>
              <textarea
                ref={bodyRef}
                id="studio-team-chat-widget-body"
                value={input}
                aria-expanded={showMentionMenu}
                aria-controls={showMentionMenu ? listboxId : undefined}
                aria-activedescendant={
                  showMentionMenu && filteredMentions.length > 0
                    ? `${listboxId}-opt-${mentionHighlight}`
                    : undefined
                }
                autoComplete="off"
                onChange={(e) => {
                  const v = e.target.value;
                  const caret = e.target.selectionStart ?? v.length;
                  setInput(v);
                  syncMentionFromField(v, caret);
                }}
                onSelect={(e) => {
                  const t = e.currentTarget;
                  syncMentionFromField(t.value, t.selectionStart ?? t.value.length);
                }}
                onKeyDown={(e) => {
                  if (
                    showMentionMenu &&
                    filteredMentions.length > 0 &&
                    (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === "Tab")
                  ) {
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setMentionHighlight((h) => Math.min(h + 1, filteredMentions.length - 1));
                      return;
                    }
                    if (e.key === "ArrowUp") {
                      e.preventDefault();
                      setMentionHighlight((h) => Math.max(h - 1, 0));
                      return;
                    }
                    if (e.key === "Enter" || e.key === "Tab") {
                      e.preventDefault();
                      const pick = filteredMentions[mentionHighlight];
                      if (pick) insertMention(pick.handle);
                      return;
                    }
                  }
                  if (e.key === "Escape" && mentionActive && !mentionMenuDismissed) {
                    e.preventDefault();
                    setMentionMenuDismissed(true);
                    return;
                  }
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send();
                  }
                }}
                rows={2}
                maxLength={4000}
                placeholder="Type a message… @Issy @Harriet @May"
                disabled={loading}
                className="min-h-[2.75rem] w-full resize-y rounded-cc-card border border-burgundy/15 bg-white py-2 pl-3 pr-11 font-body text-sm text-burgundy outline-none ring-burgundy/20 placeholder:text-burgundy/45 focus:ring-2 disabled:opacity-60"
              />
            </div>
            <button
              type="button"
              onClick={() => void send()}
              disabled={loading || !input.trim()}
              className="h-fit shrink-0 self-end rounded-cc-card bg-burgundy px-3 py-2 font-body text-[11px] uppercase tracking-[0.1em] text-cream transition-opacity disabled:opacity-40"
            >
              Send
            </button>
          </div>
          <p className="mt-2 font-body text-[10px] leading-snug text-burgundy/45">
            Client threads and alerts live in{" "}
            <Link href="/portal#studio-notifications" className="text-burgundy underline-offset-2 hover:underline">
              Inbox
            </Link>
            .
          </p>
        </div>
      </div>

      <button
        type="button"
        className="pointer-events-auto mt-3 flex h-11 w-11 items-center justify-center rounded-full border border-solid border-burgundy bg-cream text-burgundy shadow-[0_6px_20px_rgba(37,13,24,0.12)] transition-[transform,box-shadow] duration-200 ease-smooth hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(37,13,24,0.14)] active:scale-[0.98] md:h-12 md:w-12"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Close team chat" : "Open team chat"}
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
