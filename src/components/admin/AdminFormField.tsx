import type { ReactNode } from "react";
import { cn } from "@/components/ui/cn";
import { adminLabel } from "@/lib/admin/adminUiClasses";

type Props = {
  label: string;
  htmlFor?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
};

/** Label + control spacing used across admin create/edit forms. */
export function AdminFormField({ label, htmlFor, required, className, children }: Props) {
  return (
    <label htmlFor={htmlFor} className={cn("block", className)}>
      <span className={adminLabel}>
        {label}
        {required ? <span className="text-red-600"> *</span> : null}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
