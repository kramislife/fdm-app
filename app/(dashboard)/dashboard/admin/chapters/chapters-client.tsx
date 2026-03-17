"use client";

import type { Column } from "@/components/admin/data-table";
import type { Pagination } from "@/lib/table";
import type { AddressValue } from "@/lib/types";
import {
  StatusBadge,
  TextCell,
  LinkCell,
  DateCell,
} from "@/components/shared/cells";
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

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

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
  cluster_count: number;
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

const columns: Column[] = [
  { key: "name", label: FIELD_LABELS.name, sortable: true },
  { key: "address", label: FIELD_LABELS.street, maxWidth: "350px" },
  { key: "gmaps", label: FIELD_LABELS.gmaps, maxWidth: "200px" },
  {
    key: "fellowship_day",
    label: FIELD_LABELS.fellowship_day,
    align: "center",
  },
  { key: "members", label: FIELD_LABELS.members, align: "center" },
  { key: "status", label: FIELD_LABELS.status, align: "center" },
  { key: "created_at", label: "Created At", sortable: true },
  { key: "actions", label: "Actions", align: "center" },
];

type Props = {
  chapters: ChapterRow[];
  pagination: Pagination;
};

export function ChaptersClient({ chapters, pagination }: Props) {
  return (
    <ReferenceTypeClient
      entityLabel="Chapter"
      pageTitle="Chapter Management"
      pageDescription="View and manage all community chapters"
      rows={chapters}
      pagination={pagination}
      columns={columns}
      renderRow={(row) => ({
        name: <TextCell value={row.name} />,
        address: <TextCell value={row.street} />,
        gmaps: <LinkCell href={row.google_maps_url} label="Location Link" />,
        fellowship_day: <TextCell value={row.fellowship_day} />,
        members: <TextCell value={row.member_count} />,
        status: <StatusBadge isActive={row.is_active} />,
        created_at: <DateCell date={row.created_at} />,
      })}
      renderDetail={(row) => (
        <>
          <DetailSection>
            <DetailField label={FIELD_LABELS.name}>
              <TextCell value={row.name} />
            </DetailField>
            <DetailField label={FIELD_LABELS.fellowship_day}>
              <TextCell value={row.fellowship_day} />
            </DetailField>
            <DetailField label={FIELD_LABELS.status}>
              <StatusBadge isActive={row.is_active} />
            </DetailField>
            <DetailField label={FIELD_LABELS.region}>
              <TextCell value={row.region} />
            </DetailField>
            <DetailField label={FIELD_LABELS.province}>
              <TextCell value={row.province} />
            </DetailField>
            <DetailField label={FIELD_LABELS.city}>
              <TextCell value={row.city} />
            </DetailField>
            <DetailField label={FIELD_LABELS.barangay}>
              <TextCell value={row.barangay} />
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
      })}
      renderForm={(form, setForm) => (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-2">
            <FormInput
              label={FIELD_LABELS.name}
              id="ch-name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
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
              wrapperClassName="col-span-1"
              required
            />
          </div>

          <ChapterAddressForm
            labels={FIELD_LABELS}
            value={form}
            onChange={(address) => setForm((f) => ({ ...f, ...address }))}
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
      onCreate={createChapter}
      onUpdate={updateChapter}
      onDelete={deleteChapter}
    />
  );
}
