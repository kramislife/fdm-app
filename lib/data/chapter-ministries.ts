import "server-only";
import { ROLE_KEYS } from "@/lib/constants/app-roles";
import { prisma } from "@/lib/db/prisma";
import { ACCOUNT_STATUS } from "@/lib/constants/status";
import {
  buildOrderBy,
  buildPaginationMeta,
  type TableParams,
} from "@/lib/utils/table";

const ORDER_FIELDS: Record<string, string> = {
  name: "ministry_type.name",
  chapter: "chapter.name",
  updated_at: "updated_at",
  members: "_count.ministry_members",
};

/**
 * Fetches chapter ministries with pagination, sorting, and filtering.
 * Includes ministry type, chapter, active head (via head relation), and member count.
 */
export async function getChapterMinistries(
  params: TableParams & { chapterId?: number } = {},
) {
  const {
    search = "",
    page = 1,
    perPage = 10,
    sort = "name",
    order = "asc",
    chapterId,
  } = params;

  const where = {
    chapter: { deleted_at: null },
    ministry_type: { deleted_at: null },
    ...(chapterId ? { chapter_id: chapterId } : {}),
    ...(search
      ? {
          OR: [
            {
              chapter: {
                name: { contains: search, mode: "insensitive" as const },
              },
            },
            {
              ministry_type: {
                name: { contains: search, mode: "insensitive" as const },
              },
            },
            {
              user_roles: {
                some: {
                  role: { key: ROLE_KEYS.MINISTRY_HEAD },
                  is_active: true,
                  user: {
                    OR: [
                      {
                        first_name: {
                          contains: search,
                          mode: "insensitive" as const,
                        },
                      },
                      {
                        last_name: {
                          contains: search,
                          mode: "insensitive" as const,
                        },
                      },
                    ],
                  },
                },
              },
            },
          ],
        }
      : {}),
  };

  const [data, total] = await Promise.all([
    prisma.chapterMinistry.findMany({
      where,
      include: {
        ministry_type: { select: { name: true, key: true } },
        chapter: { select: { id: true, name: true } },
        _count: { select: { ministry_members: true } },
        updater: { select: { first_name: true, last_name: true } },
        head: { select: { id: true, first_name: true, last_name: true } },
      },
      orderBy: buildOrderBy(sort, order, ORDER_FIELDS, "updated_at"),
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.chapterMinistry.count({ where }),
  ]);

  return { data, ...buildPaginationMeta(total, page, perPage) };
}

/**
 * Returns verified users belonging to a specific chapter.
 * Also includes which chapter ministry they currently head (if any).
 * Used for the Assign Head dropdown.
 */
export async function getChapterActiveUsers(chapterId: number) {
  const users = await prisma.user.findMany({
    where: {
      account_status: ACCOUNT_STATUS.VERIFIED,
      user_chapters: {
        some: { chapter_id: chapterId },
      },
    },
    select: {
      id: true,
      first_name: true,
      last_name: true,
      user_roles: {
        where: {
          role: { key: ROLE_KEYS.MINISTRY_HEAD },
          is_active: true,
          chapter_id: chapterId,
        },
        select: {
          chapter_ministry_id: true,
          chapter_ministry: {
            select: {
              ministry_type: { select: { name: true } },
            },
          },
        },
        take: 1,
      },
    },
    orderBy: [{ last_name: "asc" }, { first_name: "asc" }],
  });

  return users.map((u) => ({
    id: u.id,
    first_name: u.first_name,
    last_name: u.last_name,
    chapter_ministry_id: u.user_roles[0]?.chapter_ministry_id ?? null,
    ministry_name:
      u.user_roles[0]?.chapter_ministry?.ministry_type?.name ?? null,
  }));
}

/**
 * Returns all active chapters for the filter dropdown.
 */
export async function getChaptersForFilter() {
  return await prisma.chapter.findMany({
    where: { is_active: true, deleted_at: null },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}
