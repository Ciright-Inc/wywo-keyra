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
import { postCirightAgentSessionInBrowser } from "@/lib/cirightAgentSessionClient";

/**
 * ElevenLabs ConvAI widget — matches `index (1).html`: `<elevenlabs-convai>` +
 * `@elevenlabs/convai-widget-embed`, floating variant, and `dynamic-variables`
 * (`mobile_number`, `user_id`, …). Logged-in users get phone + Ciright-driven `source`.
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

type DevIntentKind = "ciright-on-page-load" | "ciright-after-response";

function devPostElevenLabsIntent(kind: DevIntentKind, payload: ElevenLabsSessionPayload) {
  if (process.env.NODE_ENV !== "development") return;
  void fetch("/api/keyra/dev/elevenlabs-session-intent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({
      kind,
      ...payload,
      inspect_mobile_number: payload.dynamicVariables.mobile_number,
      inspect_user_id: payload.dynamicVariables.user_id,
      inspect_userId: payload.userId,
      at: new Date().toISOString(),
    }),
  }).catch(() => {});
}

export function ElevenLabsHomeAgent() {
  const { user } = useKeyraSession();
  const agentId = useMemo(() => resolveElevenLabsAgentId(), []);

  /** Ciright outcome tied to the E.164 it was fetched for (avoids clearing success on React effect cleanup / Strict Mode). */
  const [cirightGate, setCirightGate] = useState<{
    phoneE164: string;
    dataStatus: boolean;
  } | null>(null);
  const widgetHostRef = useRef<HTMLElement | null>(null);

  /** Client-only: avoids custom-element SSR mismatch without `setState` in an effect. */
  const convaiMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  /** Ciright on load: updates `source` in dynamic vars once the API returns (phone is already on the widget). */
  useEffect(() => {
    const phoneE164 = user?.phoneE164?.trim();
    if (!phoneE164 || !convaiMounted) {
      return () => {
        setCirightGate(null);
      };
    }

    let cancelled = false;
    /** Dev-only; fires before Ciright finishes — `source` is always empty here by design. */
    devPostElevenLabsIntent("ciright-on-page-load", {
      agentId,
      userId: phoneE164,
      dynamicVariables: {
        mobile_number: phoneE164.trim(),
        user_id: phoneE164.trim(),
        user_name: user?.displayName?.trim() || "User",
        source: "",
        phone: phoneE164.trim(),
        phone_number: phoneE164.trim(),
      },
    });
    void postCirightAgentSessionInBrowser(phoneE164).then((result) => {
      if (cancelled) return;
      if (result.ok) {
        setCirightGate({ phoneE164, dataStatus: result.dataStatus });
        devPostElevenLabsIntent("ciright-after-response", {
          agentId,
          userId: phoneE164,
          dynamicVariables: {
            mobile_number: phoneE164.trim(),
            user_id: phoneE164.trim(),
            user_name: user?.displayName?.trim() || "User",
            source: result.dataStatus === true ? "react_widget" : "",
            phone: phoneE164.trim(),
            phone_number: phoneE164.trim(),
          },
        });
      } else {
        setCirightGate({ phoneE164, dataStatus: false });
        if (process.env.NODE_ENV === "development") {
          console.warn("[ciright-agent-session]", result.message);
        }
      }
    });
    return () => {
      cancelled = true;
    };
    // Ciright keys only off phoneE164; displayName is for dev echo payloads only.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- omit user.displayName to avoid redundant m3435622 calls
  }, [user?.phoneE164, convaiMounted, agentId]);

  const dynamicVariables = useMemo(() => {
    const phone = user?.phoneE164?.trim() ?? "";
    const userName = user
      ? user.displayName?.trim() || "User"
      : "";
    const source =
      user &&
      cirightGate?.phoneE164 === phone &&
      cirightGate.dataStatus === true
        ? "react_widget"
        : "";
    return {
      mobile_number: phone,
      user_id: phone,
      user_name: userName,
      source,
      phone,
      phone_number: phone,
    };
  }, [user, cirightGate]);

  const dynamicVariablesJson = useMemo(
    () => JSON.stringify(dynamicVariables),
    [dynamicVariables],
  );

  /** Mirror static HTML: setAttribute so the custom element sees latest context. */
  useLayoutEffect(() => {
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
  }, [convaiMounted, dynamicVariablesJson]);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development" || typeof window === "undefined") {
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
  }, [dynamicVariables]);

  if (!convaiMounted) return null;

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
