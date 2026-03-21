// Format date and time
export function formatDateTime(
  date: Date | string,
  format: "short" | "long" = "short",
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("en-PH", {
    month: format,
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Format date only
export function formatDate(
  date: Date | string,
  format: "short" | "long" = "short",
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-PH", {
    month: format,
    day: "numeric",
    year: "numeric",
  });
}

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
