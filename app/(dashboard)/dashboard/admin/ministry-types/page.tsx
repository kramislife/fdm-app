import { requireRole } from "@/lib/auth";
import { getMinistryTypes } from "@/lib/data/ministry-types";
import { parseTableParams, toPagination, type PageProps } from "@/lib/table";
import { AdminPage, type Column } from "@/components/admin";

const columns: Column[] = [
  { key: "name", label: "Name", sortable: true },
  { key: "description", label: "Description" },
];

export default async function MinistryTypesPage({ searchParams }: PageProps) {
  await requireRole(["spiritual_director", "elder"]);

  const { search, page, perPage, sort, order } = parseTableParams(
    await searchParams,
    "name",
  );

  const result = await getMinistryTypes({
    search: search || undefined,
    page,
    perPage,
    sort,
    order,
  });

  const data = result.data.map((mt) => ({
    name: mt.name,
    description: mt.description ?? "—",
  }));

  return (
    <AdminPage
      title="Ministry Types"
      description="View all ministry types defined in the system."
      columns={columns}
      data={data}
      pagination={toPagination(result)}
    />
  );
}
