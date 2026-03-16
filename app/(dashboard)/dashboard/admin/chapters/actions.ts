"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

const REVALIDATE_PATH = "/dashboard/admin/chapters";

type ChapterData = {
  name: string;
  region: string;
  province: string;
  city: string;
  barangay: string;
  street?: string;
  google_maps_url?: string;
  landmark?: string;
  fellowship_day: string;
  is_active: boolean;
};

export async function createChapter(data: ChapterData) {
  const currentUser = await requireRole(["spiritual_director", "elder"]);

  if (!data.name.trim()) return { success: false, error: "Name is required." };
  if (!data.region) return { success: false, error: "Region is required." };
  if (!data.province) return { success: false, error: "Province is required." };
  if (!data.city) return { success: false, error: "City is required." };
  if (!data.barangay) return { success: false, error: "Barangay is required." };
  if (!data.fellowship_day)
    return { success: false, error: "Schedule is required." };

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
        error: "A chapter with this name already exists.",
      };
    }

    await prisma.chapter.create({
      data: {
        name: data.name.trim(),
        region: data.region,
        province: data.province,
        city: data.city,
        barangay: data.barangay,
        street: data.street?.trim() || null,
        google_maps_url: data.google_maps_url?.trim() || null,
        landmark: data.landmark?.trim() || null,
        fellowship_day: data.fellowship_day || null,
        is_active: data.is_active,
        created_by: currentUser.user.id,
      },
    });

    revalidatePath(REVALIDATE_PATH);
    return { success: true };
  } catch {
    return {
      success: false,
      error: "Failed to create chapter. Please try again.",
    };
  }
}

export async function updateChapter(id: number, data: ChapterData) {
  const currentUser = await requireRole(["spiritual_director", "elder"]);

  if (!data.name.trim()) return { success: false, error: "Name is required." };
  if (!data.region) return { success: false, error: "Region is required." };
  if (!data.province) return { success: false, error: "Province is required." };
  if (!data.city) return { success: false, error: "City is required." };
  if (!data.barangay) return { success: false, error: "Barangay is required." };
  if (!data.fellowship_day)
    return { success: false, error: "Schedule is required." };

  try {
    await prisma.chapter.update({
      where: { id },
      data: {
        name: data.name.trim(),
        region: data.region,
        province: data.province,
        city: data.city,
        barangay: data.barangay,
        street: data.street?.trim() || null,
        google_maps_url: data.google_maps_url?.trim() || null,
        landmark: data.landmark?.trim() || null,
        fellowship_day: data.fellowship_day || null,
        is_active: data.is_active,
        updated_by: currentUser.user.id,
      },
    });

    revalidatePath(REVALIDATE_PATH);
    return { success: true };
  } catch {
    return {
      success: false,
      error: "Failed to update chapter. Please try again.",
    };
  }
}

export async function deleteChapter(id: number) {
  const currentUser = await requireRole(["spiritual_director", "elder"]);

  try {
    const clusterCount = await prisma.cluster.count({
      where: { chapter_id: id, deleted_at: null },
    });

    if (clusterCount > 0) {
      return {
        success: false,
        error: `Cannot delete chapter. It has ${clusterCount} active cluster(s).`,
      };
    }

    const memberCount = await prisma.userChapter.count({
      where: { chapter_id: id },
    });
    if (memberCount > 0) {
      return {
        success: false,
        error: `Cannot delete chapter. It has ${memberCount} member(s) assigned.`,
      };
    }

    await prisma.chapter.update({
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
      error: "Failed to delete chapter. Please try again.",
    };
  }
}
