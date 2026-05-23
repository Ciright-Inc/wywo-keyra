import { NextResponse } from "next/server";
import { getPublicCountriesList, PUBLIC_LIST_CACHE_HEADERS } from "@/lib/deployments/publicTree";

/** Full country catalog — flat list, no login. */
export async function GET() {
  const countries = await getPublicCountriesList();
  return NextResponse.json({ countries }, { headers: PUBLIC_LIST_CACHE_HEADERS });
}
