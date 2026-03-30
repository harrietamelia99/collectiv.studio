"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { PhaseProgressBar } from "@/components/portal/PhaseProgressBar";
import { workflowHubTileIcon } from "@/components/portal/workflow-hub-tile-icon";

export type ClientWorkflowHubTileProps = {
  hubKey: string;
  href: string;
  title: string;
  subtitle: string;
  percent: number;
  hint: string;
  /** 1-based step within this project workstream (website, social, branding, etc.). */
  stepNumber?: number;
  locked?: boolean;
};

export function ClientWorkflowHubTile({
  hubKey,
  href,
  title,
  subtitle,
  percent,
  hint,
  locked,
  stepNumber,
}: ClientWorkflowHubTileProps) {
  const Icon = workflowHubTileIcon(hubKey);

  const tileBase =
    "group relative flex w-full gap-4 rounded-xl border p-5 text-left shadow-sm transition-[border-color,box-shadow,background-color]";
  const unlockedClasses = `${tileBase} border-zinc-200/90 bg-white hover:border-zinc-300 hover:shadow-md`;

  if (locked) {
    return (
      <div
        role="group"
        aria-label={
          stepNumber != null ? `Step ${stepNumber}: ${title}. Locked.` : `${title}. Locked.`
        }
        className={`${tileBase} cursor-default border-zinc-200/85 bg-zinc-50/90`}
      >
        <span
          className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-br from-burgundy/[0.05] via-zinc-50/50 to-zinc-200/45"
          aria-hidden
        />
        <span className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-burgundy/15 bg-white/95 text-burgundy shadow-sm backdrop-blur-[1px]">
          <Lock className="h-7 w-7" strokeWidth={2} aria-hidden />
        </span>
        <div className="relative flex min-w-0 flex-1 flex-col">
          <PhaseProgressBar
            variant="embedded"
            label={title}
            percent={percent}
            hint={hint}
            stepNumber={stepNumber}
            lockedVisual
          />
          {subtitle.trim() ? (
            <p className="mt-2 font-body text-xs font-medium text-burgundy/65">{subtitle}</p>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <Link
      href={href}
      scroll={!href.includes("#")}
      className={unlockedClasses}
      aria-label={stepNumber != null ? `Step ${stepNumber}: ${title}. Open.` : undefined}
    >
      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-burgundy/10 text-burgundy transition-colors group-hover:bg-burgundy group-hover:text-cream">
        <Icon className="h-7 w-7" aria-hidden />
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <PhaseProgressBar variant="embedded" label={title} percent={percent} hint={hint} stepNumber={stepNumber} />
        {subtitle.trim() ? (
          <p className="mt-2 font-body text-xs font-medium text-burgundy/70">{subtitle}</p>
        ) : null}
        <span className="mt-3 inline-flex items-center gap-1 font-body text-sm font-bold text-burgundy">
          Open
          <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </span>
      </div>
    </Link>
  );
}
