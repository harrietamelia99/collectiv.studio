"use client";

import { useMemo, useState } from "react";
import { PortalInspirationLinksSaveForm } from "@/components/portal/portal-flash-action-forms";
import {
  type InspirationLink,
  type InspirationLinkKind,
  detectInspirationKind,
  inspirationKindLabel,
} from "@/lib/portal-inspiration-links";
import { ctaButtonClasses } from "@/components/ui/Button";
import { PortalSectionCard, PortalStepSavedBadge } from "@/components/portal/PortalSectionCard";

type Props = {
  projectId: string;
  initialLinks: InspirationLink[];
  canEdit: boolean;
  /** Stronger frame for client portal (edit or read-only). */
  clientEmphasis?: boolean;
  /** Anchor id for hub shortcuts; omit on sub-pages to avoid duplicate ids. */
  sectionId?: string | null;
  /** Client account not verified yet — show notice instead of the editor. */
  pendingVerification?: boolean;
  className?: string;
  /**
   * Renders inside another section (e.g. social Step 1) without a second outer card —
   * avoids a floating block between unrelated areas on the hub.
   */
  embedded?: boolean;
  /** Unique heading id when `embedded` (avoid duplicate `inspiration-heading` on a page). */
  embeddedHeadingId?: string;
  /** Hide the panel lead-in when the parent page already introduces this step (avoids duplicate copy). */
  omitDescription?: boolean;
};

const emptyRow = (): InspirationLink => ({ url: "", label: "", kind: "other" });

function ReadOnlyLinkList({ links, clientEmphasis }: { links: InspirationLink[]; clientEmphasis: boolean }) {
  if (links.length === 0) {
    return <p className="m-0 font-body text-sm text-burgundy/60">No inspiration links added yet.</p>;
  }
  return (
    <ul className="m-0 list-none space-y-3 p-0">
      {links.map((link, i) => (
        <li
          key={`${link.url}-${i}`}
          className={`flex flex-col gap-1 rounded-xl border bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${
            clientEmphasis ? "border-zinc-200/90" : "border-burgundy/15"
          }`}
        >
          <div>
            <span className="font-body text-[9px] uppercase tracking-[0.12em] text-burgundy/50">
              {inspirationKindLabel(link.kind)}
            </span>
            {link.label ? <p className="font-body text-sm font-medium text-burgundy">{link.label}</p> : null}
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-0.5 inline-block break-all font-body text-sm text-burgundy underline-offset-2 hover:underline"
            >
              {link.url}
            </a>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function InspirationLinksPanel({
  projectId,
  initialLinks,
  canEdit,
  clientEmphasis = false,
  sectionId = "project-inspiration",
  pendingVerification = false,
  className = "",
  embedded = false,
  embeddedHeadingId = "inspiration-embedded-heading",
  omitDescription = false,
}: Props) {
  const [rows, setRows] = useState<InspirationLink[]>(() =>
    initialLinks.length ? initialLinks.map((l) => ({ ...l })) : [emptyRow()],
  );

  const hasSavedLinks = initialLinks.some((l) => l.url.trim().length > 0);

  const json = useMemo(() => {
    const valid = rows
      .map((r) => {
        const url = r.url.trim();
        if (!url) return null;
        const kind: InspirationLinkKind = r.kind && r.kind !== "other" ? r.kind : detectInspirationKind(url);
        return {
          url,
          label: r.label.trim(),
          kind,
        };
      })
      .filter(Boolean) as InspirationLink[];
    return JSON.stringify(valid);
  }, [rows]);

  function updateRow(i: number, patch: Partial<InspirationLink>) {
    setRows((prev) => {
      const next = [...prev];
      const row = { ...next[i], ...patch };
      if (patch.url !== undefined && patch.url.trim()) {
        row.kind = detectInspirationKind(patch.url.trim());
      }
      next[i] = row;
      return next;
    });
  }

  function addRow() {
    setRows((prev) => [...prev, emptyRow()]);
  }

  function removeRow(i: number) {
    setRows((prev) => (prev.length <= 1 ? [emptyRow()] : prev.filter((_, j) => j !== i)));
  }

  const description = canEdit
    ? "Add Pinterest boards, Instagram accounts, or any links that show the direction you love — useful for branding, web, social, and print projects."
    : pendingVerification
      ? "Once your account is verified, you can add links here for the studio to reference."
      : "Links the client has shared for visual and brand direction.";

  const editForm = canEdit ? (
        <PortalInspirationLinksSaveForm projectId={projectId} className="space-y-4">
          <input type="hidden" name="inspirationLinksJson" value={json} readOnly />
          <div className="space-y-4">
            {rows.map((row, i) => (
              <div
                key={i}
                className={`grid gap-3 rounded-xl border p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end ${
                  clientEmphasis
                    ? "border-zinc-200/90 bg-zinc-50/80"
                    : "border-burgundy/12 bg-burgundy/[0.04]"
                }`}
              >
                <label className="block sm:col-span-1">
                  <span className="mb-1.5 block font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-burgundy">
                    URL
                  </span>
                  <input
                    type="text"
                    inputMode="url"
                    autoComplete="url"
                    value={row.url}
                    onChange={(e) => updateRow(i, { url: e.target.value })}
                    placeholder="https://www.pinterest.com/… or instagram.com/…"
                    className={
                      clientEmphasis
                        ? "cc-portal-client-input"
                        : "w-full rounded-lg border border-burgundy/15 bg-white px-3 py-2.5 font-body text-sm text-burgundy outline-none ring-burgundy/20 focus:ring-2"
                    }
                  />
                </label>
                <label className="block sm:col-span-1">
                  <span className="mb-1.5 block font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-burgundy">
                    Label (optional)
                  </span>
                  <input
                    type="text"
                    value={row.label}
                    onChange={(e) => updateRow(i, { label: e.target.value })}
                    placeholder="e.g. Spring campaign refs"
                    maxLength={120}
                    className={
                      clientEmphasis
                        ? "cc-portal-client-input"
                        : "w-full rounded-lg border border-burgundy/15 bg-white px-3 py-2.5 font-body text-sm text-burgundy outline-none ring-burgundy/20 focus:ring-2"
                    }
                  />
                </label>
                <div className="flex items-center gap-2 sm:justify-end">
                  {row.url.trim() ? (
                    <span className="font-body text-[9px] uppercase tracking-[0.1em] text-burgundy/50">
                      {inspirationKindLabel(row.kind)}
                    </span>
                  ) : null}
                  {rows.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => removeRow(i)}
                      className="font-body text-[11px] uppercase tracking-[0.1em] text-burgundy/50 underline-offset-4 hover:text-burgundy hover:underline"
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
          <div
            className={`mt-6 flex flex-col gap-4 border-t pt-5 sm:flex-row sm:items-center sm:justify-between ${
              clientEmphasis ? "border-zinc-200" : "border-burgundy/15"
            }`}
          >
            <button
              type="button"
              onClick={addRow}
              className="self-start font-body text-[11px] font-semibold uppercase tracking-[0.12em] text-burgundy underline-offset-4 hover:underline"
            >
              + Add another link
            </button>
            <button
              type="submit"
              className={ctaButtonClasses({
                variant: clientEmphasis ? "ink" : "burgundy",
                size: "md",
                className: "w-full sm:w-auto sm:min-w-[11rem]",
              })}
            >
              Save inspiration
            </button>
          </div>
        </PortalInspirationLinksSaveForm>
      ) : (
        <>
          {pendingVerification ? (
            <div
              className={
                clientEmphasis
                  ? "cc-portal-client-empty"
                  : "rounded-xl border border-dashed border-burgundy/30 bg-burgundy/[0.04] px-4 py-5 font-body text-sm leading-relaxed text-burgundy/75"
              }
            >
              The studio will verify your account first—then you can paste Pinterest, Instagram, and mood links here
              for the team.
            </div>
          ) : null}
          {!pendingVerification || initialLinks.length > 0 ? (
            <ReadOnlyLinkList links={initialLinks} clientEmphasis={clientEmphasis} />
          ) : null}
        </>
      );

  if (embedded) {
    return (
      <div
        className={`mt-10 border-t pt-8 ${clientEmphasis ? "border-zinc-200" : "border-burgundy/10"} ${hasSavedLinks ? "rounded-xl ring-1 ring-emerald-200/70 ring-offset-4 ring-offset-cream" : ""} ${className}`.trim()}
      >
        <h3
          id={embeddedHeadingId}
          className={`flex flex-wrap items-center gap-3 pb-3 font-display text-xl tracking-[-0.02em] text-burgundy md:text-2xl ${
            clientEmphasis ? "border-b border-zinc-200" : "border-b border-burgundy/15"
          }`}
        >
          <span>Inspiration &amp; mood</span>
          {hasSavedLinks ? <PortalStepSavedBadge /> : null}
        </h3>
        {!omitDescription ? (
          <p className="mt-4 font-body text-sm leading-relaxed text-burgundy/70">{description}</p>
        ) : null}
        <div className={omitDescription ? "mt-0" : "mt-6"}>{editForm}</div>
      </div>
    );
  }

  return (
    <PortalSectionCard
      {...(sectionId ? { id: sectionId } : {})}
      headingId="inspiration-heading"
      title={
        <span className="inline-flex max-w-full flex-wrap items-center gap-3">
          Inspiration &amp; mood
          {hasSavedLinks ? <PortalStepSavedBadge /> : null}
        </span>
      }
      description={omitDescription ? undefined : <p className="m-0">{description}</p>}
      variant="client"
      className={`mt-8 ${hasSavedLinks ? "ring-1 ring-emerald-200/70 ring-offset-2 ring-offset-cream" : ""} ${className}`.trim()}
    >
      {editForm}
    </PortalSectionCard>
  );
}
