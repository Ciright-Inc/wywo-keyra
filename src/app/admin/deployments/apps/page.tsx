import Image from "next/image";
import { getKeyraAdminAppLinks } from "@/lib/keyraAppUrls";

function AppListIcon({ label }: { label: string }) {
  return (
    <span className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-black/20 bg-keyra-bg text-xs font-semibold text-keyra-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
      <Image
        src="/keyra-app-mark.png"
        alt=""
        fill
        sizes="40px"
        className="scale-[1.18] object-contain opacity-35"
        aria-hidden
        unoptimized
      />
      <span className="relative rounded-sm bg-white px-0.5 py-0.5 text-[10px] leading-none shadow-sm ring-1 ring-black/[0.06]">
        {label.slice(0, 2).toUpperCase()}
      </span>
    </span>
  );
}

export default async function AdminDeploymentAppsPage() {
  const apps = getKeyraAdminAppLinks();
  const sections = [
    {
      title: "Core apps",
      apps: apps.filter((app) =>
        ["keyra", "get-started", "developer", "settings", "my-account", "app", "authenticator", "admin"].includes(
          app.id,
        ),
      ),
    },
    {
      title: "Media & engagement",
      apps: apps.filter((app) =>
        ["press", "affiliates", "directors", "video", "event", "podcast", "ve"].includes(app.id),
      ),
    },
    {
      title: "Operations",
      apps: apps.filter((app) =>
        ["info", "family-office", "ftp", "jione-documents", "investor", "esim", "analytics", "drive"].includes(app.id),
      ),
    },
  ];

  return (
    <div>
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold text-keyra-primary">Apps</h1>
          <span className="rounded-full border border-keyra-border bg-keyra-surface px-3 py-1 text-xs font-medium text-keyra-text-2">
            {apps.length}
          </span>
        </div>
        <p className="mt-2 text-sm text-keyra-text-2">
          Select an app to open its configured destination.
        </p>
      </div>

      <div className="mt-8 grid gap-4 xl:grid-cols-3">
        {sections.map((section) => (
          <section
            key={section.title}
            className="rounded-3xl border border-keyra-border bg-keyra-surface/45 p-3 shadow-[0_18px_54px_rgba(0,0,0,0.04)]"
          >
            <div className="flex items-center justify-between px-2 pb-3 pt-1">
              <h2 className="text-sm font-semibold text-keyra-primary">{section.title}</h2>
              <span className="rounded-full border border-keyra-border bg-keyra-bg px-2 py-0.5 text-[11px] text-keyra-text-2">
                {section.apps.length}
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              {section.apps.map((app) => (
                <a
                  key={app.id}
                  href={app.href}
                  className="group flex items-center justify-between gap-4 rounded-2xl border border-keyra-border bg-keyra-surface/70 px-4 py-3 transition hover:border-keyra-accent/40 hover:bg-keyra-surface"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <AppListIcon label={app.label} />
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-keyra-primary">{app.label}</h3>
                      <p className="mt-1 truncate text-sm text-keyra-text-2">{app.description}</p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full px-2 py-1 text-sm font-medium text-keyra-accent transition group-hover:bg-[var(--keyra-action)] group-hover:text-keyra-primary">
                    <svg
                      className="block size-3.5 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      viewBox="0 0 16 16"
                      fill="none"
                      aria-hidden
                    >
                      <path
                        d="M4.5 11.5 11.5 4.5M6 4.5h5.5V10"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </a>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
