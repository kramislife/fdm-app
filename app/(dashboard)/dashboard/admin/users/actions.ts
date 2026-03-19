"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { PERMISSION_ROLES, ROLE_KEYS } from "@/lib/app-roles";
import { USER_STATUS } from "@/lib/status";

const REVALIDATE_PATH = "/dashboard/admin/users";

export type UserFormData = {
  first_name: string;
  last_name: string;
  contact_number: string;
  email: string;
  birthday: string;
  status: string;
  address: string;
};

export async function createUser(
  data: UserFormData,
): Promise<{ success: boolean; error?: string }> {
  const currentUser = await requireRole([...PERMISSION_ROLES.SUPER_ADMIN]);

  if (!data.first_name.trim())
    return { success: false, error: "First name is required." };
  if (!data.last_name.trim())
    return { success: false, error: "Last name is required." };

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
    await prisma.user.create({
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

    revalidatePath(REVALIDATE_PATH);
    return { success: true };
  } catch {
    return {
      success: false,
      error: "Failed to create user. Please try again.",
    };
  }
}

export async function updateUser(
  id: number,
  data: UserFormData,
): Promise<{ success: boolean; error?: string }> {
  await requireRole([...PERMISSION_ROLES.SUPER_ADMIN]);

  if (!data.first_name.trim())
    return { success: false, error: "First name is required." };
  if (!data.last_name.trim())
    return { success: false, error: "Last name is required." };

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
    await prisma.user.update({
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

    revalidatePath(REVALIDATE_PATH);
    return { success: true };
  } catch {
    return {
      success: false,
      error: "Failed to update user. Please try again.",
    };
  }
}

export async function deactivateUser(
  id: number,
): Promise<{ success: boolean; error?: string }> {
  const currentUser = await requireRole([...PERMISSION_ROLES.SUPER_ADMIN]);

  if (id === currentUser.user.id)
    return { success: false, error: "You cannot deactivate your own account." };

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      user_roles: {
        where: { is_active: true },
        include: { role: { select: { key: true } } },
      },
    },
  });

  if (!user) return { success: false, error: "User not found." };
  if (user.deleted_at)
    return { success: false, error: "User is already deleted." };
  if (user.status === USER_STATUS.INACTIVE)
    return { success: false, error: "User is already deactivated." };

  const hasSD = user.user_roles.some(
    (ur) => ur.role.key === ROLE_KEYS.SPIRITUAL_DIRECTOR,
  );
  if (hasSD)
    return {
      success: false,
      error: "Spiritual Director account cannot be deactivated.",
    };

  try {
    await prisma.$transaction([
      prisma.user.update({
        where: { id },
        data: { status: USER_STATUS.INACTIVE },
      }),
      prisma.userRole.updateMany({
        where: { user_id: id, is_active: true },
        data: { is_active: false },
      }),
    ]);

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

  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) return { success: false, error: "User not found." };
  if (user.deleted_at)
    return {
      success: false,
      error: "Deleted users cannot be restored. Create a new account.",
    };
  if (user.status !== USER_STATUS.INACTIVE)
    return { success: false, error: "User account is already active." };

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

  if (id === currentUser.user.id)
    return { success: false, error: "You cannot delete your own account." };

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      user_roles: {
        where: { is_active: true },
        include: { role: { select: { key: true } } },
      },
    },
  });

  if (!user) return { success: false, error: "User not found." };

  const hasSD = user.user_roles.some(
    (ur) => ur.role.key === ROLE_KEYS.SPIRITUAL_DIRECTOR,
  );
  if (hasSD)
    return {
      success: false,
      error: "Spiritual Director account cannot be deleted.",
    };

  try {
    await prisma.$transaction([
      prisma.user.update({
        where: { id },
        data: {
          deleted_at: new Date(),
          deleted_by: currentUser.user.id,
          status: USER_STATUS.INACTIVE,
        },
      }),
      prisma.userRole.updateMany({
        where: { user_id: id, is_active: true },
        data: { is_active: false },
      }),
    ]);

    revalidatePath(REVALIDATE_PATH);
    return { success: true };
  } catch {
    return {
      success: false,
      error: "Failed to delete user. Please try again.",
    };
  }
}

export async function addUserRole(
  userId: number,
  roleId: number,
  chapterId?: number,
): Promise<{ success: boolean; error?: string; userRoleId?: number }> {
  const currentUser = await requireRole([...PERMISSION_ROLES.SUPER_ADMIN]);

  const [role, user] = await Promise.all([
    prisma.role.findUnique({
      where: { id: roleId },
      select: { key: true, scope: true },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      include: {
        user_roles: {
          where: { is_active: true },
          include: { chapter: { select: { name: true } } },
        },
        user_chapters: { select: { id: true }, take: 1 },
      },
    }),
  ]);

  if (!role) return { success: false, error: "Role not found." };
  if (!user) return { success: false, error: "User not found." };
  if (user.deleted_at)
    return { success: false, error: "Cannot assign role to a deleted user." };
  if (role.key === ROLE_KEYS.MINISTRY_HEAD)
    return {
      success: false,
      error: "Ministry Head is assigned via Ministry Heads page.",
    };
  if (role.scope === "chapter" && !chapterId)
    return { success: false, error: "Chapter is required for this role." };

  const resolvedChapterId =
    role.scope === "chapter" ? (chapterId ?? null) : null;

  const duplicate = user.user_roles.find(
    (ur) =>
      ur.role_id === roleId &&
      (ur.chapter_id ?? null) === (resolvedChapterId ?? null),
  );
  if (duplicate) {
    const chapterName = duplicate.chapter?.name ?? "Global";
    return {
      success: false,
      error: `This role is already assigned for ${chapterName}.`,
    };
  }

  try {
    let createdId: number | undefined;

    await prisma.$transaction(async (tx) => {
      const created = await tx.userRole.create({
        data: {
          user_id: userId,
          role_id: roleId,
          chapter_id: resolvedChapterId ?? undefined,
          assigned_by: currentUser.user.id,
          is_active: true,
        },
      });
      createdId = created.id;

      // Auto-set home chapter if none exists yet
      if (resolvedChapterId && user.user_chapters.length === 0) {
        await tx.userChapter.create({
          data: {
            user_id: userId,
            chapter_id: resolvedChapterId,
            is_primary: true,
          },
        });
      }
    });

    revalidatePath(REVALIDATE_PATH);
    return { success: true, userRoleId: createdId };
  } catch {
    return { success: false, error: "Failed to add role. Please try again." };
  }
}

export async function removeUserRole(
  userId: number,
  userRoleId: number,
): Promise<{ success: boolean; error?: string; warning?: string }> {
  await requireRole([...PERMISSION_ROLES.SUPER_ADMIN]);

  const userRole = await prisma.userRole.findUnique({
    where: { id: userRoleId },
    include: { role: { select: { key: true } } },
  });

  if (!userRole || userRole.user_id !== userId)
    return { success: false, error: "Role not found." };

  if (userRole.role.key === ROLE_KEYS.MINISTRY_HEAD)
    return {
      success: false,
      error: "Remove Ministry Head via Ministry Heads page.",
    };

  const activeRoleCount = await prisma.userRole.count({
    where: { user_id: userId, is_active: true },
  });
  const warning =
    activeRoleCount === 1 ? "This is the user's only active role." : undefined;

  try {
    await prisma.userRole.update({
      where: { id: userRoleId },
      data: { is_active: false },
    });

    revalidatePath(REVALIDATE_PATH);
    return { success: true, warning };
  } catch {
    return {
      success: false,
      error: "Failed to remove role. Please try again.",
    };
  }
}
