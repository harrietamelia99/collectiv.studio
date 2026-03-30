/** Temporary fill until real photos / logos - `tone="cream"` for burgundy|cream section grids. */

export function ImagePlaceholderFill({
  className = "",
  tone = "muted",
}: {
  className?: string;
  /** `muted` = neutral grey blocks; `cream` = site cream (e.g. package pages). */
  tone?: "muted" | "cream";
}) {
  const bg = tone === "cream" ? "bg-cream" : "bg-zinc-400";
  return <div className={`absolute inset-0 ${bg} ${className}`} aria-hidden />;
}
