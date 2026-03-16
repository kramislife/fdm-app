"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { toKey } from "@/lib/utils/slugify";
type RoleForm = { name: string; scope: string; description: string };

export async function createRole(data: RoleForm) {
  await requireRole(["spiritual_director", "elder"]);

  if (!data.name.trim()) return { success: false, error: "Name is required." };
  if (!data.scope.trim())
    return { success: false, error: "Scope is required." };

  try {
    const key = toKey(data.name);

    const existing = await prisma.role.findUnique({ where: { key } });
    if (existing) {
      return { success: false, error: "A role with that name already exists." };
    }

    await prisma.role.create({
      data: {
        key,
        name: data.name.trim(),
        scope: data.scope.trim(),
        description: data.description?.trim() || null,
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
  await requireRole(["spiritual_director", "elder"]);

  try {
    await prisma.role.delete({ where: { id } });
    revalidatePath("/dashboard/admin/roles");
    return { success: true };
  } catch {
    return {
      success: false,
      error: "Failed to delete role. It may still be assigned to users.",
    };
  }
}
