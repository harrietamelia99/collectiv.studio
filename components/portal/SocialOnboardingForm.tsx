import { PortalSocialOnboardingBriefForm } from "@/components/portal/portal-flash-action-forms";
import type { SocialOnboardingData } from "@/lib/social-onboarding";
import type { InspirationLink } from "@/lib/portal-inspiration-links";
import { BrandKitSnippet } from "@/components/portal/BrandKitSnippet";
import { InspirationLinksPanel } from "@/components/portal/InspirationLinksPanel";
import { PortalSectionCard, PORTAL_CLIENT_INPUT_CLASS } from "@/components/portal/PortalSectionCard";
import { ctaButtonClasses } from "@/components/ui/Button";

type Props = {
  projectId: string;
  initial: SocialOnboardingData;
  clientCanEdit: boolean;
  /** Show brand uploads under the briefing (social clients). */
  showBrandKit: boolean;
  /** Pinterest / mood links — part of Step 1 on the social page (same data as the project hub). */
  inspirationLinks: InspirationLink[];
  /** Bumps client state when links are saved elsewhere (use `project.inspirationLinksJson`). */
  inspirationListKey: string;
  inspirationCanEdit: boolean;
  inspirationPendingVerification: boolean;
  projectBrand: {
    websitePrimaryHex: string | null;
    websiteSecondaryHex: string | null;
    websiteAccentHex: string | null;
    websiteQuaternaryHex: string | null;
    websiteFontPaths: string;
    websiteLogoPath: string | null;
    websiteLogoVariationsJson: string;
  };
};

export function SocialOnboardingForm({
  projectId,
  initial,
  clientCanEdit,
  showBrandKit,
  inspirationLinks,
  inspirationListKey,
  inspirationCanEdit,
  inspirationPendingVerification,
  projectBrand,
}: Props) {
  const kitValue =
    initial.existingBrandKit && ["yes", "partial", "no"].includes(initial.existingBrandKit)
      ? initial.existingBrandKit
      : "no";

  const step1Description = (
    <p>
      Tell us about your business, audience, and the look and feel you want on social. Upload your core brand assets,
      then add any Pinterest or mood links so we can match your visual direction.
    </p>
  );

  const fieldsStep1 = (
    <div className="flex max-w-2xl flex-col gap-5">
      <label className="flex flex-col gap-1.5">
        <span className="font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/55">
          Business overview *
        </span>
        <textarea
          name="businessOverview"
          required
          rows={4}
          defaultValue={initial.businessOverview}
          placeholder="What you do, what makes you different, key offers…"
              className={`${PORTAL_CLIENT_INPUT_CLASS} min-h-[5.5rem] px-4 py-3`}
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/55">
          Target audience *
        </span>
        <textarea
          name="targetAudience"
          required
          rows={3}
          defaultValue={initial.targetAudience}
          placeholder="Who you want to reach, locations, demographics or psychographics…"
              className={`${PORTAL_CLIENT_INPUT_CLASS} min-h-[5.5rem] px-4 py-3`}
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/55">
          Visual &amp; tone *
        </span>
        <textarea
          name="visualStyle"
          required
          rows={3}
          defaultValue={initial.visualStyle}
          placeholder="Words that describe your brand: minimal, bold, playful, luxury… How formal should captions feel?"
              className={`${PORTAL_CLIENT_INPUT_CLASS} min-h-[5.5rem] px-4 py-3`}
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/55">
          Inspiring accounts *
        </span>
        <textarea
          name="inspiringAccounts"
          required
          rows={3}
          defaultValue={initial.inspiringAccounts}
          placeholder="@handles or URLs — what do you like about them?"
              className={`${PORTAL_CLIENT_INPUT_CLASS} min-h-[5.5rem] px-4 py-3`}
        />
      </label>
      <fieldset className="flex flex-col gap-2 border-0 p-0">
        <legend className="font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/55">
          Existing brand kit
        </legend>
        <label className="flex items-center gap-2 font-body text-sm text-burgundy/80">
          <input type="radio" name="existingBrandKit" value="yes" defaultChecked={kitValue === "yes"} />
          Yes — we have logo, colours &amp; fonts
        </label>
        <label className="flex items-center gap-2 font-body text-sm text-burgundy/80">
          <input type="radio" name="existingBrandKit" value="partial" defaultChecked={kitValue === "partial"} />
          Partial — some assets only
        </label>
        <label className="flex items-center gap-2 font-body text-sm text-burgundy/80">
          <input type="radio" name="existingBrandKit" value="no" defaultChecked={kitValue === "no"} />
          Not yet — we need support
        </label>
      </fieldset>
      <label className="flex items-start gap-3 font-body text-sm text-burgundy/80">
        <input
          type="checkbox"
          name="brandingPackageNeeded"
          value="1"
          defaultChecked={initial.brandingPackageNeeded}
          className="mt-1"
        />
        <span>We&apos;d like a mini brand or full branding package quoted before content goes live.</span>
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/55">Anything else?</span>
        <textarea
          name="extraNotes"
          rows={3}
          defaultValue={initial.extraNotes}
          placeholder="Launch dates, campaigns, off-limits topics…"
              className={`${PORTAL_CLIENT_INPUT_CLASS} min-h-[5.5rem] px-4 py-3`}
        />
      </label>
    </div>
  );

  /** Submit button uses this id so it can sit outside the brief form — HTML forbids nested forms (BrandKit + inspiration use their own). */
  const briefFormId = `social-step1-brief-${projectId}`;

  if (clientCanEdit) {
    return (
      <PortalSectionCard
        id="social-step-1"
        headingId="social-step-1-heading"
        title="Step 1 — Brief &amp; brand assets"
        description={step1Description}
        variant="client"
      >
        <div className="flex flex-col gap-10">
          <PortalSocialOnboardingBriefForm
            id={briefFormId}
            projectId={projectId}
            className="flex max-w-2xl flex-col gap-5"
          >
            {fieldsStep1}
          </PortalSocialOnboardingBriefForm>
          {showBrandKit ? (
            <div className="border-t border-burgundy/10 pt-8">
              <BrandKitSnippet
                projectId={projectId}
                clientCanEdit={clientCanEdit}
                primaryHex={projectBrand.websitePrimaryHex}
                secondaryHex={projectBrand.websiteSecondaryHex}
                accentHex={projectBrand.websiteAccentHex}
                quaternaryHex={projectBrand.websiteQuaternaryHex}
                websiteFontPaths={projectBrand.websiteFontPaths}
                websiteLogoPath={projectBrand.websiteLogoPath}
                websiteLogoVariationsJson={projectBrand.websiteLogoVariationsJson}
              />
            </div>
          ) : null}
          <InspirationLinksPanel
            key={`insp-${projectId}-${inspirationListKey}`}
            projectId={projectId}
            initialLinks={inspirationLinks}
            canEdit={inspirationCanEdit}
            pendingVerification={inspirationPendingVerification}
            clientEmphasis
            sectionId={null}
            embedded
            embeddedHeadingId="social-inspiration-heading"
          />
          <button
            type="submit"
            form={briefFormId}
            className={ctaButtonClasses({ variant: "ink", size: "md", className: "w-fit px-8" })}
          >
            Save brief &amp; assets
          </button>
        </div>
      </PortalSectionCard>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <PortalSectionCard
        id="social-step-1"
        headingId="social-step-1-heading"
        title="Step 1 — Brief &amp; brand assets"
        description={step1Description}
        variant="client"
      >
        <dl className="grid max-w-2xl gap-6 font-body text-sm text-burgundy/85">
          <div>
            <dt className="text-[10px] uppercase tracking-[0.12em] text-burgundy/45">Business</dt>
            <dd className="mt-2 whitespace-pre-wrap">{initial.businessOverview || "—"}</dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-[0.12em] text-burgundy/45">Audience</dt>
            <dd className="mt-2 whitespace-pre-wrap">{initial.targetAudience || "—"}</dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-[0.12em] text-burgundy/45">Style &amp; tone</dt>
            <dd className="mt-2 whitespace-pre-wrap">{initial.visualStyle || "—"}</dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-[0.12em] text-burgundy/45">Inspiring accounts</dt>
            <dd className="mt-2 whitespace-pre-wrap">{initial.inspiringAccounts || "—"}</dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-[0.12em] text-burgundy/45">Brand kit</dt>
            <dd className="mt-2">
              {initial.existingBrandKit || "—"}
              {initial.brandingPackageNeeded ? " · Branding package requested" : ""}
            </dd>
          </div>
          {initial.extraNotes?.trim() ? (
            <div>
              <dt className="text-[10px] uppercase tracking-[0.12em] text-burgundy/45">Notes</dt>
              <dd className="mt-2 whitespace-pre-wrap">{initial.extraNotes}</dd>
            </div>
          ) : null}
        </dl>
        {showBrandKit ? (
          <div className="mt-10 border-t border-burgundy/10 pt-8">
            <BrandKitSnippet
              projectId={projectId}
              clientCanEdit={false}
              primaryHex={projectBrand.websitePrimaryHex}
              secondaryHex={projectBrand.websiteSecondaryHex}
              accentHex={projectBrand.websiteAccentHex}
              quaternaryHex={projectBrand.websiteQuaternaryHex}
              websiteFontPaths={projectBrand.websiteFontPaths}
              websiteLogoPath={projectBrand.websiteLogoPath}
              websiteLogoVariationsJson={projectBrand.websiteLogoVariationsJson}
            />
          </div>
        ) : null}
        <InspirationLinksPanel
          key={`insp-ro-${projectId}-${inspirationListKey}`}
          projectId={projectId}
          initialLinks={inspirationLinks}
          canEdit={false}
          pendingVerification={false}
          clientEmphasis={false}
          sectionId={null}
          embedded
          embeddedHeadingId="social-inspiration-heading"
        />
      </PortalSectionCard>
    </div>
  );
}
