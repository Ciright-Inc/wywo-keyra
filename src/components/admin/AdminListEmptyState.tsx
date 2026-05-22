import { adminEmptyPanel } from "@/lib/admin/adminUiClasses";
import { cn } from "@/components/ui/cn";

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
    return <p className={cn(adminEmptyPanel, props.className)}>{message}</p>;
  }

  return (
    <tr>
      <td colSpan={props.colSpan} className="ds-admin-empty">
        {message}
      </td>
    </tr>
  );
}
