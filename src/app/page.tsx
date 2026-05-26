import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { HomeContent } from "@/components/home/HomeContent";
import { KeyraRegistrationProvider } from "@/components/registration/KeyraRegistrationProvider";

/** Same triggers as `src/middleware.ts` — dedicated WYWO hosts only. */
async function isWywoRootDeployment(): Promise<boolean> {
  const mode = process.env.KEYRA_DEPLOYMENT_MODE?.trim().toLowerCase();
  if (mode === "wywo") return true;
  if (process.env.WYWO_AS_ROOT === "1") return true;

  const h = await headers();
  const hostHeader = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  const host = hostHeader.split(",")[0]?.trim().toLowerCase() ?? "";
  if (!host) return false;
  const hostname = host.replace(/:\d+$/, "");
  if (hostname.startsWith("wywo.")) return true;
  if (hostname.includes("wywo-keyra")) return true;
  return false;
}

export default async function Home() {
  if (await isWywoRootDeployment()) {
    redirect("/wywo");
  }

  return (
    <KeyraRegistrationProvider>
      <HomeContent />
    </KeyraRegistrationProvider>
  );
}
