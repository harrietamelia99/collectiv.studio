export type SocialOnboardingData = {
  businessOverview: string;
  targetAudience: string;
  visualStyle: string;
  inspiringAccounts: string;
  /** "yes" | "partial" | "no" */
  existingBrandKit: string;
  brandingPackageNeeded: boolean;
  extraNotes: string;
  /** Step 2 — optional planning (studio can help if blank). */
  postIdeas: string;
  dealsPromos: string;
  keyDates: string;
  needPlanningHelp: boolean;
};

export const defaultSocialOnboarding = (): SocialOnboardingData => ({
  businessOverview: "",
  targetAudience: "",
  visualStyle: "",
  inspiringAccounts: "",
  existingBrandKit: "",
  brandingPackageNeeded: false,
  extraNotes: "",
  postIdeas: "",
  dealsPromos: "",
  keyDates: "",
  needPlanningHelp: false,
});

export function parseSocialOnboardingJson(raw: string | null | undefined): SocialOnboardingData {
  const base = defaultSocialOnboarding();
  if (!raw?.trim()) return base;
  try {
    const v = JSON.parse(raw) as Record<string, unknown>;
    return {
      businessOverview: typeof v.businessOverview === "string" ? v.businessOverview : "",
      targetAudience: typeof v.targetAudience === "string" ? v.targetAudience : "",
      visualStyle: typeof v.visualStyle === "string" ? v.visualStyle : "",
      inspiringAccounts: typeof v.inspiringAccounts === "string" ? v.inspiringAccounts : "",
      existingBrandKit: typeof v.existingBrandKit === "string" ? v.existingBrandKit : "",
      brandingPackageNeeded: v.brandingPackageNeeded === true,
      extraNotes: typeof v.extraNotes === "string" ? v.extraNotes : "",
      postIdeas: typeof v.postIdeas === "string" ? v.postIdeas : "",
      dealsPromos: typeof v.dealsPromos === "string" ? v.dealsPromos : "",
      keyDates: typeof v.keyDates === "string" ? v.keyDates : "",
      needPlanningHelp: v.needPlanningHelp === true,
    };
  } catch {
    return base;
  }
}
