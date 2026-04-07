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
};

export default nextConfig;
