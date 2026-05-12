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
  return (
    <a
      href={safe}
      target="_blank"
      rel="noreferrer"
      className="text-sm text-keyra-accent underline-offset-4 hover:underline"
    >
      {label ?? href.replace(/^https?:\/\//, "")}
    </a>
  );
}
