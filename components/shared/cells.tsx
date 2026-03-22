import { Badge } from "@/components/ui/badge";
import {
  formatDateTime,
  formatDate,
  capitalizeWords,
  formatName,
} from "@/lib/format";
import {
  ACCOUNT_STATUS,
  ACCOUNT_STATUS_LABELS,
  isAccountStatus,
} from "@/lib/status";

// ------------------------------- Status Badge -----------------------------------------
interface StatusBadgeProps {
  isActive: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
}

export function StatusBadge({
  isActive,
  activeLabel = "Active",
  inactiveLabel = "Inactive",
}: StatusBadgeProps) {
  return isActive ? (
    <Badge variant="success">{activeLabel}</Badge>
  ) : (
    <Badge variant="error">{inactiveLabel}</Badge>
  );
}

// ------------------------------ User Status Badge -------------------------------------
interface UserStatusBadgeProps {
  status: string;
}

export function UserStatusBadge({ status }: UserStatusBadgeProps) {
  let variant: "secondary" | "warning" | "error" | "info" | "success" = "secondary";

  if (status === ACCOUNT_STATUS.PENDING) variant = "warning";
  else if (status === ACCOUNT_STATUS.EXPIRED) variant = "error";
  else if (status === ACCOUNT_STATUS.VERIFIED) variant = "success";

  const label = isAccountStatus(status)
    ? ACCOUNT_STATUS_LABELS[status]
    : capitalizeWords(status);
  return <Badge variant={variant}>{label}</Badge>;
}

// ------------------------------- User Cell --------------------------------------------
interface UserCellProps {
  user: { first_name: string; last_name: string } | null | undefined;
  fallback?: string;
}

export function UserCell({ user, fallback = "—" }: UserCellProps) {
  if (!user) {
    return <span className="text-muted-foreground">{fallback}</span>;
  }
  const fullName = formatName(user, "full", fallback);
  return <span title={fullName}>{fullName}</span>;
}

// ------------------------------- Text Cell -----------------------------------------
interface TextCellProps {
  value: string | number | null | undefined;
  fallback?: string;
  capitalize?: boolean;
}

export function TextCell({
  value,
  fallback = "—",
  capitalize = false,
}: TextCellProps) {
  const isEmpty =
    value === null || value === undefined || String(value).trim() === "";

  if (isEmpty) {
    return <span className="text-muted-foreground">{fallback}</span>;
  }

  let displayValue = String(value);
  if (capitalize) {
    displayValue = capitalizeWords(displayValue);
  }

  return (
    <span className="wrap-break-word" title={displayValue}>
      {displayValue}
    </span>
  );
}

// ------------------------------- Date Cell -----------------------------------------
interface DateCellProps {
  date: Date | string | null | undefined;
  dateOnly?: boolean;
  format?: "short" | "long";
  fallback?: string;
}

export function DateCell({
  date,
  dateOnly = false,
  format = "short",
  fallback = "—",
}: DateCellProps) {
  if (!date) {
    return <span className="text-muted-foreground">{fallback}</span>;
  }
  const formatted = dateOnly
    ? formatDate(date, format)
    : formatDateTime(date, format);
  return <span title={formatted}>{formatted}</span>;
}

// ------------------------------- Link Cell -----------------------------------------
interface LinkCellProps {
  href: string | null | undefined;
  label?: string;
  fallback?: string;
}

export function LinkCell({ href, label, fallback = "—" }: LinkCellProps) {
  if (!href) {
    return <span className="text-muted-foreground">{fallback}</span>;
  }

  const displayText = label || href;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary underline underline-offset-4 break-all"
      title={href}
    >
      {displayText}
    </a>
  );
}
