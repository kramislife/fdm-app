"use client";

import { useEffect, useRef } from "react";
import { Activity } from "lucide-react";
import { ActivityActionIcon } from "@/components/shared/activity-log/action-icon";
import { UserAvatar } from "@/components/shared/user-avatar";
import {
  formatActivityTime,
  formatRelativeDate,
  getNameInitials,
} from "@/lib/utils/format";
import type { ActivityLogItem } from "@/lib/data/activity-logs";
import {
  ACTIVITY_ACTION_LABELS,
  ACTIVITY_ACTION_STYLES,
  ACTIVITY_ENTITY_LABELS,
  type ActivityAction,
  type ActivityEntity,
} from "@/lib/constants/activity-log";

// ─── Helpers ───────────────────────────────────────────────────────────────────

function groupLogsByDate(logs: ActivityLogItem[]) {
  const groups: Array<{ label: string; entries: ActivityLogItem[] }> = [];
  const map = new Map<string, ActivityLogItem[]>();

  for (const log of logs) {
    const key = formatRelativeDate(log.created_at, "long");
    if (!map.has(key)) {
      const arr: ActivityLogItem[] = [];
      map.set(key, arr);
      groups.push({ label: key, entries: arr });
    }
    map.get(key)!.push(log);
  }

  return groups;
}

// ─── Log Entry ─────────────────────────────────────────────────────────────────

interface LogEntryProps {
  log: ActivityLogItem;
  isNew: boolean;
  onSeen: (id: number) => void;
}

function LogEntry({ log, isNew, onSeen }: LogEntryProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isNew || !ref.current) return;

    let timer: ReturnType<typeof setTimeout> | null = null;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          timer = setTimeout(() => onSeen(log.id), 5000);
        } else {
          if (timer !== null) {
            clearTimeout(timer);
            timer = null;
          }
        }
      },
      { threshold: 0.6 },
    );

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
      if (timer !== null) clearTimeout(timer);
    };
  }, [isNew, log.id, onSeen]);

  const initials = getNameInitials(log.actor);

  return (
    <div
      ref={ref}
      className="flex items-start gap-5 py-5 border-b border-border/50 last:border-b-0"
    >
      <div className="relative shrink-0 mt-1">
        <UserAvatar
          initials={initials}
          photoUrl={log.actor.photo_url}
          className="h-9 w-9"
        />
        <span className="absolute -bottom-1 -right-1 rounded-full ring-2 ring-background">
          <ActivityActionIcon
            action={log.action}
            size="sm"
            solid
            className="rounded-full"
          />
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <p className="flex items-center gap-2 text-sm font-medium leading-snug text-foreground">
          <span className="flex-1">{log.message}</span>
          {isNew && (
            <span className="shrink-0 size-2 rounded-full bg-success" />
          )}
        </p>

        <div className="flex items-center gap-1.5 mt-1.5 text-xs">
          <span className="text-muted-foreground">
            {ACTIVITY_ENTITY_LABELS[log.entity_type as ActivityEntity] ??
              log.entity_type}
          </span>
          <span aria-hidden className="text-muted-foreground">
            ·
          </span>
          <span
            className={
              ACTIVITY_ACTION_STYLES[log.action as ActivityAction]?.color ??
              "text-muted-foreground"
            }
          >
            {ACTIVITY_ACTION_LABELS[log.action as ActivityAction] ?? log.action}
          </span>
          <span aria-hidden className="text-muted-foreground">
            ·
          </span>
          <time
            dateTime={
              log.created_at instanceof Date
                ? log.created_at.toISOString()
                : String(log.created_at)
            }
            className="tabular-nums text-muted-foreground"
          >
            {formatActivityTime(log.created_at)}
          </time>
        </div>
      </div>
    </div>
  );
}

// ─── Component ─────────────────────────────────────────────────────────────────

interface DashboardActivityProps {
  logs: ActivityLogItem[];
  total: number;
  seenIds: Set<number>;
  onSeen: (id: number) => void;
}

export function DashboardActivity({
  logs,
  total,
  seenIds,
  onSeen,
}: DashboardActivityProps) {
  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 text-center py-20">
        <div className="p-4 rounded-full bg-muted">
          <Activity className="size-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-semibold">No activity yet</p>
        <p className="text-xs text-muted-foreground max-w-xs">
          Admin actions like creating users, updating settings, and assigning
          roles will appear here.
        </p>
      </div>
    );
  }

  const groups = groupLogsByDate(logs);

  return (
    <div>
      {groups.map((group) => (
        <div key={group.label}>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border/50" />
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
              {group.label}
            </span>
            <div className="flex-1 h-px bg-border/50" />
          </div>

          {group.entries.map((log) => (
            <LogEntry
              key={log.id}
              log={log}
              isNew={!seenIds.has(log.id)}
              onSeen={onSeen}
            />
          ))}
        </div>
      ))}

      {total > logs.length && (
        <p className="text-xs text-muted-foreground text-center">
          Showing {logs.length} of {total.toLocaleString()} entries
        </p>
      )}
    </div>
  );
}
