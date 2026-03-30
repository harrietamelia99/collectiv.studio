"use client";

import { portalFilePublicUrl } from "@/lib/portal-file-url";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0]![0] + parts[1]![0]).toUpperCase();
  const w = parts[0] ?? "?";
  return w.slice(0, 2).toUpperCase();
}

const sizeClass: Record<"xs" | "sm" | "md" | "lg", string> = {
  xs: "h-5 w-5 shrink-0 text-[7px]",
  sm: "h-10 w-10 shrink-0 text-[11px]",
  md: "h-12 w-12 shrink-0 text-xs",
  lg: "h-14 w-14 shrink-0 text-sm",
};

/**
 * Circular “profile” for a project: primary uploaded logo when present, else initials from the project name.
 */
export function ClientProjectLogoAvatar({
  logoPath,
  name,
  size = "md",
  className = "",
}: {
  logoPath: string | null | undefined;
  name: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}) {
  const box = sizeClass[size];
  const trimmed = logoPath?.trim();
  if (trimmed) {
    return (
      <span
        className={`relative inline-flex shrink-0 overflow-hidden rounded-full border border-zinc-200/90 bg-white ${box} ${className}`}
        title={name}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- portal uploads via dynamic API route */}
        <img
          src={portalFilePublicUrl(trimmed)}
          alt=""
          className="h-full w-full object-cover object-center"
        />
      </span>
    );
  }
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full border border-zinc-200/90 bg-burgundy/[0.08] font-body font-semibold uppercase text-burgundy ${box} ${className}`}
      title={name}
      role="img"
      aria-label={name || "Project"}
    >
      {initials(name || "?")}
    </span>
  );
}
