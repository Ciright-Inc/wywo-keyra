import type { SiteSocialPlatform } from "./types";

const SOCIAL_ICON_PATHS: Record<SiteSocialPlatform, string | null> = {
  LINKEDIN:
    "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
  TWITTER: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  INSTAGRAM:
    "M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 5.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9zm6.25-1.75a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5z",
  YOUTUBE:
    "M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.75 15.5v-7l6 3.5-6 3.5z",
  GITHUB:
    "M12 .5a12 12 0 0 0-3.79 23.4c.6.11.82-.26.82-.58 0-.29-.01-1.04-.02-2.04-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.1-.75.08-.74.08-.74 1.22.09 1.86 1.25 1.86 1.25 1.08 1.85 2.83 1.32 3.52 1.01.11-.78.42-1.32.76-1.62-2.67-.3-5.47-1.33-5.47-5.92 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.87.12 3.17.77.84 1.24 1.91 1.24 3.22 0 4.6-2.8 5.62-5.48 5.92.43.37.81 1.1.81 2.22 0 1.6-.01 2.89-.01 3.28 0 .32.22.7.83.58A12 12 0 0 0 12 .5z",
  CUSTOM: null,
};

export function socialPlatformLabel(platform: SiteSocialPlatform): string {
  switch (platform) {
    case "LINKEDIN":
      return "LinkedIn";
    case "TWITTER":
      return "X / Twitter";
    case "INSTAGRAM":
      return "Instagram";
    case "YOUTUBE":
      return "YouTube";
    case "GITHUB":
      return "GitHub";
    default:
      return "Custom";
  }
}

export const SITE_SOCIAL_PLATFORMS: SiteSocialPlatform[] = [
  "LINKEDIN",
  "TWITTER",
  "INSTAGRAM",
  "YOUTUBE",
  "GITHUB",
  "CUSTOM",
];

export function SocialPlatformIcon({
  platform,
  className = "keyra-site-footer__social-icon",
}: {
  platform: SiteSocialPlatform;
  className?: string;
}) {
  const path = SOCIAL_ICON_PATHS[platform];
  if (!path) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
        <path
          fill="currentColor"
          d="M10.59 13.41a1 1 0 0 0 0 1.42l3.18 3.18a1 1 0 0 0 1.42-1.42l-1.47-1.47 5.3-5.29a1 1 0 0 0-1.42-1.42l-5.29 5.3-1.47-1.47a1 1 0 0 0-1.42 0zM12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path fill="currentColor" d={path} />
    </svg>
  );
}
