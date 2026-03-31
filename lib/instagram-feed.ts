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
  console.warn(`[instagram-feed] ${message}`);
}

type FetchAttempt = { root: string; path: string; label: string };

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
  const res = await fetch(url, {
    next: { revalidate: 900 },
  });
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
  const token = process.env.INSTAGRAM_ACCESS_TOKEN?.trim();
  if (!token) {
    if (process.env.NODE_ENV === "development") {
      logFeedFailure(
        "INSTAGRAM_ACCESS_TOKEN is not set — add it in .env locally or Vercel → Environment Variables for production.",
      );
    }
    return null;
  }

  const userId = process.env.INSTAGRAM_USER_ID?.trim();
  const customBase = process.env.INSTAGRAM_GRAPH_BASE_URL?.trim();

  if (customBase && isFacebookGraph() && !userId) {
    logFeedFailure(
      "INSTAGRAM_GRAPH_BASE_URL points at graph.facebook.com but INSTAGRAM_USER_ID is missing — set your Instagram Business Account id (digits only).",
    );
    return null;
  }

  const capped = Math.min(Math.max(1, limit), 25);
  const fields =
    "id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,children{media_type,media_url,thumbnail_url}";

  try {
    const attempts = buildFetchAttempts(userId, customBase);
    let lastError = "";

    for (const { root, path, label } of attempts) {
      const { items, error, status } = await fetchMediaOnce(root, path, fields, capped, token);
      if (items?.length) {
        if (label !== attempts[0].label && process.env.NODE_ENV === "development") {
          logFeedFailure(
            `Using fallback "${label}" (${root}/${path}) — fix INSTAGRAM_USER_ID or INSTAGRAM_GRAPH_BASE_URL if you want a single explicit endpoint.`,
          );
        }
        return items;
      }
      if (error) lastError = `${label}: ${status} ${error}`;
    }

    if (lastError) {
      logFeedFailure(
        `All attempts failed. Last: ${lastError}. For Business/Creator + Page token use INSTAGRAM_GRAPH_BASE_URL=https://graph.facebook.com and a numeric INSTAGRAM_USER_ID.`,
      );
    }
    return null;
  } catch (e) {
    logFeedFailure(e instanceof Error ? e.message : "Network error calling Instagram Graph API.");
    return null;
  }
}
