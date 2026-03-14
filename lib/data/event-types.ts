import "server-only";
import { prisma } from "@/lib/prisma";
import { buildPaginationMeta, type TableParams } from "@/lib/table";

function buildOrderBy(sort: string, order: "asc" | "desc") {
  if (sort === "description") return { description: order };
  return { name: order };
}

export async function getEventTypes(params: TableParams = {}) {
  const {
    search = "",
    page = 1,
    perPage = 10,
    sort = "name",
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
    prisma.eventType.findMany({
      where,
      orderBy: buildOrderBy(sort, order),
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.eventType.count({ where }),
  ]);

  return { data, ...buildPaginationMeta(total, page, perPage) };
}
