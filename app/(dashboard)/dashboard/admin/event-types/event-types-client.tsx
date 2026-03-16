"use client";

import { ReferenceTypeClient } from "@/components/admin/reference-type-client";
import type { Column } from "@/components/admin/data-table";
import type { Pagination } from "@/lib/table";
import {
  StatusBadge,
  UserCell,
  DateCell,
  TextCell,
} from "@/components/shared/cells";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { createEventType, updateEventType, deleteEventType } from "./actions";

export type EventTypeRow = {
  id: number;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  creator: { first_name: string; last_name: string } | null;
  updated_by: { first_name: string; last_name: string } | null;
};

type EventTypeForm = { name: string; description: string; is_active: boolean };

const EMPTY_FORM: EventTypeForm = {
  name: "",
  description: "",
  is_active: true,
};

const columns: Column[] = [
  { key: "name", label: "Name", sortable: true },
  { key: "description", label: "Description", maxWidth: "500px" },
  { key: "status", label: "Status", align: "center" },
  { key: "created_by", label: "Created By" },
  { key: "created_at", label: "Created At", sortable: true },
  { key: "actions", label: "Actions", align: "center" },
];

type Props = {
  eventTypes: EventTypeRow[];
  pagination: Pagination;
};

export function EventTypesClient({ eventTypes, pagination }: Props) {
  return (
    <ReferenceTypeClient
      entityLabel="Event Type"
      pageTitle="Event Types"
      pageDescription="View and manage all types of events"
      rows={eventTypes}
      pagination={pagination}
      columns={columns}
      renderRow={(row) => ({
        name: <TextCell value={row.name} />,
        description: <TextCell value={row.description} />,
        status: <StatusBadge isActive={row.is_active} />,
        created_at: <DateCell date={row.created_at} />,
        created_by: <UserCell user={row.creator} />,
      })}
      initialForm={EMPTY_FORM}
      getFormFromRow={(row) => ({
        name: row.name,
        description: row.description ?? "",
        is_active: row.is_active,
      })}
      renderForm={(form, setForm) => (
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="et-name">Event Type Name</Label>
            <Input
              id="et-name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Enter event type name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="et-description">Description</Label>
            <Textarea
              id="et-description"
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="Enter description (optional)"
              className="min-h-[120px]"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="et-status" className="text-sm font-medium">
                Status
              </Label>
              <p className="text-xs text-muted-foreground">
                {form.is_active
                  ? "Active — visible in selections"
                  : "Inactive — hidden from selections"}
              </p>
            </div>
            <Switch
              id="et-status"
              checked={form.is_active}
              onCheckedChange={(v) => setForm((f) => ({ ...f, is_active: v }))}
            />
          </div>
        </div>
      )}
      onCreate={createEventType}
      onUpdate={updateEventType}
      onDelete={deleteEventType}
    />
  );
}
