import type { NextConfig } from "next";

function parseAllowedDevOrigins(): string[] | undefined {
  if (process.env.NODE_ENV !== "development") return undefined;
  const raw = process.env.KEYRA_ALLOWED_DEV_ORIGINS?.trim();
  if (!raw) return undefined;
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

const allowedDevOrigins = parseAllowedDevOrigins();

/**
 * Next.js 16: `experimental.turbopackPersistentCaching` is not in `ExperimentalConfig` and breaks
 * `next build` typecheck (Railway / Railpack). Use `turbopackFileSystemCacheForBuild` to control
 * build-time Turbopack FS cache (false helps layered CI avoid stale module graphs).
 *
 * Local dev: `package.json` uses `next dev --webpack` by default for stable RSC/client hydration;
 * use `npm run dev:turbo` when you want Turbopack.
 */
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "s3.us-east-1.amazonaws.com",
        pathname: "/hrm.keyra.ie/**",
      },
    ],
  },
  /** Monorepo / multiple lockfiles: always treat this app directory as the Turbopack root (avoids wrong chunk graph in CI). */
  turbopack: {
    root: process.cwd(),
  },
  /**
   * Allow LAN dev access (e.g. opening the dev server from your phone or another machine on the
   * same network at http://192.168.x.x:3030). Without this, Next.js 16 blocks HMR, RSC payloads,
   * and Server Actions on non-localhost origins, which makes auth-protected pages bounce back to
   * /admin/login even after a successful POST to /api/admin/auth/login.
   * Add or remove hosts as needed; localhost / 127.0.0.1 are trusted automatically.
   */
  ...(allowedDevOrigins?.length ? { allowedDevOrigins } : {}),
  experimental: {
    turbopackFileSystemCacheForBuild: false,
  },
  /** Dev-only: same-origin proxy to simsecure-auth-session on :4000. Production uses NEXT_PUBLIC_SIMSECURE_AUTH_BACKEND_URL. */
  async rewrites() {
    if (process.env.NODE_ENV !== "development") return [];
    return [
      {
        source: "/api/simsecure-auth/:path*",
        destination: "http://127.0.0.1:4000/:path*",
      },
    ];
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
