import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/config";
import { getEvents } from "@/lib/data/events";
import { getEventTypesForSelect } from "@/lib/data/event-types";
import { getChaptersForSelect } from "@/lib/data/chapters";
import { PERMISSION_ROLES, ROLE_KEYS } from "@/lib/constants/app-roles";
import { parseTableParams, toPagination, type PageProps } from "@/lib/utils/table";
import { EventsClient, type EventRow } from "./events-client";

export const metadata: Metadata = {
  title: "Event Management | Dashboard",
  description: "Manage community events and gatherings.",
};

export default async function EventsPage({ searchParams }: PageProps) {
  const currentUser = await requireRole([...PERMISSION_ROLES.EVENTS_MANAGE]);

  const isHeadServant =
    currentUser.roles.includes(ROLE_KEYS.HEAD_SERVANT) &&
    !currentUser.roles.includes(ROLE_KEYS.DIRECTOR_ADVISER) &&
    !currentUser.roles.includes(ROLE_KEYS.ELDER);

  const { search, page, perPage, sort, order } = parseTableParams(
    await searchParams,
  );

  const [result, eventTypes, chapters] = await Promise.all([
    getEvents({
      search: search || undefined,
      page,
      perPage,
      sort,
      order,
    }),
    getEventTypesForSelect(),
    getChaptersForSelect(),
  ]);

  const events: EventRow[] = result.data.map((ev) => ({
    id: ev.id,
    name: ev.name,
    scope: ev.scope,
    event_date: ev.event_date.toISOString(),
    location: ev.location ?? null,
    location_url: ev.location_url ?? null,
    qr_enabled: ev.qr_enabled,
    qr_token: ev.qr_token,
    qr_expires_at: ev.qr_expires_at?.toISOString() ?? null,
    event_type: ev.event_type,
    chapter: ev.chapter ?? null,
    creator: ev.creator ?? null,
    updated_by: ev.updated_by_user ?? null,
    attendance_count: ev._count.attendance,
    created_at: ev.created_at.toISOString(),
    updated_at: ev.updated_at.toISOString(),
  }));

  return (
    <EventsClient
      events={events}
      pagination={toPagination(result)}
      eventTypes={eventTypes}
      chapters={chapters}
      userChapterId={currentUser.chapter?.id ?? null}
      isHeadServant={isHeadServant}
    />
  );
}
