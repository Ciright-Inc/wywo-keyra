// Order matters: the dashboard base styles must load BEFORE the WYWO overrides
// so the sidebar/topbar layout is already painted on first render (avoids the
// brief icon/label overlap that appears before the client JS chunk arrives).
import "@/styles/admin-dashboard.css";
import "@/styles/wywo-shell.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { WywoShell } from "@/components/wywo/WywoShell";
import { assertWywoActor } from "@/lib/wywo/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "WYWO — While You Were Out",
  description:
    "Trusted messaging for the Keyra network. No noise. Verified humans and verified agents only.",
};

export default async function WywoShellLayout({ children }: { children: ReactNode }) {
  const actor = await assertWywoActor("/wywo");
  return (
    <WywoShell
      adminEnabled={!!actor.isAdmin}
      displayName={actor.displayName}
      phoneE164={actor.phoneE164}
    >
      {children}
    </WywoShell>
  );
}
