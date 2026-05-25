import { NextResponse } from "next/server";
import { requireDeploymentAuth } from "@/lib/deployments/adminContext";
import { getMaterialObjectFromS3 } from "@/lib/materials/s3Materials";

export async function GET(req: Request) {
  const auth = await requireDeploymentAuth(req);
  if (auth instanceof Response) return auth;

  const key = new URL(req.url).searchParams.get("key")?.trim();
  if (!key) {
    return NextResponse.json({ error: "Missing key." }, { status: 400 });
  }

  try {
    const { body, contentType, contentLength } = await getMaterialObjectFromS3(key);
    const headers: HeadersInit = {
      "Content-Type": contentType,
      "Cache-Control": "private, max-age=3600",
    };
    if (contentLength != null) {
      headers["Content-Length"] = String(contentLength);
    }

    return new NextResponse(body.transformToWebStream(), { status: 200, headers });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load file.";
    const status = message.includes("not found") || message.includes("Invalid") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
