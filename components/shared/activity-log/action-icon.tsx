"use client";

import {
  Plus,
  PenLine,
  Trash2,
  RotateCcw,
  ShieldCheck,
  ShieldOff,
  UserPlus,
  UserMinus,
  Eye,
  EyeOff,
  LogIn,
  ClipboardList,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils/utils";
import {
  ACTIVITY_ACTIONS,
  ACTIVITY_ACTION_STYLES,
  type ActivityAction,
} from "@/lib/constants/activity-log";

// Icon per action — only lives here since LucideIcon can't go in a pure constants file
const ACTION_ICONS: Record<ActivityAction, LucideIcon> = {
  [ACTIVITY_ACTIONS.CREATED]: Plus,
  [ACTIVITY_ACTIONS.UPDATED]: PenLine,
  [ACTIVITY_ACTIONS.DELETED]: Trash2,
  [ACTIVITY_ACTIONS.RESTORED]: RotateCcw,
  [ACTIVITY_ACTIONS.ACTIVATED]: ShieldCheck,
  [ACTIVITY_ACTIONS.DEACTIVATED]: ShieldOff,
  [ACTIVITY_ACTIONS.ASSIGNED]: UserPlus,
  [ACTIVITY_ACTIONS.REMOVED]: UserMinus,
  [ACTIVITY_ACTIONS.PUBLISHED]: Eye,
  [ACTIVITY_ACTIONS.UNPUBLISHED]: EyeOff,
  [ACTIVITY_ACTIONS.CHECKED_IN]: LogIn,
  [ACTIVITY_ACTIONS.ENCODED]: ClipboardList,
};

// Solid backgrounds for use on top of images (avatar overlays)
const ACTION_BG_SOLID: Partial<Record<ActivityAction, string>> = {
  [ACTIVITY_ACTIONS.CREATED]: "bg-success",
  [ACTIVITY_ACTIONS.UPDATED]: "bg-info",
  [ACTIVITY_ACTIONS.DELETED]: "bg-destructive",
  [ACTIVITY_ACTIONS.RESTORED]: "bg-success",
  [ACTIVITY_ACTIONS.ACTIVATED]: "bg-success",
  [ACTIVITY_ACTIONS.DEACTIVATED]: "bg-amber-500",
  [ACTIVITY_ACTIONS.ASSIGNED]: "bg-info",
  [ACTIVITY_ACTIONS.REMOVED]: "bg-amber-500",
  [ACTIVITY_ACTIONS.PUBLISHED]: "bg-success",
  [ACTIVITY_ACTIONS.UNPUBLISHED]: "bg-muted-foreground",
  [ACTIVITY_ACTIONS.CHECKED_IN]: "bg-info",
  [ACTIVITY_ACTIONS.ENCODED]: "bg-info",
};

interface ActivityActionIconProps {
  action: ActivityAction | string;
  /** Size of the icon bubble — defaults to "md" */
  size?: "sm" | "md" | "lg";
  /** Use solid background (for overlays on images) instead of subtle tint */
  solid?: boolean;
  className?: string;
}

const BUBBLE_SIZE = {
  sm: "p-1",
  md: "p-1.5",
  lg: "p-2",
} as const;

const ICON_SIZE = {
  sm: "size-3",
  md: "size-3.5",
  lg: "size-4",
} as const;

export function ActivityActionIcon({
  action,
  size = "md",
  solid = false,
  className,
}: ActivityActionIconProps) {
  const style = ACTIVITY_ACTION_STYLES[action as ActivityAction];
  const Icon = ACTION_ICONS[action as ActivityAction];

  // Graceful fallback for unknown/future actions
  if (!style || !Icon) {
    return (
      <div className={cn("rounded-md p-1.5 bg-muted shrink-0", className)}>
        <PenLine className="size-3.5 text-muted-foreground" />
      </div>
    );
  }

  const bg = solid
    ? (ACTION_BG_SOLID[action as ActivityAction] ?? style.bg)
    : style.bg;

  return (
    <div
      className={cn(
        "rounded-md shrink-0",
        BUBBLE_SIZE[size],
        bg,
        className,
      )}
    >
      <Icon className={cn(ICON_SIZE[size], solid ? "text-white" : style.color)} />
    </div>
  );
}
