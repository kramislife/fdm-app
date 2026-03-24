"use client";

import { toast } from "sonner";
import type { Column } from "@/components/admin/data-table";
import type { Pagination } from "@/lib/utils/table";
import {
  DateCell,
  TextCell,
  LinkCell,
  QRActionCell,
} from "@/components/shared/cells";
import { UserQRDialog } from "@/components/shared/qr-code";
import { formatToISODate, formatToISOTime } from "@/lib/utils/format";
import {
  FormInput,
  FormSelect,
  FormSwitch,
} from "@/components/shared/form-fields";
import {
  DetailField,
  DetailMeta,
  DetailSection,
} from "@/components/shared/detail-field";
import { ReferenceTypeClient } from "@/components/admin/reference-type-client";
import { cn } from "@/lib/utils/utils";
import {
  createEvent,
  deleteEvent,
  updateEvent,
  generateEventQR,
  type EventForm,
} from "./actions";
import { useState, useTransition } from "react";

// ------------------------------- Types -----------------------------------------

export type EventRow = {
  id: number;
  name: string;
  scope: string;
  event_date: string;
  location: string | null;
  location_url: string | null;
  qr_enabled: boolean;
  qr_token: string | null;
  qr_expires_at: string | null;
  event_type: { id: number; key: string; name: string } | null;
  chapter: { id: number; name: string } | null;
  creator: { first_name: string; last_name: string } | null;
  updated_by: { first_name: string; last_name: string } | null;
  attendance_count: number;
  created_at: string;
  updated_at: string;
};

type SelectOption = {
  id: number;
  name: string;
  key?: string;
  street?: string | null;
};

type Props = {
  events: EventRow[];
  pagination: Pagination;
  eventTypes: SelectOption[];
  chapters: SelectOption[];
  userChapterId: number | null;
  isHeadServant: boolean;
};

// ------------------------------- Constants --------------------------------------

const FIELD_LABELS = {
  name: "Event",
  event_type: "Event Type",
  scope: "Scope",
  chapter: "Chapter",
  event_date: "Schedule",
  location: "Location",
  location_url: "Map Link",
  qr: "Event QR",
  attendees: "Attendees",
};

const EMPTY_FORM: EventForm = {
  name: "",
  event_type_id: "",
  scope: "global",
  chapter_id: "",
  event_date: "",
  event_time: "",
  location: "",
  location_url: "",
  qr_enabled: false,
};

const columns: Column[] = [
  { key: "name", label: FIELD_LABELS.name, sortable: true },
  { key: "event_type", label: FIELD_LABELS.event_type },
  { key: "scope", label: FIELD_LABELS.scope },
  { key: "event_date", label: FIELD_LABELS.event_date, sortable: true },
  { key: "location", label: FIELD_LABELS.location },
  { key: "qr", label: FIELD_LABELS.qr, align: "center" },
  { key: "attendees", label: FIELD_LABELS.attendees, align: "center" },
  { key: "actions", label: "Actions", align: "center" },
];

// ------------------------------- Component --------------------------------------

export function EventsClient({
  events,
  pagination,
  eventTypes,
  chapters,
  userChapterId,
  isHeadServant,
}: Props) {
  const [qrTarget, setQrTarget] = useState<EventRow | null>(null);
  const [isPendingQR, startTransition] = useTransition();

  function handleGenerateEventQR(id: number) {
    startTransition(async () => {
      const result = await generateEventQR(id);
      if (result.success) {
        toast.success(result.title, { description: result.description });
      } else {
        toast.error(result.title || "Error", {
          description: result.description,
        });
      }
    });
  }

  function validate(form: EventForm) {
    const errors: Record<string, string | undefined> = {};
    if (!form.name.trim()) errors.name = "Event name is required.";
    if (!form.event_date) errors.event_date = "Date is required.";
    if (!form.event_time) errors.event_time = "Time is required.";

    if (form.event_date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const inputDate = new Date(`${form.event_date}T00:00:00+08:00`);
      inputDate.setHours(0, 0, 0, 0);

      if (inputDate < today) {
        errors.event_date = "Date must not be earlier than today.";
      } else if (inputDate.getTime() === today.getTime() && form.event_time) {
        const combinedTime = new Date(
          `${form.event_date}T${form.event_time}:00+08:00`,
        );
        if (combinedTime < new Date()) {
          errors.event_time = "Time must not be earlier than the current time.";
        }
      }
    }

    if (form.scope === "chapter" && !form.chapter_id)
      errors.chapter_id = "Chapter is required.";
    return errors;
  }

  function getFormFromRow(row: EventRow): EventForm {
    return {
      name: row.name,
      event_type_id: row.event_type ? String(row.event_type.id) : "none",
      scope: row.scope as "global" | "chapter",
      chapter_id: row.chapter ? String(row.chapter.id) : "",
      event_date: formatToISODate(row.event_date),
      event_time: formatToISOTime(row.event_date),
      location: row.location ?? "",
      location_url: row.location_url ?? "",
      qr_enabled: row.qr_enabled,
    };
  }

  return (
    <>
      <ReferenceTypeClient<EventRow, EventForm>
        entityLabel="Event"
        pageTitle="Event Management"
        pageDescription="Manage community events and gatherings"
        rows={events}
        pagination={pagination}
        columns={columns}
        // ----------------------------- Row Rendering -----------------------------
        renderRow={(row) => ({
          name: <TextCell value={row.name} />,
          event_type: (
            <TextCell value={row.event_type?.name} fallback="Other" />
          ),
          scope: (
            <TextCell
              value={row.scope === "global" ? "Global" : row.chapter?.name}
            />
          ),
          event_date: <DateCell date={row.event_date} format="long" />,
          location: <LinkCell href={row.location_url} label={row.location} />,
          qr: (
            <QRActionCell
              qrValue={row.qr_token}
              onView={() => setQrTarget(row)}
              onGenerate={() => handleGenerateEventQR(row.id)}
              isGenerating={isPendingQR}
              enabled={row.qr_enabled}
            />
          ),
          attendees: <TextCell value={row.attendance_count} />,
        })}
        // ----------------------------- Detail View -------------------------------
        renderDetail={(row) => (
          <>
            <DetailSection>
              <DetailField label={FIELD_LABELS.name}>
                <TextCell value={row.name} />
              </DetailField>
              <DetailField label={FIELD_LABELS.event_type}>
                <TextCell value={row.event_type?.name} fallback="Other" />
              </DetailField>
              <DetailField label={FIELD_LABELS.scope}>
                <TextCell
                  value={row.scope === "global" ? "Global" : row.chapter?.name}
                />
              </DetailField>
              <DetailField label={FIELD_LABELS.event_date}>
                <DateCell date={row.event_date} format="long" />
              </DetailField>
              <DetailField label={FIELD_LABELS.qr}>
                <QRActionCell
                  qrValue={row.qr_token}
                  onView={() => setQrTarget(row)}
                  onGenerate={() => handleGenerateEventQR(row.id)}
                  isGenerating={isPendingQR}
                  enabled={row.qr_enabled}
                />
              </DetailField>
              <DetailField label={FIELD_LABELS.attendees}>
                <TextCell value={row.attendance_count} />
              </DetailField>
              {row.location && (
                <DetailField label={FIELD_LABELS.location} fullWidth>
                  <LinkCell href={row.location_url} label={row.location} />
                </DetailField>
              )}
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
        renderForm={(form, setForm, isEditing, errors, initialValues) => {
          const isLocked =
            isEditing &&
            isHeadServant &&
            (() => {
              if (!initialValues.event_date || !initialValues.event_time)
                return false;
              const eventTime = new Date(
                `${initialValues.event_date}T${initialValues.event_time}:00+08:00`,
              ).getTime();
              const now = Date.now();
              return eventTime - now < 3600000; // 1 hour buffer
            })();

          function handleScopeChange(value: string) {
            setForm((f) => ({
              ...f,
              scope: value as "global" | "chapter",
              chapter_id:
                value === "chapter" && isHeadServant && userChapterId
                  ? String(userChapterId)
                  : value === "global"
                    ? ""
                    : f.chapter_id,
            }));
          }

          function handleChapterChange(value: string) {
            setForm((f) => ({
              ...f,
              chapter_id: value,
            }));
          }

          return (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-2">
                <FormInput
                  label={FIELD_LABELS.name}
                  id="ev-name"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  error={errors.name}
                  required
                />
                <FormSelect
                  label={FIELD_LABELS.event_type}
                  id="ev-type"
                  value={form.event_type_id}
                  onValueChange={(val) =>
                    setForm((f) => ({ ...f, event_type_id: val }))
                  }
                  options={[
                    ...eventTypes.map((et) => ({
                      value: String(et.id),
                      label: et.name,
                    })),
                    { value: "none", label: "Other" },
                  ]}
                  error={errors.event_type_id}
                />
              </div>

              <div
                className={cn(
                  "grid grid-cols-1 gap-x-2 gap-y-5",
                  form.scope === "chapter" && "md:grid-cols-2",
                )}
              >
                <FormSelect
                  label={FIELD_LABELS.scope}
                  id="ev-scope"
                  value={form.scope}
                  onValueChange={handleScopeChange}
                  options={[
                    { value: "global", label: "Global" },
                    { value: "chapter", label: "Chapter" },
                  ]}
                  error={errors.scope}
                />

                {form.scope === "chapter" && (
                  <FormSelect
                    label={FIELD_LABELS.chapter}
                    id="ev-chapter"
                    value={form.chapter_id}
                    onValueChange={handleChapterChange}
                    options={chapters.map((c) => ({
                      value: String(c.id),
                      label: c.name,
                    }))}
                    error={errors.chapter_id}
                    disabled={isHeadServant}
                    required
                  />
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-2 gap-y-5 relative">
                <FormInput
                  label="Date"
                  id="ev-date"
                  type="date"
                  value={form.event_date}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, event_date: e.target.value }))
                  }
                  error={errors.event_date}
                  disabled={isLocked}
                  required
                />

                <FormInput
                  label="Time"
                  id="ev-time"
                  type="time"
                  value={form.event_time}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, event_time: e.target.value }))
                  }
                  error={errors.event_time}
                  disabled={isLocked}
                  required
                />

                {isLocked && (
                  <p className="text-[10px] text-orange-600 font-medium absolute -bottom-4 left-0">
                    Schedule locked: Event is starting soon or already ongoing.
                  </p>
                )}
              </div>

              <FormInput
                label={FIELD_LABELS.location}
                id="ev-location"
                value={form.location}
                onChange={(e) =>
                  setForm((f) => ({ ...f, location: e.target.value }))
                }
                placeholder="Enter venue name or address (optional)"
              />

              <FormInput
                label={FIELD_LABELS.location_url}
                id="ev-location-url"
                value={form.location_url}
                onChange={(e) =>
                  setForm((f) => ({ ...f, location_url: e.target.value }))
                }
                placeholder="Enter location link (optional)"
              />

              <FormSwitch
                label={FIELD_LABELS.qr}
                id="ev-qr"
                checked={form.qr_enabled}
                onCheckedChange={(v) =>
                  setForm((f) => ({ ...f, qr_enabled: v }))
                }
                activeDescription="QR code generated; attendance is recorded via scanning"
                inactiveDescription="No QR code"
              />
            </div>
          );
        }}
        // ----------------------------- Server Actions ---------------------------
        onCreate={createEvent}
        onUpdate={updateEvent}
        onDelete={deleteEvent}
      />
      <UserQRDialog
        open={!!qrTarget}
        onOpenChange={(open) => !open && setQrTarget(null)}
        memberQr={qrTarget?.qr_token ?? ""}
        userName={qrTarget?.name ?? "Event"}
        showRegenerate={false}
        expiresAt={qrTarget?.qr_expires_at}
        regenerateAction={
          qrTarget ? () => generateEventQR(qrTarget.id) : undefined
        }
      />
    </>
  );
}
