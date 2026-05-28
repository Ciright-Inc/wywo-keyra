import "server-only";

import type { UnifiedMessageObject, WywoSourceType } from "./umo";

/** Event topics published by the WYWO real-time bus (async workers consume these). */
export type WywoEventTopic =
  | "message.received"
  | "message.delivered"
  | "message.read"
  | "message.archived"
  | "message.blocked"
  | "trust.updated"
  | "sync.reconcile"
  | "notification.dispatch"
  | "ai.process"
  | "audit.append"
  | "device.route";

export type WywoEventEnvelope<TPayload = unknown> = {
  id: string;
  topic: WywoEventTopic;
  occurredAt: string;
  subscriptionId: string | null;
  worldId: string | null;
  actorPhone: string | null;
  payload: TPayload;
};

export type WywoMessageEventPayload = {
  umo: UnifiedMessageObject;
  sourceType: WywoSourceType;
};

type WywoEventHandler = (event: WywoEventEnvelope) => void | Promise<void>;

const handlers = new Map<WywoEventTopic, WywoEventHandler[]>();

export function onWywoEvent(topic: WywoEventTopic, handler: WywoEventHandler): () => void {
  const list = handlers.get(topic) ?? [];
  list.push(handler);
  handlers.set(topic, list);
  return () => {
    const next = (handlers.get(topic) ?? []).filter((h) => h !== handler);
    handlers.set(topic, next);
  };
}

/** Publish to in-process subscribers; production replaces this with a durable queue. */
export async function publishWywoEvent<TPayload>(
  topic: WywoEventTopic,
  payload: TPayload,
  meta?: { subscriptionId?: string | null; worldId?: string | null; actorPhone?: string | null },
): Promise<WywoEventEnvelope<TPayload>> {
  const event: WywoEventEnvelope<TPayload> = {
    id: `wywo_evt_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    topic,
    occurredAt: new Date().toISOString(),
    subscriptionId: meta?.subscriptionId ?? null,
    worldId: meta?.worldId ?? null,
    actorPhone: meta?.actorPhone ?? null,
    payload,
  };

  const subs = handlers.get(topic) ?? [];
  await Promise.all(subs.map((h) => Promise.resolve(h(event as WywoEventEnvelope))));

  return event;
}
