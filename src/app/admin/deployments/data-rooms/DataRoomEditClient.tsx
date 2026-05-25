"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminEditPageHeader } from "@/components/admin/AdminEditPageHeader";
import { useAdminConfirm } from "@/components/admin/AdminConfirmProvider";
import { leaveDataRoomsWhileUploadingMessage } from "@/lib/admin/adminDeleteMessages";
import type { AdminDataRoomView } from "@/lib/dataRooms/dataRoomConstants";
import { DataRoomForm } from "./DataRoomForm";
import { adminPanel } from "@/lib/admin/adminUiClasses";

const DATA_ROOMS_LIST_HREF = "/admin/deployments/data-rooms";

type Props = {
  initialDataRoom: AdminDataRoomView;
};

export function DataRoomEditClient({ initialDataRoom }: Props) {
  const router = useRouter();
  const confirm = useAdminConfirm();
  const [uploadInProgress, setUploadInProgress] = useState(false);
  const cancelUploadRef = useRef<(() => void) | null>(null);

  async function leavePage() {
    if (uploadInProgress) {
      const confirmed = await confirm({
        message: leaveDataRoomsWhileUploadingMessage(),
        confirmLabel: "Go back",
        cancelLabel: "Keep uploading",
      });
      if (!confirmed) return;
      cancelUploadRef.current?.();
    }
    router.push(DATA_ROOMS_LIST_HREF);
  }

  return (
    <div className="max-w-3xl">
      <AdminEditPageHeader
        title="Edit document"
        subtitle={initialDataRoom.fileName}
        backHref={DATA_ROOMS_LIST_HREF}
        backLabel="Back to data rooms"
        onBack={() => void leavePage()}
      />
      <div className={`${adminPanel} mt-6`}>
        <DataRoomForm
          mode="edit"
          dataRoom={initialDataRoom}
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
