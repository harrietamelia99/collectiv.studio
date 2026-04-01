"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatUkAgendaDayLabel, formatUkYearMonthLabel } from "@/lib/uk-datetime";

export type StudioCalendarEvent = {
  id: string;
  kind: "todo" | "post";
  at: string;
  title: string;
  projectId: string;
  projectName: string;
  href: string;
  done?: boolean;
};

export type StudioCalendarTimeOff = {
  id: string;
  start: string;
  end: string;
  note: string;
};

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

/** Local calendar date key (no UTC shift for display grouping). */
function localYmd(y: number, m: number, d: number) {
  return `${y}-${pad2(m + 1)}-${pad2(d)}`;
}

function parseLocalYmd(key: string): { y: number; m: number; d: number } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (!m) return null;
  return { y: Number(m[1]), m: Number(m[2]) - 1, d: Number(m[3]) };
}

/** Event instant → local calendar key */
function eventLocalKey(iso: string): string {
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return "";
  return localYmd(dt.getFullYear(), dt.getMonth(), dt.getDate());
}

function mondayLeadingBlanks(year: number, monthIndex: number): number {
  const first = new Date(year, monthIndex, 1);
  const dow = first.getDay();
  return dow === 0 ? 6 : dow - 1;
}

function daysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function monthLabel(year: number, monthIndex: number) {
  return formatUkYearMonthLabel(year, monthIndex);
}

function isDayInTimeOff(y: number, m: number, d: number, startIso: string, endIso: string): boolean {
  const dayStart = new Date(y, m, d, 0, 0, 0, 0);
  const dayEnd = new Date(y, m, d, 23, 59, 59, 999);
  const s = new Date(startIso);
  const e = new Date(endIso);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return false;
  return dayStart <= e && dayEnd >= s;
}

type Props = {
  events: StudioCalendarEvent[];
  timeOff: StudioCalendarTimeOff[];
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function StudioDueCalendar({ events, timeOff }: Props) {
  const now = new Date();
  const [cursorY, setCursorY] = useState(now.getFullYear());
  const [cursorM, setCursorM] = useState(now.getMonth());

  const byDay = useMemo(() => {
    const map = new Map<string, StudioCalendarEvent[]>();
    for (const ev of events) {
      const key = eventLocalKey(ev.at);
      if (!key) continue;
      const list = map.get(key) ?? [];
      list.push(ev);
      map.set(key, list);
    }
    map.forEach((list) => {
      list.sort(
        (a: StudioCalendarEvent, b: StudioCalendarEvent) =>
          new Date(a.at).getTime() - new Date(b.at).getTime(),
      );
    });
    return map;
  }, [events]);

  const agenda = useMemo(() => {
    const dim = daysInMonth(cursorY, cursorM);
    const rows: { key: string; day: number; items: StudioCalendarEvent[] }[] = [];
    for (let d = 1; d <= dim; d++) {
      const key = localYmd(cursorY, cursorM, d);
      const items = byDay.get(key) ?? [];
      if (items.length) rows.push({ key, day: d, items });
    }
    return rows;
  }, [byDay, cursorY, cursorM]);

  const blanks = mondayLeadingBlanks(cursorY, cursorM);
  const dim = daysInMonth(cursorY, cursorM);
  const cells: ({ type: "blank" } | { type: "day"; d: number })[] = [
    ...Array.from({ length: blanks }, () => ({ type: "blank" as const })),
    ...Array.from({ length: dim }, (_, i) => ({ type: "day" as const, d: i + 1 })),
  ];

  function prevMonth() {
    if (cursorM === 0) {
      setCursorM(11);
      setCursorY((y) => y - 1);
    } else setCursorM((m) => m - 1);
  }

  function nextMonth() {
    if (cursorM === 11) {
      setCursorM(0);
      setCursorY((y) => y + 1);
    } else setCursorM((m) => m + 1);
  }

  function goToday() {
    const t = new Date();
    setCursorY(t.getFullYear());
    setCursorM(t.getMonth());
  }

  const isToday = (d: number) => {
    const t = new Date();
    return t.getFullYear() === cursorY && t.getMonth() === cursorM && t.getDate() === d;
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={prevMonth}
            className="rounded-full border border-burgundy bg-white px-3 py-1.5 font-body text-sm font-medium text-burgundy hover:bg-burgundy hover:text-cream"
            aria-label="Previous month"
          >
            ←
          </button>
          <h3 className="min-w-[10rem] text-center font-display text-lg tracking-[-0.02em] text-burgundy sm:min-w-[14rem] sm:text-xl">
            {monthLabel(cursorY, cursorM)}
          </h3>
          <button
            type="button"
            onClick={nextMonth}
            className="rounded-full border border-burgundy bg-white px-3 py-1.5 font-body text-sm font-medium text-burgundy hover:bg-burgundy hover:text-cream"
            aria-label="Next month"
          >
            →
          </button>
        </div>
        <button
          type="button"
          onClick={goToday}
          className="w-fit rounded-full bg-burgundy px-4 py-2 font-body text-sm font-semibold text-cream hover:opacity-90"
        >
          Today
        </button>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[280px] rounded-xl border border-zinc-200/90 bg-white p-3 shadow-sm sm:min-w-0 sm:p-4">
          <div className="grid grid-cols-7 gap-1 text-center font-body text-[10px] font-semibold uppercase tracking-[0.08em] text-burgundy/50 sm:text-[11px]">
            {WEEKDAYS.map((w) => (
              <div key={w} className="py-2">
                {w}
              </div>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {cells.map((cell, idx) => {
              if (cell.type === "blank") {
                return <div key={`b-${idx}`} className="min-h-[4.5rem] rounded-lg bg-zinc-100/40 sm:min-h-[5.5rem]" />;
              }
              const d = cell.d;
              const key = localYmd(cursorY, cursorM, d);
              const dayEvents = byDay.get(key) ?? [];
              const ooo = timeOff.some((t) => isDayInTimeOff(cursorY, cursorM, d, t.start, t.end));
              const today = isToday(d);

              return (
                <div
                  key={key}
                  className={`flex min-h-[4.5rem] flex-col rounded-lg border p-1 sm:min-h-[5.5rem] sm:p-1.5 ${
                    today ? "border-zinc-400 bg-zinc-100 ring-1 ring-zinc-300/60" : "border-zinc-200/80 bg-zinc-50/60"
                  } ${ooo ? "bg-amber-50/50" : ""}`}
                >
                  <div className="flex items-start justify-between gap-0.5">
                    <span
                      className={`font-body text-xs font-semibold tabular-nums sm:text-sm ${today ? "text-burgundy" : "text-burgundy/70"}`}
                    >
                      {d}
                    </span>
                    {ooo ? (
                      <span className="font-body text-[8px] font-medium uppercase tracking-wide text-amber-900/70" title="Time off">
                        OOO
                      </span>
                    ) : null}
                  </div>
                  <ul className="mt-0.5 flex flex-1 flex-col gap-0.5 overflow-hidden">
                    {dayEvents.slice(0, 3).map((ev) => (
                      <li key={ev.id} className="min-w-0">
                        <Link
                          href={ev.href}
                          className={`block truncate rounded px-0.5 py-0.5 font-body text-[9px] leading-tight sm:text-[10px] ${
                            ev.kind === "todo"
                              ? "bg-burgundy/15 text-burgundy hover:bg-burgundy/25"
                              : ev.done
                                ? "bg-burgundy/10 text-burgundy/55 line-through hover:bg-burgundy/15"
                                : "bg-burgundy/10 text-burgundy hover:bg-burgundy/20"
                          }`}
                          title={`${ev.title} — ${ev.projectName}`}
                        >
                          <span className="font-semibold">{ev.kind === "post" ? "Post: " : "Task: "}</span>
                          {ev.title}
                        </Link>
                      </li>
                    ))}
                    {dayEvents.length > 3 ? (
                      <li className="font-body text-[8px] text-burgundy/50">+{dayEvents.length - 3} more</li>
                    ) : null}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-display text-base tracking-[-0.02em] text-burgundy sm:text-lg">This month</h4>
        <p className="mt-1 font-body text-sm text-burgundy/55">
          Open tasks with due dates and scheduled social posts across active projects. Tap a row to open the project.
        </p>
        {agenda.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-burgundy/20 bg-burgundy/[0.03] px-4 py-6 text-center font-body text-sm text-burgundy/65">
            Nothing dated in this month — add due dates on tasks or schedule posts in each project&apos;s social calendar.
          </p>
        ) : (
          <ul className="mt-4 flex flex-col gap-2">
            {agenda.map(({ key, items }) => {
              const parsed = parseLocalYmd(key);
              const label = parsed ? formatUkAgendaDayLabel(parsed.y, parsed.m, parsed.d) : key;
              return (
                <li key={key} className="rounded-xl border border-burgundy/12 bg-white/80 p-3 sm:p-4">
                  <p className="font-body text-xs font-semibold uppercase tracking-[0.08em] text-burgundy/55">{label}</p>
                  <ul className="mt-2 flex flex-col gap-2">
                    {items.map((ev) => (
                      <li key={ev.id}>
                        <Link
                          href={ev.href}
                          className="group flex flex-col gap-0.5 rounded-lg border border-transparent px-1 py-1 hover:border-burgundy/15 hover:bg-burgundy/[0.04] sm:flex-row sm:items-center sm:justify-between"
                        >
                          <span className="font-body text-sm font-medium text-burgundy group-hover:underline">
                            <span className="text-burgundy/45">{ev.kind === "post" ? "Post · " : "Task · "}</span>
                            {ev.title}
                          </span>
                          <span className="font-body text-xs text-burgundy/50">{ev.projectName}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-burgundy/10 pt-4 font-body text-xs text-burgundy/55">
        <span>
          <span className="font-semibold text-burgundy">Task</span> — open item with a due date
        </span>
        <span>
          <span className="font-semibold text-burgundy">Post</span> — scheduled social content
        </span>
        <span>
          <span className="font-semibold text-amber-900/80">OOO</span> — time off in your profile
        </span>
      </div>
    </div>
  );
}
