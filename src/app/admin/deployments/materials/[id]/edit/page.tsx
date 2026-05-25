import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { toAdminMaterialView } from "@/lib/materials/adminMaterials";
import { enrichAdminMaterialView } from "@/lib/materials/materialMediaUrls";
import { MaterialEditClient } from "../../MaterialEditClient";

type Params = { id: string };

export default async function EditAdminMaterialPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const material = await prisma.adminMaterial.findFirst({
    where: { id, isActive: true },
  });
  if (!material) notFound();

  return <MaterialEditClient initialMaterial={enrichAdminMaterialView(toAdminMaterialView(material))} />;
}
