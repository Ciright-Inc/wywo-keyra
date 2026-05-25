import { NextResponse } from "next/server";
import { listTenantInstancesWithLineage } from "@/lib/agents/agentWorldQueries";
import { requireDeploymentAuth } from "@/lib/deployments/adminContext";

export async function GET(req: Request) {
  const auth = await requireDeploymentAuth(req);
  if (auth instanceof Response) return auth;

  const instances = await listTenantInstancesWithLineage();
  return NextResponse.json({ instances });
}
