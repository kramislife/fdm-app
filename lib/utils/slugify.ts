/**
 * Converts a display name to a snake_case key.
 * "Sacred Heart Ministry" → "sacred_heart_ministry"
 */
export function toKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "_");
}
