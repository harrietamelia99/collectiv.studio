import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

const VERSION_PREFIX = "v1:";
const ALGO = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16; // GCM default tag size
const SCRYPT_SALT = "collectiv-social-account-access-v1";

function deriveKey(): Buffer {
  const secret = process.env.SOCIAL_ACCOUNT_ACCESS_SECRET?.trim();
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SOCIAL_ACCOUNT_ACCESS_SECRET must be set in production to store social account access.");
    }
    return scryptSync("dev-only-do-not-use-in-prod", SCRYPT_SALT, 32);
  }
  return scryptSync(secret, SCRYPT_SALT, 32);
}

/** Returns null for empty input; base64 payload prefixed with v1: */
export function encryptSocialAccountAccessPlaintext(plain: string): string | null {
  const text = plain.trim();
  if (!text) return null;
  const key = deriveKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGO, key, iv);
  const ciphertext = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  const combined = Buffer.concat([iv, ciphertext, tag]);
  return `${VERSION_PREFIX}${combined.toString("base64")}`;
}

export function decryptSocialAccountAccessPayload(stored: string | null | undefined): string | null {
  if (!stored?.trim().startsWith(VERSION_PREFIX)) return null;
  const raw = stored.slice(VERSION_PREFIX.length).trim();
  let buf: Buffer;
  try {
    buf = Buffer.from(raw, "base64");
  } catch {
    return null;
  }
  if (buf.length < IV_LENGTH + AUTH_TAG_LENGTH + 1) return null;
  const iv = buf.subarray(0, IV_LENGTH);
  const tag = buf.subarray(buf.length - AUTH_TAG_LENGTH);
  const ciphertext = buf.subarray(IV_LENGTH, buf.length - AUTH_TAG_LENGTH);
  try {
    const key = deriveKey();
    const decipher = createDecipheriv(ALGO, key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
  } catch {
    return null;
  }
}
