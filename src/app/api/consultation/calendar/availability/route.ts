import { NextResponse } from "next/server";
import { rateLimitResponse } from "@/app/api/keyra/_routeHelpers";
import { consultationTypeById } from "@/lib/consultation/constants";
import { fetchCalendarAvailability } from "@/lib/consultation/calendarService";

export async function GET(req: Request) {
  const limited = rateLimitResponse(req, "consultation-availability", 60);
  if (limited) return limited;

  const url = new URL(req.url);
  const consultationTypeId = url.searchParams.get("consultationTypeId")?.trim() ?? "";
  const timezone = url.searchParams.get("timezone")?.trim() || "UTC";

  if (!consultationTypeById(consultationTypeId)) {
    return NextResponse.json(
      { error: "Invalid consultation type." },
      { status: 400 },
    );
  }

  const result = await fetchCalendarAvailability({
    consultationTypeId,
    timezone,
    from: url.searchParams.get("from") ?? undefined,
    to: url.searchParams.get("to") ?? undefined,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.message }, { status: 502 });
  }

  const type = consultationTypeById(consultationTypeId)!;

  return NextResponse.json({
    ok: true,
    days: result.days,
    durationMinutes: type.durationMinutes,
    timezone,
  });
}
