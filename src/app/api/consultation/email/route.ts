import { NextResponse } from "next/server";
import {
  honeypotTripped,
  rateLimitResponse,
  readJsonObject,
  verifyCaptcha,
} from "@/app/api/keyra/_routeHelpers";
import { createKeyraContactInquiry } from "@/lib/consultation/contactService";
import {
  sendConsultationEmailConfirmation,
  sendConsultationInternalNotification,
} from "@/lib/consultation/emails";
import { validateEmailConsultation } from "@/lib/consultation/validation";

export async function POST(req: Request) {
  const limited = rateLimitResponse(req, "consultation-email");
  if (limited) return limited;

  const body = await readJsonObject(req);
  if (honeypotTripped(body)) {
    return NextResponse.json({ ok: true });
  }

  const captcha = await verifyCaptcha(body);
  if (captcha) return captcha;

  const validated = validateEmailConsultation(body);
  if (!validated.ok) {
    return NextResponse.json({ errors: validated.errors }, { status: 400 });
  }

  const { data } = validated;
  const contactResult = await createKeyraContactInquiry({
    firstName: data.firstName,
    lastName: data.lastName,
    company: data.company,
    title: data.title,
    email: data.email,
    phone: data.phone,
    country: data.country,
    website: data.website,
    organizationType: data.organizationType,
    topics: data.topics,
    message: data.message,
    requestMethod: "email",
  });

  if (!contactResult.ok) {
    return NextResponse.json(
      { error: contactResult.message },
      { status: 502 },
    );
  }

  await sendConsultationEmailConfirmation({
    to: data.email,
    company: data.company,
    isVideo: false,
  });

  await sendConsultationInternalNotification({
    company: data.company,
    name: `${data.firstName} ${data.lastName}`,
    title: data.title,
    email: data.email,
    phone: data.phone,
    country: data.country,
    organizationType: data.organizationType,
    consultationType: "Email consultation",
    meetingObjective: data.message,
    topics: data.topics,
    crmUrl: contactResult.data.crmUrl,
    requestMethod: "email",
  });

  return NextResponse.json({
    ok: true,
    contactId: contactResult.data.contactId,
    inquiryId: contactResult.data.inquiryId,
  });
}
