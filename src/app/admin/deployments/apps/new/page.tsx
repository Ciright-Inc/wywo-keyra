import Link from "next/link";
import { AppForm } from "../AppForm";

export default function NewDeploymentAppPage() {
  return (
    <div className="max-w-3xl">
      <Link
        href="/admin/deployments/apps"
        className="text-sm font-medium text-keyra-text-2 underline-offset-4 transition hover:text-keyra-primary hover:underline"
      >
        &lt;- Back to apps
      </Link>

      <div className="mt-6 rounded-3xl border border-keyra-border bg-keyra-surface p-6 shadow-[0_24px_70px_rgba(0,0,0,0.06)] sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-keyra-text-2">App directory</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-keyra-primary">Create new app</h1>
        <p className="mt-3 text-sm leading-6 text-keyra-text-2">
          Add the app details here. Saved apps are stored in the database and appear on the Apps tab.
        </p>

        <AppForm mode="create" />
      </div>
    </div>
  );
}
