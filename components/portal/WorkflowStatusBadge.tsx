"use client";

import type { LucideIcon } from "lucide-react";
import {
  CheckCircle,
  Clock,
  FileText,
  Hourglass,
  Lock,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { workflowStatusLabel, type CalendarWorkflowStatus } from "@/lib/social-batch-calendar";

const SIZING_NORMAL =
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-body text-[10px] font-semibold uppercase tracking-[0.08em] ring-1";
const SIZING_COMPACT =
  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-body text-[9px] font-semibold uppercase tracking-[0.06em] ring-1";

type Row = { Icon: LucideIcon; colors: string };

const ROWS: Record<string, Row> = {
  AWAITING_CONTENT: {
    Icon: Clock,
    colors: "bg-zinc-100 text-zinc-800 ring-zinc-200/80",
  },
  DRAFT: {
    Icon: FileText,
    colors: "bg-sky-50 text-sky-900 ring-sky-200/90",
  },
  PENDING_APPROVAL: {
    Icon: Hourglass,
    colors: "bg-amber-50 text-amber-950 ring-amber-200/90",
  },
  APPROVED: {
    Icon: CheckCircle,
    colors: "bg-emerald-50 text-emerald-900 ring-emerald-200/90",
  },
  REVISION_NEEDED: {
    Icon: MessageCircle,
    colors: "bg-rose-50 text-rose-900 ring-rose-200/90",
  },
  COMPLETE: {
    Icon: Sparkles,
    colors: "bg-burgundy text-cream ring-burgundy/30",
  },
  LOCKED: {
    Icon: Lock,
    colors: "bg-zinc-100 text-zinc-700 ring-zinc-200/80",
  },
};

/** Batch / monthly workflow pill with icon + label. */
export function WorkflowStatusBadge({
  status,
  compact,
}: {
  status: CalendarWorkflowStatus | string;
  compact?: boolean;
}) {
  const key = String(status).trim();
  const row = ROWS[key] ?? {
    Icon: Sparkles,
    colors: "bg-burgundy/90 text-cream ring-burgundy/30",
  };
  const Icon = row.Icon;
  const wrap = compact ? SIZING_COMPACT : SIZING_NORMAL;
  const iconCls = compact ? "h-3 w-3 shrink-0 stroke-[2]" : "h-3.5 w-3.5 shrink-0 stroke-[2]";
  return (
    <span className={`${wrap} ${row.colors}`}>
      <Icon className={iconCls} aria-hidden />
      {workflowStatusLabel(key)}
    </span>
  );
}
