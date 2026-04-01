"use client";

import { useRef } from "react";
import { postProjectMessageFormAction } from "@/app/portal/actions";
import { PORTAL_CLIENT_FORM_WELL_CLASS } from "@/components/portal/PortalSectionCard";
import { PortalFormSubmitButton } from "@/components/portal/PortalFormSubmitButton";
import { PortalFormWithFlash } from "@/components/portal/PortalFormWithFlash";
import { EmojiPickerButton } from "@/components/ui/EmojiPickerButton";

type Props = {
  projectId: string;
  variant: "clientEmphasis" | "studio";
};

export function ProjectMessageComposer({ projectId, variant }: Props) {
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const fieldId = `project-message-${projectId}`;

  const textareaClass =
    variant === "clientEmphasis"
      ? "cc-portal-client-input min-h-[7rem] pr-12"
      : "w-full rounded-cc-card border border-burgundy/15 bg-cream px-4 py-3 pr-12 font-body text-sm text-burgundy outline-none ring-burgundy/20 placeholder:text-burgundy/35 focus:ring-2";

  const formClass =
    variant === "clientEmphasis"
      ? "mt-6 border-t border-burgundy/15 pt-6 lg:max-w-4xl"
      : "mt-8 max-w-2xl lg:max-w-4xl";

  const inner =
    variant === "clientEmphasis" ? (
      <div className={PORTAL_CLIENT_FORM_WELL_CLASS}>
        <label htmlFor={fieldId} className="sr-only">
          Your message
        </label>
        <div className="relative">
          <div className="absolute right-2 top-2 z-10">
            <EmojiPickerButton inputRef={bodyRef} size="md" />
          </div>
          <textarea
            ref={bodyRef}
            id={fieldId}
            name="body"
            required
            rows={5}
            maxLength={8000}
            placeholder="Type your feedback or question…"
            className={textareaClass}
          />
        </div>
        <PortalFormSubmitButton
          idleLabel="Send message"
          pendingLabel="Sending…"
          successLabel="Message sent ✓"
          errorFallback="Couldn’t send your message. Try again."
          variant="burgundy"
          size="md"
          className="mt-4 tracking-[0.14em]"
        />
      </div>
    ) : (
      <>
        <label htmlFor={fieldId} className="sr-only">
          Your message
        </label>
        <div className="relative">
          <div className="absolute right-2 top-2 z-10">
            <EmojiPickerButton inputRef={bodyRef} size="md" />
          </div>
          <textarea
            ref={bodyRef}
            id={fieldId}
            name="body"
            required
            rows={5}
            maxLength={8000}
            placeholder="Type your feedback or question…"
            className={textareaClass}
          />
        </div>
        <PortalFormSubmitButton
          idleLabel="Send message"
          pendingLabel="Sending…"
          successLabel="Message sent ✓"
          errorFallback="Couldn’t send your message. Try again."
          variant="burgundy"
          size="md"
          className="mt-4 tracking-[0.14em]"
        />
      </>
    );

  return (
    <PortalFormWithFlash
      action={postProjectMessageFormAction}
      className={formClass}
      defaultSuccessMessage="Message sent ✓"
      onFlash={(flash) => {
        if (flash?.ok && bodyRef.current) {
          bodyRef.current.value = "";
        }
      }}
    >
      <input type="hidden" name="projectId" value={projectId} />
      {inner}
    </PortalFormWithFlash>
  );
}
