import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { IconShieldCheck } from "@/components/ui/Icons";

export default function OnboardingCompletePage() {
  return (
    <div className="bg-keyra-bg px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-[720px]">
        <h1 className="text-3xl font-bold tracking-tight text-keyra-primary sm:text-[36px] lg:text-[44px]">
          You’re protected
        </h1>
        <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-keyra-text-2 sm:text-[18px]">
          Keyra is now active. You don’t need to think about it — just enjoy the
          feeling of being protected.
        </p>

        <Card className="mt-10 p-7">
          <CardHeader
            title="Protection status"
            description="Active and working quietly in the background."
            icon={<IconShieldCheck className="h-5 w-5" />}
          />
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/app" className="inline-flex">
              <Button>Go to dashboard</Button>
            </Link>
            <Link href="/app/family" className="inline-flex">
              <Button variant="secondary">Add your family</Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

