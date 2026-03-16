"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { Column } from "@/components/admin/data-table";
import type { Pagination } from "@/lib/table";
import {
  TextCell,
  UserCell,
  DateCell,
  StatusBadge,
} from "@/components/shared/cells";
import {
  DetailField,
  DetailSection,
  DetailMeta,
} from "@/components/shared/detail-field";
import { ReferenceTypeClient } from "@/components/admin/reference-type-client";
import { createRole, updateRole, deleteRole } from "./actions";

export type RoleRow = {
  id: number;
  name: string;
  scope: string;
  description: string | null;
  is_active: boolean;
  creator: { first_name: string; last_name: string } | null;
  updated_by: { first_name: string; last_name: string } | null;
  created_at: string;
  updated_at: string;
};

type RoleForm = {
  name: string;
  scope: string;
  description: string;
  is_active: boolean;
};

const FIELD_LABELS = {
  name: "Role",
  scope: "Scope",
  description: "Description",
  status: "Status",
};

const columns: Column[] = [
  { key: "name", label: FIELD_LABELS.name, sortable: true },
  { key: "scope", label: FIELD_LABELS.scope },
  { key: "description", label: FIELD_LABELS.description, maxWidth: "500px" },
  { key: "status", label: FIELD_LABELS.status, align: "center" },
  { key: "created_by", label: "Created By" },
  { key: "created_at", label: "Created At", sortable: true },
  { key: "actions", label: "Actions", align: "center" },
];

const EMPTY_FORM: RoleForm = {
  name: "",
  scope: "chapter",
  description: "",
  is_active: true,
};

type Props = {
  roles: RoleRow[];
  pagination: Pagination;
};

export function RolesClient({ roles, pagination }: Props) {
  return (
    <ReferenceTypeClient
      entityLabel="Role"
      pageTitle="Role Management"
      pageDescription="View and manage all community roles"
      rows={roles}
      pagination={pagination}
      columns={columns}
      renderRow={(row) => ({
        name: <TextCell value={row.name} />,
        scope: <TextCell value={row.scope} />,
        description: <TextCell value={row.description} />,
        status: <StatusBadge isActive={row.is_active} />,
        created_by: <UserCell user={row.creator} />,
        created_at: <DateCell date={row.created_at} />,
      })}
      renderDetail={(row) => (
        <>
          <DetailSection>
            <DetailField label={FIELD_LABELS.name}>
              <TextCell value={row.name} />
            </DetailField>
            <DetailField label={FIELD_LABELS.scope}>
              <TextCell value={row.scope} />
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
        scope: row.scope?.toLowerCase() ?? "chapter",
        description: row.description ?? "",
        is_active: row.is_active,
      })}
      renderForm={(form, setForm) => (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-2">
            <div className="col-span-1 md:col-span-2 space-y-2">
              <Label htmlFor="role-name">{FIELD_LABELS.name}</Label>
              <Input
                id="role-name"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder={`Enter ${FIELD_LABELS.name.toLowerCase()}`}
                required
              />
            </div>
            <div className="col-span-1 space-y-2">
              <Label htmlFor="role-scope">{FIELD_LABELS.scope}</Label>
              <Select
                value={form.scope}
                onValueChange={(v) => setForm((f) => ({ ...f, scope: v }))}
              >
                <SelectTrigger id="role-scope" className="w-full">
                  <SelectValue
                    placeholder={`Select ${FIELD_LABELS.scope.toLowerCase()}`}
                  />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="global">Global</SelectItem>
                  <SelectItem value="chapter">Chapter</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="role-description">{FIELD_LABELS.description}</Label>
            <Textarea
              id="role-description"
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
              <Label htmlFor="role-status">{FIELD_LABELS.status}</Label>
              <Switch
                id="role-status"
                checked={form.is_active}
                onCheckedChange={(v: boolean) =>
                  setForm((f) => ({ ...f, is_active: v }))
                }
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {form.is_active
                ? "Active — assigned users have access"
                : "Inactive — system features for this role are disabled"}
            </p>
          </div>
        </div>
      )}
      onCreate={createRole}
      onUpdate={updateRole}
      onDelete={deleteRole}
    />
  );
}
