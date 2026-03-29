"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/utils";
import {
  ACTIVITY_ACTION_LABELS,
  ACTIVITY_ACTION_STYLES,
  type ActivityAction,
} from "@/lib/constants/activity-log";

interface ActivityActionBadgeProps {
  action: ActivityAction | string;
  className?: string;
}

export function ActivityActionBadge({
  action,
  className,
}: ActivityActionBadgeProps) {
  const style = ACTIVITY_ACTION_STYLES[action as ActivityAction];
  const label = ACTIVITY_ACTION_LABELS[action as ActivityAction] ?? action;

  return (
    <Badge
      variant={style?.badgeVariant ?? "secondary"}
      className={cn(className)}
    >
      {label}
    </Badge>
  );
}
