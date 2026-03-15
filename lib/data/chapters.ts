import "server-only";
import { prisma } from "@/lib/prisma";
import { buildPaginationMeta, type TableParams } from "@/lib/table";

function buildOrderBy(sort: string, order: "asc" | "desc") {
  if (sort === "name") return { name: order };
  if (sort === "location") return { location: order };
  return { created_at: order };
}

export async function getChapters(params: TableParams = {}) {
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
          { location: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [data, total] = await Promise.all([
    prisma.chapter.findMany({
      where,
      include: {
        creator: { select: { first_name: true, last_name: true } },
      },
      orderBy: buildOrderBy(sort, order),
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.chapter.count({ where }),
  ]);

  return { data, ...buildPaginationMeta(total, page, perPage) };
}
