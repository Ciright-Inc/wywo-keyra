import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card, CardHeader } from "@/components/ui/Card";
import { IconDevices, IconShieldCheck } from "@/components/ui/Icons";

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[14px] font-medium uppercase tracking-wider text-keyra-text-2">
            Status
          </p>
          <h1 className="mt-2 text-[36px] font-bold tracking-tight text-keyra-primary sm:text-[44px]">
            Protected
          </h1>
          <p className="mt-3 max-w-xl text-[16px] leading-relaxed text-keyra-text-2 sm:text-[18px]">
            Keyra is active. Your protection is on — quietly and consistently.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/verify">Verify now</ButtonLink>
        </div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Recent activity"
            description="A simple view of what changed recently."
            icon={<IconShieldCheck className="h-5 w-5" />}
          />
          <ul className="mt-6 space-y-3 text-[14px] text-keyra-text-2">
            <li className="flex items-center justify-between rounded-[var(--keyra-radius-card)] bg-keyra-bg px-4 py-3">
              <span>Verified on this device</span>
              <span>Today</span>
            </li>
            <li className="flex items-center justify-between rounded-[var(--keyra-radius-card)] bg-keyra-bg px-4 py-3">
              <span>New sign‑in protected</span>
              <span>Yesterday</span>
            </li>
            <li className="flex items-center justify-between rounded-[var(--keyra-radius-card)] bg-keyra-bg px-4 py-3">
              <span>Protection check completed</span>
              <span>This week</span>
            </li>
          </ul>
        </Card>

        <Card>
          <CardHeader
            title="Devices"
            description="Where you’re protected."
            icon={<IconDevices className="h-5 w-5" />}
          />
          <ul className="mt-6 space-y-3 text-[14px] text-keyra-text-2">
            <li className="rounded-[var(--keyra-radius-card)] bg-keyra-bg px-4 py-3">
              iPhone • Active
            </li>
            <li className="rounded-[var(--keyra-radius-card)] bg-keyra-bg px-4 py-3">
              MacBook • Active
            </li>
          </ul>
          <div className="mt-6">
            <ButtonLink href="/app/settings" variant="secondary">
              Manage devices
            </ButtonLink>
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader
            title="Family"
            description="Protection for the people you care about."
          />
          <p className="mt-4 text-[14px] leading-relaxed text-keyra-text-2">
            Add a family member in seconds. Keep their protection visible and
            simple.
          </p>
          <div className="mt-6">
            <ButtonLink href="/app/family" variant="secondary">
              Open family view
            </ButtonLink>
          </div>
        </Card>

        <Card>
          <CardHeader title="Peace of mind" description="Simple by design." />
          <ul className="mt-4 space-y-2 text-[14px] text-keyra-text-2">
            <li>No codes to chase</li>
            <li>No confusing settings</li>
            <li>Clear, calm control</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
