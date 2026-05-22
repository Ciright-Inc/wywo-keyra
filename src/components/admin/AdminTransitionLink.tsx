"use client";

import type { ComponentProps, MouseEvent, ReactNode } from "react";

type Props = Omit<ComponentProps<"a">, "href" | "onClick"> & {
  href: string;
  onNavigate: (href: string) => void;
  children: ReactNode;
};

/** Same-tab list navigation without triggering a full loading shell. */
export function AdminTransitionLink({ href, onNavigate, children, className, ...rest }: Props) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    onNavigate(href);
  }

  return (
    <a href={href} className={className} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}
