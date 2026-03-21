export const ACCOUNT_STATUS = {
  PENDING: "pending",
  REGISTERED: "registered",
  ACTIVE: "active",
} as const;

export type AccountStatus =
  (typeof ACCOUNT_STATUS)[keyof typeof ACCOUNT_STATUS];

export const ACCOUNT_STATUS_VALUES = Object.values(
  ACCOUNT_STATUS,
) as AccountStatus[];

export const ACCOUNT_STATUS_LABELS: Record<AccountStatus, string> = {
  [ACCOUNT_STATUS.PENDING]: "Pending",
  [ACCOUNT_STATUS.REGISTERED]: "Registered",
  [ACCOUNT_STATUS.ACTIVE]: "Active",
};

export function isAccountStatus(value: string): value is AccountStatus {
  return ACCOUNT_STATUS_VALUES.includes(value as AccountStatus);
}
