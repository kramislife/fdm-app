import { requireRole } from "@/lib/auth";
import { getRoles } from "@/lib/data/roles";
import { parseTableParams, toPagination, type PageProps } from "@/lib/table";
import { RolesClient, type RoleRow } from "./roles-client";

export default async function RolesPage({ searchParams }: PageProps) {
  await requireRole(["spiritual_director", "elder"]);

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
    creator: role.creator ?? null,
    updated_by: role.updated_by_user ?? null,
    created_at: role.created_at.toISOString(),
    updated_at: role.updated_at.toISOString(),
  }));

  return <RolesClient roles={roles} pagination={toPagination(result)} />;
}
