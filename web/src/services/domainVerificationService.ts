/**
 * Domain verification against Ciright Core organization registry.
 *
 * TODO: Implement GET/POST against Ciright Core domain inventory when endpoint exists.
 */

import { isCirightCoreConfigured } from "@/services/cirightCoreClient";

export type DomainLookupResult = {
  /** True when Core reports this domain already tied to an organization */
  existsInCore: boolean;
};

export async function lookupDomainInCore(domain: string): Promise<DomainLookupResult> {
  const normalized = domain.trim().toLowerCase();
  if (!normalized) return { existsInCore: false };

  if (!isCirightCoreConfigured()) {
    // Safe default when Core unavailable — registration proceeds; ops verifies manually.
    return { existsInCore: false };
  }

  // TODO: cirightCorePostJson('/api/v1/domains/lookup', { domain: normalized })
  void normalized;
  return { existsInCore: false };
}
