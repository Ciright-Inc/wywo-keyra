"use client";

import { ButtonLink } from "@/components/ui/ButtonLink";
import { cn } from "@/components/ui/cn";
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
    <ButtonLink
      href={href}
      variant={variant}
      className={cn(
        "focus-visible:outline-none focus-visible:keyra-focus rounded-[var(--keyra-radius-pill)]",
        className,
      )}
      onClick={() => trackPlausible("access_keyra_click", { section })}
    >
      Access Keyra
    </ButtonLink>
  );
}
