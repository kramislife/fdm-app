import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

export type UploadFolder =
  | "fdm/avatars"
  | "fdm/qrcodes"
  | "fdm/posters"
  | "fdm/enthronements";

export async function uploadImage(
  file: string,
  folder: UploadFolder,
): Promise<string> {
  const result = await cloudinary.uploader.upload(file, {
    folder,
    allowed_formats: ["jpg", "png", "webp"],
  });
  return result.secure_url;
}

export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}
