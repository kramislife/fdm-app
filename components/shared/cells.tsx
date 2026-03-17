import { Badge } from "@/components/ui/badge";
import { formatDateTime, formatDate, capitalizeWords } from "@/lib/format";

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
    <Badge variant="secondary">{inactiveLabel}</Badge>
  );
}

// ------------------------------ User Status Badge -------------------------------------
interface UserStatusBadgeProps {
  status: string;
}

export function UserStatusBadge({ status }: UserStatusBadgeProps) {
  let variant: "default" | "secondary" | "outline" | "destructive" | "success" =
    "secondary";

  if (status === "guest") variant = "secondary";
  else if (status === "pending") variant = "outline";
  else if (status === "registered") variant = "default";
  else if (status === "active") variant = "success";

  const label = status.charAt(0).toUpperCase() + status.slice(1);
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
  const fullName = capitalizeWords(`${user.first_name} ${user.last_name}`);
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
  fallback?: string;
}

export function DateCell({
  date,
  dateOnly = false,
  fallback = "—",
}: DateCellProps) {
  if (!date) {
    return <span className="text-muted-foreground">{fallback}</span>;
  }
  const formatted = dateOnly ? formatDate(date) : formatDateTime(date);
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
      className="text-primary underline underline-offset-2 break-all"
      title={href}
    >
      {displayText}
    </a>
  );
}
