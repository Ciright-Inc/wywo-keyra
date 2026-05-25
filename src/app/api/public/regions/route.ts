import { NextResponse } from "next/server";
import { getPublicRegionsList, PUBLIC_LIST_CACHE_HEADERS } from "@/lib/deployments/publicTree";

/** Full region catalog — flat list, no login. */
export async function GET() {
  const regions = await getPublicRegionsList();
  return NextResponse.json({ regions }, { headers: PUBLIC_LIST_CACHE_HEADERS });
}
