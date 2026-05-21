import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { PRIVACY_LAST_UPDATED, privacySections } from "@/lib/legalContent";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "Be Protected Online. Keyra privacy policy — how we collect, use, and protect identity and account information.",
};

export default function PrivacyPage() {
  return (
    <LegalDocument
      title="Privacy Policy"
      lastUpdated={PRIVACY_LAST_UPDATED}
      intro="This policy describes how Keyra handles personal information across our website, apps, and identity trust services."
      sections={privacySections}
    />
  );
}
