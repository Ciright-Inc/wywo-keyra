"use client";

import {
  type RegistrationModalKey,
  useKeyraRegistrationModal,
} from "@/components/registration/KeyraRegistrationProvider";

const CTA_ITEMS: {
  key: RegistrationModalKey;
  title: string;
  description: string;
}[] = [
  {
    key: "individual",
    title: "Protect Your Account",
    description:
      "Consent-driven identity verification with minimal exposure across your digital life.",
  },
  {
    key: "family",
    title: "Protect Your Family",
    description:
      "Shared protection and trusted recovery for the people closest to you.",
  },
  {
    key: "organization",
    title: "Guard Your Enterprise",
    description:
      "Infrastructure-grade trust for teams, systems, and organizational continuity.",
  },
  {
    key: "partner",
    title: "Join Us And Build The Future Of Trust",
    description:
      "Privacy-first infrastructure for a more responsible digital future.",
  },
];

export function HomeRegistrationCTAs() {
  const { openModal } = useKeyraRegistrationModal();

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      {CTA_ITEMS.map((item) => (
        <button
          key={item.key}
          type="button"
          className="keyra-card group flex h-full min-w-0 flex-col gap-2 rounded-[var(--keyra-radius-card)] p-4 text-left active:border-keyra-border sm:gap-3 sm:p-6"
          onClick={() => openModal(item.key)}
        >
          <span className="text-[15px] font-semibold tracking-tight text-keyra-primary sm:text-[17px]">
            {item.title}
          </span>
          <span className="text-[13px] leading-relaxed text-keyra-text-2 sm:text-[14px]">
            {item.description}
          </span>
          <span className="mt-auto pt-2 text-[14px] font-semibold text-[var(--keyra-accent)] transition group-hover:text-keyra-primary">
            Begin
          </span>
        </button>
      ))}
    </div>
  );
}
