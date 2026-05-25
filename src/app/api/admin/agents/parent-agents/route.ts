import { NextResponse } from "next/server";
import { listParentAgentsWithKeyraCount } from "@/lib/agents/agentWorldQueries";
import { requireDeploymentAuth } from "@/lib/deployments/adminContext";

export async function GET(req: Request) {
  const auth = await requireDeploymentAuth(req);
  if (auth instanceof Response) return auth;

  const parentAgents = await listParentAgentsWithKeyraCount();
  return NextResponse.json({ parentAgents });
}
