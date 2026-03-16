"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

import type { Column } from "@/components/admin/data-table";
import type { Pagination } from "@/lib/table";
import {
  StatusBadge,
  UserCell,
  DateCell,
  TextCell,
} from "@/components/shared/cells";
import {
  DetailField,
  DetailSection,
  DetailMeta,
} from "@/components/shared/detail-field";
import { ReferenceTypeClient } from "@/components/admin/reference-type-client";
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

const FIELD_LABELS = {
  name: "Event Type",
  description: "Description",
  status: "Status",
};

const columns: Column[] = [
  { key: "name", label: FIELD_LABELS.name, sortable: true },
  { key: "description", label: FIELD_LABELS.description, maxWidth: "500px" },
  { key: "status", label: FIELD_LABELS.status, align: "center" },
  { key: "created_by", label: "Created By" },
  { key: "created_at", label: "Created At", sortable: true },
  { key: "actions", label: "Actions", align: "center" },
];

const EMPTY_FORM: EventTypeForm = {
  name: "",
  description: "",
  is_active: true,
};

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
      renderDetail={(row) => (
        <>
          <DetailSection>
            <DetailField label={FIELD_LABELS.name}>
              <TextCell value={row.name} />
            </DetailField>
            <DetailField label={FIELD_LABELS.status}>
              <StatusBadge isActive={row.is_active} />
            </DetailField>
            <DetailField label={FIELD_LABELS.description} fullWidth>
              <TextCell value={row.description} />
            </DetailField>
          </DetailSection>
          <DetailMeta
            id={row.id}
            createdAt={row.created_at}
            updatedAt={row.updated_at}
            createdBy={row.creator}
            updatedBy={row.updated_by}
          />
        </>
      )}
      initialForm={EMPTY_FORM}
      getFormFromRow={(row) => ({
        name: row.name,
        description: row.description ?? "",
        is_active: row.is_active,
      })}
      renderForm={(form, setForm) => (
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="et-name">{FIELD_LABELS.name}</Label>
            <Input
              id="et-name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder={`Enter ${FIELD_LABELS.name.toLowerCase()}`}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="et-description">{FIELD_LABELS.description}</Label>
            <Textarea
              id="et-description"
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder={`Enter ${FIELD_LABELS.description.toLowerCase()} (optional)`}
              className="min-h-[120px]"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="et-status">{FIELD_LABELS.status}</Label>
              <Switch
                id="et-status"
                checked={form.is_active}
                onCheckedChange={(v: boolean) =>
                  setForm((f) => ({ ...f, is_active: v }))
                }
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {form.is_active
                ? "Active — visible in selections"
                : "Inactive — hidden from selections"}
            </p>
          </div>
        </div>
      )}
      onCreate={createEventType}
      onUpdate={updateEventType}
      onDelete={deleteEventType}
    />
  );
}
