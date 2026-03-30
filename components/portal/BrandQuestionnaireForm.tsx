"use client";

import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import {
  removeBrandQuestionnaireFile,
  saveBrandingQuestionnaireDraft,
  submitBrandingQuestionnaire,
  uploadBrandQuestionnaireFile,
} from "@/app/portal/actions";
import {
  AUDIENCE_ONLINE_OPTIONS,
  brandQuestionnaireSectionProgress,
  BUSINESS_JOURNEY_OPTIONS,
  emptyBrandQuestionnaire,
  parseBrandQuestionnaireJson,
  PERSONALITY_TAG_OPTIONS,
  stringifyBrandQuestionnaire,
  TONE_TAG_OPTIONS,
  validateBrandQuestionnaireForSubmit,
  VISUAL_STYLE_TAG_OPTIONS,
  type BrandQuestionnaireData,
} from "@/lib/brand-questionnaire";
import { portalFilePublicUrl } from "@/lib/portal-file-url";
import { SocialPlatformIcon } from "@/components/portal/SocialPlatformIcon";
import { PORTAL_CLIENT_INPUT_CLASS } from "@/components/portal/PortalSectionCard";
import { ctaButtonClasses } from "@/components/ui/Button";
import { Check, Loader2 } from "lucide-react";

function SectionCard({
  index,
  title,
  intro,
  children,
}: {
  index: number;
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={`brand-q-section-${index}`}
      className="scroll-mt-24 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm sm:p-8"
    >
      <p className="font-body text-[10px] font-semibold uppercase tracking-[0.14em] text-burgundy/45">
        Section {index} of 6
      </p>
      <h2 className="mt-2 font-display text-xl tracking-[-0.02em] text-burgundy sm:text-2xl">{title}</h2>
      {intro ? <p className="mt-3 max-w-2xl font-body text-sm leading-relaxed text-burgundy/70">{intro}</p> : null}
      <div className="mt-8 flex flex-col gap-8">{children}</div>
    </section>
  );
}

function Field({
  label,
  helper,
  required,
  children,
}: {
  label: string;
  helper: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div>
        <span className="font-body text-sm font-medium text-burgundy">
          {label}
          {required ? <span className="text-rose-700/90"> *</span> : null}
        </span>
        <p className="mt-2 max-w-2xl font-body text-sm leading-relaxed text-burgundy/65">{helper}</p>
      </div>
      {children}
    </div>
  );
}

function ChipToggle({
  label,
  selected,
  onToggle,
  disabled,
}: {
  label: string;
  selected: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onToggle}
      className={`min-h-[44px] rounded-full border px-4 py-2.5 font-body text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${
        selected
          ? "border-burgundy bg-burgundy text-cream shadow-sm"
          : "border-burgundy/25 bg-cream text-burgundy hover:border-burgundy/45 hover:bg-burgundy/[0.06]"
      }`}
    >
      {label}
    </button>
  );
}

function toggleInList(list: string[], id: string): string[] {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

export function BrandQuestionnaireForm({
  projectId,
  initialJson,
}: {
  projectId: string;
  initialJson: string;
}) {
  const router = useRouter();
  const [state, setState] = useState<BrandQuestionnaireData>(() => parseBrandQuestionnaireJson(initialJson));
  const [savedFlash, setSavedFlash] = useState(false);
  const [submitIssues, setSubmitIssues] = useState<{ section: number; label: string }[] | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [pending, startTransition] = useTransition();
  const skipSave = useRef(true);
  const saveFlashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setState(parseBrandQuestionnaireJson(initialJson));
    skipSave.current = true;
  }, [initialJson]);

  useEffect(() => {
    if (skipSave.current) {
      skipSave.current = false;
      return;
    }
    const t = setTimeout(() => {
      startTransition(() => {
        void saveBrandingQuestionnaireDraft(projectId, stringifyBrandQuestionnaire(state)).then((r) => {
          if (r.ok) {
            setSavedFlash(true);
            if (saveFlashTimer.current) clearTimeout(saveFlashTimer.current);
            saveFlashTimer.current = setTimeout(() => setSavedFlash(false), 2200);
          }
        });
      });
    }, 850);
    return () => clearTimeout(t);
  }, [state, projectId]);

  const progress = useMemo(() => brandQuestionnaireSectionProgress(state), [state]);
  const submitReady = useMemo(() => validateBrandQuestionnaireForSubmit(state).length === 0, [state]);

  const onSubmit = useCallback(() => {
    setSubmitIssues(null);
    setSubmitSuccess(false);
    const issues = validateBrandQuestionnaireForSubmit(state);
    if (issues.length > 0) {
      setSubmitIssues(issues);
      const first = Math.min(...issues.map((i) => i.section));
      document.getElementById(`brand-q-section-${first}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    startTransition(() => {
      void submitBrandingQuestionnaire(projectId, stringifyBrandQuestionnaire(state)).then((r) => {
        if (r.ok) {
          setSubmitSuccess(true);
          router.refresh();
        } else if (r.issues?.length) {
          setSubmitIssues(r.issues);
        }
      });
    });
  }, [state, projectId, router]);

  const upload = useCallback(
    async (slot: "inspiration" | "existing", file: File) => {
      const fd = new FormData();
      fd.set("slot", slot);
      fd.set("file", file);
      const r = await uploadBrandQuestionnaireFile(projectId, fd);
      if (r.ok && r.path) {
        setState((prev) =>
          slot === "inspiration"
            ? { ...prev, visualInspirationImagePaths: [...prev.visualInspirationImagePaths, r.path!] }
            : { ...prev, existingAssetsFilePaths: [...prev.existingAssetsFilePaths, r.path!] },
        );
        router.refresh();
      }
      return r;
    },
    [projectId, router],
  );

  const removeFile = useCallback(
    async (path: string, slot: "inspiration" | "existing") => {
      const r = await removeBrandQuestionnaireFile(projectId, path, slot);
      if (r.ok) {
        setState((prev) =>
          slot === "inspiration"
            ? {
                ...prev,
                visualInspirationImagePaths: prev.visualInspirationImagePaths.filter((p) => p !== path),
              }
            : {
                ...prev,
                existingAssetsFilePaths: prev.existingAssetsFilePaths.filter((p) => p !== path),
              },
        );
        router.refresh();
      }
    },
    [projectId, router],
  );

  return (
    <div className="mt-8 space-y-8">
      <div className="rounded-2xl border border-burgundy/15 bg-burgundy/[0.04] px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-body text-sm font-medium text-burgundy">Your progress</p>
          <p className="font-body text-sm tabular-nums text-burgundy/75">
            {progress.complete} of {progress.total} sections complete
          </p>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/80 ring-1 ring-burgundy/10">
          <div
            className="h-full rounded-full bg-burgundy transition-[width] duration-500 ease-out"
            style={{ width: `${progress.total ? (progress.complete / progress.total) * 100 : 0}%` }}
          />
        </div>
        <p className="mt-3 font-body text-xs leading-relaxed text-burgundy/60">
          Take your time — we save your answers as you go. You can close this page and come back anytime before you
          submit.
        </p>
      </div>

      <div
        className={`flex min-h-[1.5rem] items-center gap-2 font-body text-xs text-burgundy/55 transition-opacity duration-300 ${
          savedFlash ? "opacity-100" : "opacity-0"
        }`}
        aria-live="polite"
      >
        <Check className="h-3.5 w-3.5 text-emerald-700" aria-hidden />
        Saved
      </div>

      {submitSuccess ? (
        <div
          className="rounded-2xl border border-emerald-200/90 bg-emerald-50/90 px-5 py-4 font-body text-sm leading-relaxed text-emerald-950/90 sm:px-6"
          role="status"
        >
          Thank you — we have everything we need to get started on your brand. We&apos;ll be in touch soon with next
          steps.
        </div>
      ) : null}

      {submitIssues && submitIssues.length > 0 ? (
        <div
          className="rounded-2xl border border-rose-200/90 bg-rose-50/80 px-5 py-4 sm:px-6"
          role="alert"
        >
          <p className="font-body text-sm font-medium text-rose-950">A few things still need your attention:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 font-body text-sm text-rose-900/90">
            {submitIssues.map((issue, i) => (
              <li key={`${issue.section}-${issue.label}-${i}`}>
                <span className="text-burgundy/60">Section {issue.section}:</span> {issue.label}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <SectionCard
        index={1}
        title="Your business"
        intro="Let’s start with the basics — there are no wrong answers, just your story in your own words."
      >
        <Field
          label="Your business name"
          required
          helper="Just confirm the name you want on your branding — include any punctuation or capitalisation exactly as you want it."
        >
          <input
            type="text"
            value={state.businessName}
            onChange={(e) => setState((s) => ({ ...s, businessName: e.target.value }))}
            className={PORTAL_CLIENT_INPUT_CLASS}
            maxLength={500}
            autoComplete="organization"
          />
        </Field>
        <Field
          label="What does your business do?"
          required
          helper="Describe what you offer and who you help. Don’t overthink it — write it how you’d explain it to a friend."
        >
          <textarea
            value={state.businessDoes}
            onChange={(e) => setState((s) => ({ ...s, businessDoes: e.target.value }))}
            className={PORTAL_CLIENT_INPUT_CLASS}
            rows={4}
            maxLength={8000}
          />
        </Field>
        <Field
          label="Your brand mission and purpose"
          required
          helper="Why does your business exist beyond making money? What do you want to give your customers or the world? For example: “To make women feel confident in their skin” or “To make healthy eating simple and affordable.”"
        >
          <textarea
            value={state.brandMissionPurpose}
            onChange={(e) => setState((s) => ({ ...s, brandMissionPurpose: e.target.value }))}
            className={PORTAL_CLIENT_INPUT_CLASS}
            rows={4}
            maxLength={8000}
          />
        </Field>
        <Field
          label="Where are you in your business journey?"
          required
          helper="Choose the option that feels closest — this helps us meet you where you are."
        >
          <div className="flex flex-col gap-2">
            {BUSINESS_JOURNEY_OPTIONS.map((opt) => (
              <label
                key={opt.id}
                className="flex min-h-[44px] cursor-pointer items-start gap-3 rounded-xl border border-zinc-200/90 bg-cream/50 px-4 py-3 font-body text-sm text-burgundy transition-colors has-[:checked]:border-burgundy/35 has-[:checked]:bg-burgundy/[0.06]"
              >
                <input
                  type="radio"
                  name="businessJourney"
                  checked={state.businessJourney === opt.id}
                  onChange={() => setState((s) => ({ ...s, businessJourney: opt.id }))}
                  className="mt-1 h-4 w-4 border-zinc-300 text-burgundy focus:ring-burgundy/25"
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
          {state.businessJourney === "other" ? (
            <textarea
              value={state.businessJourneyOther}
              onChange={(e) => setState((s) => ({ ...s, businessJourneyOther: e.target.value }))}
              placeholder="Tell us a little more…"
              className={`${PORTAL_CLIENT_INPUT_CLASS} mt-3`}
              rows={2}
              maxLength={2000}
            />
          ) : null}
        </Field>
      </SectionCard>

      <SectionCard
        index={2}
        title="Your audience"
        intro="The clearer we are on who you’re for, the stronger your brand can be."
      >
        <Field
          label="Who is your ideal customer?"
          required
          helper="Think about who you are talking to. How old are they? Where do they live? What do they care about? What problems do they have that you solve? The more specific the better — you can describe one person if that helps."
        >
          <textarea
            value={state.idealCustomer}
            onChange={(e) => setState((s) => ({ ...s, idealCustomer: e.target.value }))}
            className={PORTAL_CLIENT_INPUT_CLASS}
            rows={5}
            maxLength={8000}
          />
        </Field>
        <Field
          label="Where does your audience spend time online?"
          required
          helper="Tick everything that applies — this helps us make sure your brand works across the right platforms."
        >
          <div className="flex flex-wrap gap-2">
            {AUDIENCE_ONLINE_OPTIONS.map((opt) => (
              <label
                key={opt.id}
                className={`flex min-h-[44px] cursor-pointer items-center gap-2 rounded-full border px-4 py-2 font-body text-sm transition-colors ${
                  state.audienceOnline.includes(opt.id)
                    ? "border-burgundy bg-burgundy text-cream"
                    : "border-burgundy/20 bg-white text-burgundy hover:border-burgundy/40"
                }`}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={state.audienceOnline.includes(opt.id)}
                  onChange={() => setState((s) => ({ ...s, audienceOnline: toggleInList(s.audienceOnline, opt.id) }))}
                />
                <span className="flex h-4 w-4 shrink-0 items-center justify-center" aria-hidden>
                  {opt.id === "other" ? (
                    <span className="block h-2 w-2 rounded-full bg-burgundy/35" />
                  ) : (
                    <SocialPlatformIcon id={opt.id} className="h-4 w-4 opacity-90" />
                  )}
                </span>
                {opt.label}
              </label>
            ))}
          </div>
          {state.audienceOnline.includes("other") ? (
            <input
              type="text"
              value={state.audienceOnlineOther}
              onChange={(e) => setState((s) => ({ ...s, audienceOnlineOther: e.target.value }))}
              placeholder="Other platforms or spaces…"
              className={`${PORTAL_CLIENT_INPUT_CLASS} mt-3`}
              maxLength={2000}
            />
          ) : null}
        </Field>
        <Field
          label="What do you want your customers to feel when they come across your brand?"
          required
          helper="Think about the emotion or impression you want to leave. For example: inspired, reassured, excited, trusted, pampered."
        >
          <textarea
            value={state.customerFeelings}
            onChange={(e) => setState((s) => ({ ...s, customerFeelings: e.target.value }))}
            className={PORTAL_CLIENT_INPUT_CLASS}
            rows={4}
            maxLength={8000}
          />
        </Field>
      </SectionCard>

      <SectionCard
        index={3}
        title="Your personality & tone"
        intro="We’re imagining how your brand shows up in the world — like a person your customers would recognise."
      >
        <Field
          label="How would you describe your brand’s personality?"
          required
          helper="Pick as many as feel right. These help us understand the character of your brand."
        >
          <div className="flex flex-wrap gap-2">
            {PERSONALITY_TAG_OPTIONS.map((tag) => (
              <ChipToggle
                key={tag}
                label={tag}
                selected={state.personalityTags.includes(tag)}
                onToggle={() =>
                  setState((s) => ({ ...s, personalityTags: toggleInList(s.personalityTags, tag) }))
                }
              />
            ))}
          </div>
        </Field>
        <Field
          label="How should your brand sound when it speaks?"
          required
          helper="This is your tone of voice — the personality behind your words. Think about how you already communicate with your audience and what feels natural."
        >
          <div className="flex flex-wrap gap-2">
            {TONE_TAG_OPTIONS.map((tag) => (
              <ChipToggle
                key={tag}
                label={tag}
                selected={state.toneTags.includes(tag)}
                onToggle={() => setState((s) => ({ ...s, toneTags: toggleInList(s.toneTags, tag) }))}
              />
            ))}
          </div>
        </Field>
        <Field
          label="Is there anything your brand should never feel like?"
          required
          helper="For example: “I don’t want it to feel too corporate” or “I never want it to feel cheap or overcrowded.” This is just as helpful as knowing what you do want."
        >
          <textarea
            value={state.brandNeverFeels}
            onChange={(e) => setState((s) => ({ ...s, brandNeverFeels: e.target.value }))}
            className={PORTAL_CLIENT_INPUT_CLASS}
            rows={3}
            maxLength={8000}
          />
        </Field>
      </SectionCard>

      <SectionCard
        index={4}
        title="Your visual direction"
        intro="You don’t need to be a designer — rough ideas and words are perfect."
      >
        <Field
          label="Do you have any colour preferences?"
          required
          helper="You don’t need to know exact colour codes — you can say things like “warm terracotta tones” or “clean whites and soft greens.” If you already have brand colours you want to keep, add them here."
        >
          <textarea
            value={state.colourPreferences}
            onChange={(e) => setState((s) => ({ ...s, colourPreferences: e.target.value }))}
            className={PORTAL_CLIENT_INPUT_CLASS}
            rows={3}
            maxLength={8000}
          />
        </Field>
        <Field
          label="What words would you use to describe how you want your brand to look?"
          required
          helper="Think about the overall visual feeling — not specific logos or colours, just the general vibe."
        >
          <div className="flex flex-wrap gap-2">
            {VISUAL_STYLE_TAG_OPTIONS.map((tag) => (
              <ChipToggle
                key={tag}
                label={tag}
                selected={state.visualStyleTags.includes(tag)}
                onToggle={() =>
                  setState((s) => ({ ...s, visualStyleTags: toggleInList(s.visualStyleTags, tag) }))
                }
              />
            ))}
          </div>
        </Field>
        <Field
          label="Visual direction & inspiration"
          required
          helper="Share anything that visually excites you — brands you love, interiors, fashion, anything that gives us a feel for your taste. You don’t have to stick to your industry. If you have a Pinterest board, paste the link here. If you have saved images, upload them below (up to 5)."
        >
          <textarea
            value={state.visualInspirationNotes}
            onChange={(e) => setState((s) => ({ ...s, visualInspirationNotes: e.target.value }))}
            className={PORTAL_CLIENT_INPUT_CLASS}
            rows={5}
            maxLength={8000}
          />
          <div className="mt-4 space-y-3">
            <p className="font-body text-xs text-burgundy/55">Inspiration images (optional, max 5)</p>
            <ul className="flex flex-wrap gap-3">
              {state.visualInspirationImagePaths.map((p) => (
                <li key={p} className="relative h-24 w-24 overflow-hidden rounded-xl border border-zinc-200/90 bg-zinc-50">
                  {/* eslint-disable-next-line @next/next/no-img-element -- portal file proxy URL */}
                  <img
                    src={portalFilePublicUrl(p)}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    title="Remove image"
                    onClick={() => void removeFile(p, "inspiration")}
                    className="absolute right-1 top-1 flex h-8 w-8 items-center justify-center rounded-lg bg-burgundy/90 text-[10px] font-bold text-cream shadow-sm hover:bg-burgundy"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
            {state.visualInspirationImagePaths.length < 5 ? (
              <label className="inline-flex min-h-[44px] cursor-pointer items-center justify-center rounded-xl border border-dashed border-burgundy/25 bg-cream px-4 py-3 font-body text-sm text-burgundy hover:border-burgundy/45">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="sr-only"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    e.target.value = "";
                    if (f) void upload("inspiration", f);
                  }}
                />
                Upload an image
              </label>
            ) : null}
          </div>
        </Field>
      </SectionCard>

      <SectionCard
        index={5}
        title="The landscape"
        intro="A quick look at who else is out there — and what makes you, you."
      >
        <Field
          label="Who are your competitors or brands you admire?"
          required
          helper="List any businesses in your space (or outside it) that you think are doing their branding well. This helps us understand the market you’re in and where you want to sit within it."
        >
          <textarea
            value={state.competitorsAdmire}
            onChange={(e) => setState((s) => ({ ...s, competitorsAdmire: e.target.value }))}
            className={PORTAL_CLIENT_INPUT_CLASS}
            rows={4}
            maxLength={8000}
          />
        </Field>
        <Field
          label="What makes you different from them?"
          required
          helper="What do you offer or stand for that they don’t? This doesn’t need to be complicated — even something like “we’re more personal” or “we focus on a specific niche” is useful."
        >
          <textarea
            value={state.whatMakesDifferent}
            onChange={(e) => setState((s) => ({ ...s, whatMakesDifferent: e.target.value }))}
            className={PORTAL_CLIENT_INPUT_CLASS}
            rows={4}
            maxLength={8000}
          />
        </Field>
      </SectionCard>

      <SectionCard
        index={6}
        title="Existing assets"
        intro="If you’re starting from scratch, that’s wonderful too — just let us know."
      >
        <Field
          label="Do you have any existing brand assets we should be aware of?"
          required
          helper="This might be an old logo, a font you already use, photography you want to carry through, or anything else we should factor in. If you’re starting completely from scratch, just select No."
        >
          <div className="flex flex-wrap gap-3">
            {(
              [
                { id: "yes", label: "Yes, I have files or notes to share" },
                { id: "no", label: "No, we’re starting fresh" },
              ] as const
            ).map((opt) => (
              <label
                key={opt.id}
                className={`flex min-h-[44px] min-w-[10rem] flex-1 cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 font-body text-sm transition-colors sm:flex-none ${
                  state.hasExistingAssets === opt.id
                    ? "border-burgundy bg-burgundy/[0.08] text-burgundy"
                    : "border-zinc-200/90 bg-white text-burgundy/85 hover:border-burgundy/25"
                }`}
              >
                <input
                  type="radio"
                  name="hasExistingAssets"
                  checked={state.hasExistingAssets === opt.id}
                  onChange={() => setState((s) => ({ ...s, hasExistingAssets: opt.id }))}
                  className="h-4 w-4 border-zinc-300 text-burgundy focus:ring-burgundy/25"
                />
                {opt.label}
              </label>
            ))}
          </div>
          {state.hasExistingAssets === "yes" ? (
            <div className="mt-6 space-y-4">
              <textarea
                value={state.existingAssetsNotes}
                onChange={(e) => setState((s) => ({ ...s, existingAssetsNotes: e.target.value }))}
                placeholder="Context for your files — what they are and how you use them…"
                className={PORTAL_CLIENT_INPUT_CLASS}
                rows={4}
                maxLength={8000}
              />
              <ul className="space-y-2 font-body text-sm text-burgundy/70">
                {state.existingAssetsFilePaths.map((p) => (
                  <li key={p} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-zinc-200/80 bg-zinc-50/80 px-3 py-2">
                    <span className="min-w-0 truncate">{p.split("/").pop()}</span>
                    <button
                      type="button"
                      className="shrink-0 text-rose-800 underline-offset-4 hover:underline"
                      onClick={() => void removeFile(p, "existing")}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
              {state.existingAssetsFilePaths.length < 10 ? (
                <label className="inline-flex min-h-[44px] cursor-pointer items-center justify-center rounded-xl border border-dashed border-burgundy/25 bg-cream px-4 py-3 font-body text-sm text-burgundy hover:border-burgundy/45">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,application/pdf,.pdf"
                    className="sr-only"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      e.target.value = "";
                      if (f) void upload("existing", f);
                    }}
                  />
                  Upload a file
                </label>
              ) : null}
            </div>
          ) : null}
        </Field>
      </SectionCard>

      <div className="sticky bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] z-10 flex flex-col gap-3 rounded-2xl border border-zinc-200/90 bg-cream/95 p-4 shadow-lg backdrop-blur-sm sm:bottom-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-body text-xs text-burgundy/60">
          {submitReady
            ? "When you’re happy with everything, submit once — you can still message us if anything changes."
            : "Complete each section above — the submit button will unlock when everything required is filled in."}
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={!submitReady || pending}
            onClick={onSubmit}
            className={ctaButtonClasses({
              variant: "burgundy",
              size: "md",
              className: "min-h-[44px] min-w-[12rem] justify-center gap-2 normal-case tracking-normal disabled:pointer-events-none disabled:opacity-45",
            })}
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
            Submit questionnaire
          </button>
        </div>
      </div>
    </div>
  );
}

export function BrandQuestionnaireReadOnly({ initialJson }: { initialJson: string }) {
  const data = parseBrandQuestionnaireJson(initialJson);
  const empty = emptyBrandQuestionnaire();
  const isEmpty = JSON.stringify(data) === JSON.stringify(empty);

  if (isEmpty) {
    return (
      <p className="mt-8 font-body text-sm text-burgundy/65">No answers saved yet.</p>
    );
  }

  const Row = ({ label, value }: { label: string; value: string }) =>
    value.trim() ? (
      <div className="rounded-xl border border-zinc-200/80 bg-white p-4 shadow-sm">
        <p className="font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-burgundy/50">{label}</p>
        <p className="mt-2 whitespace-pre-wrap font-body text-sm leading-relaxed text-burgundy/85">{value}</p>
      </div>
    ) : null;

  const TagList = ({ label, tags }: { label: string; tags: string[] }) =>
    tags.length > 0 ? (
      <div className="rounded-xl border border-zinc-200/80 bg-white p-4 shadow-sm">
        <p className="font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-burgundy/50">{label}</p>
        <p className="mt-2 font-body text-sm text-burgundy/85">{tags.join(" · ")}</p>
      </div>
    ) : null;

  return (
    <div className="mt-8 space-y-4">
      <Row label="Business name" value={data.businessName} />
      <Row label="What the business does" value={data.businessDoes} />
      <Row label="Mission & purpose" value={data.brandMissionPurpose} />
      <Row
        label="Business journey"
        value={
          data.businessJourney
            ? `${BUSINESS_JOURNEY_OPTIONS.find((o) => o.id === data.businessJourney)?.label ?? data.businessJourney}${data.businessJourney === "other" && data.businessJourneyOther.trim() ? ` — ${data.businessJourneyOther}` : ""}`
            : ""
        }
      />
      <Row label="Ideal customer" value={data.idealCustomer} />
      <div className="rounded-xl border border-zinc-200/80 bg-white p-4 shadow-sm">
        <p className="font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-burgundy/50">
          Audience online
        </p>
        <p className="mt-2 font-body text-sm text-burgundy/85">
          {data.audienceOnline.length
            ? data.audienceOnline
                .map((id) => AUDIENCE_ONLINE_OPTIONS.find((o) => o.id === id)?.label ?? id)
                .join(", ")
            : "—"}
          {data.audienceOnline.includes("other") && data.audienceOnlineOther.trim()
            ? ` (${data.audienceOnlineOther})`
            : ""}
        </p>
      </div>
      <Row label="How customers should feel" value={data.customerFeelings} />
      <TagList label="Personality" tags={data.personalityTags} />
      <TagList label="Tone of voice" tags={data.toneTags} />
      <Row label="Should never feel like" value={data.brandNeverFeels} />
      <Row label="Colour preferences" value={data.colourPreferences} />
      <TagList label="Visual style words" tags={data.visualStyleTags} />
      <Row label="Visual inspiration & links" value={data.visualInspirationNotes} />
      {data.visualInspirationImagePaths.length > 0 ? (
        <div className="rounded-xl border border-zinc-200/80 bg-white p-4 shadow-sm">
          <p className="font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-burgundy/50">
            Inspiration images
          </p>
          <ul className="mt-3 flex flex-wrap gap-3">
            {data.visualInspirationImagePaths.map((p) => (
              <li key={p} className="h-28 w-28 overflow-hidden rounded-lg border border-zinc-200/90">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={portalFilePublicUrl(p)} alt="" className="h-full w-full object-cover" />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <Row label="Competitors & brands admired" value={data.competitorsAdmire} />
      <Row label="What makes you different" value={data.whatMakesDifferent} />
      <div className="rounded-xl border border-zinc-200/80 bg-white p-4 shadow-sm">
        <p className="font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-burgundy/50">
          Existing assets
        </p>
        <p className="mt-2 font-body text-sm text-burgundy/85">
          {data.hasExistingAssets === "yes" ? "Yes" : data.hasExistingAssets === "no" ? "No" : "—"}
        </p>
        {data.hasExistingAssets === "yes" ? (
          <>
            <Row label="Notes" value={data.existingAssetsNotes} />
            {data.existingAssetsFilePaths.length > 0 ? (
              <ul className="mt-2 font-body text-sm text-burgundy/80">
                {data.existingAssetsFilePaths.map((p) => (
                  <li key={p}>{p.split("/").pop()}</li>
                ))}
              </ul>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
