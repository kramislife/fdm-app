"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/config";
import { PERMISSION_ROLES, ROLE_KEYS } from "@/lib/constants/app-roles";
import { getChapterActiveUsers } from "@/lib/data/chapter-ministries";

const REVALIDATE_PATH = "/dashboard/admin/chapter-ministries";

export async function getActiveUsersForChapter(chapterId: number) {
  await requireRole([...PERMISSION_ROLES.MINISTRY_HEADS_MANAGE]);
  return await getChapterActiveUsers(chapterId);
}

export async function updateChapterMinistry(
  id: number,
  data: { userId: string },
) {
  const currentUser = await requireRole([
    ...PERMISSION_ROLES.MINISTRY_HEADS_MANAGE,
  ]);

  if (!data.userId) {
    return {
      success: false,
      error: "Ministry head is required.",
      errors: { userId: "Please select a ministry head." },
    };
  }

  try {
    const chapterMinistryId = id;
    const userId = Number(data.userId);

    const chapterMinistry = await prisma.chapterMinistry.findUnique({
      where: { id: chapterMinistryId },
      select: { chapter_id: true },
    });

    if (!chapterMinistry) {
      return { success: false, error: "Chapter ministry record not found." };
    }

    const role = await prisma.role.findUnique({
      where: { key: ROLE_KEYS.MINISTRY_HEAD },
    });

    if (!role) {
      return { success: false, error: "Ministry Head role not found." };
    }

    // 1. Deactivate any other active ministry head roles for this record (other users)
    await prisma.userRole.updateMany({
      where: {
        chapter_ministry_id: chapterMinistryId,
        role_id: role.id,
        is_active: true,
        NOT: { user_id: userId },
      },
      data: { is_active: false, deactivated_at: new Date() },
    });

    // 2. Upsert role for this user — handles new assignment and re-activation
    //    (avoids unique constraint violation when re-assigning the same person)
    const existingRole = await prisma.userRole.findFirst({
      where: {
        user_id: userId,
        role_id: role.id,
        chapter_id: chapterMinistry.chapter_id,
        chapter_ministry_id: chapterMinistryId,
        cluster_id: null,
      },
    });

    if (existingRole) {
      await prisma.userRole.update({
        where: { id: existingRole.id },
        data: {
          is_active: true,
          assigned_by: currentUser.user.id,
          assigned_at: new Date(),
          deactivated_at: null,
          access_revoked: false,
        },
      });
    } else {
      await prisma.userRole.create({
        data: {
          user_id: userId,
          role_id: role.id,
          chapter_id: chapterMinistry.chapter_id,
          chapter_ministry_id: chapterMinistryId,
          assigned_by: currentUser.user.id,
          is_active: true,
        },
      });
    }

    // 3. Update head_user_id and updated_by on the ChapterMinistry record
    await prisma.chapterMinistry.update({
      where: { id: chapterMinistryId },
      data: {
        head_user_id: userId,
        updated_by: currentUser.user.id,
      },
    });

    revalidatePath(REVALIDATE_PATH);
    return {
      success: true,
      description: "Ministry head has been successfully updated.",
    };
  } catch (error) {
    console.error("Failed to update chapter ministry:", error);
    return {
      success: false,
      error: "Action failed",
      description: "Failed to update ministry head. Please try again.",
    };
  }
}
