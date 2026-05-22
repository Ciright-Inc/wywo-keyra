"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/components/ui/cn";
import { OfficialDomainLink } from "@/components/global-deployment/OfficialDomainLink";
import { StatusBadge } from "@/components/global-deployment/StatusBadge";
import { flagEmojiFromIso2 } from "@/lib/deployments/flagEmoji";
import type { PublicCountry, PublicRegion, PublicTelco } from "@/lib/deployments/publicTree";

function formatPopulation(display: string | null | undefined, population: number | null | undefined) {
  if (display?.trim()) return display;
  if (population == null) return "—";
  return population.toLocaleString("en-IE");
}

function formatSubscribers(display: string | null | undefined, subscribers: number | null | undefined) {
  if (display?.trim()) return display;
  if (subscribers == null) return "—";
  return subscribers.toLocaleString("en-IE");
}

function MetaField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0 rounded-[var(--keyra-radius-md)] border border-keyra-border/70 bg-keyra-surface/50 px-3 py-2.5">
      <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-keyra-text-2">{label}</dt>
      <dd className="mt-1 text-[13px] font-medium leading-snug text-keyra-primary">{children}</dd>
    </div>
  );
}

function TelcoTable({
  telcos,
  onRequestAccess,
}: {
  telcos: PublicTelco[];
  onRequestAccess: (telco: PublicTelco) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-[var(--keyra-radius-md)] border border-keyra-border bg-keyra-bg">
      <table className="w-full min-w-[36rem] text-left text-sm">
        <thead>
          <tr className="border-b border-keyra-border bg-keyra-surface text-[10px] font-semibold uppercase tracking-[0.12em] text-keyra-text-2">
            <th className="px-3 py-2.5">Operator</th>
            <th className="px-3 py-2.5">Subscribers</th>
            <th className="px-3 py-2.5">Node</th>
            <th className="px-3 py-2.5">Official</th>
            <th className="px-3 py-2.5">Status</th>
            <th className="px-3 py-2.5 text-right">Access</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-keyra-border/80">
          {telcos.map((t) => (
            <tr key={t.id} className="align-middle transition-colors hover:bg-keyra-surface/60">
              <td className="px-3 py-3 text-[13px] font-semibold text-keyra-primary">{t.name}</td>
              <td className="px-3 py-3 tabular-nums text-[13px] text-keyra-text-2">
                {formatSubscribers(t.subscribersDisplay, t.subscribers)}
              </td>
              <td className="px-3 py-3 font-mono text-[11px] text-keyra-text-2">{t.telcoSubdomain}</td>
              <td className="px-3 py-3">
                <OfficialDomainLink href={t.officialDomain} />
              </td>
              <td className="px-3 py-3">
                <StatusBadge status={t.status} compact />
              </td>
              <td className="px-3 py-3 text-right">
                <Button type="button" variant="ghost" size="sm" onClick={() => onRequestAccess(t)}>
                  Request access
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CountryCard({
  country,
  open,
  className,
  onToggle,
  onInspect,
  onRequestCountryAccess,
  onRequestTelcoAccess,
}: {
  country: PublicCountry;
  open: boolean;
  className?: string;
  onToggle: () => void;
  onInspect: () => void;
  onRequestCountryAccess: () => void;
  onRequestTelcoAccess: (telco: PublicTelco) => void;
}) {
  const operatorCount = country.telcos.length;

  return (
    <article
      className={cn(
        "keyra-card flex h-full flex-col overflow-hidden rounded-[var(--keyra-radius-lg)] border border-keyra-border bg-keyra-bg shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.03)] transition-shadow hover:shadow-[0_2px_4px_rgba(0,0,0,0.05),0_12px_32px_rgba(0,0,0,0.05)]",
        className,
      )}
    >
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--keyra-radius-md)] border border-keyra-border bg-keyra-surface text-xl"
            aria-hidden
          >
            {flagEmojiFromIso2(country.iso2)}
          </div>

          <button
            type="button"
            className="flex min-w-0 flex-1 items-start gap-2 text-left focus-visible:outline-none focus-visible:keyra-focus"
            aria-label={`Registry row: ${country.name}`}
            aria-expanded={open}
            onClick={onToggle}
          >
            <span className="min-w-0 flex-1">
              <span className="block text-base font-semibold tracking-tight text-keyra-primary sm:text-[17px]">
                {country.name}
              </span>
              <span className="mt-1 block text-[11px] text-keyra-text-2">
                {operatorCount} operator{operatorCount === 1 ? "" : "s"}
                {open ? " · collapse" : " · view operators"}
              </span>
            </span>
            <span
              className={`mt-0.5 shrink-0 text-xs text-keyra-text-2 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
              aria-hidden
            >
              ▾
            </span>
          </button>
        </div>

        <dl className="mt-4 grid grid-cols-1 gap-2">
          <MetaField label="Population">
            {formatPopulation(country.populationDisplay, country.population)}
          </MetaField>
          <MetaField label="Deployment node">
            <span className="font-mono text-[12px]">{country.countrySubdomain}</span>
          </MetaField>
          <MetaField label="Official reference">
            <OfficialDomainLink href={country.officialReferenceDomain} />
          </MetaField>
        </dl>
      </div>

      <div className="mt-auto flex flex-col gap-2.5 border-t border-keyra-border bg-keyra-surface/40 px-4 py-3">
        <StatusBadge status={country.status} compact />
        <div className="flex flex-wrap gap-1.5">
          <Button type="button" variant="ghost" size="sm" onClick={onInspect}>
            Map profile
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={onRequestCountryAccess}>
            Request access
          </Button>
        </div>
      </div>

      {open && country.telcos.length > 0 ? (
        <div className="border-t border-keyra-border bg-keyra-surface/30 px-4 pb-4 pt-3 sm:px-5">
          <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-keyra-text-2">
            Operator registry
          </p>
          <TelcoTable telcos={country.telcos} onRequestAccess={onRequestTelcoAccess} />
        </div>
      ) : null}

      {open && country.telcos.length === 0 ? (
        <div className="border-t border-keyra-border bg-keyra-surface/30 px-4 py-3 sm:px-5">
          <p className="text-[13px] text-keyra-text-2">No published operators for this market yet.</p>
        </div>
      ) : null}
    </article>
  );
}

function RegionBlock({
  region,
  expanded,
  onToggle,
  expandedCountryId,
  onToggleCountry,
  onInspectCountry,
  onRequestCountryAccess,
  onRequestTelcoAccess,
}: {
  region: PublicRegion;
  expanded: boolean;
  onToggle: () => void;
  expandedCountryId: string | null;
  onToggleCountry: (id: string) => void;
  onInspectCountry: (id: string) => void;
  onRequestCountryAccess: (country: PublicCountry) => void;
  onRequestTelcoAccess: (country: PublicCountry, telco: PublicTelco) => void;
}) {
  const marketCount = region.countries.length;

  return (
    <section className="overflow-hidden rounded-[var(--keyra-radius-lg)] border border-keyra-border bg-keyra-bg shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <button
        type="button"
        className="flex w-full flex-wrap items-end justify-between gap-3 px-4 py-4 text-left transition-colors hover:bg-keyra-surface/40 focus-visible:outline-none focus-visible:keyra-focus sm:px-5 sm:py-5"
        aria-expanded={expanded}
        aria-controls={`region-panel-${region.id}`}
        onClick={onToggle}
      >
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-keyra-text-2">
            UN M49 · {region.continentCode} / {region.subregionCode}
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-keyra-primary sm:text-2xl">{region.name}</h2>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <p className="rounded-full border border-keyra-border bg-keyra-surface/60 px-2.5 py-0.5 text-[11px] font-medium text-keyra-text-2">
            {marketCount} market{marketCount === 1 ? "" : "s"}
          </p>
          <span
            className={cn(
              "text-xs text-keyra-text-2 transition-transform duration-200",
              expanded ? "rotate-180" : "",
            )}
            aria-hidden
          >
            ▾
          </span>
        </div>
      </button>

      {expanded ? (
        <div
          id={`region-panel-${region.id}`}
          className="border-t border-keyra-border bg-keyra-surface/20 px-4 pb-4 pt-3 sm:px-5 sm:pb-5"
        >
          {region.countries.length === 0 ? (
            <p className="px-1 py-2 text-[13px] text-keyra-text-2">No countries assigned to this region in admin yet.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {region.countries.map((country) => {
                const open = expandedCountryId === country.id;
                return (
                  <CountryCard
                    key={country.id}
                    country={country}
                    open={open}
                    className={open ? "md:col-span-2 xl:col-span-3" : undefined}
                    onToggle={() => onToggleCountry(country.id)}
                    onInspect={() => onInspectCountry(country.id)}
                    onRequestCountryAccess={() => onRequestCountryAccess(country)}
                    onRequestTelcoAccess={(telco) => onRequestTelcoAccess(country, telco)}
                  />
                );
              })}
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}

export function DeploymentRegistry({
  regions,
  expandedCountryId,
  onToggleCountry,
  onInspectCountry,
  onRequestCountryAccess,
  onRequestTelcoAccess,
}: {
  regions: PublicRegion[];
  expandedCountryId: string | null;
  onToggleCountry: (id: string) => void;
  onInspectCountry: (id: string) => void;
  onRequestCountryAccess: (country: PublicCountry) => void;
  onRequestTelcoAccess: (country: PublicCountry, telco: PublicTelco) => void;
}) {
  const [expandedRegionIds, setExpandedRegionIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    if (!expandedCountryId) return;

    for (const region of regions) {
      if (region.countries.some((country) => country.id === expandedCountryId)) {
        setExpandedRegionIds((current) => {
          if (current.has(region.id)) return current;
          const next = new Set(current);
          next.add(region.id);
          return next;
        });
        break;
      }
    }
  }, [expandedCountryId, regions]);

  const toggleRegion = (regionId: string) => {
    setExpandedRegionIds((current) => {
      const next = new Set(current);
      if (next.has(regionId)) {
        next.delete(regionId);
      } else {
        next.add(regionId);
      }
      return next;
    });
  };

  return (
    <div className="space-y-8">
      <div className="max-w-3xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-keyra-text-2">Admin registry</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-keyra-primary sm:text-3xl">
          Regional deployment records
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-keyra-text-2">
          Pulled live from Keyra admin regions and countries — select a region to review its assigned countries, then
          expand a market card for carrier-level detail.
        </p>
      </div>

      <div className="space-y-3">
        {regions.map((region) => (
          <RegionBlock
            key={region.id}
            region={region}
            expanded={expandedRegionIds.has(region.id)}
            onToggle={() => toggleRegion(region.id)}
            expandedCountryId={expandedCountryId}
            onToggleCountry={onToggleCountry}
            onInspectCountry={onInspectCountry}
            onRequestCountryAccess={onRequestCountryAccess}
            onRequestTelcoAccess={onRequestTelcoAccess}
          />
        ))}
      </div>
    </div>
  );
}
