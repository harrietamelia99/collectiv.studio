"use client";

import { useMemo, useState } from "react";
import { saveSocialWeeklySchedule } from "@/app/portal/social-batch-actions";
import { CALENDAR_CHANNEL_OPTIONS } from "@/lib/calendar-channels";
import {
  SOCIAL_POST_FORMATS,
  type SocialWeeklySlot,
  labelForPostFormat,
  parseSocialWeeklyScheduleJson,
} from "@/lib/social-batch-calendar";
import { ctaButtonClasses } from "@/components/ui/Button";

const WEEKDAY_CHIPS: { label: string; value: number }[] = [
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 },
  { label: "Sun", value: 0 },
];

function emptySlot(): SocialWeeklySlot {
  return { postType: "GRAPHIC", channels: ["instagram"], weekdays: [1] };
}

type Props = {
  projectId: string;
  initialJson: string;
};

export function SocialWeeklyScheduleEditor({ projectId, initialJson }: Props) {
  const initialSlots = useMemo(() => {
    const p = parseSocialWeeklyScheduleJson(initialJson);
    return p.length ? p : [emptySlot()];
  }, [initialJson]);

  const [slots, setSlots] = useState<SocialWeeklySlot[]>(initialSlots);

  const toggleWeekday = (si: number, d: number) => {
    setSlots((prev) => {
      const next = [...prev];
      const s = { ...next[si]! };
      const set = new Set(s.weekdays);
      if (set.has(d)) set.delete(d);
      else set.add(d);
      s.weekdays = Array.from(set).sort((a, b) => a - b);
      next[si] = s;
      return next;
    });
  };

  const toggleChannel = (si: number, ch: string) => {
    setSlots((prev) => {
      const next = [...prev];
      const s = { ...next[si]! };
      const set = new Set(s.channels);
      if (set.has(ch)) set.delete(ch);
      else set.add(ch);
      s.channels = Array.from(set);
      if (s.channels.length === 0) s.channels = ["instagram"];
      next[si] = s;
      return next;
    });
  };

  const scheduleJson = JSON.stringify(slots);
  const slotsPerWeek = useMemo(() => slots.reduce((acc, s) => acc + s.weekdays.length, 0), [slots]);

  return (
    <div className="mt-8 rounded-xl border border-burgundy/12 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="font-display text-lg tracking-[-0.02em] text-burgundy">Weekly post schedule</h2>
      <p className="mt-2 max-w-2xl font-body text-sm leading-relaxed text-burgundy/65">
        Define how many posts run each week, which format each slot uses, platforms, and weekdays. The portal
        generates empty calendar placeholders month by month from this template (current month only until the next
        month begins).
      </p>
      <p className="mt-2 font-body text-sm font-medium text-burgundy/80">
        Total post slots per week: {slotsPerWeek}
      </p>

      <form
        action={saveSocialWeeklySchedule.bind(null, projectId)}
        className="mt-6 space-y-6"
      >
        <input type="hidden" name="scheduleJson" value={scheduleJson} readOnly />

        {slots.map((slot, si) => (
          <div
            key={si}
            className="rounded-xl border border-burgundy/10 bg-cream/40 px-4 py-4 sm:px-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/50">
                Post slot {si + 1}
              </span>
              {slots.length > 1 ? (
                <button
                  type="button"
                  onClick={() => setSlots((p) => p.filter((_, i) => i !== si))}
                  className="font-body text-[11px] text-rose-700 underline-offset-2 hover:underline"
                >
                  Remove slot
                </button>
              ) : null}
            </div>

            <label className="mt-3 block font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/55">
              Format
              <select
                value={slot.postType}
                onChange={(e) =>
                  setSlots((p) => {
                    const n = [...p];
                    n[si] = { ...n[si]!, postType: e.target.value as SocialWeeklySlot["postType"] };
                    return n;
                  })
                }
                className="mt-1.5 w-full max-w-xs rounded-cc-card border border-burgundy/15 bg-white px-3 py-2 font-body text-sm text-burgundy"
              >
                {SOCIAL_POST_FORMATS.map((f) => (
                  <option key={f} value={f}>
                    {labelForPostFormat(f)}
                  </option>
                ))}
              </select>
            </label>

            <div className="mt-4">
              <span className="font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/55">Weekdays</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {WEEKDAY_CHIPS.map(({ label, value }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleWeekday(si, value)}
                    className={`rounded-full border px-3 py-1.5 font-body text-[11px] uppercase tracking-[0.08em] transition-colors ${
                      slot.weekdays.includes(value)
                        ? "border-burgundy bg-burgundy text-cream"
                        : "border-burgundy/20 bg-white text-burgundy/70 hover:border-burgundy/40"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <span className="font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/55">Platforms</span>
              <div className="mt-2 flex flex-wrap gap-3">
                {CALENDAR_CHANNEL_OPTIONS.map((ch) => (
                  <label key={ch.id} className="flex items-center gap-2 font-body text-sm text-burgundy/80">
                    <input
                      type="checkbox"
                      checked={slot.channels.includes(ch.id)}
                      onChange={() => toggleChannel(si, ch.id)}
                    />
                    {ch.label}
                  </label>
                ))}
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => setSlots((p) => [...p, emptySlot()])}
          className={ctaButtonClasses({ variant: "outline", size: "sm" })}
        >
          Add another post slot
        </button>

        <div>
          <button type="submit" className={ctaButtonClasses({ variant: "ink", size: "md" })}>
            Save weekly schedule
          </button>
          <p className="mt-2 font-body text-[11px] text-burgundy/45">
            Saving resets the placeholder-generation cursor; existing posts are kept. New months pick up from this
            template.
          </p>
        </div>
      </form>
    </div>
  );
}
