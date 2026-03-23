import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import { getEventTypes } from "@/lib/data/event-types";
import { PERMISSION_ROLES } from "@/lib/app-roles";
import { parseTableParams, toPagination, type PageProps } from "@/lib/table";
import { EventTypesClient, type EventTypeRow } from "./event-types-client";

export const metadata: Metadata = {
  title: "Event Types | Dashboard",
  description: "Manage and configure different types of community events.",
};

export default async function EventTypesPage({ searchParams }: PageProps) {
  await requireRole([...PERMISSION_ROLES.SUPER_ADMIN]);

  const { search, page, perPage, sort, order } = parseTableParams(
    await searchParams,
  );

  const result = await getEventTypes({
    search: search || undefined,
    page,
    perPage,
    sort,
    order,
  });

  const eventTypes: EventTypeRow[] = result.data.map((et) => ({
    id: et.id,
    name: et.name,
    description: et.description ?? null,
    is_active: et.is_active,
    created_at: et.created_at.toISOString(),
    updated_at: et.updated_at.toISOString(),
    creator: et.creator ?? null,
    updated_by: et.updated_by_user ?? null,
  }));

  return (
    <EventTypesClient
      eventTypes={eventTypes}
      pagination={toPagination(result)}
    />
  );
}
