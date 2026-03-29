export const ACTIVITY_ACTIONS = {
  CREATED: "created",
  UPDATED: "updated",
  DELETED: "deleted",
  RESTORED: "restored",
  ACTIVATED: "activated",
  DEACTIVATED: "deactivated",
  ASSIGNED: "assigned", // role / ministry head assigned
  REMOVED: "removed", // role / ministry head removed
  PUBLISHED: "published",
  UNPUBLISHED: "unpublished",
  CHECKED_IN: "checked_in",
  ENCODED: "encoded",
} as const;

export type ActivityAction =
  (typeof ACTIVITY_ACTIONS)[keyof typeof ACTIVITY_ACTIONS];

// Human-readable past-tense verb for each action — used in the UI
export const ACTIVITY_ACTION_LABELS: Record<ActivityAction, string> = {
  [ACTIVITY_ACTIONS.CREATED]: "Created",
  [ACTIVITY_ACTIONS.UPDATED]: "Updated",
  [ACTIVITY_ACTIONS.DELETED]: "Deleted",
  [ACTIVITY_ACTIONS.RESTORED]: "Restored",
  [ACTIVITY_ACTIONS.ACTIVATED]: "Activated",
  [ACTIVITY_ACTIONS.DEACTIVATED]: "Deactivated",
  [ACTIVITY_ACTIONS.ASSIGNED]: "Assigned",
  [ACTIVITY_ACTIONS.REMOVED]: "Removed",
  [ACTIVITY_ACTIONS.PUBLISHED]: "Published",
  [ACTIVITY_ACTIONS.UNPUBLISHED]: "Unpublished",
  [ACTIVITY_ACTIONS.CHECKED_IN]: "Checked In",
  [ACTIVITY_ACTIONS.ENCODED]: "Encoded",
};

// ------------------------------------------------------------
// ENTITY TYPES
// The type of record that was acted on.
// Value must match the @@map() name in schema.prisma.
// ------------------------------------------------------------
export const ACTIVITY_ENTITIES = {
  USER: "user",
  USER_ROLE: "user_role",
  CHAPTER: "chapter",
  CLUSTER: "cluster",
  CHAPTER_MINISTRY: "chapter_ministry",
  EVENT: "event",
  EVENT_TYPE: "event_type",
  MINISTRY_TYPE: "ministry_type",
  ANNOUNCEMENT: "announcement",
  FINANCE_RECORD: "finance_record",
  ATTENDANCE: "attendance",
  GUEST_LOG: "guest_log",
  ENTHRONEMENT_RECORD: "enthronement_record",
} as const;

export type ActivityEntity =
  (typeof ACTIVITY_ENTITIES)[keyof typeof ACTIVITY_ENTITIES];

// Human-readable singular label for each entity — used in the UI
export const ACTIVITY_ENTITY_LABELS: Record<ActivityEntity, string> = {
  [ACTIVITY_ENTITIES.USER]: "User",
  [ACTIVITY_ENTITIES.USER_ROLE]: "User Role",
  [ACTIVITY_ENTITIES.CHAPTER]: "Chapter",
  [ACTIVITY_ENTITIES.CLUSTER]: "Cluster",
  [ACTIVITY_ENTITIES.CHAPTER_MINISTRY]: "Chapter Ministry",
  [ACTIVITY_ENTITIES.EVENT]: "Event",
  [ACTIVITY_ENTITIES.EVENT_TYPE]: "Event Type",
  [ACTIVITY_ENTITIES.MINISTRY_TYPE]: "Ministry Type",
  [ACTIVITY_ENTITIES.ANNOUNCEMENT]: "Announcement",
  [ACTIVITY_ENTITIES.FINANCE_RECORD]: "Finance Record",
  [ACTIVITY_ENTITIES.ATTENDANCE]: "Attendance",
  [ACTIVITY_ENTITIES.GUEST_LOG]: "Guest Log",
  [ACTIVITY_ENTITIES.ENTHRONEMENT_RECORD]: "Enthronement Record",
};

// ------------------------------------------------------------
// METADATA FIELD KEYS
// Typed keys used when building & reading metadata JSON.
// Prevents string typos across server actions and UI components.
// ------------------------------------------------------------
export const ACTIVITY_META = {
  // field-level change tracking (action: updated)
  CHANGES: "changes", // FieldChange[]
  FIELD: "field", // string — which field changed
  OLD: "old", // unknown — previous value
  NEW: "new", // unknown — next value

  // role assignment / removal (action: assigned | removed)
  ROLE: "role", // string — role display name
  TARGET_USER_ID: "target_user_id", // number
  TARGET_USER: "target_user", // string — full name snapshot
  CHAPTER: "chapter", // string — chapter name snapshot (optional)
} as const;

// ------------------------------------------------------------
// METADATA SHAPES (TypeScript types for structured metadata)
// ------------------------------------------------------------

export interface FieldChange {
  field: string;
  old: unknown;
  new: unknown;
}

// action: updated
export interface UpdateMetadata {
  changes: FieldChange[];
}

// action: assigned | removed
export interface RoleAssignmentMetadata {
  role: string;
  target_user_id: number;
  target_user: string;
  chapter?: string;
  previous_user_id?: number;
  previous_user?: string;
}

// Discriminated union — import this in server actions and UI
export type ActivityMetadata = UpdateMetadata | RoleAssignmentMetadata | null;

// ------------------------------------------------------------
// FIELD LABELS
// Human-readable names for entity fields — used in diff display.
// "Mark updated the [fieldLabel] of [entityLabel]"
// ------------------------------------------------------------
export const EVENT_TYPE_FIELD_LABELS: Record<string, string> = {
  name: "name",
  key: "key",
  description: "description",
  is_active: "status",
};

export const MINISTRY_TYPE_FIELD_LABELS: Record<string, string> = {
  name: "name",
  key: "key",
  description: "description",
  is_active: "status",
};

export const USER_FIELD_LABELS: Record<string, string> = {
  first_name: "first name",
  last_name: "last name",
  email: "email",
  contact_number: "contact number",
  birthday: "birthday",
  address: "address",
  account_status: "account status",
  is_qr_only: "QR-only flag",
};

export const CHAPTER_FIELD_LABELS: Record<string, string> = {
  name: "name",
  fellowship_day: "fellowship day",
  region: "region",
  province: "province",
  city: "city",
  barangay: "barangay",
  street: "street",
  landmark: "landmark",
  google_maps_url: "Google Maps link",
  is_active: "status",
};

export const EVENT_FIELD_LABELS: Record<string, string> = {
  name: "name",
  event_type: "event type",
  event_date: "date",
  location: "location",
  scope: "scope",
  qr_enabled: "QR attendance",
};

// Map entity type → its field label map for generic lookup
export const ENTITY_FIELD_LABELS: Partial<
  Record<ActivityEntity, Record<string, string>>
> = {
  [ACTIVITY_ENTITIES.EVENT_TYPE]: EVENT_TYPE_FIELD_LABELS,
  [ACTIVITY_ENTITIES.MINISTRY_TYPE]: MINISTRY_TYPE_FIELD_LABELS,
  [ACTIVITY_ENTITIES.USER]: USER_FIELD_LABELS,
  [ACTIVITY_ENTITIES.CHAPTER]: CHAPTER_FIELD_LABELS,
  [ACTIVITY_ENTITIES.EVENT]: EVENT_FIELD_LABELS,
};

// ------------------------------------------------------------
// UI STYLE CONFIG
// Pure Tailwind class strings — no React imports needed here.
// Consumed by components/shared/activity-log/*.tsx
// ------------------------------------------------------------

export type ActivityBadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "success"
  | "info"
  | "error"
  | "warning";

/** Icon bubble + badge styling per action */
export const ACTIVITY_ACTION_STYLES: Record<
  ActivityAction,
  { color: string; bg: string; badgeVariant: ActivityBadgeVariant }
> = {
  [ACTIVITY_ACTIONS.CREATED]: {
    color: "text-success",
    bg: "bg-success/10",
    badgeVariant: "success",
  },
  [ACTIVITY_ACTIONS.UPDATED]: {
    color: "text-info",
    bg: "bg-info/10",
    badgeVariant: "info",
  },
  [ACTIVITY_ACTIONS.DELETED]: {
    color: "text-destructive",
    bg: "bg-destructive/10",
    badgeVariant: "error",
  },
  [ACTIVITY_ACTIONS.RESTORED]: {
    color: "text-success",
    bg: "bg-success/10",
    badgeVariant: "success",
  },
  [ACTIVITY_ACTIONS.ACTIVATED]: {
    color: "text-success",
    bg: "bg-success/10",
    badgeVariant: "success",
  },
  [ACTIVITY_ACTIONS.DEACTIVATED]: {
    color: "text-amber-600",
    bg: "bg-amber-500/10",
    badgeVariant: "warning",
  },
  [ACTIVITY_ACTIONS.ASSIGNED]: {
    color: "text-info",
    bg: "bg-info/10",
    badgeVariant: "info",
  },
  [ACTIVITY_ACTIONS.REMOVED]: {
    color: "text-amber-600",
    bg: "bg-amber-500/10",
    badgeVariant: "warning",
  },
  [ACTIVITY_ACTIONS.PUBLISHED]: {
    color: "text-success",
    bg: "bg-success/10",
    badgeVariant: "success",
  },
  [ACTIVITY_ACTIONS.UNPUBLISHED]: {
    color: "text-muted-foreground",
    bg: "bg-muted",
    badgeVariant: "secondary",
  },
  [ACTIVITY_ACTIONS.CHECKED_IN]: {
    color: "text-success",
    bg: "bg-success/10",
    badgeVariant: "success",
  },
  [ACTIVITY_ACTIONS.ENCODED]: {
    color: "text-info",
    bg: "bg-info/10",
    badgeVariant: "info",
  },
};

/** Badge styling per entity type */
export const ACTIVITY_ENTITY_STYLES: Record<
  ActivityEntity,
  { badgeVariant: ActivityBadgeVariant }
> = {
  [ACTIVITY_ENTITIES.USER]: { badgeVariant: "info" },
  [ACTIVITY_ENTITIES.USER_ROLE]: { badgeVariant: "warning" },
  [ACTIVITY_ENTITIES.CHAPTER]: { badgeVariant: "default" },
  [ACTIVITY_ENTITIES.CLUSTER]: { badgeVariant: "secondary" },
  [ACTIVITY_ENTITIES.CHAPTER_MINISTRY]: { badgeVariant: "secondary" },
  [ACTIVITY_ENTITIES.EVENT]: { badgeVariant: "info" },
  [ACTIVITY_ENTITIES.EVENT_TYPE]: { badgeVariant: "outline" },
  [ACTIVITY_ENTITIES.MINISTRY_TYPE]: { badgeVariant: "outline" },
  [ACTIVITY_ENTITIES.ANNOUNCEMENT]: { badgeVariant: "secondary" },
  [ACTIVITY_ENTITIES.FINANCE_RECORD]: { badgeVariant: "warning" },
  [ACTIVITY_ENTITIES.ATTENDANCE]: { badgeVariant: "success" },
  [ACTIVITY_ENTITIES.GUEST_LOG]: { badgeVariant: "secondary" },
  [ACTIVITY_ENTITIES.ENTHRONEMENT_RECORD]: { badgeVariant: "secondary" },
};
