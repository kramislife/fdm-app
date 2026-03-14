import { requireRole } from "@/lib/auth";
import { getEventTypes } from "@/lib/data/event-types";
import { parseTableParams, toPagination, type PageProps } from "@/lib/table";
import { AdminPage, type Column } from "@/components/admin";

const columns: Column[] = [
  { key: "name", label: "Name", sortable: true },
  { key: "description", label: "Description" },
];

export default async function EventTypesPage({ searchParams }: PageProps) {
  await requireRole(["spiritual_director", "elder"]);

  const { search, page, perPage, sort, order } = parseTableParams(
    await searchParams,
    "name",
  );

  const result = await getEventTypes({
    search: search || undefined,
    page,
    perPage,
    sort,
    order,
  });

  const data = result.data.map((et) => ({
    name: et.name,
    description: et.description ?? "—",
  }));

  return (
    <AdminPage
      title="Event Types"
      description="View all event types defined in the system."
      columns={columns}
      data={data}
      pagination={toPagination(result)}
    />
  );
}
