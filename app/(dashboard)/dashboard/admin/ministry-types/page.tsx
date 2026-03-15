import { requireRole } from "@/lib/auth";
import { getMinistryTypes } from "@/lib/data/ministry-types";
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
  { key: "description", label: "Description", maxWidth: "500px" },
  { key: "status", label: "Status" },
  { key: "createdBy", label: "Created By" },
  { key: "createdAt", label: "Created At", sortable: true },
  { key: "updatedAt", label: "Updated At", sortable: true },
];

export default async function MinistryTypesPage({ searchParams }: PageProps) {
  await requireRole(["spiritual_director", "elder"]);

  const { search, page, perPage, sort, order } = parseTableParams(
    await searchParams,
    "created_at",
  );

  const result = await getMinistryTypes({
    search: search || undefined,
    page,
    perPage,
    sort,
    order,
  });

  const data = result.data.map((mt) => ({
    name: <TextCell value={mt.name} />,
    description: <TextCell value={mt.description} />,
    status: <StatusBadge isActive={mt.is_active} />,
    createdBy: <UserCell user={mt.creator} />,
    createdAt: <DateCell date={mt.created_at} />,
    updatedAt: <DateCell date={mt.updated_at} />,
  }));

  return (
    <AdminPage
      title="Ministry Types"
      description="View and manage all types of ministries"
      columns={columns}
      data={data}
      pagination={toPagination(result)}
      defaultSort="created_at"
    />
  );
}
