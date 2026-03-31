import { SectionHeading } from "@/components/ui/SectionHeading";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { InstagramIcon } from "@/components/ui/SocialIcons";
import { fetchInstagramFeed } from "@/lib/instagram-feed";
import { siteInstagramHandleLabel, siteInstagramHref } from "@/lib/site";
import { ctaButtonClasses } from "@/components/ui/Button";

/** Single row on the home page; 4:5 portrait tiles. */
const FEED_COUNT = 4;
const FALLBACK_SLOTS = FEED_COUNT;

function FeedSkeleton() {
  return (
    <ul className="mt-10 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3 md:gap-4">
      {Array.from({ length: FALLBACK_SLOTS }, (_, i) => (
        <li
          key={i}
          className="aspect-[4/5] min-w-0 animate-pulse rounded-none bg-burgundy/[0.06]"
          aria-hidden
        />
      ))}
    </ul>
  );
}

export function HomeInstagramSectionFallback() {
  const href = siteInstagramHref();
  const handle = siteInstagramHandleLabel();
  return (
    <section className="bg-cream px-6 py-16 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center text-center">
          <SectionLabel className="mb-4 text-burgundy/75">[ Instagram ]</SectionLabel>
          <SectionHeading className="max-w-xl">
            Follow <em>the feed</em>
          </SectionHeading>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2.5 font-body text-[11px] uppercase tracking-[0.14em] text-burgundy/60 transition-opacity hover:text-burgundy hover:opacity-90"
          >
            <InstagramIcon className="h-5 w-5 text-burgundy/70" />
            {handle}
          </a>
          <p className="mt-4 max-w-xl font-body text-sm leading-relaxed text-burgundy/65">
            Project snapshots, launches, and behind-the-scenes — follow us on Instagram. The grid loads when the server
            has a valid Meta access token (see <code className="font-mono text-[11px] text-burgundy/75">INSTAGRAM_ACCESS_TOKEN</code>{" "}
            in <code className="font-mono text-[11px] text-burgundy/75">.env.example</code>). On Vercel, add the same
            variables under Project → Settings → Environment Variables, then redeploy.
          </p>
        </div>
        <FeedSkeleton />
        <div className="mt-10 flex justify-center">
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={ctaButtonClasses({ variant: "outline", size: "md", className: "" })}
          >
            Open Instagram
          </a>
        </div>
      </div>
    </section>
  );
}

export async function HomeInstagramSection() {
  const postsRaw = await fetchInstagramFeed(FEED_COUNT);
  const posts = postsRaw?.slice(0, FEED_COUNT) ?? [];
  const href = siteInstagramHref();
  const handle = siteInstagramHandleLabel();

  if (!posts.length) {
    return <HomeInstagramSectionFallback />;
  }

  return (
    <section className="bg-cream px-6 py-16 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center text-center">
          <SectionLabel className="mb-4 text-burgundy/75">[ Instagram ]</SectionLabel>
          <SectionHeading className="max-w-xl">
            Follow <em>the feed</em>
          </SectionHeading>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2.5 font-body text-[11px] uppercase tracking-[0.14em] text-burgundy/60 transition-opacity hover:text-burgundy hover:opacity-90"
          >
            <InstagramIcon className="h-5 w-5 text-burgundy/70" />
            {handle}
          </a>
          <p className="mt-4 max-w-xl font-body text-sm leading-relaxed text-burgundy/65">
            Latest from the studio - tap a post to view it on Instagram.
          </p>
        </div>

        <ul className="mt-10 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3 md:gap-4">
          {posts.map((p) => (
            <li key={p.id} className="min-w-0">
              <a
                href={p.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="group block aspect-[4/5] overflow-hidden rounded-none border-cc border-solid border-[var(--cc-hairline)] bg-burgundy/[0.04] shadow-soft transition-[border-color,box-shadow,transform] duration-300 ease-smooth hover:border-burgundy/20 hover:shadow-nav"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- remote Instagram CDN URLs */}
                <img
                  src={p.imageSrc}
                  alt=""
                  className="h-full w-full object-cover object-center transition-transform duration-500 ease-smooth group-hover:scale-[1.04]"
                  loading="lazy"
                  decoding="async"
                  sizes="(max-width: 639px) 50vw, 20vw"
                />
              </a>
            </li>
          ))}
        </ul>

        <div className="mt-10 flex justify-center">
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={ctaButtonClasses({ variant: "outline", size: "md", className: "" })}
          >
            View on Instagram
          </a>
        </div>
      </div>
    </section>
  );
}
