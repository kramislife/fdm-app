"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/config";
import { PERMISSION_ROLES } from "@/lib/constants/app-roles";
import { toKey } from "@/lib/utils/slugify";

const REVALIDATE_PATH = "/dashboard/admin/event-types";

type EventTypeForm = {
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

function validateEventType(data: EventTypeForm): ActionResult | null {
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

export async function createEventType(
  data: EventTypeForm,
): Promise<ActionResult> {
  const currentUser = await requireRole([...PERMISSION_ROLES.SUPER_ADMIN]);
  const validationError = validateEventType(data);
  if (validationError) return validationError;

  try {
    const key = toKey(data.name);
    const existing = await prisma.eventType.findFirst({
      where: { key, deleted_at: null },
    });

    if (existing) {
      return {
        success: false,
        title: "Already Exists",
        description: "An event type with this name already exists.",
        errors: { name: "An event type with this name already exists." },
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
    return {
      success: true,
      title: "Event Type Created",
      description: `"${data.name}" has been created successfully.`,
    };
  } catch {
    return handleActionError("Failed to create event type. Please try again.");
  }
}

export async function updateEventType(
  id: number,
  data: EventTypeForm,
): Promise<ActionResult> {
  const currentUser = await requireRole([...PERMISSION_ROLES.SUPER_ADMIN]);
  const validationError = validateEventType(data);
  if (validationError) return validationError;

  try {
    const key = toKey(data.name);
    const existing = await prisma.eventType.findFirst({
      where: { key, id: { not: id }, deleted_at: null },
    });

    if (existing) {
      return {
        success: false,
        title: "Already Exists",
        description: "An event type with this name already exists.",
        errors: { name: "An event type with this name already exists." },
      };
    }

    await prisma.eventType.update({
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
      title: "Event Type Updated",
      description: `"${data.name}" has been updated successfully.`,
    };
  } catch {
    return handleActionError("Failed to update event type. Please try again.");
  }
}

export async function deleteEventType(id: number): Promise<ActionResult> {
  const currentUser = await requireRole([...PERMISSION_ROLES.SUPER_ADMIN]);

  try {
    const eventCount = await prisma.event.count({
      where: { event_type_id: id },
    });

    if (eventCount > 0) {
      return {
        success: false,
        title: "Deletion Prevented",
        description: `This event type is currently being used by ${eventCount} event(s).`,
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
    return {
      success: true,
      title: "Event Type Deleted",
      description: "Event type has been removed successfully.",
    };
  } catch {
    return handleActionError("Failed to delete event type. Please try again.");
  }
}
