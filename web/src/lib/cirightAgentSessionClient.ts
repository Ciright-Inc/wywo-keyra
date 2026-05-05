/**
 * Browser → Ciright commonrestapi m3435622 (XHR).
 * Same URL for local and production; requires Ciright CORS for your origin (e.g. localhost:3000, keyra.ie).
 *
 * Body: `{ agentId: string, phone: string }` — same `agentId` as ElevenLabs (`NEXT_PUBLIC_ELEVENLABS_AGENT_ID`).
 * `phone` must be E.164 as JSON **string**, e.g. `"+919537581424"` (Ciright rejects / mishandles a bare number).
 * Response: { status: boolean, message: string, data: null }
 */

import { resolveElevenLabsAgentId } from "@/lib/elevenLabsAgentConfig";

const DEFAULT_URL =
  "https://www.myciright.com/Ciright/api/commonrestapi/m3435622";

/** POST JSON body for m3435622 (property order matches Ciright examples). */
export type CirightAgentSessionRequestBody = {
  agentId: string;
  /** E.164 including leading `+`, e.g. `"+919537581424"`. */
  phone: string;
};

type CirightAgentSessionResponse = {
  status?: boolean;
  message?: string;
  data?: null | unknown;
};

function cirightAgentSessionUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_CIRIGHT_AGENT_SESSION_URL?.trim();
  return fromEnv || DEFAULT_URL;
}

/** Normalizes session storage to E.164 string for m3435622. */
export function normalizePhoneForCirightAgentApi(phoneE164: string): string | null {
  const digits = phoneE164.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.length < 8 || digits.length > 15) return null;
  return `+${digits}`;
}

export type CirightAgentSessionResult =
  | {
      ok: true;
      /** Ciright JSON `status`. `true` → ElevenLabs `dynamicVariables.source` = `"react_widget"`. */
      dataStatus: boolean;
      message?: string;
    }
  | { ok: false; message: string };

export async function postCirightAgentSessionInBrowser(
  phoneE164: string,
): Promise<CirightAgentSessionResult> {
  const phone = normalizePhoneForCirightAgentApi(phoneE164.trim());
  if (phone === null) {
    return { ok: false, message: "Invalid phone number." };
  }

  const agentId = resolveElevenLabsAgentId();

  const body: CirightAgentSessionRequestBody = {
    agentId,
    phone,
  };

  try {
    const res = await fetch(cirightAgentSessionUrl(), {
      method: "POST",
      mode: "cors",
      credentials: "omit",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    let json: CirightAgentSessionResponse = {};
    try {
      json = (await res.json()) as CirightAgentSessionResponse;
    } catch {
      /* ignore */
    }

    if (!res.ok) {
      return {
        ok: false,
        message:
          (typeof json.message === "string" && json.message) ||
          `Request failed (${res.status}).`,
      };
    }

    const dataStatus = json.status === true;
    return {
      ok: true,
      dataStatus,
      message:
        typeof json.message === "string" && json.message ? json.message : undefined,
    };
  } catch {
    return {
      ok: false,
      message:
        "Could not reach Ciright (network or CORS). Ask ops to allow this site origin on the API.",
    };
  }
}
