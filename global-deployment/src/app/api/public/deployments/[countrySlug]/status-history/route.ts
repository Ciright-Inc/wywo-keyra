import { NextResponse } from "next/server";
import { findCountryInTree, getPublicDeploymentTree } from "@/lib/deployments/publicTree";
import { listPublicCountryStatusHistory } from "@/lib/deployments/publicCountryStatusHistory";

type Params = { countrySlug: string };

export async function GET(_req: Request, context: { params: Promise<Params> }) {
  const { countrySlug } = await context.params;
  const tree = await getPublicDeploymentTree();
  const country = findCountryInTree(tree, countrySlug);
  if (!country) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const entries = await listPublicCountryStatusHistory(country.id);
  return NextResponse.json({ entries }, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
  });
}
