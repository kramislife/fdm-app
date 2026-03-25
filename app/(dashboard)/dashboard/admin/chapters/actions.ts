"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/config";
import { PERMISSION_ROLES, ROLE_KEYS } from "@/lib/constants/app-roles";

const REVALIDATE_PATH = "/dashboard/admin/chapters";

type ChapterData = {
  name: string;
  region: string;
  region_code: string;
  province: string;
  province_code: string;
  city: string;
  city_code: string;
  barangay: string;
  barangay_code: string;
  street?: string;
  google_maps_url?: string;
  landmark?: string;
  fellowship_day: string;
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

function validateChapter(data: ChapterData): ActionResult | null {
  const errors: Record<string, string> = {};

  if (!data.name.trim()) errors.name = "Chapter name is required.";
  if (!data.region) errors.region = "Region is required.";
  if (!data.province) errors.province = "Province is required.";
  if (!data.city) errors.city = "City is required.";
  if (!data.barangay) errors.barangay = "Barangay is required.";
  if (!data.fellowship_day) errors.fellowship_day = "Schedule is required.";

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      title: "Form Incomplete",
      description: "Please check the highlighted fields and try again.",
      errors,
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

export async function createChapter(data: ChapterData): Promise<ActionResult> {
  const currentUser = await requireRole([...PERMISSION_ROLES.SUPER_ADMIN]);
  const validationError = validateChapter(data);
  if (validationError) return validationError;

  try {
    const existing = await prisma.chapter.findFirst({
      where: {
        name: { equals: data.name.trim(), mode: "insensitive" },
        deleted_at: null,
      },
    });

    if (existing) {
      return {
        success: false,
        title: "Already Exists",
        description: "A chapter with this name already exists.",
        errors: { name: "This name is already in use." },
      };
    }

    const newChapter = await prisma.chapter.create({
      data: {
        name: data.name.trim(),
        region: data.region,
        region_code: data.region_code,
        province: data.province,
        province_code: data.province_code,
        city: data.city,
        city_code: data.city_code,
        barangay: data.barangay,
        barangay_code: data.barangay_code,
        street: data.street?.trim() || null,
        google_maps_url: data.google_maps_url?.trim() || null,
        landmark: data.landmark?.trim() || null,
        fellowship_day: data.fellowship_day || null,
        is_active: data.is_active,
        created_by: currentUser.user.id,
      },
    });

    // Auto-create ministries from existing types
    try {
      const types = await prisma.ministryType.findMany({
        where: { is_active: true, deleted_at: null },
        select: { id: true },
      });

      if (types.length > 0) {
        await prisma.chapterMinistry.createMany({
          data: types.map((t) => ({
            chapter_id: newChapter.id,
            ministry_type_id: t.id,
          })),
          skipDuplicates: true,
        });
      }
    } catch (error) {
      console.error("Failed to auto-create ministries for new chapter:", error);
    }

    revalidatePath(REVALIDATE_PATH);
    return {
      success: true,
      title: "Chapter Created",
      description: `"${data.name}" has been created successfully.`,
    };
  } catch {
    return handleActionError("Failed to create chapter. Please try again.");
  }
}

export async function updateChapter(
  id: number,
  data: ChapterData,
): Promise<ActionResult> {
  const currentUser = await requireRole([...PERMISSION_ROLES.SUPER_ADMIN]);
  const validationError = validateChapter(data);
  if (validationError) return validationError;

  try {
    const existing = await prisma.chapter.findFirst({
      where: {
        name: { equals: data.name.trim(), mode: "insensitive" },
        id: { not: id },
        deleted_at: null,
      },
    });

    if (existing) {
      return {
        success: false,
        title: "Already Exists",
        description: "A chapter with this name already exists.",
        errors: { name: "This name is already in use." },
      };
    }

    await prisma.chapter.update({
      where: { id },
      data: {
        name: data.name.trim(),
        region: data.region,
        region_code: data.region_code,
        province: data.province,
        province_code: data.province_code,
        city: data.city,
        city_code: data.city_code,
        barangay: data.barangay,
        barangay_code: data.barangay_code,
        street: data.street?.trim() || null,
        google_maps_url: data.google_maps_url?.trim() || null,
        landmark: data.landmark?.trim() || null,
        fellowship_day: data.fellowship_day || null,
        is_active: data.is_active,
        updated_by: currentUser.user.id,
      },
    });

    revalidatePath(REVALIDATE_PATH);
    return {
      success: true,
      title: "Chapter Updated",
      description: `"${data.name}" has been updated successfully.`,
    };
  } catch {
    return handleActionError("Failed to update chapter. Please try again.");
  }
}

export async function deleteChapter(id: number): Promise<ActionResult> {
  const currentUser = await requireRole([...PERMISSION_ROLES.SUPER_ADMIN]);

  try {
    const clusterCount = await prisma.cluster.count({
      where: { chapter_id: id, deleted_at: null },
    });

    if (clusterCount > 0) {
      return {
        success: false,
        title: "Deletion Prevented",
        description: `This chapter has ${clusterCount} active cluster(s) assigned. Remove them first.`,
      };
    }

    const memberCount = await prisma.userChapter.count({
      where: { chapter_id: id },
    });

    if (memberCount > 0) {
      return {
        success: false,
        title: "Deletion Prevented",
        description:
          "This chapter has active members assigned. Remove them first before deleting.",
      };
    }

    // Block if any chapter ministry has an active head or members
    const activeMinistry = await prisma.chapterMinistry.findFirst({
      where: {
        chapter_id: id,
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
      include: { ministry_type: { select: { name: true } } },
    });

    if (activeMinistry) {
      return {
        success: false,
        title: "Deletion Prevented",
        description: `"${activeMinistry.ministry_type.name}" still has an active head or members assigned. Remove all ministry assignments first.`,
      };
    }

    // Clean up empty chapter ministry rows and their stale roles before deleting
    const emptyMinistryIds = await prisma.chapterMinistry
      .findMany({ where: { chapter_id: id }, select: { id: true } })
      .then((rows) => rows.map((r) => r.id));

    if (emptyMinistryIds.length > 0) {
      await prisma.userRole.deleteMany({
        where: { chapter_ministry_id: { in: emptyMinistryIds } },
      });
      await prisma.chapterMinistry.deleteMany({ where: { chapter_id: id } });
    }

    await prisma.chapter.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        deleted_by: currentUser.user.id,
      },
    });

    revalidatePath(REVALIDATE_PATH);
    return {
      success: true,
      title: "Chapter Deleted",
      description: "Chapter has been removed successfully.",
    };
  } catch (error) {
    console.error("Failed to delete chapter:", error);
    return handleActionError("Failed to delete chapter. Please try again.");
  }
}
