import "server-only";

import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import type {
  ActivityAction,
  ActivityEntity,
  ActivityMetadata,
  FieldChange,
} from "@/lib/constants/activity-log";

export { formatName } from "@/lib/utils/format";

interface LogParams {
  actorId: number;
  actorName: string;
  action: ActivityAction;
  entityType: ActivityEntity;
  entityId: number;
  entityLabel: string;
  message: string;
  metadata?: ActivityMetadata;
  chapterId?: number | null;
}

/**
 * Writes a single activity log entry.
 * Never throws — logging must never break the calling action.
 */
export async function logActivity(params: LogParams): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        actor_id: params.actorId,
        action: params.action,
        entity_type: params.entityType,
        entity_id: params.entityId,
        entity_label: params.entityLabel,
        message: params.message,
        metadata:
          params.metadata != null
            ? (params.metadata as unknown as Prisma.InputJsonValue)
            : undefined,
        chapter_id: params.chapterId ?? null,
      },
    });
  } catch (err) {
    console.error("[activity-log] Failed to write log:", err);
  }
}

/**
 * Computes changed fields between prev and next using human-readable field labels.
 * Only includes keys present in both objects where the stringified value differs.
 */
export function diffFields<T extends Record<string, unknown>>(
  prev: T,
  next: Partial<T>,
  fieldLabels: Record<string, string>,
): FieldChange[] {
  const changes: FieldChange[] = [];

  for (const key of Object.keys(next) as (keyof T & string)[]) {
    if (!(key in prev)) continue;

    const oldVal = prev[key];
    const newVal = next[key];

    // Normalize nullish values for comparison
    const oldStr = oldVal == null ? "" : String(oldVal);
    const newStr = newVal == null ? "" : String(newVal);

    if (oldStr !== newStr) {
      changes.push({
        field: fieldLabels[key] ?? key,
        old: oldVal,
        new: newVal,
      });
    }
  }

  return changes;
}

/**
 * Builds a human-readable message for update actions.
 *
 * name-only change          → "Mark renamed Over a Cup of Coffee to Over a Cup of Coffee v2"
 * 1 field, short values     → "Mark updated the fellowship day of Commonwealth from Thursday to Friday"
 * 1 field, long/empty value → "Mark updated the description of Sunday Fellowship"
 * 2+ fields changed         → "Mark updated Sunday Fellowship"
 */
export function buildUpdateMessage(
  actorName: string,
  entityLabel: string,
  changes: FieldChange[],
): string {
  if (changes.length === 1 && changes[0].field === "name") {
    const oldName =
      changes[0].old != null && String(changes[0].old) !== ""
        ? String(changes[0].old)
        : entityLabel;
    return `${actorName} renamed ${oldName} to ${entityLabel}`;
  }

  if (changes.length === 1) {
    const { field, old: oldVal, new: newVal } = changes[0];
    const base = `${actorName} updated the ${field} of ${entityLabel}`;
    const oldStr = oldVal != null && String(oldVal) !== "" ? String(oldVal) : null;
    const newStr = newVal != null && String(newVal) !== "" ? String(newVal) : null;
    // Append "from X to Y" only when both values are short enough to stay readable
    if (oldStr && newStr && oldStr.length <= 40 && newStr.length <= 40) {
      return `${base} from ${oldStr} to ${newStr}`;
    }
    return base;
  }

  return `${actorName} updated the details of ${entityLabel}`;
}
