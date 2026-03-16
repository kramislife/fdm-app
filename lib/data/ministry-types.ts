import "server-only";
import { prisma } from "@/lib/prisma";
import { buildOrderBy, buildPaginationMeta, type TableParams } from "@/lib/table";

const ORDER_FIELDS: Record<string, string> = {
  name: "name",
  created_at: "created_at",
  updated_at: "updated_at",
};

export async function getMinistryTypes(params: TableParams = {}) {
  const {
    search = "",
    page = 1,
    perPage = 10,
    sort = "created_at",
    order = "desc",
  } = params;

  const where = search
    ? {
        deleted_at: null,
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { key: { contains: search, mode: "insensitive" as const } },
          { description: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : { deleted_at: null };

  const [data, total] = await Promise.all([
    prisma.ministryType.findMany({
      where,
      include: {
        creator: { select: { first_name: true, last_name: true } },
      },
      orderBy: buildOrderBy(sort, order, ORDER_FIELDS),
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.ministryType.count({ where }),
  ]);

  return { data, ...buildPaginationMeta(total, page, perPage) };
}
