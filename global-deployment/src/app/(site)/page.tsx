import type { Metadata } from "next";
import { Suspense } from "react";
import { DeploymentErrorBoundary } from "@/components/global-deployment/DeploymentErrorBoundary";
import { GlobalDeploymentHero } from "@/components/global-deployment/GlobalDeploymentHero";
import { GlobalDeploymentView } from "@/components/global-deployment/GlobalDeploymentView";
import { GlobalDeploymentPageLoader } from "@/components/global-deployment/GlobalDeploymentPageLoader";
import { getAdminRegistryTree } from "@/lib/deployments/adminRegistryTree";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Global deployment",
  description:
    "Explore Keyra regional, country, and operator deployment posture from the live admin registry.",
};

function ViewFallback() {
  return <GlobalDeploymentPageLoader />;
}

export default async function GlobalDeploymentHomePage() {
  const adminTree = await getAdminRegistryTree();

  return (
    <>
      <GlobalDeploymentHero />
      <DeploymentErrorBoundary>
        <Suspense fallback={<ViewFallback />}>
          <GlobalDeploymentView initialAdminTree={adminTree} />
        </Suspense>
      </DeploymentErrorBoundary>
    </>
  );
}
