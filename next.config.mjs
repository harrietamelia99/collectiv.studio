/** @type {import('next').NextConfig} */
const staticExport = process.env.NEXT_STATIC_EXPORT === "1";

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
          return [
            {
              source: "/:path*",
              headers: headersForEnv,
            },
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
  },
};

export default nextConfig;
