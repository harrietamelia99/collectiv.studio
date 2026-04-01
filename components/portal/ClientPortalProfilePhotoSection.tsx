"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { Upload } from "lucide-react";
import { saveClientProfilePhoto } from "@/app/portal/actions";
import { portalClientAvatarPublicUrl } from "@/lib/portal-client-avatar-url";
import { ctaButtonClasses } from "@/components/ui/Button";

const MAX_BYTES = 4 * 1024 * 1024;
const ACCEPT = "image/jpeg,image/png,image/webp";

type Props = {
  userId: string;
  profilePhotoPath: string | null;
  /** Extra classes on the root section (defaults include top margin). */
  className?: string;
};

function isAllowedImage(file: File): boolean {
  return /^image\/(jpeg|png|webp)$/i.test(file.type) && file.size > 0 && file.size <= MAX_BYTES;
}

export function ClientPortalProfilePhotoSection({
  userId,
  profilePhotoPath,
  className = "mt-6",
}: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [localObjectUrl, setLocalObjectUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const serverUrl =
    profilePhotoPath?.trim() && !selectedFile ? portalClientAvatarPublicUrl(userId, profilePhotoPath.trim()) : null;
  const previewSrc = localObjectUrl ?? serverUrl;

  useEffect(() => {
    return () => {
      if (localObjectUrl) URL.revokeObjectURL(localObjectUrl);
    };
  }, [localObjectUrl]);

  const applyFile = useCallback((file: File) => {
    setError(null);
    if (!isAllowedImage(file)) {
      setError("Please use a JPG, PNG or WebP under 4MB.");
      return;
    }
    setSelectedFile(file);
    setLocalObjectUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    const input = inputRef.current;
    if (input) {
      const dt = new DataTransfer();
      dt.items.add(file);
      input.files = dt.files;
    }
  }, []);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) applyFile(file);
  };

  const onDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) applyFile(file);
  };

  const openPicker = () => inputRef.current?.click();

  return (
    <section
      className={`cc-portal-client-shell max-w-xl ${className}`}
      aria-labelledby="client-profile-photo-heading"
    >
      <h2 id="client-profile-photo-heading" className="cc-portal-client-shell-title text-lg">
        Message profile photo
      </h2>
      <p className="mt-2 max-w-lg cc-portal-client-description text-sm font-medium">
        Optional — this picture appears next to your messages so the studio can recognise you in the thread.
      </p>

      <form
        className="mt-5 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          const form = e.currentTarget;
          const fd = new FormData(form);
          const photo = fd.get("photo");
          if (!photo || typeof photo === "string" || !(photo instanceof File) || photo.size === 0) {
            setError("Choose a photo to upload.");
            return;
          }
          startTransition(async () => {
            try {
              await saveClientProfilePhoto(fd);
              setSelectedFile(null);
              setLocalObjectUrl((prev) => {
                if (prev) URL.revokeObjectURL(prev);
                return null;
              });
              if (inputRef.current) inputRef.current.value = "";
              router.refresh();
            } catch {
              setError("Upload failed — try again or use a smaller file.");
            }
          });
        }}
      >
        <input ref={inputRef} type="file" name="photo" accept={ACCEPT} className="sr-only" onChange={onInputChange} tabIndex={-1} />

        <button
          type="button"
          onClick={openPicker}
          onDragEnter={onDrag}
          onDragLeave={onDrag}
          onDragOver={onDrag}
          onDrop={onDrop}
          className={`flex w-full flex-col items-center rounded-xl border-2 border-dashed bg-[var(--cc-cream)] px-5 py-8 text-center transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#250d18] ${
            dragActive ? "border-[#250d18] bg-burgundy/[0.04]" : "border-[#250d18]"
          }`}
          aria-label="Upload profile photo — drag and drop or click to browse"
        >
          <Upload className="h-9 w-9 text-[#250d18]/80" strokeWidth={1.5} aria-hidden />
          <span className="mt-3 font-body text-sm font-medium text-[#250d18]">
            Drag and drop your photo here, or click to browse
          </span>
          <span className="mt-2 font-body text-xs text-burgundy/60">JPG, PNG or WebP, up to 4MB</span>
        </button>

        {previewSrc ? (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <span className="font-body text-xs font-semibold uppercase tracking-[0.08em] text-burgundy/55">Preview</span>
            <span className="relative flex h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-[#250d18]/20 bg-white shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element -- blob or app avatar URL */}
              <img src={previewSrc} alt="Profile preview" className="h-full w-full object-cover" />
            </span>
            {selectedFile ? (
              <span className="font-body text-xs text-burgundy/65 sm:ml-2">New photo — save to apply.</span>
            ) : null}
          </div>
        ) : null}

        {error ? (
          <p className="font-body text-sm text-rose-700" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={!selectedFile || pending}
          className={ctaButtonClasses({
            variant: "burgundy",
            size: "sm",
            className: !selectedFile || pending ? "cursor-not-allowed opacity-50" : "",
          })}
        >
          {pending ? "Saving…" : "Save photo"}
        </button>
      </form>
    </section>
  );
}
