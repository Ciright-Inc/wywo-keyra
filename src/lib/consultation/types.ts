export type ConsultationContactPayload = {
  firstName: string;
  lastName: string;
  company: string;
  title: string;
  email: string;
  phone: string;
  country: string;
  website?: string;
  organizationType: string;
  topics: string[];
  message?: string;
  meetingObjective?: string;
  requestMethod: "email" | "calendar";
  consultationTypeId?: string;
  consultationTypeTitle?: string;
};

export type ContactRecordResult = {
  contactId: string;
  inquiryId?: string;
  crmUrl?: string;
};

export type VideoMeetingResult = {
  videoRoomId: string;
  meetingUrl: string;
  hostId?: string;
};

export type CalendarBookingResult = {
  calendarEventId: string;
  startIso: string;
  endIso: string;
  timezone: string;
  rescheduleUrl?: string;
  cancellationUrl?: string;
  advisorId?: string;
};

export type ConsultationEmailSubmitResponse = {
  ok: true;
  contactId: string;
  inquiryId?: string;
};

export type ConsultationBookResponse = {
  ok: true;
  contactId: string;
  calendarEventId: string;
  videoRoomId: string;
  meetingUrl: string;
  meetingTitle: string;
  startIso: string;
  endIso: string;
  timezone: string;
  rescheduleUrl?: string;
  cancellationUrl?: string;
};

export type CalendarSlot = {
  startIso: string;
  endIso: string;
  advisorId?: string;
  available: boolean;
};

export type CalendarDayAvailability = {
  date: string;
  slots: CalendarSlot[];
};
