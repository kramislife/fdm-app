"use client";

import { useTransition, useState } from "react";
import type { Column } from "@/components/admin/data-table";
import type { Pagination } from "@/lib/table";
import { ReferenceTypeClient } from "@/components/admin/reference-type-client";
import {
  TextCell,
  UserCell,
  DateCell,
  UserStatusBadge,
} from "@/components/shared/cells";
import {
  DetailField,
  DetailMeta,
  DetailSection,
} from "@/components/shared/detail-field";
import {
  FormInput,
  FormSelect,
  FormTextarea,
} from "@/components/shared/form-fields";
import { ACCOUNT_STATUS } from "@/lib/status";
import {
  isValidPhoneNumber,
  isValidEmailFormat,
  normalizePhoneNumber,
} from "@/lib/format";
import {
  createUser,
  updateUser,
  deactivateUser,
  restoreUser,
  deleteUser,
  generateUserQR,
  type UserFormData,
} from "./actions";
import { FaPowerOff, FaSyncAlt, FaUserCog } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MemberQRDialog } from "@/components/shared/qr-code";
import { DeleteConfirmDialog } from "@/components/admin/delete-confirm-dialog";
import { toast } from "sonner";
import { ManageRolesSheet, getDisplayRoles } from "./manage-roles-sheet";

// ------------------------------- UI ONLY SHELL --------------------------------------

const EMPTY_FORM: UserFormData = {
  first_name: "",
  last_name: "",
  contact_number: "",
  email: "",
  birthday: "",
  account_status: ACCOUNT_STATUS.PENDING,
  address: "",
};

const FIELD_LABELS = {
  name: "Full Name",
  first_name: "First Name",
  last_name: "Last Name",
  email: "Email Address",
  contact_number: "Contact Number",
  birthday: "Birthday",
  chapter: "Chapter",
  roles: "Roles",
  status: "Status",
  address: "Address",
  created_at: "Created At",
  qr_code: "QR Code",
};

const columns: Column[] = [
  { key: "name", label: FIELD_LABELS.name, sortable: true },
  { key: "email", label: FIELD_LABELS.email, sortable: true },
  {
    key: "contact_number",
    label: FIELD_LABELS.contact_number,
    align: "center",
  },
  { key: "birthday", label: FIELD_LABELS.birthday },
  { key: "account_status", label: FIELD_LABELS.status, align: "center" },
  { key: "created_at", label: FIELD_LABELS.created_at, sortable: true },
  { key: "qr_code", label: FIELD_LABELS.qr_code, align: "center" },
  { key: "actions", label: "Actions", align: "center" },
];

export type UserRow = {
  id: number;
  name: string;
  first_name: string;
  last_name: string;
  email: string | null;
  contact_number: string | null;
  birthday: string | null;
  address: string | null;
  account_status: string;
  deactivated_at: string | null;
  created_at: string;
  member_qr: string | null;
  photo_url: string | null;
  photoUrl: string | null;
  initials: string;
  has_qr: boolean;
  user_chapters: any[];
  user_roles: any[];
  creator?: any;
  updated_by_user?: any;
  [key: string]: any;
};

type Props = {
  users: UserRow[];
  pagination: Pagination;
  chapters: { id: number; name: string }[];
  roles: { id: number; name: string; key: string; scope: string }[];
};

// --------------------------------- Main Component --------------------------------

export function UsersClient({ users, pagination, chapters, roles }: Props) {
  const [isPendingQR, startQRTransition] = useTransition();
  const [qrTarget, setQrTarget] = useState<UserRow | null>(null);

  // Manage roles dialog state
  const [managingRoles, setManagingRoles] = useState<UserRow | null>(null);

  function openManageRoles(row: UserRow) {
    setManagingRoles(row);
  }

  function validate(form: UserFormData) {
    const errors: Record<string, string | undefined> = {};
    if (!form.first_name.trim()) errors.first_name = "First name is required";
    if (!form.last_name.trim()) errors.last_name = "Last name is required";
    if (form.email.trim() && !isValidEmailFormat(form.email)) {
      errors.email = "Invalid email format";
    }

    if (
      form.contact_number.trim() &&
      !isValidPhoneNumber(form.contact_number)
    ) {
      errors.contact_number =
        "Must be a valid PH mobile number (e.g. 09123456789)";
    }

    return errors;
  }

  const chapterOptions = chapters.map((c) => ({
    value: String(c.id),
    label: c.name,
  }));

  const handleGenerateQR = (id: number) => {
    startQRTransition(async () => {
      const result = await generateUserQR(id);
      if (result.success) {
        toast.success(result.title ?? "Success", {
          description: result.description,
        });
        setQrTarget(null);
      } else {
        toast.error(result.title ?? "Error", {
          description: result.description,
        });
      }
    });
  };

  return (
    <>
      <ReferenceTypeClient<UserRow, UserFormData>
        entityLabel="User"
        pageTitle="User Management"
        pageDescription="View and manage all registered members in the system"
        rows={users}
        pagination={pagination}
        columns={columns}
        renderRow={(row) => ({
          name: <UserCell user={row} />,
          email: <TextCell value={row.email} />,
          contact_number: <TextCell value={row.contact_number} />,
          birthday: <DateCell date={row.birthday} dateOnly format="long" />,
          account_status: <UserStatusBadge status={row.account_status} />,
          created_at: <DateCell date={row.created_at} />,
          qr_code:
            row.has_qr && row.member_qr ? (
              <div onClick={(e) => e.stopPropagation()}>
                <MemberQRDialog
                  memberQr={row.member_qr}
                  userName={row.name}
                  onRegenerate={() => handleGenerateQR(row.id)}
                  isPendingRegenerate={isPendingQR}
                  triggerClassName="h-auto p-0 text-blue-600 hover:text-blue-700"
                />
              </div>
            ) : (
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-primary hover:text-primary/80"
                disabled={isPendingQR}
                onClick={(e) => {
                  e.stopPropagation();
                  setQrTarget(row);
                }}
              >
                Generate Code
              </Button>
            ),
        })}
        renderDetail={(row) => (
          <div>
            <DetailSection>
              <DetailField label={FIELD_LABELS.name}>
                <UserCell user={row} />
              </DetailField>
              <DetailField label={FIELD_LABELS.contact_number}>
                <TextCell value={row.contact_number} />
              </DetailField>
              <DetailField label={FIELD_LABELS.birthday}>
                <DateCell date={row.birthday} dateOnly format="long" />
              </DetailField>
              <DetailField label={FIELD_LABELS.email}>
                <TextCell value={row.email} />
              </DetailField>
              <DetailField label={FIELD_LABELS.chapter}>
                <TextCell value={row.user_chapters[0]?.chapter?.name} />
              </DetailField>
              <DetailField label={FIELD_LABELS.status}>
                <UserStatusBadge status={row.account_status} />
              </DetailField>
              <DetailField label={FIELD_LABELS.roles} fullWidth>
                <div className="flex flex-wrap gap-2">
                  {getDisplayRoles(row.user_roles).map((ur: any) => (
                    <Badge
                      key={ur.id}
                      variant="secondary"
                      className="h-auto rounded-md"
                    >
                      {ur.role.name}
                      {ur.chapter && ` (${ur.chapter.name})`}
                    </Badge>
                  ))}
                  {getDisplayRoles(row.user_roles).length === 0 && (
                    <span className="text-muted-foreground">
                      No roles assigned
                    </span>
                  )}
                </div>
              </DetailField>
              <DetailField label={FIELD_LABELS.address}>
                <TextCell value={row.address} />
              </DetailField>
              <DetailMeta
                id={row.id}
                createdAt={row.created_at}
                updatedAt={row.updated_at}
                createdBy={row.creator}
                updatedBy={row.updated_by}
              >
                {row.deactivated_at && (
                  <DetailField
                    label="Deactivated At"
                    contentClassName="text-xs text-muted-foreground"
                  >
                    <DateCell date={row.deactivated_at} />
                  </DetailField>
                )}

                {row.deactivated_by && (
                  <DetailField
                    label="Deactivated By"
                    contentClassName="text-xs text-muted-foreground"
                  >
                    <UserCell user={row.deactivated_by} />
                  </DetailField>
                )}
              </DetailMeta>
            </DetailSection>
          </div>
        )}
        initialForm={EMPTY_FORM}
        getFormFromRow={(row) => ({
          first_name: row.first_name,
          last_name: row.last_name,
          contact_number: row.contact_number ?? "",
          email: row.email ?? "",
          birthday: row.birthday ? row.birthday.split("T")[0] : "",
          account_status: row.account_status,
          address: row.address ?? "",
          chapter_id: row.user_chapters?.[0]?.chapter?.id,
        })}
        validate={validate}
        renderForm={(form, setForm, isEditing, errors) => {
          const isEmailEditable =
            !isEditing || form.account_status === ACCOUNT_STATUS.PENDING;

          return (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-2 gap-y-5">
                <FormInput
                  label={FIELD_LABELS.first_name}
                  id="first_name"
                  value={form.first_name}
                  onChange={(e) =>
                    setForm({ ...form, first_name: e.target.value })
                  }
                  error={errors.first_name}
                  required
                />
                <FormInput
                  label={FIELD_LABELS.last_name}
                  id="last_name"
                  value={form.last_name}
                  onChange={(e) =>
                    setForm({ ...form, last_name: e.target.value })
                  }
                  error={errors.last_name}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-2 gap-y-5">
                <FormInput
                  label={FIELD_LABELS.contact_number}
                  id="contact_number"
                  type="tel"
                  maxLength={11}
                  value={form.contact_number}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      contact_number: normalizePhoneNumber(e.target.value),
                    })
                  }
                  error={errors.contact_number}
                  placeholder="09123456789"
                />
                <FormInput
                  label={FIELD_LABELS.birthday}
                  id="birthday"
                  type="date"
                  value={form.birthday}
                  onChange={(e) =>
                    setForm({ ...form, birthday: e.target.value })
                  }
                />
              </div>

              <FormInput
                label={FIELD_LABELS.email}
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                error={errors.email}
                disabled={!isEmailEditable}
              />

              {!isEmailEditable && (
                <p className="text-xs text-muted-foreground -mt-3 italic">
                  Email cannot be edited because the account is no longer
                  pending
                </p>
              )}

              <FormSelect
                label={FIELD_LABELS.chapter}
                id="chapter_id"
                options={chapterOptions}
                value={form.chapter_id ? String(form.chapter_id) : ""}
                onValueChange={(val) =>
                  setForm({ ...form, chapter_id: Number(val) || undefined })
                }
                placeholder="Select Chapter (Optional)"
              />

              <FormTextarea
                label={FIELD_LABELS.address}
                id="address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
          );
        }}
        onCreate={createUser}
        onUpdate={updateUser}
        onDelete={deleteUser}
        canDelete={(row) => row.account_status === ACCOUNT_STATUS.PENDING}
        extraRowActions={(row) => [
          {
            label: "Manage Roles",
            icon: <FaUserCog className="mb-0.5" />,
            onClick: () => openManageRoles(row),
          },
        ]}
        confirmRowActions={[
          {
            label: "Remove Access",
            icon: <FaPowerOff className="mb-0.5" />,
            condition: (row) =>
              row.account_status !== ACCOUNT_STATUS.PENDING &&
              !row.deactivated_at &&
              getDisplayRoles(row.user_roles).length > 0,
            action: deactivateUser,
            title: "Remove Access?",
            description:
              "This will remove all active roles. The user can still log in but cannot access the dashboard.",
          },
          {
            label: "Restore Access",
            condition: (row) => !!row.deactivated_at,
            icon: <FaSyncAlt className="mb-0.5" />,
            action: restoreUser,
            title: "Restore Access?",
            description:
              "This will restore the roles that were removed. The user will regain access to the dashboard.",
          },
        ]}
      />

      <ManageRolesSheet
        user={managingRoles}
        onClose={() => setManagingRoles(null)}
        roles={roles}
        chapters={chapters}
      />

      <DeleteConfirmDialog
        open={!!qrTarget}
        onClose={() => setQrTarget(null)}
        onConfirm={() => qrTarget && handleGenerateQR(qrTarget.id)}
        isDeleting={isPendingQR}
        title="Generate QR Code?"
        description={
          <>
            Generate a QR code for <strong>{qrTarget?.name}</strong>? For
            security, members should generate their own QR code by logging into
            their account.
          </>
        }
        confirmingText="Generating..."
      />
    </>
  );
}
