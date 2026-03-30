"use client";

import { useCallback, useState } from "react";
import { ctaButtonClasses } from "@/components/ui/Button";

function isVideoUrl(url: string | null): boolean {
  if (!url) return false;
  const u = url.split("?")[0]?.toLowerCase() ?? "";
  return /\.(mp4|webm|mov|m4v)$/.test(u);
}

function extensionFromMime(mime: string | null): string | null {
  if (!mime) return null;
  const m = mime.split(";")[0]?.trim().toLowerCase();
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "video/mp4": "mp4",
    "video/webm": "webm",
    "video/quicktime": "mov",
  };
  return map[m] ?? null;
}

function extensionFromPath(url: string): string | null {
  const path = url.split("?")[0]?.split("/").pop()?.toLowerCase() ?? "";
  const m = path.match(/\.([a-z0-9]+)$/);
  return m ? m[1] : null;
}

function safeDownloadBase(name: string): string {
  const s = name
    .trim()
    .slice(0, 60)
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  return s || "post";
}

type Props = {
  caption: string;
  mediaUrl: string | null;
  /** Shapes the downloaded filename (title slug, etc.) */
  downloadBaseName?: string;
  className?: string;
  /** Default both true — hide either when actions are split across the UI (e.g. calendar modal). */
  showCopyCaption?: boolean;
  showCopyHashtags?: boolean;
  /** Text to copy when showCopyHashtags is true (e.g. resolved hashtag line). */
  hashtagsText?: string;
  showDownload?: boolean;
};

export function StudioPostScheduleActions({
  caption,
  mediaUrl,
  downloadBaseName = "post",
  className = "",
  showCopyCaption = true,
  showCopyHashtags = false,
  hashtagsText = "",
  showDownload = true,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [copiedHashtags, setCopiedHashtags] = useState(false);
  const [downloadState, setDownloadState] = useState<"idle" | "loading" | "error">("idle");

  const video = isVideoUrl(mediaUrl);

  const onCopyCaption = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(caption);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [caption]);

  const onCopyHashtags = useCallback(async () => {
    const t = hashtagsText.trim();
    if (!t) return;
    try {
      await navigator.clipboard.writeText(t);
      setCopiedHashtags(true);
      window.setTimeout(() => setCopiedHashtags(false), 2000);
    } catch {
      setCopiedHashtags(false);
    }
  }, [hashtagsText]);

  const onDownloadMedia = useCallback(async () => {
    if (!mediaUrl) return;
    setDownloadState("loading");
    try {
      const res = await fetch(mediaUrl, { credentials: "include" });
      if (!res.ok) throw new Error("fetch failed");
      const blob = await res.blob();
      const ext =
        extensionFromMime(res.headers.get("content-type")) ?? extensionFromPath(mediaUrl) ?? (video ? "mp4" : "jpg");
      const base = safeDownloadBase(downloadBaseName);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${base}.${ext}`;
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setDownloadState("idle");
    } catch {
      setDownloadState("error");
      window.setTimeout(() => setDownloadState("idle"), 3000);
    }
  }, [mediaUrl, video, downloadBaseName]);

  const btnClass = ctaButtonClasses({
    variant: "outline",
    size: "sm",
    className: "whitespace-nowrap",
  });

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`.trim()}>
      {showCopyCaption ? (
        <button type="button" onClick={onCopyCaption} className={btnClass}>
          {copied ? "Caption copied" : "Copy caption"}
        </button>
      ) : null}
      {showCopyHashtags && hashtagsText.trim() ? (
        <button type="button" onClick={onCopyHashtags} className={btnClass}>
          {copiedHashtags ? "Hashtags copied" : "Copy hashtags"}
        </button>
      ) : null}
      {showDownload && mediaUrl ? (
        <button
          type="button"
          onClick={onDownloadMedia}
          disabled={downloadState === "loading"}
          className={btnClass}
        >
          {downloadState === "loading"
            ? "Downloading…"
            : video
              ? "Download video"
              : "Download image"}
        </button>
      ) : null}
      {downloadState === "error" ? (
        <span className="font-body text-xs text-amber-900/90">Download failed — open the post and try again.</span>
      ) : null}
    </div>
  );
}
