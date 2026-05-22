import { adminError, adminInput } from "@/lib/admin/adminUiClasses";
import { cn } from "@/components/ui/cn";

export function AdminFieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className={adminError}>{message}</p>;
}

export function fieldClass(base: string, hasError: boolean): string {
  return cn(base, hasError && "is-error");
}

export { adminInput as adminFieldInputClass };
