"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { addCalendarPost, addCalendarPostFromStudioMasterCalendar } from "@/app/portal/actions";
import { SocialPlatformIcon } from "@/components/portal/SocialPlatformIcon";
import { CALENDAR_CHANNEL_OPTIONS } from "@/lib/calendar-channels";
import { parseHashtagTokens } from "@/lib/social-calendar-hashtags";
import { ctaButtonClasses } from "@/components/ui/Button";
import { EmojiPickerButton } from "@/components/ui/EmojiPickerButton";
import { Upload, X } from "lucide-react";

const CHANNEL_UI_ORDER = ["instagram", "tiktok", "facebook", "linkedin"] as const;

const ACCEPT_CREATIVE =
  "image/jpeg,image/png,image/webp,video/mp4,video/quicktime,.jpg,.jpeg,.png,.webp,.mp4,.mov";

type Props = {
  /** Single-project social calendar — redirects to that project’s calendar after save. */
  projectId?: string;
  /** Shown when adding from a project workspace (post always saves to this client). */
  assignedProjectName?: string;
  /** Studio master calendar — pick which client/project; refreshes aggregate view after save. */
  projectChoices?: { id: string; name: string }[];
  /** Value for `datetime-local` input (YYYY-MM-DDTHH:mm, local). */
  defaultScheduledLocal: string;
  onClose: () => void;
};

function isLocalCreativeVideoFileName(name: string): boolean {
  return /\.(mp4|mov|webm|m4v)$/i.test(name);
}

function orderedChannelOptions() {
  const map = new Map(CALENDAR_CHANNEL_OPTIONS.map((c) => [c.id, c]));
  const out: (typeof CALENDAR_CHANNEL_OPTIONS)[number][] = [];
  for (const id of CHANNEL_UI_ORDER) {
    const row = map.get(id);
    if (row) out.push(row);
  }
  for (const c of CALENDAR_CHANNEL_OPTIONS) {
    if (!out.includes(c)) out.push(c);
  }
  return out;
}

/** Split `YYYY-MM-DDTHH:mm` for separate `date` / `time` inputs (smaller native pickers, avoids modal clipping). */
function splitScheduledLocal(v: string): { date: string; time: string } {
  const trimmed = v.trim();
  const [datePart, rest] = trimmed.split("T");
  const timePart = rest ? rest.slice(0, 5) : "";
  const dateOk = datePart && /^\d{4}-\d{2}-\d{2}$/.test(datePart) ? datePart : "";
  const timeOk = timePart && /^\d{2}:\d{2}$/.test(timePart) ? timePart : "12:00";
  return { date: dateOk, time: timeOk };
}

const scheduleInputClass =
  "min-h-[44px] w-full rounded-cc-card border border-burgundy/15 bg-white px-4 py-3 font-body text-sm text-burgundy outline-none ring-burgundy/20 focus:ring-2";

export function SocialCalendarAddPostModal({
  projectId,
  assignedProjectName,
  projectChoices,
  defaultScheduledLocal,
  onClose,
}: Props) {
  const router = useRouter();
  const masterMode = Boolean(projectChoices && projectChoices.length > 0);
  const ready = masterMode || Boolean(projectId);

  const [caption, setCaption] = useState("");
  const [hashtagTags, setHashtagTags] = useState<string[]>([]);
  const [hashtagDraft, setHashtagDraft] = useState("");
  const [channels, setChannels] = useState<string[]>(["instagram"]);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [submitIntent, setSubmitIntent] = useState<"draft" | "submit" | null>(null);
  const [scheduledDate, setScheduledDate] = useState(() => splitScheduledLocal(defaultScheduledLocal).date);
  const [scheduledTime, setScheduledTime] = useState(() => splitScheduledLocal(defaultScheduledLocal).time);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const captionRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const s = splitScheduledLocal(defaultScheduledLocal);
    setScheduledDate(s.date);
    setScheduledTime(s.time);
  }, [defaultScheduledLocal]);

  const revokePreview = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  }, [previewUrl]);

  const applyFile = useCallback(
    (f: File | null) => {
      revokePreview();
      setFile(f);
      setError(null);
      if (f && f.size > 0) {
        setPreviewUrl(URL.createObjectURL(f));
      }
    },
    [revokePreview],
  );

  useEffect(() => {
    if (!ready) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [ready, onClose]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const toggleChannel = (id: string) => {
    setChannels((prev) => {
      const set = new Set(prev);
      if (set.has(id)) {
        set.delete(id);
        if (set.size === 0) return ["instagram"];
        return Array.from(set);
      }
      set.add(id);
      return Array.from(set);
    });
  };

  const addHashtagsFromDraft = () => {
    const next = parseHashtagTokens(hashtagDraft);
    if (next.length === 0) return;
    setHashtagTags((prev) => {
      const seen = new Set(prev.map((t) => t.toLowerCase()));
      const merged = [...prev];
      for (const t of next) {
        const k = t.toLowerCase();
        if (seen.has(k)) continue;
        seen.add(k);
        merged.push(t);
      }
      return merged;
    });
    setHashtagDraft("");
  };

  const removeTag = (tag: string) => {
    setHashtagTags((prev) => prev.filter((t) => t !== tag));
  };

  const hashtagsHiddenValue = hashtagTags.join(" ");

  const validateBeforeSubmit = (intent: "draft" | "submit"): string | null => {
    if (!caption.trim()) return "Add a caption.";
    if (intent === "submit" && !file) return "Upload a creative (image or video) before sending to the client.";
    return null;
  };

  const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const se = e.nativeEvent as SubmitEvent;
    const submitter = se.submitter as HTMLButtonElement | null;
    let intent: "draft" | "submit";
    if (submitter?.name === "intent" && (submitter.value === "draft" || submitter.value === "submit")) {
      intent = submitter.value === "draft" ? "draft" : "submit";
    } else {
      intent = String(new FormData(form).get("intent") ?? "submit") === "draft" ? "draft" : "submit";
    }

    const msg = validateBeforeSubmit(intent);
    if (msg) {
      setError(msg);
      return;
    }
    setError(null);

    const fd = new FormData(form);
    setSubmitIntent(intent);
    startTransition(async () => {
      try {
        if (masterMode) {
          await addCalendarPostFromStudioMasterCalendar(fd);
          onClose();
          router.refresh();
        } else {
          await addCalendarPost(projectId!, fd);
        }
      } finally {
        setSubmitIntent(null);
      }
    });
  };

  const previewIsVideo = previewUrl && file ? isLocalCreativeVideoFileName(file.name) : false;

  if (!ready) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[200] overflow-y-auto overflow-x-hidden overscroll-y-contain bg-black/55 backdrop-blur-[2px]"
      data-lenis-prevent
    >
      {/* Scroll the whole overlay (not an inner max-h panel): flex min-height + default min-height:auto was letting the sheet grow past the viewport. */}
      <div
        className="flex min-h-full w-full justify-center px-4 py-[max(0.75rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 sm:px-6 sm:py-8"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-calendar-post-heading"
          className="my-auto w-full max-w-xl rounded-2xl bg-cream shadow-2xl lg:max-w-3xl"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-burgundy/10 bg-cream px-4 py-3 sm:px-5">
            <h2
              id="add-calendar-post-heading"
              className="font-display text-base tracking-[-0.02em] text-burgundy md:text-lg"
            >
              {masterMode ? "Add post for a client" : "Add post"}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-burgundy/15 px-3 py-1.5 font-body text-[11px] uppercase tracking-[0.12em] text-burgundy/80 hover:bg-burgundy/[0.06]"
            >
              Close
            </button>
          </div>

          <p className="border-b border-burgundy/10 px-4 py-3 font-body text-sm text-burgundy/70 sm:px-5">
          {masterMode ? (
            <>
              Choose which subscription this is for, then add creative, caption, and hashtags. Submit for approval to
              notify the client in their portal; drafts stay visible only to the studio until you submit.
            </>
          ) : (
            <>
              Stay on this page — save as a draft or send to your client for approval. They get an in-portal notification
              only when you submit for approval.
            </>
          )}
          </p>

          {!masterMode && assignedProjectName?.trim() ? (
            <div className="border-b border-burgundy/10 bg-burgundy/[0.03] px-4 py-3 sm:px-5">
              <p className="font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/55">Client / subscription</p>
              <p className="mt-1 font-display text-base font-medium tracking-[-0.02em] text-burgundy">
                {assignedProjectName.trim()}
              </p>
              <p className="mt-2 font-body text-sm leading-relaxed text-burgundy/70">
                You&apos;re in this project&apos;s workspace — new posts are saved to this client only. There is no
                separate &quot;assign&quot; step here.
              </p>
              <Link
                href="/portal/studio-social-calendar"
                onClick={onClose}
                className="mt-3 inline-flex font-body text-sm font-medium text-burgundy underline decoration-burgundy/35 underline-offset-4 hover:decoration-burgundy/70"
              >
                Add a post for a different client (studio calendar) →
              </Link>
            </div>
          ) : null}

          <form
            key={`${defaultScheduledLocal}-${masterMode ? "master" : projectId}`}
            encType="multipart/form-data"
            onSubmit={onFormSubmit}
            aria-busy={isPending}
            className="flex flex-col gap-5 px-4 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-5 lg:flex-row lg:gap-8"
          >
            <input type="hidden" name="hashtags" value={hashtagsHiddenValue} />
            {channels.map((ch) => (
              <input key={ch} type="hidden" name="channels" value={ch} />
            ))}

            <div className="min-w-0 flex-1 space-y-5">
              {masterMode && projectChoices ? (
                <label className="flex flex-col gap-1.5">
                  <span className="font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/55">
                    Client / project *
                  </span>
                  <select
                    name="projectId"
                    required
                    defaultValue={projectChoices.length === 1 ? projectChoices[0]!.id : ""}
                    className="rounded-cc-card border border-burgundy/15 bg-white px-4 py-3 font-body text-sm text-burgundy outline-none ring-burgundy/20 focus:ring-2"
                  >
                    {projectChoices.length > 1 ? (
                      <option value="" disabled>
                        Choose…
                      </option>
                    ) : null}
                    {projectChoices.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
              <div
                onDragEnter={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  if (e.currentTarget === e.target) setDragOver(false);
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const f = e.dataTransfer.files?.[0];
                  if (f) applyFile(f);
                }}
                className={`rounded-xl border-2 border-dashed px-4 py-6 transition-colors ${
                  dragOver ? "border-burgundy/50 bg-burgundy/[0.06]" : "border-burgundy/20 bg-white/80"
                }`}
              >
                <div className="flex flex-col items-center gap-3 text-center">
                  <Upload className="h-8 w-8 text-burgundy/40" aria-hidden />
                  <p className="m-0 font-body text-sm text-burgundy/75">
                    Drag and drop a creative here, or{" "}
                    <button
                      type="button"
                      className="font-medium text-burgundy underline decoration-burgundy/30 underline-offset-2"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      browse files
                    </button>
                  </p>
                  <p className="m-0 font-body text-[11px] text-burgundy/50">JPG, PNG, WEBP, MP4, MOV · required to submit</p>
                  <input
                    ref={fileInputRef}
                    name="creative"
                    type="file"
                    accept={ACCEPT_CREATIVE}
                    className="sr-only"
                    onChange={(e) => {
                      const f = e.target.files?.[0] ?? null;
                      applyFile(f);
                    }}
                  />
                </div>
                {previewUrl ? (
                  <div className="relative mt-4 overflow-hidden rounded-lg border border-burgundy/15 bg-zinc-900/5">
                    <button
                      type="button"
                      onClick={() => {
                        applyFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="absolute right-2 top-2 z-10 rounded-full bg-burgundy/90 p-1.5 text-cream shadow-md hover:bg-burgundy"
                      aria-label="Remove file"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    {previewIsVideo ? (
                      <video src={previewUrl} className="mx-auto max-h-56 w-full object-contain" controls playsInline />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element -- blob preview
                      <img src={previewUrl} alt="Creative preview" className="mx-auto max-h-56 w-full object-contain" />
                    )}
                  </div>
                ) : null}
              </div>

              <label className="flex flex-col gap-1.5">
                <span className="font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/55">Caption *</span>
                <div className="relative">
                  <div className="absolute right-2 top-2 z-10">
                    <EmojiPickerButton
                      inputRef={captionRef}
                      controlled={{ value: caption, setValue: setCaption }}
                    />
                  </div>
                  <textarea
                    ref={captionRef}
                    name="caption"
                    required
                    rows={5}
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="w-full rounded-cc-card border border-burgundy/15 bg-white px-4 py-3 pr-11 font-body text-sm text-burgundy outline-none ring-burgundy/20 focus:ring-2"
                  />
                </div>
                <span className="font-body text-[11px] tabular-nums text-burgundy/45">{caption.length} characters</span>
              </label>

              <div className="flex flex-col gap-1.5">
                <span className="font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/55">Hashtags</span>
                <div className="flex flex-wrap gap-1.5 rounded-cc-card border border-burgundy/15 bg-white p-2 min-h-[2.75rem]">
                  {hashtagTags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 rounded-full bg-burgundy/10 px-2.5 py-1 font-body text-xs text-burgundy"
                    >
                      {t}
                      <button
                        type="button"
                        onClick={() => removeTag(t)}
                        className="rounded-full p-0.5 hover:bg-burgundy/20"
                        aria-label={`Remove ${t}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    value={hashtagDraft}
                    onChange={(e) => setHashtagDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addHashtagsFromDraft();
                      }
                    }}
                    onBlur={() => {
                      if (hashtagDraft.trim()) addHashtagsFromDraft();
                    }}
                    placeholder="Type a tag and press Enter, or paste many at once"
                    className="min-w-[8rem] flex-1 border-0 bg-transparent px-1 py-1 font-body text-sm text-burgundy outline-none"
                  />
                </div>
                <span className="font-body text-[11px] text-burgundy/45">
                  Separate field from the caption — shown to the client and easy to copy for scheduling.
                </span>
              </div>

              <fieldset className="flex flex-col gap-1.5 border-0 p-0">
                <legend className="font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/55">
                  Scheduled for *
                </legend>
                <input
                  type="hidden"
                  name="scheduledFor"
                  value={scheduledDate && scheduledTime ? `${scheduledDate}T${scheduledTime}` : ""}
                />
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
                  <label className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <span className="font-body text-[10px] uppercase tracking-[0.08em] text-burgundy/50">Date</span>
                    <input
                      type="date"
                      required
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className={scheduleInputClass}
                    />
                  </label>
                  <label className="flex min-w-0 flex-col gap-1.5 sm:w-[11rem] sm:shrink-0">
                    <span className="font-body text-[10px] uppercase tracking-[0.08em] text-burgundy/50">Time</span>
                    <input
                      type="time"
                      required
                      step={60}
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className={scheduleInputClass}
                    />
                  </label>
                </div>
              </fieldset>
            </div>

            <div className="min-w-0 flex-1 space-y-5 lg:border-l lg:border-burgundy/10 lg:pl-8">
              <fieldset className="space-y-2 border-0 p-0">
                <legend className="font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/55">
                  Networks (pick one or more)
                </legend>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-2">
                  {orderedChannelOptions().map((ch) => {
                    const on = channels.includes(ch.id);
                    return (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => toggleChannel(ch.id)}
                        className={`flex min-h-[48px] items-center justify-center gap-2 rounded-xl border-2 px-3 py-2.5 font-body text-sm transition-colors ${
                          on
                            ? "border-burgundy bg-burgundy/[0.12] text-burgundy shadow-sm ring-2 ring-burgundy/25"
                            : "border-burgundy/15 bg-white text-burgundy/70 hover:border-burgundy/35"
                        }`}
                      >
                        <SocialPlatformIcon id={ch.id} className="h-5 w-5 shrink-0" />
                        {ch.label}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              {error ? (
                <p className="rounded-lg border border-rose-200 bg-rose-50/80 px-3 py-2 font-body text-sm text-rose-900">
                  {error}
                </p>
              ) : null}

              <div className="flex flex-col gap-3 border-t border-burgundy/10 pt-4 sm:flex-row sm:flex-wrap">
                <button
                  type="submit"
                  name="intent"
                  value="draft"
                  disabled={isPending}
                  className={ctaButtonClasses({ variant: "outline", size: "md", className: "w-full sm:w-auto sm:min-w-[10rem]" })}
                >
                  {isPending && submitIntent === "draft" ? "Saving…" : "Save as Draft"}
                </button>
                <button
                  type="submit"
                  name="intent"
                  value="submit"
                  disabled={isPending}
                  className={ctaButtonClasses({ variant: "burgundy", size: "md", className: "w-full sm:w-auto sm:min-w-[10rem]" })}
                >
                  {isPending && submitIntent === "submit" ? "Submitting…" : "Submit for Approval"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
