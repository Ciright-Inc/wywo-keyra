import { NextResponse } from "next/server";
import type { MaterialMediaKind } from "@prisma/client";
import prisma from "@/lib/prisma";
import { readJsonObject } from "@/app/api/keyra/_routeHelpers";
import { writeAudit } from "@/app/api/admin/deployments/_audit";
import { requireDeploymentAuth } from "@/lib/deployments/adminContext";
import { denyIfComplianceOnlyWriter, denyIfReadOnly } from "@/lib/deployments/adminAuthz";
import {
  ensureMaterialSortOrderUnique,
  listAdminMaterials,
  toAdminMaterialView,
  validateMaterialInput,
} from "@/lib/materials/adminMaterials";
import { enrichAdminMaterialView } from "@/lib/materials/materialMediaUrls";

const KINDS = new Set(["IMAGE", "VIDEO", "GIF", "OTHER"]);

export async function GET(req: Request) {
  const auth = await requireDeploymentAuth(req);
  if (auth instanceof Response) return auth;

  const url = new URL(req.url);
  const kindParam = url.searchParams.get("mediaKind")?.trim().toUpperCase();
  const mediaKind =
    kindParam && KINDS.has(kindParam) ? (kindParam as MaterialMediaKind) : undefined;

  const rows = await listAdminMaterials({ mediaKind, newestFirst: true });
  return NextResponse.json({ materials: rows.map(toAdminMaterialView) });
}

export async function POST(req: Request) {
  const auth = await requireDeploymentAuth(req);
  if (auth instanceof Response) return auth;
  const readOnly = denyIfReadOnly(auth);
  if (readOnly) return readOnly;
  const complianceOnly = denyIfComplianceOnlyWriter(auth);
  if (complianceOnly) return complianceOnly;

  const body = await readJsonObject(req);
  const parsed = validateMaterialInput(
    {
      title: typeof body.title === "string" ? body.title : "",
      description: typeof body.description === "string" ? body.description : null,
      url: typeof body.url === "string" ? body.url : "",
      s3Key: typeof body.s3Key === "string" ? body.s3Key : "",
      mimeType: typeof body.mimeType === "string" ? body.mimeType : "",
      mediaKind:
        typeof body.mediaKind === "string" && KINDS.has(body.mediaKind)
          ? (body.mediaKind as MaterialMediaKind)
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

  const unique = await ensureMaterialSortOrderUnique(parsed.data.sortOrder);
  if ("error" in unique) {
    return NextResponse.json({ error: unique.error }, { status: 409 });
  }

  try {
    const material = await prisma.adminMaterial.create({
      data: {
        ...parsed.data,
        isActive: true,
      },
    });

    await writeAudit({
      entityType: "AdminMaterial",
      entityId: material.id,
      action: "CREATE",
      payload: { title: material.title, mediaKind: material.mediaKind },
    });

    return NextResponse.json(
      { material: enrichAdminMaterialView(toAdminMaterialView(material)) },
      { status: 201 },
    );
  } catch (err) {
    console.error("[AdminMaterial POST]", err);
    if (typeof err === "object" && err !== null && "code" in err && err.code === "P2002") {
      return NextResponse.json(
        { error: "This sort order is already in use. Choose a different number." },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: "Failed to save material." }, { status: 500 });
  }
}
