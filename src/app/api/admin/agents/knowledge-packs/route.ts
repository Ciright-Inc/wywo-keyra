import { NextResponse } from "next/server";
import { listKnowledgePacksWithCounts } from "@/lib/agents/agentWorldQueries";
import { requireDeploymentAuth } from "@/lib/deployments/adminContext";

export async function GET(req: Request) {
  const auth = await requireDeploymentAuth(req);
  if (auth instanceof Response) return auth;

  const knowledgePacks = await listKnowledgePacksWithCounts();
  return NextResponse.json({ knowledgePacks });
}
