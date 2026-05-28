"use client";

import type { WywoSelectOption } from "./WywoSelect";
import { WywoSelectFilterField } from "./WywoSelectFilterField";
import { adminInput, adminLabel } from "@/lib/admin/adminUiClasses";

type Props = {
  worldOptions: readonly WywoSelectOption[];
  trustRingOptions: readonly WywoSelectOption[];
  subscriptionOptions: readonly WywoSelectOption[];
  companyOptions: readonly WywoSelectOption[];
  sourceTypeOptions: readonly WywoSelectOption[];
  defaultQuery?: string;
  defaultWorldId?: string;
  defaultTrustRing?: string;
  defaultSubscriptionId?: string;
  defaultCompany?: string;
  defaultSourceType?: string;
};

export function WywoUnifiedInboxFilters({
  worldOptions,
  trustRingOptions,
  subscriptionOptions,
  companyOptions,
  sourceTypeOptions,
  defaultQuery = "",
  defaultWorldId = "",
  defaultTrustRing = "",
  defaultSubscriptionId = "",
  defaultCompany = "",
  defaultSourceType = "",
}: Props) {
  return (
    <form method="get" action="/wywo/inbox" className="space-y-4">
      <div className="flex flex-wrap gap-3 items-end">
        <div className="min-w-[240px] flex-1">
          <label className="ds-label" htmlFor="wywo-q">
            Search
          </label>
          <input
            id="wywo-q"
            name="q"
            type="text"
            defaultValue={defaultQuery}
            placeholder="Subject, sender, phone…"
            className={adminInput}
          />
        </div>
        <button type="submit" className="ds-btn-primary is-sm">
          Apply
        </button>
        <button
          type="button"
          className="ds-btn-secondary is-sm"
          onClick={() => {
            // Reset by navigating to a clean URL.
            window.location.href = "/wywo/inbox";
          }}
        >
          Reset
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="sm:col-span-2 lg:col-span-1">
          <label className={adminLabel}>World</label>
          <WywoSelectFilterField
            name="worldId"
            defaultValue={defaultWorldId}
            options={worldOptions}
            placeholder="All worlds"
          />
        </div>

        <div className="sm:col-span-1 lg:col-span-1">
          <label className={adminLabel}>Trust ring</label>
          <WywoSelectFilterField
            name="trustRing"
            defaultValue={defaultTrustRing}
            options={trustRingOptions}
            placeholder="All rings"
          />
        </div>

        <div className="sm:col-span-1 lg:col-span-1">
          <label className={adminLabel}>Message type</label>
          <WywoSelectFilterField
            name="sourceType"
            defaultValue={defaultSourceType}
            options={sourceTypeOptions}
            placeholder="All types"
          />
        </div>

        <div className="sm:col-span-1 lg:col-span-1">
          <label className={adminLabel}>Subscription</label>
          <WywoSelectFilterField
            name="subscriptionId"
            defaultValue={defaultSubscriptionId}
            options={subscriptionOptions}
            placeholder="All subscriptions"
          />
        </div>

        <div className="sm:col-span-2 lg:col-span-2">
          <label className={adminLabel}>Company</label>
          <WywoSelectFilterField
            name="company"
            defaultValue={defaultCompany}
            options={companyOptions}
            placeholder="All companies"
            widthClass="w-full"
          />
        </div>
      </div>
    </form>
  );
}

