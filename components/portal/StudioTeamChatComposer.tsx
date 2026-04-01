"use client";

import { useMemo, useRef } from "react";
import { postStudioTeamChatMessage } from "@/app/portal/agency-actions";
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
    <PortalFormWithFlash
      action={action}
      className="border-t border-burgundy/10 p-3"
      defaultSuccessMessage="Message sent ✓"
    >
      <label className="sr-only" htmlFor="studio-team-chat-body">
        Message
      </label>
      <div className="flex gap-2">
        <div className="relative min-w-0 flex-1">
          <div className="absolute right-1.5 top-2 z-10">
            <EmojiPickerButton inputRef={bodyRef} size="md" />
          </div>
          <textarea
            ref={bodyRef}
            id="studio-team-chat-body"
            name="body"
            rows={2}
            maxLength={4000}
            placeholder="Type a message… @Issy @Harriet @May"
            className="min-h-[2.75rem] w-full resize-y rounded-cc-card border border-burgundy/15 bg-white py-2 pl-3 pr-11 font-body text-sm text-burgundy outline-none ring-burgundy/20 placeholder:text-burgundy/45 focus:ring-2"
          />
        </div>
        <PortalFormSubmitButton
          idleLabel="Send"
          pendingLabel="Sending…"
          successLabel="Sent ✓"
          errorFallback="Couldn’t send message. Try again."
          variant="burgundy"
          size="sm"
          className="h-fit shrink-0 self-end rounded-cc-card px-3 py-2 text-[11px] font-normal uppercase tracking-[0.1em]"
        />
      </div>
      <p className="mt-2 font-body text-[10px] leading-snug text-burgundy/45">
        @mention a teammate to email them. This thread is studio-only.
      </p>
    </PortalFormWithFlash>
  );
}
