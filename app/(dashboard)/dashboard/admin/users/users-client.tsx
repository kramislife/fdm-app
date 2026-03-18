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
  DetailField,
  DetailSection,
  DetailMeta,
} from "@/components/shared/detail-field";
import { ReferenceTypeClient } from "@/components/admin/reference-type-client";

export type UserRow = {
  id: number;
  name: string;
  first_name: string;
  last_name: string;
  email: string;
  contact_number: string | null;
  address: string | null;
  birthday: string | null;
  status: string;
  user_chapters: Array<{
    chapter: { id: number; name: string };
  }>;
  user_roles: Array<{
    id: number;
    role: { id: number; name: string };
    chapter: { id: number; name: string } | null;
  }>;
  created_at: string;
  updated_at: string;
};

const FIELD_LABELS = {
  name: "Full Name",
  email: "Email",
  contact_number: "Contact Number",
  address: "Address",
  birthday: "Birthday",
  chapter: "Chapter",
  role: "Role",
  status: "Status",
};

const columns: Column[] = [
  { key: "name", label: FIELD_LABELS.name, sortable: true },
  { key: "email", label: FIELD_LABELS.email, sortable: true },
  { key: "contact_number", label: FIELD_LABELS.contact_number },
  { key: "birthday", label: FIELD_LABELS.birthday },
  { key: "chapter", label: FIELD_LABELS.chapter },
  { key: "role", label: FIELD_LABELS.role },
  { key: "status", label: FIELD_LABELS.status, align: "center" },
  { key: "actions", label: "Actions", align: "center" },
];

type Props = {
  users: UserRow[];
  pagination: Pagination;
};

export function UsersClient({ users, pagination }: Props) {
  return (
    <ReferenceTypeClient
      entityLabel="User"
      pageTitle="Users"
      pageDescription="View all registered users in the system"
      rows={users}
      pagination={pagination}
      columns={columns}
      renderRow={(row) => ({
        name: <UserCell user={row} />,
        email: <TextCell value={row.email} />,
        contact_number: <TextCell value={row.contact_number} />,
        birthday: <DateCell date={row.birthday} dateOnly format="long" />,
        chapter: <TextCell value={row.user_roles[0]?.chapter?.name} />,
        role: <TextCell value={row.user_roles[0]?.role?.name} />,
        status: <StatusBadge isActive={row.status === "active"} />,
      })}
      renderDetail={(row) => (
        <>
          <DetailSection>
            <DetailField label={FIELD_LABELS.name}>
              <TextCell value={`${row.first_name} ${row.last_name}`} />
            </DetailField>
            <DetailField label={FIELD_LABELS.email}>
              <TextCell value={row.email} />
            </DetailField>
            <DetailField label={FIELD_LABELS.contact_number}>
              <TextCell value={row.contact_number} />
            </DetailField>
            <DetailField label={FIELD_LABELS.address} fullWidth>
              <TextCell value={row.address} />
            </DetailField>
            <DetailField label={FIELD_LABELS.birthday}>
              <DateCell date={row.birthday} dateOnly format="long" />
            </DetailField>
            <DetailField label={FIELD_LABELS.chapter}>
              <TextCell value={row.user_roles[0]?.chapter?.name} />
            </DetailField>
            <DetailField label={FIELD_LABELS.role}>
              <TextCell value={row.user_roles[0]?.role?.name} />
            </DetailField>
            <DetailField label={FIELD_LABELS.status}>
              <StatusBadge isActive={row.status === "active"} />
            </DetailField>
          </DetailSection>
          <DetailMeta
            id={row.id}
            createdAt={row.created_at}
            updatedAt={row.updated_at}
          />
        </>
      )}
    />
  );
}
