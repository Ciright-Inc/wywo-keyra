"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";

type Member = { name: string; status: "Protected" | "Needs verification" };

export default function FamilyPage() {
  const { push } = useToast();
  const [name, setName] = useState("");
  const [members, setMembers] = useState<Member[]>([
    { name: "You", status: "Protected" },
  ]);

  function add() {
    const trimmed = name.trim();
    if (!trimmed) return;
    setMembers((m) => [...m, { name: trimmed, status: "Protected" }]);
    setName("");
    push({ kind: "success", title: "Added", message: `${trimmed} is protected.` });
  }

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-[36px] font-bold tracking-tight text-kerya-primary sm:text-[44px]">
        Family
      </h1>
      <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-kerya-text-2 sm:text-[18px]">
        Simple protection for the people you care about.
      </p>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Add a family member"
            description="Invite someone in seconds."
          />
          <div className="mt-6 space-y-4">
            <Input
              id="family-name"
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex"
            />
            <Button onClick={add}>Add</Button>
            <p className="text-[14px] text-kerya-text-2">
              You can remove or change this later.
            </p>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Protection status"
            description="A calm overview."
          />
          <ul className="mt-6 space-y-3">
            {members.map((m) => (
              <li
                key={m.name}
                className="flex items-center justify-between rounded-[var(--keyra-radius-card)] bg-kerya-bg px-4 py-3"
              >
                <span className="text-[14px] font-medium text-kerya-text">
                  {m.name}
                </span>
                <span className="text-[14px] text-kerya-text-2">{m.status}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

