"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { approveAllSocialMonthPosts, submitSocialMonthBatchForReview } from "@/app/portal/social-batch-actions";

type Props = {
  projectId: string;
  batchMode: boolean;
  studio: boolean;
  clientReview: boolean;
  draftMonthKeys: string[];
  pendingApprovalMonthKeys: string[];
};

function prettyYm(ym: string) {
  const m = /^(\d{4})-(\d{2})$/.exec(ym.trim());
  if (!m) return ym;
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  return new Date(y, mo, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

export function SocialMonthBatchBar({
  projectId,
  batchMode,
  studio,
  clientReview,
  draftMonthKeys,
  pendingApprovalMonthKeys,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [studioYm, setStudioYm] = useState(draftMonthKeys[0] ?? "");
  const [clientYm, setClientYm] = useState(pendingApprovalMonthKeys[0] ?? "");

  if (!batchMode) return null;
  if (!studio && !clientReview) return null;

  return (
    <div className="mt-6 rounded-xl border border-burgundy/12 bg-burgundy/[0.04] px-4 py-4 sm:px-5">
      <p className="font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/55">Monthly batch</p>
      {studio ? (
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          {draftMonthKeys.length === 0 ? (
            <p className="font-body text-sm text-burgundy/65">
              When every post in a month is filled (draft), submit the full month to the client for review in one go.
            </p>
          ) : (
            <>
              <label className="flex flex-col gap-1 font-body text-xs text-burgundy/70">
                Month to submit
                <select
                  value={studioYm}
                  onChange={(e) => setStudioYm(e.target.value)}
                  className="max-w-xs rounded-cc-card border border-burgundy/15 bg-white px-3 py-2 text-sm text-burgundy"
                >
                  {draftMonthKeys.map((ym) => (
                    <option key={ym} value={ym}>
                      {prettyYm(ym)}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                disabled={pending || !studioYm}
                onClick={() => {
                  startTransition(async () => {
                    await submitSocialMonthBatchForReview(projectId, studioYm);
                    router.refresh();
                  });
                }}
                className="rounded-full bg-burgundy px-4 py-2 font-body text-sm font-semibold text-cream shadow-sm hover:opacity-90 disabled:opacity-40"
              >
                {pending ? "Submitting…" : "Submit month for approval"}
              </button>
            </>
          )}
        </div>
      ) : null}
      {clientReview ? (
        <div className="mt-4 flex flex-col gap-3 border-t border-burgundy/10 pt-4 sm:flex-row sm:flex-wrap sm:items-end">
          {pendingApprovalMonthKeys.length === 0 ? (
            <p className="font-body text-sm text-burgundy/65">
              When a month is waiting for review, you can approve all posts at once here, or open each day on the
              calendar.
            </p>
          ) : (
            <>
              <label className="flex flex-col gap-1 font-body text-xs text-burgundy/70">
                Approve entire month
                <select
                  value={clientYm}
                  onChange={(e) => setClientYm(e.target.value)}
                  className="max-w-xs rounded-cc-card border border-burgundy/15 bg-white px-3 py-2 text-sm text-burgundy"
                >
                  {pendingApprovalMonthKeys.map((ym) => (
                    <option key={ym} value={ym}>
                      {prettyYm(ym)}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                disabled={pending || !clientYm}
                onClick={() => {
                  startTransition(async () => {
                    await approveAllSocialMonthPosts(projectId, clientYm);
                    router.refresh();
                  });
                }}
                className="rounded-full border border-burgundy/25 bg-white px-4 py-2 font-body text-sm font-semibold text-burgundy hover:bg-burgundy/[0.06] disabled:opacity-40"
              >
                {pending ? "Working…" : "Approve all"}
              </button>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
