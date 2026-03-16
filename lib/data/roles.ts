import "server-only";
import { prisma } from "@/lib/prisma";
import { buildOrderBy, buildPaginationMeta, type TableParams } from "@/lib/table";

const ORDER_FIELDS: Record<string, string> = {
  name: "name",
  scope: "scope",
  created_at: "created_at",
  updated_at: "updated_at",
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
      include: {
        updated_by_user: {
          select: { first_name: true, last_name: true },
        },
      },
    }),
    prisma.role.count({ where }),
  ]);

  return { data, ...buildPaginationMeta(total, page, perPage) };
}
