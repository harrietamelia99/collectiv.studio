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
};

type GraphMediaResponse = {
  data?: GraphMediaNode[];
  error?: { message?: string };
};

function graphBase(): string {
  const v = process.env.INSTAGRAM_GRAPH_API_VERSION?.trim() || "v21.0";
  return `https://graph.instagram.com/${v}`;
}

function displayUrl(node: GraphMediaNode): string | null {
  const t = node.media_type;
  if (t === "VIDEO") return node.thumbnail_url || node.media_url || null;
  return node.media_url || node.thumbnail_url || null;
}

/**
 * Fetches recent Instagram media using an access token from Meta (Instagram API).
 * Set INSTAGRAM_ACCESS_TOKEN in the environment. If INSTAGRAM_USER_ID is set, uses
 * `/{user-id}/media`; otherwise uses `/me/media` (typical for user tokens).
 *
 * @see https://developers.facebook.com/docs/instagram-platform/instagram-graph-api/reference/ig-user/media
 */
export async function fetchInstagramFeed(limit = 8): Promise<InstagramFeedItem[] | null> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN?.trim();
  if (!token) return null;

  const capped = Math.min(Math.max(1, limit), 25);
  const fields =
    "id,caption,media_type,media_url,permalink,thumbnail_url,timestamp";
  const userId = process.env.INSTAGRAM_USER_ID?.trim();
  const path = userId ? `${userId}/media` : "me/media";
  const url = `${graphBase()}/${path}?fields=${fields}&limit=${capped}&access_token=${encodeURIComponent(token)}`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 900 },
    });
    const json = (await res.json()) as GraphMediaResponse;
    if (!res.ok || json.error?.message) {
      if (process.env.NODE_ENV === "development") {
        const hint = json.error?.message || res.statusText;
        console.warn(
          "[instagram-feed] Request failed — check INSTAGRAM_ACCESS_TOKEN and optional INSTAGRAM_USER_ID in .env, then restart the dev server.",
          hint,
        );
      }
      return null;
    }
    if (!Array.isArray(json.data)) return null;

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
    return out.length > 0 ? out : null;
  } catch {
    return null;
  }
}
