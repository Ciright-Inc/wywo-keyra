import { NextResponse } from "next/server";
import { requireDeploymentAuth } from "@/lib/deployments/adminContext";
import { denyIfComplianceOnlyWriter, denyIfReadOnly } from "@/lib/deployments/adminAuthz";
import {
  inferDataRoomDocumentKind,
  resolveDataRoomMimeType,
  DATA_ROOM_FILE_TYPE_ERROR,
  DATA_ROOM_MAX_UPLOAD_BYTES,
} from "@/lib/dataRooms/dataRoomDocuments";
import { isDataRoomsS3Configured, uploadDataRoomToS3 } from "@/lib/dataRooms/s3DataRooms";

export async function POST(req: Request) {
  const auth = await requireDeploymentAuth(req);
  if (auth instanceof Response) return auth;
  const readOnly = denyIfReadOnly(auth);
  if (readOnly) return readOnly;
  const complianceOnly = denyIfComplianceOnlyWriter(auth);
  if (complianceOnly) return complianceOnly;

  if (!isDataRoomsS3Configured()) {
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

  const mimeType = resolveDataRoomMimeType(file);
  if (!mimeType) {
    return NextResponse.json({ error: DATA_ROOM_FILE_TYPE_ERROR }, { status: 400 });
  }

  if (file.size > DATA_ROOM_MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: `File exceeds maximum size of ${DATA_ROOM_MAX_UPLOAD_BYTES / (1024 * 1024)} MB.` },
      { status: 400 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = file.name || "document";

  try {
    const { url, s3Key } = await uploadDataRoomToS3({
      buffer,
      originalName: fileName,
      mimeType,
    });
    const documentKind = inferDataRoomDocumentKind(mimeType);

    return NextResponse.json({
      url,
      s3Key,
      mimeType,
      documentKind,
      fileName,
      fileSizeBytes: buffer.length,
    });
  } catch (err) {
    console.error("[POST /api/admin/deployments/data-rooms/upload]", err);
    const message = err instanceof Error ? err.message : "Upload failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
