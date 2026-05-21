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
    const { pathname: currentPath, search } = window.location;
    if (window.location.hash) {
      window.history.replaceState(null, "", `${currentPath}${search}`);
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }

  return (
    <Link href="/" onClick={handleClick} className={className}>
      {children}
    </Link>
  );
}
