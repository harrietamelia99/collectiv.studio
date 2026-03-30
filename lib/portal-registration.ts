/** Client portal passwords: at least 8 characters and at least one digit. */
export function portalClientPasswordOk(password: string): boolean {
  return password.length >= 8 && /\d/.test(password);
}

/** E.164-friendly: digits with optional leading +, 8–18 digit chars after normalizing separators. */
export function registrationPhoneOk(raw: string): boolean {
  const compact = raw.replace(/[\s().-]/g, "");
  if (compact.length < 8 || compact.length > 19) return false;
  return /^\+?[0-9]+$/.test(compact);
}

export function normalizePhoneForStorage(raw: string): string {
  return raw.replace(/\s+/g, " ").trim().slice(0, 32);
}
