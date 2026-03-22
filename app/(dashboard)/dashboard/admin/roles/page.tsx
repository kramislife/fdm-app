import { requireRole } from "@/lib/auth";
import { getRoles } from "@/lib/data/roles";
import { PERMISSION_ROLES } from "@/lib/app-roles";
import { parseTableParams, toPagination, type PageProps } from "@/lib/table";
import { RolesClient, type RoleRow } from "./roles-client";

export default async function RolesPage({ searchParams }: PageProps) {
  await requireRole([...PERMISSION_ROLES.SUPER_ADMIN]);

  const { search, page, perPage, sort, order } = parseTableParams(
    await searchParams,
  );

  const result = await getRoles({
    search: search || undefined,
    page,
    perPage,
    sort,
    order,
  });

  const roles: RoleRow[] = result.data.map((role) => ({
    id: role.id,
    name: role.name,
    scope: role.scope,
    description: role.description ?? null,
    is_active: role.is_active,
    created_at: role.created_at.toISOString(),
    updated_at: role.updated_at.toISOString(),
  }));

  return <RolesClient roles={roles} pagination={toPagination(result)} />;
}
