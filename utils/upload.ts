import http from "@/utils/http";
import { API_RESOURCES } from "@/utils/api-endpoints";

export interface UploadResponse {
  status: string;
  message: string;
  data: {
    url: string;
    publicId?: string;
  };
}

export interface MultipleUploadResponse {
  status: string;
  message: string;
  data: {
    urls: string[];
    publicIds?: string[];
  };
}

/**
 * Upload a single image file to the server
 * @param file - The file to upload
 * @param folder - Optional folder name for organization (e.g., "products", "variants")
 * @returns Promise with the uploaded image URL
 */
export async function uploadImage(file: File, folder?: string): Promise<string> {
  const formData = new FormData();
  formData.append("image", file);
  if (folder) {
    formData.append("folder", folder);
  }

  const { data } = await http.post<UploadResponse>(API_RESOURCES.UPLOAD, formData);
  return data.data.url;
}

/**
 * Upload multiple image files to the server
 * @param files - Array of files to upload
 * @param folder - Optional folder name for organization
 * @returns Promise with array of uploaded image URLs
 */
export async function uploadMultipleImages(files: File[], folder?: string): Promise<string[]> {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("images", file);
  });
  if (folder) {
    formData.append("folder", folder);
  }

  const { data } = await http.post<MultipleUploadResponse>(API_RESOURCES.UPLOAD_MULTIPLE, formData);
  return data.data.urls;
}

/**
 * Convert a base64 data URL to a File object
 * @param dataUrl - The base64 data URL
 * @param filename - The filename to use
 * @returns File object
 */
export function dataURLtoFile(dataUrl: string, filename: string): File {
  const arr = dataUrl.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1] || "image/jpeg";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

/**
 * Check if a string is a base64 data URL
 * @param str - String to check
 * @returns boolean
 */
export function isBase64Image(str: string): boolean {
  return str.startsWith("data:image/");
}

/**
 * Upload image from base64 data URL
 * @param dataUrl - The base64 data URL
 * @param filename - The filename to use
 * @param folder - Optional folder name
 * @returns Promise with the uploaded image URL
 */
export async function uploadBase64Image(
  dataUrl: string,
  filename: string,
  folder?: string
): Promise<string> {
  const file = dataURLtoFile(dataUrl, filename);
  return uploadImage(file, folder);
}

