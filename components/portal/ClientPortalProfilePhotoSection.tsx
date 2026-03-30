import { saveClientProfilePhoto } from "@/app/portal/actions";
import { portalClientAvatarPublicUrl } from "@/lib/portal-client-avatar";
import { ctaButtonClasses } from "@/components/ui/Button";

type Props = {
  userId: string;
  profilePhotoPath: string | null;
};

export function ClientPortalProfilePhotoSection({ userId, profilePhotoPath }: Props) {
  const previewUrl =
    profilePhotoPath?.trim() ? portalClientAvatarPublicUrl(userId, profilePhotoPath.trim()) : null;

  return (
    <section
      className="cc-portal-client-shell mt-6 max-w-xl"
      aria-labelledby="client-profile-photo-heading"
    >
      <h2 id="client-profile-photo-heading" className="cc-portal-client-shell-title text-lg">
        Message profile photo
      </h2>
      <p className="mt-2 max-w-lg cc-portal-client-description text-sm font-medium">
        Optional — this picture appears next to your messages so the studio can recognise you in the thread. Square JPG,
        PNG, or WebP, up to 4MB.
      </p>
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
        {previewUrl ? (
          <span className="relative flex h-16 w-16 shrink-0 overflow-hidden rounded-full border border-zinc-200/90 bg-white shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element -- signed URL from our API */}
            <img src={previewUrl} alt="" className="h-full w-full object-cover" />
          </span>
        ) : null}
        <form action={saveClientProfilePhoto} className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-end">
          <label className="min-w-0 flex-1 font-body text-xs font-semibold uppercase tracking-[0.08em] text-burgundy/70">
            <span className="mb-1.5 block">Upload</span>
            <input
              type="file"
              name="photo"
              accept="image/jpeg,image/png,image/webp"
              required
              className="block w-full max-w-xs font-body text-sm text-burgundy file:mr-3 file:rounded-lg file:border file:border-burgundy/20 file:bg-cream file:px-3 file:py-2 file:font-medium file:text-burgundy"
            />
          </label>
          <button type="submit" className={ctaButtonClasses({ variant: "burgundy", size: "sm", className: "shrink-0" })}>
            Save photo
          </button>
        </form>
      </div>
    </section>
  );
}
