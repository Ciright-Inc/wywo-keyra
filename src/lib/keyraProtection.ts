import { createHash } from "node:crypto";
import type { KeyraSessionUser } from "@/lib/keyraSessionCookie";
import { prisma } from "@/lib/prisma";
import { isPostgresDatabaseUrlConfigured } from "@/lib/postgresEnv";

export type AuthSessionSnapshot = {
  authenticated: boolean;
  phoneE164?: string;
  profileComplete?: boolean;
  email?: string | null;
  fullName?: string | null;
  displayName?: string | null;
  username?: string | null;
};

export type ProtectionRecommendation = {
  id: string;
  label: string;
  href: string;
  points: number;
};

export type ProtectionDashboard = {
  identityWatch: {
    status: "clear" | "alert";
    statusLabel: string;
    lastScanAt: string | null;
    lastScanLabel: string;
    monitoringActive: boolean;
  };
  securityScore: {
    percent: number;
    tier: "excellent" | "good" | "fair" | "needs_attention";
    summary: string;
    recommendations: ProtectionRecommendation[];
  };
  trustedLocations: Array<{
    id: string;
    label: string;
    lastSeenLabel: string;
    isCurrent: boolean;
  }>;
  devices: Array<{
    id: string;
    label: string;
    deviceKind: string;
    lastActiveLabel: string;
    isCurrent: boolean;
  }>;
  emergency: {
    lockAvailable: boolean;
    recoveryAvailable: boolean;
  };
};

/** Prefer real browser UA from client fetch (avoids missing/wrong User-Agent on some dev setups). */
export function resolveClientUserAgent(req: Request): string {
  const fromClient = req.headers.get("x-keyra-client-ua")?.trim();
  if (fromClient) return fromClient.slice(0, 512);
  const platform = req.headers.get("sec-ch-ua-platform")?.replace(/"/g, "").trim();
  const ua = req.headers.get("user-agent")?.trim() ?? "";
  if (ua) return ua.slice(0, 512);
  if (platform) return `Client-Hint-Platform/${platform}`;
  return "";
}

function browserNameFromUserAgent(ua: string): string {
  if (/Edg\//i.test(ua)) return "Edge";
  if (/OPR\/|Opera/i.test(ua)) return "Opera";
  if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua)) return "Chrome";
  if (/Firefox\//i.test(ua)) return "Firefox";
  if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) return "Safari";
  return "Browser";
}

function parseDeviceFromUserAgent(ua: string): {
  label: string;
  deviceKind: "Mobile" | "Desktop" | "Other";
} {
  const s = ua.trim();
  if (!s) return { label: "Unknown browser", deviceKind: "Other" };

  const browser = browserNameFromUserAgent(s);

  // Desktop first — do not treat Windows/Mac/Linux as Android.
  if (/Windows NT|Win64|WOW64|Windows/i.test(s)) {
    return { label: `Windows · ${browser}`, deviceKind: "Desktop" };
  }
  if ((/Macintosh|Mac OS X/i.test(s) || /Mac OS/i.test(s)) && !/iPhone|iPad/i.test(s)) {
    return { label: `Mac · ${browser}`, deviceKind: "Desktop" };
  }
  if (/CrOS/i.test(s)) {
    return { label: "Chromebook", deviceKind: "Desktop" };
  }
  if (/Linux|X11|x86_64|Ubuntu|Fedora/i.test(s) && !/Android/i.test(s)) {
    return { label: `Linux · ${browser}`, deviceKind: "Desktop" };
  }

  if (/iPhone/i.test(s)) return { label: "iPhone", deviceKind: "Mobile" };
  if (/iPad/i.test(s)) return { label: "iPad", deviceKind: "Mobile" };
  if (/Android/i.test(s)) return { label: "Android phone", deviceKind: "Mobile" };
  if (/Mobile|webOS|BlackBerry|IEMobile|Opera Mini/i.test(s)) {
    return { label: `Mobile · ${browser}`, deviceKind: "Mobile" };
  }

  return { label: `${browser} (desktop)`, deviceKind: "Desktop" };
}

export function userAgentHash(ua: string): string {
  return createHash("sha256").update(ua.trim() || "unknown").digest("hex").slice(0, 32);
}

function regionFromRequest(req: Request): string | null {
  const cc =
    req.headers.get("cf-ipcountry") ??
    req.headers.get("x-vercel-ip-country") ??
    req.headers.get("cloudfront-viewer-country");
  if (!cc || cc === "XX") return null;
  return cc.toUpperCase();
}

function formatRelativeDate(iso: string | Date | null): string {
  if (!iso) return "Not yet";
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return "Not yet";
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dayDiff = Math.round(
    (startOfToday.getTime() - startOfDate.getTime()) / (24 * 60 * 60 * 1000),
  );
  if (dayDiff === 0) return "Today";
  if (dayDiff === 1) return "Yesterday";
  if (dayDiff < 7) return "This week";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export async function fetchAuthSessionSnapshot(
  req: Request,
): Promise<AuthSessionSnapshot> {
  const { resolveAuthBackendUrl } = await import("@/lib/resolveAuthBackendUrl");
  const base = resolveAuthBackendUrl(req);
  if (!base) {
    return { authenticated: false };
  }
  try {
    const res = await fetch(`${base}/auth/session`, {
      method: "GET",
      headers: { cookie: req.headers.get("cookie") ?? "" },
      cache: "no-store",
    });
    if (!res.ok) return { authenticated: false };
    const json = (await res.json()) as {
      authenticated?: boolean;
      user?: {
        phone?: string;
        email?: string | null;
        fullName?: string | null;
        displayName?: string | null;
        username?: string | null;
        profileComplete?: boolean;
      } | null;
    };
    if (!json.authenticated || !json.user?.phone) {
      return { authenticated: false };
    }
    const phone = json.user.phone.startsWith("+")
      ? json.user.phone
      : `+${json.user.phone}`;
    return {
      authenticated: true,
      phoneE164: phone,
      profileComplete: json.user.profileComplete,
      email: json.user.email,
      fullName: json.user.fullName,
      displayName: json.user.displayName,
      username: json.user.username,
    };
  } catch {
    return { authenticated: false };
  }
}

function computeSecurityScore(
  user: KeyraSessionUser,
  auth: AuthSessionSnapshot,
): { percent: number; recommendations: ProtectionRecommendation[] } {
  let score = 0;
  const recommendations: ProtectionRecommendation[] = [];

  if (auth.authenticated) {
    score += 45;
  } else {
    recommendations.push({
      id: "sign-in",
      label: "Complete phone sign-in",
      href: "/login?next=/app",
      points: 45,
    });
  }

  const hasName = Boolean(
    user.displayName?.trim() ||
      auth.displayName?.trim() ||
      auth.username?.trim() ||
      auth.fullName?.trim(),
  );
  if (hasName) {
    score += 15;
  } else {
    recommendations.push({
      id: "display-name",
      label: "Add your display name",
      href: "/app/profile",
      points: 15,
    });
  }

  const hasEmail = Boolean(user.email?.trim() || auth.email?.trim());
  if (hasEmail) {
    score += 15;
  } else {
    recommendations.push({
      id: "email",
      label: "Add a recovery email",
      href: "/app/profile",
      points: 15,
    });
  }

  if (user.country?.trim()) {
    score += 10;
  } else {
    recommendations.push({
      id: "country",
      label: "Set your country or region",
      href: "/app/profile?focus=country",
      points: 10,
    });
  }

  if (auth.profileComplete) {
    score += 15;
  } else if (auth.authenticated) {
    recommendations.push({
      id: "profile",
      label: "Finish your profile",
      href: "/app/profile",
      points: 15,
    });
  }

  return { percent: Math.min(100, score), recommendations };
}

function scoreTier(percent: number): ProtectionDashboard["securityScore"]["tier"] {
  if (percent >= 85) return "excellent";
  if (percent >= 70) return "good";
  if (percent >= 50) return "fair";
  return "needs_attention";
}

function scoreSummary(percent: number, tier: ProtectionDashboard["securityScore"]["tier"]): string {
  if (tier === "excellent") {
    return `Excellent posture. Improve to 100% by addressing ${percent < 100 ? "recommended actions" : "optional refinements"}.`;
  }
  if (tier === "good") {
    return "Solid protection. A few recommended actions can raise your score.";
  }
  if (tier === "fair") {
    return "Protection is on. Complete recommended actions to strengthen your posture.";
  }
  return "Keyra is active. Complete the steps below to strengthen protection.";
}

export async function syncProtectionEntities(
  phoneE164: string,
  req: Request,
  user: KeyraSessionUser,
  regionCode: string | null,
): Promise<void> {
  if (!isPostgresDatabaseUrlConfigured()) return;

  const ua = resolveClientUserAgent(req);
  const hash = userAgentHash(ua);
  const { label, deviceKind: kind } = parseDeviceFromUserAgent(ua);
  const now = new Date();

  await prisma.$transaction([
    prisma.keyraUserDevice.updateMany({
      where: { phoneE164 },
      data: { isCurrent: false },
    }),
    prisma.keyraUserDevice.upsert({
      where: { phoneE164_userAgentHash: { phoneE164, userAgentHash: hash } },
      create: {
        phoneE164,
        label,
        deviceKind: kind,
        userAgentHash: hash,
        lastActiveAt: now,
        isCurrent: true,
      },
      update: { label, deviceKind: kind, lastActiveAt: now, isCurrent: true },
    }),
  ]);

  if (user.country?.trim()) {
    const homeLabel = user.country.trim();
    const existingHome = await prisma.keyraTrustedLocation.findFirst({
      where: { phoneE164, label: homeLabel },
    });
    if (existingHome) {
      await prisma.keyraTrustedLocation.update({
        where: { id: existingHome.id },
        data: { lastSeenAt: now, isCurrent: !regionCode },
      });
    } else {
      await prisma.keyraTrustedLocation.create({
        data: {
          phoneE164,
          label: homeLabel,
          regionHint: user.country,
          lastSeenAt: now,
          isCurrent: false,
        },
      });
    }
  }

  if (regionCode) {
    const regionLabel = regionCode;
    const existing = await prisma.keyraTrustedLocation.findFirst({
      where: { phoneE164, regionHint: regionCode },
    });
    if (existing) {
      await prisma.keyraTrustedLocation.updateMany({
        where: { phoneE164 },
        data: { isCurrent: false },
      });
      await prisma.keyraTrustedLocation.update({
        where: { id: existing.id },
        data: { lastSeenAt: now, isCurrent: true },
      });
    } else {
      await prisma.keyraTrustedLocation.updateMany({
        where: { phoneE164 },
        data: { isCurrent: false },
      });
      await prisma.keyraTrustedLocation.create({
        data: {
          phoneE164,
          label: regionLabel,
          regionHint: regionCode,
          lastSeenAt: now,
          isCurrent: true,
        },
      });
    }
  }
}

export async function buildProtectionDashboard(
  phoneE164: string,
  user: KeyraSessionUser,
  auth: AuthSessionSnapshot,
  req: Request,
): Promise<ProtectionDashboard> {
  await syncProtectionEntities(phoneE164, req, user, regionFromRequest(req));

  const { percent, recommendations } = computeSecurityScore(user, auth);
  const tier = scoreTier(percent);

  let lastScanAt: Date | null = null;
  let scanStatus = "clear";

  if (isPostgresDatabaseUrlConfigured()) {
    const row = await prisma.keyraUserProtection.findUnique({
      where: { phoneE164 },
    });
    lastScanAt = row?.lastScanAt ?? null;
    scanStatus = row?.scanStatus ?? "clear";
  }

  const devices = isPostgresDatabaseUrlConfigured()
    ? await prisma.keyraUserDevice.findMany({
        where: { phoneE164 },
        orderBy: { lastActiveAt: "desc" },
        take: 8,
      })
    : [];

  const locations = isPostgresDatabaseUrlConfigured()
    ? await prisma.keyraTrustedLocation.findMany({
        where: { phoneE164 },
        orderBy: { lastSeenAt: "desc" },
        take: 6,
      })
    : [];

  const statusLabel =
    scanStatus === "alert"
      ? "Review recommended — activity detected"
      : lastScanAt
        ? `No compromised data found (as of ${formatRelativeDate(lastScanAt)})`
        : "Monitoring active — run a scan to check your credentials";

  return {
    identityWatch: {
      status: scanStatus === "alert" ? "alert" : "clear",
      statusLabel,
      lastScanAt: lastScanAt?.toISOString() ?? null,
      lastScanLabel: formatRelativeDate(lastScanAt),
      monitoringActive: auth.authenticated,
    },
    securityScore: {
      percent,
      tier,
      summary: scoreSummary(percent, tier),
      recommendations: recommendations.slice(0, 4),
    },
    trustedLocations: locations.map((loc) => ({
      id: loc.id,
      label: loc.isCurrent ? `${loc.label} (Current)` : loc.label,
      lastSeenLabel: formatRelativeDate(loc.lastSeenAt),
      isCurrent: loc.isCurrent,
    })),
    devices: devices.map((d) => ({
      id: d.id,
      label: `${d.label} • ${d.isCurrent ? "Active" : "Seen"}`,
      deviceKind: d.deviceKind,
      lastActiveLabel: formatRelativeDate(d.lastActiveAt),
      isCurrent: d.isCurrent,
    })),
    emergency: {
      lockAvailable: auth.authenticated,
      recoveryAvailable: auth.authenticated,
    },
  };
}

export async function runIdentityScan(phoneE164: string): Promise<{ scannedAt: Date }> {
  const now = new Date();
  if (!isPostgresDatabaseUrlConfigured()) {
    return { scannedAt: now };
  }
  await prisma.keyraUserProtection.upsert({
    where: { phoneE164 },
    create: { phoneE164, lastScanAt: now, scanStatus: "clear" },
    update: { lastScanAt: now, scanStatus: "clear" },
  });
  return { scannedAt: now };
}

export async function addTrustedLocation(
  phoneE164: string,
  label: string,
): Promise<{ id: string }> {
  const row = await prisma.keyraTrustedLocation.create({
    data: { phoneE164, label: label.trim().slice(0, 120), isCurrent: false },
  });
  return { id: row.id };
}
