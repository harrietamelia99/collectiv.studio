/** Shared validation for POST /api/contact (marketing site forms). */

export const CONTACT_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ContactApiHomeBody = {
  source: "home";
  email: string;
  honeypot?: string;
};

export type ContactApiFullBody = {
  source: "contact";
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  businessName?: string;
  businessWebsite?: string;
  socialHandle?: string;
  basedIn?: string;
  industry?: string;
  aboutBusiness?: string;
  excitedAbout?: string;
  servicesInterested: string;
  budget: string;
  timeline: string;
  howHeard?: string;
  wordOfMouthThanks?: string;
  additionalQuestions?: string;
  honeypot?: string;
};

export type ContactApiParsed =
  | { ok: true; data: ContactApiHomeBody }
  | { ok: true; data: ContactApiFullBody }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

/** JSON body: checkbox sent as boolean true from fetch API. */
export function privacyConsentGiven(o: Record<string, unknown>): boolean {
  return o.privacyConsent === true;
}

export function parseContactApiJson(body: unknown): ContactApiParsed {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid JSON" };
  }
  const o = body as Record<string, unknown>;
  const source = str(o.source);
  if (source === "home") {
    const email = str(o.email).trim();
    if (!email) return { ok: false, error: "Email is required", fieldErrors: { email: "Required" } };
    if (!CONTACT_EMAIL_PATTERN.test(email)) {
      return { ok: false, error: "Invalid email", fieldErrors: { email: "Enter a valid email address" } };
    }
    if (!privacyConsentGiven(o)) {
      return {
        ok: false,
        error: "Privacy consent required",
        fieldErrors: {
          privacyConsent: "Please agree to our Privacy Policy to submit this form",
        },
      };
    }
    return {
      ok: true,
      data: { source: "home", email, honeypot: str(o.honeypot) },
    };
  }
  if (source !== "contact") {
    return { ok: false, error: "Unknown source" };
  }

  const fieldErrors: Record<string, string> = {};
  const firstName = str(o.firstName).trim();
  const lastName = str(o.lastName).trim();
  const email = str(o.email).trim();
  const servicesInterested = str(o.servicesInterested).trim();
  const budget = str(o.budget).trim();
  const timeline = str(o.timeline).trim();

  if (!firstName) fieldErrors.firstName = "Required";
  if (!lastName) fieldErrors.lastName = "Required";
  if (!email) fieldErrors.email = "Required";
  else if (!CONTACT_EMAIL_PATTERN.test(email)) fieldErrors.email = "Enter a valid email address";
  if (!servicesInterested) fieldErrors.servicesInterested = "Required";
  if (!budget) fieldErrors.budget = "Please choose an option";
  if (!timeline) fieldErrors.timeline = "Please choose an option";
  if (!privacyConsentGiven(o)) {
    fieldErrors.privacyConsent = "Please agree to our Privacy Policy to submit this form";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, error: "Validation failed", fieldErrors };
  }

  return {
    ok: true,
    data: {
      source: "contact",
      firstName,
      lastName,
      email,
      phone: str(o.phone).trim() || undefined,
      businessName: str(o.businessName).trim() || undefined,
      businessWebsite: str(o.businessWebsite).trim() || undefined,
      socialHandle: str(o.socialHandle).trim() || undefined,
      basedIn: str(o.basedIn).trim() || undefined,
      industry: str(o.industry).trim() || undefined,
      aboutBusiness: str(o.aboutBusiness).trim() || undefined,
      excitedAbout: str(o.excitedAbout).trim() || undefined,
      servicesInterested,
      budget,
      timeline,
      howHeard: str(o.howHeard).trim() || undefined,
      wordOfMouthThanks: str(o.wordOfMouthThanks).trim() || undefined,
      additionalQuestions: str(o.additionalQuestions).trim() || undefined,
      honeypot: str(o.honeypot),
    },
  };
}

export function fullContactToStudioRows(d: ContactApiFullBody): { label: string; value: string }[] {
  return [
    { label: "First name", value: d.firstName },
    { label: "Last name", value: d.lastName },
    { label: "Email", value: d.email },
    { label: "Phone", value: d.phone ?? "" },
    { label: "Business name", value: d.businessName ?? "" },
    { label: "Business website", value: d.businessWebsite ?? "" },
    { label: "Social handle", value: d.socialHandle ?? "" },
    { label: "Based in", value: d.basedIn ?? "" },
    { label: "Industry", value: d.industry ?? "" },
    { label: "About the business", value: d.aboutBusiness ?? "" },
    { label: "Excited about", value: d.excitedAbout ?? "" },
    { label: "Services interested in", value: d.servicesInterested },
    { label: "Budget", value: d.budget },
    { label: "Timeline", value: d.timeline },
    { label: "How they heard about us", value: d.howHeard ?? "" },
    { label: "Word of mouth thanks", value: d.wordOfMouthThanks ?? "" },
    { label: "Additional questions", value: d.additionalQuestions ?? "" },
  ];
}
