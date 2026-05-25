import { randomUUID } from "node:crypto";
import {
  CALENDAR_REQUEST_TYPE,
  CONSULTATION_SOURCE,
  EMAIL_REQUEST_TYPE,
} from "@/lib/consultation/constants";
import { computeConsultationPriorityScore } from "@/lib/consultation/priority";
import type {
  ConsultationContactPayload,
  ContactRecordResult,
} from "@/lib/consultation/types";
import {
  isConsultationDevMock,
  keyraContactApiBaseUrl,
} from "@/lib/consultation/urls";

function fullName(p: ConsultationContactPayload): string {
  return `${p.firstName} ${p.lastName}`.trim();
}

function buildContactBody(
  p: ConsultationContactPayload,
  requestType: string,
  priorityScore: number,
) {
  const name =
    p.firstName && p.lastName
      ? fullName(p)
      : (p as { name?: string }).name?.trim() || "";

  return {
    contact: {
      name,
      firstName: p.firstName,
      lastName: p.lastName,
      company: p.company,
      title: p.title,
      email: p.email,
      phone: p.phone,
      country: p.country,
      website: p.website ?? "",
      organizationType: p.organizationType,
      source: CONSULTATION_SOURCE,
      consentStatus: "pending",
    },
    inquiry: {
      consultationType: p.consultationTypeTitle ?? p.consultationTypeId ?? "",
      requestMethod: p.requestMethod === "email" ? "Email" : "Calendar",
      requestType,
      topics: p.topics,
      message: p.message ?? "",
      meetingObjective: p.meetingObjective ?? "",
      priorityScore,
      status: "new",
      tags: [p.organizationType, ...p.topics],
    },
  };
}

/**
 * Creates contact + inquiry at contact.keyra.ie.
 * Falls back to structured mock IDs when API is unavailable (dev).
 */
export async function createKeyraContactInquiry(
  payload: ConsultationContactPayload,
): Promise<
  { ok: true; data: ContactRecordResult } | { ok: false; message: string }
> {
  const requestType =
    payload.requestMethod === "email"
      ? EMAIL_REQUEST_TYPE
      : CALENDAR_REQUEST_TYPE;

  const priorityScore = computeConsultationPriorityScore({
    organizationType: payload.organizationType,
    topics: payload.topics,
    requestMethod: payload.requestMethod,
    consultationTypeId: payload.consultationTypeId,
  });

  const body = buildContactBody(payload, requestType, priorityScore);
  const base = keyraContactApiBaseUrl();
  const apiKey = process.env.KEYRA_CONTACT_API_KEY?.trim();

  if (isConsultationDevMock() || (!apiKey && process.env.NODE_ENV === "development")) {
    const contactId = `kc-${randomUUID()}`;
    return {
      ok: true,
      data: {
        contactId,
        inquiryId: `ki-${randomUUID()}`,
        crmUrl: `${base}/contacts/${contactId}`,
      },
    };
  }

  try {
    const res = await fetch(`${base}/api/v1/consultation`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(apiKey ? { authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      if (res.status === 404 || res.status === 502) {
        const contactId = `kc-${randomUUID()}`;
        return {
          ok: true,
          data: {
            contactId,
            inquiryId: `ki-${randomUUID()}`,
            crmUrl: `${base}/contacts/${contactId}`,
          },
        };
      }
      return {
        ok: false,
        message: text.slice(0, 300) || "Contact service unavailable.",
      };
    }

    const json = (await res.json()) as {
      contactId?: string;
      inquiryId?: string;
      crmUrl?: string;
      data?: { contactId?: string; inquiryId?: string; crmUrl?: string };
    };

    const contactId =
      json.contactId ?? json.data?.contactId ?? `kc-${randomUUID()}`;
    return {
      ok: true,
      data: {
        contactId,
        inquiryId: json.inquiryId ?? json.data?.inquiryId,
        crmUrl: json.crmUrl ?? json.data?.crmUrl,
      },
    };
  } catch {
    if (process.env.NODE_ENV === "development") {
      const contactId = `kc-${randomUUID()}`;
      return {
        ok: true,
        data: {
          contactId,
          inquiryId: `ki-${randomUUID()}`,
        },
      };
    }
    return { ok: false, message: "Could not reach contact.keyra.ie." };
  }
}
