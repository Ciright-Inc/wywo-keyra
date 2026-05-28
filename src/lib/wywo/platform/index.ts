/**
 * WYWO platform architecture — engine contracts for multi-surface delivery.
 * Web ships first; iOS, Android, iPad, and macOS clients consume the same UMO + event APIs.
 */

export type WywoPlatformSurface = "web" | "ios" | "ipad" | "android" | "macos";

/** Trust graph engine — rings govern routing, notifications, and AI policy. */
export type WywoTrustGraphEngine = {
  evaluateTrust: (ownerPhone: string, contactPhone: string) => Promise<unknown>;
  assignRing: (ownerPhone: string, contactPhone: string, ring: string) => Promise<void>;
};

/** Message routing — quiet hours, executive assistant, vacation mode. */
export type WywoRoutingEngine = {
  resolveRoute: (messageId: string, worldId: string | null) => Promise<{
    deliver: boolean;
    suppressNotification: boolean;
    escalateToAssistant: boolean;
  }>;
};

/** AI processing — never bypasses trust policies. */
export type WywoAiEngine = {
  summarize: (messageId: string) => Promise<{ summary: string; urgencyScore: number }>;
  transcribeVoicemail: (messageId: string, audioRef: string) => Promise<string>;
};

/** Multi-device sync reconciliation. */
export type WywoSyncEngine = {
  pushState: (deviceId: string, cursor: string) => Promise<void>;
  pullDelta: (deviceId: string, since: string) => Promise<unknown[]>;
};

/** Push notification dispatch (APNS / FCM). */
export type WywoNotificationEngine = {
  dispatch: (deviceId: string, payload: Record<string, unknown>) => Promise<void>;
};

/** Sovereign tenant boundary per world. */
export type WywoTenancyEngine = {
  assertWorldAccess: (actorPhone: string, worldId: string) => Promise<boolean>;
};

export const WYWO_PLATFORM_VISION = {
  product: "WYWO.KEYRA.IE",
  tagline: "While You Were Out",
  promise: "All messages. One place. Only verified communication enters your world.",
  surfaces: ["web", "ios", "ipad", "android", "macos"] as WywoPlatformSurface[],
} as const;
