import { notFound } from "next/navigation";
import { DataRoomEditClient } from "../../DataRoomEditClient";
import { toAdminDataRoomView } from "@/lib/dataRooms/adminDataRooms";
import { enrichAdminDataRoomView } from "@/lib/dataRooms/dataRoomDocumentUrls";
import prisma from "@/lib/prisma";

type Props = { params: Promise<{ id: string }> };

export default async function AdminDataRoomEditPage({ params }: Props) {
  const { id } = await params;
  const row = await prisma.adminDataRoom.findFirst({ where: { id, isActive: true } });
  if (!row) notFound();

  return (
    <DataRoomEditClient
      initialDataRoom={enrichAdminDataRoomView(toAdminDataRoomView(row))}
    />
  );
}
