/** Base URL for the public catalogue when admin runs on another origin (no trailing slash). */
export function publicEventsCatalogHref(): string {
  const base = process.env.NEXT_PUBLIC_PUBLIC_EVENTS_URL?.trim();
  if (!base) return "/events";
  return `${base.replace(/\/+$/, "")}/events`;
}

export function publicEventDetailHref(slug: string): string {
  const base = process.env.NEXT_PUBLIC_PUBLIC_EVENTS_URL?.trim();
  if (!base) return `/events/${slug}`;
  return `${base.replace(/\/+$/, "")}/events/${slug}`;
}

export function isAbsoluteHttpUrl(href: string): boolean {
  return href.startsWith("http://") || href.startsWith("https://");
}
