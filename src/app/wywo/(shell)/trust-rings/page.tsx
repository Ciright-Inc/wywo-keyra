import { AdminDirectoryPageHeader } from "@/components/admin/AdminDirectoryPageHeader";
import { WywoTrustBadge } from "@/components/wywo/WywoTrustBadge";
import {
  adminPanel,
  adminSectionTitle,
} from "@/lib/admin/adminUiClasses";
import { WYWO_TRUST_RING_LABELS } from "@/lib/wywo/constants";
import { assertWywoActor } from "@/lib/wywo/auth";
import { listTrustContacts } from "@/lib/wywo/trust";

const RINGS = Object.entries(WYWO_TRUST_RING_LABELS);

export default async function WywoTrustRingsPage() {
  const actor = await assertWywoActor("/wywo/trust-rings");
  const contacts = await listTrustContacts(actor.phoneE164);

  const grouped = RINGS.map(([ring, label]) => ({
    ring,
    label,
    items: contacts.filter((c) => c.trustRing === ring),
  }));

  return (
    <div>
      <AdminDirectoryPageHeader
        title="Trust rings"
        description="Family Circle, Executive Ring, Trusted Contacts, Referred, Pending Unknowns, Blocked Entities."
      />
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {grouped.map((group) => (
          <section key={group.ring} className={adminPanel}>
            <h2 className={adminSectionTitle}>{group.label}</h2>
            <p className="mt-1 ds-caption">
              <span className="ds-numeric">{group.items.length}</span> contacts
            </p>
            <ul className="mt-4 space-y-3">
              {group.items.length === 0 ? (
                <li className="ds-body-sm">No contacts in this ring.</li>
              ) : (
                group.items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-3 border-t border-[var(--ds-hairline)] pt-3 first:border-0 first:pt-0"
                  >
                    <div>
                      <p className="ds-body-sm text-[var(--ds-ink)]">{item.contactName ?? item.contactPhone}</p>
                      <p className="ds-caption ds-numeric">{item.contactPhone}</p>
                    </div>
                    <WywoTrustBadge status={item.trustStatus} />
                  </li>
                ))
              )}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
