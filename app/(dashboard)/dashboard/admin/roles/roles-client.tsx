"use client";

import type { Column } from "@/components/admin/data-table";
import type { Pagination } from "@/lib/utils/table";
import { TextCell, DateCell, StatusBadge } from "@/components/shared/cells";
import { ReferenceTypeClient } from "@/components/admin/reference-type-client";

// ------------------------------- Types -----------------------------------------

export type RoleRow = {
  id: number;
  name: string;
  scope: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

// ------------------------------- Constants --------------------------------------

const FIELD_LABELS = {
  name: "Role",
  scope: "Scope",
  description: "Description",
  status: "Status",
};

const columns: Column[] = [
  { key: "name", label: FIELD_LABELS.name, sortable: true },
  { key: "scope", label: FIELD_LABELS.scope, align: "center" },
  { key: "description", label: FIELD_LABELS.description },
  { key: "status", label: FIELD_LABELS.status, align: "center" },
  { key: "created_at", label: "Created At", sortable: true },
];

// ------------------------------- Component --------------------------------------

type Props = {
  roles: RoleRow[];
  pagination: Pagination;
};

export function RolesClient({ roles, pagination }: Props) {
  return (
    <ReferenceTypeClient<RoleRow>
      entityLabel="Role"
      pageTitle="User Roles"
      pageDescription="View all system fixed community roles"
      rows={roles}
      pagination={pagination}
      columns={columns}
      // ----------------------------- Row Rendering -----------------------------
      renderRow={(row) => ({
        name: <TextCell value={row.name} capitalize />,
        scope: <TextCell value={row.scope} capitalize />,
        description: <TextCell value={row.description} />,
        status: <StatusBadge isActive={row.is_active} />,
        created_at: <DateCell date={row.created_at} />,
      })}
    />
  );
}
