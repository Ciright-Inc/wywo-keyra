import "@/styles/wywo-slip.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "WYWO — While You Were Out",
  description:
    "The sovereign trusted messaging operating system. One trusted inbox. Verified humans and verified agents only.",
};

export default function WywoRootLayout({ children }: { children: ReactNode }) {
  return children;
}
