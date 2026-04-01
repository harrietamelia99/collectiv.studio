import dynamic from "next/dynamic";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Social content calendar | Studio portal",
  description: "All clients’ scheduled social posts in one calendar.",
};

function SocialCalendarLoading() {
  return (
    <div className="mt-8 space-y-4 animate-pulse" aria-busy aria-label="Loading calendar">
      <div className="h-10 w-48 rounded-md bg-burgundy/[0.08]" />
      <div className="h-4 max-w-2xl rounded bg-burgundy/[0.06]" />
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-32 rounded-lg border border-zinc-200/80 bg-white/70" />
        ))}
      </div>
    </div>
  );
}

const StudioSocialCalendarContent = dynamic(
  () => import("./StudioSocialCalendarContent"),
  { loading: () => <SocialCalendarLoading />, ssr: true },
);

export default function StudioSocialMasterCalendarPage() {
  return (
    <div>
      <StudioSocialCalendarContent />
    </div>
  );
}
