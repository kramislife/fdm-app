"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { PERMISSION_ROLES, ROLE_KEYS } from "@/lib/app-roles";

import { getChapterActiveUsers } from "@/lib/data/ministry-heads";

const REVALIDATE_PATH = "/dashboard/admin/ministry-heads";

export async function getActiveUsersForChapter(chapterId: number) {
  await requireRole([...PERMISSION_ROLES.MINISTRY_HEADS_MANAGE]);
  return await getChapterActiveUsers(chapterId);
}

export async function updateMinistryHead(id: number, data: { userId: string }) {
  const currentUser = await requireRole([
    ...PERMISSION_ROLES.MINISTRY_HEADS_MANAGE,
  ]);

  if (!data.userId) {
    return { success: false, error: "Ministry head is required." };
  }

  try {
    const ministryHeadId = id;
    const userId = Number(data.userId);

    const ministryHead = await prisma.ministryHead.findUnique({
      where: { id: ministryHeadId },
      select: { chapter_id: true },
    });

    if (!ministryHead) {
      return { success: false, error: "Ministry head record not found." };
    }

    const role = await prisma.role.findUnique({
      where: { key: ROLE_KEYS.MINISTRY_HEAD },
    });

    if (!role) {
      return { success: false, error: "Ministry Head role not found." };
    }

    // 1. Deactivate existing ministry_head role for this ministry head record
    await prisma.userRole.updateMany({
      where: {
        ministry_head_id: ministryHeadId,
        role: { key: ROLE_KEYS.MINISTRY_HEAD },
        is_active: true,
      },
      data: { is_active: false },
    });

    // 2. Create new user_role
    await prisma.userRole.create({
      data: {
        user_id: userId,
        role_id: role.id,
        chapter_id: ministryHead.chapter_id,
        ministry_head_id: ministryHeadId,
        assigned_by: currentUser.user.id,
        is_active: true,
      },
    });

    revalidatePath(REVALIDATE_PATH);
    return {
      success: true,
      description: "Ministry head has been successfully updated.",
    };
  } catch (error) {
    console.error("Failed to update ministry head:", error);
    return {
      success: false,
      error: "Action failed",
      description: "Failed to update ministry head. Please try again.",
    };
  }
}
