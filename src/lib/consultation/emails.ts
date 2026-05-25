import {
  isMandrillConfigured,
  sendMandrillTransactional,
} from "@/services/mandrillClient";
import { keyraConsultationNotifyEmail } from "@/lib/consultation/urls";

function formatWhen(iso: string, timezone: string): string {
  try {
    return new Intl.DateTimeFormat("en-IE", {
      dateStyle: "full",
      timeStyle: "short",
      timeZone: timezone,
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export async function sendConsultationEmailConfirmation(params: {
  to: string;
  company: string;
  whenLabel?: string;
  meetingUrl?: string;
  rescheduleUrl?: string;
  isVideo: boolean;
}): Promise<void> {
  if (!isMandrillConfigured()) return;

  const subject = params.isVideo
    ? "Keyra Consultation Confirmed"
    : "Keyra Consultation Request Received";

  const lines = params.isVideo
    ? [
        "Thank you for scheduling a Keyra strategic consultation.",
        "",
        `Meeting: Keyra Strategic Consultation — ${params.company}`,
        params.whenLabel ? `When: ${params.whenLabel}` : "",
        params.meetingUrl ? `Video link: ${params.meetingUrl}` : "",
        "",
        "Your calendar invitation has been sent. Please join from the secure Keyra Video Experience room at the scheduled time.",
        "",
        "Preparation: have your deployment context, identity architecture questions, and stakeholder objectives ready.",
        params.rescheduleUrl
          ? `Reschedule: ${params.rescheduleUrl}`
          : "",
        "",
        "— Keyra Advisory",
      ]
    : [
        "Thank you. Your consultation request has been received.",
        "",
        "A Keyra advisor will review your submission and respond with the appropriate next step.",
        "",
        "— Keyra Advisory",
      ];

  await sendMandrillTransactional({
    to: params.to,
    subject,
    text: lines.filter(Boolean).join("\n"),
  });
}

export async function sendConsultationInternalNotification(params: {
  company: string;
  name: string;
  title: string;
  email: string;
  phone: string;
  country: string;
  organizationType: string;
  consultationType: string;
  meetingObjective: string;
  topics: string[];
  whenLabel?: string;
  meetingUrl?: string;
  crmUrl?: string;
  requestMethod: "email" | "calendar";
}): Promise<void> {
  if (!isMandrillConfigured()) return;

  const subject =
    params.requestMethod === "calendar"
      ? `New Keyra Consultation Scheduled — ${params.company}`
      : `New Keyra Consultation Request — ${params.company}`;

  const text = [
    `Requester: ${params.name}`,
    `Company: ${params.company}`,
    `Title: ${params.title}`,
    `Email: ${params.email}`,
    `Phone: ${params.phone}`,
    `Country: ${params.country}`,
    `Organization type: ${params.organizationType}`,
    `Consultation type: ${params.consultationType}`,
    `Method: ${params.requestMethod === "calendar" ? "Video (Calendar)" : "Email"}`,
    `Topics: ${params.topics.join(", ")}`,
    params.meetingObjective
      ? `Objective: ${params.meetingObjective}`
      : "",
    params.whenLabel ? `When: ${params.whenLabel}` : "",
    params.meetingUrl ? `Video: ${params.meetingUrl}` : "",
    params.crmUrl ? `CRM: ${params.crmUrl}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  await sendMandrillTransactional({
    to: keyraConsultationNotifyEmail(),
    subject,
    text,
  });
}

export { formatWhen };
