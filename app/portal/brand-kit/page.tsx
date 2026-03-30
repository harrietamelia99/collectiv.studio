import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { isStudioUser, listClientOwnedProjects } from "@/lib/portal-access";
import { portalFilePublicUrl } from "@/lib/portal-file-url";
import { parseWebsiteFontPaths } from "@/lib/portal-progress";

export const dynamic = "force-dynamic";

export default async function ClientBrandKitPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/portal/login");
  if (isStudioUser(session.user.email)) redirect("/portal");

  const [kit, projects] = await Promise.all([
    prisma.userBrandKit.findUnique({ where: { userId: session.user.id } }),
    listClientOwnedProjects(session.user.id),
  ]);
  const websiteProject = projects.find((p) => p.portalKind === "WEBSITE" || p.portalKind === "MULTI");
  const fonts = kit ? parseWebsiteFontPaths(kit.websiteFontPaths) : [];

  return (
    <div>
      <Link
        href="/portal"
        className="font-body text-[11px] uppercase tracking-[0.1em] text-burgundy/55 no-underline hover:text-burgundy"
      >
        ← My projects
      </Link>
      <h1 className="mt-6 font-display text-cc-h2 tracking-[-0.03em] text-burgundy">Your brand kit</h1>
      <p className="mt-3 max-w-xl font-body text-sm leading-relaxed text-burgundy/70">
        Saved colours, fonts, and logos apply to <strong className="font-medium text-burgundy/85">new projects</strong>{" "}
        automatically. Update them any time from a website project&apos;s{" "}
        <strong className="font-medium text-burgundy/85">Website kit</strong> page using{" "}
        <strong className="font-medium text-burgundy/85">Save to my account</strong>.
      </p>

      {!kit ? (
        <p className="mt-8 max-w-xl rounded-xl border border-dashed border-burgundy/25 bg-burgundy/[0.02] px-5 py-8 font-body text-sm text-burgundy/65">
          You don&apos;t have a saved kit yet. Open a website project, fill in the kit, then tap{" "}
          <strong className="font-medium text-burgundy/80">Save to my account</strong>.
        </p>
      ) : (
        <dl className="mt-8 max-w-xl space-y-4 rounded-xl border border-zinc-200/90 bg-white p-5 shadow-sm">
          <div>
            <dt className="font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-burgundy/45">
              Colours
            </dt>
            <dd className="mt-1 font-mono text-sm text-burgundy/85">
              {[kit.websitePrimaryHex, kit.websiteSecondaryHex, kit.websiteAccentHex, kit.websiteQuaternaryHex]
                .filter(Boolean)
                .join(" · ") || "—"}
            </dd>
          </div>
          <div>
            <dt className="font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-burgundy/45">Fonts</dt>
            <dd className="mt-1 font-body text-sm text-burgundy/85">
              {fonts.length ? fonts.join(", ") : "—"}
            </dd>
          </div>
          <div>
            <dt className="font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-burgundy/45">
              Primary logo
            </dt>
            <dd className="mt-2">
              {kit.websiteLogoPath ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={portalFilePublicUrl(kit.websiteLogoPath)}
                  alt=""
                  className="max-h-24 max-w-full object-contain"
                />
              ) : (
                <span className="font-body text-sm text-burgundy/55">—</span>
              )}
            </dd>
          </div>
        </dl>
      )}

      {websiteProject ? (
        <p className="mt-8 font-body text-sm text-burgundy/70">
          <Link
            href={`/portal/project/${websiteProject.id}/website/brand-kit`}
            className="font-medium text-burgundy underline decoration-burgundy/25 underline-offset-4 hover:decoration-burgundy/50"
          >
            Edit kit on {websiteProject.name}
          </Link>
        </p>
      ) : null}
    </div>
  );
}
