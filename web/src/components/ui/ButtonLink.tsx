import Link from "next/link";
import type { ComponentProps } from "react";
import { NEW_TAB_LINK } from "@/lib/newTabLink";
import { cn } from "./cn";

type Variant = "primary" | "secondary" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg";

const variantClass: Record<Variant, string> = {
  primary: "ds-btn-primary",
  secondary: "ds-btn-secondary",
  ghost: "ds-btn-tertiary",
  destructive: "ds-btn-destructive",
};

const sizeClass: Record<Size, string> = {
  sm: "is-sm",
  md: "",
  lg: "min-h-12 px-6 text-[15px]",
};

export type ButtonLinkProps = Omit<ComponentProps<typeof Link>, "target" | "rel"> & {
  variant?: Variant;
  size?: Size;
};

/** Anchor styled as a design-system button; always opens in a new tab. */
export function ButtonLink({
  className,
  variant = "primary",
  size = "md",
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={cn("inline-flex", variantClass[variant], sizeClass[size], className)}
      {...NEW_TAB_LINK}
      {...props}
    >
      {children}
    </Link>
  );
}
