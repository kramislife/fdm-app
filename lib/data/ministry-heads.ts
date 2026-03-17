import "server-only";
import { prisma } from "@/lib/prisma";
import {
  buildOrderBy,
  buildPaginationMeta,
  type TableParams,
} from "@/lib/table";

const ORDER_FIELDS: Record<string, string> = {
  name: "ministry_type.name",
  chapter: "chapter.name",
  created_at: "created_at",
  members: "_count.ministry_members",
};

/**
 * Fetches ministry heads with pagination, sorting, and filtering.
 * includes ministry type, chapter, and active ministry head.
 */
export async function getMinistryHeads(
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
    deleted_at: null,
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
                  role: { key: "ministry_head" },
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
    prisma.ministryHead.findMany({
      where,
        include: {
        ministry_type: { select: { name: true, key: true } },
        chapter: { select: { id: true, name: true } },
        _count: { select: { ministry_members: true } },
        updater: { select: { first_name: true, last_name: true } },
        user_roles: {
          where: {
            role: { key: "ministry_head" },
            is_active: true,
          },
          select: {
            id: true,
            user: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
              },
            },
          },
          take: 1,
        },
      },
      orderBy: buildOrderBy(sort, order, ORDER_FIELDS),
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.ministryHead.count({ where }),
  ]);

  return { data, ...buildPaginationMeta(total, page, perPage) };
}

/**
 * Returns active users belonging to a specific chapter.
 * Used for Assign Head dropdown.
 */
export async function getChapterActiveUsers(chapterId: number) {
  return await prisma.user.findMany({
    where: {
      status: "active",
      user_chapters: {
        some: {
          chapter_id: chapterId,
        },
      },
    },
    select: {
      id: true,
      first_name: true,
      last_name: true,
    },
    orderBy: [{ last_name: "asc" }, { first_name: "asc" }],
  });
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
