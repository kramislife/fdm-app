"use client";

import { useState, useTransition } from "react";
import { sileo } from "sileo";
import { FaUserCheck, FaPowerOff, FaUserCog } from "react-icons/fa";
import { X } from "lucide-react";

import type { Column } from "@/components/admin/data-table";
import type { Pagination } from "@/lib/table";
import { ReferenceTypeClient } from "@/components/admin/reference-type-client";
import { AdminSheet } from "@/components/admin/admin-sheet";
import {
  TextCell,
  UserCell,
  DateCell,
  UserStatusBadge,
} from "@/components/shared/cells";
import {
  DetailField,
  DetailSection,
  DetailMeta,
} from "@/components/shared/detail-field";
import {
  FormInput,
  FormSelect,
  FormTextarea,
} from "@/components/shared/form-fields";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { formatName } from "@/lib/format";
import { USER_STATUS, USER_STATUS_LABELS } from "@/lib/status";
import {
  createUser,
  updateUser,
  deactivateUser,
  restoreUser,
  deleteUser,
  addUserRoles,
  removeUserRoles,
  type UserFormData,
} from "./actions";

export type UserRow = {
  id: number;
  name: string;
  first_name: string;
  last_name: string;
  email: string | null;
  contact_number: string | null;
  address: string | null;
  birthday: string | null;
  status: string;
  user_chapters: Array<{
    chapter: { id: number; name: string };
  }>;
  user_roles: Array<{
    id: number;
    role: { id: number; key: string; name: string };
    chapter: { id: number; name: string } | null;
  }>;
  created_at: string;
  updated_at: string;
};

type ChapterOption = { id: number; name: string };
type RoleOption = { id: number; key: string; name: string; scope: string };

type UserForm = UserFormData;

type ManageRoleForm = {
  selectedRoleId: string;
  pendingRoleIds: number[];
  pendingRemoveRoleIds: number[];
};

// Constants

const EMPTY_FORM: UserForm = {
  first_name: "",
  last_name: "",
  contact_number: "",
  email: "",
  birthday: "",
  chapter_id: "",
  status: USER_STATUS.ACTIVE,
  address: "",
};

const EMPTY_ROLE_FORM: ManageRoleForm = {
  selectedRoleId: "",
  pendingRoleIds: [],
  pendingRemoveRoleIds: [],
};

const STATUS_OPTIONS = [
  USER_STATUS.ACTIVE,
  USER_STATUS.REGISTERED,
  USER_STATUS.PENDING,
].map((value) => ({ value, label: USER_STATUS_LABELS[value] }));

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
  { key: "chapter", label: FIELD_LABELS.chapter },
  { key: "status", label: FIELD_LABELS.status, align: "center" },
  { key: "created_at", label: FIELD_LABELS.created_at, sortable: true },
  { key: "actions", label: "Actions", align: "center" },
];

// Helpers

function getFormFromRow(row: UserRow): UserForm {
  return {
    first_name: row.first_name,
    last_name: row.last_name,
    contact_number: row.contact_number ?? "",
    email: row.email ?? "",
    birthday: row.birthday ? row.birthday.split("T")[0] : "",
    chapter_id: row.user_chapters[0]?.chapter?.id.toString() ?? "",
    status: row.status,
    address: row.address ?? "",
  };
}

// Badge Component

function RemovableBadge({
  name,
  onRemove,
}: {
  name: string;
  onRemove: () => void;
}) {
  return (
    <Badge variant="outline" className="py-3">
      {name}
      <button
        type="button"
        onClick={onRemove}
        className="ml-0.5 rounded-full hover:bg-muted p-0.5 hover:text-primary transition-colors cursor-pointer"
        aria-label={`Remove ${name}`}
        title={`Remove ${name}`}
      >
        <X className="size-3" />
      </button>
    </Badge>
  );
}

type Props = {
  users: UserRow[];
  pagination: Pagination;
  chapters: ChapterOption[];
  roles: RoleOption[];
};

export function UsersClient({ users, pagination, chapters, roles }: Props) {
  // Extra state — not handled by ReferenceTypeClient
  const [managingRoles, setManagingRoles] = useState<UserRow | null>(null);
  const [roleForm, setRoleForm] = useState<ManageRoleForm>(EMPTY_ROLE_FORM);

  const [isRoleSaving, startRoleTransition] = useTransition();

  const chapterOptions = chapters.map((c) => ({
    value: c.id.toString(),
    label: c.name,
  }));

  const pendingRemoveIdSet = new Set(roleForm.pendingRemoveRoleIds);
  const currentRoles = (managingRoles?.user_roles ?? []).filter(
    (ur) => !pendingRemoveIdSet.has(ur.role.id),
  );
  const assignedRoleIds = new Set(currentRoles.map((ur) => ur.role.id));
  const pendingRoleIdSet = new Set(roleForm.pendingRoleIds);
  const availableRoles = roles.filter(
    (r) => !assignedRoleIds.has(r.id) && !pendingRoleIdSet.has(r.id),
  );

  function openManageRoles(row: UserRow) {
    setManagingRoles(row);
    setRoleForm(EMPTY_ROLE_FORM);
  }

  function handleSelectRole(roleId: string) {
    const id = parseInt(roleId, 10);
    if (isNaN(id)) return;
    setRoleForm((f) => ({
      ...f,
      selectedRoleId: "",
      pendingRoleIds: [...f.pendingRoleIds, id],
    }));
  }

  function handleRemovePendingRole(roleId: number) {
    setRoleForm((f) => ({
      ...f,
      pendingRoleIds: f.pendingRoleIds.filter((id) => id !== roleId),
    }));
  }

  function handleRemoveCurrentRole(roleId: number) {
    setRoleForm((f) => ({
      ...f,
      pendingRemoveRoleIds: [...f.pendingRemoveRoleIds, roleId],
    }));
  }

  function handleRoleSubmit() {
    if (!managingRoles) return;
    const hasAdd = roleForm.pendingRoleIds.length > 0;
    const hasRemove = roleForm.pendingRemoveRoleIds.length > 0;

    if (!hasAdd && !hasRemove) {
      sileo.error({
        title: "No changes",
        description: "Please add or remove at least one role.",
      });
      return;
    }

    startRoleTransition(async () => {
      const results = await Promise.all([
        hasAdd ? addUserRoles(managingRoles.id, roleForm.pendingRoleIds) : null,
        hasRemove
          ? removeUserRoles(managingRoles.id, roleForm.pendingRemoveRoleIds)
          : null,
      ]);

      const failed = results.find((r) => r && !r.success);
      if (failed) {
        sileo.error({
          title: "Something went wrong",
          description: failed.error ?? "Failed to update roles.",
        });
      } else {
        sileo.success({
          title: "Roles updated!",
          description: "User roles have been updated successfully.",
        });
        setManagingRoles(null);
      }
    });
  }

  return (
    <>
      <ReferenceTypeClient<UserRow, UserForm>
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
          chapter: <TextCell value={row.user_chapters[0]?.chapter?.name} />,
          status: <UserStatusBadge status={row.status} />,
          created_at: <DateCell date={row.created_at} />,
        })}
        renderDetail={(row) => (
          <>
            <DetailSection>
              <DetailField label={FIELD_LABELS.name}>
                <UserCell user={row} />
              </DetailField>
              <DetailField label={FIELD_LABELS.email}>
                <TextCell value={row.email} />
              </DetailField>
              <DetailField label={FIELD_LABELS.contact_number}>
                <TextCell value={row.contact_number} />
              </DetailField>
              <DetailField label={FIELD_LABELS.birthday}>
                <DateCell date={row.birthday} dateOnly format="long" />
              </DetailField>
              <DetailField label={FIELD_LABELS.chapter}>
                <TextCell value={row.user_chapters[0]?.chapter?.name} />
              </DetailField>
              <DetailField label={FIELD_LABELS.status}>
                <UserStatusBadge status={row.status} />
              </DetailField>
              <DetailField label={FIELD_LABELS.address} fullWidth>
                <TextCell value={row.address} />
              </DetailField>
              <DetailField label={FIELD_LABELS.roles} fullWidth>
                <TextCell
                  value={row.user_roles.map((r) => r.role.name).join(", ")}
                />
              </DetailField>
            </DetailSection>
            <DetailMeta
              id={row.id}
              createdAt={row.created_at}
              updatedAt={row.updated_at}
            />
          </>
        )}
        initialForm={EMPTY_FORM}
        getFormFromRow={getFormFromRow}
        renderForm={(form, setForm, isEditing) => (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-2">
              {/* First Name */}
              <FormInput
                label={FIELD_LABELS.first_name}
                id="user-first-name"
                value={form.first_name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, first_name: e.target.value }))
                }
                required
              />

              {/* Last Name */}
              <FormInput
                label={FIELD_LABELS.last_name}
                id="user-last-name"
                value={form.last_name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, last_name: e.target.value }))
                }
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-2">
              {/* Contact Number */}
              <FormInput
                label={FIELD_LABELS.contact_number}
                id="user-contact"
                type="tel"
                value={form.contact_number}
                onChange={(e) =>
                  setForm((f) => ({ ...f, contact_number: e.target.value }))
                }
                optional
              />

              {/* Email Address */}
              <FormInput
                label={FIELD_LABELS.email}
                id="user-email"
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                disabled={isEditing}
                optional={!isEditing}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-2">
              {/* Birthday */}
              <FormInput
                label={FIELD_LABELS.birthday}
                id="user-birthday"
                type="date"
                value={form.birthday}
                onChange={(e) =>
                  setForm((f) => ({ ...f, birthday: e.target.value }))
                }
                optional
              />

              {/* Select Chapter */}
              <FormSelect
                label={FIELD_LABELS.chapter}
                id="user-chapter"
                value={form.chapter_id}
                onValueChange={(v) => setForm((f) => ({ ...f, chapter_id: v }))}
                options={chapterOptions}
                required
              />
            </div>

            {/* Select Status */}
            <FormSelect
              label={FIELD_LABELS.status}
              id="user-status"
              value={form.status}
              onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}
              options={STATUS_OPTIONS}
              required
            />

            {/* Address Field */}
            <FormTextarea
              label={FIELD_LABELS.address}
              id="user-address"
              value={form.address}
              onChange={(e) =>
                setForm((f) => ({ ...f, address: e.target.value }))
              }
            />
          </div>
        )}
        onCreate={createUser}
        onUpdate={updateUser}
        onDelete={deleteUser}
        extraRowActions={(row) => [
          {
            label: "Manage Roles",
            icon: <FaUserCog className="mb-0.5" />,
            onClick: () => openManageRoles(row),
          },
        ]}
        confirmRowActions={[
          {
            label: "Deactivate",
            icon: <FaPowerOff className="mb-0.5" />,
            condition: (row) =>
              row.status === USER_STATUS.ACTIVE ||
              row.status === USER_STATUS.REGISTERED,
            action: deactivateUser,
            title: "Deactivate user?",
            description:
              "will be set to inactive and lose access to the system.",
            successTitle: "User deactivated",
            successDescription: (row) =>
              `${formatName(row)} has been deactivated.`,
            confirmingText: "Deactivating...",
          },
          {
            label: "Restore",
            icon: <FaUserCheck className="mb-0.5" />,
            condition: (row) => row.status === USER_STATUS.INACTIVE,
            action: restoreUser,
            title: "Restore user?",
            description: "will be restored to active status.",
            successTitle: "User restored",
            successDescription: (row) =>
              `${formatName(row)} has been restored to active.`,
            confirmingText: "Restoring...",
          },
        ]}
      />

      {/* Manage Roles Sheet */}
      <AdminSheet
        open={!!managingRoles}
        onClose={() => setManagingRoles(null)}
        title="Manage Roles"
        description="Assign roles to this user"
        onSubmit={handleRoleSubmit}
        isSubmitting={isRoleSaving}
        submitLabel="Update"
      >
        {managingRoles && (
          <div className="space-y-5">
            <DetailSection>
              <DetailField label={FIELD_LABELS.name}>
                <UserCell user={managingRoles} />
              </DetailField>
              <DetailField label={FIELD_LABELS.chapter}>
                <TextCell
                  value={managingRoles.user_chapters[0]?.chapter?.name}
                />
              </DetailField>
            </DetailSection>

            <div className="space-y-2">
              <Label className="font-bold">Current Roles</Label>
              <div className="flex flex-wrap gap-2">
                {currentRoles.length > 0 ? (
                  currentRoles.map((ur) => (
                    <RemovableBadge
                      key={ur.id}
                      name={ur.role.name}
                      onRemove={() => handleRemoveCurrentRole(ur.role.id)}
                    />
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">
                    No roles assigned
                  </span>
                )}
              </div>
            </div>

            <FormSelect
              label="Add Role"
              id="manage-role-select"
              value={roleForm.selectedRoleId}
              onValueChange={handleSelectRole}
              options={availableRoles.map((r) => ({
                value: r.id.toString(),
                label: r.name,
              }))}
              description="Select a role to add — it will appear below before saving"
              labelClassName="font-bold"
              placeholder="Support multiple role(s)"
            />

            {roleForm.pendingRoleIds.length > 0 && (
              <div className="space-y-2">
                <Label className="font-bold">Roles to Add</Label>
                <div className="flex flex-wrap gap-2">
                  {roleForm.pendingRoleIds.map((id) => {
                    const role = roles.find((r) => r.id === id);
                    return (
                      <RemovableBadge
                        key={id}
                        name={role?.name ?? `Role #${id}`}
                        onRemove={() => handleRemovePendingRole(id)}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </AdminSheet>
    </>
  );
}
