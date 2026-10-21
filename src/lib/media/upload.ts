import imageCompression from "browser-image-compression";
import { createId } from "@/lib/invite/defaults";
import type { Photo } from "@/lib/invite/schema";

export const MAX_PHOTO_INPUT_BYTES = 5 * 1024 * 1024; // 5 MB before compression
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
export const PHOTO_ACCEPT = ACCEPTED.join(",");

export class UploadError extends Error {}

function readAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

function imageSize(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve({ width: 0, height: 0 });
    img.src = src;
  });
}

/**
 * Compresses a photo in the browser to WebP.
 *
 * Phase 1: returns a data: URL kept in the local draft (smaller size so it
 * fits in localStorage). Phase 2 swaps the body of this function for an
 * upload to Supabase Storage — callers don't change.
 */
export async function uploadPhoto(file: File): Promise<Photo> {
  if (!ACCEPTED.includes(file.type)) throw new UploadError("Please choose a JPG, PNG, WebP or HEIC photo.");
  if (file.size > MAX_PHOTO_INPUT_BYTES) throw new UploadError("That photo is larger than 5 MB. Please pick a smaller one.");

  const compressed = await imageCompression(file, {
    maxWidthOrHeight: 1200, // Phase 2 (cloud storage): 1600
    maxSizeMB: 0.25,
    fileType: "image/webp",
    initialQuality: 0.8,
    useWebWorker: true,
  });
  const src = await readAsDataUrl(compressed);
  const { width, height } = await imageSize(src);
  return { id: createId(), src, alt: "", width: width || undefined, height: height || undefined };
}
