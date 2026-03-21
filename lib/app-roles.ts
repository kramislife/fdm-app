// Centralized application roles and permissions
export const ROLE_KEYS = {
  DIRECTOR_ADVISER: "director_adviser",
  ELDER: "elder",
  HEAD_SERVANT: "head_servant",
  ASST_HEAD_SERVANT: "asst_head_servant",
  MINISTRY_HEAD: "ministry_head",
  BUILDER: "builder",
  CLUSTER_HEAD: "cluster_head",
  MINISTRY_COORDINATOR: "ministry_coordinator",
  FINANCE_HEAD: "finance_head",
  FINANCE: "finance",
  MEMBER: "member",
} as const;

export type RoleKey = (typeof ROLE_KEYS)[keyof typeof ROLE_KEYS];

export const ROLE_LIST = Object.values(ROLE_KEYS) as RoleKey[];

// Human-readable labels for roles
export const ROLE_LABELS: Record<RoleKey, string> = {
  [ROLE_KEYS.DIRECTOR_ADVISER]: "Director Adviser",
  [ROLE_KEYS.ELDER]: "Elder",
  [ROLE_KEYS.HEAD_SERVANT]: "Head Servant",
  [ROLE_KEYS.ASST_HEAD_SERVANT]: "Asst. Head Servant",
  [ROLE_KEYS.MINISTRY_HEAD]: "Ministry Head",
  [ROLE_KEYS.BUILDER]: "Builder",
  [ROLE_KEYS.CLUSTER_HEAD]: "Cluster Head",
  [ROLE_KEYS.MINISTRY_COORDINATOR]: "Ministry Coordinator",
  [ROLE_KEYS.FINANCE_HEAD]: "Finance Head",
  [ROLE_KEYS.FINANCE]: "Finance Officer",
  [ROLE_KEYS.MEMBER]: "Member",
};

// Define role hierarchies for permissions
export const PERMISSION_ROLES = {
  SUPER_ADMIN: [ROLE_KEYS.DIRECTOR_ADVISER, ROLE_KEYS.ELDER],
  MINISTRY_HEADS_MANAGE: [
    ROLE_KEYS.DIRECTOR_ADVISER,
    ROLE_KEYS.ELDER,
    ROLE_KEYS.HEAD_SERVANT,
  ],
  USERS_VIEW: [
    ROLE_KEYS.DIRECTOR_ADVISER,
    ROLE_KEYS.ELDER,
    ROLE_KEYS.HEAD_SERVANT,
    ROLE_KEYS.ASST_HEAD_SERVANT,
  ],
} as const satisfies Record<string, readonly RoleKey[]>;
