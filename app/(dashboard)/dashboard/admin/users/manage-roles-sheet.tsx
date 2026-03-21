"use client";

import { useState, useTransition, useEffect } from "react";
import { AdminSheet } from "@/components/admin/admin-sheet";
import { DetailSection, DetailField } from "@/components/shared/detail-field";
import {
  FormSelect,
  type FormSelectGroup,
} from "@/components/shared/form-fields";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MdLibraryAdd } from "react-icons/md";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { updateUserRoles, type UserRoleInput } from "./actions";

// -------------------------------- TYPES --------------------------------

type UserRow = {
  id: number;
  name: string;
  user_roles: any[];
  user_chapters: any[];
};

type Role = {
  id: number;
  name: string;
  key: string;
  scope: string;
};

type PendingAdd = { key: string; roleId: number; chapterId?: number };

interface ManageRolesSheetProps {
  user: UserRow | null;
  onClose: () => void;
  roles: Role[];
  chapters: { id: number; name: string }[];
}

export const EXCLUDED_ROLE_KEYS = new Set(["member", "ministry_head"]);

export const formatRoleName = (ur: any) => {
  const name = ur.role.name;
  const sub = ur.chapter?.name;
  return sub ? `${name} (${sub})` : name;
};

export const getDisplayRoles = (userRoles: any[]) =>
  userRoles.filter((ur) => !EXCLUDED_ROLE_KEYS.has(ur.role.key));

// -------------------------------- RemovableBadge --------------------------------

function RemovableBadge({
  name,
  sub,
  onToggle,
  disabled,
  markedForRemoval,
}: {
  name: string;
  sub?: string;
  onToggle: () => void;
  disabled?: boolean;
  markedForRemoval: boolean;
}) {
  return (
    <Badge
      variant={markedForRemoval ? "error" : "secondary"}
      className="gap-2 h-auto py-1 rounded-md"
    >
      <span className={cn(markedForRemoval && "line-through opacity-70")}>
        <span className="font-bold">{name}</span>
        {sub ? ` (${sub})` : ""}
      </span>
      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        className="ml-1 cursor-pointer disabled:opacity-50 hover:opacity-70"
        aria-label={markedForRemoval ? "Undo remove" : "Remove role"}
        title={markedForRemoval ? "Undo remove" : "Remove role"}
      >
        <X className="size-3" />
      </button>
    </Badge>
  );
}

// -------------------------------- ManageRolesSheet --------------------------------

export function ManageRolesSheet({
  user,
  onClose,
  roles,
  chapters,
}: ManageRolesSheetProps) {
  const [isPending, startTransition] = useTransition();
  const [pendingRemoveIds, setPendingRemoveIds] = useState<number[]>([]);
  const [pendingAdds, setPendingAdds] = useState<PendingAdd[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [selectedChapterId, setSelectedChapterId] = useState("");
  const [addError, setAddError] = useState("");

  // Reset state when user changes
  useEffect(() => {
    if (user) {
      setPendingRemoveIds([]);
      setPendingAdds([]);
      setSelectedRoleId("");
      setSelectedChapterId("");
      setAddError("");
    }
  }, [user]);

  if (!user) return null;

  const updatePendingAdd = (key: string, updates: Partial<PendingAdd>) => {
    setPendingAdds((prev) =>
      prev.map((pa) => (pa.key === key ? { ...pa, ...updates } : pa)),
    );
  };

  const manageableRoles = roles.filter((r) => !EXCLUDED_ROLE_KEYS.has(r.key));
  const pendingRemoveSet = new Set(pendingRemoveIds);

  const chapterOptions = chapters.map((c) => ({
    value: String(c.id),
    label: c.name,
  }));

  const activeDisplayRoles = getDisplayRoles(user.user_roles);

  const getAvailableRolesToAdd = () => {
    const activeTakenIds = new Set(
      activeDisplayRoles
        .filter((ur: any) => !pendingRemoveSet.has(ur.id))
        .map((ur: any) => ur.role.id as number),
    );
    const pendingTakenIds = new Set(pendingAdds.map((pa) => pa.roleId));
    return manageableRoles.filter(
      (r) => !activeTakenIds.has(r.id) && !pendingTakenIds.has(r.id),
    );
  };

  const getAvailableRolesForRow = (key: string, currentRoleId: number) => {
    const activeTakenIds = new Set(
      activeDisplayRoles
        .filter((ur: any) => !pendingRemoveSet.has(ur.id))
        .map((ur: any) => ur.role.id as number),
    );
    const pendingTakenIds = new Set(
      pendingAdds.filter((pa) => pa.key !== key).map((pa) => pa.roleId),
    );
    return manageableRoles.filter(
      (r) =>
        r.id === currentRoleId ||
        (!activeTakenIds.has(r.id) && !pendingTakenIds.has(r.id)),
    );
  };

  const handleRoleSelect = (val: string) => {
    setSelectedRoleId(val);
    setAddError("");
    const role = manageableRoles.find((r) => r.id === Number(val));
    if (role?.scope === "chapter") {
      const homeChapterId = user.user_chapters[0]?.chapter?.id;
      setSelectedChapterId(homeChapterId ? String(homeChapterId) : "");
    } else {
      setSelectedChapterId("");
    }
  };

  const handleAdd = () => {
    const role = manageableRoles.find((r) => r.id === Number(selectedRoleId));
    if (!role) {
      setAddError("Please select a role.");
      return;
    }
    if (role.scope === "chapter" && !selectedChapterId) {
      setAddError("This role requires a chapter selection.");
      return;
    }
    setAddError("");
    setPendingAdds((prev) => [
      ...prev,
      {
        key: `${Date.now()}-${Math.random()}`,
        roleId: role.id,
        chapterId: selectedChapterId ? Number(selectedChapterId) : undefined,
      },
    ]);
    setSelectedRoleId("");
    setSelectedChapterId("");
  };

  const handleSubmit = () => {
    // If no additions/removals staged, but something is selected, warn the user
    if (
      selectedRoleId &&
      pendingAdds.length === 0 &&
      pendingRemoveIds.length === 0
    ) {
      setAddError(
        "You have a role selected. Please click the '+' button to add it to the list before saving.",
      );
      return;
    }

    const missingChapter = pendingAdds.find((pa) => {
      const role = manageableRoles.find((r) => r.id === pa.roleId);
      return role?.scope === "chapter" && !pa.chapterId;
    });
    if (missingChapter) {
      setAddError("Some pending roles still need a chapter.");
      return;
    }

    const adds: UserRoleInput[] = pendingAdds.map((pa) => ({
      roleId: pa.roleId,
      chapterId: pa.chapterId,
    }));

    startTransition(async () => {
      const result = await updateUserRoles(user.id, pendingRemoveIds, adds);
      if (result.success) {
        toast.success(result.title ?? "Roles Updated", {
          description: result.description,
        });
        onClose();
      } else {
        toast.error(result.title ?? "Error", {
          description: result.description,
        });
      }
    });
  };

  const needsChapter =
    selectedRoleId !== "" &&
    manageableRoles.find((r) => r.id === Number(selectedRoleId))?.scope ===
      "chapter";

  const getRoleGroups = (availableRoles: Role[]): FormSelectGroup[] => [
    {
      label: "Global",
      options: availableRoles
        .filter((r) => r.scope === "global")
        .map((r) => ({ value: r.id.toString(), label: r.name })),
    },
    {
      label: "Chapter",
      options: availableRoles
        .filter((r) => r.scope === "chapter")
        .map((r) => ({ value: r.id.toString(), label: r.name })),
    },
  ];

  const homeChapter = user.user_chapters[0]?.chapter;
  const showChapterNote =
    needsChapter &&
    !!selectedChapterId &&
    !!homeChapter &&
    Number(selectedChapterId) !== homeChapter.id;

  return (
    <AdminSheet
      title="Manage Roles"
      description={`Assign or remove roles for ${user.name}`}
      open={!!user}
      onClose={onClose}
      onSubmit={handleSubmit}
      isSubmitting={isPending}
    >
      <div className="space-y-5">
        {/* Current roles */}
        <DetailSection>
          <DetailField label="Current Roles" fullWidth>
            {activeDisplayRoles.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {activeDisplayRoles.map((ur: any) => {
                  const marked = pendingRemoveSet.has(ur.id);
                  return (
                    <RemovableBadge
                      key={ur.id}
                      name={ur.role.name}
                      sub={ur.chapter?.name}
                      onToggle={() =>
                        setPendingRemoveIds((prev) =>
                          marked
                            ? prev.filter((id) => id !== ur.id)
                            : [...prev, ur.id],
                        )
                      }
                      disabled={isPending}
                      markedForRemoval={marked}
                    />
                  );
                })}
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">
                No roles assigned
              </span>
            )}
          </DetailField>
        </DetailSection>

        {/* Add Role form */}
        <div className="space-y-2">
          <div className="flex gap-2 items-end">
            <FormSelect
              label="Add Role"
              id="manage-role-select"
              value={selectedRoleId}
              onValueChange={handleRoleSelect}
              groups={getRoleGroups(getAvailableRolesToAdd())}
              placeholder="Select a role..."
              wrapperClassName="flex-1"
              disabled={isPending}
              labelClassName="font-bold"
            />
            {needsChapter && (
              <FormSelect
                label="Chapter"
                id="manage-role-chapter"
                value={selectedChapterId}
                onValueChange={(v) => setSelectedChapterId(v)}
                options={chapterOptions}
                placeholder="Select chapter..."
                wrapperClassName="flex-1"
                disabled={isPending}
                labelClassName="font-bold"
              />
            )}
            <Button type="button" onClick={handleAdd} disabled={isPending}>
              <MdLibraryAdd className="size-4" />
            </Button>
          </div>
          {showChapterNote && (
            <p className="text-xs text-amber-600">
              Note: This chapter differs from {user.name}
              &apos;s home chapter ({homeChapter?.name}).
            </p>
          )}
          {addError && <p className="text-xs text-destructive">{addError}</p>}
        </div>

        {/* Staged pending adds */}
        {pendingAdds.length > 0 && (
          <div className="space-y-5 pt-3">
            {pendingAdds.map((pa) => {
              const paRole = manageableRoles.find((r) => r.id === pa.roleId);
              return (
                <div key={pa.key} className="space-y-1">
                  <div className="flex gap-2 items-end">
                    <FormSelect
                      label="Role"
                      id={`pending-role-${pa.key}`}
                      value={pa.roleId.toString()}
                      onValueChange={(v) =>
                        updatePendingAdd(pa.key, {
                          roleId: Number(v),
                          chapterId: undefined,
                        })
                      }
                      groups={getRoleGroups(
                        getAvailableRolesForRow(pa.key, pa.roleId),
                      )}
                      wrapperClassName="flex-1"
                      disabled={isPending}
                      labelClassName="font-bold"
                    />
                    {paRole?.scope === "chapter" && (
                      <FormSelect
                        label="Chapter"
                        id={`pending-chapter-${pa.key}`}
                        value={pa.chapterId?.toString() ?? ""}
                        onValueChange={(v) =>
                          updatePendingAdd(pa.key, {
                            chapterId: Number(v) || undefined,
                          })
                        }
                        options={chapterOptions}
                        placeholder="Select chapter..."
                        wrapperClassName="flex-1"
                        disabled={isPending}
                        labelClassName="font-bold"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        setPendingAdds((prev) =>
                          prev.filter((p) => p.key !== pa.key),
                        )
                      }
                      disabled={isPending}
                      className="text-destructive cursor-pointer disabled:opacity-50 pb-2"
                      aria-label="Remove pending role"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminSheet>
  );
}
