"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole, getUser } from "@/lib/auth";
import { toKey } from "@/lib/utils/slugify";

const REVALIDATE_PATH = "/dashboard/admin/event-types";

type EventTypeData = {
  name: string;
  description?: string;
  is_active: boolean;
};

export async function createEventType(data: EventTypeData) {
  const currentUser = await requireRole(["spiritual_director", "elder"]);

  if (!data.name.trim()) {
    return { success: false, error: "Name is required." };
  }

  try {
    const key = toKey(data.name);
    const existing = await prisma.eventType.findFirst({
      where: { key, deleted_at: null },
    });

    if (existing) {
      return {
        success: false,
        error: "An event type with this name already exists.",
      };
    }

    await prisma.eventType.create({
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
      error: "Failed to create event type. Please try again.",
    };
  }
}

export async function updateEventType(id: number, data: EventTypeData) {
  const currentUser = await requireRole(["spiritual_director", "elder"]);

  if (!data.name.trim()) {
    return { success: false, error: "Name is required." };
  }

  try {
    await prisma.eventType.update({
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
      error: "Failed to update event type. Please try again.",
    };
  }
}

export async function deleteEventType(id: number) {
  const currentUser = await requireRole(["spiritual_director", "elder"]);

  try {
    // Check if event type is being used by any events
    const eventCount = await prisma.event.count({
      where: { event_type_id: id },
    });

    if (eventCount > 0) {
      return {
        success: false,
        error: `Cannot delete event type. it is currently being used by ${eventCount} event(s).`,
      };
    }

    await prisma.eventType.update({
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
      error: "Failed to delete event type. Please try again.",
    };
  }
}
