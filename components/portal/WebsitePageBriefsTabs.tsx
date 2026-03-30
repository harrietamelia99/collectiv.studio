"use client";

import { useMemo, useState } from "react";
import {
  removeWebsitePageImage,
  saveWebsitePageBrief,
} from "@/app/portal/actions";
import { portalFilePublicUrl } from "@/lib/portal-file-url";
import { ctaButtonClasses } from "@/components/ui/Button";

export type WebsitePageBriefPayload = {
  pageIndex: number;
  headline: string | null;
  bodyCopy: string;
  imagePaths: string[];
};

type Props = {
  projectId: string;
  labels: string[];
  briefs: WebsitePageBriefPayload[];
  clientCanEdit: boolean;
  className?: string;
};

export function WebsitePageBriefsTabs({ projectId, labels, briefs, clientCanEdit, className = "" }: Props) {
  const [active, setActive] = useState(0);

  const byIndex = useMemo(() => new Map(briefs.map((b) => [b.pageIndex, b])), [briefs]);
  const count = labels.length;

  const current = byIndex.get(active) ?? {
    pageIndex: active,
    headline: null,
    bodyCopy: "",
    imagePaths: [],
  };

  return (
    <div className={className}>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: count }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActive(i)}
            className={`rounded-full border px-4 py-2 font-body text-[11px] uppercase tracking-[0.1em] transition-colors ${
              active === i
                ? "border-burgundy bg-burgundy text-cream"
                : "border-burgundy/20 bg-cream text-burgundy/70 hover:border-burgundy/40"
            }`}
          >
            {labels[i] ?? `Page ${i + 1}`}
          </button>
        ))}
      </div>

      <div className="mt-5 rounded-cc-card border border-burgundy/12 bg-burgundy/[0.02] p-4 sm:p-5 md:p-6">
        <div className="mb-4 flex flex-col gap-1.5">
          <span className="font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/45">
            Page {active + 1}
          </span>
          <h3 className="m-0 font-display text-cc-h4 text-burgundy">
            {labels[active] ?? `Page ${active + 1}`}
          </h3>
        </div>

        {clientCanEdit ? (
          <form
            key={active}
            action={saveWebsitePageBrief.bind(null, projectId, active)}
            encType="multipart/form-data"
            className="flex w-full max-w-2xl flex-col gap-4 lg:max-w-4xl"
          >
            <label className="flex flex-col gap-1.5">
              <span className="font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/55">Headline</span>
              <input
                name="headline"
                type="text"
                defaultValue={current.headline ?? ""}
                placeholder="e.g. Services — how we work with you"
                className="rounded-cc-card border border-burgundy/15 bg-cream px-4 py-3 font-body text-sm text-burgundy outline-none ring-burgundy/20 focus:ring-2"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/55">
                Page content
              </span>
              <textarea
                name="bodyCopy"
                rows={8}
                defaultValue={current.bodyCopy}
                placeholder="Key messages, section copy, bullet points, CTAs, SEO notes — anything you want on this page."
                className="rounded-cc-card border border-burgundy/15 bg-cream px-4 py-3 font-body text-sm text-burgundy outline-none ring-burgundy/20 focus:ring-2"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/55">
                Add images (optional)
              </span>
              <input
                name="images"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                className="font-body text-[12px] text-burgundy file:mr-3 file:rounded-full file:border file:border-burgundy/20 file:bg-cream file:px-4 file:py-2 file:font-body file:text-[10px] file:uppercase file:tracking-[0.1em]"
              />
              <span className="font-body text-[11px] text-burgundy/45">
                Up to 12 images per page total; JPEG, PNG, WebP or GIF; 8MB each. Existing images stay unless you remove
                them below.
              </span>
            </label>
            <button
              type="submit"
              className={ctaButtonClasses({ variant: "burgundy", size: "sm", className: "mt-1 w-fit px-6" })}
            >
              Save this page
            </button>
          </form>
        ) : (
          <div className="space-y-3 font-body text-sm text-burgundy/75">
            {current.headline?.trim() ? <p className="font-display text-[17px] text-burgundy">{current.headline}</p> : null}
            {current.bodyCopy?.trim() ? (
              <p className="whitespace-pre-wrap leading-relaxed">{current.bodyCopy}</p>
            ) : (
              <p className="text-burgundy/45">No copy saved yet.</p>
            )}
          </div>
        )}

        {current.imagePaths.length > 0 ? (
          <ul className="mt-6 grid grid-cols-2 gap-4 border-t border-burgundy/10 pt-6 sm:grid-cols-3 md:max-w-3xl lg:max-w-5xl xl:grid-cols-4">
            {current.imagePaths.map((rel, i) => (
              <li key={`${rel}-${i}`} className="relative min-w-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={portalFilePublicUrl(rel)}
                  alt=""
                  className="aspect-square w-full rounded-cc-card border border-burgundy/10 object-cover"
                />
                {clientCanEdit ? (
                  <form
                    action={removeWebsitePageImage.bind(null, projectId, active, i)}
                    className="mt-2"
                  >
                    <button
                      type="submit"
                      className="font-body text-[10px] uppercase tracking-[0.1em] text-burgundy/55 underline"
                    >
                      Remove image
                    </button>
                  </form>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-5 border-t border-burgundy/10 pt-5 font-body text-[12px] text-burgundy/45">
            No images for this page yet.
          </p>
        )}
      </div>
    </div>
  );
}
