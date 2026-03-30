"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { dismissStudioAgencyInboxItem } from "@/app/portal/agency-actions";
import {
  AGENCY_INBOX_DISMISS_CALENDAR,
  AGENCY_INBOX_DISMISS_THREAD,
} from "@/lib/studio-agency-inbox-dismiss";
import { DashIconImageText, DashIconReply, StudioSectionIcon } from "@/components/portal/StudioDashboardIcons";

export type ThreadInboxRowUi = {
  projectId: string;
  projectName: string;
  lastMessage: {
    id: string;
    body: string;
    authorName: string | null;
    createdAt: string;
  };
  dismissAllowed: boolean;
  dismissEnabled: boolean;
};

export type CalendarInboxRowUi = {
  id: string;
  projectId: string;
  projectName: string;
  postLabel: string;
  clientFeedback: string;
  updatedAtIso: string;
  dismissAllowed: boolean;
  dismissEnabled: boolean;
};

function utcYmd(iso: string): string {
  return iso.slice(0, 10);
}

function InboxDismissIcon() {
  return (
    <svg
      className="h-4 w-4 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ThreadInboxCard({
  row,
  onDismissed,
}: {
  row: ThreadInboxRowUi;
  onDismissed: () => void;
}) {
  const last = row.lastMessage;
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  const runDismiss = () => {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("kind", AGENCY_INBOX_DISMISS_THREAD);
      fd.set("projectId", row.projectId);
      fd.set("anchorProjectMessageId", last.id);
      const res = await dismissStudioAgencyInboxItem(fd);
      if (res.ok) onDismissed();
      setConfirming(false);
    });
  };

  return (
    <li className="rounded-xl border border-zinc-200/90 bg-zinc-50/40 px-4 py-3">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <Link
            href={`/portal/project/${row.projectId}#project-messages`}
            className="font-body text-sm font-semibold text-burgundy underline-offset-2 hover:underline"
          >
            {row.projectName}
          </Link>
          <p className="mt-1 line-clamp-2 font-body text-[13px] leading-relaxed text-burgundy/70">
            <span className="text-burgundy/50">{last.authorName ?? "Client"} · </span>
            {last.body}
          </p>
          <p className="mt-1 font-body text-[11px] text-burgundy/45">{utcYmd(last.createdAt)}</p>
        </div>
        {row.dismissAllowed && row.dismissEnabled ? (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            aria-label="Dismiss from inbox"
            className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-zinc-300/90 bg-white text-burgundy/55 transition-colors hover:border-burgundy/30 hover:bg-burgundy/[0.05] hover:text-burgundy"
          >
            <InboxDismissIcon />
          </button>
        ) : null}
      </div>
      {row.dismissAllowed && !row.dismissEnabled ? (
        <p className="mt-2 font-body text-[11px] leading-snug text-burgundy/45">
          Mark the related notification as read to dismiss this from your inbox.
        </p>
      ) : null}
      {confirming ? (
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-zinc-200/80 pt-3">
          <p className="font-body text-xs text-burgundy/70">Dismiss this?</p>
          <button
            type="button"
            disabled={pending}
            onClick={runDismiss}
            className="rounded-full bg-burgundy px-3 py-1 font-body text-xs font-semibold text-cream disabled:opacity-50"
          >
            Confirm
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => setConfirming(false)}
            className="rounded-full border border-zinc-300 px-3 py-1 font-body text-xs font-medium text-burgundy disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      ) : null}
    </li>
  );
}

function CalendarInboxCard({
  row,
  onDismissed,
}: {
  row: CalendarInboxRowUi;
  onDismissed: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  const runDismiss = () => {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("kind", AGENCY_INBOX_DISMISS_CALENDAR);
      fd.set("projectId", row.projectId);
      fd.set("calendarItemId", row.id);
      fd.set("anchorCalendarUpdatedAt", row.updatedAtIso);
      const res = await dismissStudioAgencyInboxItem(fd);
      if (res.ok) onDismissed();
      setConfirming(false);
    });
  };

  return (
    <li className="rounded-xl border border-zinc-200/90 bg-zinc-50/40 px-4 py-3">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <Link
            href={`/portal/project/${row.projectId}/social/calendar?post=${encodeURIComponent(row.id)}`}
            className="font-body text-sm font-semibold text-burgundy underline-offset-2 hover:underline"
          >
            {row.projectName}
          </Link>
          <p className="mt-0.5 font-body text-[11px] text-burgundy/50">{row.postLabel}</p>
          <p className="mt-2 line-clamp-3 font-body text-[13px] leading-relaxed text-burgundy/75">{row.clientFeedback}</p>
        </div>
        {row.dismissAllowed && row.dismissEnabled ? (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            aria-label="Dismiss from inbox"
            className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-zinc-300/90 bg-white text-burgundy/55 transition-colors hover:border-burgundy/30 hover:bg-burgundy/[0.05] hover:text-burgundy"
          >
            <InboxDismissIcon />
          </button>
        ) : null}
      </div>
      {row.dismissAllowed && !row.dismissEnabled ? (
        <p className="mt-2 font-body text-[11px] leading-snug text-burgundy/45">
          Mark the related notification as read to dismiss this from your inbox.
        </p>
      ) : null}
      {confirming ? (
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-zinc-200/80 pt-3">
          <p className="font-body text-xs text-burgundy/70">Dismiss this?</p>
          <button
            type="button"
            disabled={pending}
            onClick={runDismiss}
            className="rounded-full bg-burgundy px-3 py-1 font-body text-xs font-semibold text-cream disabled:opacity-50"
          >
            Confirm
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => setConfirming(false)}
            className="rounded-full border border-zinc-300 px-3 py-1 font-body text-xs font-medium text-burgundy disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      ) : null}
    </li>
  );
}

export function StudioAgencyClientInboxSections({
  threadRows,
  calendarRows,
}: {
  threadRows: ThreadInboxRowUi[];
  calendarRows: CalendarInboxRowUi[];
}) {
  const [hiddenThreads, setHiddenThreads] = useState<Set<string>>(() => new Set());
  const [hiddenCal, setHiddenCal] = useState<Set<string>>(() => new Set());

  const threads = threadRows.filter((r) => !hiddenThreads.has(r.projectId));
  const calendars = calendarRows.filter((r) => !hiddenCal.has(r.id));

  const columnEmpty = threads.length === 0 && calendars.length === 0;

  return (
    <div className="space-y-8">
      {columnEmpty ? (
        <p className="font-body text-sm text-burgundy/55">You&apos;re all caught up — nothing new yet.</p>
      ) : null}

      {threads.length > 0 ? (
        <div className="flex items-start gap-2 sm:gap-3">
          <StudioSectionIcon Icon={DashIconReply} className="!h-9 !w-9 max-sm:mt-0.5" />
          <div className="min-w-0 flex-1">
            <h3 className="m-0 font-display text-lg tracking-[-0.02em] text-burgundy">Waiting on your reply</h3>
            <p className="mt-1 font-body text-sm text-burgundy/55">
              The latest message on the project thread is still from the client.
            </p>
            <ul className="mt-4 flex flex-col gap-2">
              {threads.map((row) => (
                <ThreadInboxCard
                  key={row.projectId}
                  row={row}
                  onDismissed={() =>
                    setHiddenThreads((prev) => {
                      const next = new Set(prev);
                      next.add(row.projectId);
                      return next;
                    })
                  }
                />
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      {calendars.length > 0 ? (
        <div className="flex items-start gap-2 sm:gap-3">
          <StudioSectionIcon Icon={DashIconImageText} className="!h-9 !w-9 max-sm:mt-0.5" />
          <div className="min-w-0 flex-1">
            <h3 className="m-0 font-display text-lg tracking-[-0.02em] text-burgundy">Calendar feedback</h3>
            <p className="mt-1 font-body text-sm text-burgundy/55">
              Notes clients left on posts that aren&apos;t signed off yet.
            </p>
            <ul className="mt-4 flex flex-col gap-2">
              {calendars.map((row) => (
                <CalendarInboxCard
                  key={row.id}
                  row={row}
                  onDismissed={() =>
                    setHiddenCal((prev) => {
                      const next = new Set(prev);
                      next.add(row.id);
                      return next;
                    })
                  }
                />
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
}
