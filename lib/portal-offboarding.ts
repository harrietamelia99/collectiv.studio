export type OffboardingQuestionDef = {
  key: string;
  prompt: string;
  required: boolean;
  maxLength: number;
  multiline: boolean;
};

/** Fixed offboarding prompts (answers stored in PublishedClientReview.offboardingAnswersJson). */
export const OFFBOARDING_QUESTIONS: OffboardingQuestionDef[] = [
  {
    key: "went_well",
    prompt: "What went well on this project?",
    required: true,
    maxLength: 2000,
    multiline: true,
  },
  {
    key: "improve",
    prompt: "What could we improve next time?",
    required: true,
    maxLength: 2000,
    multiline: true,
  },
  {
    key: "highlight",
    prompt: "What should other clients know about working with us?",
    required: true,
    maxLength: 2000,
    multiline: true,
  },
];

export type OffboardingAnswerRow = { key: string; prompt: string; answer: string };

export function formFieldNameForOffboardingQuestion(key: string): string {
  return `offboarding_${key}`;
}

/** Parse and validate answers from POST body; returns null if invalid. */
export function parseOffboardingAnswersFromFormData(formData: FormData): OffboardingAnswerRow[] | null {
  const rows: OffboardingAnswerRow[] = [];
  for (const q of OFFBOARDING_QUESTIONS) {
    const raw = String(formData.get(formFieldNameForOffboardingQuestion(q.key)) ?? "").trim();
    if (q.required && !raw) return null;
    if (raw.length > q.maxLength) return null;
    rows.push({ key: q.key, prompt: q.prompt, answer: raw });
  }
  return rows;
}

export function offboardingHighlightAnswer(rows: OffboardingAnswerRow[]): string {
  return rows.find((r) => r.key === "highlight")?.answer?.trim() ?? "";
}

export function clientNeedsOffboardingForm(params: {
  studio: boolean;
  /** True when the client may use the full project hub (contract/deposit or legacy verify). */
  portalUnlockedForClient: boolean;
  studioMarkedCompleteAt: Date | null;
  hasSubmittedReview: boolean;
}): boolean {
  if (params.studio) return false;
  if (!params.portalUnlockedForClient || !params.studioMarkedCompleteAt) return false;
  return !params.hasSubmittedReview;
}
