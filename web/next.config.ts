import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Disable Turbopack's persistent filesystem cache so Railpack's
    // layer cache never serves a stale module graph that predates new
    // source files (e.g. "Cannot find module '@/lib/...'").
    turbopackPersistentCaching: false,
  },
};

export default nextConfig;
