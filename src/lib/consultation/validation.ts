import {
  CONSULTATION_ORG_TYPES,
  CONSULTATION_TOPICS,
  consultationTypeById,
} from "@/lib/consultation/constants";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type FieldErrors = Record<string, string>;

function req(value: unknown, label: string): string | null {
  const s = typeof value === "string" ? value.trim() : "";
  if (!s) return `${label} is required.`;
  return null;
}

export function validateEmailConsultation(body: Record<string, unknown>): {
  ok: true;
  data: {
    firstName: string;
    lastName: string;
    company: string;
    title: string;
    email: string;
    phone: string;
    country: string;
    website: string;
    organizationType: string;
    topics: string[];
    message: string;
  };
} | { ok: false; errors: FieldErrors } {
  const errors: FieldErrors = {};
  const firstName = String(body.firstName ?? "");
  const lastName = String(body.lastName ?? "");
  const company = String(body.company ?? "");
  const title = String(body.title ?? "");
  const email = String(body.email ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const country = String(body.country ?? "").trim();
  const website = String(body.website ?? "").trim();
  const organizationType = String(body.organizationType ?? "").trim();
  const message = String(body.message ?? "").trim();
  const topicsRaw = body.topics;

  const checks: [string, string | null][] = [
    ["firstName", req(firstName, "First name")],
    ["lastName", req(lastName, "Last name")],
    ["company", req(company, "Company")],
    ["title", req(title, "Title")],
    ["email", req(email, "Email")],
    ["phone", req(phone, "Mobile phone")],
    ["country", req(country, "Country")],
    ["organizationType", req(organizationType, "Organization type")],
    ["message", req(message, "Message")],
  ];

  for (const [key, err] of checks) {
    if (err) errors[key] = err;
  }

  if (email && !EMAIL_RE.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  if (
    organizationType &&
    !CONSULTATION_ORG_TYPES.includes(
      organizationType as (typeof CONSULTATION_ORG_TYPES)[number],
    )
  ) {
    errors.organizationType = "Select a valid organization type.";
  }

  const topics = Array.isArray(topicsRaw)
    ? topicsRaw.map((t) => String(t).trim()).filter(Boolean)
    : [];

  if (topics.length === 0) {
    errors.topics = "Select at least one consultation topic.";
  } else {
    const invalid = topics.filter(
      (t) =>
        !CONSULTATION_TOPICS.includes(
          t as (typeof CONSULTATION_TOPICS)[number],
        ),
    );
    if (invalid.length) errors.topics = "One or more topics are invalid.";
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    data: {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      company: company.trim(),
      title: title.trim(),
      email,
      phone,
      country,
      website,
      organizationType,
      topics,
      message,
    },
  };
}

export function validateCalendarIntake(body: Record<string, unknown>): {
  ok: true;
  data: {
    consultationTypeId: string;
    name: string;
    company: string;
    title: string;
    email: string;
    phone: string;
    country: string;
    organizationType: string;
    topics: string[];
    meetingObjective: string;
  };
} | { ok: false; errors: FieldErrors } {
  const errors: FieldErrors = {};
  const consultationTypeId = String(body.consultationTypeId ?? "").trim();
  const name = String(body.name ?? "").trim();
  const company = String(body.company ?? "").trim();
  const title = String(body.title ?? "").trim();
  const email = String(body.email ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const country = String(body.country ?? "").trim();
  const organizationType = String(body.organizationType ?? "").trim();
  const meetingObjective = String(body.meetingObjective ?? "").trim();
  const topicsRaw = body.topics;

  if (!consultationTypeById(consultationTypeId)) {
    errors.consultationTypeId = "Select a consultation type.";
  }

  const checks: [string, string | null][] = [
    ["name", req(name, "Name")],
    ["company", req(company, "Company")],
    ["title", req(title, "Title")],
    ["email", req(email, "Email")],
    ["phone", req(phone, "Mobile phone")],
    ["country", req(country, "Country")],
    ["organizationType", req(organizationType, "Organization type")],
    ["meetingObjective", req(meetingObjective, "Meeting objective")],
  ];

  for (const [key, err] of checks) {
    if (err) errors[key] = err;
  }

  if (email && !EMAIL_RE.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  const topics = Array.isArray(topicsRaw)
    ? topicsRaw.map((t) => String(t).trim()).filter(Boolean)
    : [];

  if (topics.length === 0) {
    errors.topics = "Select at least one consultation topic.";
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    data: {
      consultationTypeId,
      name,
      company,
      title,
      email,
      phone,
      country,
      organizationType,
      topics,
      meetingObjective,
    },
  };
}

export function validateCalendarBook(body: Record<string, unknown>): {
  ok: true;
  data: {
    consultationTypeId: string;
    startIso: string;
    timezone: string;
    name: string;
    company: string;
    title: string;
    email: string;
    phone: string;
    country: string;
    organizationType: string;
    topics: string[];
    meetingObjective: string;
  };
} | { ok: false; errors: FieldErrors } {
  const intake = validateCalendarIntake(body);
  if (!intake.ok) return intake;

  const startIso = String(body.startIso ?? "").trim();
  const timezone = String(body.timezone ?? "").trim();
  const errors: FieldErrors = {};

  if (!startIso) errors.startIso = "Select a date and time.";
  if (!timezone) errors.timezone = "Timezone is required.";

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    data: { ...intake.data, startIso, timezone },
  };
}
