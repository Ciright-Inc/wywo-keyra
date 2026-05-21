import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { TERMS_LAST_UPDATED, termsSections } from "@/lib/legalContent";

export const metadata: Metadata = {
  title: "Terms",
  description:
    "Be Protected Online. Keyra Terms of Service — clear rules for using our identity trust infrastructure.",
};

export default function TermsPage() {
  return (
    <LegalDocument
      title="Terms of Service"
      lastUpdated={TERMS_LAST_UPDATED}
      intro="These terms govern your use of Keyra’s website, apps, verification services, and ecosystem tools."
      sections={termsSections}
    />
  );
}
