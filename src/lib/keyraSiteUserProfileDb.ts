import type { KeyraSessionUser } from "@/lib/keyraSessionTypes";
import prisma from "@/lib/prisma";

export type SavedProfileFields = Pick<KeyraSessionUser, "displayName" | "email" | "country">;

export async function loadSavedProfileFields(phoneE164: string): Promise<SavedProfileFields> {
  try {
    const row = await prisma.keyraSiteUserProfile.findUnique({
      where: { phoneE164 },
      select: { displayName: true, email: true, country: true },
    });
    if (!row) return {};
    return {
      displayName: row.displayName ?? undefined,
      email: row.email ?? undefined,
      country: row.country ?? undefined,
    };
  } catch (err) {
    console.error("[keyraSiteUserProfile] load", err);
    return {};
  }
}

export async function persistProfileFields(
  phoneE164: string,
  fields: SavedProfileFields,
): Promise<void> {
  await prisma.keyraSiteUserProfile.upsert({
    where: { phoneE164 },
    create: {
      phoneE164,
      displayName: fields.displayName ?? null,
      email: fields.email ?? null,
      country: fields.country ?? null,
    },
    update: {
      displayName: fields.displayName ?? null,
      email: fields.email ?? null,
      country: fields.country ?? null,
    },
  });
}
