"use client";

import Link from "next/link";
import { useEffect } from "react";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

/**
 * WYWO dashboard shell error — usually Postgres / WYWO schema not ready on Railway.
 */
export default function WywoShellError({ error, reset }: Props) {
  useEffect(() => {
    console.error("[wywo] dashboard render failed", error.digest ?? error.message);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4 px-4 py-16">
      <p className="keyra-eyebrow">WYWO · While You Were Out</p>
      <h1 className="keyra-display-trust text-2xl">Dashboard unavailable</h1>
      <p className="keyra-prose-trust">
        Signed-in navigation loaded, but the trusted inbox could not be read from the database.
        This usually means the WYWO Postgres schema is missing or still applying on deploy.
      </p>
      <ul className="ds-body-sm list-disc space-y-1 pl-5 text-[var(--ds-ink-muted)]">
        <li>
          Confirm <code className="ds-caption">DATABASE_URL</code> is set on the Railway service
          (same Postgres as Keyra / auth when shared).
        </li>
        <li>
          Redeploy so startup runs <code className="ds-caption">prisma-wywo-setup</code> (included in{" "}
          <code className="ds-caption">npm start</code>).
        </li>
        <li>
          Set <code className="ds-caption">KEYRA_SESSION_SECRET</code> and{" "}
          <code className="ds-caption">WYWO_MESSAGE_SECRET</code> in production.
        </li>
      </ul>
      {error.digest ? (
        <p className="ds-caption ds-numeric text-[var(--ds-ink-muted)]">Reference: {error.digest}</p>
      ) : null}
      <div className="flex flex-wrap gap-2 pt-2">
        <button type="button" className="ds-btn-primary" onClick={() => reset()}>
          Try again
        </button>
        <Link href="/wywo" className="ds-btn-secondary">
          Back to slip
        </Link>
      </div>
    </div>
  );
}
