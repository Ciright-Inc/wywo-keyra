/** Admin tables — readable local timestamp with timezone hint. */
export function formatAdminDateTime(iso: string | Date | null | undefined): string {
  if (!iso) return "—";
  const date = iso instanceof Date ? iso : new Date(iso);
  if (Number.isNaN(date.getTime())) return typeof iso === "string" ? iso : "—";
  return new Intl.DateTimeFormat("en-IE", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZoneName: "short",
  }).format(date);
}
