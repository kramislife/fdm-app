import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

// Universal Cloudinary Upload
export interface CloudinaryUploadOptions {
  folder: string;
  publicId?: string;
  overwrite?: boolean;
  invalidate?: boolean;
  allowedFormats?: string[];
}

// Handles URL, Base64, or File path uploads.
export async function uploadToCloudinary(
  file: string,
  options: CloudinaryUploadOptions,
): Promise<string | null> {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: options.folder,
      public_id: options.publicId,
      overwrite: options.overwrite ?? true,
      invalidate: options.invalidate ?? true,
      allowed_formats: options.allowedFormats ?? ["jpg", "png", "webp", "jpeg"],
    });
    return result.secure_url;
  } catch (err) {
    console.error(
      `[uploadToCloudinary] Upload to folder "${options.folder}" failed:`,
      err,
    );
    return null;
  }
}

// Delete an image from Cloudinary by its public_id.
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error(`[deleteFromCloudinary] Failed to delete ${publicId}:`, err);
  }
}
