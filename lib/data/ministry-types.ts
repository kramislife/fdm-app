import "server-only";
import { prisma } from "@/lib/prisma";
import { buildPaginationMeta, type TableParams } from "@/lib/table";

function buildOrderBy(sort: string, order: "asc" | "desc") {
  if (sort === "description") return { description: order };
  if (sort === "updated_at") return { updated_at: order };
  if (sort === "created_at") return { created_at: order };
  return { name: order };
}

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
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { key: { contains: search, mode: "insensitive" as const } },
          { description: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [data, total] = await Promise.all([
    prisma.ministryType.findMany({
      where,
      include: {
        creator: { select: { first_name: true, last_name: true } },
      },
      orderBy: buildOrderBy(sort, order),
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.ministryType.count({ where }),
  ]);

  return { data, ...buildPaginationMeta(total, page, perPage) };
}
