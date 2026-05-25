"use client";

import { CONSULTATION_TOPICS } from "@/lib/consultation/constants";
import type { ReactNode } from "react";

export const consultField =
  "w-full rounded-xl border border-keyra-border bg-keyra-surface px-4 py-3 text-sm text-keyra-ink outline-none transition placeholder:text-keyra-muted/70 focus-visible:border-keyra-text focus-visible:ring-2 focus-visible:ring-keyra-text/15";

export const consultFieldErr =
  "border-black/40 focus-visible:border-keyra-text focus-visible:ring-2 focus-visible:ring-black/12";

export const consultLabel =
  "mb-2 block text-sm font-medium text-keyra-primary";

export function ConsultFieldError({ id, text }: { id: string; text: string }) {
  return (
    <p id={id} className="mt-1.5 text-sm font-medium text-keyra-text" role="alert">
      {text}
    </p>
  );
}

export function ConsultSectionTitle({
  children,
  sub,
}: {
  children: ReactNode;
  sub?: string;
}) {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold tracking-tight text-keyra-primary">
        {children}
      </h3>
      {sub ? (
        <p className="mt-1 text-sm leading-relaxed text-keyra-muted">{sub}</p>
      ) : null}
    </div>
  );
}

export function TopicCheckboxGrid({
  selected,
  onChange,
  error,
}: {
  selected: string[];
  onChange: (topics: string[]) => void;
  error?: string;
}) {
  function toggle(topic: string) {
    if (selected.includes(topic)) {
      onChange(selected.filter((t) => t !== topic));
    } else {
      onChange([...selected, topic]);
    }
  }

  return (
    <div>
      <div className="grid gap-2 sm:grid-cols-2">
        {CONSULTATION_TOPICS.map((topic) => {
          const checked = selected.includes(topic);
          return (
            <label
              key={topic}
              className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 text-sm transition ${
                checked
                  ? "border-keyra-text/30 bg-keyra-surface-2"
                  : "border-keyra-border/60 bg-keyra-surface hover:border-keyra-border"
              }`}
            >
              <input
                type="checkbox"
                className="mt-0.5 size-4 shrink-0 accent-keyra-text"
                checked={checked}
                onChange={() => toggle(topic)}
              />
              <span className="text-keyra-ink">{topic}</span>
            </label>
          );
        })}
      </div>
      {error ? (
        <ConsultFieldError id="topics-error" text={error} />
      ) : null}
    </div>
  );
}
