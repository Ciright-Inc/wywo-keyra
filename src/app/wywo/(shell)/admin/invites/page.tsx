import { AdminDirectoryPageHeader } from "@/components/admin/AdminDirectoryPageHeader";
import { formatAdminDateTime } from "@/lib/admin/formatAdminDateTime";
import {
  adminPanel,
  adminTable,
  adminTableScroll,
  adminTableWrap,
} from "@/lib/admin/adminUiClasses";
import { assertWywoAdminActor } from "@/lib/wywo/auth";
import { WYWO_INVITE_STATUS_LABELS } from "@/lib/wywo/constants";
import { listAllInvites } from "@/lib/wywo/invites";

export default async function WywoAdminInvitesPage() {
  await assertWywoAdminActor("/wywo/admin/invites");
  const invites = await listAllInvites({ limit: 200 });
  return (
    <div>
      <AdminDirectoryPageHeader
        title="SMS invites"
        description="Onboarding deep-links sent to unknown recipients."
      />
      <div className={`${adminPanel} mt-6 p-0 overflow-hidden`}>
        <div className={adminTableWrap}>
          <div className={adminTableScroll}>
            <table className={adminTable}>
              <thead>
                <tr>
                  <th>Created</th>
                  <th>Sender</th>
                  <th>Recipient</th>
                  <th>Status</th>
                  <th>SMS sent</th>
                  <th>Clicked</th>
                  <th>Verified</th>
                  <th>Expires</th>
                  <th>Token</th>
                </tr>
              </thead>
              <tbody>
                {invites.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="ds-body-sm p-6">
                      No invites yet.
                    </td>
                  </tr>
                ) : (
                  invites.map((iv) => (
                    <tr key={iv.id}>
                      <td className="ds-caption">{formatAdminDateTime(iv.createdAt)}</td>
                      <td className="ds-caption ds-numeric">{iv.senderPhoneE164}</td>
                      <td className="ds-caption ds-numeric">{iv.recipientPhone}</td>
                      <td>
                        <span className="ds-caption-uppercase">
                          {WYWO_INVITE_STATUS_LABELS[iv.status]}
                        </span>
                      </td>
                      <td className="ds-caption">{iv.smsSentAt ? formatAdminDateTime(iv.smsSentAt) : "—"}</td>
                      <td className="ds-caption">{iv.clickedAt ? formatAdminDateTime(iv.clickedAt) : "—"}</td>
                      <td className="ds-caption">{iv.verifiedAt ? formatAdminDateTime(iv.verifiedAt) : "—"}</td>
                      <td className="ds-caption">
                        {formatAdminDateTime(new Date(iv.createdAt.getTime() + 14 * 24 * 60 * 60 * 1000))}
                      </td>
                      <td className="ds-caption ds-numeric">{iv.inviteToken.slice(0, 12)}…</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
