import { NextResponse } from "next/server";
import type { MaterialMediaKind } from "@prisma/client";
import prisma from "@/lib/prisma";
import { readJsonObject } from "@/app/api/keyra/_routeHelpers";
import { writeAudit } from "@/app/api/admin/deployments/_audit";
import { requireDeploymentAuth } from "@/lib/deployments/adminContext";
import { denyIfComplianceOnlyWriter, denyIfReadOnly } from "@/lib/deployments/adminAuthz";
import {
  ensureMaterialSortOrderUnique,
  toAdminMaterialView,
  validateMaterialInput,
} from "@/lib/materials/adminMaterials";
import { deleteMaterialFromS3 } from "@/lib/materials/s3Materials";

type Params = { id: string };

const KINDS = new Set(["IMAGE", "VIDEO", "GIF", "OTHER"]);

export async function GET(req: Request, { params }: { params: Promise<Params> }) {
  const auth = await requireDeploymentAuth(req);
  if (auth instanceof Response) return auth;

  const { id } = await params;
  const material = await prisma.adminMaterial.findFirst({
    where: { id, isActive: true },
  });
  if (!material) return NextResponse.json({ error: "Material not found." }, { status: 404 });
  return NextResponse.json({ material: toAdminMaterialView(material) });
}

export async function PUT(req: Request, { params }: { params: Promise<Params> }) {
  const auth = await requireDeploymentAuth(req);
  if (auth instanceof Response) return auth;
  const readOnly = denyIfReadOnly(auth);
  if (readOnly) return readOnly;
  const complianceOnly = denyIfComplianceOnlyWriter(auth);
  if (complianceOnly) return complianceOnly;

  const { id } = await params;
  const existing = await prisma.adminMaterial.findFirst({ where: { id, isActive: true } });
  if (!existing) return NextResponse.json({ error: "Material not found." }, { status: 404 });

  const body = await readJsonObject(req);
  const replaceFile = body.replaceFile === true;

  const parsed = validateMaterialInput(
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
      mediaKind:
        replaceFile &&
        typeof body.mediaKind === "string" &&
        KINDS.has(body.mediaKind)
          ? (body.mediaKind as MaterialMediaKind)
          : existing.mediaKind,
      fileName:
        replaceFile && typeof body.fileName === "string" ? body.fileName : existing.fileName,
      fileSizeBytes:
        replaceFile && typeof body.fileSizeBytes === "number"
          ? body.fileSizeBytes
          : existing.fileSizeBytes,
      sortOrder: body.sortOrder !== undefined ? body.sortOrder : existing.sortOrder,
    },
    { requireFile: false },
  );
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const unique = await ensureMaterialSortOrderUnique(parsed.data.sortOrder, id);
  if ("error" in unique) {
    return NextResponse.json({ error: unique.error }, { status: 409 });
  }

  const previousS3Key =
    replaceFile && parsed.data.s3Key !== existing.s3Key ? existing.s3Key : null;

  try {
    const material = await prisma.adminMaterial.update({
      where: { id },
      data: parsed.data,
    });

    if (previousS3Key) {
      await deleteMaterialFromS3(previousS3Key);
    }

    await writeAudit({
      entityType: "AdminMaterial",
      entityId: material.id,
      action: "UPDATE",
      payload: { title: material.title, mediaKind: material.mediaKind },
    });

    return NextResponse.json({ material: toAdminMaterialView(material) });
  } catch (err) {
    console.error("[AdminMaterial PUT]", err);
    if (typeof err === "object" && err !== null && "code" in err && err.code === "P2002") {
      return NextResponse.json(
        { error: "This sort order is already in use. Choose a different number." },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: "Failed to save material." }, { status: 500 });
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
  const existing = await prisma.adminMaterial.findFirst({
    where: { id, isActive: true },
    select: { id: true, title: true, s3Key: true },
  });
  if (!existing) return NextResponse.json({ error: "Material not found." }, { status: 404 });

  await prisma.adminMaterial.update({
    where: { id },
    data: { isActive: false },
  });

  await deleteMaterialFromS3(existing.s3Key);

  await writeAudit({
    entityType: "AdminMaterial",
    entityId: id,
    action: "DELETE",
    payload: { title: existing.title },
  });

  return NextResponse.json({ ok: true });
}
