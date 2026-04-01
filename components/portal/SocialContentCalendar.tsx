"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ctaButtonClasses } from "@/components/ui/Button";
import { SocialCalendarAddPostModal } from "@/components/portal/SocialCalendarAddPostModal";
import { SocialCalendarPostModal } from "@/components/portal/SocialCalendarPostModal";
import { ClientProjectLogoAvatar } from "@/components/portal/ClientProjectLogoAvatar";
import { PortalEmptyState } from "@/components/portal/PortalEmptyState";
import { WorkflowStatusBadge } from "@/components/portal/WorkflowStatusBadge";
import { SocialPlatformIcon } from "@/components/portal/SocialPlatformIcon";
import type { CalendarActivityEntry } from "@/lib/calendar-activity-log";
import { isSocialCalendarMediaVideoUrl } from "@/lib/social-calendar-media";
import { formatUkWeekdayDayMonthLong, formatUkYearMonthLabel } from "@/lib/uk-datetime";
import { CalendarDays, ChevronLeft, ChevronRight, Plus } from "lucide-react";

export type SocialCalendarItem = {
  id: string;
  scheduledFor: string | null;
  title: string | null;
  caption: string;
  /** Studio scheduling: optional hashtag line; modal falls back to #tags in caption if blank. */
  hashtags?: string | null;
  clientSignedOff: boolean;
  clientFeedback: string | null;
  imageUrl: string | null;
  /** Always set by server mappers; optional so client preview never crashes on bad payloads. */
  channels?: string[];
  /** Studio master calendar: project metadata for labels and deep links */
  projectId?: string;
  projectName?: string;
  projectLogoPath?: string | null;
  /** Batch monthly workflow (when project has weekly schedule). */
  postWorkflowStatus?: string;
  postFormat?: string;
  planMonthKey?: string | null;
  isPlanPlaceholder?: boolean;
  /** Per-item batch workflow (e.g. studio master calendar where `batchMode` prop is false). */
  usesBatchCalendar?: boolean;
  /** Revision / approval timeline (server-parsed). */
  activityLog?: CalendarActivityEntry[];
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function addMonths(d: Date, n: number) {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

function sameCalendarDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function parseItemDate(iso: string | null): Date | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

function dateAtNoonLocal(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0, 0);
}

function toDatetimeLocalValue(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day}T${h}:${min}`;
}

function workflowPriority(s: string | undefined): number {
  switch (s) {
    case "REVISION_NEEDED":
      return 0;
    case "AWAITING_CONTENT":
      return 1;
    case "DRAFT":
      return 2;
    case "PENDING_APPROVAL":
      return 3;
    case "APPROVED":
      return 4;
    default:
      return 5;
  }
}

function worstWorkflowForCell(posts: SocialCalendarItem[], useBatch: boolean): string | undefined {
  if (!useBatch || !posts.length) return undefined;
  let best: string | undefined;
  let pr = 99;
  for (const q of posts) {
    const s = q.postWorkflowStatus ?? "PENDING_APPROVAL";
    const p = workflowPriority(s);
    if (p < pr) {
      pr = p;
      best = s;
    }
  }
  return best;
}

function cellBorderClassForWorkflow(s: string | undefined): string {
  switch (s) {
    case "REVISION_NEEDED":
      return "border-l-[4px] border-l-rose-600";
    case "AWAITING_CONTENT":
      return "border-l-[4px] border-l-zinc-400";
    case "DRAFT":
      return "border-l-[4px] border-l-sky-600";
    case "PENDING_APPROVAL":
      return "border-l-[4px] border-l-amber-500";
    case "APPROVED":
      return "border-l-[4px] border-l-emerald-600";
    default:
      return "";
  }
}

/** One row per project for stacked avatars in a day cell */
function uniqueProjectsForPosts(posts: SocialCalendarItem[]): SocialCalendarItem[] {
  const seen = new Map<string, SocialCalendarItem>();
  for (const p of posts) {
    const key = p.projectId ?? p.id;
    if (!seen.has(key)) seen.set(key, p);
  }
  return Array.from(seen.values());
}

function CalendarPostStrip({ post }: { post: SocialCalendarItem }) {
  const status = post.postWorkflowStatus ?? "PENDING_APPROVAL";
  const url = post.imageUrl;
  const isVideo = isSocialCalendarMediaVideoUrl(url);
  const ch = (post.channels ?? []).filter(Boolean).slice(0, 4);
  return (
    <div className="mt-1 flex w-full min-w-0 gap-1 rounded-md border border-burgundy/12 bg-white/90 p-0.5 shadow-sm">
      <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded bg-zinc-100">
        {url ? (
          isVideo ? (
            <video src={url} className="h-full w-full object-cover" muted playsInline preload="metadata" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element -- calendar thumbnail from CDN/upload URL
            <img src={url} alt="" className="h-full w-full object-cover" loading="lazy" />
          )
        ) : (
          <div className="flex h-full w-full items-center justify-center px-0.5 text-center font-body text-[6px] font-medium uppercase leading-tight text-burgundy/45">
            {(post.postFormat ?? "POST").slice(0, 4)}
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5 overflow-hidden">
        <div className="flex flex-wrap gap-0.5">
          {ch.length > 0 ? (
            ch.map((id) => <SocialPlatformIcon key={id} id={id} className="h-3 w-3 text-burgundy/75" />)
          ) : (
            <span className="font-body text-[6px] uppercase tracking-[0.06em] text-burgundy/40">No network</span>
          )}
        </div>
        <div className="min-w-0 scale-90 origin-top-left">
          <WorkflowStatusBadge status={status} compact />
        </div>
      </div>
    </div>
  );
}

function AggregateCellAvatars({ posts }: { posts: SocialCalendarItem[] }) {
  const rows = uniqueProjectsForPosts(posts);
  const show = rows.slice(0, 3);
  const extra = rows.length - 3;
  return (
    <div className="mt-1 flex justify-center">
      <div className="flex items-center justify-center -space-x-1.5">
        {show.map((p) => (
          <ClientProjectLogoAvatar
            key={p.projectId ?? p.id}
            logoPath={p.projectLogoPath}
            name={p.projectName ?? "Client"}
            size="xs"
            className="relative z-[1] ring-2 ring-white"
          />
        ))}
        {extra > 0 ? (
          <span
            className="relative z-[2] flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-burgundy/12 font-body text-[7px] font-bold text-burgundy ring-2 ring-white"
            title={`${extra} more client${extra === 1 ? "" : "s"}`}
          >
            +{extra}
          </span>
        ) : null}
      </div>
    </div>
  );
}

type Props = {
  items: SocialCalendarItem[];
  /** Client opens posts in a modal (image, caption, approve, feedback). */
  clientReviewMode?: boolean;
  projectId?: string;
  /** Studio: all clients’ posts — logos, names, links to each project’s social page */
  studioAggregate?: boolean;
  /** Studio master calendar: projects this viewer may post into (empty-day add + client picker). */
  studioMasterPostTargets?: { id: string; name: string }[];
  /** Studio on a single project: tap an empty day to add a post (requires `projectId`). */
  studioCanAddPosts?: boolean;
  /** Human-readable project name for the add-post modal (client assignment is implicit on this screen). */
  projectDisplayName?: string;
  /** Optional class on outer card (e.g. mt-8 on standalone page) */
  containerClassName?: string;
  /** Deep-link: open this post’s preview on load (`?post=` from notifications). */
  initialOpenPostId?: string | null;
  /** Weekly template enabled — status badges and month navigation in modal. */
  batchMode?: boolean;
};

export function SocialContentCalendar({
  items,
  clientReviewMode = false,
  projectId,
  studioAggregate = false,
  studioMasterPostTargets,
  studioCanAddPosts = false,
  projectDisplayName,
  containerClassName = "mt-10",
  initialOpenPostId = null,
  batchMode = false,
}: Props) {
  const [view, setView] = useState(() => startOfMonth(new Date()));
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [addPostDate, setAddPostDate] = useState<Date | null>(null);
  /** Posts navigable together in the preview modal (usually all posts on the tapped day). */
  const [modalPostsRing, setModalPostsRing] = useState<SocialCalendarItem[] | null>(null);
  /** True → client sign-off modal; false → studio read-only preview (project page or master calendar). */
  const [modalClientMode, setModalClientMode] = useState(false);

  /** Prefer full server-mapped row from `items`; fall back to the day ring so the modal never opens with a half-shaped object. */
  const effectiveModalPost = useMemo(() => {
    if (!activePostId) return null;
    const fromItems = items.find((i) => i.id === activePostId);
    const fromRing = modalPostsRing?.find((i) => i.id === activePostId);
    return fromItems ?? fromRing ?? null;
  }, [activePostId, items, modalPostsRing]);

  const postsForDayResolved = useMemo(() => {
    if (modalPostsRing && modalPostsRing.length > 0) return modalPostsRing;
    return effectiveModalPost ? [effectiveModalPost] : [];
  }, [modalPostsRing, effectiveModalPost]);

  const monthNavigationRing = useMemo(() => {
    const post = effectiveModalPost;
    const batchNav = batchMode || Boolean(post?.usesBatchCalendar);
    if (!batchNav || !post?.planMonthKey) return null;
    const key = post.planMonthKey;
    return [...items]
      .filter((i) => i.planMonthKey === key)
      .sort((a, b) => {
        const ta = parseItemDate(a.scheduledFor)?.getTime() ?? 0;
        const tb = parseItemDate(b.scheduledFor)?.getTime() ?? 0;
        if (ta !== tb) return ta - tb;
        return a.id.localeCompare(b.id);
      });
  }, [batchMode, effectiveModalPost?.planMonthKey, effectiveModalPost?.id, items]);

  useEffect(() => {
    if (activePostId && !effectiveModalPost) {
      setActivePostId(null);
      setModalPostsRing(null);
      setModalClientMode(false);
    }
  }, [activePostId, effectiveModalPost]);

  const { scheduled, unscheduled } = useMemo(() => {
    const sched: SocialCalendarItem[] = [];
    const unsched: SocialCalendarItem[] = [];
    for (const it of items) {
      if (parseItemDate(it.scheduledFor)) sched.push(it);
      else unsched.push(it);
    }
    return { scheduled: sched, unscheduled: unsched };
  }, [items]);

  const year = view.getFullYear();
  const month = view.getMonth();
  const monthLabel = formatUkYearMonthLabel(view.getFullYear(), view.getMonth());

  const firstDow = new Date(year, month, 1).getDay(); // 0 Sun
  const mondayOffset = firstDow === 0 ? 6 : firstDow - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = useMemo(() => {
    const out: { day: number; date: Date; posts: SocialCalendarItem[] }[] = [];
    for (let i = 0; i < mondayOffset; i++) {
      out.push({ day: 0, date: new Date(year, month, 1 - (mondayOffset - i)), posts: [] });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const posts = scheduled.filter((it) => {
        const t = parseItemDate(it.scheduledFor);
        return t && sameCalendarDay(t, date);
      });
      out.push({ day: d, date, posts });
    }
    return out;
  }, [year, month, mondayOffset, daysInMonth, scheduled]);

  const today = new Date();
  const selectedPosts = useMemo(() => {
    if (!selectedKey) return [];
    const [y, m, d] = selectedKey.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return scheduled.filter((it) => {
      const t = parseItemDate(it.scheduledFor);
      return t && sameCalendarDay(t, date);
    });
  }, [selectedKey, scheduled]);

  const openClientPostModal = (id: string, ring: SocialCalendarItem[]) => {
    if (!clientReviewMode || !projectId) return;
    setModalClientMode(true);
    setActivePostId(id);
    setModalPostsRing(ring);
  };

  const openStudioPreviewModal = (id: string, ring: SocialCalendarItem[]) => {
    setModalClientMode(false);
    setActivePostId(id);
    setModalPostsRing(ring);
  };

  const appliedDeepLinkPostId = useRef<string | null>(null);

  useEffect(() => {
    if (!initialOpenPostId?.trim()) {
      appliedDeepLinkPostId.current = null;
      return;
    }
    if (appliedDeepLinkPostId.current === initialOpenPostId) return;
    const item = items.find((i) => i.id === initialOpenPostId);
    if (!item) return;
    appliedDeepLinkPostId.current = initialOpenPostId;

    const t = parseItemDate(item.scheduledFor);
    if (t) {
      setView(startOfMonth(t));
      const key = `${t.getFullYear()}-${t.getMonth() + 1}-${t.getDate()}`;
      setSelectedKey(key);
      const ring = items.filter((it) => {
        const d = parseItemDate(it.scheduledFor);
        return d && sameCalendarDay(d, t);
      });
      const ringFinal = ring.length > 0 ? ring : [item];
      const monthRing =
        (batchMode || item.usesBatchCalendar) && item.planMonthKey
          ? [...items]
              .filter((i) => i.planMonthKey === item.planMonthKey)
              .sort((a, b) => {
                const ta = parseItemDate(a.scheduledFor)?.getTime() ?? 0;
                const tb = parseItemDate(b.scheduledFor)?.getTime() ?? 0;
                if (ta !== tb) return ta - tb;
                return a.id.localeCompare(b.id);
              })
          : null;
      const navRing = monthRing && monthRing.length > 0 ? monthRing : ringFinal;
      if (clientReviewMode && projectId) {
        setModalClientMode(true);
        setActivePostId(initialOpenPostId);
        setModalPostsRing(navRing);
      } else {
        setModalClientMode(false);
        setActivePostId(initialOpenPostId);
        setModalPostsRing(navRing);
      }
    } else {
      setSelectedKey(null);
      const monthRing =
        (batchMode || item.usesBatchCalendar) && item.planMonthKey
          ? [...items]
              .filter((i) => i.planMonthKey === item.planMonthKey)
              .sort((a, b) => {
                const ta = parseItemDate(a.scheduledFor)?.getTime() ?? 0;
                const tb = parseItemDate(b.scheduledFor)?.getTime() ?? 0;
                if (ta !== tb) return ta - tb;
                return a.id.localeCompare(b.id);
              })
          : null;
      const navRing = monthRing && monthRing.length > 0 ? monthRing : [item];
      if (clientReviewMode && projectId) {
        setModalClientMode(true);
        setActivePostId(initialOpenPostId);
        setModalPostsRing(navRing);
      } else {
        setModalClientMode(false);
        setActivePostId(initialOpenPostId);
        setModalPostsRing(navRing);
      }
    }

    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, [initialOpenPostId, items, clientReviewMode, projectId, batchMode]);

  const closePostModal = useCallback(() => {
    setActivePostId(null);
    setModalPostsRing(null);
    setModalClientMode(false);
  }, []);

  const closeAddPostModal = useCallback(() => setAddPostDate(null), []);

  const handleModalSelectPost = useCallback((id: string) => {
    setActivePostId(id);
  }, []);

  const handleStudioAddAnotherThisDay = useCallback(() => {
    const iso = effectiveModalPost?.scheduledFor ?? null;
    const parsed = parseItemDate(iso);
    if (!parsed) return;
    closePostModal();
    setAddPostDate(dateAtNoonLocal(parsed));
  }, [effectiveModalPost?.scheduledFor, closePostModal]);

  const cellMinH = studioAggregate
    ? "min-h-[3.5rem] md:min-h-[4.5rem]"
    : "min-h-[5.5rem] md:min-h-[6.5rem]";

  const title = studioAggregate ? "All clients’ content calendar" : "Monthly content calendar";

  const canAddFromMasterCalendar = Boolean(studioAggregate && studioMasterPostTargets?.length);

  const description = studioAggregate
    ? canAddFromMasterCalendar
      ? "Tap a day with posts to preview creative and copy, or tap an empty day to schedule a new post — choose the client, then add media, caption, and hashtags. Clients are notified when you submit for approval."
      : "Tap a day with posts to open a preview — creative, caption, and networks. Use ← → in the window when there are several posts that day, or open the project for edits."
    : batchMode
      ? clientReviewMode
        ? "Colours on the left of each day show the tightest status in that day (awaiting content, draft, pending your review, approved, or revision). Use ← → in the preview to move through the whole month in order."
        : "Fill placeholders with creative and copy, then submit the full month to the client. ← → steps through every post in that month. Day colours show status at a glance."
      : clientReviewMode
        ? "Tap a day that shows posts to open a preview (like a planner). Approve or leave feedback there. Multiple posts the same day? Use arrows in the preview or the chips under the calendar."
        : studioCanAddPosts
          ? "Tap any date to add a post (drawer) or to open existing ones. Empty days stay clickable — thumbnails, networks, and status show on days that have content."
          : "Tap a day with posts to preview the visual, full caption, and platforms.";

  return (
    <div className={`rounded-xl border border-zinc-200/90 bg-white p-5 shadow-sm md:p-8 ${containerClassName}`}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-display text-cc-h3 text-burgundy">{title}</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={ctaButtonClasses({
              variant: "outline",
              size: "sm",
              className: "flex h-11 w-11 min-w-[2.75rem] items-center justify-center px-0",
            })}
            title="Previous month"
            aria-label="Previous month"
            onClick={() => setView((v) => addMonths(v, -1))}
          >
            <ChevronLeft
              className="h-5 w-5 shrink-0 text-burgundy"
              strokeWidth={2.5}
              aria-hidden
            />
          </button>
          <span className="min-w-[10.5rem] text-center font-body text-[11px] uppercase tracking-[0.12em] text-burgundy">
            {monthLabel}
          </span>
          <button
            type="button"
            className={ctaButtonClasses({
              variant: "outline",
              size: "sm",
              className: "flex h-11 w-11 min-w-[2.75rem] items-center justify-center px-0",
            })}
            title="Next month"
            aria-label="Next month"
            onClick={() => setView((v) => addMonths(v, 1))}
          >
            <ChevronRight
              className="h-5 w-5 shrink-0 text-burgundy"
              strokeWidth={2.5}
              aria-hidden
            />
          </button>
        </div>
      </div>
      <p className="mt-2 max-w-2xl font-body text-sm text-burgundy/65">{description}</p>

      {items.length === 0 && !studioCanAddPosts && !canAddFromMasterCalendar ? (
        <div className="mt-8">
          <PortalEmptyState
            icon={CalendarDays}
            title="No posts in this calendar yet"
            description={
              studioAggregate
                ? "When you add dated posts from each client’s project (Social → Calendar), they’ll appear here in one combined view."
                : "Your studio will add scheduled posts here. You’ll open each one to review the creative, caption, and platforms — then approve or request changes."
            }
          />
        </div>
      ) : null}

      {items.length > 0 || studioCanAddPosts || canAddFromMasterCalendar ? (
        <div
          className="mt-6 grid grid-cols-7 gap-1 text-center font-body text-[10px] uppercase tracking-[0.08em] text-burgundy/45 md:gap-2 md:text-[11px]"
          role="grid"
          aria-label="Content calendar month"
        >
          {WEEKDAYS.map((w) => (
            <div key={w} className="py-2 font-medium">
              {w}
            </div>
          ))}
          {cells.map((cell, idx) => {
            if (cell.day === 0) {
              return <div key={`pad-${idx}`} className={`${cellMinH}`} aria-hidden />;
            }
            const isToday = sameCalendarDay(cell.date, today);
            const key = `${cell.date.getFullYear()}-${cell.date.getMonth() + 1}-${cell.date.getDate()}`;
            const hasPosts = cell.posts.length > 0;
            const selected = selectedKey === key;
            const worst = worstWorkflowForCell(
              cell.posts,
              batchMode || cell.posts.some((p) => p.usesBatchCalendar),
            );
            const ringForOpen = (first: SocialCalendarItem) =>
              batchMode && first.planMonthKey
                ? [...items]
                    .filter((i) => i.planMonthKey === first.planMonthKey)
                    .sort((a, b) => {
                      const ta = parseItemDate(a.scheduledFor)?.getTime() ?? 0;
                      const tb = parseItemDate(b.scheduledFor)?.getTime() ?? 0;
                      if (ta !== tb) return ta - tb;
                      return a.id.localeCompare(b.id);
                    })
                : cell.posts;
            return (
              <button
                key={key}
                type="button"
                role="gridcell"
                aria-label={`${formatUkWeekdayDayMonthLong(cell.date)}${
                  hasPosts
                    ? `, ${cell.posts.length} post${cell.posts.length === 1 ? "" : "s"}`
                    : canAddFromMasterCalendar
                      ? ", no posts — tap to add"
                      : ", no posts"
                }`}
                aria-pressed={selected}
                onClick={() => {
                  if (clientReviewMode && projectId && hasPosts) {
                    setSelectedKey(key);
                    const first = cell.posts[0]!;
                    openClientPostModal(first.id, ringForOpen(first));
                    return;
                  }
                  if (hasPosts) {
                    setSelectedKey(key);
                    const first = cell.posts[0]!;
                    openStudioPreviewModal(first.id, ringForOpen(first));
                    return;
                  }
                  if (canAddFromMasterCalendar) {
                    setSelectedKey(key);
                    setAddPostDate(dateAtNoonLocal(cell.date));
                    return;
                  }
                  if (studioCanAddPosts && projectId && !studioAggregate) {
                    setSelectedKey(key);
                    setAddPostDate(dateAtNoonLocal(cell.date));
                    return;
                  }
                  setSelectedKey(selected ? null : key);
                }}
                className={`flex ${cellMinH} flex-col items-stretch justify-start rounded-cc-card border px-0.5 py-1 text-left transition-colors md:px-1 md:py-1.5 ${cellBorderClassForWorkflow(worst)} ${
                  selected
                    ? "border-burgundy bg-burgundy/[0.08]"
                    : hasPosts
                      ? "border-burgundy/35 bg-burgundy/[0.04] hover:border-burgundy/55"
                      : "border-burgundy/10 bg-burgundy/[0.02] hover:border-burgundy/30"
                } ${isToday ? "ring-1 ring-burgundy/30" : ""}`}
              >
                <span className="w-full text-center font-body text-[12px] font-normal tabular-nums text-burgundy md:text-[13px]">
                  {cell.day}
                </span>
                {hasPosts ? (
                  studioAggregate ? (
                    <div className="mt-0.5 flex flex-col items-center">
                      <AggregateCellAvatars posts={cell.posts} />
                      <span className="mt-0.5 font-body text-[7px] uppercase tracking-[0.06em] text-burgundy/55 md:text-[8px]">
                        {cell.posts.length} post{cell.posts.length === 1 ? "" : "s"}
                      </span>
                    </div>
                  ) : (
                    <div className="mt-1 flex w-full min-w-0 flex-col gap-1">
                      {cell.posts.slice(0, 2).map((p) => (
                        <CalendarPostStrip key={p.id} post={p} />
                      ))}
                      {cell.posts.length > 2 ? (
                        <span className="text-center font-body text-[8px] font-medium uppercase tracking-[0.08em] text-burgundy/55">
                          +{cell.posts.length - 2} more
                        </span>
                      ) : null}
                    </div>
                  )
                ) : !studioAggregate && studioCanAddPosts && projectId ? (
                  <div className="mt-auto flex flex-1 items-end justify-center pb-0.5">
                    <span className="flex items-center gap-0.5 rounded-md border border-dashed border-burgundy/25 bg-burgundy/[0.03] px-1.5 py-1 font-body text-[7px] font-medium uppercase tracking-[0.08em] text-burgundy/40">
                      <Plus className="h-2.5 w-2.5" aria-hidden />
                      Add
                    </span>
                  </div>
                ) : canAddFromMasterCalendar ? (
                  <div className="mt-auto flex flex-1 items-end justify-center pb-0.5">
                    <span className="flex items-center gap-0.5 rounded-md border border-dashed border-burgundy/25 bg-burgundy/[0.03] px-1.5 py-1 font-body text-[7px] font-medium uppercase tracking-[0.08em] text-burgundy/40">
                      <Plus className="h-2.5 w-2.5" aria-hidden />
                      Add
                    </span>
                  </div>
                ) : !studioAggregate ? (
                  <div className="min-h-[1.25rem] flex-1" aria-hidden />
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}

      {items.length === 0 && studioCanAddPosts ? (
        <p className="mt-4 max-w-xl font-body text-sm text-burgundy/60">
          No posts yet — tap a day in the grid above to add the first one.
        </p>
      ) : null}
      {items.length === 0 && canAddFromMasterCalendar ? (
        <p className="mt-4 max-w-xl font-body text-sm text-burgundy/60">
          No posts yet — tap a day to add one: pick the client, then upload creative and add caption and hashtags.
        </p>
      ) : null}

      {selectedKey && selectedPosts.length > 0 && clientReviewMode && projectId && selectedPosts.length > 1 ? (
        <div className="mt-6 border-t-cc border-solid border-burgundy/12 pt-6">
          <p className="font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/55">Posts on this day</p>
          <p className="mt-1 max-w-xl font-body text-xs text-burgundy/55">
            Open a different post in the preview, or switch with ← → inside the popup.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {selectedPosts.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  const ring =
                    batchMode && p.planMonthKey
                      ? [...items]
                          .filter((i) => i.planMonthKey === p.planMonthKey)
                          .sort((a, b) => {
                            const ta = parseItemDate(a.scheduledFor)?.getTime() ?? 0;
                            const tb = parseItemDate(b.scheduledFor)?.getTime() ?? 0;
                            if (ta !== tb) return ta - tb;
                            return a.id.localeCompare(b.id);
                          })
                      : selectedPosts;
                  openClientPostModal(p.id, ring);
                }}
                className={`rounded-full border px-3 py-1.5 text-left font-body text-xs transition-colors ${
                  activePostId === p.id
                    ? "border-burgundy bg-burgundy/[0.1] text-burgundy"
                    : "border-burgundy/15 bg-white text-burgundy/85 hover:border-burgundy/35"
                }`}
              >
                {batchMode && p.postWorkflowStatus ? (
                  <span className="mb-1 block w-full">
                    <WorkflowStatusBadge status={p.postWorkflowStatus} compact />
                  </span>
                ) : null}
                {p.title?.trim() || "Untitled post"}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {selectedKey && selectedPosts.length > 1 && activePostId && !modalClientMode ? (
        <div className="mt-6 border-t-cc border-solid border-burgundy/12 pt-6">
          <p className="font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/55">Posts on this day</p>
          <p className="mt-1 max-w-xl font-body text-xs text-burgundy/55">
            Switch with ← → in the preview, or choose another title below.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {selectedPosts.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  const ring =
                    batchMode && p.planMonthKey
                      ? [...items]
                          .filter((i) => i.planMonthKey === p.planMonthKey)
                          .sort((a, b) => {
                            const ta = parseItemDate(a.scheduledFor)?.getTime() ?? 0;
                            const tb = parseItemDate(b.scheduledFor)?.getTime() ?? 0;
                            if (ta !== tb) return ta - tb;
                            return a.id.localeCompare(b.id);
                          })
                      : selectedPosts;
                  openStudioPreviewModal(p.id, ring);
                }}
                className={`rounded-full border px-3 py-1.5 text-left font-body text-xs transition-colors ${
                  activePostId === p.id
                    ? "border-burgundy bg-burgundy/[0.1] text-burgundy"
                    : "border-burgundy/15 bg-white text-burgundy/85 hover:border-burgundy/35"
                }`}
              >
                {studioAggregate && p.projectName?.trim() ? (
                  <span className="block font-body text-[9px] font-medium uppercase tracking-[0.08em] text-burgundy/45">
                    {p.projectName}
                  </span>
                ) : null}
                {batchMode && p.postWorkflowStatus ? (
                  <span className="mb-1 block w-full">
                    <WorkflowStatusBadge status={p.postWorkflowStatus} compact />
                  </span>
                ) : null}
                {p.title?.trim() || "Untitled post"}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {unscheduled.length > 0 ? (
        <div className="mt-8 border-t-cc border-solid border-burgundy/12 pt-6">
          <h3 className="font-display text-cc-h4 text-burgundy">No date set yet</h3>
          <p className="mt-1 font-body text-sm text-burgundy/65">
            {studioAggregate
              ? "These posts don’t have a scheduled day yet—open a project to set dates."
              : "These posts are in review but do not have a scheduled slot. The studio can add dates when you confirm timing."}
          </p>
          <ul className="mt-4 flex flex-col gap-2">
            {unscheduled.map((p) => (
              <li key={p.id}>
                {studioAggregate && p.projectId ? (
                  <button
                    type="button"
                    onClick={() => openStudioPreviewModal(p.id, [p])}
                    className="flex w-full min-w-0 items-start gap-2.5 rounded-lg border border-burgundy/10 bg-burgundy/[0.02] px-3 py-2 text-left transition-opacity hover:opacity-90"
                  >
                    <ClientProjectLogoAvatar
                      logoPath={p.projectLogoPath}
                      name={p.projectName ?? "Client"}
                      size="xs"
                      className="mt-0.5 shrink-0"
                    />
                    <span className="min-w-0 font-body text-[12px] leading-snug text-burgundy">
                      <span className="font-semibold">{p.projectName}</span>
                      <span className="text-burgundy/50"> — </span>
                      {p.title?.trim() || "Untitled"}
                      <span className="text-burgundy/55">
                        {" "}
                        ({p.clientSignedOff ? "signed off" : p.clientFeedback?.trim() ? "feedback" : "awaiting review"})
                      </span>
                    </span>
                  </button>
                ) : clientReviewMode && projectId ? (
                  <button
                    type="button"
                    onClick={() => openClientPostModal(p.id, [p])}
                    className="text-left font-body text-[12px] text-burgundy underline decoration-burgundy/25 underline-offset-4 hover:decoration-burgundy/50"
                  >
                    {p.title?.trim() || "Untitled"} —{" "}
                    {p.clientSignedOff ? "approved" : p.clientFeedback?.trim() ? "feedback sent" : "awaiting review"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => openStudioPreviewModal(p.id, [p])}
                    className="text-left font-body text-[12px] text-burgundy underline decoration-burgundy/25 underline-offset-4 hover:decoration-burgundy/50"
                  >
                    {p.title?.trim() || "Untitled"} —{" "}
                    {p.clientSignedOff ? "signed off" : "awaiting sign-off"}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {effectiveModalPost ? (
        <SocialCalendarPostModal
          post={effectiveModalPost}
          postsForDay={postsForDayResolved}
          navigationRing={monthNavigationRing ?? undefined}
          batchMode={batchMode}
          onSelectPost={handleModalSelectPost}
          onClose={closePostModal}
          mode={modalClientMode ? "client" : "studio"}
          projectId={projectId ?? effectiveModalPost.projectId}
          onStudioAddAnotherThisDay={
            studioCanAddPosts && projectId && !studioAggregate ? handleStudioAddAnotherThisDay : undefined
          }
        />
      ) : null}

      {addPostDate && canAddFromMasterCalendar && studioMasterPostTargets?.length ? (
        <SocialCalendarAddPostModal
          projectChoices={studioMasterPostTargets}
          defaultScheduledLocal={toDatetimeLocalValue(addPostDate)}
          onClose={closeAddPostModal}
        />
      ) : null}
      {addPostDate && projectId && !studioAggregate ? (
        <SocialCalendarAddPostModal
          projectId={projectId}
          assignedProjectName={projectDisplayName}
          defaultScheduledLocal={toDatetimeLocalValue(addPostDate)}
          onClose={closeAddPostModal}
        />
      ) : null}
    </div>
  );
}
