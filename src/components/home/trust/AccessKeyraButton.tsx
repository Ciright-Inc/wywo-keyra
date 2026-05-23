"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { trackPlausible } from "@/lib/analytics";
import { useGetStartedAccessHref } from "@/lib/useGetStartedAccessHref";
import type { TrustJourneyAnchor } from "@/lib/trustJourney";

type AccessKeyraButtonProps = {
  section: TrustJourneyAnchor;
  variant?: "primary" | "secondary";
  className?: string;
};

export function AccessKeyraButton({
  section,
  variant = "primary",
  className,
}: AccessKeyraButtonProps) {
  const href = useGetStartedAccessHref(section);

  return (
    <Link
      href={href}
      className="inline-flex focus-visible:outline-none focus-visible:keyra-focus rounded-[var(--keyra-radius-pill)]"
      onClick={() => trackPlausible("access_keyra_click", { section })}
    >
      <Button variant={variant} className={className}>
        Access Keyra
      </Button>
    </Link>
  );
}
