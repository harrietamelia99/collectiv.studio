"use client";

import { useMemo, useRef } from "react";
import { postStudioTeamChatMessage } from "@/app/portal/agency-actions";
import { PORTAL_CLIENT_INPUT_CLASS } from "@/components/portal/PortalSectionCard";
import { PortalFormSubmitButton } from "@/components/portal/PortalFormSubmitButton";
import { PortalFormWithFlash } from "@/components/portal/PortalFormWithFlash";
import { EmojiPickerButton } from "@/components/ui/EmojiPickerButton";
import type { PortalFormFlash } from "@/lib/portal-form-flash";

export function StudioTeamChatComposer() {
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const action = useMemo(
    () => async (_prev: PortalFormFlash | null, fd: FormData) => postStudioTeamChatMessage(fd),
    [],
  );

  return (
    <PortalFormWithFlash action={action} className="mt-5 flex flex-col gap-2">
      <label className="sr-only" htmlFor="studio-team-chat-body">
        Message
      </label>
      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">New message</p>
      <div className="relative">
        <div className="absolute right-2 top-2 z-10">
          <EmojiPickerButton inputRef={bodyRef} size="md" />
        </div>
        <textarea
          ref={bodyRef}
          id="studio-team-chat-body"
          name="body"
          rows={3}
          maxLength={4000}
          placeholder="Quick note… @Issy @Harriet @May"
          className={`${PORTAL_CLIENT_INPUT_CLASS} resize-y rounded-xl border-zinc-200 pr-12 font-mono text-[13px] text-zinc-800 placeholder:text-zinc-400`}
        />
      </div>
      <PortalFormSubmitButton
        idleLabel="Send"
        pendingLabel="Sending…"
        successLabel="Message sent ✓"
        errorFallback="Couldn’t send message. Try again."
        variant="burgundy"
        size="sm"
        className="self-end font-mono text-[11px] font-semibold uppercase tracking-[0.1em]"
      />
    </PortalFormWithFlash>
  );
}
