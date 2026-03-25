"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/config";
import { PERMISSION_ROLES, ROLE_KEYS } from "@/lib/constants/app-roles";
import { toKey } from "@/lib/utils/slugify";

const REVALIDATE_PATH = "/dashboard/admin/ministry-types";

type MinistryTypeForm = {
  name: string;
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

function validateMinistryType(data: MinistryTypeForm): ActionResult | null {
  const name = data.name.trim();

  if (!name) {
    return {
      success: false,
      title: "Form Incomplete",
      description: "Please check the highlighted fields and try again.",
      errors: {
        name: "Name is required.",
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

export async function createMinistryType(
  data: MinistryTypeForm,
): Promise<ActionResult> {
  const currentUser = await requireRole([...PERMISSION_ROLES.SUPER_ADMIN]);
  const validationError = validateMinistryType(data);
  if (validationError) return validationError;

  try {
    const key = toKey(data.name);
    const existing = await prisma.ministryType.findFirst({
      where: { key, deleted_at: null },
    });

    if (existing) {
      return {
        success: false,
        title: "Already Exists",
        description: "A ministry type with this name already exists.",
        errors: { name: "This name is already in use." },
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
        await prisma.chapterMinistry.createMany({
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
    return {
      success: true,
      title: "Ministry Type Created",
      description: `"${data.name}" has been created successfully.`,
    };
  } catch {
    return handleActionError(
      "Failed to create ministry type. Please try again.",
    );
  }
}

export async function updateMinistryType(
  id: number,
  data: MinistryTypeForm,
): Promise<ActionResult> {
  const currentUser = await requireRole([...PERMISSION_ROLES.SUPER_ADMIN]);
  const validationError = validateMinistryType(data);
  if (validationError) return validationError;

  try {
    const key = toKey(data.name);
    const existing = await prisma.ministryType.findFirst({
      where: { key, id: { not: id }, deleted_at: null },
    });

    if (existing) {
      return {
        success: false,
        title: "Already Exists",
        description: "A ministry type with this name already exists.",
        errors: { name: "This name is already in use." },
      };
    }

    await prisma.ministryType.update({
      where: { id },
      data: {
        name: data.name.trim(),
        key,
        description: data.description?.trim() || null,
        is_active: data.is_active,
        updated_by: currentUser.user.id,
      },
    });

    revalidatePath(REVALIDATE_PATH);
    return {
      success: true,
      title: "Ministry Type Updated",
      description: `"${data.name}" has been updated successfully.`,
    };
  } catch {
    return handleActionError(
      "Failed to update ministry type. Please try again.",
    );
  }
}

export async function deleteMinistryType(id: number): Promise<ActionResult> {
  const currentUser = await requireRole([...PERMISSION_ROLES.SUPER_ADMIN]);

  try {
    const activeInUse = await prisma.chapterMinistry.findFirst({
      where: {
        ministry_type_id: id,
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
        title: "Deletion Prevented",
        description:
          "This ministry type has active members or heads assigned. Remove them first.",
      };
    }

    // Clean up empty chapter ministry rows and their stale roles before deleting
    const emptyMinistryIds = await prisma.chapterMinistry
      .findMany({ where: { ministry_type_id: id }, select: { id: true } })
      .then((rows) => rows.map((r) => r.id));

    if (emptyMinistryIds.length > 0) {
      await prisma.userRole.deleteMany({
        where: { chapter_ministry_id: { in: emptyMinistryIds } },
      });
      await prisma.chapterMinistry.deleteMany({ where: { ministry_type_id: id } });
    }

    await prisma.ministryType.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        deleted_by: currentUser.user.id,
      },
    });

    revalidatePath(REVALIDATE_PATH);
    return {
      success: true,
      title: "Ministry Type Deleted",
      description: "Ministry type has been removed successfully.",
    };
  } catch (error) {
    console.error("Failed to delete ministry type:", error);
    return handleActionError(
      "Failed to delete ministry type. Please try again.",
    );
  }
}
