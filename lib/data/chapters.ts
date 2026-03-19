import "server-only";
import { prisma } from "@/lib/prisma";
import {
  buildOrderBy,
  buildPaginationMeta,
  type TableParams,
} from "@/lib/table";

const ORDER_FIELDS: Record<string, string> = {
  name: "name",
  street: "street",
  fellowship_day: "fellowship_day",
};

export async function getChapters(params: TableParams = {}) {
  const {
    search = "",
    page = 1,
    perPage = 10,
    sort = "created_at",
    order = "desc",
  } = params;

  const where = {
    deleted_at: null,
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { region: { contains: search, mode: "insensitive" as const } },
            { city: { contains: search, mode: "insensitive" as const } },
            { street: { contains: search, mode: "insensitive" as const } },
            {
              fellowship_day: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {}),
  };
  const [data, total] = await Promise.all([
    prisma.chapter.findMany({
      where,
      include: {
        creator: { select: { first_name: true, last_name: true } },
        updated_by_user: { select: { first_name: true, last_name: true } },
        _count: { select: { clusters: true, user_chapters: true } },
      },
      orderBy: buildOrderBy(sort, order, ORDER_FIELDS),
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.chapter.count({ where }),
  ]);

  return { data, ...buildPaginationMeta(total, page, perPage) };
}

export async function getChaptersForSelect() {
  return prisma.chapter.findMany({
    where: { is_active: true, deleted_at: null },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}
