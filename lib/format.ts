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

// Normalize email for consistent lookup/storage checks
export function normalizeEmail(email: string | null | undefined) {
  return email?.trim().toLowerCase() ?? "";
}

// Basic email format validation
export function isValidEmailFormat(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
