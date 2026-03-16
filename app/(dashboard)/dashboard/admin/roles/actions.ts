"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { toKey } from "@/lib/utils/slugify";
type RoleForm = {
  name: string;
  scope: string;
  description: string;
  is_active: boolean;
};

export async function createRole(data: RoleForm) {
  const currentUser = await requireRole(["spiritual_director", "elder"]);

  if (!data.name.trim()) return { success: false, error: "Name is required." };
  if (!data.scope.trim())
    return { success: false, error: "Scope is required." };

  try {
    const key = toKey(data.name);

    const existing = await prisma.role.findFirst({
      where: {
        key,
        deleted_at: null,
      },
    });

    if (existing) {
      return { success: false, error: "A role with that name already exists." };
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
    return { success: true };
  } catch {
    return {
      success: false,
      error: "Failed to create role. Please try again.",
    };
  }
}

export async function updateRole(id: number, data: RoleForm) {
  const currentUser = await requireRole(["spiritual_director", "elder"]);

  if (!data.name.trim()) return { success: false, error: "Name is required." };
  if (!data.scope.trim())
    return { success: false, error: "Scope is required." };

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
    return { success: true };
  } catch {
    return {
      success: false,
      error: "Failed to update role. Please try again.",
    };
  }
}

export async function deleteRole(id: number) {
  const currentUser = await requireRole(["spiritual_director", "elder"]);

  try {
    // Check if role is assigned to any users
    const assignmentCount = await prisma.userRole.count({
      where: {
        role_id: id,
        is_active: true,
      },
    });

    if (assignmentCount > 0) {
      return {
        success: false,
        error: `Cannot delete role. It is currently assigned to ${assignmentCount} active user(s).`,
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
    return { success: true };
  } catch {
    return {
      success: false,
      error: "Failed to delete role. Please try again.",
    };
  }
}
