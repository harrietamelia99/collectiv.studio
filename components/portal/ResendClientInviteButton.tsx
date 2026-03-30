"use client";

import { useState, useTransition } from "react";
import { resendClientPortalInvite } from "@/app/portal/agency-actions";
import { ctaButtonClasses } from "@/components/ui/Button";

export function ResendClientInviteButton({ projectId }: { projectId: string }) {
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          setMsg(null);
          startTransition(async () => {
            const r = await resendClientPortalInvite(projectId);
            setMsg(r.ok ? "Invite sent again — they have a fresh 7-day link." : r.error ?? "Something went wrong.");
          });
        }}
        className={ctaButtonClasses({
          variant: "burgundy",
          size: "sm",
          className: "w-full disabled:opacity-60",
        })}
      >
        {pending ? "Sending…" : "Resend invite"}
      </button>
      {msg ? (
        <p className="m-0 font-body text-[11px] leading-snug text-burgundy/70" role="status">
          {msg}
        </p>
      ) : null}
    </div>
  );
}
