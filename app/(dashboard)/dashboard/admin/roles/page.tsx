import { requireRole } from "@/lib/auth";
import { getRoles } from "@/lib/data/roles";
import { parseTableParams, toPagination, type PageProps } from "@/lib/table";
import { AdminPage, type Column } from "@/components/admin";

const columns: Column[] = [
  { key: "name", label: "Name", sortable: true },
  { key: "scope", label: "Scope", sortable: true },
];

export default async function RolesPage({ searchParams }: PageProps) {
  await requireRole(["spiritual_director", "elder"]);

  const { search, page, perPage, sort, order } = parseTableParams(
    await searchParams,
    "name",
  );

  const result = await getRoles({
    search: search || undefined,
    page,
    perPage,
    sort,
    order,
  });

  const data = result.data.map((role) => ({
    name: role.name,
    scope: role.scope,
  }));

  return (
    <AdminPage
      title="Role Management"
      description="View all community roles and their scopes."
      columns={columns}
      data={data}
      pagination={toPagination(result)}
    />
  );
}
