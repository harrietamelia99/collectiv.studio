/** Brand questionnaire v2 — JSON stored in `Project.brandingQuestionnaireJson`. */

export const BRAND_Q_VERSION = 2 as const;

export const BUSINESS_JOURNEY_OPTIONS = [
  { id: "just_starting", label: "Just starting out" },
  { id: "rebrand", label: "Been going for a while but ready for a rebrand" },
  { id: "scaling", label: "Established and scaling" },
  { id: "other", label: "Other" },
] as const;

export const AUDIENCE_ONLINE_OPTIONS = [
  { id: "instagram", label: "Instagram" },
  { id: "tiktok", label: "TikTok" },
  { id: "facebook", label: "Facebook" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "pinterest", label: "Pinterest" },
  { id: "youtube", label: "YouTube" },
  { id: "other", label: "Other" },
] as const;

export const PERSONALITY_TAG_OPTIONS = [
  "Bold",
  "Soft",
  "Playful",
  "Luxurious",
  "Minimal",
  "Warm",
  "Edgy",
  "Professional",
  "Friendly",
  "Empowering",
  "Natural",
  "Elevated",
  "Fun",
  "Calm",
  "Fierce",
] as const;

export const TONE_TAG_OPTIONS = [
  "Conversational",
  "Authoritative",
  "Inspirational",
  "Witty",
  "Nurturing",
  "Direct",
  "Educational",
  "Aspirational",
  "Honest",
  "Motivational",
] as const;

export const VISUAL_STYLE_TAG_OPTIONS = [
  "Clean",
  "Maximalist",
  "Feminine",
  "Gender neutral",
  "Moody",
  "Bright",
  "Earthy",
  "Monochrome",
  "Retro",
  "Modern",
  "Timeless",
  "Organic",
  "Structured",
  "Dreamy",
  "Raw",
] as const;

export const LEGACY_BRANDING_QUESTIONNAIRE_KEYS = ["brandMission", "targetAudience", "competitors", "visualDirection"] as const;

export type BrandQuestionnaireData = {
  v: typeof BRAND_Q_VERSION;
  businessName: string;
  businessDoes: string;
  brandMissionPurpose: string;
  businessJourney: string;
  businessJourneyOther: string;
  idealCustomer: string;
  audienceOnline: string[];
  audienceOnlineOther: string;
  customerFeelings: string;
  personalityTags: string[];
  toneTags: string[];
  brandNeverFeels: string;
  colourPreferences: string;
  visualStyleTags: string[];
  visualInspirationNotes: string;
  visualInspirationImagePaths: string[];
  competitorsAdmire: string;
  whatMakesDifferent: string;
  hasExistingAssets: string;
  existingAssetsNotes: string;
  existingAssetsFilePaths: string[];
};

export function emptyBrandQuestionnaire(): BrandQuestionnaireData {
  return {
    v: BRAND_Q_VERSION,
    businessName: "",
    businessDoes: "",
    brandMissionPurpose: "",
    businessJourney: "",
    businessJourneyOther: "",
    idealCustomer: "",
    audienceOnline: [],
    audienceOnlineOther: "",
    customerFeelings: "",
    personalityTags: [],
    toneTags: [],
    brandNeverFeels: "",
    colourPreferences: "",
    visualStyleTags: [],
    visualInspirationNotes: "",
    visualInspirationImagePaths: [],
    competitorsAdmire: "",
    whatMakesDifferent: "",
    hasExistingAssets: "",
    existingAssetsNotes: "",
    existingAssetsFilePaths: [],
  };
}

function clamp(s: string, max: number): string {
  return s.trim().slice(0, max);
}

const MAX_TAG_ITEM_LEN = 80;
/** UploadThing / legacy paths — must not be truncated to tag length. */
const MAX_STORED_ASSET_PATH_LEN = 4096;

function asStringArray(x: unknown, maxElementLength: number): string[] {
  if (!Array.isArray(x)) return [];
  return x
    .filter((i): i is string => typeof i === "string")
    .map((s) => s.trim().slice(0, maxElementLength));
}

/** Normalise parsed JSON into v2 shape (migrates legacy four-field questionnaire). */
export function parseBrandQuestionnaireJson(raw: string | null | undefined): BrandQuestionnaireData {
  const base = emptyBrandQuestionnaire();
  if (!raw?.trim()) return base;
  try {
    const v = JSON.parse(raw) as Record<string, unknown>;
    if (v && typeof v === "object" && v.v === BRAND_Q_VERSION) {
      return {
        v: BRAND_Q_VERSION,
        businessName: clamp(String(v.businessName ?? ""), 500),
        businessDoes: clamp(String(v.businessDoes ?? ""), 8000),
        brandMissionPurpose: clamp(String(v.brandMissionPurpose ?? ""), 8000),
        businessJourney: clamp(String(v.businessJourney ?? ""), 80),
        businessJourneyOther: clamp(String(v.businessJourneyOther ?? ""), 2000),
        idealCustomer: clamp(String(v.idealCustomer ?? ""), 8000),
        audienceOnline: asStringArray(v.audienceOnline, MAX_TAG_ITEM_LEN),
        audienceOnlineOther: clamp(String(v.audienceOnlineOther ?? ""), 2000),
        customerFeelings: clamp(String(v.customerFeelings ?? ""), 8000),
        personalityTags: asStringArray(v.personalityTags, MAX_TAG_ITEM_LEN),
        toneTags: asStringArray(v.toneTags, MAX_TAG_ITEM_LEN),
        brandNeverFeels: clamp(String(v.brandNeverFeels ?? ""), 8000),
        colourPreferences: clamp(String(v.colourPreferences ?? ""), 8000),
        visualStyleTags: asStringArray(v.visualStyleTags, MAX_TAG_ITEM_LEN),
        visualInspirationNotes: clamp(String(v.visualInspirationNotes ?? ""), 8000),
        visualInspirationImagePaths: asStringArray(v.visualInspirationImagePaths, MAX_STORED_ASSET_PATH_LEN).slice(
          0,
          5,
        ),
        competitorsAdmire: clamp(String(v.competitorsAdmire ?? ""), 8000),
        whatMakesDifferent: clamp(String(v.whatMakesDifferent ?? ""), 8000),
        hasExistingAssets: clamp(String(v.hasExistingAssets ?? ""), 20),
        existingAssetsNotes: clamp(String(v.existingAssetsNotes ?? ""), 8000),
        existingAssetsFilePaths: asStringArray(v.existingAssetsFilePaths, MAX_STORED_ASSET_PATH_LEN).slice(0, 10),
      };
    }
    const mission = clamp(String(v.brandMission ?? ""), 8000);
    const audience = clamp(String(v.targetAudience ?? ""), 8000);
    const comp = clamp(String(v.competitors ?? ""), 8000);
    const visual = clamp(String(v.visualDirection ?? ""), 8000);
    if (mission || audience || comp || visual) {
      return {
        ...base,
        brandMissionPurpose: mission,
        idealCustomer: audience,
        competitorsAdmire: comp,
        visualInspirationNotes: visual,
      };
    }
    return base;
  } catch {
    return base;
  }
}

export function stringifyBrandQuestionnaire(data: BrandQuestionnaireData): string {
  return JSON.stringify(data);
}

export type BrandQuestionnaireIssue = { section: number; label: string };

export function validateBrandQuestionnaireForSubmit(data: BrandQuestionnaireData): BrandQuestionnaireIssue[] {
  const issues: BrandQuestionnaireIssue[] = [];
  const add = (section: number, label: string) => issues.push({ section, label });

  if (!data.businessName.trim()) add(1, "Your business name");
  if (!data.businessDoes.trim()) add(1, "What does your business do?");
  if (!data.brandMissionPurpose.trim()) add(1, "Your brand mission and purpose");
  if (!data.businessJourney.trim()) add(1, "Where you are in your business journey");
  if (data.businessJourney === "other" && !data.businessJourneyOther.trim()) {
    add(1, "A few words for “Other” (your journey)");
  }

  if (!data.idealCustomer.trim()) add(2, "Who is your ideal customer?");
  if (data.audienceOnline.length === 0) add(2, "Where your audience spends time online (pick at least one)");
  if (data.audienceOnline.includes("other") && !data.audienceOnlineOther.trim()) {
    add(2, "Where they spend time — “Other”");
  }
  if (!data.customerFeelings.trim()) add(2, "What you want customers to feel");

  if (data.personalityTags.length === 0) add(3, "Brand personality (pick at least one)");
  if (data.toneTags.length === 0) add(3, "How your brand should sound (pick at least one)");
  if (!data.brandNeverFeels.trim()) add(3, "What your brand should never feel like");

  if (!data.colourPreferences.trim()) add(4, "Colour preferences");
  if (data.visualStyleTags.length === 0) add(4, "How you want your brand to look (pick at least one)");
  if (!data.visualInspirationNotes.trim() && data.visualInspirationImagePaths.length === 0) {
    add(4, "Visual inspiration (a short note, a link, or at least one image)");
  }

  if (!data.competitorsAdmire.trim()) add(5, "Competitors or brands you admire");
  if (!data.whatMakesDifferent.trim()) add(5, "What makes you different");

  if (data.hasExistingAssets !== "yes" && data.hasExistingAssets !== "no") {
    add(6, "Whether you have existing brand assets");
  }
  if (data.hasExistingAssets === "yes") {
    if (!data.existingAssetsNotes.trim() && data.existingAssetsFilePaths.length === 0) {
      add(6, "A note or file about your existing assets");
    }
  }

  return issues;
}

/** Six sections for the progress UI — returns count complete (0–6). */
export function brandQuestionnaireSectionProgress(data: BrandQuestionnaireData): { complete: number; total: number } {
  const total = 6;
  let n = 0;
  if (
    data.businessName.trim() &&
    data.businessDoes.trim() &&
    data.brandMissionPurpose.trim() &&
    data.businessJourney.trim() &&
    (data.businessJourney !== "other" || data.businessJourneyOther.trim())
  ) {
    n++;
  }
  if (
    data.idealCustomer.trim() &&
    data.audienceOnline.length > 0 &&
    (!data.audienceOnline.includes("other") || data.audienceOnlineOther.trim()) &&
    data.customerFeelings.trim()
  ) {
    n++;
  }
  if (data.personalityTags.length > 0 && data.toneTags.length > 0 && data.brandNeverFeels.trim()) {
    n++;
  }
  if (
    data.colourPreferences.trim() &&
    data.visualStyleTags.length > 0 &&
    (data.visualInspirationNotes.trim() || data.visualInspirationImagePaths.length > 0)
  ) {
    n++;
  }
  if (data.competitorsAdmire.trim() && data.whatMakesDifferent.trim()) {
    n++;
  }
  if (data.hasExistingAssets === "yes" || data.hasExistingAssets === "no") {
    if (data.hasExistingAssets === "no") n++;
    else if (data.existingAssetsNotes.trim() || data.existingAssetsFilePaths.length > 0) n++;
  }
  return { complete: n, total };
}

/** Legacy: step was “complete” if all four legacy fields were filled (no submit). */
export function legacyBrandingQuestionnaireFilled(json: string | null | undefined): boolean {
  if (!json?.trim()) return false;
  try {
    const v = JSON.parse(json) as Record<string, unknown>;
    if (v && typeof v === "object" && v.v === BRAND_Q_VERSION) return false;
    return LEGACY_BRANDING_QUESTIONNAIRE_KEYS.every(
      (k) => typeof v[k] === "string" && (v[k] as string).trim().length > 0,
    );
  } catch {
    return false;
  }
}
