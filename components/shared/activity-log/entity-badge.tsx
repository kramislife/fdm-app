"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/utils";
import {
  ACTIVITY_ENTITY_LABELS,
  ACTIVITY_ENTITY_STYLES,
  type ActivityEntity,
} from "@/lib/constants/activity-log";

interface ActivityEntityBadgeProps {
  entityType: ActivityEntity | string;
  className?: string;
}

export function ActivityEntityBadge({
  entityType,
  className,
}: ActivityEntityBadgeProps) {
  const style = ACTIVITY_ENTITY_STYLES[entityType as ActivityEntity];
  const label =
    ACTIVITY_ENTITY_LABELS[entityType as ActivityEntity] ?? entityType;

  return (
    <Badge
      variant={style?.badgeVariant ?? "secondary"}
      className={cn(className)}
    >
      {label}
    </Badge>
  );
}
