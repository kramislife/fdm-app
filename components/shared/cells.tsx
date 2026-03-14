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

// ------------------------------- Creator Cell -----------------------------------------
interface CreatorCellProps {
  creator: { first_name: string; last_name: string } | null;
}

export function CreatorCell({ creator }: CreatorCellProps) {
  if (!creator) {
    return <span className="text-muted-foreground">System</span>;
  }
  return <>{creator.first_name} {creator.last_name}</>;
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
  date: Date | string;
  dateOnly?: boolean;
}

export function DateCell({ date, dateOnly = false }: DateCellProps) {
  const formatted = dateOnly ? formatDate(date) : formatDateTime(date);
  return <span title={formatted}>{formatted}</span>;
}
