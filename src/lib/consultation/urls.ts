function trimSlash(s: string): string {
  return s.replace(/\/+$/, "");
}

/** contact.keyra.ie — contact + inquiry records */
export function keyraContactApiBaseUrl(): string {
  return trimSlash(
    process.env.KEYRA_CONTACT_API_BASE_URL?.trim() ||
      process.env.NEXT_PUBLIC_KEYRA_CONTACT_API_BASE_URL?.trim() ||
      "https://contact.keyra.ie",
  );
}

/** mycalendar.ciright.com — availability, booking, invites */
export function keyraCalendarApiBaseUrl(): string {
  return trimSlash(
    process.env.KEYRA_CALENDAR_API_BASE_URL?.trim() ||
      process.env.NEXT_PUBLIC_KEYRA_CALENDAR_API_BASE_URL?.trim() ||
      "https://mycalendar.ciright.com",
  );
}

/** ve.keyra.ie — secure video meeting rooms */
export function keyraVeApiBaseUrl(): string {
  return trimSlash(
    process.env.KEYRA_VE_API_BASE_URL?.trim() ||
      process.env.NEXT_PUBLIC_KEYRA_VE_API_BASE_URL?.trim() ||
      "https://ve.keyra.ie",
  );
}

export function keyraVeMeetingUrl(meetingId: string): string {
  return `${keyraVeApiBaseUrl()}/meeting/${meetingId}`;
}

/** Internal advisory team notification inbox */
export function keyraConsultationNotifyEmail(): string {
  return (
    process.env.KEYRA_CONSULTATION_NOTIFY_EMAIL?.trim() ||
    "advisory@keyra.ie"
  );
}

export function isConsultationDevMock(): boolean {
  return process.env.KEYRA_CONSULTATION_DEV_MOCK === "1";
}
