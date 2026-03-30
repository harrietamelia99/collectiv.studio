import { PortalSocialContentPlanningForm } from "@/components/portal/portal-flash-action-forms";
import type { SocialOnboardingData } from "@/lib/social-onboarding";
import { TextareaWithEmojiField } from "@/components/portal/TextareaWithEmojiField";
import { PortalSectionCard, PORTAL_CLIENT_INPUT_CLASS } from "@/components/portal/PortalSectionCard";
import { ctaButtonClasses } from "@/components/ui/Button";

type Props = {
  projectId: string;
  initial: SocialOnboardingData;
  hasSocialAccountVaultStored: boolean;
  studioViewer?: boolean;
  clientCanEdit: boolean;
};

const step2Description = (
  <p>
    Share post ideas, promotions, and important dates — all optional. If you&apos;re not sure yet, tick &quot;We&apos;d
    like help planning&quot; and we&apos;ll shape this with you.
  </p>
);

export function SocialContentPlanningForm({
  projectId,
  initial,
  hasSocialAccountVaultStored,
  studioViewer = false,
  clientCanEdit,
}: Props) {
  const fieldsStep2 = (
    <div className="flex max-w-2xl flex-col gap-5">
      <label className="flex flex-col gap-1.5">
        <span className="font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/55">
          Post ideas &amp; requests
        </span>
        <TextareaWithEmojiField
          name="postIdeas"
          rows={4}
          defaultValue={initial.postIdeas}
          placeholder="Themes you want covered, types of posts (Reels, carousels, stories), topics to avoid…"
          className={`${PORTAL_CLIENT_INPUT_CLASS} min-h-[5.5rem] px-4 py-3`}
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/55">
          Deals, offers &amp; promos
        </span>
        <TextareaWithEmojiField
          name="dealsPromos"
          rows={3}
          defaultValue={initial.dealsPromos}
          placeholder="Sales, discount codes, launches — or leave blank if not relevant."
          className={`${PORTAL_CLIENT_INPUT_CLASS} min-h-[5.5rem] px-4 py-3`}
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/55">
          Key dates &amp; milestones
        </span>
        <TextareaWithEmojiField
          name="keyDates"
          rows={3}
          defaultValue={initial.keyDates}
          placeholder="Holidays, events, product drops, quiet periods…"
          className={`${PORTAL_CLIENT_INPUT_CLASS} min-h-[5.5rem] px-4 py-3`}
        />
      </label>
      <label className="flex items-start gap-3 font-body text-sm text-burgundy/80">
        <input
          type="checkbox"
          name="needPlanningHelp"
          value="1"
          defaultChecked={initial.needPlanningHelp}
          className="mt-1"
        />
        <span>We&apos;d like the studio to help shape our content plan and calendar.</span>
      </label>

      <div className="border-t border-burgundy/10 pt-8">
        <p className="font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/55">
          Social account access (optional)
        </p>
        <p className="mt-2 max-w-2xl font-body text-sm leading-relaxed text-burgundy/70">
          If we need to post or manage accounts for you, add us as a user or admin on each platform where you can —
          that&apos;s the safest option. If you must share credentials, use this box only for this project. Consider a
          temporary password and change it after we&apos;re set up; never reuse a password from other sites.
        </p>
        <label className="mt-4 flex flex-col gap-1.5">
          <span className="font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/55">
            Logins &amp; access notes
          </span>
          <textarea
            name="socialAccountAccessNotes"
            autoComplete="off"
            spellCheck={false}
            rows={5}
            placeholder={
              hasSocialAccountVaultStored
                ? "Leave blank to keep what you already saved, or paste updated details…"
                : "e.g. Instagram @handle + how to reach the account, Meta Business access, or one-time credentials…"
            }
            className={`${PORTAL_CLIENT_INPUT_CLASS} min-h-[6.5rem] px-4 py-3 font-mono text-[13px]`}
          />
        </label>
        {hasSocialAccountVaultStored ? (
          <label className="mt-4 flex items-start gap-3 font-body text-sm text-burgundy/80">
            <input type="checkbox" name="clearSocialAccountAccess" value="1" className="mt-1" />
            <span>Remove saved access details from the portal (cannot be undone from your side)</span>
          </label>
        ) : null}
      </div>
    </div>
  );

  if (clientCanEdit) {
    return (
      <PortalSocialContentPlanningForm projectId={projectId} className="flex flex-col gap-10">
        <PortalSectionCard
          id="social-step-2"
          headingId="social-step-2-heading"
          title="Step 2 — Content planning"
          description={step2Description}
          variant="client"
        >
          {fieldsStep2}
          <button
            type="submit"
            className={ctaButtonClasses({ variant: "ink", size: "md", className: "mt-6 w-fit px-8" })}
          >
            Save planning &amp; access
          </button>
        </PortalSectionCard>
      </PortalSocialContentPlanningForm>
    );
  }

  return (
    <PortalSectionCard
      id="social-step-2"
      headingId="social-step-2-heading"
      title="Step 2 — Content planning"
      description={step2Description}
      variant="client"
    >
      <dl className="grid max-w-2xl gap-6 font-body text-sm text-burgundy/85">
        <div>
          <dt className="text-[10px] uppercase tracking-[0.12em] text-burgundy/45">Post ideas &amp; requests</dt>
          <dd className="mt-2 whitespace-pre-wrap">{initial.postIdeas?.trim() || "—"}</dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-[0.12em] text-burgundy/45">Deals &amp; promos</dt>
          <dd className="mt-2 whitespace-pre-wrap">{initial.dealsPromos?.trim() || "—"}</dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-[0.12em] text-burgundy/45">Key dates</dt>
          <dd className="mt-2 whitespace-pre-wrap">{initial.keyDates?.trim() || "—"}</dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-[0.12em] text-burgundy/45">Planning support</dt>
          <dd className="mt-2">{initial.needPlanningHelp ? "Client asked for help planning" : "—"}</dd>
        </div>
        {hasSocialAccountVaultStored ? (
          <div>
            <dt className="text-[10px] uppercase tracking-[0.12em] text-burgundy/45">Social account logins</dt>
            <dd className="mt-2 text-burgundy/75">
              {studioViewer
                ? "Stored encrypted. Decrypted copy is in the studio-only panel on the social subscription page."
                : "Saved with encryption in the portal. Only the studio team can read this information."}
            </dd>
          </div>
        ) : null}
      </dl>
    </PortalSectionCard>
  );
}
