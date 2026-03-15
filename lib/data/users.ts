import "server-only";
import { prisma } from "@/lib/prisma";
import { buildPaginationMeta, type TableParams } from "@/lib/table";

function buildOrderBy(sort: string, order: "asc" | "desc") {
  if (sort === "email") return { email: order };
  if (sort === "status") return { status: order };
  if (sort === "first_name") return { first_name: order };
  if (sort === "last_name") return { last_name: order };
  return { created_at: order };
}

export async function getUsers(params: TableParams = {}) {
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
          { first_name: { contains: search, mode: "insensitive" as const } },
          { last_name: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
          {
            contact_number: { contains: search, mode: "insensitive" as const },
          },
        ],
      }
    : {};

  const [data, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        // core profile
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        contact_number: true,
        birthday: true,
        status: true,
        photo_url: true,
        created_at: true,
        updated_at: true,

        // primary chapter via user_chapters
        user_chapters: {
          where: { is_primary: true },
          select: {
            chapter: { select: { id: true, name: true } },
          },
          take: 1,
        },

        // active roles via user_roles
        user_roles: {
          where: { is_active: true },
          select: {
            role: { select: { key: true, name: true } },
            chapter: { select: { name: true } },
          },
        },
      },
      orderBy: buildOrderBy(sort, order),
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.user.count({ where }),
  ]);

  return { data, ...buildPaginationMeta(total, page, perPage) };
}
