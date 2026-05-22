"use client";

import { useRouter } from "next/navigation";
import type { ComponentProps, MouseEvent, ReactNode } from "react";

type Props = Omit<ComponentProps<"a">, "href" | "onClick"> & {
  href: string;
  onNavigate: (href: string) => void;
  prefetch?: boolean;
  children: ReactNode;
};

/** Same-tab list navigation without triggering a full loading shell. */
export function AdminTransitionLink({ href, onNavigate, prefetch, children, className, ...rest }: Props) {
  const router = useRouter();

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    onNavigate(href);
  }

  function handleMouseEnter() {
    if (prefetch) void router.prefetch(href);
  }

  return (
    <a href={href} className={className} onClick={handleClick} onMouseEnter={handleMouseEnter} {...rest}>
      {children}
    </a>
  );
}
