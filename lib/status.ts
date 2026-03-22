export const ACCOUNT_STATUS = {
  GUEST: "guest", // in guest_logs only, no users row
  PENDING: "pending", // account created, not logged in yet
  EXPIRED: "expired", // pending > 7 days, never activated
  VERIFIED: "verified", // logged in + QR auto-generated
} as const;

export type AccountStatus =
  (typeof ACCOUNT_STATUS)[keyof typeof ACCOUNT_STATUS];

export const ACCOUNT_STATUS_VALUES = Object.values(
  ACCOUNT_STATUS,
) as AccountStatus[];

export const ACCOUNT_STATUS_LABELS: Record<AccountStatus, string> = {
  [ACCOUNT_STATUS.GUEST]: "Guest",
  [ACCOUNT_STATUS.PENDING]: "Pending",
  [ACCOUNT_STATUS.EXPIRED]: "Expired",
  [ACCOUNT_STATUS.VERIFIED]: "Verified",
};

export function isAccountStatus(value: string): value is AccountStatus {
  return ACCOUNT_STATUS_VALUES.includes(value as AccountStatus);
}
