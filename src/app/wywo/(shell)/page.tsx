import Link from "next/link";
import {
  adminCatalogStatBox,
  adminCatalogStatGrid,
  adminCatalogStatLabel,
  adminCatalogStatValue,
  adminPageTitle,
  adminSectionTitle,
  adminToolbarBtnPrimary,
} from "@/lib/admin/adminUiClasses";
import { WywoMessageList } from "@/components/wywo/WywoMessageList";
import { assertWywoActor } from "@/lib/wywo/auth";
import { listWywoMessages } from "@/lib/wywo/messages";
import { listTrustContacts } from "@/lib/wywo/trust";
import { ensurePersonalWywoWorld } from "@/lib/wywo/worlds";

export default async function WywoDashboardPage() {
  const actor = await assertWywoActor("/wywo");
  await ensurePersonalWywoWorld({
    phoneE164: actor.phoneE164,
    displayName: actor.displayName,
    email: actor.email,
    uid: actor.uid,
  });

  const [inbox, pending, sent, contacts] = await Promise.all([
    listWywoMessages(actor, { direction: "inbox", perPage: 5 }),
    listWywoMessages(actor, { direction: "inbox", pendingTrust: true, perPage: 1 }),
    listWywoMessages(actor, { direction: "sent", perPage: 1 }),
    listTrustContacts(actor.phoneE164),
  ]);

  return (
    <div className="space-y-6">
      <header className="ds-page-header">
        <div>
          <p className="ds-caption-uppercase">While You Were Out</p>
          <h1 className={adminPageTitle}>Trusted message layer</h1>
          <p className="mt-2 max-w-2xl ds-body-sm">
            I no longer receive noise. I receive trusted messages from verified people and verified
            agents.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/wywo/compose" className={adminToolbarBtnPrimary}>
            Compose WYWO
          </Link>
          <Link href="/wywo/pending" className="ds-btn-secondary is-sm">
            Review pending trust
          </Link>
        </div>
      </header>

      <div className={adminCatalogStatGrid}>
        <div className={adminCatalogStatBox}>
          <p className={adminCatalogStatLabel}>Trusted inbox</p>
          <p className={`${adminCatalogStatValue} ds-numeric`}>{inbox.total}</p>
        </div>
        <div className={adminCatalogStatBox}>
          <p className={adminCatalogStatLabel}>Pending trust</p>
          <p className={`${adminCatalogStatValue} ds-numeric`}>{pending.total}</p>
        </div>
        <div className={adminCatalogStatBox}>
          <p className={adminCatalogStatLabel}>Sent</p>
          <p className={`${adminCatalogStatValue} ds-numeric`}>{sent.total}</p>
        </div>
        <div className={adminCatalogStatBox}>
          <p className={adminCatalogStatLabel}>Trust contacts</p>
          <p className={`${adminCatalogStatValue} ds-numeric`}>{contacts.length}</p>
        </div>
      </div>

      <section>
        <h2 className={adminSectionTitle}>Recent trusted inbox</h2>
        <div className="mt-3">
          <WywoMessageList items={inbox.items} emptyLabel="Your trusted inbox is clear." />
        </div>
      </section>

      <section className="wywo-doctrine">
        <span className="wywo-doctrine__dot">K</span>
        <div>
          <p className="ds-title-sm">Trust doctrine</p>
          <p className="mt-1 ds-body-sm">
            Unknown messages never enter the trusted inbox until reviewed. Every message is attributable
            — no anonymous communication.
          </p>
        </div>
      </section>
    </div>
  );
}
