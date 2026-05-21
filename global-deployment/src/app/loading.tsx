import { KeyraTrustLoader } from "@/components/ui/KeyraTrustLoader";

export default function RootLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center bg-keyra-bg px-4">
      <KeyraTrustLoader variant="page" label="Loading Keyra" />
    </div>
  );
}
