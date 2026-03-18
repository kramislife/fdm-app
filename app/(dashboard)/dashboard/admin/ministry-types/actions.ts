"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { PERMISSION_ROLES, ROLE_KEYS } from "@/lib/app-roles";
import { toKey } from "@/lib/utils/slugify";

const REVALIDATE_PATH = "/dashboard/admin/ministry-types";

type MinistryTypeData = {
  name: string;
  description?: string;
  is_active: boolean;
};

export async function createMinistryType(data: MinistryTypeData) {
  const currentUser = await requireRole([...PERMISSION_ROLES.SUPER_ADMIN]);

  if (!data.name.trim()) {
    return { success: false, error: "Name is required." };
  }

  try {
    const key = toKey(data.name);
    const existing = await prisma.ministryType.findFirst({
      where: { key, deleted_at: null },
    });

    if (existing) {
      return {
        success: false,
        error: "A ministry type with this name already exists.",
      };
    }

    const newType = await prisma.ministryType.create({
      data: {
        key,
        name: data.name.trim(),
        description: data.description?.trim() || null,
        is_active: data.is_active,
        created_by: currentUser.user.id,
      },
    });

    // Auto-create ministry for existing chapters
    try {
      const chapters = await prisma.chapter.findMany({
        where: { is_active: true, deleted_at: null },
        select: { id: true },
      });

      if (chapters.length > 0) {
        await prisma.ministryHead.createMany({
          data: chapters.map((c) => ({
            chapter_id: c.id,
            ministry_type_id: newType.id,
          })),
          skipDuplicates: true,
        });
      }
    } catch (error) {
      console.error(
        "Failed to auto-create ministries for new ministry type:",
        error,
      );
    }

    revalidatePath(REVALIDATE_PATH);
    return { success: true };
  } catch (e: unknown) {
    return {
      success: false,
      error: "Failed to create ministry type. Please try again.",
    };
  }
}

export async function updateMinistryType(id: number, data: MinistryTypeData) {
  const currentUser = await requireRole([...PERMISSION_ROLES.SUPER_ADMIN]);

  if (!data.name.trim()) {
    return { success: false, error: "Name is required." };
  }

  try {
    await prisma.ministryType.update({
      where: { id },
      data: {
        name: data.name.trim(),
        description: data.description?.trim() || null,
        is_active: data.is_active,
        updated_by: currentUser.user.id,
      },
    });

    revalidatePath(REVALIDATE_PATH);
    return { success: true };
  } catch {
    return {
      success: false,
      error: "Failed to update ministry type. Please try again.",
    };
  }
}

export async function deleteMinistryType(id: number) {
  const currentUser = await requireRole([...PERMISSION_ROLES.SUPER_ADMIN]);

  try {
    // 1. Check if any ministry of this type is in use
    const activeInUse = await prisma.ministryHead.findFirst({
      where: {
        ministry_type_id: id,
        deleted_at: null,
        OR: [
          { ministry_members: { some: {} } },
          {
            user_roles: {
              some: {
                role: { key: ROLE_KEYS.MINISTRY_HEAD },
                is_active: true,
              },
            },
          },
        ],
      },
    });

    if (activeInUse) {
      return {
        success: false,
        error:
          "Cannot delete. This ministry type has active members or heads assigned across chapters. Remove them first.",
      };
    }

    // 2. Soft delete all ministry head rows for this type
    await prisma.ministryHead.updateMany({
      where: { ministry_type_id: id, deleted_at: null },
      data: {
        deleted_at: new Date(),
        deleted_by: currentUser.user.id,
      },
    });

    // 3. Soft delete the ministry type
    await prisma.ministryType.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        deleted_by: currentUser.user.id,
      },
    });

    revalidatePath(REVALIDATE_PATH);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete ministry type:", error);
    return {
      success: false,
      error: "Failed to delete ministry type. Please try again.",
    };
  }
}
