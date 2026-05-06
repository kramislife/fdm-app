"use client";

import type { Column } from "@/components/admin/data-table";
import type { Pagination } from "@/lib/utils/table";
import {
  StatusBadge,
  UserCell,
  DateCell,
  TextCell,
} from "@/components/shared/cells";
import {
  FormInput,
  FormTextarea,
  FormSwitch,
} from "@/components/shared/form-fields";
import {
  DetailField,
  DetailSection,
  DetailMeta,
} from "@/components/shared/detail-field";
import { ReferenceTypeClient } from "@/components/admin/reference-type-client";
import { createEventType, updateEventType, deleteEventType } from "./actions";

// ------------------------------- Types -----------------------------------------

export type EventTypeRow = {
  id: number;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  creator: { first_name: string | null; last_name: string | null } | null;
  updated_by: { first_name: string | null; last_name: string | null } | null;
};

export type EventTypeForm = {
  name: string;
  description: string;
  is_active: boolean;
};

type Props = {
  eventTypes: EventTypeRow[];
  pagination: Pagination;
};

// ------------------------------- Constants --------------------------------------

const FIELD_LABELS = {
  name: "Event Type",
  description: "Description",
  status: "Status",
};

const EMPTY_FORM: EventTypeForm = {
  name: "",
  description: "",
  is_active: true,
};

const columns: Column[] = [
  { key: "name", label: FIELD_LABELS.name, sortable: true },
  { key: "description", label: FIELD_LABELS.description, maxWidth: "500px" },
  { key: "status", label: FIELD_LABELS.status, align: "center" },
  { key: "created_by", label: "Created By" },
  { key: "created_at", label: "Created At", sortable: true },
  { key: "actions", label: "Actions", align: "center" },
];

// ------------------------------- Helpers/Logic --------------------------------------

function validate(form: EventTypeForm) {
  const errors: Record<string, string | undefined> = {};
  if (!form.name.trim()) errors.name = `${FIELD_LABELS.name} is required`;
  return errors;
}

function getFormFromRow(row: EventTypeRow): EventTypeForm {
  return {
    name: row.name,
    description: row.description ?? "",
    is_active: row.is_active,
  };
}

// ------------------------------- Component --------------------------------------

export function EventTypesClient({ eventTypes, pagination }: Props) {
  return (
    <ReferenceTypeClient<EventTypeRow, EventTypeForm>
      entityLabel="Event Type"
      pageTitle="Event Types"
      pageDescription="View and manage all types of events"
      rows={eventTypes}
      pagination={pagination}
      columns={columns}
      // ----------------------------- Row Rendering -----------------------------
      renderRow={(row) => ({
        name: <TextCell value={row.name} />,
        description: <TextCell value={row.description} />,
        status: <StatusBadge isActive={row.is_active} />,
        created_by: <UserCell user={row.creator} />,
        created_at: <DateCell date={row.created_at} />,
      })}
      // ----------------------------- Detail View -------------------------------
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
      // ----------------------------- Form Handling -----------------------------
      initialForm={EMPTY_FORM}
      getFormFromRow={getFormFromRow}
      validate={validate}
      renderForm={(form, setForm, _isEditing, errors) => (
        <div className="space-y-5">
          <FormInput
            label={FIELD_LABELS.name}
            id="et-name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            error={errors.name}
            required
          />

          <FormTextarea
            label={FIELD_LABELS.description}
            id="et-description"
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            error={errors.description}
          />

          <FormSwitch
            label={FIELD_LABELS.status}
            id="et-status"
            checked={form.is_active}
            onCheckedChange={(v) => setForm((f) => ({ ...f, is_active: v }))}
          />
        </div>
      )}
      // ----------------------------- Server Actions ---------------------------
      onCreate={createEventType}
      onUpdate={updateEventType}
      onDelete={deleteEventType}
    />
  );
}
