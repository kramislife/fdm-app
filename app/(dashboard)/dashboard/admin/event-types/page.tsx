import { requireRole } from "@/lib/auth";
import { getEventTypes } from "@/lib/data/event-types";
import { parseTableParams, toPagination, type PageProps } from "@/lib/table";
import { AdminPage, type Column } from "@/components/admin";
import {
  StatusBadge,
  UserCell,
  DateCell,
  TextCell,
} from "@/components/shared/cells";

const columns: Column[] = [
  { key: "name", label: "Name", sortable: true },
  { key: "description", label: "Description", maxWidth: "400px" },
  { key: "status", label: "Status" },
  { key: "created_by", label: "Created By" },
  { key: "created_at", label: "Created At", sortable: true },
  { key: "updated_at", label: "Updated At", sortable: true },
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
    name: <TextCell value={et.name} />,
    description: <TextCell value={et.description} />,
    status: <StatusBadge isActive={et.is_active} />,
    created_by: <UserCell user={et.creator} />,
    created_at: <DateCell date={et.created_at} />,
    updated_at: <DateCell date={et.updated_at} />,
  }));

  return (
    <AdminPage
      title="Event Types"
      description="View and manage all types of events"
      columns={columns}
      data={data}
      pagination={toPagination(result)}
    />
  );
}
