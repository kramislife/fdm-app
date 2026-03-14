import { requireRole } from "@/lib/auth";
import { getEventTypes } from "@/lib/data/event-types";
import { parseTableParams, toPagination, type PageProps } from "@/lib/table";
import { AdminPage, type Column } from "@/components/admin";
import {
  StatusBadge,
  CreatorCell,
  DateCell,
  TextCell,
} from "@/components/shared/cells";

const columns: Column[] = [
  { key: "name", label: "Name", sortable: true },
  { key: "description", label: "Description", maxWidth: "250px" },
  { key: "status", label: "Status" },
  { key: "createdBy", label: "Created By" },
  { key: "createdAt", label: "Created At", sortable: true },
  { key: "updatedAt", label: "Updated At", sortable: true },
];

export default async function EventTypesPage({ searchParams }: PageProps) {
  await requireRole(["spiritual_director", "elder"]);

  const { search, page, perPage, sort, order } = parseTableParams(
    await searchParams,
    "created_at",
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
    description: <TextCell value={et.description} />,
    status: <StatusBadge isActive={et.is_active} />,
    createdBy: <CreatorCell creator={et.creator} />,
    createdAt: <DateCell date={et.created_at} />,
    updatedAt: <DateCell date={et.updated_at} />,
  }));

  return (
    <AdminPage
      title="Event Types"
      description="View and manage all types of events"
      columns={columns}
      data={data}
      pagination={toPagination(result)}
      defaultSort="created_at"
    />
  );
}
