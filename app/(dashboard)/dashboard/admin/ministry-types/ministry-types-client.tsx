"use client";

import { ReferenceTypeClient } from "@/components/admin/reference-type-client";
import type { Column } from "@/components/admin/data-table";
import type { Pagination } from "@/lib/table";
import { StatusBadge, UserCell, DateCell, TextCell } from "@/components/shared/cells";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  createMinistryType,
  updateMinistryType,
  deleteMinistryType,
} from "./actions";

export type MinistryTypeRow = {
  id: number;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  creator: { first_name: string; last_name: string } | null;
};

type MinistryTypeForm = { name: string; description: string; is_active: boolean };

const EMPTY_FORM: MinistryTypeForm = { name: "", description: "", is_active: true };

const columns: Column[] = [
  { key: "name", label: "Name", sortable: true },
  { key: "description", label: "Description", maxWidth: "300px" },
  { key: "status", label: "Status", align: "center" },
  { key: "created_by", label: "Created By" },
  { key: "created_at", label: "Created At", sortable: true },
  { key: "updated_at", label: "Updated At", sortable: true },
  { key: "actions", label: "Actions", align: "center" },
];

type Props = {
  ministryTypes: MinistryTypeRow[];
  pagination: Pagination;
};

export function MinistryTypesClient({ ministryTypes, pagination }: Props) {
  return (
    <ReferenceTypeClient
      entityLabel="Ministry Type"
      pageTitle="Ministry Types"
      pageDescription="View and manage all types of ministries"
      rows={ministryTypes}
      pagination={pagination}
      columns={columns}
      renderRow={(row) => ({
        name: <TextCell value={row.name} />,
        description: <TextCell value={row.description} />,
        status: <StatusBadge isActive={row.is_active} />,
        created_by: <UserCell user={row.creator} />,
        created_at: <DateCell date={row.created_at} />,
        updated_at: <DateCell date={row.updated_at} />,
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
            <Label htmlFor="mt-name">Ministry Type</Label>
            <Input
              id="mt-name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Enter ministry type"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mt-description">Description</Label>
            <Textarea
              id="mt-description"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Enter description (optional)"
              className="min-h-[120px]"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="mt-status" className="text-sm font-medium">Status</Label>
              <p className="text-xs text-muted-foreground">
                {form.is_active ? "Active — visible in selections" : "Inactive — hidden from selections"}
              </p>
            </div>
            <Switch
              id="mt-status"
              checked={form.is_active}
              onCheckedChange={(v) => setForm((f) => ({ ...f, is_active: v }))}
            />
          </div>
        </div>
      )}
      onCreate={createMinistryType}
      onUpdate={updateMinistryType}
      onDelete={deleteMinistryType}
    />
  );
}
