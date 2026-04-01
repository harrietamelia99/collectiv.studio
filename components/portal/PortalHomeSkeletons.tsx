/** Streaming fallbacks for `/portal` home — keeps shell interactive while RSC data resolves. */

export function ClientProjectListSkeleton() {
  return (
    <ul className="mt-4 flex flex-col gap-2.5 sm:gap-4" aria-busy aria-label="Loading projects">
      {Array.from({ length: 3 }, (_, i) => (
        <li
          key={i}
          className="animate-pulse rounded-xl border border-zinc-200/60 bg-white px-4 py-4 shadow-sm sm:px-5 sm:py-5"
        >
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 shrink-0 rounded-lg bg-burgundy/[0.08]" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-5 w-[min(100%,14rem)] rounded bg-burgundy/[0.08]" />
              <div className="h-3 w-24 rounded bg-burgundy/[0.06]" />
              <div className="h-3 w-[min(100%,18rem)] rounded bg-burgundy/[0.05]" />
            </div>
          </div>
          <div className="mt-4 h-2 w-full rounded-full bg-burgundy/[0.06]" />
        </li>
      ))}
    </ul>
  );
}

export function StudioAgencyDashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse" aria-busy aria-label="Loading studio dashboard">
      <div className="cc-portal-client-shell">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
          <div className="mx-auto h-24 w-24 shrink-0 rounded-full bg-burgundy/[0.08] lg:mx-0" />
          <div className="min-w-0 flex-1 space-y-3">
            <div className="mx-auto h-8 w-56 rounded-md bg-burgundy/[0.1] lg:mx-0" />
            <div className="mx-auto h-4 w-full max-w-md rounded bg-burgundy/[0.06] lg:mx-0" />
          </div>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="h-40 rounded-xl border border-zinc-200/80 bg-white/80" />
        <div className="h-40 rounded-xl border border-zinc-200/80 bg-white/80" />
      </div>
      <div className="h-64 rounded-xl border border-zinc-200/80 bg-white/80" />
    </div>
  );
}
