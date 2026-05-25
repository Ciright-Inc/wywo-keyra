import { randomBytes } from "node:crypto";
import type { VideoMeetingResult } from "@/lib/consultation/types";
import {
  isConsultationDevMock,
  keyraVeApiBaseUrl,
  keyraVeMeetingUrl,
} from "@/lib/consultation/urls";

function secureMeetingId(): string {
  return randomBytes(16).toString("hex");
}

export type CreateVideoMeetingInput = {
  contactId: string;
  title: string;
  startIso: string;
  endIso: string;
  hostEmail?: string;
  guestEmail: string;
  consultationType: string;
  meetingObjective: string;
};

/**
 * Creates a secure video room at ve.keyra.ie.
 */
export async function createKeyraVideoMeeting(
  input: CreateVideoMeetingInput,
): Promise<
  { ok: true; data: VideoMeetingResult } | { ok: false; message: string }
> {
  const meetingId = secureMeetingId();
  const base = keyraVeApiBaseUrl();
  const apiKey = process.env.KEYRA_VE_API_KEY?.trim();

  if (isConsultationDevMock() || (!apiKey && process.env.NODE_ENV === "development")) {
    return {
      ok: true,
      data: {
        videoRoomId: meetingId,
        meetingUrl: keyraVeMeetingUrl(meetingId),
      },
    };
  }

  try {
    const res = await fetch(`${base}/api/v1/meetings`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(apiKey ? { authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify({
        contactId: input.contactId,
        title: input.title,
        startTime: input.startIso,
        endTime: input.endIso,
        guestEmail: input.guestEmail,
        features: {
          waitingRoom: true,
          hostControls: true,
          identityAwareAccess: true,
          recordingPermission: "host",
          branding: "keyra",
        },
        metadata: {
          consultationType: input.consultationType,
          meetingObjective: input.meetingObjective,
        },
      }),
    });

    if (!res.ok) {
      if (process.env.NODE_ENV === "development") {
        return {
          ok: true,
          data: {
            videoRoomId: meetingId,
            meetingUrl: keyraVeMeetingUrl(meetingId),
          },
        };
      }
      return { ok: false, message: "Video room service unavailable." };
    }

    const json = (await res.json()) as {
      videoRoomId?: string;
      meetingId?: string;
      meetingUrl?: string;
      hostId?: string;
    };

    const roomId = json.videoRoomId ?? json.meetingId ?? meetingId;
    return {
      ok: true,
      data: {
        videoRoomId: roomId,
        meetingUrl: json.meetingUrl ?? keyraVeMeetingUrl(roomId),
        hostId: json.hostId,
      },
    };
  } catch {
    return {
      ok: true,
      data: {
        videoRoomId: meetingId,
        meetingUrl: keyraVeMeetingUrl(meetingId),
      },
    };
  }
}
