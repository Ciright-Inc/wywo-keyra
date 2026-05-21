import HostedLoginClient from "./HostedLoginClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in — Keyra",
  robots: { index: false, follow: false },
};

export default function HostedLoginPage() {
  return (
    <>
      <style>{`
        .hosted-login-root {
          min-height: 100dvh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: max(2rem, env(safe-area-inset-top)) 1.25rem max(2rem, env(safe-area-inset-bottom));
          font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
          background: radial-gradient(ellipse at top, #0f172a 0%, #020617 55%);
          color: #e2e8f0;
        }
        .hosted-login-root h1 {
          margin: 0 0 0.5rem;
          font-size: 1.35rem;
          font-weight: 600;
          letter-spacing: -0.02em;
        }
        .hosted-login-sub {
          margin: 0 0 1.5rem;
          max-width: 28rem;
          text-align: center;
          color: #94a3b8;
          font-size: 0.95rem;
          line-height: 1.5;
        }
        .hosted-login-muted {
          margin: 1rem 0 0;
          color: #64748b;
          font-size: 0.875rem;
        }
        .hosted-login-error {
          max-width: 28rem;
          text-align: center;
          color: #fca5a5;
          font-size: 0.9rem;
        }
        .hosted-login-qr {
          border-radius: 12px;
          background: #fff;
          padding: 12px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35);
        }
        .hosted-login-hint {
          max-width: 26rem;
          margin: 0 0 1.25rem;
          text-align: center;
          color: #94a3b8;
          font-size: 0.8rem;
          line-height: 1.45;
        }
        .hosted-login-code {
          font-size: 0.75rem;
          padding: 0.1em 0.35em;
          border-radius: 4px;
          background: rgba(148, 163, 184, 0.15);
          color: #cbd5e1;
        }
        .hosted-login-link-box {
          margin-top: 1.5rem;
          max-width: min(100%, 28rem);
          width: 100%;
          padding: 1rem 1.1rem;
          border-radius: 12px;
          background: rgba(15, 23, 42, 0.65);
          border: 1px solid rgba(148, 163, 184, 0.25);
        }
        .hosted-login-link-label {
          margin: 0 0 0.5rem;
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #64748b;
        }
        .hosted-login-link {
          display: block;
          word-break: break-all;
          font-size: 0.8rem;
          color: #7dd3fc;
          text-decoration: underline;
          margin-bottom: 0.75rem;
        }
        .hosted-login-copy {
          cursor: pointer;
          font-size: 0.85rem;
          padding: 0.45rem 0.9rem;
          border-radius: 8px;
          border: 1px solid rgba(148, 163, 184, 0.4);
          background: rgba(30, 41, 59, 0.9);
          color: #e2e8f0;
        }
        .hosted-login-copy:hover:not(:disabled) {
          background: rgba(51, 65, 85, 0.95);
        }
        .hosted-login-copy:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
      `}</style>
      <HostedLoginClient />
    </>
  );
}
