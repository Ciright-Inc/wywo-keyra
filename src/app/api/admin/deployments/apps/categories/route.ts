import { NextResponse } from "next/server";
import { readJsonObject } from "@/app/api/keyra/_routeHelpers";
import {
  countAppsInCategory,
  createDeploymentAppCategoryFromInput,
  deleteDeploymentAppCategory,
  listDeploymentAppCategoryViews,
  updateDeploymentAppCategory,
} from "@/lib/deploymentApps";
import { requireDeploymentAuth } from "@/lib/deployments/adminContext";
import { denyIfComplianceOnlyWriter, denyIfReadOnly } from "@/lib/deployments/adminAuthz";

export async function GET(req: Request) {
  const auth = await requireDeploymentAuth(req);
  if (auth instanceof Response) return auth;

  const categories = await listDeploymentAppCategoryViews();
  const usage = await Promise.all(
    categories.map(async (category) => ({
      name: category.name,
      appCount: await countAppsInCategory(category.name),
    })),
  );

  return NextResponse.json({ categories, usage });
}

export async function POST(req: Request) {
  const auth = await requireDeploymentAuth(req);
  if (auth instanceof Response) return auth;
  const readOnly = denyIfReadOnly(auth);
  if (readOnly) return readOnly;
  const complianceOnly = denyIfComplianceOnlyWriter(auth);
  if (complianceOnly) return complianceOnly;

  const body = await readJsonObject(req);
  const name = typeof body.name === "string" ? body.name : "";
  const sortOrder = typeof body.sortOrder === "number" ? body.sortOrder : undefined;
  const result = await createDeploymentAppCategoryFromInput(name, sortOrder);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });

  return NextResponse.json({ category: result }, { status: 201 });
}

export async function PUT(req: Request) {
  const auth = await requireDeploymentAuth(req);
  if (auth instanceof Response) return auth;
  const readOnly = denyIfReadOnly(auth);
  if (readOnly) return readOnly;
  const complianceOnly = denyIfComplianceOnlyWriter(auth);
  if (complianceOnly) return complianceOnly;

  const body = await readJsonObject(req);
  const originalName = typeof body.originalName === "string" ? body.originalName : "";
  const name = typeof body.name === "string" ? body.name : undefined;
  const sortOrder = typeof body.sortOrder === "number" ? body.sortOrder : undefined;

  const result = await updateDeploymentAppCategory(originalName, { name, sortOrder });
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });

  return NextResponse.json({ category: result });
}

export async function DELETE(req: Request) {
  const auth = await requireDeploymentAuth(req);
  if (auth instanceof Response) return auth;
  const readOnly = denyIfReadOnly(auth);
  if (readOnly) return readOnly;
  const complianceOnly = denyIfComplianceOnlyWriter(auth);
  if (complianceOnly) return complianceOnly;

  const body = await readJsonObject(req);
  const name = typeof body.name === "string" ? body.name : "";
  const reassignTo = typeof body.reassignTo === "string" ? body.reassignTo : undefined;

  const result = await deleteDeploymentAppCategory(name, reassignTo);
  if ("error" in result) {
    return NextResponse.json(result, { status: result.needsReassign ? 409 : 400 });
  }

  return NextResponse.json({ ok: true });
}
