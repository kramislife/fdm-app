"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole, getUser } from "@/lib/auth";
import { toKey } from "@/lib/utils/slugify";

const REVALIDATE_PATH = "/dashboard/admin/ministry-types";

type MinistryTypeData = {
  name: string;
  description?: string;
  is_active: boolean;
};

export async function createMinistryType(data: MinistryTypeData) {
  await requireRole(["spiritual_director", "elder"]);

  if (!data.name.trim()) {
    return { success: false, error: "Name is required." };
  }

  const currentUser = await getUser();

  try {
    await prisma.ministryType.create({
      data: {
        key: toKey(data.name),
        name: data.name.trim(),
        description: data.description?.trim() || null,
        is_active: data.is_active,
        created_by: currentUser?.user.id ?? null,
      },
    });

    revalidatePath(REVALIDATE_PATH);
    return { success: true };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("Unique constraint") || msg.includes("unique")) {
      return { success: false, error: "A ministry type with this name already exists." };
    }
    return { success: false, error: "Failed to create ministry type. Please try again." };
  }
}

export async function updateMinistryType(id: number, data: MinistryTypeData) {
  await requireRole(["spiritual_director", "elder"]);

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
        // key is never updated after creation
      },
    });

    revalidatePath(REVALIDATE_PATH);
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update ministry type. Please try again." };
  }
}

export async function deleteMinistryType(id: number) {
  await requireRole(["spiritual_director", "elder"]);

  try {
    await prisma.ministryType.update({
      where: { id },
      data: { deleted_at: new Date() },
    });

    revalidatePath(REVALIDATE_PATH);
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete ministry type. Please try again." };
  }
}
