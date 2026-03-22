import "server-only";
import { prisma } from "@/lib/prisma";
import {
  buildOrderBy,
  buildPaginationMeta,
  type TableParams,
} from "@/lib/table";

const ORDER_FIELDS: Record<string, string> = {
  name: "first_name",
  email: "email",
};

export async function getUsers(params: TableParams = {}) {
  const {
    search = "",
    page = 1,
    perPage = 10,
    sort = "created_at",
    order = "desc",
  } = params;

  const baseWhere = {
    account_status: { not: "guest" },
  };

  const where = search
    ? {
        ...baseWhere,
        OR: [
          { first_name: { contains: search, mode: "insensitive" as const } },
          { last_name: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
          {
            contact_number: { contains: search, mode: "insensitive" as const },
          },
          {
            user_chapters: {
              some: {
                chapter: {
                  name: { contains: search, mode: "insensitive" as const },
                },
              },
            },
          },
          {
            user_roles: {
              some: {
                role: {
                  name: { contains: search, mode: "insensitive" as const },
                },
              },
            },
          },
        ],
      }
    : baseWhere;

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
        address: true,
        account_status: true,
        photo_url: true,
        is_qr_only: true,
        is_temp_password: true,
        member_qr: true,
        deactivated_at: true,
        created_at: true,
        creator: { select: { first_name: true, last_name: true } },
        updated_at: true,
        updated_by_user: { select: { first_name: true, last_name: true } },

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
            id: true,
            role: { select: { id: true, key: true, name: true, scope: true } },
            chapter: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: buildOrderBy(sort, order, ORDER_FIELDS),
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.user.count({ where }),
  ]);

  return { data, ...buildPaginationMeta(total, page, perPage) };
}
