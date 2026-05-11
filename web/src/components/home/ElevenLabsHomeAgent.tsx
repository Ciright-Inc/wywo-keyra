"use client";

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useKeyraSession } from "@/contexts/KeyraSessionContext";
import { resolveElevenLabsAgentId } from "@/lib/elevenLabsAgentConfig";

/**
 * ElevenLabs ConvAI widget — `<elevenlabs-convai>` + embed script.
 * The embed script loads **only after sign-in** so anonymous visits are not blocked by unpkg.
 *
 * @see https://elevenlabs.io/docs/agents-platform/customization/widget
 */

export const KEYRA_ELEVENLABS_CONVAI_WIDGET_ID = "keyra-elevenlabs-convai";

const ELEVENLABS_EMBED_SCRIPT_ID = "keyra-elevenlabs-convai-embed-script";
const ELEVENLABS_EMBED_SRC = "https://unpkg.com/@elevenlabs/convai-widget-embed";

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
  const [embedReady, setEmbedReady] = useState(false);

  const widgetHostRef = useRef<HTMLElement | null>(null);

  /** Client-only: avoids custom-element SSR mismatch without `setState` in an effect. */
  const convaiMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  useEffect(() => {
    if (!user) {
      setEmbedReady(false);
      return;
    }

    const existing =
      (document.getElementById(ELEVENLABS_EMBED_SCRIPT_ID) as HTMLScriptElement | null) ??
      (document.querySelector(
        `script[src*="convai-widget-embed"]`,
      ) as HTMLScriptElement | null);

    if (existing) {
      if (!existing.id) existing.id = ELEVENLABS_EMBED_SCRIPT_ID;
      if (existing.dataset.loaded === "true") {
        setEmbedReady(true);
        return;
      }
      const done = () => {
        existing.dataset.loaded = "true";
        setEmbedReady(true);
      };
      existing.addEventListener("load", done, { once: true });
      existing.addEventListener("error", done, { once: true });
      return;
    }

    const s = document.createElement("script");
    s.id = ELEVENLABS_EMBED_SCRIPT_ID;
    s.async = true;
    s.src = ELEVENLABS_EMBED_SRC;
    s.onload = () => {
      s.dataset.loaded = "true";
      setEmbedReady(true);
    };
    s.onerror = () => setEmbedReady(true);
    document.body.appendChild(s);
  }, [user]);

  useEffect(() => {
    const phoneE164 = user?.phoneE164?.trim();
    if (!phoneE164 || !convaiMounted || !embedReady) return;
    devPostElevenLabsIntent("on-page-load", {
      agentId,
      userId: phoneE164,
      dynamicVariables: {
        employee_id: "",
        phone_number: phoneE164.trim(),
        is_widget: "1",
      },
    });
  }, [user?.phoneE164, convaiMounted, embedReady, agentId]);

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
    if (!user || !convaiMounted || !embedReady) return;
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
  }, [user, convaiMounted, embedReady, dynamicVariablesJson]);

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

  if (!convaiMounted || !user || !embedReady) return null;

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
