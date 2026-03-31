export type InstagramFeedItem = {
  id: string;
  permalink: string;
  imageSrc: string;
  mediaType: string;
};

type GraphMediaNode = {
  id: string;
  caption?: string;
  media_type?: string;
  media_url?: string;
  permalink?: string;
  thumbnail_url?: string;
  children?: { data?: GraphMediaNode[] };
};

type GraphMediaResponse = {
  data?: GraphMediaNode[];
  error?: { message?: string };
};

/** API version path segment, e.g. v21.0 */
function graphVersion(): string {
  return process.env.INSTAGRAM_GRAPH_API_VERSION?.trim() || "v21.0";
}

/**
 * Base for Graph requests. Default: Instagram Login / consumer API.
 * For an Instagram **Business/Creator** account linked to a Facebook Page, Meta often expects
 * `https://graph.facebook.com` plus your numeric Instagram User ID in `INSTAGRAM_USER_ID`.
 */
function graphRoot(): string {
  const custom = process.env.INSTAGRAM_GRAPH_BASE_URL?.trim();
  const v = graphVersion();
  if (custom) {
    return `${custom.replace(/\/$/, "")}/${v}`;
  }
  return `https://graph.instagram.com/${v}`;
}

function isFacebookGraph(): boolean {
  return graphRoot().includes("graph.facebook.com");
}

function displayUrl(node: GraphMediaNode): string | null {
  const t = node.media_type;
  if (t === "VIDEO") return node.thumbnail_url || node.media_url || null;
  if (t === "CAROUSEL_ALBUM") {
    const first = node.children?.data?.[0];
    if (first) return displayUrl(first);
  }
  return node.media_url || node.thumbnail_url || null;
}

function logFeedFailure(message: string) {
  /** Log in production too so Vercel Runtime Logs explain missing grids (tokens expire ~60d). */
  console.warn(`[instagram-feed] ${message}`);
}

type FetchAttempt = { root: string; path: string; label: string };

/** Includes carousel `children` — some tokens return 400 if nested fields aren’t allowed. */
const FIELDS_WITH_CAROUSEL =
  "id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,children{media_type,media_url,thumbnail_url}";

/** No nested fields — more compatible; carousel posts may be skipped if no top-level image URL. */
const FIELDS_BASIC = "id,caption,media_type,media_url,permalink,thumbnail_url";

function buildFetchAttempts(userId: string | undefined, customBase: string | undefined): FetchAttempt[] {
  const v = graphVersion();
  const igRoot = `https://graph.instagram.com/${v}`;
  const fbRoot = `https://graph.facebook.com/${v}`;
  const attempts: FetchAttempt[] = [];

  if (customBase) {
    const root = `${customBase.replace(/\/$/, "")}/${v}`;
    attempts.push({
      root,
      path: userId ? `${userId}/media` : "me/media",
      label: "configured",
    });
    /** If the configured host fails (wrong base, partial outage), same token often still works on graph.instagram.com. */
    if (userId) {
      attempts.push({ root: igRoot, path: `${userId}/media`, label: "instagram+userId+fallback" });
      attempts.push({ root: igRoot, path: "me/media", label: "instagram+me+fallback" });
    } else {
      attempts.push({ root: igRoot, path: "me/media", label: "instagram+me+fallback" });
    }
    return attempts;
  }

  if (userId) {
    attempts.push({ root: igRoot, path: `${userId}/media`, label: "instagram+userId" });
    attempts.push({ root: igRoot, path: "me/media", label: "instagram+me" });
    attempts.push({ root: fbRoot, path: `${userId}/media`, label: "facebook+userId" });
  } else {
    attempts.push({ root: igRoot, path: "me/media", label: "instagram+me" });
  }

  return attempts;
}

async function fetchMediaOnce(
  root: string,
  path: string,
  fields: string,
  capped: number,
  token: string,
): Promise<{ items: InstagramFeedItem[] | null; error?: string; status: number }> {
  const url = `${root}/${path}?fields=${fields}&limit=${capped}&access_token=${encodeURIComponent(token)}`;
  /**
   * Do not use Data Cache / ISR for Instagram: a failed or empty response must not stick for 15 minutes
   * after you renew INSTAGRAM_ACCESS_TOKEN on Vercel (otherwise the grid looks “gone” until cache expires).
   */
  const res = await fetch(url, { cache: "no-store" });
  const json = (await res.json()) as GraphMediaResponse;
  if (!res.ok || json.error?.message) {
    return {
      items: null,
      status: res.status,
      error: json.error?.message || res.statusText,
    };
  }
  if (!Array.isArray(json.data)) {
    return { items: null, status: res.status };
  }

  const out: InstagramFeedItem[] = [];
  for (const node of json.data) {
    const imageSrc = displayUrl(node);
    const permalink = node.permalink;
    if (!imageSrc || !permalink) continue;
    out.push({
      id: node.id,
      permalink,
      imageSrc,
      mediaType: node.media_type || "UNKNOWN",
    });
    if (out.length >= capped) break;
  }
  return { items: out.length > 0 ? out : null, status: res.status };
}

export type InstagramFeedCoreResult = {
  items: InstagramFeedItem[] | null;
  /** Same style of message logged as `[instagram-feed] …` (for diagnostics). */
  lastError: string | null;
};

/**
 * Internal: fetch feed and return items + last Graph error string (no secrets).
 * Env is read only via `process.env` (Vercel injects at runtime for serverless).
 */
async function fetchInstagramFeedCore(limit: number): Promise<InstagramFeedCoreResult> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN?.trim();
  if (!token) {
    const msg =
      "INSTAGRAM_ACCESS_TOKEN is not set — add it in .env locally or Vercel → Environment Variables for production.";
    logFeedFailure(msg);
    return { items: null, lastError: msg };
  }

  const userId = process.env.INSTAGRAM_USER_ID?.trim();
  const customBase = process.env.INSTAGRAM_GRAPH_BASE_URL?.trim();

  if (customBase && isFacebookGraph() && !userId) {
    const msg =
      "INSTAGRAM_GRAPH_BASE_URL points at graph.facebook.com but INSTAGRAM_USER_ID is missing — set your Instagram Business Account id (digits only).";
    logFeedFailure(msg);
    return { items: null, lastError: msg };
  }

  const capped = Math.min(Math.max(1, limit), 25);
  const fieldPasses: { name: string; fields: string }[] = [
    { name: "full+carousel", fields: FIELDS_WITH_CAROUSEL },
    { name: "basic", fields: FIELDS_BASIC },
  ];

  try {
    const attempts = buildFetchAttempts(userId, customBase);
    let lastErrorOverall = "";

    for (let pi = 0; pi < fieldPasses.length; pi++) {
      const { name: passName, fields } = fieldPasses[pi];
      let lastError = "";

      for (const { root, path, label } of attempts) {
        const { items, error, status } = await fetchMediaOnce(root, path, fields, capped, token);
        if (items?.length) {
          if (label !== attempts[0].label && process.env.NODE_ENV === "development") {
            logFeedFailure(
              `Using fallback endpoint "${label}" (${root}/${path}) — tighten INSTAGRAM_USER_ID / INSTAGRAM_GRAPH_BASE_URL if you want one fixed URL.`,
            );
          }
          if (passName === "basic") {
            logFeedFailure(
              "Instagram: using basic Graph fields (carousel expansion failed or was skipped — grid still loads for image/video posts).",
            );
          }
          return { items, lastError: null };
        }
        if (error) lastError = `${label}: ${status} ${error}`;
      }

      lastErrorOverall = lastError;
      if (lastError && pi === 0) {
        logFeedFailure(`Instagram full fields failed (${lastError}). Retrying with basic fields…`);
      }
    }

    if (lastErrorOverall) {
      const full = `All attempts failed. Last: ${lastErrorOverall}. For Business/Creator + Page token use INSTAGRAM_GRAPH_BASE_URL=https://graph.facebook.com and a numeric INSTAGRAM_USER_ID.`;
      logFeedFailure(full);
      return { items: null, lastError: full };
    }
    return { items: null, lastError: "No items returned (empty media list or posts missing image URLs)." };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Network error calling Instagram Graph API.";
    logFeedFailure(msg);
    return { items: null, lastError: msg };
  }
}

/**
 * Fetches recent Instagram media using an access token from Meta.
 *
 * Env:
 * - `INSTAGRAM_ACCESS_TOKEN` (required) — long-lived token from Meta.
 * - `INSTAGRAM_GRAPH_BASE_URL` (optional) — default `https://graph.instagram.com` (Instagram Login).
 *   Use `https://graph.facebook.com` for many **Business/Creator** setups (with numeric IG user id below).
 * - `INSTAGRAM_USER_ID` (optional) — numeric Instagram-scoped user id for `/{id}/media`.
 *   **Required** when using `graph.facebook.com` (Business/Creator); optional on `graph.instagram.com` (`me/media`).
 * - `INSTAGRAM_GRAPH_API_VERSION` (optional) — default `v21.0`.
 *
 * @see https://developers.facebook.com/docs/instagram-platform/instagram-graph-api/reference/ig-user/media
 */
export async function fetchInstagramFeed(limit = 8): Promise<InstagramFeedItem[] | null> {
  const { items } = await fetchInstagramFeedCore(limit);
  return items;
}

/** Safe summary for `/api/test-instagram` — never includes the access token. */
export async function diagnoseInstagramFeed(limit = 4): Promise<{
  environment: {
    hasAccessToken: boolean;
    accessTokenLength: number;
    hasUserId: boolean;
    userId: string | null;
    customGraphBase: string | null;
    apiVersion: string;
  };
  result: { ok: boolean; postCount: number; lastError: string | null };
}> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN?.trim();
  const userId = process.env.INSTAGRAM_USER_ID?.trim();
  const customBase = process.env.INSTAGRAM_GRAPH_BASE_URL?.trim();
  const { items, lastError } = await fetchInstagramFeedCore(limit);
  return {
    environment: {
      hasAccessToken: Boolean(token),
      accessTokenLength: token?.length ?? 0,
      hasUserId: Boolean(userId),
      userId: userId ?? null,
      customGraphBase: customBase ?? null,
      apiVersion: graphVersion(),
    },
    result: {
      ok: Boolean(items?.length),
      postCount: items?.length ?? 0,
      lastError,
    },
  };
}
