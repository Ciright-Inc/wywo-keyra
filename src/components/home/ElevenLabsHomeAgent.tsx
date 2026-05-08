"use client";

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";
import { useKeyraSession } from "@/contexts/KeyraSessionContext";
import { resolveElevenLabsAgentId } from "@/lib/elevenLabsAgentConfig";

/**
 * ElevenLabs ConvAI widget — matches `index (1).html`: `<elevenlabs-convai>` +
 * `@elevenlabs/convai-widget-embed`, floating variant, and `dynamic-variables`
 * (`employee_id`, `phone_number`). **Only rendered after sign-in.**
 *
 * @see https://elevenlabs.io/docs/agents-platform/customization/widget
 */

export const KEYRA_ELEVENLABS_CONVAI_WIDGET_ID = "keyra-elevenlabs-convai";

/** Same as the demo “Start” button: open / start the floating widget if the embed exposes an API. */
export function openKeyraElevenLabsConvai() {
  if (typeof document === "undefined") return;
  const widget = document.getElementById(KEYRA_ELEVENLABS_CONVAI_WIDGET_ID);
  if (!widget) return;
  const candidates = ["open", "expand", "start", "startCall", "begin"] as const;
  for (const name of candidates) {
    try {
      const fn = (widget as unknown as Record<string, unknown>)[name];
      if (typeof fn === "function") {
        (fn as () => void).call(widget);
        return;
      }
    } catch {
      /* ignore */
    }
  }
  try {
    widget.scrollIntoView({ behavior: "smooth", block: "center" });
    widget.click();
  } catch {
    /* ignore */
  }
}

type ElevenLabsSessionPayload = {
  agentId: string;
  userId: string;
  dynamicVariables: Record<string, string>;
};

type DevIntentKind = "on-page-load";

function devPostElevenLabsIntent(kind: DevIntentKind, payload: ElevenLabsSessionPayload) {
  if (process.env.NODE_ENV !== "development") return;
  void fetch("/api/keyra/dev/elevenlabs-session-intent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({
      kind,
      ...payload,
      inspect_phone_number: payload.dynamicVariables.phone_number,
      inspect_employee_id: payload.dynamicVariables.employee_id,
      inspect_userId: payload.userId,
      at: new Date().toISOString(),
    }),
  }).catch(() => {});
}

export function ElevenLabsHomeAgent() {
  const { user } = useKeyraSession();
  const agentId = useMemo(() => resolveElevenLabsAgentId(), []);

  const widgetHostRef = useRef<HTMLElement | null>(null);

  /** Client-only: avoids custom-element SSR mismatch without `setState` in an effect. */
  const convaiMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  useEffect(() => {
    const phoneE164 = user?.phoneE164?.trim();
    if (!phoneE164 || !convaiMounted) return;
    devPostElevenLabsIntent("on-page-load", {
      agentId,
      userId: phoneE164,
      dynamicVariables: {
        employee_id: "",
        phone_number: phoneE164.trim(),
        is_widget: "1",
      },
    });
  }, [user?.phoneE164, convaiMounted, agentId]);

  const dynamicVariables = useMemo(() => {
    return {
      employee_id: "",
      phone_number: user?.phoneE164?.trim() ?? "",
      is_widget: "1",
    };
  }, [user?.phoneE164]);

  const dynamicVariablesJson = useMemo(
    () => JSON.stringify(dynamicVariables),
    [dynamicVariables],
  );

  /** Mirror static HTML: setAttribute so the custom element sees latest context. */
  useLayoutEffect(() => {
    if (!user || !convaiMounted) return;
    const el =
      widgetHostRef.current ??
      (typeof document !== "undefined"
        ? document.getElementById(KEYRA_ELEVENLABS_CONVAI_WIDGET_ID)
        : null);
    if (!el || !convaiMounted) return;
    try {
      el.setAttribute("dynamic-variables", dynamicVariablesJson);
    } catch {
      /* ignore */
    }
  }, [user, convaiMounted, dynamicVariablesJson]);

  useEffect(() => {
    if (!user || process.env.NODE_ENV !== "development" || typeof window === "undefined") {
      return;
    }
    try {
      (
        window as Window & {
          __KEYRA_ELEVENLABS_CONVAI_DYNAMIC_VARS__?: Record<string, string>;
        }
      ).__KEYRA_ELEVENLABS_CONVAI_DYNAMIC_VARS__ = { ...dynamicVariables };
    } catch {
      /* ignore */
    }
  }, [user, dynamicVariables]);

  if (!convaiMounted || !user) return null;

  return (
    <elevenlabs-convai
      ref={(el) => {
        widgetHostRef.current = el;
      }}
      id={KEYRA_ELEVENLABS_CONVAI_WIDGET_ID}
      agent-id={agentId}
      variant="floating"
      action-text="Talk to the agent"
      start-call-text="Start"
      end-call-text="End"
      expand-text="Open"
      listening-text="Listening…"
      speaking-text="Speaking…"
      dynamic-variables={dynamicVariablesJson}
    />
  );
}
