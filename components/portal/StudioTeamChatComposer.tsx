"use client";

import { useRef } from "react";
import { postStudioTeamChatMessage } from "@/app/portal/agency-actions";
import { PORTAL_CLIENT_INPUT_CLASS } from "@/components/portal/PortalSectionCard";
import { EmojiPickerButton } from "@/components/ui/EmojiPickerButton";
import { ctaButtonClasses } from "@/components/ui/Button";

export function StudioTeamChatComposer() {
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  return (
    <form action={postStudioTeamChatMessage} className="mt-5 flex flex-col gap-2">
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
      <button
        type="submit"
        className={ctaButtonClasses({
          variant: "burgundy",
          size: "sm",
          isSubmit: true,
          className: "self-end font-mono text-[11px] font-semibold uppercase tracking-[0.1em]",
        })}
      >
        Send
      </button>
    </form>
  );
}
