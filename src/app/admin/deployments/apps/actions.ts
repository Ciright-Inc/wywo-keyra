"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { assertAdminServer } from "@/lib/assertAdminServer";
import { isComplianceReviewer, isReadOnlyRole } from "@/lib/deployments/adminAuthz";
import { revalidatePublicDeployments } from "@/lib/deployments/revalidatePublicDeployments";
import { writeAudit } from "@/app/api/admin/deployments/_audit";
import {
  ensureDeploymentAppCategory,
  ensureDeploymentAppsSeeded,
  normalizeDeploymentAppId,
  toDeploymentAppView,
  validateDeploymentAppInput,
} from "@/lib/deploymentApps";
import type { DeploymentAppView } from "@/lib/deploymentAppConstants";

type ActionError = { error: string };
type SaveInput = {
  mode: "create" | "edit";
  appId?: string;
  label: string;
  description: string;
  href: string;
  gensparkUrl: string | null;
  temporaryUrl: string | null;
  section: string;
  isPrivate: boolean;
  isActive: boolean;
  sortOrder?: number;
};

function forbiddenError(): ActionError {
  return { error: "You do not have permission to change apps." };
}

export async function getDeploymentAppAction(appId: string): Promise<DeploymentAppView | ActionError> {
  const auth = await assertAdminServer();
  if (isReadOnlyRole(auth) || isComplianceReviewer(auth)) return forbiddenError();
  await ensureDeploymentAppsSeeded();

  const app = await prisma.deploymentApp.findUnique({ where: { id: appId } });
  if (!app) return { error: "App not found." };
  return toDeploymentAppView(app);
}

export async function saveDeploymentAppAction(input: SaveInput): Promise<{ ok: true } | ActionError> {
  const auth = await assertAdminServer();
  if (isReadOnlyRole(auth) || isComplianceReviewer(auth)) return forbiddenError();
  await ensureDeploymentAppsSeeded();

  const parsed = validateDeploymentAppInput({
    label: input.label,
    description: input.description,
    href: input.href,
    gensparkUrl: input.gensparkUrl,
    temporaryUrl: input.temporaryUrl,
    section: input.section,
    isPrivate: input.isPrivate,
    isActive: input.isActive,
    sortOrder: input.sortOrder,
  });
  if ("error" in parsed) return { error: parsed.error };

  await ensureDeploymentAppCategory(parsed.section);

  try {
    if (input.mode === "edit") {
      const appId = input.appId?.trim();
      if (!appId) return { error: "App not found." };

      const exists = await prisma.deploymentApp.findUnique({
        where: { id: appId },
        select: { id: true, sortOrder: true },
      });
      if (!exists) return { error: "App not found." };

      const app = await prisma.deploymentApp.update({
        where: { id: appId },
        data: {
          label: parsed.label,
          description: parsed.description,
          href: parsed.href,
          gensparkUrl: parsed.gensparkUrl,
          temporaryUrl: parsed.temporaryUrl,
          section: parsed.section,
          isPrivate: parsed.isPrivate,
          isActive: parsed.isActive,
          sortOrder: parsed.sortOrder ?? exists.sortOrder,
        },
      });

      await writeAudit({
        entityType: "DeploymentApp",
        entityId: app.id,
        action: "UPDATE",
        payload: { label: app.label, href: app.href, isPrivate: app.isPrivate, isActive: app.isActive },
      });
    } else {
      const baseId = normalizeDeploymentAppId(parsed.label);
      if (!baseId) return { error: "App name cannot create a valid id." };

      let id = baseId;
      let suffix = 2;
      while (await prisma.deploymentApp.findUnique({ where: { id }, select: { id: true } })) {
        id = `${baseId}-${suffix}`;
        suffix += 1;
      }

      const app = await prisma.deploymentApp.create({
        data: {
          id,
          label: parsed.label,
          description: parsed.description,
          href: parsed.href,
          gensparkUrl: parsed.gensparkUrl,
          temporaryUrl: parsed.temporaryUrl,
          section: parsed.section,
          isPrivate: parsed.isPrivate,
          isActive: parsed.isActive,
          sortOrder: parsed.sortOrder ?? 0,
        },
      });

      await writeAudit({
        entityType: "DeploymentApp",
        entityId: app.id,
        action: "CREATE",
        payload: { label: app.label, href: app.href, isPrivate: app.isPrivate, isActive: app.isActive },
      });
    }

    revalidatePublicDeployments();
    revalidatePath("/admin/deployments/apps");
    if (input.mode === "edit" && input.appId) {
      revalidatePath(`/admin/deployments/apps/${input.appId}/edit`);
    }
    return { ok: true };
  } catch (err) {
    console.error("[saveDeploymentAppAction]", err);
    return { error: "Unable to save app. Please try again." };
  }
}

export async function setDeploymentAppActiveAction(
  appId: string,
  isActive: boolean,
): Promise<{ ok: true; isActive: boolean } | ActionError> {
  const auth = await assertAdminServer();
  if (isReadOnlyRole(auth) || isComplianceReviewer(auth)) return forbiddenError();
  await ensureDeploymentAppsSeeded();

  const exists = await prisma.deploymentApp.findUnique({
    where: { id: appId },
    select: { id: true, label: true },
  });
  if (!exists) return { error: "App not found." };

  try {
    const app = await prisma.deploymentApp.update({
      where: { id: appId },
      data: { isActive },
    });

    await writeAudit({
      entityType: "DeploymentApp",
      entityId: app.id,
      action: isActive ? "UPDATE" : "DELETE",
      payload: { label: app.label, isActive: app.isActive },
    });

    revalidatePublicDeployments();
    revalidatePath("/admin/deployments/apps");
    revalidatePath(`/admin/deployments/apps/${appId}/edit`);

    return { ok: true, isActive: app.isActive };
  } catch (err) {
    console.error("[setDeploymentAppActiveAction]", err);
    return { error: "Unable to save active status. Please try again." };
  }
}

export async function deleteDeploymentAppAction(appId: string): Promise<{ ok: true } | ActionError> {
  const auth = await assertAdminServer();
  if (isReadOnlyRole(auth) || isComplianceReviewer(auth)) return forbiddenError();
  await ensureDeploymentAppsSeeded();

  const exists = await prisma.deploymentApp.findFirst({
    where: { id: appId, isActive: true },
    select: { id: true, label: true },
  });
  if (!exists) return { error: "App not found." };

  await prisma.deploymentApp.update({
    where: { id: appId },
    data: { isActive: false },
  });

  await writeAudit({
    entityType: "DeploymentApp",
    entityId: appId,
    action: "DELETE",
    payload: { label: exists.label },
  });

  revalidatePublicDeployments();
  revalidatePath("/admin/deployments/apps");
  return { ok: true };
}
