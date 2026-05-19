import {
  Continent,
  EventTier,
  GeopoliticalRegion,
  Industry,
  PrismaClient,
  SatCoreProblem,
  VerificationStatus,
} from "@prisma/client";
import { computeKeyraPriorityScore } from "../src/lib/scoring";

const prisma = new PrismaClient();

type SeedEvent = {
  slug: string;
  name: string;
  parentEventBrand?: string;
  geopoliticalRegion: GeopoliticalRegion;
  continent: Continent;
  country: string;
  city: string;
  venue?: string;
  start: string;
  end: string;
  yearsRunning?: number;
  attendees?: number;
  exhibitors?: number;
  speakers?: number;
  gov?: boolean;
  carrier?: boolean;
  bank?: boolean;
  dev?: boolean;
  cybersecurityRelevance: number;
  identityRelevance: number;
  telecomRelevance: number;
  aiRelevance: number;
  appSecurityRelevance: number;
  governmentRelevance: number;
  bankingRelevance: number;
  industries: Industry[];
  satCoreProblems: SatCoreProblem[];
  summary: string;
  whyItMatters: string;
  whoAttends: string;
  problemKeyraSolves: string;
  satCoreAlignment: string;
  recommendedAction: string;
  targetMeetingType: string;
  targetMeetingList: string;
  eventWebsite?: string;
  sourceUrl?: string;
  tier: EventTier;
  featured?: boolean;
  keyraOwner?: string;
};

function score(e: Omit<SeedEvent, "start" | "end"> & { attendees?: number; yearsRunning?: number }) {
  return computeKeyraPriorityScore({
    identityRelevance: e.identityRelevance,
    telecomRelevance: e.telecomRelevance,
    bankingRelevance: e.bankingRelevance,
    governmentRelevance: e.governmentRelevance,
    appSecurityRelevance: e.appSecurityRelevance,
    estimatedAttendees: e.attendees ?? null,
    yearsRunning: e.yearsRunning ?? null,
  });
}

async function upsertEvent(data: SeedEvent) {
  const keyraPriorityScore = score(data);
  await prisma.event.upsert({
    where: { slug: data.slug },
    create: {
      slug: data.slug,
      name: data.name,
      parentEventBrand: data.parentEventBrand,
      geopoliticalRegion: data.geopoliticalRegion,
      continent: data.continent,
      country: data.country,
      city: data.city,
      venue: data.venue,
      startDate: new Date(data.start),
      endDate: new Date(data.end),
      yearsRunning: data.yearsRunning,
      estimatedAttendees: data.attendees,
      estimatedExhibitors: data.exhibitors,
      estimatedSpeakers: data.speakers,
      governmentAttendance: data.gov ?? false,
      carrierAttendance: data.carrier ?? false,
      bankingFintechAttendance: data.bank ?? false,
      developerAttendance: data.dev ?? false,
      cybersecurityRelevance: data.cybersecurityRelevance,
      identityRelevance: data.identityRelevance,
      telecomRelevance: data.telecomRelevance,
      aiRelevance: data.aiRelevance,
      appSecurityRelevance: data.appSecurityRelevance,
      governmentRelevance: data.governmentRelevance,
      bankingRelevance: data.bankingRelevance,
      keyraPriorityScore,
      summary: data.summary,
      whyItMatters: data.whyItMatters,
      whoAttends: data.whoAttends,
      problemKeyraSolves: data.problemKeyraSolves,
      satCoreAlignment: data.satCoreAlignment,
      recommendedAction: data.recommendedAction,
      targetMeetingType: data.targetMeetingType,
      targetMeetingList: data.targetMeetingList,
      eventWebsite: data.eventWebsite,
      sourceUrl: data.sourceUrl,
      verificationStatus: VerificationStatus.PARTIAL,
      tier: data.tier,
      approvedPublic: true,
      featured: data.featured ?? false,
      keyraOwner: data.keyraOwner ?? "Keyra field intelligence",
      industries: {
        create: data.industries.map((industry) => ({ industry })),
      },
      satCoreProblems: {
        create: data.satCoreProblems.map((problem) => ({ problem })),
      },
    },
    update: {
      name: data.name,
      parentEventBrand: data.parentEventBrand,
      geopoliticalRegion: data.geopoliticalRegion,
      continent: data.continent,
      country: data.country,
      city: data.city,
      venue: data.venue,
      startDate: new Date(data.start),
      endDate: new Date(data.end),
      yearsRunning: data.yearsRunning,
      estimatedAttendees: data.attendees,
      estimatedExhibitors: data.exhibitors,
      estimatedSpeakers: data.speakers,
      governmentAttendance: data.gov ?? false,
      carrierAttendance: data.carrier ?? false,
      bankingFintechAttendance: data.bank ?? false,
      developerAttendance: data.dev ?? false,
      cybersecurityRelevance: data.cybersecurityRelevance,
      identityRelevance: data.identityRelevance,
      telecomRelevance: data.telecomRelevance,
      aiRelevance: data.aiRelevance,
      appSecurityRelevance: data.appSecurityRelevance,
      governmentRelevance: data.governmentRelevance,
      bankingRelevance: data.bankingRelevance,
      keyraPriorityScore,
      summary: data.summary,
      whyItMatters: data.whyItMatters,
      whoAttends: data.whoAttends,
      problemKeyraSolves: data.problemKeyraSolves,
      satCoreAlignment: data.satCoreAlignment,
      recommendedAction: data.recommendedAction,
      targetMeetingType: data.targetMeetingType,
      targetMeetingList: data.targetMeetingList,
      eventWebsite: data.eventWebsite,
      sourceUrl: data.sourceUrl,
      tier: data.tier,
      featured: data.featured ?? false,
      keyraOwner: data.keyraOwner ?? "Keyra field intelligence",
      industries: {
        deleteMany: {},
        create: data.industries.map((industry) => ({ industry })),
      },
      satCoreProblems: {
        deleteMany: {},
        create: data.satCoreProblems.map((problem) => ({ problem })),
      },
    },
  });
}

const tier1: SeedEvent[] = [
  {
    slug: "mwc-barcelona-2026",
    name: "MWC Barcelona",
    parentEventBrand: "MWC / GSMA",
    geopoliticalRegion: GeopoliticalRegion.WESTERN_EUROPE,
    continent: Continent.EUROPE,
    country: "Spain",
    city: "Barcelona",
    venue: "Fira Barcelona Gran Via",
    start: "2026-03-02",
    end: "2026-03-05",
    yearsRunning: 30,
    attendees: 105000,
    exhibitors: 2900,
    speakers: 1700,
    gov: true,
    carrier: true,
    bank: true,
    dev: true,
    cybersecurityRelevance: 78,
    identityRelevance: 72,
    telecomRelevance: 98,
    aiRelevance: 92,
    appSecurityRelevance: 65,
    governmentRelevance: 70,
    bankingRelevance: 68,
    industries: [
      Industry.TELECOM,
      Industry.MOBILE_INFRASTRUCTURE,
      Industry.AI,
      Industry.CYBERSECURITY,
      Industry.FINTECH,
    ],
    satCoreProblems: [
      SatCoreProblem.TELECOM_SUBSCRIBER_VERIFICATION,
      SatCoreProblem.DEVICE_TRUST,
      SatCoreProblem.ROAMING_AUTHENTICATION,
      SatCoreProblem.ACCOUNT_TAKEOVER,
    ],
    summary:
      "Global telecom and digital infrastructure flagship where carriers, vendors, and policymakers align on connectivity, AI, and trusted subscriber relationships.",
    whyItMatters:
      "Decision velocity at MWC shapes roaming trust, device binding, and how carriers monetize secure identity adjacent to 5G and enterprise services.",
    whoAttends:
      "Carrier leadership, handset OEMs, hyperscalers, national regulators, banks partnering on telco identity, and major enterprise buyers.",
    problemKeyraSolves:
      "SAT-Core strengthens subscriber verification, binds devices and SIM risk signals, and reduces account takeover across telco-led authentication journeys.",
    satCoreAlignment:
      "SIM/device binding, telecom-backed authentication, roaming confidence layers, and fraud signals aligned to carrier-grade uptime.",
    recommendedAction:
      "Executive briefings with carrier identity architects; sponsor-tier visibility around trusted access pavilion circuits.",
    targetMeetingType: "Sponsor / Speak / Carrier Workshop",
    targetMeetingList:
      "Group CTO office · wholesale roaming · fraud operations · enterprise MVNO partners · digital identity labs",
    tier: EventTier.TIER_1,
    featured: true,
  },
  {
    slug: "rsac-san-francisco-2026",
    name: "RSA Conference San Francisco",
    parentEventBrand: "RSA Conference",
    geopoliticalRegion: GeopoliticalRegion.NORTH_AMERICA,
    continent: Continent.NORTH_AMERICA,
    country: "United States",
    city: "San Francisco",
    venue: "Moscone Center",
    start: "2026-03-23",
    end: "2026-03-26",
    yearsRunning: 33,
    attendees: 45000,
    gov: true,
    carrier: true,
    bank: true,
    dev: true,
    cybersecurityRelevance: 98,
    identityRelevance: 88,
    telecomRelevance: 62,
    aiRelevance: 74,
    appSecurityRelevance: 86,
    governmentRelevance: 72,
    bankingRelevance: 68,
    industries: [
      Industry.CYBERSECURITY,
      Industry.DIGITAL_IDENTITY,
      Industry.APP_SECURITY,
      Industry.BANKING,
      Industry.CRITICAL_INFRASTRUCTURE,
    ],
    satCoreProblems: [
      SatCoreProblem.ZERO_TRUST,
      SatCoreProblem.ACCOUNT_TAKEOVER,
      SatCoreProblem.WEAK_MFA,
      SatCoreProblem.PASSWORDLESS_AUTHENTICATION,
      SatCoreProblem.SIM_SWAP,
    ],
    summary:
      "North America's flagship cybersecurity leadership forum spanning strategy, product, and incident response ecosystems.",
    whyItMatters:
      "Where global CISO agendas are validated — identity becomes the spine for zero trust, fraud resistance, and privileged access modernization.",
    whoAttends:
      "Fortune CISOs, identity vendors, MSSPs, federal cyber leadership, major banks, and platform security owners.",
    problemKeyraSolves:
      "Demonstrates SIM-backed assurance, device trust telemetry, and phishing-resistant authentication pathways beyond bolt-on MFA.",
    satCoreAlignment:
      "ATO prevention, SIM swap resilience, passwordless orchestration, enterprise IAM complexity reduction.",
    recommendedAction:
      "Tier-1 executive meetings plus technical deep dives with identity engineering leads.",
    targetMeetingType: "Private Dinner / Sponsor",
    targetMeetingList:
      "Global bank CISO forums · telco security alliances · IAM leadership councils · fraud fusion cells",
    tier: EventTier.TIER_1,
    featured: true,
  },
  {
    slug: "black-hat-usa-2026",
    name: "Black Hat USA",
    parentEventBrand: "Black Hat",
    geopoliticalRegion: GeopoliticalRegion.NORTH_AMERICA,
    continent: Continent.NORTH_AMERICA,
    country: "United States",
    city: "Las Vegas",
    start: "2026-08-01",
    end: "2026-08-06",
    yearsRunning: 28,
    attendees: 20000,
    dev: true,
    cybersecurityRelevance: 99,
    identityRelevance: 70,
    telecomRelevance: 55,
    aiRelevance: 66,
    appSecurityRelevance: 92,
    governmentRelevance: 58,
    bankingRelevance: 55,
    industries: [Industry.CYBERSECURITY, Industry.APP_SECURITY, Industry.DEVELOPER_PLATFORMS],
    satCoreProblems: [
      SatCoreProblem.APP_FRAUD,
      SatCoreProblem.ACCOUNT_TAKEOVER,
      SatCoreProblem.DEVELOPER_AUTHENTICATION,
      SatCoreProblem.DEVICE_TRUST,
    ],
    summary:
      "Premier offensive security and applied research venue influencing how enterprises harden application stacks.",
    whyItMatters:
      "Technical proof points landed here ripple into banking app controls, telco APIs, and bot-resistant onboarding.",
    whoAttends:
      "Elite researchers, red teams, product security leaders, and vendors validating exploit-resistant architectures.",
    problemKeyraSolves:
      "Ground-truth for SIM/device-bound authentication efficacy vs synthetic identity and credential stuffing.",
    satCoreAlignment:
      "App login fraud resistance, device integrity telemetry, developer burden reduction for secure auth SDKs.",
    recommendedAction:
      "Hands-on sessions with appsec leads; co-authored briefings on subscriber-bound authentication.",
    targetMeetingType: "Attend / Speak",
    targetMeetingList: "AppSec directors · mobile banking security · API gateway owners",
    tier: EventTier.TIER_1,
    featured: true,
  },
  {
    slug: "identiverse-2026",
    name: "Identiverse",
    parentEventBrand: "Identiverse",
    geopoliticalRegion: GeopoliticalRegion.NORTH_AMERICA,
    continent: Continent.NORTH_AMERICA,
    country: "United States",
    city: "Las Vegas",
    start: "2026-06-15",
    end: "2026-06-18",
    yearsRunning: 15,
    attendees: 2500,
    bank: true,
    gov: true,
    dev: true,
    cybersecurityRelevance: 78,
    identityRelevance: 99,
    telecomRelevance: 58,
    aiRelevance: 72,
    appSecurityRelevance: 76,
    governmentRelevance: 68,
    bankingRelevance: 74,
    industries: [
      Industry.DIGITAL_IDENTITY,
      Industry.CYBERSECURITY,
      Industry.BANKING,
      Industry.DIGITAL_GOVERNMENT,
    ],
    satCoreProblems: [
      SatCoreProblem.PASSWORDLESS_AUTHENTICATION,
      SatCoreProblem.ZERO_TRUST,
      SatCoreProblem.WEAK_MFA,
      SatCoreProblem.GOVERNMENT_ACCESS,
    ],
    summary:
      "Identity, IAM, authentication, and zero trust converge for practitioners shipping modern access stacks.",
    whyItMatters:
      "Design partners for passwordless, verified pathways — ideal narrative fit for SAT-Core assurance.",
    whoAttends:
      "IAM executives, CIAM owners, authentication vendors, bank identity architects, public-sector identity programs.",
    problemKeyraSolves:
      "Shows how telco-grade subscriber verification completes CIAM journeys without UX regression.",
    satCoreAlignment:
      "Phishing-resistant MFA, SIM swap mitigation, citizen-grade assurance extensions.",
    recommendedAction:
      "Executive IAM briefings and SI/partner enablement sessions.",
    targetMeetingType: "Sponsor / Speak",
    targetMeetingList: "Fortune 500 IAM leaders · federal ICAM teams · CIAM platform owners",
    tier: EventTier.TIER_1,
    featured: true,
  },
  {
    slug: "gartner-security-risk-national-harbor-2026",
    name: "Gartner Security & Risk Management Summit",
    parentEventBrand: "Gartner",
    geopoliticalRegion: GeopoliticalRegion.NORTH_AMERICA,
    continent: Continent.NORTH_AMERICA,
    country: "United States",
    city: "National Harbor",
    venue: "Gaylord National Resort",
    start: "2026-06-01",
    end: "2026-06-03",
    attendees: 4000,
    bank: true,
    gov: true,
    cybersecurityRelevance: 90,
    identityRelevance: 75,
    telecomRelevance: 48,
    aiRelevance: 62,
    appSecurityRelevance: 68,
    governmentRelevance: 72,
    bankingRelevance: 70,
    industries: [
      Industry.CYBERSECURITY,
      Industry.BANKING,
      Industry.DIGITAL_GOVERNMENT,
      Industry.CRITICAL_INFRASTRUCTURE,
    ],
    satCoreProblems: [
      SatCoreProblem.ZERO_TRUST,
      SatCoreProblem.ACCOUNT_TAKEOVER,
      SatCoreProblem.BANKING_FRAUD,
      SatCoreProblem.GOVERNMENT_ACCESS,
    ],
    summary:
      "CISO-centric benchmark event where risk appetite, vendor consolidation, and regulatory posture are decided.",
    whyItMatters:
      "Budget holders prioritize resilient authentication as cyber risk enters board-grade scrutiny.",
    whoAttends:
      "Enterprise security leadership, risk executives, government technology buyers, large bank CSOs.",
    problemKeyraSolves:
      "Positions SAT-Core inside zero-trust roadmaps as measurable SIM/device assurance.",
    satCoreAlignment:
      "Fraud operations alignment, privileged access modernization, national infrastructure login resilience.",
    recommendedAction:
      "1:1 meetings booked via analyst introductions and executive hospitality.",
    targetMeetingType: "Private Dinner",
    targetMeetingList: "Fortune 500 CISOs · federal CISO community · top-tier bank risk committees",
    tier: EventTier.TIER_1,
    featured: false,
  },
  {
    slug: "gitex-global-dubai-2026",
    name: "GITEX Global",
    parentEventBrand: "GITEX",
    geopoliticalRegion: GeopoliticalRegion.MIDDLE_EAST_GCC,
    continent: Continent.MIDDLE_EAST,
    country: "United Arab Emirates",
    city: "Dubai",
    start: "2026-12-07",
    end: "2026-12-11",
    attendees: 170000,
    gov: true,
    carrier: true,
    bank: true,
    dev: true,
    cybersecurityRelevance: 82,
    identityRelevance: 76,
    telecomRelevance: 88,
    aiRelevance: 94,
    appSecurityRelevance: 70,
    governmentRelevance: 88,
    bankingRelevance: 78,
    industries: [
      Industry.DIGITAL_GOVERNMENT,
      Industry.TELECOM,
      Industry.AI,
      Industry.FINTECH,
      Industry.SMART_CITIES,
    ],
    satCoreProblems: [
      SatCoreProblem.GOVERNMENT_ACCESS,
      SatCoreProblem.TELECOM_SUBSCRIBER_VERIFICATION,
      SatCoreProblem.ACCOUNT_TAKEOVER,
      SatCoreProblem.AI_AGENT_IDENTITY,
    ],
    summary:
      "GCC mega-platform spanning AI, cyber resilience, smart cities, and sovereign digital capability investments.",
    whyItMatters:
      "National-scale buyers prioritize trusted identity layers aligned with carrier ecosystems.",
    whoAttends:
      "Government ministers, national carriers, sovereign cloud programs, banks, and hyperscaler partners.",
    problemKeyraSolves:
      "SAT-Core maps to national trust anchors, carrier-led onboarding, and fraud-resistant citizen services.",
    satCoreAlignment:
      "Sovereign identity, telco monetization of trust APIs, smart-city secure access.",
    recommendedAction:
      "National stakeholder workshops plus flagship pavilion storytelling.",
    targetMeetingType: "Sponsor / Carrier Workshop",
    targetMeetingList:
      "UAE digital authority leadership · tier-1 GCC carriers · regional banking consortiums",
    tier: EventTier.TIER_1,
    featured: true,
  },
  {
    slug: "money2020-europe-2026",
    name: "Money20/20 Europe",
    parentEventBrand: "Money20/20",
    geopoliticalRegion: GeopoliticalRegion.WESTERN_EUROPE,
    continent: Continent.EUROPE,
    country: "Netherlands",
    city: "Amsterdam",
    start: "2026-06-03",
    end: "2026-06-05",
    attendees: 9000,
    bank: true,
    carrier: true,
    cybersecurityRelevance: 62,
    identityRelevance: 78,
    telecomRelevance: 58,
    aiRelevance: 74,
    appSecurityRelevance: 66,
    governmentRelevance: 52,
    bankingRelevance: 95,
    industries: [Industry.FINTECH, Industry.PAYMENTS, Industry.BANKING, Industry.DIGITAL_IDENTITY],
    satCoreProblems: [
      SatCoreProblem.BANKING_FRAUD,
      SatCoreProblem.APP_FRAUD,
      SatCoreProblem.ACCOUNT_TAKEOVER,
      SatCoreProblem.DEVICE_TRUST,
    ],
    summary:
      "European payments and banking innovation nerve center with dense fintech-buyer traffic.",
    whyItMatters:
      "SCA, delegated authentication, and instant payments amplify demand for carrier-grade assurance.",
    whoAttends:
      "Bank innovation labs, scheme networks, merchant platforms, regulatory observers, fraud executives.",
    problemKeyraSolves:
      "Illustrates SIM-bound proofing for step-up auth without breaking UX across EU wallets.",
    satCoreAlignment:
      "PSD2/SCA modernization, push-payment fraud, synthetic identity resistance.",
    recommendedAction:
      "Curated banking roundtables and fraud consortium introductions.",
    targetMeetingType: "Sponsor / Speak",
    targetMeetingList:
      "Tier-1 EU banks · BNPL platforms · scheme-led identity pilots · telco financial services units",
    tier: EventTier.TIER_1,
    featured: true,
  },
  {
    slug: "money2020-middle-east-2026",
    name: "Money20/20 Middle East",
    parentEventBrand: "Money20/20",
    geopoliticalRegion: GeopoliticalRegion.MIDDLE_EAST_GCC,
    continent: Continent.MIDDLE_EAST,
    country: "Saudi Arabia",
    city: "Riyadh",
    start: "2026-09-14",
    end: "2026-09-16",
    attendees: 4500,
    bank: true,
    gov: true,
    cybersecurityRelevance: 58,
    identityRelevance: 72,
    telecomRelevance: 76,
    aiRelevance: 68,
    appSecurityRelevance: 60,
    governmentRelevance: 82,
    bankingRelevance: 90,
    industries: [Industry.FINTECH, Industry.BANKING, Industry.DIGITAL_GOVERNMENT, Industry.TELECOM],
    satCoreProblems: [
      SatCoreProblem.BANKING_FRAUD,
      SatCoreProblem.GOVERNMENT_ACCESS,
      SatCoreProblem.TELECOM_SUBSCRIBER_VERIFICATION,
    ],
    summary:
      "Rising GCC payments summit pairing sovereign modernization with mobile-first financial services.",
    whyItMatters:
      "Carrier attestation becomes strategic as digital wallets scale across youthful, mobile-native economies.",
    whoAttends:
      "Central bank innovators, digital banks, telco financial units, government transformation offices.",
    problemKeyraSolves:
      "SAT-Core bridges telco signals with bank-grade authentication for cross-border confidence.",
    satCoreAlignment:
      "National payments stacks, super-app onboarding, fraud fusion between carriers and banks.",
    recommendedAction:
      "Structured workshops with SAMA-adjacent programs and tier-1 GCC carriers.",
    targetMeetingType: "Private Dinner",
    targetMeetingList: "Digital bank CEOs · MNO financial services · regulatory sandbox leads",
    tier: EventTier.TIER_1,
    featured: false,
  },
  {
    slug: "web-summit-lisbon-2026",
    name: "Web Summit Lisbon",
    parentEventBrand: "Web Summit",
    geopoliticalRegion: GeopoliticalRegion.WESTERN_EUROPE,
    continent: Continent.EUROPE,
    country: "Portugal",
    city: "Lisbon",
    start: "2026-11-09",
    end: "2026-11-12",
    attendees: 70000,
    dev: true,
    bank: true,
    cybersecurityRelevance: 55,
    identityRelevance: 62,
    telecomRelevance: 52,
    aiRelevance: 88,
    appSecurityRelevance: 58,
    governmentRelevance: 48,
    bankingRelevance: 55,
    industries: [
      Industry.DEVELOPER_PLATFORMS,
      Industry.AI,
      Industry.FINTECH,
      Industry.TELECOM,
    ],
    satCoreProblems: [
      SatCoreProblem.DEVELOPER_AUTHENTICATION,
      SatCoreProblem.ACCOUNT_TAKEOVER,
      SatCoreProblem.AI_AGENT_IDENTITY,
    ],
    summary:
      "Global founder and investor magnet surfacing where platforms experiment with trust UX.",
    whyItMatters:
      "Early signals on AI agents, consumer apps, and developer-led adoption loops.",
    whoAttends:
      "Startup CEOs, platform teams, investors, developer ecosystems, emerging enterprise buyers.",
    problemKeyraSolves:
      "Lightweight narrative on frictionless verified signup at massive consumer scale.",
    satCoreAlignment:
      "Developer authentication burden, bot resistance, AI-agent identity guardrails.",
    recommendedAction:
      "Office hours with platform CTOs; curated investor-facing trust storyline.",
    targetMeetingType: "Attend",
    targetMeetingList: "Consumer super-apps · EU scale-ups · venture catalyst programs",
    tier: EventTier.TIER_1,
    featured: true,
  },
  {
    slug: "vivatech-paris-2026",
    name: "VivaTech",
    parentEventBrand: "Viva Technology",
    geopoliticalRegion: GeopoliticalRegion.WESTERN_EUROPE,
    continent: Continent.EUROPE,
    country: "France",
    city: "Paris",
    start: "2026-06-17",
    end: "2026-06-20",
    attendees: 165000,
    gov: true,
    bank: true,
    dev: true,
    cybersecurityRelevance: 52,
    identityRelevance: 58,
    telecomRelevance: 62,
    aiRelevance: 92,
    appSecurityRelevance: 55,
    governmentRelevance: 58,
    bankingRelevance: 62,
    industries: [Industry.AI, Industry.FINTECH, Industry.SMART_CITIES, Industry.TELECOM],
    satCoreProblems: [
      SatCoreProblem.AI_AGENT_IDENTITY,
      SatCoreProblem.ACCOUNT_TAKEOVER,
      SatCoreProblem.BANKING_FRAUD,
    ],
    summary:
      "France's flagship innovation expo tying corporates, startups, and policy around emerging tech.",
    whyItMatters:
      "EU-facing narrative anchor pairing AI adoption with regulated digital trust expectations.",
    whoAttends:
      "Corporate venture arms, EU policymakers, banks, telecom labs, AI founders.",
    problemKeyraSolves:
      "Humanizes SAT-Core as the pragmatic assurance substrate beneath AI copilots.",
    satCoreAlignment:
      "Agent identity risk, enterprise IAM experimentation, cross-border fintech demos.",
    recommendedAction:
      "Hosted breakfasts with bank innovation leads and telco venture scouts.",
    targetMeetingType: "Sponsor / Speak",
    targetMeetingList: "Bpifrance ecosystem · EU telco labs · French banking modernization clubs",
    tier: EventTier.TIER_1,
    featured: false,
  },
  {
    slug: "identity-week-europe-2026",
    name: "Identity Week Europe",
    geopoliticalRegion: GeopoliticalRegion.WESTERN_EUROPE,
    continent: Continent.EUROPE,
    country: "Netherlands",
    city: "Amsterdam",
    start: "2026-06-09",
    end: "2026-06-10",
    attendees: 3500,
    bank: true,
    gov: true,
    cybersecurityRelevance: 62,
    identityRelevance: 96,
    telecomRelevance: 58,
    aiRelevance: 62,
    appSecurityRelevance: 58,
    governmentRelevance: 74,
    bankingRelevance: 76,
    industries: [
      Industry.DIGITAL_IDENTITY,
      Industry.BANKING,
      Industry.DIGITAL_GOVERNMENT,
      Industry.PAYMENTS,
    ],
    satCoreProblems: [
      SatCoreProblem.GOVERNMENT_ACCESS,
      SatCoreProblem.PASSWORDLESS_AUTHENTICATION,
      SatCoreProblem.BANKING_FRAUD,
      SatCoreProblem.WEAK_MFA,
    ],
    summary:
      "European convergence on wallets, biometrics, IAM modernization, and fraud convergence.",
    whyItMatters:
      "eIDAS-adjacent conversations tie closely to telco-backed citizen onboarding pilots.",
    whoAttends:
      "Government identity programs, bank IAM leads, wallet vendors, law enforcement liaisons.",
    problemKeyraSolves:
      "SAT-Core complements wallet issuance with live subscriber assurance from carriers.",
    satCoreAlignment:
      "EU digital identity interoperability, banking fraud, GDPR-aligned trusted access.",
    recommendedAction:
      "Technical interoperability demos alongside wallet consortium meetings.",
    targetMeetingType: "Speak / Sponsor",
    targetMeetingList: "EU wallet pilots · national digital ID offices · tier-1 EU fraud forums",
    tier: EventTier.TIER_1,
    featured: true,
  },
  {
    slug: "infosecurity-europe-2026",
    name: "Infosecurity Europe",
    geopoliticalRegion: GeopoliticalRegion.WESTERN_EUROPE,
    continent: Continent.EUROPE,
    country: "United Kingdom",
    city: "London",
    venue: "ExCeL London",
    start: "2026-06-02",
    end: "2026-06-04",
    attendees: 13000,
    bank: true,
    gov: true,
    dev: true,
    cybersecurityRelevance: 92,
    identityRelevance: 82,
    telecomRelevance: 54,
    aiRelevance: 68,
    appSecurityRelevance: 78,
    governmentRelevance: 72,
    bankingRelevance: 74,
    industries: [Industry.CYBERSECURITY, Industry.APP_SECURITY, Industry.BANKING],
    satCoreProblems: [
      SatCoreProblem.ACCOUNT_TAKEOVER,
      SatCoreProblem.ZERO_TRUST,
      SatCoreProblem.APP_FRAUD,
      SatCoreProblem.BANKING_FRAUD,
    ],
    summary:
      "UK & EU cybersecurity marketplace pairing expo floors with practitioner-led programs.",
    whyItMatters:
      "Dense concentration of European MSSPs, banking CSIRT leaders, and identity architects.",
    whoAttends:
      "SOC leaders, IAM directors, UK critical infrastructure operators, fintech security heads.",
    problemKeyraSolves:
      "Operational storytelling around phishing-resistant auth fused with telco verification.",
    satCoreAlignment:
      "Incident responders integrating subscriber telemetry into SOAR workflows.",
    recommendedAction:
      "Partner-led theatre sessions plus banking SOC executive tours.",
    targetMeetingType: "Sponsor",
    targetMeetingList: "UK banking SOC alliances · critical infrastructure CISOs · MSSP leadership",
    tier: EventTier.TIER_1,
    featured: false,
  },
  {
    slug: "owasp-global-appsec-eu-2026",
    name: "OWASP Global AppSec EU",
    parentEventBrand: "OWASP",
    geopoliticalRegion: GeopoliticalRegion.WESTERN_EUROPE,
    continent: Continent.EUROPE,
    country: "Austria",
    city: "Vienna",
    start: "2026-06-22",
    end: "2026-06-26",
    attendees: 900,
    dev: true,
    cybersecurityRelevance: 88,
    identityRelevance: 58,
    telecomRelevance: 42,
    aiRelevance: 54,
    appSecurityRelevance: 96,
    governmentRelevance: 42,
    bankingRelevance: 52,
    industries: [Industry.APP_SECURITY, Industry.CYBERSECURITY, Industry.DEVELOPER_PLATFORMS],
    satCoreProblems: [
      SatCoreProblem.APP_FRAUD,
      SatCoreProblem.DEVELOPER_AUTHENTICATION,
      SatCoreProblem.ACCOUNT_TAKEOVER,
    ],
    summary:
      "Deep practitioner forum advancing OWASP frameworks for resilient application security.",
    whyItMatters:
      "Ground-truth for securing APIs that underpin banking apps and telco digital channels.",
    whoAttends:
      "Application security engineers, DevSecOps owners, security champions inside product teams.",
    problemKeyraSolves:
      "Shows secure-by-design authentication hooks inside developer workflows.",
    satCoreAlignment:
      "API abuse resistance, secure mobile SDK adoption, bot mitigation.",
    recommendedAction:
      "Hands-on workshops + capture-the-flag adjacent demos.",
    targetMeetingType: "Speak / Attend",
    targetMeetingList: "Global bank appsec guilds · OWASP chapter leaders · DevSecOps tooling vendors",
    tier: EventTier.TIER_1,
    featured: false,
  },
  {
    slug: "telecoms-world-asia-2026",
    name: "Telecoms World Asia",
    geopoliticalRegion: GeopoliticalRegion.SOUTHEAST_ASIA,
    continent: Continent.ASIA,
    country: "Singapore",
    city: "Singapore",
    start: "2026-11-18",
    end: "2026-11-20",
    attendees: 2500,
    carrier: true,
    gov: true,
    bank: true,
    cybersecurityRelevance: 68,
    identityRelevance: 62,
    telecomRelevance: 96,
    aiRelevance: 72,
    appSecurityRelevance: 58,
    governmentRelevance: 66,
    bankingRelevance: 70,
    industries: [Industry.TELECOM, Industry.MOBILE_INFRASTRUCTURE, Industry.FINTECH],
    satCoreProblems: [
      SatCoreProblem.TELECOM_SUBSCRIBER_VERIFICATION,
      SatCoreProblem.ROAMING_AUTHENTICATION,
      SatCoreProblem.BANKING_FRAUD,
    ],
    summary:
      "Regional anchor for carrier CTO agendas across ASEAN roaming and digital services monetization.",
    whyItMatters:
      "Roaming trust and cross-border identity interoperability are explicit procurement themes.",
    whoAttends:
      "Group CTOs, wholesale heads, fraud executives from adjacent banking ecosystems.",
    problemKeyraSolves:
      "SAT-Core supports ASEAN interoperability pilots with telco-grade subscriber assurance.",
    satCoreAlignment:
      "Super-app identity, roaming verification APIs, fintech partnerships inside telcos.",
    recommendedAction:
      "Carrier workshop series plus bilateral meetings with Singapore regulator liaisons.",
    targetMeetingType: "Carrier Workshop",
    targetMeetingList:
      "Singtel ecosystem · regional group carriers · ASEAN banking mobility alliances",
    tier: EventTier.TIER_1,
    featured: true,
  },
  {
    slug: "govware-singapore-2026",
    name: "GovWare / Singapore International Cyber Week",
    geopoliticalRegion: GeopoliticalRegion.SOUTHEAST_ASIA,
    continent: Continent.ASIA,
    country: "Singapore",
    city: "Singapore",
    start: "2026-10-13",
    end: "2026-10-17",
    attendees: 6000,
    gov: true,
    bank: true,
    cybersecurityRelevance: 90,
    identityRelevance: 74,
    telecomRelevance: 78,
    aiRelevance: 76,
    appSecurityRelevance: 72,
    governmentRelevance: 92,
    bankingRelevance: 72,
    industries: [
      Industry.DIGITAL_GOVERNMENT,
      Industry.CYBERSECURITY,
      Industry.CRITICAL_INFRASTRUCTURE,
      Industry.TELECOM,
    ],
    satCoreProblems: [
      SatCoreProblem.GOVERNMENT_ACCESS,
      SatCoreProblem.ZERO_TRUST,
      SatCoreProblem.ACCOUNT_TAKEOVER,
      SatCoreProblem.TELECOM_SUBSCRIBER_VERIFICATION,
    ],
    summary:
      "Asia-Pacific cyber week tying national resilience investments with vendor ecosystems.",
    whyItMatters:
      "Singapore anchors trusted digital infrastructure narratives across ASEAN neighbors.",
    whoAttends:
      "Government CISOs, national CERT teams, carrier security heads, critical infrastructure owners.",
    problemKeyraSolves:
      "National-grade authentication blending citizen services with carrier telemetry.",
    satCoreAlignment:
      "Critical infrastructure login protection, sovereign SOC integrations.",
    recommendedAction:
      "Ministry-level briefings alongside CSA-facing partner moments.",
    targetMeetingType: "Private Dinner",
    targetMeetingList:
      "Singapore CSA adjacent forums · ASEAN cyber agency delegations · GSIS operators",
    tier: EventTier.TIER_1,
    featured: false,
  },
  {
    slug: "africacom-2026",
    name: "AfricaCom",
    geopoliticalRegion: GeopoliticalRegion.AFRICA,
    continent: Continent.AFRICA,
    country: "South Africa",
    city: "Cape Town",
    start: "2026-11-11",
    end: "2026-11-13",
    attendees: 14000,
    carrier: true,
    bank: true,
    gov: true,
    cybersecurityRelevance: 62,
    identityRelevance: 58,
    telecomRelevance: 94,
    aiRelevance: 62,
    appSecurityRelevance: 52,
    governmentRelevance: 72,
    bankingRelevance: 78,
    industries: [
      Industry.TELECOM,
      Industry.MOBILE_INFRASTRUCTURE,
      Industry.FINTECH,
      Industry.PAYMENTS,
    ],
    satCoreProblems: [
      SatCoreProblem.TELECOM_SUBSCRIBER_VERIFICATION,
      SatCoreProblem.BANKING_FRAUD,
      SatCoreProblem.ACCOUNT_TAKEOVER,
    ],
    summary:
      "Continental telecom summit intersecting mobile money, spectrum policy, and national digitization.",
    whyItMatters:
      "Mobile-money fraud and SIM identity directly intersect SAT-Core proof points.",
    whoAttends:
      "MNO CEOs, mobile money operators, central bank observers, government broadband offices.",
    problemKeyraSolves:
      "Carrier-grade SIM assurance underpins cross-border remittance trust.",
    satCoreAlignment:
      "SIM identity, telco revenue protection, citizen wallet onboarding.",
    recommendedAction:
      "Regional carrier VIP dinners plus banking partnerships forged via GSMA adjacency.",
    targetMeetingType: "Sponsor / Speak",
    targetMeetingList:
      "MTN / Vodacom innovation circles · African banking mobility alliances · regulators",
    tier: EventTier.TIER_1,
    featured: true,
  },
  {
    slug: "web-summit-rio-2026",
    name: "Web Summit Rio",
    parentEventBrand: "Web Summit",
    geopoliticalRegion: GeopoliticalRegion.LATIN_AMERICA,
    continent: Continent.SOUTH_AMERICA,
    country: "Brazil",
    city: "Rio de Janeiro",
    start: "2026-05-11",
    end: "2026-05-14",
    attendees: 15000,
    dev: true,
    bank: true,
    cybersecurityRelevance: 48,
    identityRelevance: 52,
    telecomRelevance: 68,
    aiRelevance: 76,
    appSecurityRelevance: 54,
    governmentRelevance: 58,
    bankingRelevance: 72,
    industries: [Industry.FINTECH, Industry.TELECOM, Industry.DEVELOPER_PLATFORMS, Industry.PAYMENTS],
    satCoreProblems: [
      SatCoreProblem.BANKING_FRAUD,
      SatCoreProblem.APP_FRAUD,
      SatCoreProblem.ACCOUNT_TAKEOVER,
    ],
    summary:
      "Emerging Latin American flagship connecting founders, telcos, and banking modernization agendas.",
    whyItMatters:
      "PIX-adjacent ecosystems amplify demand for trustworthy mobile-first authentication.",
    whoAttends:
      "Brazilian banks, regional telcos, founders building consumer finance, investors.",
    problemKeyraSolves:
      "SAT-Core addresses banking fraud and telco authentication convergence.",
    satCoreAlignment:
      "Mobile wallet protection, cross-border identity pilots, super-app onboarding.",
    recommendedAction:
      "Curated banking innovation tours plus telco partnership introductions.",
    targetMeetingType: "Attend / Speak",
    targetMeetingList:
      "Febraban-facing innovation teams · Brazilian tier-1 MNOs · LatAm fintech funds",
    tier: EventTier.TIER_1,
    featured: false,
  },
  {
    slug: "india-mobile-congress-2026",
    name: "India Mobile Congress",
    geopoliticalRegion: GeopoliticalRegion.SOUTH_ASIA,
    continent: Continent.ASIA,
    country: "India",
    city: "New Delhi",
    start: "2026-10-01",
    end: "2026-10-03",
    attendees: 75000,
    carrier: true,
    gov: true,
    bank: true,
    dev: true,
    cybersecurityRelevance: 66,
    identityRelevance: 76,
    telecomRelevance: 96,
    aiRelevance: 74,
    appSecurityRelevance: 62,
    governmentRelevance: 84,
    bankingRelevance: 82,
    industries: [
      Industry.TELECOM,
      Industry.MOBILE_INFRASTRUCTURE,
      Industry.DIGITAL_GOVERNMENT,
      Industry.PAYMENTS,
    ],
    satCoreProblems: [
      SatCoreProblem.TELECOM_SUBSCRIBER_VERIFICATION,
      SatCoreProblem.ACCOUNT_TAKEOVER,
      SatCoreProblem.BANKING_FRAUD,
      SatCoreProblem.APP_FRAUD,
    ],
    summary:
      "India's marquee telecom forum tying spectrum, manufacturing, and digital public infrastructure narratives.",
    whyItMatters:
      "UPI-scale ecosystems demand authentication that survives SIM swap and synthetic onboarding.",
    whoAttends:
      "DoT/TRAI-facing executives, group carriers, handset OEMs, major banks, DPI architects.",
    problemKeyraSolves:
      "SAT-Core maps to massive-scale subscriber assurance adjacent to Aadhaar journeys.",
    satCoreAlignment:
      "SIM/device trust, mobile-first identity, developer-heavy authentication ecosystems.",
    recommendedAction:
      "Executive engagements with group CTO offices plus banking fraud fusion briefings.",
    targetMeetingType: "Carrier Workshop / Sponsor",
    targetMeetingList:
      "Jio / Airtel / Vi innovation pillars · NPCI-facing partners · major PSU banks",
    tier: EventTier.TIER_1,
    featured: true,
  },
  {
    slug: "leap-saudi-arabia-2026",
    name: "LEAP",
    geopoliticalRegion: GeopoliticalRegion.MIDDLE_EAST_GCC,
    continent: Continent.MIDDLE_EAST,
    country: "Saudi Arabia",
    city: "Riyadh",
    start: "2026-02-09",
    end: "2026-02-12",
    attendees: 170000,
    gov: true,
    carrier: true,
    bank: true,
    dev: true,
    cybersecurityRelevance: 72,
    identityRelevance: 68,
    telecomRelevance: 84,
    aiRelevance: 92,
    appSecurityRelevance: 62,
    governmentRelevance: 90,
    bankingRelevance: 74,
    industries: [
      Industry.AI,
      Industry.DIGITAL_GOVERNMENT,
      Industry.TELECOM,
      Industry.FINTECH,
      Industry.SMART_CITIES,
    ],
    satCoreProblems: [
      SatCoreProblem.AI_AGENT_IDENTITY,
      SatCoreProblem.GOVERNMENT_ACCESS,
      SatCoreProblem.ACCOUNT_TAKEOVER,
      SatCoreProblem.TELECOM_SUBSCRIBER_VERIFICATION,
    ],
    summary:
      "High-velocity GCC tech expo pairing sovereign AI bets with national digitization megaprojects.",
    whyItMatters:
      "National buyers expect trusted identity rails beneath AI and smart-city deployments.",
    whoAttends:
      "Government transformation offices, sovereign funds, hyperscalers, regional carriers.",
    problemKeyraSolves:
      "SAT-Core aligns AI-agent identity risk with carrier-backed human verification.",
    satCoreAlignment:
      "Sovereign digital identity, carrier authentication monetization, smart city access.",
    recommendedAction:
      "VIP delegate tours anchored on Vision 2030-aligned partners.",
    targetMeetingType: "Sponsor",
    targetMeetingList:
      "MCIT stakeholders · stc / Mobily / Zain enterprise units · digital bank CEOs",
    tier: EventTier.TIER_1,
    featured: false,
  },
  {
    slug: "web-summit-qatar-2026",
    name: "Web Summit Qatar",
    parentEventBrand: "Web Summit",
    geopoliticalRegion: GeopoliticalRegion.MIDDLE_EAST_GCC,
    continent: Continent.MIDDLE_EAST,
    country: "Qatar",
    city: "Doha",
    start: "2026-02-23",
    end: "2026-02-26",
    attendees: 12000,
    gov: true,
    bank: true,
    dev: true,
    cybersecurityRelevance: 54,
    identityRelevance: 58,
    telecomRelevance: 72,
    aiRelevance: 78,
    appSecurityRelevance: 52,
    governmentRelevance: 76,
    bankingRelevance: 68,
    industries: [Industry.AI, Industry.FINTECH, Industry.TELECOM, Industry.DIGITAL_GOVERNMENT],
    satCoreProblems: [
      SatCoreProblem.ACCOUNT_TAKEOVER,
      SatCoreProblem.GOVERNMENT_ACCESS,
      SatCoreProblem.AI_AGENT_IDENTITY,
    ],
    summary:
      "GCC-facing innovation summit extending Web Summit storytelling into sovereign wealth-backed ecosystems.",
    whyItMatters:
      "Regional soft power investments prioritize trusted digital onboarding at national scale.",
    whoAttends:
      "Government futurists, regional banks, telecom ventures, AI founders.",
    problemKeyraSolves:
      "SAT-Core supports national-grade onboarding assurances with telco signals.",
    satCoreAlignment:
      "Smart nation initiatives, cross-border fintech sandboxes.",
    recommendedAction:
      "Curated meetings with Ministry stakeholders and national carrier labs.",
    targetMeetingType: "Attend",
    targetMeetingList:
      "Qatar central bank innovation · Ooredoo enterprise · Qatar Investment Authority scouts",
    tier: EventTier.TIER_1,
    featured: false,
  },
];

async function main() {
  /**
   * Live deploy safety:
   * - Default: upsert Tier-1 anchors on every `deploy:db` (refreshes seeded fields).
   * - Set SEED_ON_EMPTY_ONLY=true to seed only when the DB has zero events (recommended after
   *   first production launch so redeploys do not overwrite operator edits to seeded slugs).
   */
  if (process.env.SEED_ON_EMPTY_ONLY === "true") {
    const n = await prisma.event.count();
    if (n > 0) {
      console.log(`Skipping seed: database already has ${n} event(s).`);
      return;
    }
  }

  for (const e of tier1) {
    await upsertEvent(e);
  }
  console.log(`Seeded ${tier1.length} Tier-1 intelligence anchors.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
