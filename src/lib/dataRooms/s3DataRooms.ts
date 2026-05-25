import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { isAllowedDataRoomS3Key } from "./dataRoomDocumentUrls";
import { randomBytes } from "node:crypto";

function envFirst(...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  return undefined;
}

function getS3Config() {
  const bucket = envFirst("S3_BUCKET", "AWS_BUCKET_NAME", "AWS_S3_BUCKET");
  const region = envFirst("S3_REGION", "AWS_REGION") || "us-east-1";
  const prefix = (process.env.S3_DATA_ROOMS_PREFIX?.trim() || "keyra-data-rooms").replace(/\/$/, "");
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY?.trim();

  if (!bucket) return null;

  if (accessKeyId && secretAccessKey && secretAccessKey.length < 35) {
    throw new Error(
      "AWS_SECRET_ACCESS_KEY looks truncated in .env (expected ~40 characters). Create a new access key in IAM and paste the full secret once.",
    );
  }

  const client = new S3Client({
    region,
    credentials:
      accessKeyId && secretAccessKey ? { accessKeyId, secretAccessKey } : undefined,
  });

  return { client, bucket, region, prefix };
}

export function isDataRoomsS3Configured(): boolean {
  return Boolean(envFirst("S3_BUCKET", "AWS_BUCKET_NAME", "AWS_S3_BUCKET"));
}

export function buildDataRoomS3Key(originalName: string): string {
  const config = getS3Config();
  const prefix = config?.prefix ?? "keyra-data-rooms";
  const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const unique = randomBytes(8).toString("hex");
  return `${prefix}/${Date.now()}-${unique}-${safeName}`;
}

function buildPublicUrl(bucket: string, region: string, key: string): string {
  const encodedKey = key.split("/").map(encodeURIComponent).join("/");
  return `https://${bucket}.s3.${region}.amazonaws.com/${encodedKey}`;
}

export async function uploadDataRoomToS3(params: {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
}): Promise<{ url: string; s3Key: string }> {
  const config = getS3Config();
  if (!config) {
    throw new Error("S3 is not configured. Set S3_BUCKET (and AWS credentials) in .env.");
  }

  const s3Key = buildDataRoomS3Key(params.originalName);
  await config.client.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: s3Key,
      Body: params.buffer,
      ContentType: params.mimeType,
    }),
  );

  return {
    s3Key,
    url: buildPublicUrl(config.bucket, config.region, s3Key),
  };
}

export async function getDataRoomObjectFromS3(s3Key: string) {
  const config = getS3Config();
  if (!config) throw new Error("S3 is not configured.");
  if (!isAllowedDataRoomS3Key(s3Key, config.prefix)) {
    throw new Error("Invalid data room key.");
  }

  const response = await config.client.send(
    new GetObjectCommand({ Bucket: config.bucket, Key: s3Key }),
  );

  if (!response.Body) throw new Error("Object not found.");

  return {
    body: response.Body,
    contentType: response.ContentType ?? "application/octet-stream",
    contentLength: response.ContentLength,
  };
}

export async function deleteDataRoomFromS3(s3Key: string): Promise<void> {
  const config = getS3Config();
  if (!config || !s3Key.trim()) return;

  try {
    await config.client.send(
      new DeleteObjectCommand({ Bucket: config.bucket, Key: s3Key }),
    );
  } catch (err) {
    console.warn("[data-rooms S3] delete failed:", err instanceof Error ? err.message : err);
  }
}
