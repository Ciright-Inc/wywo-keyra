type TableProps = {
  variant: "table-row";
  colSpan: number;
  hasSearch?: boolean;
  hasFilter?: boolean;
  entityName: string;
  emptyMessage?: string;
};

type PanelProps = {
  variant: "panel";
  hasSearch?: boolean;
  hasFilter?: boolean;
  entityName: string;
  emptyMessage?: string;
  className?: string;
};

type Props = TableProps | PanelProps;

export function adminListEmptyMessage({
  hasSearch,
  hasFilter,
  entityName,
  emptyMessage,
}: {
  hasSearch?: boolean;
  hasFilter?: boolean;
  entityName: string;
  emptyMessage?: string;
}): string {
  if (hasSearch || hasFilter) return "No results found.";
  return emptyMessage ?? `No ${entityName} yet.`;
}

export function AdminListEmptyState(props: Props) {
  const message = adminListEmptyMessage(props);

  if (props.variant === "panel") {
    return (
      <p
        className={
          props.className ??
          "mt-6 rounded-2xl border border-keyra-border bg-keyra-surface/50 px-4 py-8 text-center text-sm text-keyra-text-2"
        }
      >
        {message}
      </p>
    );
  }

  return (
    <tr>
      <td colSpan={props.colSpan} className="px-3 py-10 text-center text-sm text-keyra-text-2">
        {message}
      </td>
    </tr>
  );
}
