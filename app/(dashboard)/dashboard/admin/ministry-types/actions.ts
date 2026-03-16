"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { toKey } from "@/lib/utils/slugify";

const REVALIDATE_PATH = "/dashboard/admin/ministry-types";

type MinistryTypeData = {
  name: string;
  description?: string;
  is_active: boolean;
};

export async function createMinistryType(data: MinistryTypeData) {
  const currentUser = await requireRole(["spiritual_director", "elder"]);

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

    await prisma.ministryType.create({
      data: {
        key,
        name: data.name.trim(),
        description: data.description?.trim() || null,
        is_active: data.is_active,
        created_by: currentUser.user.id,
      },
    });

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
  const currentUser = await requireRole(["spiritual_director", "elder"]);

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
  const currentUser = await requireRole(["spiritual_director", "elder"]);

  try {
    // Check if ministry type is used in any ministries
    const ministryCount = await prisma.ministry.count({
      where: { ministry_type_id: id },
    });

    if (ministryCount > 0) {
      return {
        success: false,
        error: `Cannot delete ministry type. It is currently being used by ${ministryCount} ministry(ies).`,
      };
    }

    await prisma.ministryType.update({
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
      error: "Failed to delete ministry type. Please try again.",
    };
  }
}
