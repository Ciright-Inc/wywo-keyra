import type { Metadata } from "next";
import { Suspense } from "react";
import { DeploymentErrorBoundary } from "@/components/global-deployment/DeploymentErrorBoundary";
import { GlobalDeploymentHero } from "@/components/global-deployment/GlobalDeploymentHero";
import { GlobalDeploymentView } from "@/components/global-deployment/GlobalDeploymentView";
import { GlobalDeploymentPageLoader } from "@/components/global-deployment/GlobalDeploymentPageLoader";
import { getPublicDeploymentTree } from "@/lib/deployments/publicTree";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Global deployment",
  description:
    "Explore Keyra's published regional, country, and operator deployment posture — calm, structured, and institutionally grounded.",
};

function ViewFallback() {
  return <GlobalDeploymentPageLoader />;
}

export default async function GlobalDeploymentHomePage() {
  const tree = await getPublicDeploymentTree();

  return (
    <>
      <GlobalDeploymentHero />
      <DeploymentErrorBoundary>
        <Suspense fallback={<ViewFallback />}>
          <GlobalDeploymentView initialTree={tree} />
        </Suspense>
      </DeploymentErrorBoundary>
    </>
  );
}
