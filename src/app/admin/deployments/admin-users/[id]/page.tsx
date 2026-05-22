import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { assertAdminServer } from "@/lib/assertAdminServer";
import { parsePhoneE164 } from "@/lib/adminUserPhone";
import { isComplianceReviewer, isGlobal, isReadOnlyRole } from "@/lib/deployments/adminAuthz";
import { AdminUserEditClient } from "./AdminUserEditClient";

type Params = { id: string };

export default async function AdminUserEditPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const auth = await assertAdminServer();
  if (!isGlobal(auth)) notFound();

  const user = await prisma.adminUser.findUnique({
    where: { id },
    select: {
      id: true,
      displayName: true,
      email: true,
      phoneE164: true,
      role: true,
      isActive: true,
    },
  });
  if (!user) notFound();

  const { phoneCountryCode, national: phoneNational } = parsePhoneE164(user.phoneE164);

  const canEdit =
    auth.kind === "legacy_super" ||
    (auth.kind === "user" && !isReadOnlyRole(auth) && !isComplianceReviewer(auth));

  return (
    <AdminUserEditClient
      user={{
        id: user.id,
        displayName: user.displayName,
        email: user.email,
        phoneCountryCode,
        phoneNational,
        role: user.role,
        isActive: user.isActive,
      }}
      canEdit={canEdit}
    />
  );
}
