import { NextResponse } from "next/server";
import type { DataRoomDocumentKind } from "@prisma/client";
import prisma from "@/lib/prisma";
import { readJsonObject } from "@/app/api/keyra/_routeHelpers";
import { writeAudit } from "@/app/api/admin/deployments/_audit";
import { requireDeploymentAuth } from "@/lib/deployments/adminContext";
import { denyIfComplianceOnlyWriter, denyIfReadOnly } from "@/lib/deployments/adminAuthz";
import {
  ensureDataRoomSortOrderUnique,
  toAdminDataRoomView,
  validateDataRoomInput,
} from "@/lib/dataRooms/adminDataRooms";
import { enrichAdminDataRoomView } from "@/lib/dataRooms/dataRoomDocumentUrls";
import { deleteDataRoomFromS3 } from "@/lib/dataRooms/s3DataRooms";

type Params = { id: string };

const KINDS = new Set(["PDF", "TEXT", "WORD", "SPREADSHEET", "PRESENTATION", "OTHER"]);

export async function GET(req: Request, { params }: { params: Promise<Params> }) {
  const auth = await requireDeploymentAuth(req);
  if (auth instanceof Response) return auth;

  const { id } = await params;
  const row = await prisma.adminDataRoom.findFirst({ where: { id, isActive: true } });
  if (!row) return NextResponse.json({ error: "Document not found." }, { status: 404 });
  return NextResponse.json({ dataRoom: enrichAdminDataRoomView(toAdminDataRoomView(row)) });
}

export async function PUT(req: Request, { params }: { params: Promise<Params> }) {
  const auth = await requireDeploymentAuth(req);
  if (auth instanceof Response) return auth;
  const readOnly = denyIfReadOnly(auth);
  if (readOnly) return readOnly;
  const complianceOnly = denyIfComplianceOnlyWriter(auth);
  if (complianceOnly) return complianceOnly;

  const { id } = await params;
  const existing = await prisma.adminDataRoom.findFirst({ where: { id, isActive: true } });
  if (!existing) return NextResponse.json({ error: "Document not found." }, { status: 404 });

  const body = await readJsonObject(req);
  const replaceFile = body.replaceFile === true;

  const parsed = validateDataRoomInput(
    {
      title: typeof body.title === "string" ? body.title : existing.title,
      description:
        typeof body.description === "string"
          ? body.description
          : body.description === null
            ? null
            : existing.description,
      url: replaceFile && typeof body.url === "string" ? body.url : existing.url,
      s3Key: replaceFile && typeof body.s3Key === "string" ? body.s3Key : existing.s3Key,
      mimeType:
        replaceFile && typeof body.mimeType === "string" ? body.mimeType : existing.mimeType,
      documentKind:
        replaceFile &&
        typeof body.documentKind === "string" &&
        KINDS.has(body.documentKind)
          ? (body.documentKind as DataRoomDocumentKind)
          : existing.documentKind,
      fileName:
        replaceFile && typeof body.fileName === "string" ? body.fileName : existing.fileName,
      fileSizeBytes:
        replaceFile && typeof body.fileSizeBytes === "number"
          ? body.fileSizeBytes
          : existing.fileSizeBytes,
      sortOrder:
        body.sortOrder !== undefined ? body.sortOrder : existing.sortOrder,
    },
    { requireFile: false },
  );
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const unique = await ensureDataRoomSortOrderUnique(parsed.data.sortOrder, id);
  if ("error" in unique) {
    return NextResponse.json({ error: unique.error }, { status: 409 });
  }

  const previousS3Key =
    replaceFile && parsed.data.s3Key !== existing.s3Key ? existing.s3Key : null;

  try {
    const row = await prisma.adminDataRoom.update({
      where: { id },
      data: parsed.data,
    });

    if (previousS3Key) {
      await deleteDataRoomFromS3(previousS3Key);
    }

    await writeAudit({
      entityType: "AdminDataRoom",
      entityId: row.id,
      action: "UPDATE",
      payload: { title: row.title, documentKind: row.documentKind },
    });

    return NextResponse.json({ dataRoom: enrichAdminDataRoomView(toAdminDataRoomView(row)) });
  } catch (err) {
    console.error("[AdminDataRoom PUT]", err);
    if (typeof err === "object" && err !== null && "code" in err && err.code === "P2002") {
      return NextResponse.json(
        { error: "This sort order is already in use. Choose a different number." },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: "Failed to save document." }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<Params> }) {
  const auth = await requireDeploymentAuth(req);
  if (auth instanceof Response) return auth;
  const readOnly = denyIfReadOnly(auth);
  if (readOnly) return readOnly;
  const complianceOnly = denyIfComplianceOnlyWriter(auth);
  if (complianceOnly) return complianceOnly;

  const { id } = await params;
  const existing = await prisma.adminDataRoom.findFirst({
    where: { id, isActive: true },
    select: { id: true, title: true, s3Key: true },
  });
  if (!existing) return NextResponse.json({ error: "Document not found." }, { status: 404 });

  await prisma.adminDataRoom.update({
    where: { id },
    data: { isActive: false },
  });

  await deleteDataRoomFromS3(existing.s3Key);

  await writeAudit({
    entityType: "AdminDataRoom",
    entityId: id,
    action: "DELETE",
    payload: { title: existing.title },
  });

  return NextResponse.json({ ok: true });
}
