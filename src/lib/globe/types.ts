/** Event pool entry for globe verification pulses (simsecure-compatible). */
export type GlobePulseEvent = {
  id: string;
  country?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  sourceLat?: number;
  sourceLng?: number;
  sourceLon?: number;
  roaming?: boolean;
  authType?: string;
  satModule?: string;
  protocolCode?: string;
  homeCountry?: string;
};

export type GlobePulse = {
  id: string;
  lat: number;
  lon: number;
  color: string;
  startedAt: number;
  batchStartedAt?: number;
  awayFromHome?: boolean;
  homeLat?: number;
  homeLon?: number;
  homeDistanceDeg?: number;
  homeLabel?: string;
  city?: string;
};

export type GlobePulseLink = {
  id: string;
  fromId: string;
  toId: string | null;
  fromLat: number;
  fromLon: number;
  toLat: number;
  toLon: number;
  color: string;
  startedAt: number;
  isRoamingHome?: boolean;
  homeDistanceDeg?: number;
};
