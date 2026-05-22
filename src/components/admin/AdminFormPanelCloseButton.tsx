import { cn } from "@/components/ui/cn";
import { adminEditBackLink } from "@/lib/admin/adminUiClasses";

type Props = {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  label?: string;
  /** `back` matches deployment edit pages — arrow + "Back to list" */
  variant?: "close" | "back";
};

export function AdminFormPanelCloseButton({
  onClick,
  disabled,
  className,
  label,
  variant = "close",
}: Props) {
  const isBack = variant === "back";
  const text = label ?? (isBack ? "Back to list" : "Close");
  const icon = isBack ? "arrow_back" : "close";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={text}
      aria-label={text}
      className={cn(adminEditBackLink, "disabled:cursor-not-allowed disabled:opacity-55", className)}
    >
      <span className="material-symbols-outlined text-[14px] leading-none no-underline" aria-hidden>
        {icon}
      </span>
      {text}
    </button>
  );
}
