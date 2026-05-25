import { NextResponse } from "next/server";
import {
  honeypotTripped,
  rateLimitResponse,
  readJsonObject,
  verifyCaptcha,
} from "@/app/api/keyra/_routeHelpers";
import { consultationTypeById } from "@/lib/consultation/constants";
import { bookCalendarConsultation } from "@/lib/consultation/calendarService";
import { createKeyraContactInquiry } from "@/lib/consultation/contactService";
import {
  formatWhen,
  sendConsultationEmailConfirmation,
  sendConsultationInternalNotification,
} from "@/lib/consultation/emails";
import { createKeyraVideoMeeting } from "@/lib/consultation/videoService";
import { validateCalendarBook } from "@/lib/consultation/validation";

function splitName(full: string): { firstName: string; lastName: string } {
  const parts = full.trim().split(/\s+/);
  if (parts.length <= 1) return { firstName: full.trim(), lastName: "" };
  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
  };
}

export async function POST(req: Request) {
  const limited = rateLimitResponse(req, "consultation-book");
  if (limited) return limited;

  const body = await readJsonObject(req);
  if (honeypotTripped(body)) {
    return NextResponse.json({ ok: true });
  }

  const captcha = await verifyCaptcha(body);
  if (captcha) return captcha;

  const validated = validateCalendarBook(body);
  if (!validated.ok) {
    return NextResponse.json({ errors: validated.errors }, { status: 400 });
  }

  const { data } = validated;
  const type = consultationTypeById(data.consultationTypeId)!;
  const { firstName, lastName } = splitName(data.name);
  const meetingTitle = `Keyra Strategic Consultation - ${data.company}`;

  const contactResult = await createKeyraContactInquiry({
    firstName,
    lastName,
    company: data.company,
    title: data.title,
    email: data.email,
    phone: data.phone,
    country: data.country,
    organizationType: data.organizationType,
    topics: data.topics,
    meetingObjective: data.meetingObjective,
    requestMethod: "calendar",
    consultationTypeId: data.consultationTypeId,
    consultationTypeTitle: type.title,
  });

  if (!contactResult.ok) {
    return NextResponse.json(
      { error: contactResult.message },
      { status: 502 },
    );
  }

  const endEstimate = new Date(data.startIso);
  endEstimate.setMinutes(endEstimate.getMinutes() + type.durationMinutes);

  const videoResult = await createKeyraVideoMeeting({
    contactId: contactResult.data.contactId,
    title: meetingTitle,
    startIso: data.startIso,
    endIso: endEstimate.toISOString(),
    guestEmail: data.email,
    consultationType: type.title,
    meetingObjective: data.meetingObjective,
  });

  if (!videoResult.ok) {
    return NextResponse.json({ error: videoResult.message }, { status: 502 });
  }

  const bookResult = await bookCalendarConsultation({
    contactId: contactResult.data.contactId,
    consultationTypeId: data.consultationTypeId,
    startIso: data.startIso,
    timezone: data.timezone,
    name: data.name,
    company: data.company,
    title: data.title,
    email: data.email,
    phone: data.phone,
    country: data.country,
    organizationType: data.organizationType,
    topics: data.topics,
    meetingObjective: data.meetingObjective,
    videoMeetingUrl: videoResult.data.meetingUrl,
    videoRoomId: videoResult.data.videoRoomId,
    meetingTitle,
  });

  if (!bookResult.ok) {
    return NextResponse.json({ error: bookResult.message }, { status: 502 });
  }

  const whenLabel = formatWhen(data.startIso, data.timezone);

  await sendConsultationEmailConfirmation({
    to: data.email,
    company: data.company,
    whenLabel,
    meetingUrl: videoResult.data.meetingUrl,
    rescheduleUrl: bookResult.data.rescheduleUrl,
    isVideo: true,
  });

  await sendConsultationInternalNotification({
    company: data.company,
    name: data.name,
    title: data.title,
    email: data.email,
    phone: data.phone,
    country: data.country,
    organizationType: data.organizationType,
    consultationType: type.title,
    meetingObjective: data.meetingObjective,
    topics: data.topics,
    whenLabel,
    meetingUrl: videoResult.data.meetingUrl,
    crmUrl: contactResult.data.crmUrl,
    requestMethod: "calendar",
  });

  return NextResponse.json({
    ok: true,
    contactId: contactResult.data.contactId,
    calendarEventId: bookResult.data.calendarEventId,
    videoRoomId: videoResult.data.videoRoomId,
    meetingUrl: videoResult.data.meetingUrl,
    meetingTitle,
    startIso: bookResult.data.startIso,
    endIso: bookResult.data.endIso,
    timezone: data.timezone,
    rescheduleUrl: bookResult.data.rescheduleUrl,
    cancellationUrl: bookResult.data.cancellationUrl,
  });
}
