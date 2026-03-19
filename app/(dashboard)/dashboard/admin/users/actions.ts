"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { PERMISSION_ROLES } from "@/lib/app-roles";
import { USER_STATUS } from "@/lib/status";

const REVALIDATE_PATH = "/dashboard/admin/users";

export type UserFormData = {
  first_name: string;
  last_name: string;
  contact_number: string;
  email: string;
  birthday: string;
  chapter_id: string;
  status: string;
  address: string;
};

export async function createUser(
  data: UserFormData,
): Promise<{ success: boolean; error?: string }> {
  const currentUser = await requireRole([...PERMISSION_ROLES.SUPER_ADMIN]);

  const chapterId = parseInt(data.chapter_id, 10);

  if (!data.first_name.trim())
    return { success: false, error: "First name is required." };
  if (!data.last_name.trim())
    return { success: false, error: "Last name is required." };
  if (isNaN(chapterId))
    return { success: false, error: "Chapter is required." };

  if (data.email.trim()) {
    const existing = await prisma.user.findFirst({
      where: { email: data.email.trim(), deleted_at: null },
    });
    if (existing) return { success: false, error: "Email is already in use." };
  }

  if (data.contact_number.trim()) {
    const existing = await prisma.user.findFirst({
      where: { contact_number: data.contact_number.trim(), deleted_at: null },
    });
    if (existing)
      return { success: false, error: "Contact number is already in use." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          first_name: data.first_name.trim(),
          last_name: data.last_name.trim(),
          email: data.email.trim() || null,
          contact_number: data.contact_number.trim() || null,
          birthday: data.birthday ? new Date(data.birthday) : null,
          status: data.status,
          address: data.address.trim() || null,
          created_by_admin: currentUser.user.id,
        },
      });

      await tx.userChapter.create({
        data: {
          user_id: user.id,
          chapter_id: chapterId,
          is_primary: true,
        },
      });
    });

    revalidatePath(REVALIDATE_PATH);
    return { success: true };
  } catch {
    return { success: false, error: "Failed to create user. Please try again." };
  }
}

export async function updateUser(
  id: number,
  data: UserFormData,
): Promise<{ success: boolean; error?: string }> {
  await requireRole([...PERMISSION_ROLES.SUPER_ADMIN]);

  const chapterId = parseInt(data.chapter_id, 10);

  if (!data.first_name.trim())
    return { success: false, error: "First name is required." };
  if (!data.last_name.trim())
    return { success: false, error: "Last name is required." };
  if (isNaN(chapterId))
    return { success: false, error: "Chapter is required." };

  if (data.contact_number.trim()) {
    const existing = await prisma.user.findFirst({
      where: {
        contact_number: data.contact_number.trim(),
        deleted_at: null,
        id: { not: id },
      },
    });
    if (existing)
      return { success: false, error: "Contact number is already in use." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id },
        data: {
          first_name: data.first_name.trim(),
          last_name: data.last_name.trim(),
          contact_number: data.contact_number.trim() || null,
          birthday: data.birthday ? new Date(data.birthday) : null,
          status: data.status,
          address: data.address.trim() || null,
        },
      });

      // Set new chapter as primary, remove old primary
      await tx.userChapter.updateMany({
        where: { user_id: id, is_primary: true },
        data: { is_primary: false },
      });

      await tx.userChapter.upsert({
        where: {
          user_id_chapter_id: { user_id: id, chapter_id: chapterId },
        },
        update: { is_primary: true },
        create: {
          user_id: id,
          chapter_id: chapterId,
          is_primary: true,
        },
      });
    });

    revalidatePath(REVALIDATE_PATH);
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update user. Please try again." };
  }
}

export async function deactivateUser(
  id: number,
): Promise<{ success: boolean; error?: string }> {
  await requireRole([...PERMISSION_ROLES.SUPER_ADMIN]);

  try {
    await prisma.user.update({
      where: { id },
      data: { status: USER_STATUS.INACTIVE },
    });

    revalidatePath(REVALIDATE_PATH);
    return { success: true };
  } catch {
    return {
      success: false,
      error: "Failed to deactivate user. Please try again.",
    };
  }
}

export async function restoreUser(
  id: number,
): Promise<{ success: boolean; error?: string }> {
  await requireRole([...PERMISSION_ROLES.SUPER_ADMIN]);

  try {
    await prisma.user.update({
      where: { id },
      data: { status: USER_STATUS.ACTIVE },
    });

    revalidatePath(REVALIDATE_PATH);
    return { success: true };
  } catch {
    return {
      success: false,
      error: "Failed to restore user. Please try again.",
    };
  }
}

export async function deleteUser(
  id: number,
): Promise<{ success: boolean; error?: string }> {
  const currentUser = await requireRole([...PERMISSION_ROLES.SUPER_ADMIN]);

  try {
    await prisma.user.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        deleted_by: currentUser.user.id,
      },
    });

    revalidatePath(REVALIDATE_PATH);
    return { success: true };
  } catch {
    return {
      success: false,
      error: "Failed to delete user. Please try again.",
    };
  }
}

export async function addUserRoles(
  userId: number,
  roleIds: number[],
): Promise<{ success: boolean; error?: string }> {
  const currentUser = await requireRole([...PERMISSION_ROLES.SUPER_ADMIN]);

  if (!roleIds.length)
    return { success: false, error: "No roles selected." };

  try {
    await prisma.userRole.createMany({
      data: roleIds.map((roleId) => ({
        user_id: userId,
        role_id: roleId,
        assigned_by: currentUser.user.id,
      })),
      skipDuplicates: true,
    });

    revalidatePath(REVALIDATE_PATH);
    return { success: true };
  } catch {
    return {
      success: false,
      error: "Failed to update roles. Please try again.",
    };
  }
}

export async function removeUserRoles(
  userId: number,
  roleIds: number[],
): Promise<{ success: boolean; error?: string }> {
  await requireRole([...PERMISSION_ROLES.SUPER_ADMIN]);

  if (!roleIds.length)
    return { success: false, error: "No roles selected." };

  try {
    await prisma.userRole.deleteMany({
      where: { user_id: userId, role_id: { in: roleIds } },
    });

    revalidatePath(REVALIDATE_PATH);
    return { success: true };
  } catch {
    return {
      success: false,
      error: "Failed to remove roles. Please try again.",
    };
  }
}
