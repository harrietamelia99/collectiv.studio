/**
 * @type {import('next').NextConfig}
 *
 * Vercel: if every `/api/*` route 404s but this repo builds them (see `next build` route list),
 * check **Project → Settings**:
 * - **Root Directory** must be the folder that contains this `next.config.mjs` (this repo’s git root).
 * - **Do not** set env `NEXT_STATIC_EXPORT=1` — it enables `output: "export"` and **removes all API routes**.
 * - **Output Directory** must stay empty/default for Next.js (do not point at `out` unless you intend static export).
 * - Confirm the **Production** deployment’s **Commit** matches GitHub (not an old fork or duplicate project).
 */
const staticExport = process.env.NEXT_STATIC_EXPORT === "1";

if (process.env.VERCEL === "1" && staticExport) {
  throw new Error(
    "[next.config] NEXT_STATIC_EXPORT=1 on Vercel removes API routes (output: export). Remove NEXT_STATIC_EXPORT from Vercel Environment Variables and redeploy.",
  );
}

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
];

if (process.env.NODE_ENV === "production") {
  securityHeaders.push({
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  });
}

const nextConfig = {
  // Chrome requests /favicon.ico; static PNG is served (correct Content-Type).
  async rewrites() {
    return [{ source: "/favicon.ico", destination: "/favicon-48.png" }];
  },
  // Repo has pre-existing ESLint issues; blocking the build takes the site offline.
  // Run `npm run lint` locally and fix incrementally.
  eslint: { ignoreDuringBuilds: true },
  ...(staticExport ? { output: "export" } : {}),
  ...(!staticExport
    ? {
        // Avoid relying on native file watchers (fixes EMFILE on macOS → blank/404 dev).
        // Match how people open the app (localhost vs 127.0.0.1) so RSC navigations don’t fail in dev.
        allowedDevOrigins: ["127.0.0.1", "localhost"],
        async headers() {
          // Embedded IDE previews (Cursor / VS Code Simple Browser) can break when framed cross-origin
          // with X-Frame-Options: SAMEORIGIN. Keep it for production only.
          const headersForEnv =
            process.env.NODE_ENV === "production"
              ? securityHeaders
              : securityHeaders.filter((h) => h.key !== "X-Frame-Options");
          const longCache = "public, max-age=31536000, immutable";
          return [
            {
              source: "/:path*",
              headers: headersForEnv,
            },
            { source: "/images/:path*", headers: [{ key: "Cache-Control", value: longCache }] },
            { source: "/videos/:path*", headers: [{ key: "Cache-Control", value: longCache }] },
            { source: "/fonts/:path*", headers: [{ key: "Cache-Control", value: longCache }] },
          ];
        },
      }
    : {}),
  webpack: (config, { dev }) => {
    if (dev && !staticExport) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
  images: {
    unoptimized: staticExport,
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: staticExport
      ? []
      : [
          { protocol: "https", hostname: "scontent.cdninstagram.com", pathname: "/**" },
          { protocol: "https", hostname: "scontent-*.cdninstagram.com", pathname: "/**" },
          { protocol: "https", hostname: "*.cdninstagram.com", pathname: "/**" },
        ],
  },
};

export default nextConfig;
