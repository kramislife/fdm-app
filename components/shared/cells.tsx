import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/utils";
import {
  formatDateTime,
  formatDate,
  formatTime,
  capitalizeWords,
  formatName,
} from "@/lib/utils/format";
import {
  ACCOUNT_STATUS,
  ACCOUNT_STATUS_LABELS,
  isAccountStatus,
} from "@/lib/constants/status";

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
  let variant: "secondary" | "warning" | "error" | "info" | "success" =
    "secondary";

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
    return fallback;
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
    return fallback;
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
  timeOnly?: boolean;
  format?: "short" | "long";
  fallback?: string;
}

export function DateCell({
  date,
  dateOnly = false,
  timeOnly = false,
  format = "short",
  fallback = "—",
}: DateCellProps) {
  if (!date) {
    return fallback;
  }

  let formatted = "";
  if (timeOnly) {
    formatted = formatTime(date);
  } else if (dateOnly) {
    formatted = formatDate(date, format);
  } else {
    formatted = formatDateTime(date, format);
  }

  return <span title={formatted}>{formatted}</span>;
}

// ------------------------------- Link Cell -----------------------------------------
interface LinkCellProps {
  href: string | null | undefined;
  label?: string | null;
  fallback?: string;
}

export function LinkCell({ href, label, fallback = "—" }: LinkCellProps) {
  if (!href) {
    return fallback;
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
// ------------------------------- QR Action Cell -----------------------------------------
interface QRActionCellProps {
  qrValue: string | null | undefined;
  onView: () => void;
  onGenerate: () => void;
  isGenerating?: boolean;
  enabled?: boolean;
  disabledLabel?: string;
}

export function QRActionCell({
  qrValue,
  onView,
  onGenerate,
  isGenerating = false,
  enabled = true,
  disabledLabel = "Disabled",
}: QRActionCellProps) {
  if (!enabled) {
    return (
      <Button
        variant="secondary"
        size="sm"
        className="h-auto p-0 bg-transparent hover:bg-transparent cursor-default"
      >
        {disabledLabel}
      </Button>
    );
  }

  if (qrValue) {
    return (
      <Button
        variant="link"
        size="sm"
        className="h-auto p-0 text-blue-600 hover:text-blue-700"
        onClick={(e) => {
          e.stopPropagation();
          onView();
        }}
      >
        View QR
      </Button>
    );
  }

  return (
    <Button
      variant="link"
      size="sm"
      className="h-auto p-0 text-primary hover:text-primary/80"
      disabled={isGenerating}
      onClick={(e) => {
        e.stopPropagation();
        onGenerate();
      }}
    >
      {isGenerating ? "Generating..." : "Generate"}
    </Button>
  );
}

// ------------------------------- Image Cell -----------------------------------------
interface ImageCellProps {
  src: string | null | undefined;
  alt: string;
  aspectRatio?: string;
  width?: string;
  className?: string;
  sizes?: string;
  fallback?: string;
}

export function ImageCell({
  src,
  alt,
  aspectRatio = "aspect-4/3",
  width = "w-full",
  className,
  sizes = "(max-width: 768px) 100vw, 400px",
  fallback = "—",
}: ImageCellProps) {
  if (!src) return <>{fallback}</>;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md border",
        aspectRatio,
        width,
        className,
      )}
    >
      <Image src={src} alt={alt} fill sizes={sizes} className="object-cover" />
    </div>
  );
}
