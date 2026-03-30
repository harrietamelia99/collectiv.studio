"use client";

import Link from "next/link";
import {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useTransition,
  type ComponentProps,
  type MutableRefObject,
} from "react";
import { useRouter } from "next/navigation";
import {
  deleteContentCalendarItem,
  reopenCalendarPostForClientReview,
  saveCalendarItemFeedback,
  signOffCalendarItem,
} from "@/app/portal/actions";
import { saveStudioCalendarPost, submitCalendarPostForClientReview } from "@/app/portal/social-batch-actions";
import { WorkflowStatusBadge } from "@/components/portal/WorkflowStatusBadge";
import { CALENDAR_CHANNEL_OPTIONS, labelForChannel } from "@/lib/calendar-channels";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatContentCalendarWhen } from "@/lib/format-content-calendar-when";
import { resolveHashtagsForPost } from "@/lib/social-calendar-hashtags";
import { labelForPostFormat } from "@/lib/social-batch-calendar";
import { ctaButtonClasses } from "@/components/ui/Button";
import { EmojiPickerButton } from "@/components/ui/EmojiPickerButton";
import type { SocialCalendarItem } from "@/components/portal/SocialContentCalendar";
import { StudioPostScheduleActions } from "@/components/portal/StudioPostScheduleActions";
import type { CalendarActivityEntry } from "@/lib/calendar-activity-log";
import { isSocialCalendarMediaVideoUrl } from "@/lib/social-calendar-media";

function activityEntryTitle(kind: string): string {
  switch (kind) {
    case "client_revision_request":
      return "Revision requested";
    case "client_comment":
      return "Client comment";
    case "client_approved":
      return "Approved";
    case "studio_resubmit":
      return "Resubmitted for review";
    case "studio_edit":
      return "Studio update";
    case "post_removed":
      return "Post removed";
    default:
      return kind.replace(/_/g, " ");
  }
}

function ActivityTimeline({ entries, heading }: { entries: CalendarActivityEntry[]; heading: string }) {
  if (!entries.length) return null;
  const ordered = [...entries].reverse();
    return (
    <div className="rounded-xl border border-burgundy/10 bg-burgundy/[0.02] px-4 py-3 shadow-sm">
      <p className="font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/50">{heading}</p>
      <ul className="mt-3 space-y-3">
        {ordered.map((e, i) => (
          <li key={`${e.at}-${e.kind}-${i}`} className="border-t border-burgundy/10 pt-3 first:border-t-0 first:pt-0">
            <p className="font-body text-[10px] uppercase tracking-[0.08em] text-burgundy/45">
              {new Date(e.at).toLocaleString(undefined, {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}{" "}
              · {activityEntryTitle(e.kind)}
            </p>
            <p className="mt-1.5 whitespace-pre-wrap font-body text-sm leading-relaxed text-burgundy/90">
              {e.summary}
            </p>
            {e.snapshot ? (
              <p className="mt-1 font-body text-[11px] leading-snug text-burgundy/50">
                A content snapshot was stored with this step (for the record).
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

function scheduledForInputValue(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day}T${h}:${min}`;
}

/** Grows with content; keeps a sensible minimum height. */
const AutoGrowTextarea = forwardRef<HTMLTextAreaElement, ComponentProps<"textarea"> & { minRows?: number }>(
  function AutoGrowTextarea({ minRows = 3, className = "", onInput, ...rest }, forwardedRef) {
    const innerRef = useRef<HTMLTextAreaElement>(null);
    const setRefs = useCallback(
      (node: HTMLTextAreaElement | null) => {
        (innerRef as MutableRefObject<HTMLTextAreaElement | null>).current = node;
        if (typeof forwardedRef === "function") forwardedRef(node);
        else if (forwardedRef) (forwardedRef as MutableRefObject<HTMLTextAreaElement | null>).current = node;
      },
      [forwardedRef],
    );

    const resize = useCallback(() => {
      const el = innerRef.current;
      if (!el) return;
      el.style.height = "auto";
      const styles = window.getComputedStyle(el);
      const lineHeight = parseFloat(styles.lineHeight) || 22;
      const minH = minRows * lineHeight + parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom);
      el.style.height = `${Math.max(el.scrollHeight, minH)}px`;
    }, [minRows]);

    useLayoutEffect(() => {
      resize();
    }, [resize, rest.defaultValue]);

      return (
      <textarea
        ref={setRefs}
        rows={minRows}
        {...rest}
        className={className}
        onInput={(e) => {
          resize();
          onInput?.(e);
        }}
      />
    );
  },
);
AutoGrowTextarea.displayName = "AutoGrowTextarea";

type Props = {
  post: SocialCalendarItem | null;
  postsForDay: SocialCalendarItem[];
  navigationRing?: SocialCalendarItem[] | null;
  batchMode?: boolean;
  onSelectPost: (id: string) => void;
  onClose: () => void;
  mode?: "client" | "studio";
  projectId?: string;
  onStudioAddAnotherThisDay?: () => void;
};

const tapInput =
  "min-h-[44px] rounded-cc-card border border-burgundy/15 bg-white px-3 py-2.5 font-body text-sm text-burgundy md:min-h-[44px]";
const tapTextareaBase =
  "w-full resize-none rounded-cc-card border border-burgundy/15 bg-white px-3 py-2.5 font-body text-sm text-burgundy leading-relaxed md:min-h-[44px]";

export function SocialCalendarPostModal({
  post,
  postsForDay,
  navigationRing,
  batchMode = false,
  onSelectPost,
  onClose,
  mode = "client",
  projectId: projectIdProp,
  onStudioAddAnotherThisDay,
}: Props) {
  const router = useRouter();
  const studioCaptionRef = useRef<HTMLTextAreaElement>(null);
  const studioHashtagsRef = useRef<HTMLTextAreaElement>(null);
  const clientRevisionRef = useRef<HTMLTextAreaElement>(null);
  const clientCommentRef = useRef<HTMLTextAreaElement>(null);
  const clientRevisionMobileRef = useRef<HTMLTextAreaElement>(null);
  const clientCommentMobileRef = useRef<HTMLTextAreaElement>(null);
  const [pending, startTransition] = useTransition();
  const isStudio = mode === "studio";
  const projectId = projectIdProp ?? post?.projectId ?? "";

  const navRing =
    navigationRing && navigationRing.length > 0 ? navigationRing : postsForDay;

  const studioFormId = post ? `social-cal-studio-${post.id}` : "social-cal-studio";

  useEffect(() => {
    if (!post) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (navRing.length <= 1) return;
      const i = navRing.findIndex((p) => p.id === post.id);
      if (e.key === "ArrowLeft" && i > 0) onSelectPost(navRing[i - 1]!.id);
      if (e.key === "ArrowRight" && i >= 0 && i < navRing.length - 1) onSelectPost(navRing[i + 1]!.id);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [post, onClose, navRing, onSelectPost]);

  if (!post) return null;

  const safeTitle =
    post.title == null ? "" : typeof post.title === "string" ? post.title : String(post.title);
  const safeCaption =
    post.caption == null ? "" : typeof post.caption === "string" ? post.caption : String(post.caption);
  const channelList = Array.isArray(post.channels)
    ? post.channels.filter((c): c is string => typeof c === "string" && c.trim().length > 0)
    : [];

  const whenLabel = formatContentCalendarWhen(post.scheduledFor, { withTime: true });
  const platformsLine =
    channelList.length > 0 ? channelList.map((c) => labelForChannel(c)).join(" · ") : null;

  const wf = post.postWorkflowStatus;
  const useBatchWorkflow = Boolean(post.usesBatchCalendar ?? batchMode);
  const useBatchStatus = Boolean(useBatchWorkflow && wf);

  const legacyStatus = !useBatchStatus
    ? isStudio
      ? post.clientSignedOff
        ? { label: "Signed off", tone: "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200/90" as const }
        : post.clientFeedback?.trim()
          ? { label: "Client feedback", tone: "bg-amber-50 text-amber-950 ring-1 ring-amber-200/90" as const }
          : { label: "Awaiting client", tone: "bg-burgundy/10 text-burgundy ring-1 ring-burgundy/15" as const }
      : post.clientSignedOff
        ? { label: "Approved", tone: "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200/90" as const }
    : post.clientFeedback?.trim()
          ? { label: "Feedback sent", tone: "bg-amber-50 text-amber-950 ring-1 ring-amber-200/90" as const }
          : { label: "Awaiting review", tone: "bg-burgundy/10 text-burgundy ring-1 ring-burgundy/15" as const }
    : null;

  const mediaUrl = post.imageUrl;
  const video = isSocialCalendarMediaVideoUrl(mediaUrl);
  const dayIndex = navRing.findIndex((p) => p.id === post.id);
  const hasPrev = dayIndex > 0;
  const hasNext = dayIndex >= 0 && dayIndex < navRing.length - 1;
  const downloadBase = safeTitle.trim() || post.id.slice(0, 8);
  const hashtagsForSchedule = resolveHashtagsForPost(safeCaption, post.hashtags);

  const headingTitle =
    safeTitle.trim() ||
    (useBatchWorkflow && post.postWorkflowStatus === "AWAITING_CONTENT"
      ? `${labelForPostFormat(post.postFormat ?? "GRAPHIC")} · Awaiting Content`
      : "Post preview");

  const navSubtitle =
    navRing.length > 1
      ? useBatchWorkflow && post.planMonthKey
        ? `${dayIndex >= 0 ? dayIndex + 1 : 1} of ${navRing.length} in month · ← →`
        : `${dayIndex >= 0 ? dayIndex + 1 : 1} of ${navRing.length} on this day · ← →`
      : null;

  const projectIdForSave = (projectIdProp ?? post.projectId ?? "").trim();
  const studioDraftPhase =
    Boolean(useBatchWorkflow && wf && ["AWAITING_CONTENT", "DRAFT", "REVISION_NEEDED"].includes(wf));
  const showBatchApprovedWarning = Boolean(useBatchWorkflow && wf === "APPROVED");
  const showLegacyScheduleFields = !useBatchWorkflow && Boolean(projectIdForSave);

  const clientLocked =
    post.postWorkflowStatus === "APPROVED" ||
    (Boolean(post.clientSignedOff) &&
      post.postWorkflowStatus !== "PENDING_APPROVAL" &&
      post.postWorkflowStatus !== "REVISION_NEEDED");

  const canClientApprove =
    !clientLocked &&
    !post.clientSignedOff &&
    (useBatchWorkflow ? post.postWorkflowStatus === "PENDING_APPROVAL" : true);

  const canClientRequestRevision =
    !clientLocked &&
    (useBatchWorkflow
      ? post.postWorkflowStatus === "PENDING_APPROVAL" || post.postWorkflowStatus === "REVISION_NEEDED"
      : !post.clientSignedOff);

  const canClientCommentOnly =
    !clientLocked &&
    (useBatchWorkflow
      ? post.postWorkflowStatus === "PENDING_APPROVAL" || post.postWorkflowStatus === "REVISION_NEEDED"
      : !post.clientSignedOff);

  const logEntries = post.activityLog ?? [];

  const canStudioSubmitForReview =
    isStudio &&
    Boolean(projectIdForSave) &&
    useBatchWorkflow &&
    ["DRAFT", "REVISION_NEEDED", "AWAITING_CONTENT"].includes(wf ?? "");

  const canStudioReopen = isStudio && Boolean(projectIdForSave) && wf === "APPROVED";
  const canStudioDelete = isStudio && Boolean(projectIdForSave);

  const navBtnClass =
    "flex h-11 min-h-[44px] w-11 min-w-[44px] shrink-0 items-center justify-center rounded-xl border border-burgundy/15 text-burgundy/80 transition-colors hover:bg-burgundy/[0.06] disabled:cursor-not-allowed disabled:opacity-35 lg:h-10 lg:w-10";

  const statusRow = (
    <div className="flex flex-col gap-2 border-b border-zinc-100/90 pb-3 sm:flex-row sm:flex-wrap sm:items-start sm:gap-x-3 sm:gap-y-2">
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        {useBatchStatus && wf ? (
          <WorkflowStatusBadge status={wf} />
        ) : legacyStatus ? (
          <span
            className={`inline-flex max-w-full shrink-0 rounded-full px-3 py-1.5 font-body text-[10px] font-semibold uppercase tracking-[0.08em] ${legacyStatus.tone}`}
          >
            {legacyStatus.label}
          </span>
        ) : null}
      </div>
      <div className="min-w-0 flex-1 font-body text-xs leading-snug text-burgundy/60 sm:min-w-[12rem]">
        <span className="block break-words">{whenLabel}</span>
        {platformsLine ? (
          <span className="mt-0.5 block break-words text-burgundy/50">{platformsLine}</span>
        ) : null}
      </div>
    </div>
  );

  const creativeBlock = (
    <div className="w-full shrink-0 overflow-hidden rounded-xl border border-burgundy/15 bg-white shadow-sm lg:min-h-0 lg:max-w-full">
      <div
        className={
          "relative flex w-full items-center justify-center bg-zinc-100 " +
          "max-md:h-[250px] max-md:max-h-[250px] " +
          "md:max-lg:max-h-[350px] md:max-lg:min-h-[200px] " +
          "lg:min-h-[180px] lg:max-h-[min(42vh,360px)] lg:flex-none"
        }
      >
        {mediaUrl ? (
          video ? (
            <video
              src={mediaUrl}
              controls
              playsInline
              preload="metadata"
              className="max-h-full w-full object-contain object-center"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={mediaUrl} alt="" className="max-h-full w-full object-contain object-center" />
          )
        ) : (
          <div className="flex max-h-full flex-col items-center justify-center gap-2 px-4 py-6 text-center">
            <span className="font-display text-sm text-burgundy/40">
              {batchMode && post.postWorkflowStatus === "AWAITING_CONTENT" ? "Awaiting Content" : "Visual TBC"}
            </span>
            <p className="max-w-xs font-body text-xs leading-relaxed text-burgundy/45">
              {batchMode && post.postWorkflowStatus === "AWAITING_CONTENT"
                ? `${labelForPostFormat(post.postFormat ?? "GRAPHIC")} for ${platformsLine ?? "selected platforms"}.`
                : "Image or video will appear here when the studio adds it."}
            </p>
          </div>
        )}
      </div>
      {mediaUrl ? (
        <div className="mt-0 border-t border-burgundy/10 bg-cream/90 px-4 py-4 sm:px-5">
          <StudioPostScheduleActions
            caption={safeCaption}
            mediaUrl={mediaUrl}
            downloadBaseName={downloadBase}
            showCopyCaption={false}
            showDownload
            className="flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2 [&_button]:min-h-[44px]"
          />
        </div>
      ) : null}
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex justify-center bg-black/55 backdrop-blur-[2px] max-md:items-stretch max-md:p-0 md:items-center md:p-4 lg:p-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby={`post-modal-${post.id}`}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={
          "relative flex min-h-0 flex-col bg-cream shadow-2xl " +
          "max-md:h-[100dvh] max-md:max-h-[100dvh] max-md:w-full max-md:rounded-none " +
          "md:max-lg:max-h-[90vh] md:max-lg:w-[90vw] md:max-lg:overflow-y-auto md:max-lg:overscroll-contain md:max-lg:rounded-2xl " +
          "lg:h-[min(90vh,900px)] lg:max-h-[90vh] lg:w-[min(80vw,1100px)] lg:overflow-hidden lg:rounded-2xl"
        }
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header: full-width, sticky; close top-left on phone, top-right on lg */}
        <header className="sticky top-0 z-30 flex shrink-0 items-center gap-2 border-b border-burgundy/10 bg-cream/95 px-4 py-3 backdrop-blur-md sm:px-6 lg:px-8 lg:py-4">
          <button
            type="button"
            onClick={onClose}
            className="order-first inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-full border border-burgundy/15 px-4 font-body text-[11px] font-semibold uppercase tracking-[0.12em] text-burgundy/85 hover:bg-burgundy/[0.06] lg:hidden"
          >
            Close
          </button>
          <div className="min-w-0 flex-1 max-md:text-center md:text-left">
            <h2
              id={`post-modal-${post.id}`}
              className="font-display text-base leading-tight tracking-[-0.02em] text-burgundy lg:text-lg"
            >
              <span className="line-clamp-2">{headingTitle}</span>
            </h2>
            {navSubtitle ? (
              <p className="mt-1 font-body text-[10px] uppercase tracking-[0.1em] text-burgundy/45">{navSubtitle}</p>
            ) : (
              <p className="mt-1 font-body text-[10px] uppercase tracking-[0.1em] text-burgundy/45 lg:hidden">
                {whenLabel}
              </p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {navRing.length > 1 ? (
              <>
                <button
                  type="button"
                  disabled={!hasPrev}
                  onClick={() => hasPrev && onSelectPost(navRing[dayIndex - 1]!.id)}
                  title="Previous post"
                  className={navBtnClass}
                  aria-label="Previous post"
                >
                  <ChevronLeft className="h-5 w-5 shrink-0 text-burgundy" strokeWidth={2.5} aria-hidden />
                </button>
                <button
                  type="button"
                  disabled={!hasNext}
                  onClick={() => hasNext && onSelectPost(navRing[dayIndex + 1]!.id)}
                  title="Next post"
                  className={navBtnClass}
                  aria-label="Next post"
                >
                  <ChevronRight className="h-5 w-5 shrink-0 text-burgundy" strokeWidth={2.5} aria-hidden />
                </button>
              </>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              className="ml-1 hidden min-h-[44px] shrink-0 items-center justify-center rounded-full border border-burgundy/15 px-4 font-body text-[11px] uppercase tracking-[0.12em] text-burgundy/80 hover:bg-burgundy/[0.06] lg:inline-flex"
            >
              Close
            </button>
          </div>
        </header>

        {/* Body: phone = column + inner scroll + optional sticky footer; iPad = one scroll; desktop = split scroll */}
        <div
          className={
            "flex min-h-0 flex-1 flex-col " +
            "max-md:overflow-hidden " +
            "md:max-lg:overflow-visible " +
            "lg:max-h-full lg:flex-row lg:gap-12 lg:overflow-hidden lg:px-8 lg:pb-6 lg:pt-4"
          }
        >
          {/* Image column — left on desktop, top on smaller screens */}
          <aside
            className={
              "flex min-h-0 shrink-0 flex-col " +
              "max-md:px-4 max-md:pt-3 " +
              "md:max-lg:px-6 md:max-lg:pt-4 " +
              "lg:max-h-full lg:w-[40%] lg:max-w-[440px] lg:overflow-y-auto lg:overscroll-contain lg:px-0 lg:pt-0"
            }
          >
            <div className="flex min-h-0 flex-col lg:max-h-full lg:justify-start">
              {creativeBlock}
        </div>
          </aside>

          {/* Form / copy column */}
          <div
            className={
              "flex min-h-0 min-w-0 flex-1 flex-col " +
              "max-md:flex-1 max-md:overflow-y-auto max-md:overscroll-contain max-md:px-4 max-md:pb-32 max-md:pt-4 " +
              "md:max-lg:px-6 md:max-lg:pb-8 md:max-lg:pt-2 " +
              "lg:max-h-full lg:overflow-y-auto lg:overflow-x-hidden lg:overscroll-contain lg:px-0 lg:pb-2 lg:pt-0"
            }
          >
            <div className="mx-auto w-full max-w-2xl space-y-4 lg:max-w-none lg:space-y-5 lg:pr-2 lg:pt-1">
              {statusRow}

              {isStudio ? (
                <>
                  <p className="rounded-lg border border-burgundy/10 bg-burgundy/[0.03] px-4 py-3 font-body text-xs leading-relaxed text-burgundy/70">
                    <strong className="font-semibold text-burgundy/85">Agency:</strong> edit copy, hashtags, and creative
                    below. <strong className="font-semibold text-burgundy/85">Clients</strong> only view this post, leave
                    comments, and approve — they cannot edit the body here.
                  </p>

                  {post.clientFeedback?.trim() ? (
                    <div className="rounded-xl border border-amber-200/90 bg-amber-50/60 px-4 py-3 shadow-sm">
                      <p className="font-body text-[10px] uppercase tracking-[0.12em] text-amber-900/55">Client feedback</p>
                      <p className="mt-2 whitespace-pre-wrap font-body text-sm leading-relaxed text-burgundy/90">
                        {post.clientFeedback.trim()}
                      </p>
                    </div>
                  ) : null}
                  {useBatchWorkflow ? (
                    <div className="rounded-xl border border-burgundy/10 bg-white px-4 py-3 shadow-sm">
                      <p className="font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/50">Planned format</p>
                      <p className="mt-1 font-body text-sm font-medium text-burgundy">
                        {labelForPostFormat(post.postFormat ?? "GRAPHIC")}
                      </p>
                    </div>
                  ) : null}
                  {useBatchWorkflow ? (
                    <div className="rounded-xl border border-burgundy/10 bg-white px-4 py-3 shadow-sm">
                      <p className="font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/50">Posting to</p>
                      <p className="mt-1 font-body text-sm font-medium text-burgundy">
                        {platformsLine ?? "Not set — set platforms when adding the post or in the workspace"}
                      </p>
                    </div>
                  ) : null}

                  {projectIdForSave ? (
                    <>
                      <form
                        id={studioFormId}
                        key={`studio-edit-${post.id}`}
                        encType="multipart/form-data"
                        className={
                          studioDraftPhase
                            ? "space-y-4 rounded-xl border border-sky-200/80 bg-sky-50/40 px-4 py-4 shadow-sm sm:px-5 sm:py-5"
                            : "space-y-4 rounded-xl border border-burgundy/10 bg-white px-4 py-4 shadow-sm sm:px-5 sm:py-5"
                        }
                        onSubmit={(e) => {
                          e.preventDefault();
                          const fd = new FormData(e.currentTarget);
                          startTransition(async () => {
                            await saveStudioCalendarPost(projectIdForSave, post.id, fd);
                            router.refresh();
                          });
                        }}
                      >
                        {studioDraftPhase ? (
                          <p className="font-body text-[10px] uppercase tracking-[0.12em] text-sky-900/60">
                            Fill this post (saved as draft)
                          </p>
                        ) : (
                          <p className="font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/50">
                            Edit post content
                          </p>
                        )}
                        {showBatchApprovedWarning ? (
                          <p className="rounded-lg border border-amber-200/80 bg-amber-50/70 px-3 py-2 font-body text-xs leading-relaxed text-amber-950/80">
                            Saving moves this post back to <strong className="font-semibold">draft</strong> and clears
                            the client&apos;s approval. Use <strong className="font-semibold">Submit for approval</strong>{" "}
                            below (or <strong className="font-semibold">Submit month for approval</strong> on the calendar)
                            when they should see it again.
                          </p>
                        ) : null}
                        {showLegacyScheduleFields ? (
                          <>
                            <label className="block font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/55">
                              Scheduled for
                              <input
                                name="scheduledFor"
                                type="datetime-local"
                                defaultValue={scheduledForInputValue(post.scheduledFor)}
                                className={`mt-2 block w-full ${tapInput}`}
                              />
                            </label>
                            <fieldset className="border-0 p-0">
                              <legend className="mb-2 font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/55">
                                Platforms
                              </legend>
                              <div className="grid grid-cols-2 gap-3 md:flex md:flex-wrap md:gap-x-8 md:gap-y-3 lg:gap-x-10">
                                {CALENDAR_CHANNEL_OPTIONS.map((ch) => (
                                  <label
                                    key={ch.id}
                                    className={
                                      "flex cursor-pointer items-center gap-3 rounded-xl border border-burgundy/15 bg-white px-3 py-2.5 font-body text-sm text-burgundy/85 shadow-sm transition-colors " +
                                      "max-md:min-h-[52px] max-md:flex-col max-md:justify-center max-md:gap-1 max-md:px-2 max-md:py-3 " +
                                      "md:min-h-[44px] md:border-0 md:bg-transparent md:px-2 md:py-2 md:shadow-none md:hover:bg-burgundy/[0.04]"
                                    }
                                  >
                                    <input
                                      type="checkbox"
                                      name="channels"
                                      value={ch.id}
                                      defaultChecked={
                                        channelList.length === 0
                                          ? ch.id === "instagram"
                                          : channelList.includes(ch.id)
                                      }
                                      className="size-5 shrink-0 rounded border-burgundy/25 text-burgundy focus:ring-burgundy/30 md:size-[18px]"
                                    />
                                    <span>{ch.label}</span>
                                  </label>
                                ))}
                              </div>
                            </fieldset>
                          </>
                        ) : null}
                        <label className="block font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/55">
                          Title (optional)
                          <input
                            name="title"
                            type="text"
                            defaultValue={safeTitle}
                            className={`mt-2 block w-full ${tapInput}`}
                          />
                        </label>
                        <label className="block font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/55">
                          Caption
                          <AutoGrowTextarea
                            name="caption"
                            minRows={3}
                            defaultValue={safeCaption}
                            className={`mt-2 ${tapTextareaBase}`}
                          />
                        </label>
                        <label className="block font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/55">
                          Hashtags (optional)
                          <AutoGrowTextarea
                            name="hashtags"
                            minRows={2}
                            defaultValue={post.hashtags ?? ""}
                            className={`mt-2 ${tapTextareaBase}`}
                          />
                        </label>
                        <label className="block font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/55">
                          Creative (image or video)
                          <input
                            name="image"
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
                            className="mt-2 block w-full min-h-[44px] font-body text-[13px] leading-snug text-burgundy file:mr-3 file:rounded-lg file:border-0 file:bg-burgundy/10 file:px-3 file:py-2 file:font-medium file:text-burgundy"
                          />
                        </label>
                        {mediaUrl ? (
                          <label className="flex min-h-[44px] cursor-pointer items-center gap-3 font-body text-sm text-burgundy/75">
                            <input
                              type="checkbox"
                              name="clearImage"
                              value="1"
                              className="size-5 shrink-0 rounded border-burgundy/25"
                            />
                            Remove current file
                          </label>
                        ) : null}
                        <button
                          type="submit"
                          disabled={pending}
                          className={`max-md:hidden ${ctaButtonClasses({ variant: "ink", size: "sm", className: "min-h-[44px] w-full sm:w-auto" })}`}
                        >
                          {pending ? "Saving…" : studioDraftPhase ? "Save draft" : "Save changes"}
                        </button>
                      </form>

                      <div className="rounded-xl border border-burgundy/10 bg-white px-4 py-4 shadow-sm sm:px-5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/50">
                            Copy for scheduling
                          </p>
                          <StudioPostScheduleActions
                            caption={safeCaption}
                            mediaUrl={null}
                            showCopyCaption
                            showCopyHashtags
                            hashtagsText={hashtagsForSchedule}
                            showDownload={false}
                            className="gap-2"
                          />
                </div>
                        <p className="mt-2 font-body text-xs leading-relaxed text-burgundy/55">
                          Paste these when you publish. Use <strong className="font-medium text-burgundy">Download</strong>{" "}
                          under the creative for the file. Save the form first if you just edited — copy uses the last
                          saved values until you refresh.
                        </p>
                        {hashtagsForSchedule.trim() ? (
                          <p className="mt-2 whitespace-pre-wrap break-words font-body text-sm leading-relaxed text-burgundy/90">
                            {hashtagsForSchedule}
                          </p>
                        ) : (
                          <p className="mt-2 font-body text-sm leading-relaxed text-burgundy/55">
                            No hashtags in the optional field yet — add them above or use #tags in the caption, then save.
                          </p>
                        )}
              </div>

                      <div className="flex flex-col gap-3 rounded-xl border border-burgundy/10 bg-white px-4 py-4 shadow-sm sm:px-5">
                        <p className="font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/50">Client workflow</p>
                        <div className="max-md:hidden flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                          {canStudioSubmitForReview ? (
                            <button
                              type="button"
                              disabled={pending}
                              className={ctaButtonClasses({
                                variant: "ink",
                                size: "sm",
                                className: "min-h-[44px] w-full sm:w-auto",
                              })}
                              onClick={() =>
                                startTransition(async () => {
                                  await submitCalendarPostForClientReview(projectIdForSave, post.id);
                                  router.refresh();
                                })
                              }
                            >
                              {pending ? "Working…" : "Submit for approval"}
                            </button>
                          ) : null}
                          {canStudioReopen ? (
                            <button
                              type="button"
                              disabled={pending}
                              className={ctaButtonClasses({
                                variant: "outline",
                                size: "sm",
                                className: "min-h-[44px] w-full sm:w-auto",
                              })}
                              onClick={() =>
                                startTransition(async () => {
                                  await reopenCalendarPostForClientReview(projectIdForSave, post.id);
                                  router.refresh();
                                })
                              }
                            >
                              {pending ? "Working…" : "Reopen for client review"}
                            </button>
                          ) : null}
                          {canStudioDelete ? (
                            <button
                              type="button"
                              disabled={pending}
                              className="min-h-[44px] w-full rounded-full border border-red-200/90 bg-red-50/50 px-4 py-2.5 text-left font-body text-sm font-medium text-red-950/90 hover:bg-red-50 sm:w-auto"
                              onClick={() => {
                                if (
                                  !window.confirm(
                                    "Remove this post from the calendar? The client will be notified if they could already see it.",
                                  )
                                ) {
                                  return;
                                }
                                startTransition(async () => {
                                  await deleteContentCalendarItem(projectIdForSave, post.id);
                                  router.refresh();
                                  onClose();
                                });
                              }}
                            >
                              Delete post
                            </button>
                          ) : null}
                        </div>
                        <div className="md:hidden flex flex-col gap-2">
                          {canStudioReopen ? (
                            <button
                              type="button"
                              disabled={pending}
                              className={ctaButtonClasses({
                                variant: "outline",
                                size: "md",
                                className: "min-h-[48px] w-full",
                              })}
                              onClick={() =>
                                startTransition(async () => {
                                  await reopenCalendarPostForClientReview(projectIdForSave, post.id);
                                  router.refresh();
                                })
                              }
                            >
                              {pending ? "Working…" : "Reopen for client review"}
                            </button>
                          ) : null}
                          {canStudioDelete ? (
                            <button
                              type="button"
                              disabled={pending}
                              className="min-h-[48px] w-full rounded-full border border-red-200/90 bg-red-50/50 px-4 py-2.5 font-body text-sm font-medium text-red-950/90"
                              onClick={() => {
                                if (
                                  !window.confirm(
                                    "Remove this post from the calendar? The client will be notified if they could already see it.",
                                  )
                                ) {
                                  return;
                                }
                                startTransition(async () => {
                                  await deleteContentCalendarItem(projectIdForSave, post.id);
                                  router.refresh();
                                  onClose();
                                });
                              }}
                            >
                              Delete post
                            </button>
                          ) : null}
                        </div>
                        {!canStudioSubmitForReview && !canStudioReopen && !canStudioDelete ? (
                          <p className="font-body text-xs text-burgundy/55">
                            Open the project workspace to run client workflow actions when this card has no linked project.
                          </p>
                        ) : null}
                      </div>
                      <ActivityTimeline entries={logEntries} heading="Revision history & activity" />
                    </>
                  ) : (
                    <p className="font-body text-sm text-burgundy/60">
                      Open this post from a project or master calendar with a linked client to save edits here.
                    </p>
                  )}
                  {onStudioAddAnotherThisDay && post.scheduledFor && !useBatchWorkflow ? (
                    <button
                      type="button"
                      onClick={onStudioAddAnotherThisDay}
                      className={ctaButtonClasses({
                        variant: "outline",
                        size: "md",
                        className: "min-h-[48px] w-full sm:w-auto",
                      })}
                    >
                      Add another post this day
                    </button>
                  ) : null}
                  {projectIdForSave ? (
                    <Link
                      href={`/portal/project/${projectIdForSave}/social/calendar`}
                      className="inline-flex min-h-[48px] w-full items-center justify-center rounded-full border border-burgundy/20 bg-burgundy/[0.06] py-3 font-body text-sm font-semibold text-burgundy transition-colors hover:border-burgundy/40 hover:bg-burgundy/[0.1] sm:w-auto sm:px-6"
                    >
                      Open in project workspace →
                    </Link>
                  ) : null}
                </>
              ) : (
                <>
                  <p className="rounded-lg border border-burgundy/10 bg-burgundy/[0.03] px-4 py-3 font-body text-xs leading-relaxed text-burgundy/70">
                    Times are shown in <strong className="font-semibold text-burgundy/85">your device&apos;s</strong> local
                    timezone. Approve when you&apos;re happy, request changes to send the post back to the studio, or leave
                    a comment without changing status.
                  </p>

                  <div className="rounded-xl border border-burgundy/10 bg-white px-4 py-4 shadow-sm sm:px-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/50">Social caption</p>
                      <StudioPostScheduleActions
                        caption={safeCaption}
                        mediaUrl={null}
                        showCopyCaption
                        showDownload={false}
                        className="gap-2"
                      />
                    </div>
                    <p className="mt-3 whitespace-pre-wrap font-body text-sm leading-relaxed text-burgundy/90">
                      {safeCaption || "—"}
                    </p>
                  </div>

                  {hashtagsForSchedule.trim() ? (
                    <div className="rounded-xl border border-burgundy/10 bg-white px-4 py-4 shadow-sm sm:px-5">
                      <p className="font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/50">Hashtags</p>
                      <p className="mt-3 whitespace-pre-wrap break-words font-body text-sm leading-relaxed text-burgundy/90">
                        {hashtagsForSchedule}
                      </p>
              </div>
                  ) : null}

                  <ActivityTimeline entries={logEntries} heading="Revision history & activity" />

                  <div className="max-md:hidden space-y-4">
                    {canClientRequestRevision ? (
                      <form
                        key={`fb-revision-${post.id}`}
                        className="rounded-xl border border-burgundy/10 bg-white px-4 py-4 shadow-sm sm:px-5"
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (!projectId) return;
                          const fd = new FormData(e.currentTarget);
                          fd.set("feedbackAction", "revision");
                          startTransition(async () => {
                            await saveCalendarItemFeedback(projectId, post.id, fd);
                            router.refresh();
                            onClose();
                          });
                        }}
                      >
                        <label
                          htmlFor={`cf-revision-${post.id}`}
                          className="block font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/50"
                        >
                          Request changes
                        </label>
                        <p className="mt-1 font-body text-xs leading-relaxed text-burgundy/55">
                          Describe what you&apos;d like updated. The post moves to{" "}
                          <strong className="font-medium text-burgundy/80">Revision needed</strong> and your project lead
                          is notified with this text.
                        </p>
                        <div className="relative mt-3">
                          <div className="absolute right-3 top-3 z-10">
                            <EmojiPickerButton inputRef={clientRevisionRef} />
                </div>
                          <AutoGrowTextarea
                            ref={clientRevisionRef}
                            id={`cf-revision-${post.id}`}
                            name="clientFeedback"
                            required
                            minRows={4}
                            maxLength={4000}
                            placeholder="e.g. Softer CTA, swap the visual, tweak the hook…"
                            className={`cc-portal-client-input ${tapTextareaBase} px-4 py-3 pr-11`}
                          />
              </div>
                        <input type="hidden" name="feedbackAction" value="revision" />
                        <button
                          type="submit"
                          disabled={pending}
                          className={ctaButtonClasses({
                            variant: "outline",
                            size: "sm",
                            className: "mt-4 min-h-[44px] w-full sm:w-fit",
                          })}
                        >
                          {pending ? "Sending…" : "Request changes"}
                        </button>
                      </form>
                    ) : null}

                    {canClientCommentOnly ? (
            <form
                        key={`fb-comment-${post.id}`}
                        className="rounded-xl border border-burgundy/10 bg-white px-4 py-4 shadow-sm sm:px-5"
              onSubmit={(e) => {
                e.preventDefault();
                          if (!projectId) return;
                const fd = new FormData(e.currentTarget);
                          fd.set("feedbackAction", "comment");
                startTransition(async () => {
                  await saveCalendarItemFeedback(projectId, post.id, fd);
                  router.refresh();
                  onClose();
                });
              }}
            >
                        <label
                          htmlFor={`cf-comment-${post.id}`}
                          className="block font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/50"
                        >
                          Comment only
              </label>
                        <p className="mt-1 font-body text-xs leading-relaxed text-burgundy/55">
                          Ask a question or leave a note —{" "}
                          <strong className="font-medium text-burgundy/80">status stays the same</strong> and the studio is
                          notified.
                        </p>
                        <div className="relative mt-3">
                          <div className="absolute right-3 top-3 z-10">
                            <EmojiPickerButton inputRef={clientCommentRef} />
                          </div>
                          <AutoGrowTextarea
                            ref={clientCommentRef}
                            id={`cf-comment-${post.id}`}
                name="clientFeedback"
                            required
                            minRows={3}
                maxLength={4000}
                            placeholder="e.g. Quick question about the CTA…"
                            className={`cc-portal-client-input ${tapTextareaBase} px-4 py-3 pr-11`}
              />
                        </div>
                        <input type="hidden" name="feedbackAction" value="comment" />
              <button
                type="submit"
                disabled={pending}
                className={ctaButtonClasses({
                  variant: "outline",
                  size: "sm",
                            className: "mt-4 min-h-[44px] w-full sm:w-fit",
                })}
              >
                          {pending ? "Sending…" : "Send comment"}
              </button>
            </form>
                    ) : null}

                    {canClientApprove ? (
                      <div>
                <button
                  type="button"
                          disabled={pending || !projectId}
                  className={ctaButtonClasses({
                    variant: "ink",
                    size: "md",
                            className: "min-h-[48px] w-full sm:w-auto sm:px-8",
                  })}
                  onClick={() => {
                            if (!projectId) return;
                    startTransition(async () => {
                      await signOffCalendarItem(projectId, post.id);
                      router.refresh();
                      onClose();
                    });
                  }}
                >
                          {pending ? "Working…" : batchMode ? "Approve this post" : "Approve for scheduling"}
                </button>
              </div>
                    ) : clientLocked ? (
                      <p className="rounded-lg border border-burgundy/10 bg-burgundy/[0.03] px-4 py-3 font-body text-sm text-burgundy/70">
                        You&apos;ve approved this post. The studio can reopen it for further feedback if needed.
                      </p>
                    ) : null}
                  </div>

                  {/* Mobile client: compact forms + sticky approve */}
                  <div className="space-y-4 md:hidden">
                    {canClientRequestRevision ? (
                      <form
                        key={`fb-revision-m-${post.id}`}
                        id={`client-revision-form-${post.id}`}
                        className="rounded-xl border border-burgundy/10 bg-white px-4 py-4 shadow-sm"
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (!projectId) return;
                          const fd = new FormData(e.currentTarget);
                          fd.set("feedbackAction", "revision");
                          startTransition(async () => {
                            await saveCalendarItemFeedback(projectId, post.id, fd);
                            router.refresh();
                            onClose();
                          });
                        }}
                      >
                        <label className="block font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/50">
                          Request changes
                        </label>
                        <div className="relative mt-2">
                          <div className="absolute right-3 top-3 z-10">
                            <EmojiPickerButton inputRef={clientRevisionMobileRef} />
                          </div>
                          <AutoGrowTextarea
                            ref={clientRevisionMobileRef}
                            name="clientFeedback"
                            required
                            minRows={3}
                            maxLength={4000}
                            placeholder="What should change?"
                            className={`cc-portal-client-input w-full ${tapTextareaBase} px-4 py-3 pr-11`}
                          />
                        </div>
                        <input type="hidden" name="feedbackAction" value="revision" />
                      </form>
                    ) : null}
                    {canClientCommentOnly ? (
                      <form
                        key={`fb-comment-m-${post.id}`}
                        id={`client-comment-form-${post.id}`}
                        className="rounded-xl border border-burgundy/10 bg-white px-4 py-4 shadow-sm"
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (!projectId) return;
                          const fd = new FormData(e.currentTarget);
                          fd.set("feedbackAction", "comment");
                          startTransition(async () => {
                            await saveCalendarItemFeedback(projectId, post.id, fd);
                            router.refresh();
                            onClose();
                          });
                        }}
                      >
                        <label className="block font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/50">
                          Comment only
                        </label>
                        <div className="relative mt-2">
                          <div className="absolute right-3 top-3 z-10">
                            <EmojiPickerButton inputRef={clientCommentMobileRef} />
                          </div>
                          <AutoGrowTextarea
                            ref={clientCommentMobileRef}
                            name="clientFeedback"
                            required
                            minRows={2}
                            maxLength={4000}
                            placeholder="Your comment…"
                            className={`cc-portal-client-input w-full ${tapTextareaBase} px-4 py-3 pr-11`}
                          />
                        </div>
                        <input type="hidden" name="feedbackAction" value="comment" />
                      </form>
                    ) : null}
                  </div>

                  {canClientApprove || canClientRequestRevision || canClientCommentOnly ? (
                    <div
                      className="absolute inset-x-0 bottom-0 z-40 flex flex-col gap-2 border-t border-burgundy/10 bg-cream/98 px-4 py-3 shadow-[0_-8px_24px_rgba(37,13,24,0.08)] backdrop-blur-md md:hidden"
                      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
                    >
                      {canClientApprove ? (
                        <button
                          type="button"
                          disabled={pending || !projectId}
                          className={ctaButtonClasses({
                            variant: "ink",
                            size: "md",
                            className: "min-h-[48px] w-full",
                          })}
                          onClick={() => {
                            if (!projectId) return;
                            startTransition(async () => {
                              await signOffCalendarItem(projectId, post.id);
                              router.refresh();
                              onClose();
                            });
                          }}
                        >
                          {pending ? "Working…" : batchMode ? "Approve this post" : "Approve for scheduling"}
                        </button>
                      ) : null}
                      {canClientRequestRevision ? (
                        <button
                          type="submit"
                          form={`client-revision-form-${post.id}`}
                          disabled={pending}
                          className={ctaButtonClasses({
                            variant: "outline",
                            size: "md",
                            className: "min-h-[48px] w-full",
                          })}
                        >
                          {pending ? "Sending…" : "Request changes"}
                        </button>
                      ) : null}
                      {canClientCommentOnly && !canClientRequestRevision ? (
                        <button
                          type="submit"
                          form={`client-comment-form-${post.id}`}
                          disabled={pending}
                          className={ctaButtonClasses({
                            variant: "outline",
                            size: "md",
                            className: "min-h-[48px] w-full",
                          })}
                        >
                          {pending ? "Sending…" : "Send comment"}
                        </button>
                      ) : null}
                      {canClientCommentOnly && canClientRequestRevision ? (
                        <button
                          type="submit"
                          form={`client-comment-form-${post.id}`}
                          disabled={pending}
                          className={ctaButtonClasses({
                            variant: "outline",
                            size: "md",
                            className: "min-h-[48px] w-full border-burgundy/20",
                          })}
                        >
                          {pending ? "Sending…" : "Send comment only"}
                        </button>
                      ) : null}
                    </div>
                  ) : null}

                  {clientLocked ? (
                    <p className="rounded-lg border border-burgundy/10 bg-burgundy/[0.03] px-4 py-3 font-body text-sm text-burgundy/70 md:hidden">
                      You&apos;ve approved this post. The studio can reopen it for further feedback if needed.
                    </p>
                  ) : null}
                </>
              )}
            </div>
          </div>
        </div>

        {/* iPhone: fixed studio primary actions (Save + Submit for review) */}
        {isStudio && projectIdForSave ? (
          <div
            className="absolute inset-x-0 bottom-0 z-40 hidden max-md:flex flex-col gap-2 border-t border-burgundy/10 bg-cream/98 px-4 py-3 shadow-[0_-8px_24px_rgba(37,13,24,0.08)] backdrop-blur-md"
            style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
          >
            <button
              type="submit"
              form={studioFormId}
              disabled={pending}
              className={ctaButtonClasses({
                variant: "ink",
                size: "md",
                className: "min-h-[48px] w-full",
              })}
            >
              {pending ? "Saving…" : studioDraftPhase ? "Save draft" : "Save changes"}
            </button>
            {canStudioSubmitForReview ? (
              <button
                type="button"
                disabled={pending}
                className={ctaButtonClasses({
                  variant: "outline",
                  size: "md",
                  className: "min-h-[48px] w-full border-burgundy/25",
                })}
                onClick={() =>
                  startTransition(async () => {
                    await submitCalendarPostForClientReview(projectIdForSave, post.id);
                    router.refresh();
                  })
                }
              >
                {pending ? "Working…" : "Submit for approval"}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
