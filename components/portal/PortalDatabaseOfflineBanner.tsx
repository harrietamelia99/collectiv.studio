/** Shown when the portal is open but the database is unreachable or not configured. */
export function PortalDatabaseOfflineBanner() {
  return (
    <div
      className="mb-6 rounded-xl border border-amber-200/90 bg-amber-50 px-4 py-3 font-body text-sm leading-relaxed text-amber-950 shadow-sm"
      role="status"
    >
      <p className="m-0 font-semibold text-amber-950">Working offline — database not connected</p>
      <p className="mt-2 mb-0 text-amber-950/90">
        Navigation, layout, and demo content below still work. Saving data, loading real projects, and server actions need a
        live database (e.g. connect Supabase and set <code className="rounded bg-amber-100/80 px-1 font-mono text-[12px]">DATABASE_URL</code>).
      </p>
    </div>
  );
}
