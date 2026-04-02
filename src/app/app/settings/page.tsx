"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

export default function SettingsPage() {
  const { push } = useToast();
  const [open, setOpen] = useState(false);

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-[36px] font-bold tracking-tight text-kerya-text sm:text-[44px]">
        Settings
      </h1>
      <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-kerya-text-2 sm:text-[18px]">
        Calm, simple control. Nothing technical.
      </p>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Profile" description="Your basics." />
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <Input id="profile-name" label="Name" defaultValue="You" />
            <Input
              id="profile-email"
              label="Email"
              type="email"
              defaultValue="you@example.com"
            />
          </div>
          <div className="mt-6">
            <Button
              variant="secondary"
              onClick={() =>
                push({
                  kind: "success",
                  title: "Saved",
                  message: "Your profile is updated.",
                })
              }
            >
              Save
            </Button>
          </div>
        </Card>

        <Card>
          <CardHeader title="Protection" description="Keep it simple." />
          <div className="mt-6 space-y-3 text-[14px] text-kerya-text-2">
            <p>Verification: On</p>
            <p>Device checks: On</p>
            <p>Family protection: On</p>
          </div>
          <div className="mt-6">
            <Button variant="secondary" onClick={() => setOpen(true)}>
              View details
            </Button>
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader title="Devices" description="Manage where you’re protected." />
          <ul className="mt-6 space-y-3 text-[14px] text-kerya-text-2">
            <li className="rounded-[12px] bg-kerya-bg px-4 py-3">
              iPhone • Active
            </li>
            <li className="rounded-[12px] bg-kerya-bg px-4 py-3">
              MacBook • Active
            </li>
          </ul>
        </Card>
        <Card>
          <CardHeader
            title="Notifications"
            description="Only what’s useful."
          />
          <p className="mt-6 text-[14px] leading-relaxed text-kerya-text-2">
            We keep notifications minimal. You’ll only hear from us when it
            matters.
          </p>
        </Card>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Protection details"
        footer={
          <div className="flex justify-end">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
        }
      >
        <p className="text-[16px] leading-relaxed text-kerya-text-2">
          KEYRA keeps protection on in the background. You can verify when you
          want, review devices, and manage family protection — without digging
          through technical settings.
        </p>
      </Modal>
    </div>
  );
}

