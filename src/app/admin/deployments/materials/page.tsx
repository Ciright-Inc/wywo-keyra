import { MaterialsDirectoryClient } from "./MaterialsDirectoryClient";
import { listAdminMaterials, toAdminMaterialView } from "@/lib/materials/adminMaterials";
import { enrichAdminMaterialView } from "@/lib/materials/materialMediaUrls";

export default async function AdminMaterialsPage() {
  const materials = await listAdminMaterials({ newestFirst: true });
  return (
    <MaterialsDirectoryClient
      initialMaterials={materials.map(toAdminMaterialView).map(enrichAdminMaterialView)}
    />
  );
}
