"use client";

import type { Column } from "@/components/admin/data-table";
import type { Pagination } from "@/lib/table";
import {
  TextCell,
  UserCell,
  DateCell,
  StatusBadge,
} from "@/components/shared/cells";
import {
  FormInput,
  FormSelect,
  FormTextarea,
  FormSwitch,
} from "@/components/shared/form-fields";
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
  scope: "",
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
        name: <TextCell value={row.name} capitalize/>,
        scope: <TextCell value={row.scope} capitalize />,
        description: <TextCell value={row.description} />,
        status: <StatusBadge isActive={row.is_active} />,
        created_by: <UserCell user={row.creator} />,
        created_at: <DateCell date={row.created_at} />,
      })}
      renderDetail={(row) => (
        <>
          <DetailSection>
            <DetailField label={FIELD_LABELS.name}>
              <TextCell value={row.name} capitalize/>
            </DetailField>
            <DetailField label={FIELD_LABELS.scope}>
              <TextCell value={row.scope} capitalize />
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
        scope: row.scope?.toLowerCase() ?? "",
        description: row.description ?? "",
        is_active: row.is_active,
      })}
      renderForm={(form, setForm) => (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-2">
            <FormInput
              label={FIELD_LABELS.name}
              id="role-name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              wrapperClassName="col-span-1 md:col-span-2"
              required
            />
            <FormSelect
              label={FIELD_LABELS.scope}
              id="role-scope"
              value={form.scope}
              onValueChange={(v) => setForm((f) => ({ ...f, scope: v }))}
              options={[
                { value: "global", label: "Global" },
                { value: "chapter", label: "Chapter" },
              ]}
              wrapperClassName="col-span-1"
              required
            />
          </div>

          <FormTextarea
            label={FIELD_LABELS.description}
            id="role-description"
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
          />

          <FormSwitch
            label={FIELD_LABELS.status}
            id="role-status"
            checked={form.is_active}
            onCheckedChange={(v) => setForm((f) => ({ ...f, is_active: v }))}
            activeDescription="Assigned users have access"
            inactiveDescription="System features for this role are disabled"
          />
        </div>
      )}
      onCreate={createRole}
      onUpdate={updateRole}
      onDelete={deleteRole}
    />
  );
}
