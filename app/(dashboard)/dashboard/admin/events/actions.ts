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
  EVENT_FIELD_LABELS,
} from "@/lib/constants/activity-log";
import { formatDateTime } from "@/lib/utils/format";

const REVALIDATE_PATH = "/dashboard/admin/events";

// ------------------------------- Types -----------------------------------------

export type EventForm = {
  name: string;
  event_type_id: string;
  scope: "global" | "chapter";
  chapter_id: string;
  event_date: string;
  event_time: string;
  location: string;
  location_url: string;
  qr_enabled: boolean;
};

type ActionResult = {
  success: boolean;
  title?: string;
  error?: string;
  description?: string;
  errors?: Record<string, string>;
};

// ------------------------------- Helpers -----------------------------------------

function validateEvent(data: EventForm): ActionResult | null {
  const errors: Record<string, string> = {};

  if (!data.name.trim()) errors.name = "Event name is required.";
  if (data.event_date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const inputDate = new Date(`${data.event_date}T00:00:00+08:00`);
    inputDate.setHours(0, 0, 0, 0);

    if (inputDate < today) {
      errors.event_date = "Event date cannot be in the past.";
    } else if (inputDate.getTime() === today.getTime() && data.event_time) {
      const combinedTime = new Date(
        `${data.event_date}T${data.event_time}:00+08:00`,
      );
      if (combinedTime < new Date()) {
        errors.event_time =
          "Event time cannot be in the past for today's date.";
      }
    }
  }

  if (data.scope === "chapter" && !data.chapter_id)
    errors.chapter_id = "Chapter is required for chapter-scoped events.";

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

export async function createEvent(data: EventForm): Promise<ActionResult> {
  const currentUser = await requireRole([...PERMISSION_ROLES.EVENTS_MANAGE]);

  // Head Servant restrictions
  if (currentUser.roles.includes(ROLE_KEYS.HEAD_SERVANT)) {
    if (
      !currentUser.roles.includes(ROLE_KEYS.DIRECTOR_ADVISER) &&
      !currentUser.roles.includes(ROLE_KEYS.ELDER)
    ) {
      if (data.scope === "global") {
        return {
          success: false,
          title: "Permission Denied",
          description: "Head Servants can only create chapter events.",
        };
      }
      if (
        currentUser.chapter &&
        data.chapter_id !== String(currentUser.chapter.id)
      ) {
        return {
          success: false,
          title: "Permission Denied",
          description: "You can only create events for your own chapter.",
        };
      }
    }
  }

  const validationError = validateEvent(data);
  if (validationError) return validationError;

  try {
    const combinedDate = new Date(
      `${data.event_date}T${data.event_time}:00+08:00`,
    );

    const isWithinOneDay =
      combinedDate.getTime() - new Date().getTime() <= 24 * 60 * 60 * 1000;
    const qrToken =
      data.qr_enabled && isWithinOneDay ? crypto.randomUUID() : null;
    const expiresAt = qrToken ? new Date() : null;
    if (expiresAt) expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    const created = await prisma.event.create({
      data: {
        name: data.name.trim(),
        event_type_id:
          data.event_type_id && data.event_type_id !== "none"
            ? Number(data.event_type_id)
            : null,
        scope: data.scope,
        chapter_id:
          data.scope === "chapter" && data.chapter_id
            ? Number(data.chapter_id)
            : null,
        event_date: combinedDate,
        location: data.location.trim() || null,
        location_url: data.location_url.trim() || null,
        qr_enabled: data.qr_enabled,
        qr_token: qrToken,
        qr_expires_at: expiresAt,
        created_by: currentUser.user.id,
      },
    });

    let chapterName: string | null = null;
    if (data.scope === "chapter" && data.chapter_id) {
      const ch = await prisma.chapter.findUnique({
        where: { id: Number(data.chapter_id) },
        select: { name: true },
      });
      chapterName = ch?.name ?? null;
    }

    const actorName = formatName(currentUser.user);
    const chapterSuffix = chapterName ? ` for ${chapterName} Chapter` : "";
    await logActivity({
      actorId: currentUser.user.id,
      actorName,
      action: ACTIVITY_ACTIONS.CREATED,
      entityType: ACTIVITY_ENTITIES.EVENT,
      entityId: created.id,
      entityLabel: created.name,
      chapterId: created.chapter_id ?? null,
      message: `${actorName} created ${created.name} event${chapterSuffix}`,
    });

    revalidatePath(REVALIDATE_PATH);
    return {
      success: true,
      title: "Event Created",
      description: `${data.name} has been created successfully.`,
    };
  } catch {
    return handleActionError("Failed to create event. Please try again.");
  }
}

export async function updateEvent(
  id: number,
  data: EventForm,
): Promise<ActionResult> {
  const currentUser = await requireRole([...PERMISSION_ROLES.EVENTS_MANAGE]);

  // Head Servant: can only update own chapter events
  if (
    currentUser.roles.includes(ROLE_KEYS.HEAD_SERVANT) &&
    !currentUser.roles.includes(ROLE_KEYS.DIRECTOR_ADVISER) &&
    !currentUser.roles.includes(ROLE_KEYS.ELDER)
  ) {
    const existing = await prisma.event.findUnique({
      where: { id },
      select: { chapter_id: true },
    });
    if (!existing || existing.chapter_id !== currentUser.chapter?.id) {
      return {
        success: false,
        title: "Permission Denied",
        description: "You can only edit events for your own chapter.",
      };
    }
  }

  const validationError = validateEvent(data);
  if (validationError) return validationError;

  try {
    const isHeadServant =
      currentUser.roles.includes(ROLE_KEYS.HEAD_SERVANT) &&
      !currentUser.roles.includes(ROLE_KEYS.DIRECTOR_ADVISER) &&
      !currentUser.roles.includes(ROLE_KEYS.ELDER);

    const existing = await prisma.event.findUnique({
      where: { id },
      select: {
        name: true,
        event_date: true,
        location: true,
        scope: true,
        qr_token: true,
        qr_enabled: true,
        chapter_id: true,
        event_type: { select: { name: true } },
      },
    });

    if (!existing) throw new Error("Event not found");

    const combinedDate = new Date(
      `${data.event_date}T${data.event_time}:00+08:00`,
    );

    // Server-side schedule lock for Head Servants
    if (isHeadServant && existing.event_date) {
      const now = Date.now();
      const eventTime = existing.event_date.getTime();

      // If event is starting in < 1 hour (or already ongoing)
      if (eventTime - now < 3600000) {
        // Check if schedule was actually changed
        if (combinedDate.getTime() !== eventTime) {
          return {
            success: false,
            title: "Schedule Locked",
            description:
              "You cannot change the schedule of an event that is starting soon or already ongoing.",
          };
        }
      }
    }

    const isWithinOneDay =
      combinedDate.getTime() - new Date().getTime() <= 24 * 60 * 60 * 1000;

    let qrToken = existing.qr_token ?? null;
    let expiresAt = undefined;

    if (data.qr_enabled) {
      if (!qrToken && isWithinOneDay) {
        qrToken = crypto.randomUUID();
        expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 15);
      }
    } else {
      qrToken = null;
      expiresAt = null;
    }

    await prisma.event.update({
      where: { id },
      data: {
        name: data.name.trim(),
        event_type_id:
          data.event_type_id && data.event_type_id !== "none"
            ? Number(data.event_type_id)
            : null,
        scope: data.scope,
        chapter_id:
          data.scope === "chapter" && data.chapter_id
            ? Number(data.chapter_id)
            : null,
        event_date: combinedDate,
        location: data.location.trim() || null,
        location_url: data.location_url.trim() || null,
        qr_enabled: data.qr_enabled,
        qr_token: qrToken,
        qr_expires_at: expiresAt,
        updated_by: currentUser.user.id,
      },
    });

    // Resolve new event type name for human-readable diff
    let newEventTypeName: string | null = null;
    if (data.event_type_id && data.event_type_id !== "none") {
      const et = await prisma.eventType.findUnique({
        where: { id: Number(data.event_type_id) },
        select: { name: true },
      });
      newEventTypeName = et?.name ?? null;
    }

    const prev = {
      name: existing.name,
      event_type: existing.event_type?.name ?? null,
      event_date: formatDateTime(existing.event_date),
      location: existing.location,
      scope: existing.scope === "global" ? "Global" : "Chapter",
      qr_enabled: existing.qr_enabled ? "Enabled" : "Disabled",
    };
    const next = {
      name: data.name.trim(),
      event_type: newEventTypeName,
      event_date: formatDateTime(combinedDate),
      location: data.location.trim() || null,
      scope: data.scope === "global" ? "Global" : "Chapter",
      qr_enabled: data.qr_enabled ? "Enabled" : "Disabled",
    };

    const changes = diffFields(prev, next, EVENT_FIELD_LABELS);
    if (changes.length > 0) {
      const actorName = formatName(currentUser.user);
      await logActivity({
        actorId: currentUser.user.id,
        actorName,
        action: ACTIVITY_ACTIONS.UPDATED,
        entityType: ACTIVITY_ENTITIES.EVENT,
        entityId: id,
        entityLabel: next.name,
        chapterId: existing.chapter_id ?? null,
        message: buildUpdateMessage(actorName, next.name, changes),
        metadata: { changes },
      });
    }

    revalidatePath(REVALIDATE_PATH);
    return {
      success: true,
      title: "Event Updated",
      description: `"${data.name}" has been updated successfully.`,
    };
  } catch {
    return handleActionError("Failed to update event. Please try again.");
  }
}

export async function deleteEvent(id: number): Promise<ActionResult> {
  const currentUser = await requireRole([...PERMISSION_ROLES.EVENTS_MANAGE]);

  // Head Servant: can only delete own chapter events
  if (
    currentUser.roles.includes(ROLE_KEYS.HEAD_SERVANT) &&
    !currentUser.roles.includes(ROLE_KEYS.DIRECTOR_ADVISER) &&
    !currentUser.roles.includes(ROLE_KEYS.ELDER)
  ) {
    const existing = await prisma.event.findUnique({
      where: { id },
      select: { chapter_id: true },
    });
    if (!existing || existing.chapter_id !== currentUser.chapter?.id) {
      return {
        success: false,
        title: "Permission Denied",
        description: "You can only delete events for your own chapter.",
      };
    }
  }

  try {
    const event = await prisma.event.findUnique({
      where: { id },
      select: { name: true, chapter_id: true },
    });

    if (!event) throw new Error("Event not found");

    await prisma.event.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        deleted_by: currentUser.user.id,
      },
    });

    const actorName = formatName(currentUser.user);
    await logActivity({
      actorId: currentUser.user.id,
      actorName,
      action: ACTIVITY_ACTIONS.DELETED,
      entityType: ACTIVITY_ENTITIES.EVENT,
      entityId: id,
      entityLabel: event.name,
      chapterId: event.chapter_id ?? null,
      message: `${actorName} deleted ${event.name} event`,
    });

    revalidatePath(REVALIDATE_PATH);
    return {
      success: true,
      title: "Event Deleted",
      description: "The event has been removed successfully.",
    };
  } catch {
    return handleActionError("Failed to delete event. Please try again.");
  }
}

export async function generateEventQR(id: number) {
  const currentUser = await requireRole([...PERMISSION_ROLES.EVENTS_MANAGE]);

  try {
    const event = await prisma.event.findUnique({
      where: { id },
      select: { name: true, qr_interval: true, chapter_id: true },
    });

    if (!event) throw new Error("Event not found");

    const qrToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + (event.qr_interval || 15));

    await prisma.event.update({
      where: { id },
      data: {
        qr_token: qrToken,
        qr_expires_at: expiresAt,
        updated_by: currentUser.user.id,
      },
    });

    const actorName = formatName(currentUser.user);
    await logActivity({
      actorId: currentUser.user.id,
      actorName,
      action: ACTIVITY_ACTIONS.ENCODED,
      entityType: ACTIVITY_ENTITIES.EVENT,
      entityId: id,
      entityLabel: event.name,
      chapterId: event.chapter_id ?? null,
      message: `${actorName} generated a QR code for ${event.name} event`,
    });

    revalidatePath(REVALIDATE_PATH);
    return {
      success: true,
      title: "QR Generated",
      description: "QR code has been generated successfully.",
    };
  } catch {
    return handleActionError("Failed to generate QR. Please try again.");
  }
}
