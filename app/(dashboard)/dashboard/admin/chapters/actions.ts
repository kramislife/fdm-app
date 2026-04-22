"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/config";
import { PERMISSION_ROLES, ROLE_KEYS } from "@/lib/constants/app-roles";
import {
  logActivity,
  diffFields,
  buildUpdateMessage,
  formatName,
} from "@/lib/services/activity-log";
import {
  ACTIVITY_ACTIONS,
  ACTIVITY_ENTITIES,
  CHAPTER_FIELD_LABELS,
} from "@/lib/constants/activity-log";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "@/lib/services/cloudinary";

const REVALIDATE_PATH = "/dashboard/admin/chapters";
const CHAPTER_IMAGE_FOLDER = "fdm/chapters";

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
  fellowship_time?: string;
  is_active: boolean;
  image?: string | null;
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
  if (!data.fellowship_day)
    errors.fellowship_day = "Fellowship day is required.";
  if (!data.fellowship_time?.trim())
    errors.fellowship_time = "Fellowship time is required.";

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
        fellowship_time: data.fellowship_time?.trim() || null,
        is_active: data.is_active,
        created_by: currentUser.user.id,
      },
    });

    if (data.image && data.image.startsWith("data:")) {
      const uploadedUrl = await uploadToCloudinary(data.image, {
        folder: CHAPTER_IMAGE_FOLDER,
        publicId: String(newChapter.id),
      });
      if (uploadedUrl) {
        await prisma.chapter.update({
          where: { id: newChapter.id },
          data: { image_url: uploadedUrl },
        });
      }
    }

    const actorNameCreate = formatName(currentUser.user);
    await logActivity({
      actorId: currentUser.user.id,
      actorName: actorNameCreate,
      action: ACTIVITY_ACTIONS.CREATED,
      entityType: ACTIVITY_ENTITIES.CHAPTER,
      entityId: newChapter.id,
      entityLabel: newChapter.name,
      message: `${actorNameCreate} created ${newChapter.name} chapter`,
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
    const current = await prisma.chapter.findUnique({
      where: { id },
      select: {
        name: true,
        fellowship_day: true,
        fellowship_time: true,
        region: true,
        province: true,
        city: true,
        barangay: true,
        street: true,
        landmark: true,
        google_maps_url: true,
        image_url: true,
        is_active: true,
      },
    });

    if (!current) {
      return {
        success: false,
        title: "Not Found",
        description: "Chapter not found.",
      };
    }

    const duplicate = await prisma.chapter.findFirst({
      where: {
        name: { equals: data.name.trim(), mode: "insensitive" },
        id: { not: id },
        deleted_at: null,
      },
    });

    if (duplicate) {
      return {
        success: false,
        title: "Already Exists",
        description: "A chapter with this name already exists.",
        errors: { name: "This name is already in use." },
      };
    }

    let nextImageUrl: string | null = current.image_url;

    if (data.image === null || data.image === "") {
      if (current.image_url) {
        await deleteFromCloudinary(`${CHAPTER_IMAGE_FOLDER}/${id}`);
      }
      nextImageUrl = null;
    } else if (data.image && data.image.startsWith("data:")) {
      const uploadedUrl = await uploadToCloudinary(data.image, {
        folder: CHAPTER_IMAGE_FOLDER,
        publicId: String(id),
      });
      if (uploadedUrl) {
        nextImageUrl = uploadedUrl;
      }
    }

    const next = {
      name: data.name.trim(),
      fellowship_day: data.fellowship_day || null,
      fellowship_time: data.fellowship_time?.trim() || null,
      region: data.region,
      province: data.province,
      city: data.city,
      barangay: data.barangay,
      street: data.street?.trim() || null,
      landmark: data.landmark?.trim() || null,
      google_maps_url: data.google_maps_url?.trim() || null,
      image_url: nextImageUrl,
      is_active: data.is_active,
    };

    await prisma.chapter.update({
      where: { id },
      data: {
        ...next,
        region_code: data.region_code,
        province_code: data.province_code,
        city_code: data.city_code,
        barangay_code: data.barangay_code,
        updated_by: currentUser.user.id,
      },
    });

    const imageChanged = (current.image_url ?? null) !== (nextImageUrl ?? null);

    const changes = diffFields(
      {
        ...current,
        is_active: current.is_active ? "Active" : "Inactive",
        image_url: current.image_url ? "attached" : "none",
      },
      {
        ...next,
        is_active: data.is_active ? "Active" : "Inactive",
        image_url: imageChanged
          ? nextImageUrl
            ? "attached"
            : "none"
          : current.image_url
            ? "attached"
            : "none",
      },
      CHAPTER_FIELD_LABELS,
    );
    if (changes.length > 0) {
      const actorName = formatName(currentUser.user);
      await logActivity({
        actorId: currentUser.user.id,
        actorName,
        action: ACTIVITY_ACTIONS.UPDATED,
        entityType: ACTIVITY_ENTITIES.CHAPTER,
        entityId: id,
        entityLabel: next.name,
        chapterId: id,
        message: buildUpdateMessage(actorName, `${next.name} Chapter`, changes),
        metadata: { changes },
      });
    }

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
    const chapter = await prisma.chapter.findUnique({
      where: { id },
      select: { name: true, image_url: true },
    });

    if (!chapter) {
      return {
        success: false,
        title: "Not Found",
        description: "Chapter not found.",
      };
    }

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
        image_url: null,
      },
    });

    if (chapter.image_url) {
      await deleteFromCloudinary(`${CHAPTER_IMAGE_FOLDER}/${id}`);
    }

    const actorName = formatName(currentUser.user);
    await logActivity({
      actorId: currentUser.user.id,
      actorName,
      action: ACTIVITY_ACTIONS.DELETED,
      entityType: ACTIVITY_ENTITIES.CHAPTER,
      entityId: id,
      entityLabel: chapter.name,
      message: `${actorName} deleted ${chapter.name} chapter`,
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
