import { Badge } from "@/components/ui/badge";
import { formatDateTime, formatDate } from "@/lib/format";

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
  user: { first_name: string; last_name: string } | null;
  fallback?: string;
}

export function UserCell({ user, fallback = "System" }: UserCellProps) {
  if (!user) {
    return <span className="text-muted-foreground">{fallback}</span>;
  }
  return (
    <>
      {user.first_name} {user.last_name}
    </>
  );
}

// ------------------------------- Text Cell -----------------------------------------
interface TextCellProps {
  value: string | null | undefined;
  fallback?: string;
}

export function TextCell({ value, fallback = "—" }: TextCellProps) {
  if (!value || value.trim() === "") {
    return <span className="text-muted-foreground">{fallback}</span>;
  }
  return <span>{value}</span>;
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
