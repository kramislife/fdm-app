import "server-only";
import { prisma } from "@/lib/db/prisma";
import { buildPaginationMeta, type TableParams } from "@/lib/utils/table";
import type {
  ActivityAction,
  ActivityEntity,
} from "@/lib/constants/activity-log";

export type ActivityLogFilter = TableParams & {
  action?: ActivityAction;
  entityType?: ActivityEntity;
};

export async function getActivityLogs(params: ActivityLogFilter = {}) {
  const { search = "", page = 1, perPage = 20, action, entityType } = params;

  const where = {
    ...(action ? { action } : {}),
    ...(entityType ? { entity_type: entityType } : {}),
    ...(search
      ? {
          OR: [
            { message: { contains: search, mode: "insensitive" as const } },
            {
              entity_label: { contains: search, mode: "insensitive" as const },
            },
            {
              actor: {
                OR: [
                  {
                    first_name: {
                      contains: search,
                      mode: "insensitive" as const,
                    },
                  },
                  {
                    last_name: {
                      contains: search,
                      mode: "insensitive" as const,
                    },
                  },
                ],
              },
            },
          ],
        }
      : {}),
  };

  const [data, total] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      include: {
        actor: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            photo_url: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.activityLog.count({ where }),
  ]);

  return { data, ...buildPaginationMeta(total, page, perPage) };
}

export type ActivityLogItem = Awaited<
  ReturnType<typeof getActivityLogs>
>["data"][number];
