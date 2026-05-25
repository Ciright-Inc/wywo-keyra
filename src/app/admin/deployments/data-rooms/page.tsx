import { DataRoomsDirectoryClient } from "./DataRoomsDirectoryClient";
import { listAdminDataRooms, toAdminDataRoomView } from "@/lib/dataRooms/adminDataRooms";
import { enrichAdminDataRoomView } from "@/lib/dataRooms/dataRoomDocumentUrls";

export default async function AdminDataRoomsPage() {
  const dataRooms = await listAdminDataRooms({ newestFirst: true });
  return (
    <DataRoomsDirectoryClient
      initialDataRooms={dataRooms.map(toAdminDataRoomView).map(enrichAdminDataRoomView)}
    />
  );
}
