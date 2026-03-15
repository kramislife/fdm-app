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
  { key: "province", label: "Province", sortable: true },
  { key: "fellowship_day", label: "Fellowship Day" },
  { key: "status", label: "Status" },
  { key: "created_by", label: "Created By" },
  { key: "created_at", label: "Created At", sortable: true },
  { key: "updated_at", label: "Updated At", sortable: true },
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
    province: <TextCell value={chapter.province} />,
    fellowship_day: <TextCell value={chapter.fellowship_day} />,
    status: <StatusBadge isActive={chapter.is_active} />,
    created_by: <UserCell user={chapter.creator} />,
    created_at: <DateCell date={chapter.created_at} />,
    updated_at: <DateCell date={chapter.updated_at} />,
  }));

  return (
    <AdminPage
      title="Chapters"
      description="View all FDM chapters across Metro Manila and nearby provinces"
      columns={columns}
      data={data}
      pagination={toPagination(result)}
    />
  );
}
