import type { NextConfig } from "next";

/**
 * Next.js 16: `experimental.turbopackPersistentCaching` is not in `ExperimentalConfig` and breaks
 * `next build` typecheck (Railway / Railpack). Use `turbopackFileSystemCacheForBuild` to control
 * build-time Turbopack FS cache (false helps layered CI avoid stale module graphs).
 *
 * Local dev: `package.json` uses `next dev --webpack` by default for stable RSC/client hydration;
 * use `npm run dev:turbo` when you want Turbopack.
 */
const nextConfig: NextConfig = {
  /** Monorepo / multiple lockfiles: always treat this app directory as the Turbopack root (avoids wrong chunk graph in CI). */
  turbopack: {
    root: process.cwd(),
  },
  experimental: {
    turbopackFileSystemCacheForBuild: false,
  },
  /** Prevent CDN/browser from serving a stale /verify-device document pointing at old client bundles. */
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
