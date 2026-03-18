import { requireRole } from "@/lib/auth";
import { getMinistryTypes } from "@/lib/data/ministry-types";
import { parseTableParams, toPagination, type PageProps } from "@/lib/table";
import {
  MinistryTypesClient,
  type MinistryTypeRow,
} from "./ministry-types-client";

export default async function MinistryTypesPage({ searchParams }: PageProps) {
  await requireRole(["spiritual_director", "elder"]);

  const { search, page, perPage, sort, order } = parseTableParams(
    await searchParams,
  );

  const result = await getMinistryTypes({
    search: search || undefined,
    page,
    perPage,
    sort,
    order,
  });

  const ministryTypes: MinistryTypeRow[] = result.data.map((mt) => ({
    id: mt.id,
    name: mt.name,
    description: mt.description ?? null,
    is_active: mt.is_active,
    created_at: mt.created_at.toISOString(),
    updated_at: mt.updated_at.toISOString(),
    creator: mt.creator ?? null,
    updated_by: mt.updated_by_user ?? null,
  }));

  return (
    <MinistryTypesClient
      ministryTypes={ministryTypes}
      pagination={toPagination(result)}
    />
  );
}
