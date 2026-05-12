import Link from "next/link";
import prisma from "@/lib/prisma";
import { assertAdminServer } from "@/lib/assertAdminServer";
import { regionWhereFromAuth } from "@/lib/deployments/adminContext";
import { createRegion } from "@/app/admin/deployments/actions";
import { Button } from "@/components/ui/Button";
import { canCreateRegion } from "@/lib/deployments/adminAuthz";

export default async function AdminRegionsPage() {
  const auth = await assertAdminServer();
  const rw = await regionWhereFromAuth(auth);
  const regions = await prisma.region.findMany({
    where: rw ?? {},
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  const showCreate = auth.kind === "legacy_super" || (auth.kind === "user" && canCreateRegion(auth));

  return (
    <div>
      <h1 className="text-2xl font-semibold text-keyra-primary">Regions</h1>
      <p className="mt-2 text-sm text-keyra-text-2">Formal UN M49 macro + subregion codes, with UI map keys.</p>

      <div className="mt-8 overflow-x-auto rounded-[var(--keyra-radius-card)] border border-keyra-border">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead className="bg-[rgba(255,255,255,0.03)] text-xs uppercase tracking-wider text-keyra-text-2">
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Slug</th>
              <th className="px-3 py-2">Map</th>
              <th className="px-3 py-2">Published</th>
              <th className="px-3 py-2 text-right">Edit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-keyra-border">
            {regions.map((r) => (
              <tr key={r.id}>
                <td className="px-3 py-3 text-keyra-primary">{r.name}</td>
                <td className="px-3 py-3 text-keyra-text-2">{r.slug}</td>
                <td className="px-3 py-3 text-keyra-text-2">{r.mapKey}</td>
                <td className="px-3 py-3 text-keyra-text-2">{r.isPublished ? "Yes" : "No"}</td>
                <td className="px-3 py-3 text-right">
                  <Link
                    href={`/admin/deployments/regions/${r.id}`}
                    className="text-keyra-accent underline-offset-4 hover:underline"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreate ? (
      <div className="mt-10 keyra-card p-6">
        <h2 className="text-lg font-semibold text-keyra-primary">Create region</h2>
        <form action={createRegion} className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-sm text-keyra-text-2 sm:col-span-2">
            Name
            <input name="name" required className="mt-1 w-full rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-sm text-keyra-primary" />
          </label>
          <label className="text-sm text-keyra-text-2">
            Slug
            <input name="slug" required className="mt-1 w-full rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-sm text-keyra-primary" />
          </label>
          <label className="text-sm text-keyra-text-2">
            Map key
            <input name="mapKey" required className="mt-1 w-full rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-sm text-keyra-primary" />
          </label>
          <label className="text-sm text-keyra-text-2">
            Continent code (M49)
            <input name="continentCode" required className="mt-1 w-full rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-sm text-keyra-primary" />
          </label>
          <label className="text-sm text-keyra-text-2">
            Subregion code (M49)
            <input name="subregionCode" required className="mt-1 w-full rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-sm text-keyra-primary" />
          </label>
          <label className="text-sm text-keyra-text-2">
            Sort order
            <input name="sortOrder" defaultValue="0" className="mt-1 w-full rounded-md border border-keyra-border bg-keyra-bg px-3 py-2 text-sm text-keyra-primary" />
          </label>
          <label className="flex items-center gap-2 text-sm text-keyra-text-2 sm:col-span-2">
            <input name="isPublished" type="checkbox" className="size-4" />
            Published
          </label>
          <div className="sm:col-span-2">
            <Button type="submit" variant="primary">
              Create
            </Button>
          </div>
        </form>
      </div>
      ) : (
        <p className="mt-10 text-sm text-keyra-text-2">You do not have permission to create regions.</p>
      )}
    </div>
  );
}
