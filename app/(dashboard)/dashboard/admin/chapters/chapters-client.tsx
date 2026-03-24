"use client";

import type { Column } from "@/components/admin/data-table";
import type { Pagination } from "@/lib/utils/table";
import type { AddressValue } from "@/lib/types/types";
import { DAYS_OF_WEEK } from "@/lib/utils/format";
import { StatusBadge, TextCell, LinkCell } from "@/components/shared/cells";
import {
  FormInput,
  FormSelect,
  FormSwitch,
} from "@/components/shared/form-fields";
import {
  DetailField,
  DetailSection,
  DetailMeta,
} from "@/components/shared/detail-field";
import { ReferenceTypeClient } from "@/components/admin/reference-type-client";
import { ChapterAddressForm } from "@/components/admin/chapter-address-form";
import { createChapter, updateChapter, deleteChapter } from "./actions";

// ------------------------------- Types -----------------------------------------

export type ChapterRow = {
  id: number;
  name: string;
  region: string;
  region_code?: string;
  province: string;
  province_code?: string;
  city: string;
  city_code?: string;
  barangay: string;
  barangay_code?: string;
  street: string | null;
  google_maps_url: string | null;
  landmark: string | null;
  fellowship_day: string | null;
  is_active: boolean;
  member_count: number;
  created_at: string;
  updated_at: string;
  creator: { first_name: string; last_name: string } | null;
  updated_by: { first_name: string; last_name: string } | null;
};

type ChapterForm = {
  name: string;
  fellowship_day: string;
  is_active: boolean;
} & AddressValue;

// ------------------------------- Constants --------------------------------------

const FIELD_LABELS = {
  name: "Chapter",
  region: "Region",
  province: "Province",
  city: "City",
  barangay: "Barangay",
  street: "Street Address",
  gmaps: "Address Link",
  landmark: "Landmark",
  fellowship_day: "Schedule",
  status: "Status",
  members: "Members",
};

const EMPTY_FORM: ChapterForm = {
  name: "",
  region: "",
  region_code: "",
  province: "",
  province_code: "",
  city: "",
  city_code: "",
  barangay: "",
  barangay_code: "",
  street: "",
  google_maps_url: "",
  landmark: "",
  fellowship_day: "",
  is_active: true,
};

const columns: Column[] = [
  { key: "name", label: FIELD_LABELS.name, sortable: true },
  {
    key: "street",
    label: FIELD_LABELS.street,
    maxWidth: "400px",
    sortable: true,
  },
  { key: "gmaps", label: FIELD_LABELS.gmaps, maxWidth: "300px" },
  {
    key: "fellowship_day",
    label: FIELD_LABELS.fellowship_day,
    sortable: true,
  },
  {
    key: "members",
    label: FIELD_LABELS.members,
    align: "center",
  },
  { key: "status", label: FIELD_LABELS.status, align: "center" },
  { key: "actions", label: "Actions", align: "center" },
];

// ------------------------------- Helpers/Logic --------------------------------------

function validate(form: ChapterForm) {
  const errors: Record<string, string | undefined> = {};
  if (!form.name.trim()) errors.name = `${FIELD_LABELS.name} name is required`;
  if (!form.fellowship_day)
    errors.fellowship_day = `${FIELD_LABELS.fellowship_day} is required`;
  if (!form.region) errors.region = `${FIELD_LABELS.region} is required`;
  if (!form.province) errors.province = `${FIELD_LABELS.province} is required`;
  if (!form.city) errors.city = `${FIELD_LABELS.city} is required`;
  if (!form.barangay) errors.barangay = `${FIELD_LABELS.barangay} is required`;
  return errors;
}

function getFormFromRow(row: ChapterRow): ChapterForm {
  return {
    name: row.name,
    region: row.region,
    region_code: row.region_code ?? "",
    province: row.province,
    province_code: row.province_code ?? "",
    city: row.city,
    city_code: row.city_code ?? "",
    barangay: row.barangay,
    barangay_code: row.barangay_code ?? "",
    street: row.street ?? "",
    google_maps_url: row.google_maps_url ?? "",
    landmark: row.landmark ?? "",
    fellowship_day: row.fellowship_day ?? "",
    is_active: row.is_active,
  };
}

// ------------------------------- Component --------------------------------------

type Props = {
  chapters: ChapterRow[];
  pagination: Pagination;
};

export function ChaptersClient({ chapters, pagination }: Props) {
  return (
    <ReferenceTypeClient<ChapterRow, ChapterForm>
      entityLabel="Chapter"
      pageTitle="Chapter Management"
      pageDescription="View and manage all community chapters"
      rows={chapters}
      pagination={pagination}
      columns={columns}
      // ----------------------------- Row Rendering -----------------------------
      renderRow={(row) => ({
        name: <TextCell value={row.name} capitalize />,
        street: <TextCell value={row.street} />,
        gmaps: <LinkCell href={row.google_maps_url} />,
        fellowship_day: <TextCell value={row.fellowship_day} capitalize />,
        members: <TextCell value={row.member_count} />,
        status: <StatusBadge isActive={row.is_active} />,
      })}
      // ----------------------------- Detail View -------------------------------
      renderDetail={(row) => (
        <>
          <DetailSection>
            <DetailField label={FIELD_LABELS.name}>
              <TextCell value={row.name} capitalize />
            </DetailField>
            <DetailField label={FIELD_LABELS.fellowship_day}>
              <TextCell value={row.fellowship_day} capitalize />
            </DetailField>
            <DetailField label={FIELD_LABELS.region}>
              <TextCell value={row.region} capitalize />
            </DetailField>
            <DetailField label={FIELD_LABELS.province}>
              <TextCell value={row.province} capitalize />
            </DetailField>
            <DetailField label={FIELD_LABELS.city}>
              <TextCell value={row.city} capitalize />
            </DetailField>
            <DetailField label={FIELD_LABELS.barangay}>
              <TextCell value={row.barangay} capitalize />
            </DetailField>
            {row.street && (
              <DetailField label={FIELD_LABELS.street} fullWidth>
                <TextCell value={row.street} />
              </DetailField>
            )}
            {row.google_maps_url && (
              <DetailField label={FIELD_LABELS.gmaps} fullWidth>
                <LinkCell href={row.google_maps_url} />
              </DetailField>
            )}
            {row.landmark && (
              <DetailField label={FIELD_LABELS.landmark}>
                <TextCell value={row.landmark} />
              </DetailField>
            )}
            <DetailField label={FIELD_LABELS.members}>
              <TextCell value={row.member_count} />
            </DetailField>
            <DetailField label={FIELD_LABELS.status}>
              <StatusBadge isActive={row.is_active} />
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
      renderForm={(form, setForm, _isEditing, errors, _initialValues) => (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-y-5 gap-x-2">
            <FormInput
              label={FIELD_LABELS.name}
              id="ch-name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              error={errors.name}
              wrapperClassName="col-span-1 md:col-span-2"
              required
            />
            <FormSelect
              label={FIELD_LABELS.fellowship_day}
              id="ch-fellowship-day"
              value={form.fellowship_day}
              onValueChange={(v) =>
                setForm((f) => ({ ...f, fellowship_day: v }))
              }
              options={DAYS_OF_WEEK.map((day) => ({
                value: day,
                label: day,
              }))}
              error={errors.fellowship_day}
              wrapperClassName="col-span-1"
              required
            />
          </div>

          <ChapterAddressForm
            labels={FIELD_LABELS}
            value={form}
            onChange={(address) => setForm((f) => ({ ...f, ...address }))}
            errors={errors}
          />
          <FormSwitch
            label={FIELD_LABELS.status}
            id="ch-status"
            checked={form.is_active}
            onCheckedChange={(v) => setForm((f) => ({ ...f, is_active: v }))}
            activeDescription="This chapter is visible and operational"
            inactiveDescription="This chapter is currently inactive"
          />
        </div>
      )}
      // ----------------------------- Server Actions ---------------------------
      onCreate={createChapter}
      onUpdate={updateChapter}
      onDelete={deleteChapter}
    />
  );
}
