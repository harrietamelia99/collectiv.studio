"use client";

import { verifyClient } from "@/app/portal/actions";
import { ctaButtonClasses } from "@/components/ui/Button";

type Props = {
  projectId: string;
  /** When true, deposit must be marked paid before the hub action is available. */
  depositRequired: boolean;
  contractSigned: boolean;
  depositPaid: boolean;
  /** `false` when the client already has full hub access. */
  hubLocked: boolean;
};

export function AgencyOpenFullClientHubButton({
  projectId,
  depositRequired,
  contractSigned,
  depositPaid,
  hubLocked,
}: Props) {
  if (!hubLocked) return null;

  const prerequisitesMet = contractSigned && (!depositRequired || depositPaid);
  const disabledTitle = !contractSigned
    ? "Mark the contract as signed first."
    : depositRequired && !depositPaid
      ? "Mark the deposit as paid first."
      : undefined;

  if (!prerequisitesMet) {
    return (
      <span className="inline-flex flex-col gap-1">
        <button
          type="button"
          disabled
          title={disabledTitle}
          className={ctaButtonClasses({
            variant: "burgundy",
            size: "sm",
            className: "cursor-not-allowed opacity-45",
          })}
        >
          Open full client hub
        </button>
        {disabledTitle ? (
          <span className="max-w-xs font-body text-[11px] leading-snug text-burgundy/50">{disabledTitle}</span>
        ) : null}
      </span>
    );
  }

  return (
    <form action={verifyClient.bind(null, projectId)}>
      <button type="submit" className={ctaButtonClasses({ variant: "burgundy", size: "sm" })}>
        Open full client hub
      </button>
    </form>
  );
}
