import { requireAuth } from "@/lib/auth";
import { getUserWithRole } from "@/lib/roles";
import { getMinistryHeads } from "@/lib/data/ministry-heads";
import { PERMISSION_ROLES } from "@/lib/app-roles";
import { parseTableParams, toPagination, type PageProps } from "@/lib/table";
import {
  MinistryHeadsClient,
  type MinistryHeadRow,
} from "./ministry-heads-client";

export default async function MinistryHeadsPage({ searchParams }: PageProps) {
  const authUser = await requireAuth();
  const userData = await getUserWithRole(authUser.id);

  if (!userData) return null;

  const { roles, chapter: userChapter } = userData;
  const isSuperAdmin = roles.some((r) =>
    PERMISSION_ROLES.SUPER_ADMIN.some((allowedRole) => allowedRole === r),
  );

  const { search, page, perPage, sort, order } = parseTableParams(
    await searchParams,
  );

  const result = await getMinistryHeads({
    search: search || undefined,
    page,
    perPage,
    sort,
    order,
  });

  const ministryHeads: MinistryHeadRow[] = (result.data as any[]).map((m) => {
    const activeHead = m.user_roles?.[0];
    return {
      id: m.id,
      name: m.ministry_type.name,
      ministryTypeKey: m.ministry_type.key,
      chapter_id: m.chapter.id,
      chapter_name: m.chapter.name,
      member_count: m._count.ministry_members,
      head: activeHead
        ? {
            id: activeHead.user.id,
            first_name: activeHead.user.first_name,
            last_name: activeHead.user.last_name,
          }
        : null,
      created_at: m.created_at.toISOString(),
      updated_at: m.updated_at.toISOString(),
      updated_by: m.updater,
    };
  });

  return (
    <MinistryHeadsClient
      ministryHeads={ministryHeads}
      pagination={toPagination(result)}
      isSuperAdmin={isSuperAdmin}
      userChapter={userChapter}
    />
  );
}
