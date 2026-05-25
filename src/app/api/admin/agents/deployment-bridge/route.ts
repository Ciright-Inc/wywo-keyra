import { NextResponse } from "next/server";
import { listKeyraAgentsWithRelations } from "@/lib/agents/agentWorldQueries";
import { requireDeploymentAuth } from "@/lib/deployments/adminContext";

export async function GET(req: Request) {
  const auth = await requireDeploymentAuth(req);
  if (auth instanceof Response) return auth;

  const keyraAgents = await listKeyraAgentsWithRelations();
  return NextResponse.json({ keyraAgents });
}
