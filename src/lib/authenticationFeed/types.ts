/** Minimal record returned to the browser (no raw weight tables). */
export type LatestAuthRecord = {
  t: string;
  c: string;
  r: string;
  p: string;
  pl: string;
  m: string;
  hr: "H" | "R";
  x: string;
  st: string;
};

export type FeedCountryInput = {
  id: string;
  iso2: string;
  countryName: string;
  region: string;
  active: boolean;
  /** Present on rows from `toFeedCountryInputs`; feed generator treats false as excluded before mapping. */
  authenticationEnabled?: boolean;
  percentageWeight: number;
};

export type FeedProtocolInput = {
  id: string;
  protocolCode: string;
  protocolName: string;
  protocolCategory: string;
  active: boolean;
  /** Registry / admin weighting; Latest authentications picks uniformly among active protocols (not by this field). */
  percentageWeight: number;
  homePercentage: number;
  roamingPercentage: number;
};
