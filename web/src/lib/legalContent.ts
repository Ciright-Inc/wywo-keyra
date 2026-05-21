import type { LegalSection } from "@/components/legal/LegalDocument";

export const PRIVACY_LAST_UPDATED = "21 May 2026";

export const privacySections: LegalSection[] = [
  {
    id: "overview",
    title: "Overview",
    paragraphs: [
      "Keyra provides sovereign trust infrastructure — identity verification, consumer protection, and calm certainty online for individuals, families, businesses, partners, and governments.",
      "This Privacy Policy explains what information we collect through keyra.ie and related Keyra sites and apps, why we collect it, how we use and protect it, and the choices you have. We write it in plain language because clarity is part of how Keyra works.",
    ],
  },
  {
    id: "principles",
    title: "Our principles",
    paragraphs: ["Keyra is built around restraint and respect:"],
    list: [
      "Collect only what helps establish, protect, or manage identity trust.",
      "Explain what we collect and why, without hiding behind jargon.",
      "Give you meaningful control over your account and personal data.",
      "Design for security and proportionality at every layer of the ecosystem.",
    ],
  },
  {
    id: "information-we-collect",
    title: "Information we collect",
    paragraphs: [
      "The information we collect depends on how you use Keyra — browsing this site, creating an account, completing verification, or working with us as an enterprise or partner.",
    ],
    list: [
      "Contact and account details — such as name, email address, phone number, and account preferences when you register, sign in, or contact us.",
      "Identity and verification data — information needed to confirm who you are, including documents or signals you choose to provide, verification outcomes, and related metadata required for fraud prevention and trust.",
      "Usage and technical data — such as device type, browser, IP address, timestamps, and interaction logs needed to operate, secure, and improve our services.",
      "Communications — messages you send through contact forms, support channels, or partner inquiries.",
      "Enterprise and government context — additional information governed by separate agreements when you use Keyra in institutional or sovereign deployments.",
    ],
  },
  {
    id: "how-we-use",
    title: "How we use information",
    paragraphs: ["We use personal information to:"],
    list: [
      "Provide identity verification, account management, and consumer protection features you request.",
      "Operate, maintain, and improve the Keyra ecosystem — including this website, apps, developer tools, and partner integrations.",
      "Detect, prevent, and respond to fraud, abuse, and security incidents.",
      "Communicate with you about your account, verification status, or support requests.",
      "Comply with legal obligations and enforce our Terms of Service.",
      "Where permitted and with appropriate controls, develop and evaluate product improvements using aggregated or de-identified data.",
    ],
  },
  {
    id: "sharing",
    title: "When we share information",
    paragraphs: [
      "We do not sell your personal information. We share information only when necessary to deliver Keyra, protect users, or meet legal requirements:",
    ],
    list: [
      "Service providers — trusted vendors who help us host infrastructure, send communications, or perform verification under strict contractual obligations.",
      "Partners and integrators — when you explicitly connect Keyra to another service or your organization has authorized an integration.",
      "Carriers and verification networks — where identity checks require participation in regulated or partner verification infrastructure.",
      "Legal and safety — when required by law, court order, or to protect the rights, safety, and integrity of Keyra users and the public.",
      "Business transfers — in connection with a merger, acquisition, or asset sale, subject to continued protection of your data.",
    ],
  },
  {
    id: "retention",
    title: "How long we keep information",
    paragraphs: [
      "We retain personal information only as long as needed for the purposes described in this policy — including to provide services, meet legal obligations, resolve disputes, and enforce agreements.",
      "Verification records may be kept for longer where required for fraud prevention, regulatory compliance, or institutional contracts. When retention is no longer necessary, we delete or de-identify data using appropriate technical measures.",
    ],
  },
  {
    id: "security",
    title: "Security",
    paragraphs: [
      "Keyra applies administrative, technical, and organizational safeguards designed for identity infrastructure — including access controls, encryption in transit and at rest where appropriate, monitoring, and least-privilege practices.",
      "No system is perfectly secure. If we become aware of a breach that affects your personal information, we will notify you and relevant authorities as required by applicable law.",
    ],
  },
  {
    id: "your-rights",
    title: "Your choices and rights",
    paragraphs: [
      "Depending on where you live, you may have rights to access, correct, delete, restrict, or port your personal information, and to object to certain processing. You may also withdraw consent where processing is consent-based.",
      "You can update many account details in My Account or Settings within the Keyra apps. For other requests — including access or deletion — contact us through the Contact page. We will respond in calm, clear language within the timeframes required by applicable law.",
      "If you are in the European Economic Area or United Kingdom, you also have the right to lodge a complaint with your local data protection authority.",
    ],
  },
  {
    id: "international",
    title: "International transfers",
    paragraphs: [
      "Keyra operates globally. Your information may be processed in countries other than where you live, including within the European Union and in other jurisdictions where we or our service providers maintain infrastructure.",
      "When we transfer personal information internationally, we use appropriate safeguards — such as standard contractual clauses or equivalent mechanisms — consistent with applicable data protection law.",
    ],
  },
  {
    id: "children",
    title: "Children",
    paragraphs: [
      "Keyra services are not directed at children under 16 without appropriate parental or guardian involvement. We do not knowingly collect personal information from children without required consent. If you believe we have collected such information in error, please contact us so we can delete it.",
    ],
  },
  {
    id: "cookies",
    title: "Cookies and similar technologies",
    paragraphs: [
      "We use cookies and similar technologies to keep you signed in, remember preferences, measure site performance, and protect against abuse. You can control cookies through your browser settings; some features may not work correctly if essential cookies are disabled.",
    ],
  },
  {
    id: "changes",
    title: "Changes to this policy",
    paragraphs: [
      "We may update this Privacy Policy from time to time. When we make material changes, we will post the updated policy on this page and adjust the “Last updated” date. Continued use of Keyra after changes take effect means you accept the revised policy.",
    ],
  },
  {
    id: "contact",
    title: "Contact",
    paragraphs: [
      "For privacy questions or requests, use our Contact page at keyra.ie/contact. We will identify ourselves clearly in any response and will not ask you to share passwords or full verification documents by unsecured email.",
    ],
  },
];

export const TERMS_LAST_UPDATED = "21 May 2026";

export const termsSections: LegalSection[] = [
  {
    id: "agreement",
    title: "Agreement to these terms",
    paragraphs: [
      "These Terms of Service (“Terms”) govern your access to and use of keyra.ie, related Keyra websites, applications, APIs, and services (collectively, the “Services”) operated by Keyra.",
      "By accessing or using the Services, you agree to these Terms. If you do not agree, do not use the Services. If you use Keyra on behalf of an organization, you represent that you have authority to bind that organization.",
    ],
  },
  {
    id: "services",
    title: "What Keyra provides",
    paragraphs: [
      "Keyra is the identity trust layer of the internet — sovereign trust infrastructure for individuals, households, professionals, enterprises, partners, and governments.",
      "The Services may include identity verification, account protection, developer and partner tooling, enterprise deployment, affiliate programs, and related support. Specific features vary by product, region, and agreement.",
    ],
  },
  {
    id: "eligibility",
    title: "Eligibility",
    paragraphs: [
      "You must be at least 16 years old — or the minimum age required in your jurisdiction — to create a Keyra account, unless a parent or guardian provides appropriate consent where required by law.",
      "You may not use the Services if you are barred from doing so under applicable law or if we have suspended or terminated your access for violation of these Terms.",
    ],
  },
  {
    id: "accounts",
    title: "Accounts and security",
    paragraphs: [
      "You are responsible for maintaining the confidentiality of your credentials and for all activity under your account. Notify us promptly through Contact if you suspect unauthorized access.",
      "You agree to provide accurate information and to keep your account details current. Keyra may refuse, suspend, or close accounts that contain false information or pose a security or abuse risk.",
    ],
  },
  {
    id: "verification",
    title: "Identity verification",
    paragraphs: [
      "Some features require identity verification. You agree to provide truthful information and documents when requested and not to impersonate another person or submit synthetic or fraudulent identity signals.",
      "Verification outcomes are based on the information and signals available at the time of review. Keyra does not guarantee that every party online will accept a Keyra verification result; third parties make their own trust decisions.",
    ],
  },
  {
    id: "acceptable-use",
    title: "Acceptable use",
    paragraphs: ["You agree not to:"],
    list: [
      "Use the Services for unlawful, fraudulent, or harmful purposes.",
      "Probe, scan, or test the vulnerability of Keyra systems without written authorization.",
      "Interfere with or disrupt the integrity or performance of the Services.",
      "Reverse engineer, scrape, or harvest data except as expressly permitted by documentation or a written agreement.",
      "Misrepresent your affiliation with Keyra or use Keyra branding without permission.",
      "Circumvent rate limits, access controls, or verification requirements.",
    ],
  },
  {
    id: "developers",
    title: "Developers and APIs",
    paragraphs: [
      "If you access Keyra developer tools or APIs, you also agree to applicable developer documentation, usage limits, and any separate developer or partner agreement.",
      "API keys and credentials are confidential. You are responsible for how your applications use Keyra data and must implement appropriate security and user consent flows.",
    ],
  },
  {
    id: "enterprise",
    title: "Enterprise, government, and partner terms",
    paragraphs: [
      "Institutional, sovereign, carrier, or partner deployments may be governed by additional written agreements that supplement or replace portions of these Terms. Where a signed agreement conflicts with these Terms, the signed agreement controls for that relationship.",
    ],
  },
  {
    id: "intellectual-property",
    title: "Intellectual property",
    paragraphs: [
      "Keyra and its licensors own the Services, including software, branding, documentation, and content on keyra.ie. These Terms do not grant you ownership of any Keyra intellectual property.",
      "You may not copy, modify, distribute, or create derivative works of the Services except as expressly allowed by Keyra or applicable open-source licenses referenced in the product.",
    ],
  },
  {
    id: "third-party",
    title: "Third-party services and links",
    paragraphs: [
      "The Services may link to or integrate with third-party sites, apps, or carriers. Keyra is not responsible for third-party content, policies, or practices. Your use of third-party services is at your own risk and subject to their terms.",
    ],
  },
  {
    id: "disclaimers",
    title: "Disclaimers",
    paragraphs: [
      "The Services are provided “as is” and “as available” to the fullest extent permitted by law. Keyra does not warrant uninterrupted or error-free operation, or that the Services will prevent all fraud or harm online.",
      "Nothing in these Terms excludes warranties that cannot be excluded under applicable consumer protection law.",
    ],
  },
  {
    id: "liability",
    title: "Limitation of liability",
    paragraphs: [
      "To the fullest extent permitted by law, Keyra and its affiliates, officers, employees, and partners will not be liable for indirect, incidental, special, consequential, or punitive damages, or for loss of profits, data, or goodwill, arising from your use of the Services.",
      "Where liability cannot be excluded, Keyra’s total liability for claims arising from these Terms or the Services is limited to the greater of (a) amounts you paid Keyra for the Services in the twelve months before the claim, or (b) one hundred euros (€100), except where applicable law requires otherwise.",
    ],
  },
  {
    id: "indemnity",
    title: "Indemnity",
    paragraphs: [
      "You agree to indemnify and hold harmless Keyra from claims, damages, and expenses (including reasonable legal fees) arising from your misuse of the Services, violation of these Terms, or infringement of another party’s rights.",
    ],
  },
  {
    id: "termination",
    title: "Suspension and termination",
    paragraphs: [
      "You may stop using the Services at any time. Keyra may suspend or terminate access if you violate these Terms, pose a security risk, or where required by law.",
      "Provisions that by their nature should survive termination — including intellectual property, disclaimers, limitation of liability, and indemnity — will survive.",
    ],
  },
  {
    id: "governing-law",
    title: "Governing law and disputes",
    paragraphs: [
      "These Terms are governed by the laws of Ireland, without regard to conflict-of-law principles, except where mandatory consumer protection laws in your country of residence apply.",
      "Disputes should first be raised through our Contact page so we can resolve them in good faith. Where courts have jurisdiction, disputes will be brought in the courts of Ireland unless applicable law requires otherwise.",
    ],
  },
  {
    id: "changes",
    title: "Changes to these terms",
    paragraphs: [
      "We may update these Terms from time to time. Material changes will be posted on this page with an updated “Last updated” date. Continued use after changes take effect constitutes acceptance of the revised Terms.",
    ],
  },
  {
    id: "contact",
    title: "Contact",
    paragraphs: [
      "Questions about these Terms? Visit keyra.ie/contact. For privacy-specific matters, see our Privacy Policy.",
    ],
  },
];
