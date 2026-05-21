export function OfficialDomainLink({
  href,
  label,
}: {
  href: string | null | undefined;
  label?: string;
}) {
  if (!href) {
    return <span className="text-sm text-keyra-text-2">—</span>;
  }
  const safe = href.startsWith("http://") || href.startsWith("https://") ? href : `https://${href}`;
  const display = label ?? href.replace(/^https?:\/\//, "");
  return (
    <a
      href={safe}
      target="_blank"
      rel="noreferrer"
      className="inline-flex max-w-full items-center truncate text-sm font-medium text-keyra-accent underline-offset-4 transition hover:text-keyra-primary hover:underline"
      title={display}
    >
      {display}
    </a>
  );
}
