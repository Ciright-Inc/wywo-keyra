"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminEditPageHeader } from "@/components/admin/AdminEditPageHeader";
import { useAdminConfirm } from "@/components/admin/AdminConfirmProvider";
import { leaveMaterialsWhileUploadingMessage } from "@/lib/admin/adminDeleteMessages";
import type { AdminMaterialView } from "@/lib/materials/materialConstants";
import { MaterialForm } from "./MaterialForm";
import { adminPanel } from "@/lib/admin/adminUiClasses";

const MATERIALS_LIST_HREF = "/admin/deployments/materials";

type Props = {
  initialMaterial: AdminMaterialView;
};

export function MaterialEditClient({ initialMaterial }: Props) {
  const router = useRouter();
  const confirm = useAdminConfirm();
  const [uploadInProgress, setUploadInProgress] = useState(false);
  const cancelUploadRef = useRef<(() => void) | null>(null);

  async function leavePage() {
    if (uploadInProgress) {
      const confirmed = await confirm({
        message: leaveMaterialsWhileUploadingMessage(),
        confirmLabel: "Go back",
        cancelLabel: "Keep uploading",
      });
      if (!confirmed) return;
      cancelUploadRef.current?.();
    }
    router.push(MATERIALS_LIST_HREF);
  }

  return (
    <div className="max-w-3xl">
      <AdminEditPageHeader
        title="Edit material"
        subtitle={initialMaterial.fileName}
        backHref={MATERIALS_LIST_HREF}
        backLabel="Back to materials"
        onBack={() => void leavePage()}
      />
      <div className={`${adminPanel} mt-6`}>
        <MaterialForm
          mode="edit"
          material={initialMaterial}
          onUploadingChange={setUploadInProgress}
          onRegisterCancelUpload={(cancel) => {
            cancelUploadRef.current = cancel;
          }}
          onLeavePage={() => void leavePage()}
        />
      </div>
    </div>
  );
}
