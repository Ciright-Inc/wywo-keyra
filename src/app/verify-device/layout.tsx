import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify phone — Keyra",
  robots: { index: false, follow: false },
};

export default function VerifyDeviceLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        .verify-device-root {
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
        .verify-device-card {
          width: 100%;
          max-width: 28rem;
          padding: 1.5rem;
          border-radius: 1rem;
          background: rgba(15, 23, 42, 0.85);
          border: 1px solid rgba(148, 163, 184, 0.25);
        }
        .verify-device-card h1 {
          margin: 0 0 0.5rem;
          font-size: 1.2rem;
          font-weight: 600;
        }
        .verify-device-card p {
          margin: 0 0 1rem;
          font-size: 0.9rem;
          color: #94a3b8;
          line-height: 1.5;
        }
        .verify-device-input {
          width: 100%;
          box-sizing: border-box;
          padding: 0.6rem 0.75rem;
          border-radius: 0.5rem;
          border: 1px solid rgba(148, 163, 184, 0.35);
          background: rgba(15, 23, 42, 0.9);
          color: #f1f5f9;
          font-size: 0.95rem;
          margin-bottom: 0.75rem;
        }
        .verify-device-btn {
          width: 100%;
          padding: 0.55rem 1rem;
          border-radius: 0.5rem;
          border: none;
          background: #0ea5e9;
          color: #0f172a;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
        }
        .verify-device-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .verify-device-msg {
          padding: 0.75rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          margin-top: 0.75rem;
        }
        .verify-device-msg.err {
          border: 1px solid rgba(248, 113, 113, 0.4);
          background: rgba(127, 29, 29, 0.25);
          color: #fecaca;
        }
        .verify-device-msg.ok {
          border: 1px solid rgba(52, 211, 153, 0.35);
          background: rgba(6, 78, 59, 0.25);
          color: #a7f3d0;
        }
      `}</style>
      {children}
    </>
  );
}
