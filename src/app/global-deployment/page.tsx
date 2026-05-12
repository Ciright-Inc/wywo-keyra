import type { Metadata } from "next";
import { Suspense } from "react";
import { DeploymentErrorBoundary } from "@/components/global-deployment/DeploymentErrorBoundary";
import { GlobalDeploymentHero } from "@/components/global-deployment/GlobalDeploymentHero";
import { GlobalDeploymentView } from "@/components/global-deployment/GlobalDeploymentView";
import { LoadingSkeleton } from "@/components/global-deployment/LoadingSkeleton";
import { getPublicDeploymentTree } from "@/lib/deployments/publicTree";

export const metadata: Metadata = {
  title: "Global deployment",
  description:
    "Explore Keyra’s published regional, country, and operator deployment posture — calm, structured, and institutionally grounded.",
};

function ViewFallback() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <LoadingSkeleton />
    </div>
  );
}

export default async function GlobalDeploymentPage() {
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
