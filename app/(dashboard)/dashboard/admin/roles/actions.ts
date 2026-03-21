"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { PERMISSION_ROLES } from "@/lib/app-roles";
import { toKey } from "@/lib/utils/slugify";

type RoleForm = {
  name: string;
  scope: string;
  description: string;
  is_active: boolean;
};

type ActionResult = {
  success: boolean;
  title?: string;
  error?: string;
  description?: string;
  errors?: Record<string, string>;
};

// ------------------------------- Helpers -----------------------------------------

function validateRole(data: RoleForm): ActionResult | null {
  const name = data.name.trim();
  const scope = data.scope.trim();

  if (!name || !scope) {
    return {
      success: false,
      title: "Form Incomplete",
      description: "Please check the highlighted fields and try again.",
      errors: {
        name: !name ? "Name is required." : "",
        scope: !scope ? "Scope is required." : "",
      },
    };
  }
  return null;
}

const handleActionError = (message: string): ActionResult => ({
  success: false,
  title: "Error",
  description: message,
});

// ------------------------------- Actions -----------------------------------------

export async function createRole(data: RoleForm): Promise<ActionResult> {
  const currentUser = await requireRole([...PERMISSION_ROLES.SUPER_ADMIN]);
  const validationError = validateRole(data);
  if (validationError) return validationError;

  try {
    const key = toKey(data.name);
    const existing = await prisma.role.findFirst({
      where: { key, deleted_at: null },
    });

    if (existing) {
      return {
        success: false,
        title: "Already Exists",
        description: "A role with that name already exists.",
        errors: { name: "A role with that name already exists." },
      };
    }

    await prisma.role.create({
      data: {
        key,
        name: data.name.trim(),
        scope: data.scope.trim(),
        description: data.description?.trim() || null,
        is_active: data.is_active,
        created_by: currentUser.user.id,
      },
    });

    revalidatePath("/dashboard/admin/roles");
    return {
      success: true,
      title: "Role Created",
      description: `"${data.name}" has been created successfully.`,
    };
  } catch {
    return handleActionError("Failed to create role. Please try again.");
  }
}

export async function updateRole(
  id: number,
  data: RoleForm,
): Promise<ActionResult> {
  const currentUser = await requireRole([...PERMISSION_ROLES.SUPER_ADMIN]);
  const validationError = validateRole(data);
  if (validationError) return validationError;

  try {
    await prisma.role.update({
      where: { id },
      data: {
        name: data.name.trim(),
        scope: data.scope.trim(),
        description: data.description?.trim() || null,
        is_active: data.is_active,
        updated_by: currentUser.user.id,
      },
    });

    revalidatePath("/dashboard/admin/roles");
    return {
      success: true,
      title: "Role Updated",
      description: `"${data.name}" has been updated successfully.`,
    };
  } catch {
    return handleActionError("Failed to update role. Please try again.");
  }
}

export async function deleteRole(id: number): Promise<ActionResult> {
  const currentUser = await requireRole([...PERMISSION_ROLES.SUPER_ADMIN]);

  try {
    const assignmentCount = await prisma.userRole.count({
      where: { role_id: id, is_active: true },
    });

    if (assignmentCount > 0) {
      return {
        success: false,
        title: "Deletion Prevented",
        description: `This role is currently assigned to ${assignmentCount} active user(s). Remove all assignments before deleting.`,
      };
    }

    await prisma.role.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        deleted_by: currentUser.user.id,
      },
    });

    revalidatePath("/dashboard/admin/roles");
    return {
      success: true,
      title: "Role Deleted",
      description: "Role has been removed successfully.",
    };
  } catch {
    return handleActionError("Failed to delete role. Please try again.");
  }
}
