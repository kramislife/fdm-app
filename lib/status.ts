export const USER_STATUS = {
  GUEST: "guest",
  PENDING: "pending",
  REGISTERED: "registered",
  ACTIVE: "active",
  INACTIVE: "inactive",
} as const;

export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS];

export const USER_STATUS_VALUES = Object.values(USER_STATUS) as UserStatus[];

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  [USER_STATUS.GUEST]: "Guest",
  [USER_STATUS.PENDING]: "Pending",
  [USER_STATUS.REGISTERED]: "Registered",
  [USER_STATUS.ACTIVE]: "Active",
  [USER_STATUS.INACTIVE]: "Inactive",
};

export const ACTIVE_STATE_LABELS = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
} as const;

export function isUserStatus(value: string): value is UserStatus {
  return USER_STATUS_VALUES.includes(value as UserStatus);
}
