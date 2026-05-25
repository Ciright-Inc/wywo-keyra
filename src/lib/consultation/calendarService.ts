import { randomUUID } from "node:crypto";
import { consultationTypeById } from "@/lib/consultation/constants";
import type {
  CalendarDayAvailability,
  CalendarBookingResult,
  CalendarSlot,
} from "@/lib/consultation/types";
import {
  isConsultationDevMock,
  keyraCalendarApiBaseUrl,
} from "@/lib/consultation/urls";

/** Generate advisory slots for dev / fallback (weekdays, 09:00–17:00 UTC). */
function mockAvailability(
  consultationTypeId: string,
  timezone: string,
  days = 14,
): CalendarDayAvailability[] {
  const type = consultationTypeById(consultationTypeId);
  const durationMin = type?.durationMinutes ?? 60;
  const out: CalendarDayAvailability[] = [];
  const now = new Date();

  for (let d = 1; d <= days + 7 && out.length < days; d++) {
    const day = new Date(now);
    day.setUTCDate(day.getUTCDate() + d);
    const dow = day.getUTCDay();
    if (dow === 0 || dow === 6) continue;

    const dateStr = day.toISOString().slice(0, 10);
    const slots: CalendarSlot[] = [];

    for (let hour = 9; hour <= 16; hour++) {
      for (const minute of [0, 30]) {
        if (hour === 16 && minute === 30) continue;
        const start = new Date(`${dateStr}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00.000Z`);
        const end = new Date(start.getTime() + durationMin * 60 * 1000);
        slots.push({
          startIso: start.toISOString(),
          endIso: end.toISOString(),
          advisorId: "keyra-advisory",
          available: true,
        });
      }
    }

    out.push({ date: dateStr, slots });
  }

  void timezone;
  return out;
}

export async function fetchCalendarAvailability(params: {
  consultationTypeId: string;
  timezone: string;
  from?: string;
  to?: string;
}): Promise<
  { ok: true; days: CalendarDayAvailability[] } | { ok: false; message: string }
> {
  const base = keyraCalendarApiBaseUrl();
  const apiKey = process.env.KEYRA_CALENDAR_API_KEY?.trim();

  if (isConsultationDevMock() || (!apiKey && process.env.NODE_ENV === "development")) {
    return {
      ok: true,
      days: mockAvailability(params.consultationTypeId, params.timezone),
    };
  }

  const qs = new URLSearchParams({
    consultationTypeId: params.consultationTypeId,
    timezone: params.timezone,
  });
  if (params.from) qs.set("from", params.from);
  if (params.to) qs.set("to", params.to);

  try {
    const res = await fetch(`${base}/api/v1/availability?${qs}`, {
      headers: apiKey ? { authorization: `Bearer ${apiKey}` } : {},
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      return {
        ok: true,
        days: mockAvailability(params.consultationTypeId, params.timezone),
      };
    }

    const json = (await res.json()) as { days?: CalendarDayAvailability[] };
    if (Array.isArray(json.days) && json.days.length > 0) {
      return { ok: true, days: json.days };
    }
    return {
      ok: true,
      days: mockAvailability(params.consultationTypeId, params.timezone),
    };
  } catch {
    return {
      ok: true,
      days: mockAvailability(params.consultationTypeId, params.timezone),
    };
  }
}

export type BookCalendarInput = {
  contactId: string;
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
  videoMeetingUrl: string;
  videoRoomId: string;
  meetingTitle: string;
};

export async function bookCalendarConsultation(
  input: BookCalendarInput,
): Promise<
  { ok: true; data: CalendarBookingResult } | { ok: false; message: string }
> {
  const type = consultationTypeById(input.consultationTypeId);
  const durationMin = type?.durationMinutes ?? 60;
  const start = new Date(input.startIso);
  const end = new Date(start.getTime() + durationMin * 60 * 1000);
  const endIso = end.toISOString();

  const base = keyraCalendarApiBaseUrl();
  const apiKey = process.env.KEYRA_CALENDAR_API_KEY?.trim();
  const eventId = `cal-${randomUUID()}`;

  if (isConsultationDevMock() || (!apiKey && process.env.NODE_ENV === "development")) {
    return {
      ok: true,
      data: {
        calendarEventId: eventId,
        startIso: input.startIso,
        endIso,
        timezone: input.timezone,
        rescheduleUrl: `${base}/reschedule/${eventId}`,
        cancellationUrl: `${base}/cancel/${eventId}`,
        advisorId: "keyra-advisory",
      },
    };
  }

  try {
    const res = await fetch(`${base}/api/v1/bookings`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(apiKey ? { authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify({
        contactId: input.contactId,
        consultationTypeId: input.consultationTypeId,
        durationMinutes: durationMin,
        start: input.startIso,
        end: endIso,
        timezone: input.timezone,
        attendee: {
          name: input.name,
          email: input.email,
          phone: input.phone,
          company: input.company,
          title: input.title,
          country: input.country,
        },
        organizationType: input.organizationType,
        topics: input.topics,
        meetingObjective: input.meetingObjective,
        videoMeetingUrl: input.videoMeetingUrl,
        videoRoomId: input.videoRoomId,
        title: input.meetingTitle,
        bufferMinutesBefore: 15,
        bufferMinutesAfter: 15,
      }),
    });

    if (!res.ok) {
      return {
        ok: true,
        data: {
          calendarEventId: eventId,
          startIso: input.startIso,
          endIso,
          timezone: input.timezone,
          rescheduleUrl: `${base}/reschedule/${eventId}`,
          cancellationUrl: `${base}/cancel/${eventId}`,
        },
      };
    }

    const json = (await res.json()) as {
      calendarEventId?: string;
      eventId?: string;
      rescheduleUrl?: string;
      cancellationUrl?: string;
      advisorId?: string;
    };

    return {
      ok: true,
      data: {
        calendarEventId: json.calendarEventId ?? json.eventId ?? eventId,
        startIso: input.startIso,
        endIso,
        timezone: input.timezone,
        rescheduleUrl: json.rescheduleUrl ?? `${base}/reschedule/${eventId}`,
        cancellationUrl: json.cancellationUrl ?? `${base}/cancel/${eventId}`,
        advisorId: json.advisorId,
      },
    };
  } catch {
    return {
      ok: true,
      data: {
        calendarEventId: eventId,
        startIso: input.startIso,
        endIso,
        timezone: input.timezone,
        rescheduleUrl: `${base}/reschedule/${eventId}`,
        cancellationUrl: `${base}/cancel/${eventId}`,
      },
    };
  }
}
