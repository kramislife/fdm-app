import { requireRole } from "@/lib/auth";
import { getChapters } from "@/lib/data/chapters";
import { PERMISSION_ROLES } from "@/lib/app-roles";
import { parseTableParams, toPagination, type PageProps } from "@/lib/table";
import { ChaptersClient, type ChapterRow } from "./chapters-client";

export default async function ChaptersPage({ searchParams }: PageProps) {
  await requireRole([...PERMISSION_ROLES.SUPER_ADMIN]);

  const { search, page, perPage, sort, order } = parseTableParams(
    await searchParams,
  );

  const result = await getChapters({
    search: search || undefined,
    page,
    perPage,
    sort,
    order,
  });

  const chapters: ChapterRow[] = result.data.map((ch) => ({
    id: ch.id,
    name: ch.name,
    region: ch.region,
    region_code: ch.region_code ?? "",
    province: ch.province,
    province_code: ch.province_code ?? "",
    city: ch.city,
    city_code: ch.city_code ?? "",
    barangay: ch.barangay,
    barangay_code: ch.barangay_code ?? "",
    street: ch.street ?? null,
    google_maps_url: ch.google_maps_url ?? null,
    landmark: ch.landmark ?? null,
    fellowship_day: ch.fellowship_day ?? null,
    is_active: ch.is_active,
    member_count: ch._count.user_chapters,
    created_at: ch.created_at.toISOString(),
    updated_at: ch.updated_at.toISOString(),
    creator: ch.creator ?? null,
    updated_by: ch.updated_by_user ?? null,
  }));

  return (
    <ChaptersClient chapters={chapters} pagination={toPagination(result)} />
  );
}
