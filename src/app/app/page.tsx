import Link from "next/link";
import { Button } from "@/components/ui/Button";
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
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-keyra-primary sm:text-[36px] lg:text-[44px]">
            Protected
          </h1>
          <p className="mt-3 max-w-xl text-[16px] leading-relaxed text-keyra-text-2 sm:text-[18px]">
            Keyra is active. Your protection is on — quietly and consistently.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/verify" className="inline-flex">
            <Button>Verify now</Button>
          </Link>
          <Link href="/app/settings" className="inline-flex">
            <Button variant="secondary">Protection settings</Button>
          </Link>
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
            <li className="flex flex-col gap-1 rounded-[var(--keyra-radius-card)] bg-keyra-bg px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <span>Verified on this device</span>
              <span className="text-keyra-text-2 sm:text-inherit">Today</span>
            </li>
            <li className="flex flex-col gap-1 rounded-[var(--keyra-radius-card)] bg-keyra-bg px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <span>New sign‑in protected</span>
              <span className="text-keyra-text-2 sm:text-inherit">Yesterday</span>
            </li>
            <li className="flex flex-col gap-1 rounded-[var(--keyra-radius-card)] bg-keyra-bg px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <span>Protection check completed</span>
              <span className="text-keyra-text-2 sm:text-inherit">This week</span>
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
            <Link href="/app/settings" className="inline-flex">
              <Button variant="secondary">Manage devices</Button>
            </Link>
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader
            title="Peace of mind"
            description="Simple by design."
          />
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

