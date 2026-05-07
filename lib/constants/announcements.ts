export const ANNOUNCEMENT_FOLDER = "fdm/announcements";

export const ANNOUNCEMENT_MEDIA_TYPES = ["image", "gif", "video"] as const;
export type AnnouncementMediaType = (typeof ANNOUNCEMENT_MEDIA_TYPES)[number];

export const ANNOUNCEMENT_IMAGE_FORMATS = ["jpg", "jpeg", "png", "webp"];
export const ANNOUNCEMENT_GIF_FORMATS = ["gif"];
export const ANNOUNCEMENT_VIDEO_FORMATS = ["mp4", "webm", "mov"];

export const ANNOUNCEMENT_ALL_FORMATS = [
  ...ANNOUNCEMENT_IMAGE_FORMATS,
  ...ANNOUNCEMENT_GIF_FORMATS,
  ...ANNOUNCEMENT_VIDEO_FORMATS,
];

export const ANNOUNCEMENT_ALL_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

export function detectMediaTypeFromMime(
  mime: string,
): AnnouncementMediaType | null {
  if (mime === "image/gif") return "gif";
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("image/")) return "image";
  return null;
}

export const ANNOUNCEMENT_DESKTOP_ASPECT = "aspect-[16/7]";
export const ANNOUNCEMENT_MOBILE_ASPECT = "aspect-[4/5]";
