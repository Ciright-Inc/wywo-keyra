import { NextResponse } from "next/server";
import { requireDeploymentAuth } from "@/lib/deployments/adminContext";
import { denyIfComplianceOnlyWriter, denyIfReadOnly } from "@/lib/deployments/adminAuthz";
import {
  inferMaterialMediaKind,
  MATERIAL_FILE_TYPE_ERROR,
  MATERIAL_MAX_UPLOAD_BYTES,
  resolveMaterialMimeType,
} from "@/lib/materials/materialMedia";
import { isMaterialsS3Configured, uploadMaterialToS3 } from "@/lib/materials/s3Materials";

export async function POST(req: Request) {
  const auth = await requireDeploymentAuth(req);
  if (auth instanceof Response) return auth;
  const readOnly = denyIfReadOnly(auth);
  if (readOnly) return readOnly;
  const complianceOnly = denyIfComplianceOnlyWriter(auth);
  if (complianceOnly) return complianceOnly;

  if (!isMaterialsS3Configured()) {
    return NextResponse.json(
      {
        error:
          "S3 storage is not configured. Set S3_BUCKET (or AWS_BUCKET_NAME), S3_REGION (or AWS_REGION), and AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY in keyra/.env.",
      },
      { status: 503 },
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  const mimeType = resolveMaterialMimeType(file);
  if (!mimeType) {
    return NextResponse.json({ error: MATERIAL_FILE_TYPE_ERROR }, { status: 400 });
  }

  if (file.size > MATERIAL_MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: `File exceeds maximum size of ${MATERIAL_MAX_UPLOAD_BYTES / (1024 * 1024)} MB.` },
      { status: 400 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = file.name || "upload";

  try {
    const { url, s3Key } = await uploadMaterialToS3({
      buffer,
      originalName: fileName,
      mimeType,
    });
    const mediaKind = inferMaterialMediaKind(mimeType);

    return NextResponse.json({
      url,
      s3Key,
      mimeType,
      mediaKind,
      fileName,
      fileSizeBytes: buffer.length,
    });
  } catch (err) {
    console.error("[POST /api/admin/deployments/materials/upload]", err);
    const name = err && typeof err === "object" && "name" in err ? String(err.name) : "";
    const message = err instanceof Error ? err.message : "Upload failed.";
    if (name === "SignatureDoesNotMatch") {
      return NextResponse.json(
        {
          error:
            "AWS rejected the upload signature. In keyra/.env, verify AWS_ACCESS_KEY_ID and the full AWS_SECRET_ACCESS_KEY (~40 characters, no quotes or extra spaces). Create a new IAM access key if unsure.",
        },
        { status: 500 },
      );
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
