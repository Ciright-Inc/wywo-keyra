/**
 * Browser → Ciright commonrestapi (XHR). Appears in DevTools Network as m1391103 / m1357069.
 * Requires Ciright to send CORS headers for your origin (e.g. localhost:3000, keyra.ie), same as app.keyra.ie.
 */
export type CirightContactSubject = {
  key: number;
  value: string;
  url: string;
};

type CirightSubjectsResponse = {
  status?: boolean;
  message?: string;
  data?: CirightContactSubject[];
};

type CirightLeadResponse = {
  status?: boolean;
  message?: string;
  error?: string;
  Message?: string;
  errors?: unknown;
  data?: unknown;
};

/** Fields we can map from API validation payloads to the contact form. */
export type CirightContactFieldHint =
  | "name"
  | "email"
  | "phone"
  | "subject"
  | "message";

export type CirightSubmitFailure = {
  ok: false;
  /** Banner / primary message from the API (or a sensible default). */
  message: string;
  /** Optional per-field messages when the API returns structured errors. */
  fieldHints?: Partial<Record<CirightContactFieldHint, string>>;
};

function pickString(v: unknown): string | undefined {
  if (typeof v === "string" && v.trim()) return v.trim();
  return undefined;
}

function mapApiFieldKey(apiKey: string): CirightContactFieldHint | null {
  const k = apiKey.toLowerCase();
  if (k.includes("email")) return "email";
  if (k.includes("phone") || k.includes("mobile") || k.includes("tel"))
    return "phone";
  if (k.includes("subject")) return "subject";
  if (k.includes("description") || k.includes("message") || k.includes("body"))
    return "message";
  if (k.includes("name") || k.includes("fullname")) return "name";
  return null;
}

/** Normalizes Ciright / ASP-style error JSON into a message and optional field hints. */
export function parseCirightLeadErrorBody(
  raw: unknown,
  httpStatus?: number,
): Omit<CirightSubmitFailure, "ok"> {
  const fieldHints: Partial<Record<CirightContactFieldHint, string>> = {};
  let message = "";

  if (raw && typeof raw === "object") {
    const o = raw as Record<string, unknown>;
    message =
      pickString(o.message) ??
      pickString(o.error) ??
      pickString(o.Message) ??
      "";

    const errRaw = o.errors;
    if (Array.isArray(errRaw)) {
      const parts = errRaw.filter((x) => typeof x === "string") as string[];
      if (parts.length && !message) message = parts.join(" ");
    } else if (errRaw && typeof errRaw === "object") {
      for (const [key, val] of Object.entries(errRaw as Record<string, unknown>)) {
        const text = Array.isArray(val)
          ? val.map((x) => String(x)).join(" ")
          : String(val ?? "");
        const trimmed = text.trim();
        if (!trimmed) continue;
        const mapped = mapApiFieldKey(key);
        if (mapped) fieldHints[mapped] = trimmed;
        else if (!message) message = trimmed;
      }
    }
  }

  if (!message) {
    message =
      typeof httpStatus === "number"
        ? `Request failed (${httpStatus}).`
        : "The server could not process your request. Please try again.";
  }

  return {
    message,
    fieldHints:
      Object.keys(fieldHints).length > 0 ? fieldHints : undefined,
  };
}

const DEFAULT_SUBJECTS_URL =
  "https://www.myciright.com/Ciright/api/commonrestapi/m1391103";
const DEFAULT_LEAD_URL =
  "https://www.myciright.com/Ciright/api/commonrestapi/m1357069";

export const SUBJECT_FALLBACK: CirightContactSubject[] = [
  { key: -1, value: "General question", url: "" },
  { key: -2, value: "Getting started", url: "" },
  { key: -3, value: "Join waitlist", url: "" },
  { key: -4, value: "Partnership or integration", url: "" },
  { key: -5, value: "Support", url: "" },
];

function envStr(key: string, fallback: string): string {
  if (typeof process === "undefined") return fallback;
  const v = process.env[key];
  return typeof v === "string" && v.trim() ? v.trim() : fallback;
}

function envNum(key: string, fallback: string): number {
  return Number(envStr(key, fallback));
}

export function cirightSubjectsUrl(): string {
  return envStr("NEXT_PUBLIC_CIRIGHT_API_SUBJECTS_URL", DEFAULT_SUBJECTS_URL);
}

export function cirightLeadUrl(): string {
  return envStr("NEXT_PUBLIC_CIRIGHT_API_LEAD_URL", DEFAULT_LEAD_URL);
}

/** POST body for m1391103 (subject list). */
export function cirightSubjectListBody() {
  return {
    subscriptionId: envNum("NEXT_PUBLIC_CIRIGHT_CONTACT_SUBSCRIPTION_ID", "9049255"),
    verticalId: envNum("NEXT_PUBLIC_CIRIGHT_CONTACT_VERTICAL_ID", "2948"),
    appId: envNum("NEXT_PUBLIC_CIRIGHT_CONTACT_APP_ID", "2953"),
    sphereUrl: envStr(
      "NEXT_PUBLIC_CIRIGHT_CONTACT_SUBJECTS_SPHERE_URL",
      "sim-secure-admin.htm",
    ),
  };
}

function cirightSharedIds() {
  return {
    subscriptionId: envNum("NEXT_PUBLIC_CIRIGHT_CONTACT_SUBSCRIPTION_ID", "9049255"),
    verticalId: envNum("NEXT_PUBLIC_CIRIGHT_CONTACT_VERTICAL_ID", "2948"),
    appId: envNum("NEXT_PUBLIC_CIRIGHT_CONTACT_APP_ID", "2953"),
  };
}

/** POST body for m1357069 (lead). */
export function buildCirightLeadBody(input: {
  subjectId: number;
  title: string;
  name: string;
  email: string;
  phone: string;
  description: string;
}) {
  const ids = cirightSharedIds();
  return {
    subscriptionId: ids.subscriptionId,
    verticalId: ids.verticalId,
    subjectId: input.subjectId,
    name: input.name.trim(),
    email: input.email.trim(),
    description: input.description.trim(),
    title: input.title.trim(),
    phone: input.phone.trim(),
    appId: ids.appId,
    leadSourceId: envNum("NEXT_PUBLIC_CIRIGHT_CONTACT_LEAD_SOURCE_ID", "1"),
    fromMail: envStr(
      "NEXT_PUBLIC_CIRIGHT_CONTACT_FROM_MAIL",
      "no-reply@ciright.com",
    ),
    sphereUrl: envStr(
      "NEXT_PUBLIC_CIRIGHT_CONTACT_SUBMIT_SPHERE_URL",
      "sim-secure-registration.htm",
    ),
  };
}

export async function fetchCirightSubjectsInBrowser(): Promise<
  CirightContactSubject[]
> {
  try {
    const res = await fetch(cirightSubjectsUrl(), {
      method: "POST",
      mode: "cors",
      credentials: "omit",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(cirightSubjectListBody()),
    });
    const json = (await res.json()) as CirightSubjectsResponse;
    if (!json.status || !Array.isArray(json.data)) return [];
    return json.data.filter(
      (row) =>
        typeof row.key === "number" &&
        typeof row.value === "string" &&
        row.value.trim().length > 0,
    );
  } catch {
    return [];
  }
}

export async function submitCirightLeadInBrowser(
  input: Parameters<typeof buildCirightLeadBody>[0],
): Promise<{ ok: true } | CirightSubmitFailure> {
  const body = buildCirightLeadBody(input);
  try {
    const res = await fetch(cirightLeadUrl(), {
      method: "POST",
      mode: "cors",
      credentials: "omit",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    let json: CirightLeadResponse = {};
    try {
      json = (await res.json()) as CirightLeadResponse;
    } catch {
      /* ignore */
    }

    if (!res.ok) {
      const parsed = parseCirightLeadErrorBody(json, res.status);
      return { ok: false, ...parsed };
    }
    if (json.status !== true) {
      const parsed = parseCirightLeadErrorBody(json);
      return { ok: false, ...parsed };
    }
    return { ok: true };
  } catch {
    return {
      ok: false,
      message:
        "Could not reach Ciright (network or CORS). Ask ops to allow this site origin on the API.",
    };
  }
}
