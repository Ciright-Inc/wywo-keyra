import { NextResponse } from "next/server";
import { getAdminRegistryTree } from "@/lib/deployments/adminRegistryTree";

export async function GET() {
  const tree = await getAdminRegistryTree();

  return NextResponse.json(tree, {
    headers: { "Cache-Control": "no-store" },
  });
}
