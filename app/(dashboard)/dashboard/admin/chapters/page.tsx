import { requireRole } from "@/lib/auth";
import { getChapters } from "@/lib/data/chapters";
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
  { key: "location", label: "Location", sortable: true },
  { key: "fellowshipDay", label: "Fellowship Day" },
  { key: "status", label: "Status" },
  { key: "createdBy", label: "Created By" },
  { key: "createdAt", label: "Created At", sortable: true },
  { key: "updatedAt", label: "Updated At", sortable: true },
];

export default async function ChaptersPage({ searchParams }: PageProps) {
  await requireRole(["spiritual_director", "elder"]);

  const { search, page, perPage, sort, order } = parseTableParams(
    await searchParams,
    "created_at",
  );

  const result = await getChapters({
    search: search || undefined,
    page,
    perPage,
    sort,
    order,
  });

  const data = result.data.map((chapter) => ({
    name: <TextCell value={chapter.name} />,
    location: <TextCell value={chapter.location} />,
    fellowshipDay: <TextCell value={chapter.fellowship_day} />,
    status: <StatusBadge isActive={chapter.is_active} />,
    createdBy: <UserCell user={chapter.creator} />,
    createdAt: <DateCell date={chapter.created_at} />,
    updatedAt: <DateCell date={chapter.updated_at} />,
  }));

  return (
    <AdminPage
      title="Chapters"
      description="View all FDM chapters across Metro Manila and nearby provinces"
      columns={columns}
      data={data}
      pagination={toPagination(result)}
      defaultSort="created_at"
    />
  );
}
