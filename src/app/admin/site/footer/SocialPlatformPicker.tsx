"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminSelectMenu } from "@/components/admin/AdminSelectMenu";
import {
  SITE_SOCIAL_PLATFORMS,
  SocialPlatformIcon,
  socialPlatformLabel,
} from "@/lib/siteFooter/socialIcons";
import type { SiteSocialPlatform } from "@/lib/siteFooter/types";

type Props = {
  value: SiteSocialPlatform;
  onChange: (value: SiteSocialPlatform) => void;
  disabled?: boolean;
};

function platformIcon(platform: SiteSocialPlatform, sizeClass = "h-4 w-4") {
  return <SocialPlatformIcon platform={platform} className={`${sizeClass} fill-current`} />;
}

const PLATFORM_OPTIONS = SITE_SOCIAL_PLATFORMS.map((platform) => ({
  value: platform,
  label: socialPlatformLabel(platform),
  leading: platformIcon(platform, "h-3.5 w-3.5"),
}));

export function SocialPlatformPicker({ value, onChange, disabled = false }: Props) {
  const [platform, setPlatform] = useState(value);

  useEffect(() => {
    setPlatform(value);
  }, [value]);

  const options = useMemo(() => PLATFORM_OPTIONS, []);

  function handleChange(next: SiteSocialPlatform) {
    if (next === platform) return;
    setPlatform(next);
    onChange(next);
  }

  return (
    <div className="inline-flex max-w-full items-center gap-2">
      <span
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--ds-hairline-strong)] bg-[var(--ds-canvas-soft)] text-[var(--ds-ink)]"
        aria-hidden
      >
        {platformIcon(platform, "h-3.5 w-3.5")}
      </span>
      <AdminSelectMenu
        value={platform}
        disabled={disabled}
        onChange={(next) => handleChange(next as SiteSocialPlatform)}
        options={options}
        className="w-[12.25rem] max-w-full"
        fullWidth
        matchMenuWidth
        truncateLabels={false}
        aria-label="Social platform"
      />
    </div>
  );
}
