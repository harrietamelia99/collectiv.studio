export default function PortalLoading() {
  return (
    <div
      className="min-h-[50vh] space-y-6 pt-2 animate-pulse"
      aria-busy="true"
      aria-label="Loading portal"
    >
      <div className="h-9 w-[min(100%,14rem)] rounded-md bg-burgundy/[0.08]" />
      <div className="h-4 w-[min(100%,28rem)] rounded bg-burgundy/[0.06]" />
      <div className="h-4 w-[min(100%,20rem)] rounded bg-burgundy/[0.05]" />
      <div className="mt-8 h-40 rounded-xl border border-burgundy/10 bg-burgundy/[0.04]" />
    </div>
  );
}
