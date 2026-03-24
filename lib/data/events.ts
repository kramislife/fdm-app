import "server-only";
import { prisma } from "@/lib/db/prisma";
import {
  buildOrderBy,
  buildPaginationMeta,
  type TableParams,
} from "@/lib/utils/table";
import type { RoleKey } from "@/lib/constants/app-roles";

const ORDER_FIELDS: Record<string, string> = {
  name: "name",
  event_date: "event_date",
  created_at: "created_at",
};

export async function getEvents(
  params: TableParams & { scope?: string; chapterId?: number } = {},
) {
  const {
    search = "",
    page = 1,
    perPage = 10,
    sort = "event_date",
    order = "desc",
    scope,
    chapterId,
  } = params;

  const where = {
    deleted_at: null,
    ...(scope ? { scope } : {}),
    ...(chapterId ? { chapter_id: chapterId } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            {
              event_type: {
                name: { contains: search, mode: "insensitive" as const },
              },
            },
            { location: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [data, total] = await Promise.all([
    prisma.event.findMany({
      where,
      include: {
        event_type: { select: { id: true, key: true, name: true } },
        chapter: { select: { id: true, name: true } },
        creator: { select: { first_name: true, last_name: true } },
        updated_by_user: { select: { first_name: true, last_name: true } },
        _count: { select: { attendance: true } },
      },
      orderBy: buildOrderBy(sort, order, ORDER_FIELDS),
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.event.count({ where }),
  ]);

  return { data, ...buildPaginationMeta(total, page, perPage) };
}

/** 
 * Returns events visible to a given user for the dashboard 
 * Simplified visibility:
 * - Elevated roles (Director, Elder, Head Servant) see ALL global events and events for their own chapters.
 * - Normal users see events relevant to their primary chapter and any global events.
 */
export async function getUpcomingEvents(
  _userId: number,
  chapterIds: number[],
  roles: RoleKey[],
) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isElevated = roles.some((r) =>
    ["director_adviser", "elder", "head_servant"].includes(r),
  );

  return prisma.event.findMany({
    where: {
      deleted_at: null,
      event_date: { gte: today },
      OR: [
        // Global events visible to everyone or at least elevated roles (standardizing to everyone for community visibility)
        { scope: "global" },
        // Chapter events where user belongs to that chapter
        ...(chapterIds.length > 0
          ? [{ scope: "chapter", chapter_id: { in: chapterIds } }]
          : []),
      ],
    },
    include: {
      event_type: { select: { name: true } },
      chapter: { select: { name: true } },
    },
    orderBy: { event_date: "asc" },
    take: 5,
  });
}
