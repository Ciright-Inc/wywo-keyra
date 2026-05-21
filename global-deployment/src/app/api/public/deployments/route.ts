import { NextResponse } from "next/server";
import {
  filterPublicTree,
  getPublicDeploymentTree,
} from "@/lib/deployments/publicTree";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const continent = url.searchParams.get("continent") ?? undefined;
  const subregion = url.searchParams.get("subregion") ?? undefined;
  const mapKey = url.searchParams.get("mapKey") ?? undefined;

  const tree = await getPublicDeploymentTree();
  const filtered = filterPublicTree(tree, {
    continentCode: continent ?? undefined,
    subregionCode: subregion ?? undefined,
    mapKey: mapKey ?? undefined,
  });

  return NextResponse.json(filtered, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
  });
}
