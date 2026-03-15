import "server-only";
import { prisma } from "@/lib/prisma";
import { buildOrderBy, buildPaginationMeta, type TableParams } from "@/lib/table";

const ORDER_FIELDS: Record<string, string> = {
  name: "name",
  scope: "scope",
};

export async function getRoles(params: TableParams = {}) {
  const { search = "", page = 1, perPage = 10, sort = "name", order = "desc" } =
    params;

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
    prisma.role.findMany({
      where,
      orderBy: buildOrderBy(sort, order, ORDER_FIELDS, "name"),
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.role.count({ where }),
  ]);

  return { data, ...buildPaginationMeta(total, page, perPage) };
}
