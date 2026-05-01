"use client";

import { type ReactNode } from "react";

export function ClientOnly({ children }: { children: ReactNode }) {
  if (typeof window === "undefined") return null;
  return children;
}

