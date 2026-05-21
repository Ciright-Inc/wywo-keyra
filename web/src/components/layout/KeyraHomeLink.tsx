"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MouseEvent } from "react";

type KeyraHomeLinkProps = {
  className?: string;
  children: React.ReactNode;
};

export function KeyraHomeLink({ className, children }: KeyraHomeLinkProps) {
  const pathname = usePathname();

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (pathname !== "/") return;

    event.preventDefault();
    if (window.location.hash) {
      window.location.href = "/";
      return;
    }
    window.location.reload();
  }

  return (
    <Link href="/" onClick={handleClick} className={className}>
      {children}
    </Link>
  );
}
