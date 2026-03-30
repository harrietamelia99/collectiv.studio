import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

const VERSION_PREFIX = "v1:";
const ALGO = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const SCRYPT_SALT = "collectiv-website-domain-registrar-v1";

function deriveKey(): Buffer {
  const domainSecret = process.env.WEBSITE_DOMAIN_ACCESS_SECRET?.trim();
  const socialFallback = process.env.SOCIAL_ACCOUNT_ACCESS_SECRET?.trim();
  const secret = domainSecret || socialFallback;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "WEBSITE_DOMAIN_ACCESS_SECRET or SOCIAL_ACCOUNT_ACCESS_SECRET must be set in production to store domain registrar credentials.",
      );
    }
    return scryptSync("dev-only-do-not-use-in-prod-domain-vault", SCRYPT_SALT, 32);
  }
  return scryptSync(secret, SCRYPT_SALT, 32);
}

export type WebsiteDomainVaultPayload = {
  login: string;
  password: string;
};

export function encryptWebsiteDomainVaultPayload(payload: WebsiteDomainVaultPayload): string | null {
  const login = payload.login.trim();
  const password = payload.password.trim();
  if (!login && !password) return null;
  const plain = JSON.stringify({ login, password });
  const key = deriveKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGO, key, iv);
  const ciphertext = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  const combined = Buffer.concat([iv, ciphertext, tag]);
  return `${VERSION_PREFIX}${combined.toString("base64")}`;
}

export function decryptWebsiteDomainVaultPayload(
  stored: string | null | undefined,
): WebsiteDomainVaultPayload | null {
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
    const json = Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
    const parsed = JSON.parse(json) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    const o = parsed as Record<string, unknown>;
    const login = typeof o.login === "string" ? o.login : "";
    const password = typeof o.password === "string" ? o.password : "";
    return { login, password };
  } catch {
    return null;
  }
}
