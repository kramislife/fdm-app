"use client";

import { useState, useTransition } from "react";
import { sileo } from "sileo";
import { FaUserCheck, FaPowerOff, FaUserCog } from "react-icons/fa";
import { X } from "lucide-react";
import { MdLibraryAdd } from "react-icons/md";

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
import { Button } from "@/components/ui/button";

import { formatName } from "@/lib/format";
import { USER_STATUS, USER_STATUS_LABELS } from "@/lib/status";
import { ROLE_KEYS } from "@/lib/app-roles";
import {
  createUser,
  updateUser,
  deactivateUser,
  restoreUser,
  deleteUser,
  addUserRole,
  removeUserRole,
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
    role: { id: number; key: string; name: string; scope: string };
    chapter: { id: number; name: string } | null;
  }>;
  created_at: string;
  updated_at: string;
};

type ChapterOption = { id: number; name: string };
type RoleOption = { id: number; key: string; name: string; scope: string };
type PendingAdd = { key: string; roleId: number; chapterId?: number };

type UserForm = UserFormData;

// Constants

const EMPTY_FORM: UserForm = {
  first_name: "",
  last_name: "",
  contact_number: "",
  email: "",
  birthday: "",
  status: USER_STATUS.ACTIVE,
  address: "",
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
    status: row.status,
    address: row.address ?? "",
  };
}

function RemovableBadge({
  name,
  sub,
  onRemove,
  variant = "outline",
  disabled = false,
  markedForRemoval = false,
}: {
  name: string;
  sub?: string;
  onRemove?: () => void;
  variant?: "outline" | "secondary";
  disabled?: boolean;
  markedForRemoval?: boolean;
}) {
  return (
    <Badge
      variant={markedForRemoval ? "outline" : variant}
      className={`p-3${markedForRemoval ? " opacity-40 line-through" : ""}`}
    >
      <span>{name}</span>
      {sub && <span className="text-muted-foreground">· {sub}</span>}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          className="ml-1 text-primary cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={`${markedForRemoval ? "Undo remove" : "Remove"} ${name}`}
          title={`${markedForRemoval ? "Undo remove" : "Remove"} ${name}`}
        >
          <X className="size-3" />
        </button>
      )}
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
  const [managingRoles, setManagingRoles] = useState<UserRow | null>(null);
  const [pendingAdds, setPendingAdds] = useState<PendingAdd[]>([]);
  const [pendingRemoveIds, setPendingRemoveIds] = useState<number[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [selectedChapterId, setSelectedChapterId] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const [isSubmitting, startSubmitTransition] = useTransition();

  const chapterOptions = chapters.map((c) => ({
    value: c.id.toString(),
    label: c.name,
  }));

  const pendingRemoveSet = new Set(pendingRemoveIds);
  const currentRoles = (managingRoles?.user_roles ?? []).filter(
    (ur) => !pendingRemoveSet.has(ur.id),
  );
  const pendingAddRoleIds = new Set(pendingAdds.map((pa) => pa.roleId));
  const assignedRoleIds = new Set([
    ...currentRoles.map((ur) => ur.role.id),
    ...pendingAddRoleIds,
  ]);
  const availableRoles = roles.filter(
    (r) => !assignedRoleIds.has(r.id) && r.key !== ROLE_KEYS.MINISTRY_HEAD,
  );
  const selectedRole =
    roles.find((r) => r.id.toString() === selectedRoleId) ?? null;
  const needsChapter = selectedRole?.scope === "chapter";

  function getAvailableRolesForRow(rowKey: string, rowRoleId: number) {
    const currentRoleIds = new Set(currentRoles.map((ur) => ur.role.id));
    const otherPendingIds = new Set(
      pendingAdds.filter((pa) => pa.key !== rowKey).map((pa) => pa.roleId),
    );
    return roles.filter(
      (r) =>
        r.id === rowRoleId ||
        (!currentRoleIds.has(r.id) &&
          !otherPendingIds.has(r.id) &&
          r.key !== ROLE_KEYS.MINISTRY_HEAD),
    );
  }

  function openManageRoles(row: UserRow) {
    setManagingRoles(row);
    setPendingAdds([]);
    setPendingRemoveIds([]);
    setSelectedRoleId("");
    setSelectedChapterId("");
    setAddError(null);
  }

  function handleRoleSelect(value: string) {
    setSelectedRoleId(value);
    setAddError(null);
    // FIX 2: only clear chapter when switching to a global role
    const role = roles.find((r) => r.id.toString() === value);
    if (role?.scope !== "chapter") setSelectedChapterId("");
  }

  function handleChapterSelect(value: string) {
    setSelectedChapterId(value);
    setAddError(null);
  }

  function handleAdd() {
    if (!selectedRoleId) {
      setAddError("Please select a role.");
      return;
    }
    const role = roles.find((r) => r.id.toString() === selectedRoleId);
    if (!role) return;
    if (role.scope === "chapter" && !selectedChapterId) {
      setAddError("Chapter is required for this role.");
      return;
    }
    setPendingAdds((prev) => [
      ...prev,
      {
        key: String(Date.now()),
        roleId: role.id,
        chapterId:
          role.scope === "chapter" && selectedChapterId
            ? parseInt(selectedChapterId, 10)
            : undefined,
      },
    ]);
    setSelectedRoleId("");
    setSelectedChapterId("");
    setAddError(null);
  }

  function updatePendingRole(key: string, value: string) {
    const role = roles.find((r) => r.id.toString() === value);
    setPendingAdds((prev) =>
      prev.map((pa) =>
        pa.key === key
          ? {
              ...pa,
              roleId: parseInt(value, 10),
              chapterId: role?.scope !== "chapter" ? undefined : pa.chapterId,
            }
          : pa,
      ),
    );
  }

  function updatePendingChapter(key: string, value: string) {
    setPendingAdds((prev) =>
      prev.map((pa) =>
        pa.key === key ? { ...pa, chapterId: parseInt(value, 10) } : pa,
      ),
    );
  }

  function removePending(key: string) {
    setPendingAdds((prev) => prev.filter((pa) => pa.key !== key));
  }

  function handleMarkRemove(userRoleId: number) {
    setPendingRemoveIds((prev) => [...prev, userRoleId]);
  }

  function handleSubmit() {
    if (!managingRoles) return;

    for (const pa of pendingAdds) {
      const role = roles.find((r) => r.id === pa.roleId);
      if (role?.scope === "chapter" && !pa.chapterId) {
        sileo.error({
          title: "Missing chapter",
          description: `Please select a chapter for ${role.name}.`,
        });
        return;
      }
    }

    if (pendingAdds.length === 0 && pendingRemoveIds.length === 0) {
      sileo.error({
        title: "No changes",
        description: "Please add or remove at least one role.",
      });
      return;
    }

    startSubmitTransition(async () => {
      const results = await Promise.all([
        ...pendingAdds.map((pa) =>
          addUserRole(managingRoles.id, pa.roleId, pa.chapterId),
        ),
        ...pendingRemoveIds.map((id) => removeUserRole(managingRoles.id, id)),
      ]);

      const failed = results.find((r) => !r.success);
      if (failed) {
        sileo.error({
          title: "Something went wrong",
          description: failed.error ?? "Failed to update roles.",
        });
        return;
      }

      const warning = results
        .map((r) => ("warning" in r ? r.warning : undefined))
        .find(Boolean);

      sileo.success({
        title: "Roles updated!",
        description: warning ?? "User roles have been updated successfully.",
      });
      setManagingRoles(null);
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
                {row.user_roles.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {row.user_roles.map((ur) => (
                      <RemovableBadge
                        key={ur.id}
                        name={ur.role.name}
                        sub={ur.chapter?.name}
                        variant="secondary"
                      />
                    ))}
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    No roles assigned.
                  </span>
                )}
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
              <FormInput
                label={FIELD_LABELS.first_name}
                id="user-first-name"
                value={form.first_name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, first_name: e.target.value }))
                }
                required
              />
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
              <FormSelect
                label={FIELD_LABELS.status}
                id="user-status"
                value={form.status}
                onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}
                options={STATUS_OPTIONS}
                required
              />
            </div>

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
              row.status === USER_STATUS.REGISTERED ||
              row.status === USER_STATUS.PENDING,
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
        description={
          managingRoles
            ? `Assign or remove roles for ${formatName(managingRoles)}`
            : ""
        }
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitLabel="Update"
      >
        {managingRoles && (
          <div className="space-y-5">
            {/* Current roles — badge per role, click X to mark for removal */}
            <DetailSection>
              <DetailField label="Current Roles" fullWidth>
                {managingRoles.user_roles.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {managingRoles.user_roles.map((ur) => {
                      const marked = pendingRemoveSet.has(ur.id);
                      return (
                        <RemovableBadge
                          key={ur.id}
                          name={ur.role.name}
                          sub={ur.chapter?.name}
                          onRemove={() =>
                            marked
                              ? setPendingRemoveIds((prev) =>
                                  prev.filter((id) => id !== ur.id),
                                )
                              : handleMarkRemove(ur.id)
                          }
                          variant="secondary"
                          disabled={isSubmitting}
                          markedForRemoval={marked}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    No roles assigned.
                  </span>
                )}
              </DetailField>
            </DetailSection>

            {/* Add Role form: [Role] [Chapter?] [Add] */}
            <div className="flex gap-2 items-center">
              <FormSelect
                label="Add Role"
                id="manage-role-select"
                value={selectedRoleId}
                onValueChange={handleRoleSelect}
                options={availableRoles.map((r) => ({
                  value: r.id.toString(),
                  label: r.name,
                }))}
                placeholder="Select a role..."
                wrapperClassName="flex-1"
                disabled={isSubmitting}
                labelClassName="font-bold"
              />
              {needsChapter && (
                <FormSelect
                  label="Chapter"
                  id="manage-role-chapter"
                  value={selectedChapterId}
                  onValueChange={handleChapterSelect}
                  options={chapterOptions}
                  placeholder="Select chapter..."
                  wrapperClassName="flex-1"
                  disabled={isSubmitting}
                  labelClassName="font-bold"
                />
              )}
              <Button
                type="button"
                onClick={handleAdd}
                disabled={isSubmitting}
                className="px-2 mt-3"
              >
                <MdLibraryAdd />
              </Button>
            </div>
            {addError && <p className="text-xs text-destructive">{addError}</p>}

            {/* Staged pending adds — editable rows */}
            {pendingAdds.length > 0 && (
              <div className="space-y-2">
                {pendingAdds.map((pa) => {
                  const paRole = roles.find((r) => r.id === pa.roleId);
                  const paAvailable = getAvailableRolesForRow(
                    pa.key,
                    pa.roleId,
                  );
                  return (
                    <div key={pa.key} className="flex gap-2 items-center">
                      <FormSelect
                        label="Role"
                        id={`pending-role-${pa.key}`}
                        value={pa.roleId.toString()}
                        onValueChange={(v) => updatePendingRole(pa.key, v)}
                        options={paAvailable.map((r) => ({
                          value: r.id.toString(),
                          label: r.name,
                        }))}
                        wrapperClassName="flex-1"
                        disabled={isSubmitting}
                      />
                      {paRole?.scope === "chapter" && (
                        <FormSelect
                          label="Chapter"
                          id={`pending-chapter-${pa.key}`}
                          value={pa.chapterId?.toString() ?? ""}
                          onValueChange={(v) => updatePendingChapter(pa.key, v)}
                          options={chapterOptions}
                          placeholder="Select chapter..."
                          wrapperClassName="flex-1"
                          disabled={isSubmitting}
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => removePending(pa.key)}
                        disabled={isSubmitting}
                        className="text-primary cursor-pointer disabled:opacity-50 mt-3"
                        aria-label="Remove pending role"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </AdminSheet>
    </>
  );
}
