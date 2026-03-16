"use client";

import { ReferenceTypeClient } from "@/components/admin/reference-type-client";
import type { Column } from "@/components/admin/data-table";
import type { Pagination } from "@/lib/table";
import { TextCell, UserCell, DateCell } from "@/components/shared/cells";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createRole, updateRole, deleteRole } from "./actions";

export type RoleRow = {
  id: number;
  name: string;
  scope: string;
  description: string | null;
  updated_by: { first_name: string; last_name: string } | null;
  created_at: string;
  updated_at: string;
};

type RoleForm = { name: string; scope: string; description: string };

const EMPTY_FORM: RoleForm = { name: "", scope: "chapter", description: "" };

const columns: Column[] = [
  { key: "name", label: "Name", sortable: true },
  { key: "scope", label: "Scope", sortable: true },
  { key: "description", label: "Description", maxWidth: "250px" },
  { key: "updated_by", label: "Updated By" },
  { key: "created_at", label: "Created At", sortable: true },
  { key: "updated_at", label: "Updated At", sortable: true },
  { key: "actions", label: "Actions", align: "center" },
];

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
        updated_by: <UserCell user={row.updated_by} />,
        created_at: <DateCell date={row.created_at} />,
        updated_at: <DateCell date={row.updated_at} />,
      })}
      initialForm={EMPTY_FORM}
      getFormFromRow={(row) => ({
        name: row.name,
        scope: row.scope?.toLowerCase() ?? "chapter",
        description: row.description ?? "",
      })}
      renderForm={(form, setForm) => (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="role-name">Role Name</Label>
              <Input
                id="role-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Enter role name"
              />
            </div>
            <div className="space-y-2 col-span-1">
              <Label htmlFor="role-scope">Scope</Label>
              <Select
                value={form.scope}
                onValueChange={(v) => setForm((f) => ({ ...f, scope: v }))}
              >
                <SelectTrigger id="role-scope" className="w-full">
                  <SelectValue placeholder="Select scope" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="global">Global</SelectItem>
                  <SelectItem value="chapter">Chapter</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="role-description">Description</Label>
            <Textarea
              id="role-description"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Enter description (optional)"
              className="min-h-[120px]"
            />
          </div>
        </div>
      )}
      onCreate={createRole}
      onUpdate={updateRole}
      onDelete={deleteRole}
    />
  );
}
