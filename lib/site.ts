/** Canonical social URLs - override with env for staging / alternate handles. */

export function siteInstagramHref(): string {
  const fromEnv = process.env.INSTAGRAM_PROFILE_URL?.trim();
  if (fromEnv) return fromEnv;
  return "https://www.instagram.com/collectiv.studio/";
}

/** Display handle from profile URL path, e.g. `collectiv.studio` → `@collectiv.studio`. */
export function siteInstagramHandleLabel(): string {
  try {
    const path = new URL(siteInstagramHref()).pathname.replace(/\/$/, "");
    const seg = path.split("/").filter(Boolean).pop();
    return seg ? `@${seg}` : "Instagram";
  } catch {
    return "Instagram";
  }
}
