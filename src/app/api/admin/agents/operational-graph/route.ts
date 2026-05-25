import { NextResponse } from "next/server";
import { getOperationalGraphSummary } from "@/lib/agents/intrinsicIndex";
import { requireDeploymentAuth } from "@/lib/deployments/adminContext";

export async function GET(req: Request) {
  const auth = await requireDeploymentAuth(req);
  if (auth instanceof Response) return auth;

  const url = new URL(req.url);
  const agentWorldId = url.searchParams.get("agentWorldId") ?? undefined;

  const graph = await getOperationalGraphSummary(agentWorldId);
  return NextResponse.json(graph);
}
