import { AdminDirectoryPageHeader } from "@/components/admin/AdminDirectoryPageHeader";
import { WywoTrustBadge } from "@/components/wywo/WywoTrustBadge";
import { formatAdminDateTime } from "@/lib/admin/formatAdminDateTime";
import {
  adminPanel,
  adminTable,
  adminTableScroll,
  adminTableWrap,
} from "@/lib/admin/adminUiClasses";
import { WYWO_TRUST_RING_LABELS } from "@/lib/wywo/constants";
import { assertWywoActor } from "@/lib/wywo/auth";
import { listTrustContacts } from "@/lib/wywo/trust";

export default async function WywoContactsPage() {
  const actor = await assertWywoActor("/wywo/contacts");
  const contacts = await listTrustContacts(actor.phoneE164);

  return (
    <div>
      <AdminDirectoryPageHeader
        title="Contacts"
        description="Trusted contacts across your Keyra worlds and Ciright CRM graph."
      />
      <div className={`${adminPanel} mt-6 p-0 overflow-hidden`}>
        {contacts.length === 0 ? (
          <p className="p-6 ds-body-sm">No contacts synced yet.</p>
        ) : (
          <div className={adminTableWrap}>
            <div className={adminTableScroll}>
              <table className={adminTable}>
                <thead>
                  <tr>
                    <th>Contact</th>
                    <th>Phone</th>
                    <th>Trust</th>
                    <th>Ring</th>
                    <th>Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((contact) => (
                    <tr key={contact.id}>
                      <td>{contact.contactName ?? "—"}</td>
                      <td className="ds-numeric">{contact.contactPhone}</td>
                      <td>
                        <WywoTrustBadge status={contact.trustStatus} />
                      </td>
                      <td>{WYWO_TRUST_RING_LABELS[contact.trustRing]}</td>
                      <td className="ds-caption">{formatAdminDateTime(contact.updatedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
