import { NextResponse } from "next/server";
import { getAgentWorldControlCenterMetrics } from "@/lib/agents/agentWorldQueries";
import { requireDeploymentAuth } from "@/lib/deployments/adminContext";

export async function GET(req: Request) {
  const auth = await requireDeploymentAuth(req);
  if (auth instanceof Response) return auth;

  const metrics = await getAgentWorldControlCenterMetrics();
  return NextResponse.json(metrics);
}
