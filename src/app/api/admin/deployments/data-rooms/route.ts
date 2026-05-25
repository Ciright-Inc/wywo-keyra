import { NextResponse } from "next/server";
import type { DataRoomDocumentKind } from "@prisma/client";
import prisma from "@/lib/prisma";
import { readJsonObject } from "@/app/api/keyra/_routeHelpers";
import { writeAudit } from "@/app/api/admin/deployments/_audit";
import { requireDeploymentAuth } from "@/lib/deployments/adminContext";
import { denyIfComplianceOnlyWriter, denyIfReadOnly } from "@/lib/deployments/adminAuthz";
import {
  ensureDataRoomSortOrderUnique,
  listAdminDataRooms,
  toAdminDataRoomView,
  validateDataRoomInput,
} from "@/lib/dataRooms/adminDataRooms";
import { enrichAdminDataRoomView } from "@/lib/dataRooms/dataRoomDocumentUrls";

const KINDS = new Set(["PDF", "TEXT", "WORD", "SPREADSHEET", "PRESENTATION", "OTHER"]);

export async function GET(req: Request) {
  const auth = await requireDeploymentAuth(req);
  if (auth instanceof Response) return auth;

  const url = new URL(req.url);
  const kindParam = url.searchParams.get("documentKind")?.trim().toUpperCase();
  const documentKind =
    kindParam && KINDS.has(kindParam) ? (kindParam as DataRoomDocumentKind) : undefined;

  const rows = await listAdminDataRooms({ documentKind, newestFirst: true });
  return NextResponse.json({ dataRooms: rows.map(toAdminDataRoomView) });
}

export async function POST(req: Request) {
  const auth = await requireDeploymentAuth(req);
  if (auth instanceof Response) return auth;
  const readOnly = denyIfReadOnly(auth);
  if (readOnly) return readOnly;
  const complianceOnly = denyIfComplianceOnlyWriter(auth);
  if (complianceOnly) return complianceOnly;

  const body = await readJsonObject(req);
  const parsed = validateDataRoomInput(
    {
      title: typeof body.title === "string" ? body.title : "",
      description: typeof body.description === "string" ? body.description : null,
      url: typeof body.url === "string" ? body.url : "",
      s3Key: typeof body.s3Key === "string" ? body.s3Key : "",
      mimeType: typeof body.mimeType === "string" ? body.mimeType : "",
      documentKind:
        typeof body.documentKind === "string" && KINDS.has(body.documentKind)
          ? (body.documentKind as DataRoomDocumentKind)
          : undefined,
      fileName: typeof body.fileName === "string" ? body.fileName : "",
      fileSizeBytes: typeof body.fileSizeBytes === "number" ? body.fileSizeBytes : 0,
      sortOrder: body.sortOrder,
    },
    { requireFile: true },
  );
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const unique = await ensureDataRoomSortOrderUnique(parsed.data.sortOrder);
  if ("error" in unique) {
    return NextResponse.json({ error: unique.error }, { status: 409 });
  }

  try {
    const row = await prisma.adminDataRoom.create({
      data: { ...parsed.data, isActive: true },
    });

    await writeAudit({
      entityType: "AdminDataRoom",
      entityId: row.id,
      action: "CREATE",
      payload: { title: row.title, documentKind: row.documentKind },
    });

    return NextResponse.json(
      { dataRoom: enrichAdminDataRoomView(toAdminDataRoomView(row)) },
      { status: 201 },
    );
  } catch (err) {
    console.error("[AdminDataRoom POST]", err);
    if (typeof err === "object" && err !== null && "code" in err && err.code === "P2002") {
      return NextResponse.json(
        { error: "This sort order is already in use. Choose a different number." },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: "Failed to save document." }, { status: 500 });
  }
}
