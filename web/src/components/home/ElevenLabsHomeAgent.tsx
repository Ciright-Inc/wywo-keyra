"use client";

import {
  startTransition,
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
 * The embed loads for every visitor; `dynamic-variables` fill in after sign-in when phone/name exist.
 *
 * DevTools: ElevenLabs traffic is WebSocket/WebRTC — employee name is not a plain Keyra URL.
 * When `NODE_ENV=development` or `NEXT_PUBLIC_DEBUG_ELEVENLABS_SESSION=true`, we POST a mirror to
 * `/api/keyra/dev/elevenlabs-session-intent` with JSON `employee_name`, `inspect_employee_name`,
 * and headers `X-Keyra-Convai-Has-Employee-Name` / `X-Keyra-Convai-Employee-Name-B64` (UTF-8 base64).
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

type ConvaiMirrorKind = "convai-context-snapshot";

/** Same-origin mirror request so DevTools → Network shows what we pass to the widget (ElevenLabs uses WS/WebRTC). */
function convaiNetworkMirrorEnabled(): boolean {
  return (
    process.env.NODE_ENV === "development" ||
    process.env.NEXT_PUBLIC_DEBUG_ELEVENLABS_SESSION === "true"
  );
}

function utf8ToBase64Header(value: string): string | undefined {
  const t = value.trim();
  if (!t) return undefined;
  try {
    const bytes = new TextEncoder().encode(t);
    let binary = "";
    bytes.forEach((b) => {
      binary += String.fromCharCode(b);
    });
    return btoa(binary);
  } catch {
    return undefined;
  }
}

function mirrorConvaiDynamicVarsToNetwork(kind: ConvaiMirrorKind, payload: ElevenLabsSessionPayload) {
  if (!convaiNetworkMirrorEnabled()) return;
  const employeeName = payload.dynamicVariables.employee_name?.trim() ?? "";
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const nameB64 = utf8ToBase64Header(employeeName);
  if (nameB64) headers["X-Keyra-Convai-Employee-Name-B64"] = nameB64;
  if (employeeName) headers["X-Keyra-Convai-Has-Employee-Name"] = "1";

  void fetch("/api/keyra/dev/elevenlabs-session-intent", {
    method: "POST",
    headers,
    credentials: "same-origin",
    body: JSON.stringify({
      kind,
      agentId: payload.agentId,
      userId: payload.userId,
      dynamicVariables: payload.dynamicVariables,
      employee_name: employeeName,
      inspect_phone_number: payload.dynamicVariables.phone_number,
      inspect_employee_id: payload.dynamicVariables.employee_id,
      inspect_employee_name: employeeName,
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
    if (!convaiMounted) return;

    const existing =
      (document.getElementById(ELEVENLABS_EMBED_SCRIPT_ID) as HTMLScriptElement | null) ??
      (document.querySelector(
        `script[src*="convai-widget-embed"]`,
      ) as HTMLScriptElement | null);

    if (existing) {
      if (!existing.id) existing.id = ELEVENLABS_EMBED_SCRIPT_ID;
      if (existing.dataset.loaded === "true") {
        startTransition(() => {
          setEmbedReady(true);
        });
        return;
      }
      const done = () => {
        existing.dataset.loaded = "true";
        startTransition(() => {
          setEmbedReady(true);
        });
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
      startTransition(() => {
        setEmbedReady(true);
      });
    };
    s.onerror = () =>
      startTransition(() => {
        setEmbedReady(true);
      });
    document.body.appendChild(s);
  }, [convaiMounted]);

  useEffect(() => {
    if (!convaiMounted || !embedReady) return;
    const phoneE164 = user?.phoneE164?.trim() ?? "";
    mirrorConvaiDynamicVarsToNetwork("convai-context-snapshot", {
      agentId,
      userId: phoneE164 || "anonymous",
      dynamicVariables: {
        employee_id: "",
        employee_name: user?.displayName?.trim() ?? "",
        phone_number: phoneE164,
        is_widget: "1",
      },
    });
  }, [user?.phoneE164, user?.displayName, convaiMounted, embedReady, agentId]);

  const dynamicVariables = useMemo(() => {
    return {
      employee_id: "",
      employee_name: user?.displayName?.trim() ?? "",
      phone_number: user?.phoneE164?.trim() ?? "",
      is_widget: "1",
    };
  }, [user?.phoneE164, user?.displayName]);

  const dynamicVariablesJson = useMemo(
    () => JSON.stringify(dynamicVariables),
    [dynamicVariables],
  );

  /** Mirror static HTML: setAttribute so the custom element sees latest context. */
  useLayoutEffect(() => {
    if (!convaiMounted || !embedReady) return;
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
  }, [convaiMounted, embedReady, dynamicVariablesJson]);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development" || typeof window === "undefined") {
      return;
    }
    if (!convaiMounted || !embedReady) return;
    try {
      (
        window as Window & {
          __KEYRA_ELEVENLABS_CONVAI_DYNAMIC_VARS__?: Record<string, string>;
        }
      ).__KEYRA_ELEVENLABS_CONVAI_DYNAMIC_VARS__ = { ...dynamicVariables };
    } catch {
      /* ignore */
    }
  }, [convaiMounted, embedReady, dynamicVariables]);

  if (!convaiMounted || !embedReady) return null;

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
