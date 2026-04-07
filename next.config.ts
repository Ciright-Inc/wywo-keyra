import type { NextConfig } from "next";

/**
 * Next.js 16: `experimental.turbopackPersistentCaching` is not in `ExperimentalConfig` and breaks
 * `next build` typecheck (Railway / Railpack). Use `turbopackFileSystemCacheForBuild` to control
 * build-time Turbopack FS cache (false helps layered CI avoid stale module graphs).
 */
const nextConfig: NextConfig = {
  experimental: {
    turbopackFileSystemCacheForBuild: false,
  },
  /** Prevent CDN/browser from serving an old /verify-device document that references pre-fix JS (client inlined prod IPification). */
  async headers() {
    return [
      {
        source: "/verify-device",
        headers: [
          {
            key: "Cache-Control",
            value: "private, no-cache, no-store, max-age=0, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
