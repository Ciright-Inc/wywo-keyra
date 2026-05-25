import type { SiteFooterLinkSection, SiteFooterLinkView } from "./types";

export type CommonOnThisSiteLinkTemplate = Omit<
  SiteFooterLinkView,
  "id" | "section" | "siteAppId"
>;

/** Standard “On this site” footer links shared across Keyra apps (formerly global). */
export function getCommonOnThisSiteLinkTemplates(): CommonOnThisSiteLinkTemplate[] {
  return [
    {
      label: "Why identity",
      href: "/#problem",
      description: null,
      isExternal: false,
      internalPath: null,
      sortOrder: 10,
      isPublished: true,
    },
    {
      label: "The shift",
      href: "/#missing-layer",
      description: null,
      isExternal: false,
      internalPath: null,
      sortOrder: 20,
      isPublished: true,
    },
    {
      label: "Who it's for",
      href: "/#for",
      description: null,
      isExternal: false,
      internalPath: null,
      sortOrder: 30,
      isPublished: true,
    },
    {
      label: "Global",
      href: "/#global",
      description: null,
      isExternal: false,
      internalPath: null,
      sortOrder: 40,
      isPublished: true,
    },
    {
      label: "FAQ",
      href: "/faq",
      description: null,
      isExternal: false,
      internalPath: null,
      sortOrder: 50,
      isPublished: true,
    },
    {
      label: "Contact us",
      href: "/contact",
      description: null,
      isExternal: false,
      internalPath: null,
      sortOrder: 60,
      isPublished: true,
    },
    {
      label: "Privacy",
      href: "/privacy",
      description: null,
      isExternal: false,
      internalPath: null,
      sortOrder: 70,
      isPublished: true,
    },
    {
      label: "Terms",
      href: "/terms",
      description: null,
      isExternal: false,
      internalPath: null,
      sortOrder: 80,
      isPublished: true,
    },
  ];
}

export function buildOnThisSiteLinksForApp(siteAppId: string): Array<
  CommonOnThisSiteLinkTemplate & {
    section: SiteFooterLinkSection;
    siteAppId: string;
  }
> {
  return getCommonOnThisSiteLinkTemplates().map((row) => ({
    ...row,
    section: "ON_THIS_SITE",
    siteAppId,
  }));
}
