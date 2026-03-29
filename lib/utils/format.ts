// ------------------------------- Date & Time (Asia/Manila) ---------------------------------
const PH_TIMEZONE = "Asia/Manila";

/** Internal: returns elapsed seconds between date and now */
function elapsedSeconds(d: Date): number {
  return Math.floor((Date.now() - d.getTime()) / 1000);
}

function parseSafeDate(date: Date | string | null | undefined): Date | null {
  if (!date) return null;
  const d = typeof date === "string" ? new Date(date) : date;
  return isNaN(d.getTime()) ? null : d;
}

function formatCore(
  date: Date | string | null | undefined,
  options: Intl.DateTimeFormatOptions,
): string {
  const d = parseSafeDate(date);
  if (!d) return "—";

  try {
    return d.toLocaleString("en-PH", {
      timeZone: PH_TIMEZONE,
      ...options,
    });
  } catch {
    return String(date);
  }
}

/** Full date and time: "Jan 23, 2026, 04:33 PM" */
export function formatDateTime(
  date: Date | string | null | undefined,
  monthFormat: "short" | "long" = "short",
) {
  return formatCore(date, {
    month: monthFormat,
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

/** Date only: "Jan 23, 2026" */
export function formatDate(
  date: Date | string | null | undefined,
  monthFormat: "short" | "long" = "short",
) {
  return formatCore(date, {
    month: monthFormat,
    day: "numeric",
    year: "numeric",
  });
}

/** Time only: "04:33 PM" */
export function formatTime(date: Date | string | null | undefined) {
  return formatCore(date, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

/** For HTML date input: "2026-03-23" */
export function formatToISODate(
  date: Date | string | null | undefined,
): string {
  const d = parseSafeDate(date);
  if (!d) return "";
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: PH_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/** For HTML time input: "17:38" */
export function formatToISOTime(
  date: Date | string | null | undefined,
): string {
  const d = parseSafeDate(date);
  if (!d) return "";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: PH_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}

// ------------------------------- Relative Time & Date ---------------------------------

/**
 * Relative time only — how long ago.
 * "Just now" · "2m ago" · "5h ago" · "3d ago"
 * Falls back to formatDate() beyond 7 days.
 */
export function formatTimeAgo(date: Date | string | null | undefined): string {
  const d = parseSafeDate(date);
  if (!d) return "—";

  const s = elapsedSeconds(d);
  if (s < 60) return "Just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;

  return formatDate(d);
}

/**
 * Relative date label only — which calendar day (PH timezone).
 * "Today" · "Yesterday" · "Jan 23, 2026" (short) or "January 23, 2026" (long)
 */
export function formatRelativeDate(
  date: Date | string | null | undefined,
  monthFormat: "short" | "long" = "short",
): string {
  const d = parseSafeDate(date);
  if (!d) return "—";

  // Reuse formatToISODate — already handles PH timezone, returns "YYYY-MM-DD"
  const target = formatToISODate(d);
  const today = formatToISODate(new Date());
  const yesterday = formatToISODate(new Date(Date.now() - 86_400_000));

  if (target === today) return "Today";
  if (target === yesterday) return "Yesterday";

  return formatDate(d, monthFormat);
}

/**
 * Smart timestamp for activity feeds (PH timezone throughout).
 *
 * < 1 min               → "Just now"
 * 1–59 min              → "2m ago"
 * 1–23 h (same day)     → "Today, 04:33 PM"
 * yesterday             → "Yesterday, 04:33 PM"
 * older                 → "Jan 23, 2026, 04:33 PM"
 */
export function formatActivityTime(
  date: Date | string | null | undefined,
): string {
  const d = parseSafeDate(date);
  if (!d) return "—";

  const s = elapsedSeconds(d);
  if (s < 60) return "Just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;

  const label = formatRelativeDate(d);

  if (label === "Today" || label === "Yesterday") {
    return `${label}, ${formatTime(d)}`;
  }

  return formatDateTime(d);
}

export const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// Capitalize first letter of each word (for names/titles)
export function capitalizeWords(str: string) {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
}

export type SchemaName = {
  first_name?: string | null;
  last_name?: string | null;
};

export type NameDisplay = "full" | "first" | "last";

function cleanNamePart(value: string | null | undefined) {
  return capitalizeWords((value ?? "").trim().replace(/\s+/g, " "));
}

function resolveNameParts(source: SchemaName) {
  return {
    first_name: cleanNamePart(source.first_name),
    last_name: cleanNamePart(source.last_name),
  };
}

export function splitName(
  fullName: string | null | undefined,
  fallbackFirst = "Unknown",
  fallbackLast = "—",
) {
  const normalized = cleanNamePart(fullName);
  if (!normalized) {
    return {
      first_name: fallbackFirst,
      last_name: fallbackLast,
    };
  }

  const [firstName, ...rest] = normalized.split(" ");
  return {
    first_name: firstName,
    last_name: rest.join(" ") || fallbackLast,
  };
}

export function formatName(
  source: SchemaName,
  display: NameDisplay = "full",
  fallback = "—",
) {
  const parts = resolveNameParts(source);
  const fullName = [parts.first_name, parts.last_name]
    .filter(Boolean)
    .join(" ");

  if (display === "first") {
    return parts.first_name || fallback;
  }

  if (display === "last") {
    return parts.last_name || fallback;
  }

  return fullName || fallback;
}

export function getNameInitials(source: SchemaName, fallback = "—") {
  const { first_name, last_name } = resolveNameParts(source);

  const initials = `${first_name[0] ?? ""}${last_name[0] ?? ""}`.trim();
  if (initials) {
    return initials.toUpperCase();
  }

  const singleName = first_name || last_name;
  if (singleName) {
    return singleName.slice(0, 2).toUpperCase();
  }

  return fallback;
}

// Normalize email for consistent lookup/storage checks
export function normalizeEmail(email: string | null | undefined) {
  return email?.trim().toLowerCase() ?? "";
}

// Basic email format validation
export function isValidEmailFormat(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Normalize phone number for consistent storage (remove all non-digits)
export function normalizePhoneNumber(phone: string | null | undefined) {
  return phone?.replace(/\D/g, "") ?? "";
}

// Check for exactly 11 digits (Philippine mobile standard)
export function isValidPhoneNumber(phone: string) {
  const cleaned = normalizePhoneNumber(phone);
  return cleaned.length === 11 && /^09\d{9}$/.test(cleaned);
}
