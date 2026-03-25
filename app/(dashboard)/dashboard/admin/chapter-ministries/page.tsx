import { requireAuth } from "@/lib/auth/config";
import { getUserWithRole } from "@/lib/auth/roles";
import { getChapterMinistries } from "@/lib/data/chapter-ministries";
import { PERMISSION_ROLES } from "@/lib/constants/app-roles";
import {
  parseTableParams,
  toPagination,
  type PageProps,
} from "@/lib/utils/table";
import {
  ChapterMinistriesClient,
  type ChapterMinistryRow,
} from "./chapter-ministries-client";

export default async function ChapterMinistriesPage({
  searchParams,
}: PageProps) {
  const authUser = await requireAuth();

  const { search, page, perPage, sort, order } = parseTableParams(
    await searchParams,
  );

  const userData = await getUserWithRole(authUser.id);
  if (!userData) return null;

  const { roles, chapter: userChapter } = userData;
  const isSuperAdmin = roles.some((r) =>
    PERMISSION_ROLES.SUPER_ADMIN.some((allowedRole) => allowedRole === r),
  );

  const result = await getChapterMinistries({
    search: search || undefined,
    page,
    perPage,
    sort,
    order,
    chapterId: !isSuperAdmin && userChapter ? userChapter.id : undefined,
  });

  const chapterMinistries: ChapterMinistryRow[] = result.data.map((m) => ({
    id: m.id,
    name: m.ministry_type.name,
    ministryTypeKey: m.ministry_type.key,
    chapter_id: m.chapter.id,
    chapter_name: m.chapter.name,
    member_count: m._count.ministry_members,
    head: m.head ?? null,
    updated_at: m.updated_at.toISOString(),
    updated_by: m.updater,
  }));

  return (
    <ChapterMinistriesClient
      chapterMinistries={chapterMinistries}
      pagination={toPagination(result)}
      isSuperAdmin={isSuperAdmin}
      userChapter={userChapter}
    />
  );
}
