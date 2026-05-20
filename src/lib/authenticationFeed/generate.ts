import { randomBytes } from "node:crypto";
import type { FeedCountryInput, FeedProtocolInput, LatestAuthRecord } from "@/lib/authenticationFeed/types";
import { nextMaskedReference } from "@/lib/authenticationFeed/mask";
import { normalizeActiveWeights, weightedPickById } from "@/lib/authenticationFeed/weights";

function pickUniform<T>(items: T[], random: () => number): T {
  return items[Math.floor(random() * items.length)]!;
}

function makeRng(): () => number {
  return () => randomBytes(4).readUInt32BE(0) / 0xffff_ffff;
}

function balanceHomeRoaming(protocol: FeedProtocolInput, random: () => number): "H" | "R" {
  const h = Math.max(0, protocol.homePercentage);
  const ro = Math.max(0, protocol.roamingPercentage);
  const t = h + ro;
  if (t <= 0) return random() < 0.5 ? "H" : "R";
  return random() < h / t ? "H" : "R";
}

const STATUSES = ["Verified", "Authenticated", "Trusted"] as const;

export function generateLatestAuthBatch(params: {
  countries: FeedCountryInput[];
  protocols: FeedProtocolInput[];
  limit: number;
  uniquenessLimit: number;
  maskingEnabled: boolean;
  pairsUsed: Set<string>;
}): { records: LatestAuthRecord[]; pairKeysAdded: string[]; poolResetCount: number } {
  const random = makeRng();
  const activeCountries = params.countries.filter(
    (c) =>
      c.active &&
      /* Mapper passes explicit false when AUTH is off; undefined treats as eligible for backwards compat */
      (c.authenticationEnabled === undefined || c.authenticationEnabled),
  );
  // Protocols: only `active` rows; session/batch should use `toFeedProtocolInputs`.
  const activeProtocols = params.protocols.filter((p) => p.active);
  if (!activeCountries.length || !activeProtocols.length) {
    return { records: [], pairKeysAdded: [], poolResetCount: 0 };
  }

  const cw = normalizeActiveWeights(activeCountries);

  const records: LatestAuthRecord[] = [];
  const pairKeysAdded: string[] = [];
  let poolResetCount = 0;

  for (let i = 0; i < params.limit; i++) {
    let placed = false;
    for (let attempt = 0; attempt < 80 && !placed; attempt++) {
      if (params.pairsUsed.size >= params.uniquenessLimit) {
        params.pairsUsed.clear();
        poolResetCount += 1;
      }

      const country = weightedPickById(activeCountries, cw, random);
      const protocol = pickUniform(activeProtocols, random);
      const pairKey = `${country.iso2.toUpperCase()}:${protocol.protocolCode}`;

      if (params.pairsUsed.size < params.uniquenessLimit && params.pairsUsed.has(pairKey)) {
        continue;
      }

      params.pairsUsed.add(pairKey);
      pairKeysAdded.push(pairKey);

      const hr = balanceHomeRoaming(protocol, random);
      const ts = new Date(Date.now() - Math.floor(random() * 120_000)).toISOString();
      const st = STATUSES[Math.floor(random() * STATUSES.length)]!;
      const x = params.maskingEnabled ? nextMaskedReference(random) : `REF-${pairKey}-${i}`;

      records.push({
        t: ts,
        c: country.countryName,
        r: country.region,
        p: protocol.protocolName,
        pl: protocol.protocolCode,
        m: "SAT-MFA",
        hr,
        x,
        st,
      });
      placed = true;
    }
  }

  return { records, pairKeysAdded, poolResetCount };
}
