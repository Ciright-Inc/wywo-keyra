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
    title: "Protect Your Identity",
    description:
      "Secure your personal identity, mobile device, and digital presence with Keyra.",
  },
  {
    key: "family",
    title: "Protect Your Family",
    description:
      "Create a protected family identity registry for every family member.",
  },
  {
    key: "organization",
    title: "Secure Your Organization",
    description:
      "Protect your company domains, employees, mobile numbers, and trusted access.",
  },
  {
    key: "partner",
    title: "Partner With Keyra",
    description:
      "Join Keyra as a telecom, government, enterprise, channel, or strategic partner.",
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
