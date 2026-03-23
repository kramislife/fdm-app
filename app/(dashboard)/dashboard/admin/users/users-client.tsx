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
  formatToISODate,
} from "@/lib/format";
import {
  createUser,
  updateUser,
  deactivateUser,
  restoreUser,
  deleteUser,
  generateUserQR,
  resendCredentials,
  type UserFormData,
} from "./actions";
import { FaPowerOff, FaSyncAlt, FaUserCog, FaEnvelope } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { UserQRDialog } from "@/components/shared/qr-code";
import { ConfirmActionDialog } from "@/components/admin/confirm-dialog";
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
  is_qr_only: false,
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
  is_qr_only: "Account Type",
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
  { key: "qr_code", label: FIELD_LABELS.qr_code, align: "center" },
  { key: "created_at", label: FIELD_LABELS.created_at, sortable: true },
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
  updated_at: string;
  member_qr: string | null;
  photo_url: string | null;
  photoUrl: string | null;
  initials: string;
  is_qr_only: boolean;
  is_temp_password: boolean;
  user_chapters: any[];
  user_roles: any[];
  creator?: any;
  updated_by?: any;
  [key: string]: any;
};

type Props = {
  users: UserRow[];
  pagination: Pagination;
  chapters: { id: number; name: string }[];
  roles: { id: number; name: string; key: string; scope: string }[];
  currentUserId: number;
};

// --------------------------------- Main Component --------------------------------

export function UsersClient({
  users,
  pagination,
  chapters,
  roles,
  currentUserId,
}: Props) {
  const [isPendingQR, startQRTransition] = useTransition();
  const [qrTarget, setQrTarget] = useState<UserRow | null>(null);

  // QR dialog shown after QR-only user creation
  const [newQrData, setNewQrData] = useState<{
    qr: string;
    name: string;
  } | null>(null);

  // Manage roles dialog state
  const [managingRoles, setManagingRoles] = useState<UserRow | null>(null);

  function openManageRoles(row: UserRow) {
    setManagingRoles(row);
  }

  function validate(form: UserFormData) {
    const errors: Record<string, string | undefined> = {};
    if (!form.first_name.trim()) errors.first_name = "First name is required";
    if (!form.last_name.trim()) errors.last_name = "Last name is required";

    if (!form.is_qr_only) {
      if (!form.email.trim()) {
        errors.email = "Email is required";
      } else if (!isValidEmailFormat(form.email)) {
        errors.email = "Invalid email format";
      }
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

  // Wrap createUser to intercept member_qr for QR-only creation
  async function handleCreate(data: UserFormData) {
    const result = await createUser(data);
    if (result.success && result.member_qr) {
      setNewQrData({
        qr: result.member_qr,
        name: `${data.first_name} ${data.last_name}`,
      });
    }
    return result;
  }

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
          qr_code: row.member_qr ? (
            <div onClick={(e) => e.stopPropagation()}>
              <UserQRDialog
                memberQr={row.member_qr}
                userName={row.name}
                regenerateAction={() => generateUserQR(row.id)}
                triggerClassName="h-auto p-0 text-blue-600 hover:text-blue-700"
              />
            </div>
          ) : row.is_qr_only ? (
            // QR-only user with no QR yet (shouldn't normally happen)
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
              Generate
            </Button>
          ) : row.account_status === ACCOUNT_STATUS.VERIFIED ? (
            // Verified normal member — QR should have been generated on first login
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
              Generate
            </Button>
          ) : (
            // Pending/expired normal member — QR auto-generated on first login
            <Button
              variant="secondary"
              size="sm"
              className="h-auto p-0 bg-transparent hover:bg-transparent cursor-default"
            >
              Not Activated
            </Button>
          ),
          created_at: <DateCell date={row.created_at} />,
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
              <DetailField label={FIELD_LABELS.address}>
                <TextCell value={row.address} />
              </DetailField>
              <DetailField label={FIELD_LABELS.chapter}>
                <TextCell value={row.user_chapters[0]?.chapter?.name} />
              </DetailField>
              <DetailField label={FIELD_LABELS.roles}>
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
              <DetailField label={FIELD_LABELS.is_qr_only}>
                <Badge variant={row.is_qr_only ? "error" : "success"}>
                  {row.is_qr_only ? "Quick Pass" : "With Account"}
                </Badge>
              </DetailField>
              <DetailField label={FIELD_LABELS.status}>
                <UserStatusBadge status={row.account_status} />
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
          birthday: formatToISODate(row.birthday),
          account_status: row.account_status,
          address: row.address ?? "",
          chapter_id: row.user_chapters?.[0]?.chapter?.id,
          is_qr_only: row.is_qr_only,
        })}
        validate={validate}
        renderForm={(form, setForm, isEditing, errors) => {
          // Email editable for new users, pending normal users, and QR-only conversions
          const isEmailEditable =
            !isEditing || form.account_status === ACCOUNT_STATUS.PENDING;

          // Toggle disabled when editing a normal (non-QR-only) user
          const isQrOnlyToggleDisabled = isEditing && !form.is_qr_only;

          return (
            <div className="space-y-5">
              {/* QR-Only Toggle */}
              <div className="flex items-start gap-3 rounded-lg border px-4 py-3">
                <Switch
                  id="is_qr_only"
                  checked={form.is_qr_only}
                  disabled={isQrOnlyToggleDisabled}
                  onCheckedChange={(val) =>
                    setForm({
                      ...form,
                      is_qr_only: val,
                      email: val ? "" : form.email,
                      contact_number: val ? "" : form.contact_number,
                    })
                  }
                />
                <div>
                  <Label
                    htmlFor="is_qr_only"
                    className="font-bold cursor-pointer"
                  >
                    {form.is_qr_only ? "Quick Pass" : "With Account"}
                  </Label>
                  <p className="text-xs text-muted-foreground mt-2">
                    {form.is_qr_only
                      ? "Get your attendance pass instantly — no login required"
                      : "Register with complete details"}
                  </p>
                </div>
              </div>

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

              {!form.is_qr_only && (
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
              )}

              {form.is_qr_only && (
                <FormInput
                  label={FIELD_LABELS.birthday}
                  id="birthday"
                  type="date"
                  value={form.birthday}
                  onChange={(e) =>
                    setForm({ ...form, birthday: e.target.value })
                  }
                />
              )}

              {!form.is_qr_only && (
                <>
                  <FormInput
                    label={FIELD_LABELS.email}
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    error={errors.email}
                    disabled={!isEmailEditable}
                    required
                  />
                  {!isEmailEditable && (
                    <p className="text-xs text-muted-foreground -mt-3 italic">
                      Email cannot be edited for verified or expired accounts
                    </p>
                  )}
                </>
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
        onCreate={handleCreate}
        onUpdate={updateUser}
        onDelete={deleteUser}
        canDelete={(row) =>
          row.account_status === ACCOUNT_STATUS.PENDING ||
          row.account_status === ACCOUNT_STATUS.EXPIRED
        }
        extraRowActions={(row) => [
          {
            label: "Manage Roles",
            icon: <FaUserCog className="mb-0.5" />,
            onClick: () => openManageRoles(row),
          },
        ]}
        confirmRowActions={[
          {
            label: "Resend Credentials",
            icon: <FaEnvelope className="mb-0.5" />,
            condition: (row) =>
              !row.is_qr_only &&
              row.is_temp_password &&
              (row.account_status === ACCOUNT_STATUS.PENDING ||
                row.account_status === ACCOUNT_STATUS.EXPIRED),
            action: resendCredentials,
            title: "Resend Credentials?",
            description:
              "A new temporary password will be generated and sent to the user's email address.",
            confirmingText: "Resending...",
          },
          {
            label: "Remove Access",
            icon: <FaPowerOff className="mb-0.5" />,
            condition: (row) =>
              !row.is_qr_only &&
              row.account_status !== ACCOUNT_STATUS.PENDING &&
              !row.deactivated_at &&
              getDisplayRoles(row.user_roles).length > 0,
            action: deactivateUser,
            title: "Remove Access?",
            description:
              "This will remove all active roles. The user can still log in but cannot access the dashboard.",
            confirmingText: "Removing...",
          },
          {
            label: "Restore Access",
            condition: (row) => !!row.deactivated_at,
            icon: <FaSyncAlt className="mb-0.5" />,
            action: restoreUser,
            title: "Restore Access?",
            description:
              "This will restore the roles that were removed. The user will regain access to the dashboard.",
            confirmingText: "Restoring...",
          },
        ]}
      />

      <ManageRolesSheet
        user={managingRoles}
        onClose={() => setManagingRoles(null)}
        roles={roles}
        chapters={chapters}
      />

      {/* Confirm dialog for generating QR from table */}
      <ConfirmActionDialog
        open={!!qrTarget}
        onClose={() => setQrTarget(null)}
        onConfirm={() => qrTarget && handleGenerateQR(qrTarget.id)}
        isPending={isPendingQR}
        title="Generate QR Code?"
        description="This will create a secure QR code for attendance tracking linked to the selected account."
        confirmingText="Generating..."
      />

      {/* Show QR dialog immediately after QR-only user creation */}
      {newQrData && (
        <UserQRDialog
          memberQr={newQrData.qr}
          userName={newQrData.name}
          defaultOpen
          showRegenerate={false}
          onClose={() => setNewQrData(null)}
        />
      )}
    </>
  );
}
