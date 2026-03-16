import { requireRole } from "@/lib/auth";
import { getEventTypes } from "@/lib/data/event-types";
import { parseTableParams, toPagination, type PageProps } from "@/lib/table";
import { EventTypesClient, type EventTypeRow } from "./event-types-client";

export default async function EventTypesPage({ searchParams }: PageProps) {
  await requireRole(["spiritual_director", "elder"]);

  const { search, page, perPage, sort, order } = parseTableParams(
    await searchParams,
    "created_at",
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
  }));

  return (
    <EventTypesClient
      eventTypes={eventTypes}
      pagination={toPagination(result)}
    />
  );
}
